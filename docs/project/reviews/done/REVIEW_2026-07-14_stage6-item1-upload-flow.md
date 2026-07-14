# Review: Stage 6 Item 1 — upload-flow architecture

Status: `consensus`
Reviewer: codex
Requested by: `IMPL: Stage 6 Item 1 upload-flow architecture` (2026-07-14)

## Handoff

**What was implemented.** Stage 6 Item 1 (upload-flow architecture), executed from
`docs/project/tasks/STAGE_6_TASK_01_upload_flow_architecture.md` by a Claude Code IMPL session
(Plan mode → owner-approved plan → implementation). This is a full redesign of a **public,
unauthenticated write surface**: it replaces the shipped batch-upload-at-submit, two-category
(`reference`/`placement`) pipeline with selection-time upload, an encrypted per-file ownership
token, and three categories (`artist_work`/`inspiration`/`placement_photo`). The in-session Review
Pipeline (Test Agent → `pnpm qg` → read-only Review Agent) reported a clean pass; this thread is
the independent, repo-aware second look required for a block of this risk class.

**State of the tree.** The change is **uncommitted** in the working tree at the time of this
handoff. Inspect with `git status --short` and `git diff HEAD` (52 files touched/added/deleted).
Key files:

| File | Change |
| --- | --- |
| `app/api/upload/route.ts` | **new** — selection-time single-file upload endpoint |
| `src/services/uploadToken.ts` | **new** — AES-256-GCM handle mint/read (`node:crypto`) |
| `src/bff/adoptUploads.ts` | **new** — verifies + adopts a session's handles at submit |
| `src/bff/rateLimit.ts` | **new** — in-memory per-IP fixed-window limiter |
| `src/bff/validateFiles.ts` | rewritten: `validateFiles` → `validateSingleFile`, adds a magic-byte sniff checked against the file's own declared MIME type |
| `app/api/request/route.ts` | adopt-by-handle replaces batch upload; **both `cleanupRequestFiles()` calls removed** (see Focus Question 2) |
| `src/services/storage.ts` | `FileType` → 3-value union; `uploadRequestFiles` (batch) → `uploadRequestFile` (single); storage path scheme changes from `{type}-{NN}.{ext}` to `{uuid}.{ext}`; adds `countObjectsForSubmission` |
| `src/features/request/store/` | **new** — module-singleton client store (`requestDraft.ts`, `useRequestDraft.ts` via `useSyncExternalStore`), replacing `RequestForm.tsx`'s `useState(() => crypto.randomUUID())` |
| `src/features/request/lib/upload.ts` | **new** — `xhrUpload()` (XHR not fetch, for progress + abort) |
| `src/features/request/ui/UploadCategoryInput.tsx` | **new** — per-file upload/retry/remove UI, replaces `FileUploadInput.tsx` (deleted) |
| `src/features/request/ui/RequestForm.tsx` | rewired to the store; submit waits for in-flight uploads to settle before serializing handles |
| `src/features/admin/ui/RequestImageViewer.tsx`, `RequestDetail.tsx` | two fixed file-group props → a `groups: {title, files}[]` prop (3 groups) |
| `supabase/migrations/20260714025850_three_upload_categories.sql` | **new** — swaps the `request_files.type` CHECK constraint, backfills existing rows |
| `eslint.config.mjs` | `import/no-internal-modules` allowlist gains `**/features/*/config` (`**` variant) — pre-existing gap, not a new architecture decision (see Focus Question 5) |
| `vitest.config.ts`, `src/shared/test/serverOnlyStub.ts` | **new** — aliases `server-only` to a no-op stub under vitest (jsdom has no RSC boundary) |
| `.env.example` | documents new required `UPLOAD_TOKEN_SECRET` |
| ~20 test files | rewritten/added for the above (266 tests total, all passing) |

**Authority for this block** (review against these, not against the task file's summary of them):

- `docs/project/tasks/STAGE_6_TASK_01_upload_flow_architecture.md` — the task file itself: Scope
  points 1–6, Out of Scope, Workflow, Acceptance Criteria.
- `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` — §4.2 (fields 5–7), §4.3 (upload
  constraints — selection-time upload, per-file progress, 10 MB, formats), §4.5 (per-file failure
  isolation, abuse mitigation, no CAPTCHA).
- `docs/project/PROJECT_DECISIONS.md` — **"Stage 6 Upload-Flow Architecture"** (the new entry this
  session wrote, recording all six scope points, rejected alternatives, and what it supersedes:
  "File Data Model Decisions", "Storage Decisions → Folder Structure/Storage Filenames", "Failure
  Handling Decisions", narrows "Upload UX Decisions"). Also "Stage 6 UX Blueprint Decisions" →
  "Upload-flow architecture prerequisite" (the original Codex-found blocker this task resolves)
  and D-Blueprint 5(a) (the in-session persistence requirement this store satisfies) — both in the
  same file.
- `docs/project/PROJECT_ARCHITECTURE.md` — Service Layer rules (DB/Storage access only through
  `src/services/`; storage paths never leave that layer; no provider abstractions).
- `docs/project/PROJECT_BACKLOG.md` — "MIME Type Verification" (closed by this work) and "Orphaned
  Storage Objects" (extended by this work, still not implemented — deliberately out of scope).

**Scope boundary.** Explicitly NOT in this block (per the task file's Out of Scope): `RequestForm`'s
field set/layout/single-scroll rebuild (Item 3); the Success page and its persistence-store gate
beyond what this task's handle/id lifecycle needs to share (Item 4); reference-code generation
(Item 9); the submit endpoint's honeypot/general abuse mitigation beyond what overlaps with the
upload endpoint specifically (Item 10 — this task only reserves the field name, does not implement
it); any visual/styling change. A finding that something in one of those areas is "missing" should
check whether it is actually this task's job before being raised here.

## Focus questions

1. **The core security property — verify by trying to defeat it, not by reading the code's own
   comments.** The task's acceptance criterion: *"POST /api/request's final submit only persists
   files that were actually uploaded as part of this clientSubmissionId's session — an attacker
   cannot attach another session's uploaded file by guessing/reusing an id or handle."* Read
   `src/services/uploadToken.ts` and `src/bff/adoptUploads.ts` in full. Confirm: (a) the handle is
   genuinely AES-256-GCM with a real auth-tag check on read, not just base64 encoding of a
   guessable/predictable structure; (b) the ownership check (`payload.csid === clientSubmissionId`
   being submitted) is actually enforced and cannot be bypassed; (c) no storage path, handle, or
   any part of either ever appears in a response body or a log line anywhere in the new code.
   Attempt concrete attacks: forge a handle without the secret; replay a handle minted under
   session A while submitting as session B; tamper one byte of a valid handle; submit the same
   valid handle twice in one request (dedupe correctness); submit 4 handles in one category or 10
   total (cap enforcement).

2. **The regression guard — this is the single most important thing to verify precisely.** The old
   `app/api/request/route.ts` called `cleanupRequestFiles()` (deletes Storage objects) on a
   Postgres unique-violation race and on a generic DB-insert failure. Under the OLD batch-at-submit
   model this was safe. Under the NEW selection-time-upload model, files exist in Storage *before*
   submit — so on a race, the losing request's cleanup call would delete the **winning** request's
   live files, because both point at identical storage paths (same `clientSubmissionId` → same
   deterministic-per-session prefix, and the winner's `create_request` already wrote
   `request_files` rows referencing exactly those paths). Confirm: (a) both `cleanupRequestFiles`
   calls are genuinely gone from `app/api/request/route.ts` (not just moved or conditionally
   skipped); (b) `app/api/request/__tests__/route.test.ts` has real, non-tautological assertions
   proving `cleanupRequestFiles` is never called on the race path (recovered and unrecovered) or
   the generic-failure path; (c) think through whether there is any remaining path — a case this
   session didn't consider — where deleting Storage objects on submit failure would still be
   correct, and whether removing it entirely (rather than conditionally) was too blunt.

3. **Compliance with the task file's own Scope, not just good practice in general.** Walk
   `docs/project/tasks/STAGE_6_TASK_01_upload_flow_architecture.md`'s Scope points 1–6 one at a
   time against the actual diff:
   - Scope 1 (endpoint + auth/abuse model) — is the abuse model (rate limit + per-session object
     cap + magic-byte sniff) what was actually planned and approved, or does it silently narrow/
     widen the task's ask?
   - Scope 2 (opaque handle + `clientSubmissionId` lifecycle) — does the store's lifecycle
     (lazy-once generation, reset only on success) match what D-Blueprint 5(a) requires, and does
     "opaque handle, not raw storage path" hold in every code path, not just the happy one?
   - Scope 3 (three-category representation) — DB constraint, `FileType`, admin viewer: are all
     "reference"/"placement" category-value literals actually gone (not just the ones this session
     happened to touch)? Grep the whole repo, not just the files the Handoff table lists.
   - Scope 4 (per-file progress/retry/remove) — does a failed upload genuinely never block
     submission, and does per-file failure genuinely stay isolated (one failing file must not
     affect sibling slots' state)?
   - Scope 5 (final-submit adoption) — covered in depth by Focus Question 1/2.
   - Scope 6 (cleanup/idempotency definition for unadopted uploads) — the task says "defines what
     state makes an upload orphaned... does not have to implement a cleanup job." Confirm no
     cleanup job was accidentally implemented (scope creep) and that the orphan definition
     recorded in PROJECT_DECISIONS.md is accurate to what the code actually does.

4. **Architecture conformance beyond lint.** `eslint --no-fix` reportedly passes with zero
   `import/no-internal-modules` errors, but verify by reading imports directly in the new/changed
   files: does every DB/Storage access route through `src/services/`? Does the service-role
   Supabase client (`src/services/supabase.ts`) ever get imported anywhere outside `src/services/`
   (it must not reach client components)? Does `src/features/request/store/` get consumed only via
   its `index.ts` barrel everywhere, including in the new test files?

5. **The `eslint.config.mjs` change** — adds `"**/features/*/config"` and
   `"**/features/*/config/**"` to the `import/no-internal-modules` allowlist, framed in this
   session's commit reasoning as "closing a pre-existing gap" (the allowlist already permitted
   `ui`/`lib`/`validation`/`types` sub-barrels of a feature but not `config`, despite `config`
   having the same `index.ts`-barrel shape). The owner approved this specific framing via
   AskUserQuestion before the change was made. Assess independently: is this actually a
   like-for-like gap-closing consistent with the existing allowlist's own pattern, or does it
   quietly permit something broader than intended? Is there a narrower fix that would have avoided
   touching shared lint config for a single task's needs?

6. **Test suite honesty at this scale (266 tests, ~20 files touched).** Spot-check beyond what any
   in-session self-review would catch: are there tests whose mock is configured to return exactly
   what the assertion then checks (tautological)? Are there tests that were "fixed" by loosening
   the assertion rather than fixing the code? In particular check
   `src/bff/__tests__/adoptUploads.test.ts` (the security suite) and
   `app/api/request/__tests__/route.test.ts` (the regression suite) — these are the two files
   where a subtly-wrong test would hide a real security or data-loss bug.

7. **Anything the acceptance criteria missed.** The task file's own Acceptance Criteria section is
   the checklist — go through it item by item. Beyond it: does any code path silently swallow an
   error it shouldn't; is there an unhandled promise rejection in the new client-side upload code;
   are object URLs (`URL.createObjectURL`) reliably revoked on every removal path including
   abort-during-upload; does the new `UPLOAD_TOKEN_SECRET` requirement have any path where a
   missing env var fails silently instead of loudly at startup/first-use.

## Additional ask: process/decision review, not just code review

This was a large, security-sensitive, single-session IMPL block with many judgment calls made
without a STRAT round-trip (Plan-mode plan was owner-approved once, up front; several concrete
design forks were then resolved via `AskUserQuestion` mid-session, not via a separate STRAT
session). Beyond the code-correctness review above, please also give an **independent opinion on
the decisions themselves** — not just whether the code matches the decisions, but whether the
decisions were the right ones. Specifically:

- **The ownership model (encrypted handle vs. alternatives).** The Plan agent that designed this
  considered and rejected: (a) trusting the raw client-generated `clientSubmissionId` alone, (b)
  direct-to-Supabase signed upload URLs, (c) a `pending_uploads` DB table adopted by
  `WHERE client_submission_id = $1`, (d) Storage-prefix listing at submit time. It chose an
  encrypted (not merely signed) per-file token. Do you agree this is the right call for a
  single-artist site at ~5–20 requests/week, or would the `pending_uploads` table (simpler to
  reason about, more conventional) have been the better trade-off despite its stated weaknesses
  (still needs a per-file secret to close the ownership gap; new migration/grants; orphan-row
  problem)? Full reasoning trail: `docs/project/PROJECT_DECISIONS.md` — "Stage 6 Upload-Flow
  Architecture" §1 and §5.
- **Remove-does-not-delete.** The design deliberately does NOT delete a Storage object when a
  visitor removes an already-uploaded file client-side — reasoning: a delete-by-handle endpoint
  would be a second public unauthenticated write surface whose only job is destruction, creating a
  narrow griefing vector (replay a captured handle to destroy a victim's in-flight file before
  submit), for a benefit (avoiding one more orphan) that's already accepted debt elsewhere. Do you
  agree, or does the orphan-accumulation cost outweigh that reasoning at this project's scale?
- **In-memory-only rate limiting, explicitly accepted as "a speed bump, not a wall" given Vercel's
  multi-instance serverless runtime** (durable Upstash/KV limiting was considered and rejected as
  a new paid dependency not justified without observed abuse). Independent judgment: reasonable
  given the stated volume and threat model, or under-protective for a "no CAPTCHA" public upload
  endpoint that stores real files?
- **Waiting for in-flight uploads before allowing submit** (FS §4.5 is silent on this specific
  case; the session inferred the better UX from context and confirmed it with the owner via
  AskUserQuestion rather than treating it as open-and-shut). Does this reading hold up against the
  FS text, or was the literal "submit immediately, drop what's still uploading" reading actually
  safer/simpler and preferable?
- **Anything else in PROJECT_DECISIONS.md's new entry that reads as a rationalization rather than
  a sound engineering trade-off** — flag it plainly even if it's not a code defect.

## Non-questions (already decided — do not re-litigate)

- **Whether uploads should be selection-time at all, three categories, or in-session persistence
  is required.** These are FS §4.3, FS §4.2, and D-Blueprint 5(a) respectively — already-normative
  product/blueprint decisions this task implements, not choices this task made.
- **The `create_request` RPC's signature is unchanged.** Deliberate — PROJECT_DECISIONS.md's Stage
  5A "Staging Environment" rule requires a staging environment before any RPC signature/behavior
  change; this design was chosen specifically to avoid triggering that gate. Not an oversight if
  you notice the RPC could "more cleanly" take a different shape.
  Item 3's job — request form field-set/layout — not this task's.
- **No cleanup job for orphaned Storage objects.** Explicitly out of scope per the task file and
  PROJECT_BACKLOG.md's pre-existing "Orphaned Storage Objects" entry (classified
  post-launch/operational since Stage 5D).

## Review 1

### Findings

1. **Blocker — the 10 MB upload contract cannot work through the deployed Vercel Function.**
   FS §4.3 requires accepting files up to 10 MB pre-processing
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:123`), and the route is explicitly designed to buffer that
   payload (`app/api/upload/route.ts:33,67-71`). Vercel's current Node Function limit is 4.5 MB for
   the entire request or response body; an oversized request is rejected by the platform with 413
   before this Route Handler runs ([Vercel Functions limits — Request body
   size](https://vercel.com/docs/functions/limitations#request-body-size)). Multipart overhead
   lowers the usable file ceiling further. Therefore a legitimate roughly 4.5–10 MB JPEG/HEIC
   cannot reach `validateSingleFile`, and the route unit test cannot expose this because it calls
   `POST()` directly with a mocked `formData()`. The rejected direct-upload alternative (or a
   client-side preprocessing path that demonstrably handles every allowed format, or a different
   hosting path) must be revisited; otherwise the FS needs owner-level change control. Item 1 cannot
   honestly unblock the Request work while the deployed architecture rejects part of its normative
   input range.

2. **Blocker — an expired handle creates a silent, unrecoverable submit loop and also regresses
   idempotent replay.** Handles expire after two hours (`src/services/uploadToken.ts:33`), and
   adoption returns a validation error on the synthetic `uploadHandles` field
   (`src/bff/adoptUploads.ts:21,69`). `RequestForm` casts every server field name to an RHF field,
   calls `setError`, and returns to `idle` (`src/features/request/ui/RequestForm.tsx:98-105`), but
   no rendered control reads the `uploadHandles` error. A visitor who keeps the live-session draft
   open for more than two hours sees submit apparently do nothing, with no instruction to re-add
   the image and no automatic per-file retry/re-upload. The same ordering breaks the existing
   idempotency guarantee: `/api/request` adopts/TTL-checks handles before looking up an already
   persisted `clientSubmissionId` (`app/api/request/route.ts:53-62`), so a response-lost successful
   request retried after the TTL returns 400 instead of its existing reference code. An idempotent
   hit performs no new file persistence, so it does not need adoption to protect the ownership
   property. The flow needs an explicit recoverable client state for expired/invalid handles and
   the idempotency ordering needs correction, with route/UI regression tests for both cases.

3. **Should-fix — the documented abuse ceiling is not a ceiling against an automated caller.**
   `clientSubmissionId` is caller-generated, so a bot can use a fresh UUID for every upload and
   never approach the 12-object session cap (`app/api/upload/route.ts:95-96`). Even for one UUID,
   concurrent requests can all observe the same pre-upload count and pass the check before any
   write completes. The only cross-session control is the explicitly per-instance in-memory IP
   map; the decision nevertheless calls the session cap the “real ceiling against bucket-filling”
   and claims orphan volume is bounded to a few hundred MB/year
   (`PROJECT_DECISIONS.md:1803-1808,1920-1922`; `src/bff/rateLimit.ts:5-10`). Those claims are false
   for the hostile case this public endpoint is meant to mitigate. At minimum the architecture
   needs one non-caller-resettable control (durable/platform rate limiting, a server-issued upload
   session capability with a durable quota, or another owner-approved mechanism), or a plainly
   recorded owner acceptance that automated storage growth is currently unbounded. The current
   rationale cannot treat the per-session count as the compensating control for the acknowledged
   weakness of the in-memory limiter.

4. **Should-fix — thumbnails required by FS §4.3 are not rendered, despite the decision record
   saying they are.** `UploadCategoryInput` creates and stores an object URL
   (`src/features/request/ui/UploadCategoryInput.tsx:76-77`) but its list renders only the filename,
   status text, and controls (`:101-130`); there is no image element using `previewUrl`. This
   contradicts FS §4.3 (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:123`) and the new architecture entry's
   “Thumbnails are rendered client-side” statement (`PROJECT_DECISIONS.md:1797-1798`). The upload
   component tests likewise never assert that a thumbnail is visible. Render the preview and add a
   test that proves the object URL is actually consumed, while keeping the existing revoke tests.

5. **Nit — the proposed tree fails `git diff --check`.** Every line in the newly appended
   `PROJECT_DECISIONS.md:1763-1931` block and the new `PROJECT_STAGE_LOG.md:40-61` entry is reported
   as trailing whitespace (consistent with stray CR characters / line-ending conversion). Normalize
   those additions before commit so the documentation diff is clean.

### Verified without findings

- AES-256-GCM uses a random 96-bit IV and verifies the 128-bit authentication tag on read; a
  one-byte tamper fails. The `payload.csid === clientSubmissionId` and studio/session-prefix checks
  are enforced. Duplicate paths are adopted once; the per-category and total submit caps reject the
  requested over-cap cases.
- Both submit-path `cleanupRequestFiles()` calls are genuinely absent. The three route assertions
  are useful regression guards: the services mock intentionally exposes the function, so a future
  re-import/call from the route would make them fail. Removing cleanup on race and generic DB
  failure is correct under selection-time upload; no remaining submit-failure branch should delete
  these objects.
- Repo-wide category-value grep found no live two-category `"reference"` / `"placement"` branch;
  DB migration, Storage type/path, request adoption, and admin grouping use all three new values.
  DB/Storage access remains behind `src/services/`, and the service-role Supabase client is not
  imported outside that layer. No cleanup job was added.
- Missing or malformed `UPLOAD_TOKEN_SECRET` fails loudly through `requireEnv` / the 32-byte key
  check. Preview object URLs are revoked on removal and draft reset, including the abort/remove path.

### Independent decision assessment

- **Encrypted handle vs. `pending_uploads`: agree with the handle model.** A stateless authenticated
  capability is simpler here than adding a table while still needing a per-file bearer secret. AES-
  GCM also preserves the project's explicit no-raw-storage-path client boundary. Findings 1–2 are
  transport/lifecycle defects, not a reason to replace this ownership primitive.
- **Remove-does-not-delete: agree, conditionally.** Avoiding a public destructive endpoint is the
  better trade at this volume, but the orphan cost remains acceptable only after Finding 3 stops
  describing a caller-resettable cap as a hard bound.
- **In-memory-only limiting: under-protective as currently justified.** It can remain a useful first
  speed bump, but it is not an adequate compensating control for arbitrary fresh session IDs and
  serverless multi-instance execution.
- **Waiting for in-flight uploads: agree with the product reading.** Preserving a file the visitor
  just selected is preferable to silently dropping it. The implementation currently disables the
  CTA while a slot uploads rather than accepting the click and showing the documented “Sending…”
  wait state (`RequestForm.tsx:62,300` versus `PROJECT_DECISIONS.md:1878-1881`); this wording/UI
  mismatch is non-blocking for Item 1, but should be made consistent when Item 3 owns the form UX.

### Checks run

- `pnpm lint` — PASS (0 errors; 1 existing `no-img-element` warning in an admin viewer test).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (27 files, 266 tests).
- `git diff --check HEAD` — FAIL (Finding 5).

## Response 1

All five findings **accepted**. Three of them are cases where a durable doc asserted something the
code did not do — exactly the class the in-session pipeline cannot catch, since it checks the diff
against intent, not intent against reality.

**Finding 1 (blocker) — 10 MB is undeliverable through a Vercel Function. ACCEPTED; FS amended.**
The review is right, and this is the most serious miss: the design rejected direct-to-Supabase
uploads (Stage 5A staging rule), thereby routing every byte through a Function, without checking
whether the normative payload fits through one. It does not — Vercel rejects bodies over 4.5 MB at
the edge, before any handler runs, and no unit test could have caught it because the route tests
call `POST()` with a mocked `formData()`, bypassing the platform.

Owner decision (2026-07-14), taken with the trade explicitly on the table:

- **FS §4.3 amended: 10 MB → 4 MB per file** (spec first, then code — PRD §9 change control). The
  amendment records why, and that the constraint is the platform, not a preference.
- **Per file, not per submission** — worth stating because it was the owner's first concern: each
  file rides its own request (one file per `POST /api/upload`), so 9 × 4 MB are 9 independent
  requests and never sum against the 4.5 MB ceiling. The final submit carries only text plus opaque
  handles.
- **Enforced on both sides**: client-side before sending (an oversized body dies at the edge with an
  opaque failure — the visitor would otherwise wait out a doomed upload), and server-side again
  because the client cannot be trusted. The constant moved to `src/features/request/config`, the
  shared isomorphic layer both sides already read; the validator test now asserts against the
  constant plus an explicit "stays under Vercel's 4.5 MB limit" guard, so a future bump cannot
  silently reintroduce the bug.
- **Client-side compression deliberately NOT implemented.** FS §4.3 permits it; it would let any
  file through transparently. Deferred to research (PROJECT_BACKLOG.md) rather than improvised,
  because it needs real answers: compress only over-limit files (the artist needs full quality to
  judge a design — blanket compression is unacceptable), what output parameters suffice, and what to
  do about HEIC, which browsers cannot decode natively. **Accepted residual risk, recorded plainly:**
  a 48 MP phone JPEG or an unconverted HEIC can exceed 4 MB and the visitor must reduce it; the
  error message says so in plain words.

**Finding 2 (blocker) — expired handle = silent dead end + broken idempotent replay. ACCEPTED, both
halves.** Two distinct defects, both real:

1. *Broken idempotency* — adoption ran **before** the `clientSubmissionId` lookup, so a submit that
   succeeded but whose response was lost, retried past the 2 h TTL, got a 400 instead of its
   existing reference code. The review's reasoning is exactly right and worth preserving: an
   already-persisted request has its `request_files` rows written, so it persists nothing new and
   does not need adoption to protect the ownership property. **Fixed:** the idempotency lookup now
   runs first. Regression test added asserting a replay succeeds *while adoption would fail on
   expired handles*, and that `adoptUploadHandles` is not even reached.
2. *Silent dead end* — `uploadHandles` is a synthetic field with no rendered control, so
   `setError()` on it was invisible: the visitor pressed Submit and nothing happened, forever.
   **Fixed:** the error is now intercepted before the generic RHF path; `invalidateUploadedSlots()`
   (new store action) flips the dead slots back to `failed` so each shows its own Retry control (the
   original `File` is retained, so Retry re-uploads and mints a fresh handle), and a visible message
   explains what happened and what to do — and says that nothing else typed was lost. Tests added at
   both levels (store, and the form asserting the message renders and the form stays usable).

**Finding 3 (should-fix) — the abuse ceiling is not a ceiling. ACCEPTED without reservation; this
was the worst of the three doc lies.** The review is correct that `clientSubmissionId` is
caller-chosen, so a bot mints a fresh UUID per upload and never approaches the 12-object cap, and
that concurrent uploads under one id can all pass the pre-upload count check. The decision record had
justified one weak control (the in-memory limiter) with another (the session cap) — and called the
latter "the real ceiling against bucket-filling", plus a fabricated "few hundred MB/year" bound.

Both claims are **withdrawn in place**, not quietly edited away: PROJECT_DECISIONS.md §1 and §6 now
state what is actually true — the controls bound the *size* and *shape* of any single object (4 MB,
real images only, private bucket, no public read path), but **nothing currently bounds the number of
objects an automated caller can create.** The code comments that repeated the false claim are fixed
too. Owner-accepted for now on the stated grounds (site unlaunched, ~5–20 real requests/week,
exposure is storage cost, not data). **Re-filed in PROJECT_BACKLOG.md as a PRE-LAUNCH BLOCKER**, not
a "revisit if abuse appears" item — closing it requires one non-caller-resettable control (durable
rate limiting, a server-issued capability with a durable quota, or platform-level protection).

**Finding 4 (should-fix) — thumbnails not rendered. ACCEPTED.** The object URL was created, stored,
and correctly revoked; nothing ever rendered it, while the decision record claimed "thumbnails are
rendered client-side". **Fixed:** the slot list now renders an `<img>` from `previewUrl` (plain
`<img>`, not `next/image` — the source is a `blob:` URL the optimizer cannot process). Test added
asserting the object URL is actually consumed by a rendered image; the existing revoke tests stand.
Per-file error text also improved while in there: a failed slot now shows the *specific* reason (e.g.
the over-4 MB message) instead of a generic "Upload failed".

**Finding 5 (nit) — `git diff --check` fails. ACCEPTED as reported, but the cause is not this change,
and the fix is deliberately NOT applied.** Investigated: the flagged lines are not stray trailing
spaces introduced here. `PROJECT_DECISIONS.md` and `PROJECT_STAGE_LOG.md` are **stored in the
repository with CRLF line endings**, so *every* added line in them trips `--check` on the `\r`.
Verified this is pre-existing, not a regression: the last commit to touch `PROJECT_DECISIONS.md`
before this work (`4dd7593`, an owner-approved docs commit) trips the identical check 50 times.
Normalizing the file to LF would rewrite ~1,800 untouched lines authored by other sessions — a
diff-noise and blame-destroying change well outside this task's scope, and not one to make silently
inside a review response. **Filed as-is:** the whitespace itself is harmless; the repo-wide
line-ending convention (no `.gitattributes`, `core.autocrlf=false`, mixed LF/CRLF across docs) is a
real but separate hygiene item. (A stray CRLF *this session* had introduced into the LF-convention
files — `PROJECT_BACKLOG.md`, the FS — was found and removed during this investigation, so those
diffs are now clean.)

**Independent decision assessment — noted, and one observation folded forward.** Agreement on the
handle model, remove-does-not-delete (conditional on Finding 3, now honestly recorded), and the
wait-for-in-flight product reading is taken as confirmation, not as licence to stop thinking about
them. The under-protective verdict on in-memory limiting is accepted and is now the position of
record (Finding 3). The review's last observation is also correct and worth flagging forward: the CTA
is currently **disabled** while a slot uploads, whereas the decision record describes accepting the
click and showing a "Sending…" wait state. The current behavior is not wrong (submit is never blocked
by a *failed* upload — FS §4.5 holds), but the wording and the UI disagree. Left for **Item 3**,
which owns the form's UX, rather than churning the CTA here; recorded so it is not lost.

### Gates after fixes

- `pnpm lint` — PASS (0 errors; 1 pre-existing `no-img-element` warning in an admin viewer test).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (27 files, **274** tests — 8 added by these fixes).
- `pnpm build` — PASS.

### Итог для владельца (RU)

Кодекс нашёл пять проблем, все приняты. Два блокера были настоящими:

1. **10 МБ физически не пролезали** через Vercel (лимит платформы — 4.5 МБ на запрос). Я отверг
   загрузку напрямую в Supabase, но не проверил, влезает ли трафик в функцию. FS изменена на 4 МБ
   (лимит **на один файл**, не на всю заявку — 9 фото едут девятью отдельными запросами). Сжатие
   картинок вынесено в ресёрч, а не изобретено на ходу.
2. **Протухший handle = тихий тупик**: посетитель жал «отправить» и не происходило ничего. Плюс я
   сам сломал идемпотентность — повтор успешной заявки через 2 часа возвращал ошибку вместо кода
   заявки. Оба починены, на оба написаны регрессионные тесты.

Три остальные — это места, где **я написал в документ то, чего код не делает**: превью картинок
(создавал, но не показывал), «потолок защиты от ботов» (его нет — бот берёт новый UUID на каждый
файл) и мелочь с пробелами. Превью теперь рисуются; ложные утверждения про защиту **отозваны прямым
текстом**, а не тихо переписаны, и вопрос переведён в бэклог как **блокер перед публичным запуском**.

Гейты зелёные: 274 теста, ноль ошибок линта, билд собирается.

## Consensus

| Finding | Verdict | Filed |
| --- | --- | --- |
| 1 — 10 MB undeliverable through a Vercel Function (blocker) | Accepted | FS §4.3 amended (10 MB → 4 MB, owner decision); enforced client + server; compression → PROJECT_BACKLOG.md (research) |
| 2 — expired handle: silent dead end + broken idempotent replay (blocker) | Accepted | Fixed in this commit (idempotency lookup reordered; `invalidateUploadedSlots` + visible message); regression tests at route, store, and form level |
| 3 — session cap is caller-resettable; abuse-ceiling claims false (should-fix) | Accepted | False claims withdrawn in PROJECT_DECISIONS.md §1/§6 and in code comments; re-filed in PROJECT_BACKLOG.md as a **pre-launch blocker** |
| 4 — thumbnails required by FS §4.3 not rendered (should-fix) | Accepted | Fixed in this commit (`<img>` from `previewUrl`); test added asserting the object URL is consumed |
| 5 — `git diff --check` fails (nit) | Accepted as reported; fix deliberately not applied | Cause is the docs' pre-existing CRLF storage (the same check fails on commit `4dd7593`), not this change. Normalizing would rewrite ~1,800 untouched lines — out of scope. Repo line-ending convention noted as a separate hygiene item; this session's own stray CRLF in LF-convention files was removed. |
| Decision assessment — CTA disabled vs. documented "Sending…" wait state | Acknowledged | Left to **Item 3** (owns the form UX); recorded so it is not lost |
