Purpose
Track current progress and maintain session continuity.

Scope
Current stage status and historical log entries.
This is the FIRST document AI must read at the start of every session.

Audience
AI agents and developers working on the project.

---

## Current Stage

Stage: Stage 6 — Product Experience Polish — current (planning documentation integrated
2026-07-12; implementation not started). Stage 5 — Production Hardening — closed.
Status: Stage 4B — Admin Dashboard is closed (implementation-complete, 2026-07-04). Stage 5A —
Security / Data-Boundary Planning is closed (completed 2026-07-05). **Stage 5B — Production
Hardening Implementation is closed** — its core hardening scope (5B.1 `create_request` search_path
hardening, 5B.2 Storage bucket MIME/size limits, dependency security remediation, the
logging/error-handling fix pass) was completed 2026-07-05/2026-07-06; the Stage 5B task-list items
that remain open (custom SMTP / rate limits / leaked-password-protection verification, production
environment setup, CI/CD) are pre-launch work tracked in PROJECT_PRODUCTION_READINESS.md and
PROJECT_IMPLEMENTATION_PLAN.md (Stage 5B task list), not open stage work.
**Stage 5C — Real Infrastructure and End-to-End Verification is closed (2026-07-08)** — see the
closure entry immediately below. **Stage 5D — Full Application Maturity Audit is closed
(2026-07-10)** — primary audit (2026-07-08), findings reconciliation, Fix Pass 1 (commit
`9bc8e6f`), Fix Pass 2 (commit `043bcb7`), and an independent read-only closure verification
(`STAGE_5D_READY_TO_CLOSE`) are all complete — see the dated 2026-07-10 closure entry below.
**Stage 6 (visual/product polish) is unblocked and is the current development stage.** Stage 5D
closure is not a public-launch or production-readiness claim — pre-launch items remain open in
PROJECT_PRODUCTION_READINESS.md and PROJECT_BACKLOG.md. **Stage 6 Source of Truth (2026-07-12):**
`STAGE_6_PRODUCT_DEFINITION.md` (PRD — the authoritative product document, incl. Owner Decisions
D1–D10) and `STAGE_6_FUNCTIONAL_SPECIFICATION.md` (the authoritative implementation document for
the public website). All future Stage 6 work follows these documents; product behavior changes
require updating them first. See PROJECT_DECISIONS.md — Stage 6 Product Documentation Authority.

Current focus:

- **✅ Item 1 is now LIVE — migration applied and verified end-to-end (2026-07-14, STRAT session).**
  The blocker above is cleared. Steps actually performed and confirmed against the linked remote
  database (not just reported):
  1. **Live constraint name verified before touching anything** (the silent-failure trap): queried
     `pg_constraint` on `request_files` — the real name was `request_files_type_check`, matching what
     the migration's `DROP CONSTRAINT IF EXISTS` expects. Had it differed, the drop would have no-op'd
     silently; it did not.
  2. `pnpm exec supabase db push` applied `20260714025850_three_upload_categories.sql`.
  3. **Verified post-state in the remote DB:** constraint is now
     `CHECK (type IN ('artist_work','inspiration','placement_photo'))`; the 21 existing test rows were
     backfilled (`reference`→`artist_work` ×11, `placement`→`placement_photo` ×10) with no old values
     left; `migration list` shows Local == Remote for `20260714025850`.
  4. **`UPLOAD_TOKEN_SECRET` set in Vercel** (Production only for now — Preview/staging deferred to
     the pre-release CI/CD stage, owner decision) and the failed deploy re-deployed green.
  5. **Live end-to-end submit passed:** a real request with an image in each of the three categories
     persisted and renders correctly grouped in the admin viewer; files upload on selection (visible
     per-file progress), submit is fast, reference code shown. Owner-run, 2026-07-14.
  Item 1 is done in every sense now — code committed, reviewed, migration live, e2e proven.
  **Owner UX observations from the live check** (routed, not fixed here — this is a STRAT session):
  the upload card's file-name label and the retry control on an oversized-file *validation* rejection
  are both going into Item 3's scope (retry belongs only on a network/server upload failure, FS §4.5);
  the long error-text wording is a backlog note for the Item 6 visual pass. FS §4.3 amended to drop the
  file-name identification requirement (see the FS entry below).
- **Stage 6 Item 1 — upload-flow architecture — implemented, independently reviewed, review closed
  at consensus 2026-07-14; committed `480c721` (migration applied 2026-07-14 — see the entry above).**
  `STAGE_6_TASK_01_upload_flow_architecture.md` implemented in full: new `POST /api/upload`
  (selection-time, single-file, encrypted opaque handle — AES-256-GCM via
  `src/services/uploadToken.ts`, no storage path ever reaches the client); `src/bff/adoptUploads.ts`
  verifies and adopts exactly the calling session's uploads at final submit (the ownership check —
  a handle's embedded `clientSubmissionId` must match the one being submitted); three upload
  categories (`artist_work` / `inspiration` / `placement_photo`) replace the old two
  (`reference`/`placement`) across DB (`supabase/migrations/20260714025850_three_upload_categories.sql`),
  Storage path scheme, and the admin viewer (`RequestImageViewer` now takes a `groups` prop); a
  module-level client store (`src/features/request/store/`, `useSyncExternalStore`) replaces the
  shipped `useState`-regenerated `clientSubmissionId`, giving it the lazy-once lifecycle
  D-Blueprint 5(a) needs; per-file upload/retry/remove UI (`UploadCategoryInput.tsx`) with
  `XMLHttpRequest`-based progress and FS §4.3 thumbnails. **Regression guarded explicitly:** the old
  `cleanupRequestFiles()` calls on the idempotency-race and generic-DB-failure paths in
  `app/api/request/route.ts` were removed (under selection-time upload they would delete a racing
  winner's live files or a legitimate retry's files) — proven by dedicated tests. Full architecture
  record: PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture".

  **The independent Codex review found two blockers the in-session pipeline had missed** — recorded
  plainly because the first version of this entry claimed a clean pass and said nothing of them
  (`docs/project/reviews/done/REVIEW_2026-07-14_stage6-item1-upload-flow.md`, closed at consensus,
  all 5 findings accepted):
  1. **FS's 10 MB file limit was undeliverable** — Vercel Functions reject request bodies over
     4.5 MB at the platform edge, and the design routes every upload through a Function. Unit tests
     could not catch it (they call `POST()` with a mocked `formData()`, bypassing the platform).
     **FS §4.3 amended by owner decision: 10 MB → 4 MB per file** (spec first, then code). The limit
     is **per file, not per submission** — each file rides its own request. Enforced client- and
     server-side. Client-side compression (permitted by FS, would remove the ceiling for the
     visitor) is **deliberately not implemented** — deferred to research, see PROJECT_BACKLOG.md.
  2. **An expired upload handle was a silent dead end, and idempotent replay was broken** — adoption
     ran before the `clientSubmissionId` lookup, so a successful-but-lost-response submit retried
     past the 2 h TTL returned 400 instead of its reference code. Both fixed (lookup reordered; a
     `invalidateUploadedSlots` store action + a visible, actionable message), both regression-tested.
  Three should-fix/nit findings were also accepted: thumbnails were specified and documented but
  never rendered (now rendered); the abuse-model claims were false (below); and a whitespace nit
  traced to the docs' pre-existing CRLF storage, not this change.

  **Abuse posture — corrected, and now an open pre-launch item.** The architecture entry originally
  claimed the per-session Storage object cap was "the real ceiling against bucket-filling". **That
  was false and is withdrawn:** `clientSubmissionId` is caller-chosen, so an automated caller mints
  a fresh UUID per upload and never approaches the cap; the only cross-session control is an
  in-memory per-IP limiter, which is per-instance on Vercel. What holds: each object is size-capped
  (4 MB) and must be a real image, and the bucket is private with no public read path — so the
  exposure is storage growth/cost, not data. **Automated storage growth is currently unbounded,
  owner-accepted while the site is unlaunched, and re-filed in PROJECT_BACKLOG.md as a PRE-LAUNCH
  BLOCKER** (needs one non-caller-resettable control: durable rate limiting, a server-issued
  capability with a durable quota, or platform-level protection).

  `pnpm qg` fully green after the review fixes (structure / lint / typecheck / **274** tests /
  build). Task file status `done`; **not yet committed** — awaiting explicit owner approval per
  CLAUDE.md Workflow (the task file's move to `tasks/done/` and the review thread's move to
  `reviews/done/` land in that commit). **Unblocks Item 3** (Request form rebuild) **and Item 4**
  (Success page). Two follow-ups belong to no item and are owner-decided, not Item 1's tail:
  **client-side compression** (research) and **durable rate limiting** (pre-launch) — both in
  PROJECT_BACKLOG.md. One deferred UI nit belongs to **Item 3**: the submit CTA is currently
  disabled while an upload is in flight, whereas PROJECT_DECISIONS.md describes accepting the click
  and showing a "Sending…" state; behavior is correct (a *failed* upload never blocks submit, per
  FS §4.5), but the wording and the UI disagree.
- **Stage 6 Item 8 — three open questions resolved; task file cut; PRD/FS amended — STRAT
  2026-07-14.** Item 8 (Preparation/Aftercare split) was briefly `blocked` after repo verification
  (2026-07-13) exposed that the brief's "fully unblocked" claim was false and surfaced three
  owner-only questions. All three are now decided (full record: PROJECT_DECISIONS.md —
  "Preparation/Aftercare in-product discovery, 2026-07-14"):
  **(Q1)** how the pages are reached → **two global-footer links** (Preparation, Aftercare) as
  fallback discovery, artist-sent direct URL still primary. This **reversed the blueprint's
  batch-2 "direct URL only / accepted risk" stance and amended PRD §5 and FS §2** (PRD §9 change
  control — spec edited first, then the task cut against it); it also **removes**
  `process.aftercareLink` (the Item-2-deferred question), discovery being the footer's job now.
  **(Q2)** the boundary bullet stays in Preparation, copy unchanged (in-studio day = FS §3.6
  prep scope). **(Q3)** intro copy owner-supplied (`preparation.intro` / `aftercare.intro`).
  Task file `STAGE_6_TASK_08_preparation_aftercare_split.md` is `ready`, `Executor: codex`
  (mechanical split + two footer links; delegable). **Item 1 remains `ready` and runs as its own
  IMPL session** (Opus, Plan mode; owns its review loop through to consensus and commit —
  AI_TASK_PROTOCOL.md, Post-Review Fix Loop; STRAT does not follow it). Item 1 and the Item 8
  Codex session both touch shared docs on completion — sequence their doc-writing, do not let two
  sessions write PROJECT_* at once (Cross-Session Rules).
- **Stage 6 Item 2 — site-wide shell — completed 2026-07-13.** `STAGE_6_TASK_02_site_wide_shell.md`
  implemented in full and moved to `docs/project/tasks/done/`. Nav item set is now exactly
  Home/Process/Request/Location (`src/shared/ui/app-nav.tsx`); the `policies` → `process` route
  rename carried the shipped copy over verbatim (`git mv`, component renamed `ProcessPage`,
  `en.json` `policies` namespace renamed `process`, no content change); every inbound `/policies`
  reference was swept (Home's hero link + Mini Process rich-text link now point at `/process`;
  Aftercare's two "Back to Policies" links removed along with the unused `aftercare.backToPolicies`
  key); the global footer (`public-footer.tsx`) dropped its `mailto:`/`tel:` links and the
  `footer.email`/`footer.phone`/`footer.phoneHref` i18n keys; a new shared
  `src/shared/ui/cta-request-button.tsx` extracts the primary-CTA markup and is now used by Home's
  end-of-page CTA, Process, and the newly-added Location CTA (Home's Hero CTA instance was
  deliberately left as a second, un-extracted instance of the same action, per the blueprint's
  action-vs-instance rule). **CTA copy — corrected after the Codex review (see the dated
  "Item 2 Codex review" entry below):** the IMPL session shipped the CTA label as `"Request a
  Tattoo"` on all three pages (the shipped Home/Process wording, plus a newly-authored
  `location.ctaButton` key) and recorded in this log that the choice had been "flagged and
  approved in-plan" — it had not been; the task file required surfacing it and the session did not.
  FS §2's table names the action **"Start Your Request"**, so the owner's resolution (2026-07-13)
  was to follow the FS: all CTA copy now reads "Start Your Request", the per-page `label` prop was
  removed in favor of a single `cta.requestButton` i18n key owned by the component (the prop was
  the mechanism that let the three call sites diverge silently), and Home's Hero instance carries
  the same wording (it is the same action). Final
  repo-wide grep confirmed no live `/policies` route reference remains (only content strings like
  "Pricing & Policies" and the unrelated `consentRequired` copy). `pnpm qg` — structure / lint /
  typecheck / test / build all PASS (239/239 tests, unchanged count; lint: 0 errors, 1 pre-existing
  unrelated warning). One incidental fix needed: a stale `.next` type-validator cache referenced
  the old `policies` route path after the `git mv` and briefly failed `tsc`; clearing `.next` and
  rebuilding resolved it (no source change). Manually verified in the browser (dev server): all
  public routes return the correct status (`/process` 200, `/policies` 404, others unchanged), nav
  renders all 4 items in order with correct `aria-current` active-state on both Home and Process,
  footer HTML contains no `mailto:`/`tel:`, and Process/Location both render their CTA. Reviewed
  independently by Codex (thread at `reviews/done/REVIEW_2026-07-13_stage6-item2-shell.md`,
  consensus — one finding, the CTA-copy correction recorded above); committed as `e833398`.
  Items 5/6/7/8 are now unblocked **on the shell** — code-unblocked only: Items 6/7 remain
  content/asset-blocked on owner-supplied material, and Item 8 was subsequently found blocked on
  three owner questions (see the Item 8 entry above).
- **Stage 6 implementation started — 2026-07-13.** The UX blueprint is closed (see the entry
  below) and the durable, item-by-item plan lives in `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`
  (13 items). **Item 2 is done** (see the entry above, commit `e833398`). **Item 1 —
  `STAGE_6_TASK_01_upload_flow_architecture.md` — is `ready` but NOT started**; it is the
  critical path (blocks Items 3 and 4; public unauthenticated upload surface, Opus + Plan mode)
  and is the next session to run. Item 2 was taken first, by owner instruction, because the two
  items are independent — not because Item 1 was in progress. (An earlier version of this entry
  and of `STAGE_6_STRAT_BRIEF.md` said Item 1's IMPL session "runs in parallel"; that was a STRAT
  session's unverified assumption, never true — corrected 2026-07-13.) Items 6 (Process copy) and
  7 (Location studio photos) remain content/asset-blocked on owner-supplied material, not on code.
  Item 5 is code-unblocked by Item 2 and has no task file yet; **Item 8 is blocked on three owner
  questions** (see the Item 8 entry above — the claim that it was unblocked did not survive repo
  verification).
- **Stage 6 UX blueprint — complete and consensus-reviewed, 2026-07-13.** All 8 sub-topics
  decided in the first product/UX STRAT session and externally reviewed to consensus in three
  rounds: batch 1 (navigation/CTA, Home, Process, Request — 4 corrections, external reviewer),
  batch 2 (Success, Location, Preparation, Aftercare — 3 corrections + 1 acceptance note, external
  reviewer), and a whole-blueprint repo-aware Codex pass (2 rounds — Review 1: 5 findings incl. a
  blocker on the shipped upload pipeline vs. FS target, all accepted; Review 2: 1 should-fix on a
  self-contradictory About rationale, accepted). See PROJECT_DECISIONS.md — Stage 6 UX Blueprint
  Decisions; `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md`;
  `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-full.md`;
  `docs/project/tasks/STAGE_6_STRAT_BRIEF.md`. Codex's Review 1 blocker added a hard prerequisite:
  a dedicated upload-flow architecture task (endpoint/auth, opaque client handle + stable
  `clientSubmissionId`, three-category DB/Storage/admin representation, per-file retry/remove/
  progress, atomic adopt-at-submit, cleanup/idempotency) must be decided before any Request-page
  task is marked `ready`. Next: cut the blueprint into implementation task files (status `draft`),
  starting with the upload-flow architecture prerequisite.
- **Stage 6 product documentation integrated — 2026-07-12.** The Stage 6 PRD and Functional
  Specification were added to `docs/project/` and made the official Stage 6 Source of Truth.
  PROJECT_IMPLEMENTATION_PLAN.md (Stage 6 section rewritten to reference them; superseded task
  list removed), PROJECT_CONTEXT.md, PROJECT_DECISIONS.md (new Stage 6 Product Documentation
  Authority section; Reference Code Decision annotated), PROJECT_BACKLOG.md (absorbed items
  struck through with pointers), and PROJECT_ARCHITECTURE.md were aligned. Documentation only —
  no source code changed. See the dated 2026-07-12 entry below.
- **Stage 5D — formally closed 2026-07-10.** See the dated closure entry below for the full
  fixed/deferred/rejected record and explicit non-claims. Next: Stage 6 (visual/product polish) —
  see PROJECT_IMPLEMENTATION_PLAN.md, Stage 6; pre-launch DevOps/infrastructure work remains
  tracked separately in PROJECT_PRODUCTION_READINESS.md.
- **Stage 5D Fix Pass 2 — completed 2026-07-09.** See the dated entry below for full detail:
  UUID validation of `requestId` in `updateRequestStatusAction` (reusing the existing `isUuid`
  shared utility; invalid ids now return the not-found result without reaching the DB); removed the
  duplicated storage-cleanup helper from `app/api/request/route.ts` in favor of the (now exported)
  `cleanupRequestFiles` from `services/storage.ts`; removed the dead `config.supabase.publishableKey`
  field; raised `import/no-internal-modules` from `warn` to `error`; added `getRequestOrigin()`
  unit tests and the first Server Action test file (invalid-UUID coverage, mocking
  `next/headers`/`next/cache`/`next-intl/server` — a deliberate, owner-approved extension of the
  Stage 4B.6 no-Next-mocking precedent); corrected the stale "not committed" Fix Pass 1 status
  wording; recorded all remaining Stage 5D deferred/rejected findings in PROJECT_BACKLOG.md.
  239/239 tests (up from 230). Reviewed by the owner and committed as `043bcb7` (2026-07-10).
- **Stage 5D Fix Pass 1 — completed 2026-07-08.** See the dated entry below for full detail:
  fixed validated-data persistence in `POST /api/request` (was using the raw parsed payload instead
  of `validation.data`, so Zod trims/transforms were silently discarded before reaching the DB);
  added a safe outer-catch log for unexpected public submit failures; added max-length validation
  (`ideaDescription` 2000, `budget`/`phone`/`contactOther` 50) plus stable validation keys/messages,
  and fixed three form fields (`budget`, `phone`, `contactOther`) that were not wired to display any
  inline validation error at all; moved `API_ERROR_CODES`/`REQUEST_FIELDS` out of `src/bff` into a
  new `src/shared/api` module to resolve a UI→BFF import-direction violation; added `server-only` to
  `src/services/supabase.ts` and `src/config/index.ts` (new `server-only` dependency, approved);
  removed 3 confirmed-unused production dependencies (`class-variance-authority`, `lucide-react`,
  `radix-ui`); documented the storage upload-failure raw-path logging decision in
  PROJECT_DECISIONS.md. `pnpm qg` — structure/lint/typecheck/test/build all PASS (230/230 tests, up
  from 224; lint: 0 errors, 1 pre-existing unrelated warning). Reviewed by the owner and committed
  as `9bc8e6f` (2026-07-09).
- **DevOps/environment direction documented 2026-07-08** — see PROJECT_DECISIONS.md, Stage 5C
  Deployment Workflow and Environment Decisions, Section D, and the dated log entry below. Records
  the agreed staging/production Supabase-project split, target release flow, and CI/CD direction
  following the read-only DevOps audit. Documentation only — no infrastructure created yet.
- **Stage 5C — closed 2026-07-08.** Closed as *real-infrastructure / manual end-to-end
  verification complete* — this is not a public-launch-readiness claim and does not mean
  production-environment setup is complete. See the dated 2026-07-08 closure entry below for the
  full scope of what was verified and what remains deferred. Next: a DevOps/workflow decision
  block (git-flow, CI/CD, staging/production split — see PROJECT_DECISIONS.md, Stage 5C Deployment
  Workflow and Environment Decisions), then Stage 5D (Full Application Maturity Audit), before
  Stage 6 may begin.
- **Stage 5B — Node runtime compatibility micro-fix: completed 2026-07-06.** Follow-up to a
  read-only Stage 5B environment/deployment/CI-CD readiness audit performed earlier the same day
  (verdict: ready after minor fixes; no security/architecture blocker for Stage 5C), which flagged
  one small deployment risk: local development runs Node 24, `package.json` declared no Node
  engine floor, and Vercel's configured/default Node version was unverified — risking silent
  Node-version drift between local `pnpm qg` runs and the deployed build. Independent review
  agreed on a narrow fix: `package.json` now declares `"engines": { "node": ">=20" }` (a floor, not
  an exact pin — `20.x`/`22.x` are both acceptable) to document and warn about the supported
  minimum, without adding `.nvmrc` or `vercel.json` in this pass. No dependency, script, package
  manager field, or lockfile was touched — `pnpm-lock.yaml` diff confirmed empty. This does not
  replace manually checking/setting the Vercel project's Node.js Version to 20+ before the first
  deployed E2E test — that remains an outstanding manual step, not satisfied by this change. This
  does not claim deployment, production domain, custom SMTP, staging, backups/PITR, monitoring, or
  public-launch readiness. `pnpm qg` — structure / lint / typecheck / test / build all PASS (lint:
  0 errors, 1 pre-existing unrelated warning carried over from Stage 4B.5.1; 214/214 tests,
  unchanged count — no test/source file was touched). `git diff --check` reported no whitespace
  issues. Committed as a standalone change — see commit history for the hash.
- **Stage 5B — auth log label micro-fix: completed 2026-07-06.** Follow-up to a read-only
  inspection of the logging fix pass below, which found `src/services/authLog.ts`'s
  `classifyAuthError` reused the label `invalid_credentials` for the `400/401/422` status bucket
  across every auth operation sharing the helper, not just `login` — misleading for
  `oauth_callback`/`reset_callback` (an invalid/consumed code, not a credential) and
  `reset_password` (confirmed: `AuthWeakPasswordError` also carries `status: 400`, so a weak-
  password rejection would have logged as `invalid_credentials`). Renamed the label to the neutral
  `auth_request_rejected` in `AuthLogReason` and `classifyAuthError`'s return value only — no
  change to the status-code mapping, log severity, operation-awareness (deliberately still not
  operation-aware, per instruction), or any call site. Updated the 3 affected expected-value
  occurrences in `src/services/__tests__/authLog.test.ts` (`it.each` table plus the two literal-
  object assertions) to match. No other file touched. Total tests: 214 (unchanged count, values
  only). `pnpm qg` — structure / lint / typecheck / test / build all PASS (lint: 0 errors, 1
  pre-existing unrelated warning carried over from Stage 4B.5.1). Not committed — the owner will
  review before any commit.
- **Stage 5B — logging/error-handling fix pass: completed 2026-07-06.** Narrow, owner-approved
  fix pass following a read-only logging/error-handling audit performed earlier the same day
  (verdict: ready after minor fixes). Three tasks, no UX/route/schema/dependency change:
  (1) **auth logging** — added `src/services/authLog.ts` (`logAuthFailure(operation, error, level)`),
  a small server-only helper that classifies Supabase Auth errors using only the stable
  `AuthError.status` field (400/401/422 → `invalid_credentials`, 429 → `rate_limited`, else
  `unknown` — deliberately not using `error.code`/`error.message`, which are looser/less stable);
  wired into `loginAction`, `googleLoginAction`, `forgotPasswordAction` (now also captures
  `resetPasswordForEmail`'s previously-discarded error, still always returns `{ sent: true }` —
  no enumeration change), `resetPasswordAction`, `logoutAction` (`"warn"` level, per instruction —
  logout failure must not block the redirect), and both `/auth/callback`/`/auth/reset-callback`
  routes. Never logs email/password/token/code/session/user payload/callback query string/raw
  Supabase error message — verified via a dedicated test. (2) **status action hardening** —
  `updateRequestStatusAction` now wraps `updateRequestStatusForStudio` in try/catch (`console.error`
  with `operation`/`requestId`/generic `"unknown"` reason on infra failure, returns the existing
  `requestStatusUpdateFailed` shape, does not rethrow) and logs `console.warn` for the two expected
  rejection paths (`invalid_status`, `not_found`); unauthenticated/unauthorized is intentionally not
  logged (routine session-expiry noise). `studioId` and session/user payloads are never logged.
  (3) **cleanup log hygiene** — removed the raw Storage path array from the initial cleanup log
  line in `services/storage.ts` and `app/api/request/route.ts` (now logs file count only); the
  per-file upload-failure log (`storage.ts`, includes one file's own storage path to identify which
  file failed) and the post-`remove()` `error.message` logs were left unchanged — both were out of
  this pass's explicit scope (raw *paths* in cleanup logs, not error text or per-file failure
  identification) and changing them would have required expanding scope or losing legitimate
  debugging signal; deferred to Stage 5D if revisited. One incidental fix: `eslint.config.mjs`'s
  `import/no-internal-modules` allow-list extended with `**/services/authLog`, mirroring the
  existing `**/services/auth`/`**/services/supabaseAuth` entries — same established exception
  family, not a new pattern. New test file `src/services/__tests__/authLog.test.ts` (10 tests:
  status-to-reason classification table, warn/error level selection, non-`AuthError` input safety,
  and an explicit assertion that email/message content never reaches the logged context). No
  Server Action test was added — consistent with the existing, documented Stage 4B.6 precedent
  that this codebase does not mock `next/headers`/`next/cache` for action tests; the underlying
  `updateRequestStatusForStudio` throw path this action's new catch wraps was already covered in
  `db.test.ts`. Total tests: 214 (was 204) — all pass. `pnpm qg` — structure / lint / typecheck /
  test / build all PASS (lint: 0 errors, 1 pre-existing unrelated warning carried over from Stage
  4B.5.1; the same run before the `eslint.config.mjs` fix showed 6 new `import/no-internal-modules`
  warnings for the new deep import, resolved by the allow-list addition, re-run confirmed clean).
  No UI message, redirect, auth flow, public request behavior, cleanup/retry behavior, route,
  schema, or dependency was changed. Not committed — the owner will review before any commit.
- **Stage 5B — dependency security remediation: completed 2026-07-06.** Narrow, owner-approved
  `pnpm` version bumps of exactly three direct dependencies, following the read-only dependency
  security audit performed earlier the same day: `next` `16.1.6` → `16.2.10` (resolves all 19
  `next` advisories found by `pnpm audit`, including high-severity middleware/proxy-bypass and
  Server Components DoS findings — no major version change, still Next 16), `next-intl` `4.8.2` →
  `4.13.1` (resolves the 3 `next-intl` advisories, including an open-redirect and a prototype-
  pollution finding — no major version change, still next-intl 4), and `vitest` `4.0.18` → `4.1.10`
  (dev-only; resolves the sole critical-labeled advisory, a Vitest UI-server arbitrary-file-read
  issue that was never reachable in this project since `test:ui` is a manual, localhost-only,
  developer-invoked script never used in `pnpm qg`/CI — updated anyway since a safe minor fix was
  available). Only `package.json` and `pnpm-lock.yaml` changed; the lockfile diff was entirely the
  expected transitive footprint of these three packages (their own platform subpackages and
  dependencies) — no unrelated direct dependency (React, TypeScript, ESLint, Vite, shadcn,
  Supabase, Tailwind) was touched, per the approved narrow scope. No source-code change was
  needed — `pnpm qg` passed cleanly on the first attempt after the bump (structure/lint/typecheck/
  test/build all PASS; 204/204 tests; lint: 0 errors, 1 pre-existing unrelated warning carried over
  from Stage 4B.5.1). Post-update `pnpm audit` confirmed: 98 → 75 advisories, critical count 1 → 0,
  zero remaining `next`/`next-intl`/`vitest` advisories. The remaining 75 advisories are the same
  dev-only, non-production-reachable chains already classified and deliberately deferred in the
  read-only audit earlier this session: `shadcn`'s bundled `@modelcontextprotocol/sdk` (Express/
  Hono/ajv/qs/path-to-regexp transitive tree, never executed as a server by this app), `eslint`/
  `eslint-config-next` (transitive `minimatch`/`ajv`/`flatted`/`js-yaml`, lint-time only, no
  external input), `@vitejs/plugin-react`'s `vite`/`esbuild`/`picomatch`/`@babel/core` chain
  (Vite dev-server issues, not reachable since Vitest doesn't expose it as a server here), `jsdom`'s
  `undici` chain (test-only, this suite mocks Supabase directly rather than making real network
  calls), and `@tailwindcss/postcss`'s `postcss` (build-time CSS compilation of fixed local source
  only). None of these were touched — updating them would require major-version bumps of `eslint`/
  `vite`/`shadcn`/`typescript-eslint` or is entirely outside this app's control (`shadcn`'s own
  bundled SDK), both explicitly out of the approved scope. `git status` after the update: only
  `package.json` and `pnpm-lock.yaml` modified; not committed, per instruction.
- **Admin image viewer — fit-to-screen initial sizing + 2x zoom: completed 2026-07-06 (code);
  manual browser/device verification not yet performed.** Follow-up to Stage 4B.5.1's
  `RequestImageViewer` and the 2026-07-05 partial tuning attempt (which raised the zoom ceiling
  but left the initial viewer image tiny — root cause: YARL's `ImageSlide` only applies
  `max-width`/`max-height`, which never forces an `<img>` to grow past its natural size).
  `carousel.imageProps` (a real, officially-typed YARL prop) now sets `width: "100%", height:
  "100%"` on the slide image so it fills and fits its container via `imageFit: "contain"`; the
  developer has confirmed they will verify this manually in-browser themselves. Not part of Stage
  5B — a UI/UX fix, unrelated to Storage/DB/RLS hardening.
- **Stage 5B.2 — Storage bucket MIME/size limits: completed 2026-07-05.** Updated the
  `request-images` bucket via the Supabase Storage API (`updateBucket()`, not a SQL migration —
  bucket config is Storage-service-managed, not a plain table row to migrate): `file_size_limit`
  set to `10485760` (10 MB), `allowed_mime_types` set to the five types
  `validateFiles` already enforces in app code (`image/jpeg`, `image/png`, `image/webp`,
  `image/heic`, `image/heif`); `public` confirmed unchanged (`false`). See the dated entry below
  for the full verification record. Remaining Stage 5B items (Auth Dashboard verification,
  environment separation, production environment setup, logging review, dependency audit, CI/CD)
  are not started.
- **Stage 5B.1 — `create_request` search_path hardening: completed 2026-07-05.** Applied
  migration `20260705155244_harden_create_request_search_path.sql` (`ALTER FUNCTION ... SET
  search_path = public, pg_temp`), fixing the `function_search_path_mutable` advisor finding from
  Stage 5A.2. See the dated entry below for the full verification record.
- **Stage 5A — Security / Data-Boundary Planning: closed, completed 2026-07-05.** Sequence:
  5A.1 (read-only repo/migration/code security audit) → 5A.2 (live Supabase read-only
  verification via `supabase db advisors`/`db query`) → 5A.3 (read-only legacy-data cleanup plan)
  → 5A.4 (owner-approved destructive cleanup of 3 confirmed test/dev requests and their 6 legacy
  Storage objects) → independent Claude review, consensus reached. See the dated entries below
  for the full record of each sub-stage. Result: an approved, documented security/data-boundary
  posture (BFF/service-role primary, RLS enabled with intentional zero policies, private Storage
  bucket with no policies, legacy test data removed) ready for Stage 5B implementation — see
  PROJECT_DECISIONS.md, Stage 5A Security / Data-Boundary Decisions, and
  PROJECT_IMPLEMENTATION_PLAN.md, Stage 5B (revised scope).

- Stage 4B — Admin Dashboard: **closed, implementation-complete.** Stage 4A closed (see Stage 4A
  completion history below) — Stage 4B.0 (architecture/data-access audit) complete — Stage 4B.1
  (documentation + architecture foundation) complete — Stage 4B.2 (domain contracts + request list
  data access) complete — Stage 4B.3 (request detail data access + signed image URLs) complete —
  Stage 4B.4 (admin request list UI) complete and committed — Stage 4B.5 (admin request detail UI)
  complete and committed — routing cleanup (request list moved to `/[locale]/admin/requests`,
  `/[locale]/admin` now redirects) complete and committed — Stage 4B.5.1 (minimal image
  viewer/zoom) implemented using `yet-another-react-lightbox` + Zoom plugin, committed as
  `202c1f3`; desktop manual verification passed — post-4B.5.1 debugging pass complete: admin
  list/detail React-DevTools-only console warning investigated and attributed to a known
  dev-tooling/React-internals interaction (not app code, viewer not implicated, no fix applied);
  pre-existing file-upload accumulation bug found and fixed, plus a follow-up UX polish
  (ignored-extras warning, per-file remove), both committed in `202c1f3` — Stage 4B.6 (request
  status update) implemented and **committed as `44f11c4`**; **manual verification of the live
  status-update flow completed successfully** (status change succeeds, detail reflects the new
  status, list reflects the new status after navigation, same-status update works)
- **Deferred, not a Stage 4B closure blocker:** physical mobile-device verification of the 4B.5.1
  image viewer (iPhone Safari, Android Chrome — pinch zoom, pan after zoom, double tap, swipe,
  close button, backdrop tap, portrait/landscape) was never performed during Stage 4B — no
  physical device or deployment/preview access was available. This is honestly recorded as
  **outstanding, not completed** — it does not block Stage 4B closure and is carried forward as a
  Stage 6 mobile-polish / pre-release manual-QA item (see `PROJECT_IMPLEMENTATION_PLAN.md` Stage 6
  and `PROJECT_BACKLOG.md`, Admin image viewer entry). `swipe-down-to-close`
  (`controller.closeOnPullDown`) and the low-resolution-image zoom-cap follow-up
  (`zoom={{ maxZoomPixelRatio: 2 }}`) both remain gated on that same real-device verification — no
  resolution-based/conditional logic is to be added ahead of it.
- This entry records Stage 4B closure and handoff. Stage 5A has since been completed (2026-07-05
  — see the "Current focus" note above and the dated 5A entries below); Stage 5B has not started.
- **Stage 5 planned sequence** (see PROJECT_IMPLEMENTATION_PLAN.md — Stage 5 for full detail):
  5A (security / data-boundary planning) → 5B (production hardening implementation) → 5C (real
  infrastructure and end-to-end verification) → **5D (Full Application Maturity Audit + targeted
  fix pass)**, then Stage 6 (visual/product polish). 5D is a structured, evidence-based
  whole-codebase audit (not just Stage 5's new code) that runs only after 5A–5C, with findings
  classified and a documented fix/defer/reject outcome, before Stage 6 begins. 5A is now complete
  (2026-07-05); 5B–5D have not started.

Completed stages:

- Stage 3 — Request Flow ✓
- Stage 3D — Request Identity & Idempotency ✓
- Stage 3D.5.1 — Architecture & Documentation Audit ✓
- Stage 3D.5.2 — Audit Fix Pass ✓
- Stage 3D.5.3 — Supabase CLI Migration Workflow ✓
- Stage 3D.6 — Domain Foundation ✓

Note: Stage 3E (Telegram Notifications + Stabilization) was superseded by the roadmap
restructure on 2026-06-28. Telegram moved to Stage 2 (Post-Launch). Stabilization
responsibilities absorbed into Stage 5 (Production Hardening).

Architecture decisions confirmed for Stage 3C.2:

- Private Supabase Storage bucket: `request-images`
- Folder structure: `request-images/{clientSubmissionId}/{type}/`
- Storage filenames: deterministic (`reference-01.jpg`, `placement-01.jpg`, ...) — not original filenames
- Image access: signed URLs generated server-side; Image Proxy rejected
- Images: originals stored without compression or resizing
- `clientSubmissionId` introduced in 3C.2.1 for storage use; full idempotency remains Stage 3D
- Upload reliability: per-file retry, 2–3 attempts, backoff, transient failures only
- Failure handling: all-or-nothing; cleanup + logging on upload failure and DB failure

Completed in Stage 3:

- form config (SIZE_OPTIONS, COLOR_OPTIONS, PLACEMENT_OPTIONS, MAX_FILES_PER_FIELD)
- zod validation schema with all fields and cross-field contact rule (migrated to zod/v3 for @hookform/resolvers compat)
- RequestFormData and RequestFormInput types inferred from schema
- i18n namespace `request` added to en.json (labels, placeholders, hints, errors, options)
- request page route wired (`app/[locale]/(public)/request/page.tsx`)
- local form primitives: TextInput, TextareaInput, SelectInput, CheckboxInput, Button, FileUploadInput
- RequestForm fully implemented with RHF + zodResolver, all fields, mock submit
- error handling redesigned: schema uses stable custom message keys; lib/errors.ts has flat MESSAGE_TO_I18N_KEY map + getFieldError/getContactGroupError helpers; RequestForm uses local err() shorthand — no type aliases or nested maps in form file
- final cleanup: lib/ layer added to feature, all component ids explicit, buttonText i18n-controlled, eslint allow-list updated for features/*/lib/**
- select UX fixed: defaultValues for placement/size/color set to "" + z.preprocess in schema so placeholder is shown initially and "" is treated as missing value
- upload trigger text updated to i18n key with maxFiles interpolation ("Choose up to {maxFiles} images.")
- deferred file-upload UX documented in PROJECT_BACKLOG.md
- server validation: validateRequestPayload() in BFF reuses requestFormSchema; POST /api/request returns 400 + structured errors or 500 on exception; consent "true" → boolean true conversion in parseRequestFormData
- server validation UX: VALIDATION_ERROR fieldErrors mapped to RHF setError(); status reset to "idle" after field errors; empty fieldErrors falls back to generic error; 3 new tests added
- file transport validation: validateFiles() in BFF checks MIME type (jpeg/png/webp/heic/heif) and size (≤10 MB per file); integrated into route after validateRequestPayload; errors flow through existing fieldErrors contract; upload format hints added to FileUploadInput fields; 9 new tests
- pre-3C fixes: consent type made honest (true | undefined), success response gated on response.ok === true, contact field labels cleaned up
- Supabase foundation: @supabase/supabase-js installed; config layer (src/config/index.ts) reads SUPABASE_URL + SUPABASE_SECRET_KEY with fail-fast validation; server-side Supabase client in src/services/supabase.ts exported through src/services/index.ts; .env.example created
- clientName field: required `clientName` added to form, schema (trim, min 2, max 30), BFF parsing, route handler, db.ts; wired to existing `client_name` DB column via RPC; 8 new tests (schema validation, BFF parsing, form FormData, db persistence mapping)

---

## Log Entries (reverse chronological)

### 2026-07-15 — IMPL: Stage 6 Item 3 — Block R (reference-code format, Item 9) built + reviewed to consensus

Task `STAGE_6_TASK_03_request_form_rebuild.md`, first of the re-cut blocks (R / A′ / B′ / C — the
plan split the task's original two blocks into four after the contact model was escalated to STRAT
mid-flight; see the plan's Review-Granularity section and the task file's endorsement).

- **Block R (reference code)**: new migration `20260715124427_stage6_reference_code_format.sql`
  recreates the `create_request` RPC so the reference code is FS §4.6 — 6-char uppercase
  alphanumeric excluding O/0/I/1, unique via a generate-and-retry loop against the existing
  `reference_code UNIQUE` constraint, `client_submission_id` collisions re-raised for the route's
  idempotency recovery, `search_path` hardening re-established inline. RPC signature/return/grant
  unchanged. `src/services/__tests__/db.test.ts` fixture updated to a new-format sample. `pnpm qg`
  green (274 tests).
- **Independent Codex cross-review to consensus**: `reviews/done/REVIEW_2026-07-15_stage6_reference_code.md`.
  3 findings, all accepted/fixed (doc/comment only, no logic change): (1) staging-waiver now
  recorded at PROJECT_DECISIONS.md → "Staging Environment" as a dated scoped exception for the two
  Stage 6 `create_request` migrations; (2) task CO-2 rewritten from "no migration expected" to a
  concrete apply-and-verify obligation; (3) migration `search_path` comment corrected (CREATE OR
  REPLACE preserves owner/ACL, not `proconfig` — the inline `SET` re-establishes it).
- **NOT yet applied live**: the migration awaits owner per-migration approval before `db push`.
  The live format/uniqueness + admin-render check is task CO-1, run after push.
- **Process**: filed a META observation (AI_FRAMEWORK_IDEAS.md) — STRAT and IMPL co-authored
  PROJECT_DECISIONS.md and the Task 03 file this session, and the owner-wanted two-commit split is
  not achievable by file (shared files) with `git add -p` blocked; owner chose one combined commit
  and asked META to design the protocol.

### 2026-07-13 — META: shared-git-index hazard removed; state-claim verification rule

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Resolves two more observations from the Stage 6 STRAT
session; a third (plan approval as the single enforcement point) is deliberately left `open` in
AI_FRAMEWORK_IDEAS.md for the next META session.

**1. Shared git index — the exposure window is removed, not guarded (CLAUDE.md — Workflow;
AI_TASK_PROTOCOL.md — Cross-Session Rules).** Every session shares one git index. The previous
rule — "stage, show the owner, wait for approval" — left the index dirty across an owner
round-trip, so a parallel session's commit could sweep up whatever was staged. This is not
theoretical: this META session's own commit `df70cae` carried away the STRAT session's staged
Item 2 files under a message that did not describe them. The guard rule ("re-check the staged set
before committing") already existed and had fired correctly twice that same day — and still failed
the third time, because the failure is silent by construction: neither session can see the other's
staging. So the window itself is closed rather than watched: **do not stage before approval** —
propose the commit from the working tree (`git status --short` + one-line summary), wait for the
owner, then `git add <explicit paths> && git commit` in one uninterrupted step. Never
`git add -A`/`git add .`; never commit while a foreign file sits staged. The pre-commit
`git diff --cached --stat` check is kept anyway, because `git add` silently pulls in rename pairs
(that is how this session swept up a `policies → process` rename earlier the same day).
Per-session git worktrees were considered and rejected for now — real protection, but
infrastructure cost the owner does not want yet.

**2. State claims must be verified against the repository at write time (AI_TASK_PROTOCOL.md —
Session Duties, new subsection).** Distinct from the already-fixed ban on *unverifiable* claims
about a conversation: this covers claims that **are** verifiable and were simply not checked —
which is worse, since the check is nearly free. Triggering case: a STRAT session was told an IMPL
kickoff "exists", inferred the session was *running*, and wrote "Item 1 runs in parallel" into
STAGE_6_STRAT_BRIEF.md, PROJECT_STAGE_LOG.md and a Codex review handoff. Item 1 had never started.
Nothing caught it — not the gates, not the Codex review (it reviews the diff, not the log's claims
about the world), not the plan approvals; only a direct owner question did (corrected in `818f914`).
New rule: any claim about world state — what is running, done, in progress, committed, exists —
is checked against the repo when written, never recalled (lookup table: `Status` field and
`tasks/` vs `tasks/done/` for task state; `git log` for commits; a session's *diff*, not its
report, for what it did; read the file for what the code contains). Two corollaries: the task
file's `Status` field is the **source of truth** for task state and narrative docs must point at
it rather than restate it as drift-prone prose (in the triggering case the task file was correct —
only the narrative docs lied); and a **relayed report** ("the pipeline passed", "the review found
nothing") is that session's claim, not an observed fact — verify it or attribute it plainly, never
launder a report into a fact.

The enclosing section was renamed "IMPL Session Duties" → **"Session Duties"**: these two writing
rules bind STRAT and META as well (the triggering case was a STRAT session), and under the old
heading they would have been invisible to exactly the sessions that needed them.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — META: plan-deviation barrier + post-review fix-loop ownership

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Resolves two observations raised by the Stage 6 STRAT
session (AI_FRAMEWORK_IDEAS.md — Workflow Observations, both now `resolved`).

**1. Plan-deviation barrier (AI_TASK_PROTOCOL.md — new "IMPL Session Duties" section;
STAGE_TASK_TEMPLATE.md Workflow step 4).** Every IMPL plan must carry a distinct
**"Deviations from the task file"** section — one line per deviation ("task file says A, I
propose B, because C") or an explicit "no deviations". The reason this barrier must stand at
plan time and nowhere else: the Review Pipeline's Review Agent compares the **diff** to the task
file, so a deviation already baked into the plan is invisible to every downstream check — the
diff faithfully implements the wrong thing. Triggering case: an IMPL session silently shipped a
CTA label the FS did not specify, authored a new i18n key for it, and the in-session pipeline
found nothing; only the independent Codex review caught it. Since the owner approves plans
quickly (their own words), the section must be scannable at a glance — a process that only works
when every plan is read closely does not work.

**2. Durable docs may not carry unverifiable claims about a conversation** (same new section).
Phrases like "flagged and approved in-plan" or "agreed with the owner" are unfalsifiable — a
future session has no transcript — and permanently poison the record if wrong (the same session
wrote exactly that about a choice its plan had never flagged). Write the checkable thing
instead: the decision and its rationale, a pointer to the authorizing doc section, or a real
PROJECT_DECISIONS.md entry if it rests on an owner call.

**3. Post-review fix loop now has an owner (AI_TASK_PROTOCOL.md — new "Post-Review Fix Loop";
mirrored in AI_CROSS_REVIEW.md Roles and STAGE_TASK_TEMPLATE.md Workflow step 7).** The protocol
defined who implements and who reviews, but was silent on what happens after an independent
review returns findings — so the role fell to the wrong session: an IMPL session ended, and the
STRAT session then wrote the handoff, processed the findings, **applied the code fixes, re-ran
`pnpm qg` and staged the commit** — pure IMPL work inside a strategic session. Owner decision:
**the IMPL session that built the block owns the whole loop** (handoff → Response → fixes →
gates → commit → consensus) and **stays open until its thread reaches consensus**, rather than
ending at "READY FOR DEVELOPER REVIEW". STRAT does not participate; the rare finding that needs a
product judgment is already covered by the existing escalation rule (product behavior changes →
STOP, update PRD/FS). **No final STRAT sign-off was added**: by consensus the block has already
passed plan approval, implementation, the in-session pipeline, an independent review, fixes and a
gate re-run — a strategic session arriving last holds no unused instrument and would decay into a
rubber stamp, dulling the checks that do work. The owner's real control points remain **plan
approval** (before the work, when changing course is cheap) and **commit approval** (after, with
the diff in hand). Recorded explicitly: "the fixes are small and deterministic" is a **bad
justification, not a precedent** — that reasoning dissolves every boundary.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — META: framework process audit by Codex — 8 findings (2 blockers) fixed

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Thread:
`docs/project/reviews/done/REVIEW_2026-07-13_framework-process-audit.md` (closed to consensus).

The process framework had grown reactively over two days (STRAT continuity, review-queue
collision, usage-limit pressure, Codex connected first as reviewer then as executor) and had
never been read end to end. Codex ran a full adversarial audit of it — 9 framework docs +
AGENTS.md + CLAUDE.md — and found 8 findings, all accepted and fixed:

**Blockers (both would have failed on first real use, not in theory):**

1. **Codex's executor role had no source-code write authority.** AGENTS.md's hard rule allowed
   writing only the assigned task file itself, directly contradicting the delegation protocol
   that has Codex implement and fix a patch. The first delegated task would have been unable to
   touch any code. Fixed: the hard rule now grants the task file **plus exactly the paths in a
   required per-task `Allowed Write Surface`** — nothing else, ever.
2. **Commit approval was not bound to the staged set.** The git index is shared across sessions,
   so a parallel session could stage files between the owner's approval and the actual
   `git commit` — shipping unapproved work under an approval. Not hypothetical: during the audit
   the index really did contain another session's staged files. Fixed in CLAUDE.md: approval
   binds to the exact staged set, a pre-commit re-check is mandatory, and the approval is **void**
   if anything changed; never sweep another session's staged files into your commit. Mirrored in
   AI_TASK_PROTOCOL.md (the index is a shared critical section).

**Should-fix (3–7) and nit (8):** the task template couldn't encode the real lifecycle
(`awaiting-claude-review`, `superseded`, Executor/Reviewer, Allowed Write Surface) and demanded a
self-referential commit hash — rewritten, hash replaced by date + stage-log pointer; delegation's
accepted baseline/ownership precondition was never filed into the protocol — restored as an
enforceable startup check; the review queue defined "active" as `awaiting-review` only (two live
dialogues possible) and had no recovery actor for an orphaned queue — both closed, promotion is now
an idempotent recovery check; "config-only changes skip the pipeline" let gate-defining config
(eslint/tsconfig/deps/CI) through unvalidated and post-pipeline fixes required no re-run — both
closed, with AI_REVIEW_PIPELINE.md made the single source of truth for the rule (it was duplicated
across three docs); universal observation/backlog write duties conflicted with a delegated task's
bounded write surface — routing now differs by executor; "external reviewer" was used for Codex,
colliding with the distinct `Reviewer: external` role — terminology separated.

**Root-cause pattern, recorded in AI_FRAMEWORK_IDEAS.md:** findings 1, 4 and 7 share one cause —
decisions accepted in earlier review threads were never actually filed into a doc where they would
be enforced. Docs touched: AGENTS.md, .claude/CLAUDE.md, AI_TASK_PROTOCOL.md, AI_CROSS_REVIEW.md,
AI_REVIEW_PIPELINE.md, AI_DEVELOPMENT_WORKFLOW.md, AI_DEVELOPMENT_RULES.md,
templates/STAGE_TASK_TEMPLATE.md, AI_FRAMEWORK_IDEAS.md.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 — Item 2 (site-wide shell) task file cut; Item 2/6 route boundary decided

Status: Completed. Documentation-only — no source code changed. Item 1's IMPL session runs in
parallel (separate kickoff); Items 1 and 2 touch disjoint files, so no coordination is needed.

Wrote `docs/project/tasks/STAGE_6_TASK_02_site_wide_shell.md` (status `ready`, Sonnet + Plan
mode): nav item set → Home/Process/Request/Location (PRD D9), footer stripped of `mailto:`/`tel:`,
the primary CTA extracted into one shared `shared/ui` component, the `policies` → `process` route
rename, the inbound-link sweep, and Location's missing CTA.

**Owner decision this session — the Item 2/6 boundary.** Item 2 performs the route rename **and
carries the shipped policies copy over unchanged**; Item 6 later replaces that copy with the FS
§3.2 canonical content (Overview, Good Fit, Design Process, Pricing, Booking Policy, FAQ). Two
alternatives were considered and rejected: (a) leaving the rename in Item 6 — the new nav would
point at a 404 for as long as Item 6 stays blocked on owner-authored copy; (b) shipping a stub
`/process` and deleting `/policies` — that would take the site's only pricing/FAQ content offline
in the meantime. Carrying the content over keeps the site coherent at every commit and costs Item
6 nothing (it rewrites a page at a route that already exists). Also decided: **no redirect** from
the old `/policies` URL (site not publicly launched — nothing to preserve; revisit only if the
owner has already shared that URL publicly). Recorded in `STAGE_6_IMPLEMENTATION_PLAN.md` (new
"Item 2/6 boundary" note; Items 2/6/7 rows updated).

Item 2 also pulls forward the one Location line belonging to the site-wide CTA pattern — Location
has no primary CTA today and FS §2's table requires one; Item 7 is asset-blocked on studio photos,
and the CTA pattern should not ship half-applied behind it. The two `aftercare` "Back to Policies"
links are removed as part of the inbound-link sweep (already a blueprint decision — Aftercare
page); the Preparation/Aftercare split itself stays in Item 8.

`STAGE_6_STRAT_BRIEF.md` rewritten (pickup point: cut Item 3's task file after Item 1 lands; Items
5 and 8 after Item 2). `pnpm structure` not run — no source/structure change. No `pnpm qg` —
docs-only.

---

### 2026-07-13 — META: Codex gate-loop discipline for delegated IMPL tasks

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied).

Follow-up to an idea raised in a Stage 6 STRAT session (AI_FRAMEWORK_IDEAS.md — Workflow
Observations, 2026-07-13 entry on Claude usage-budget relief via Codex): the owner wanted a
concrete way to have Codex absorb some of Claude Code's token/usage load on delegated
implementation work, without any quality-control loss or duplicated gate runs. Resolution:

- The "Codex runs `pnpm qg` and reports PASS/FAIL" idea, considered on its own, was superseded
  by a stronger version folded into the already-approved delegation mechanism (2026-07-13,
  "Delegating IMPL Tasks to Codex" — see the entry below on Codex's independent-reviewer
  connection). "Codex writes tests" was recognized as not a new role-scope question at all —
  it is an ordinary case of that same mechanism when the specific test task meets its
  eligibility bar.
- **The actual budget win:** Claude's expensive step is triaging raw lint/typecheck/test
  failures, not running the gates. So AI_TASK_PROTOCOL.md (Delegating IMPL Tasks to Codex) and
  AGENTS.md (Executing a delegated task) now require Codex to iterate its own
  `pnpm lint` / `pnpm typecheck` / `pnpm test` loop — fix, re-run — until clean, or report
  precisely which check it could not resolve, **before** setting `awaiting-claude-review`.
  Claude's own full `pnpm qg` re-run stays mandatory and unconditional regardless of what
  Codex reports — quality control is unchanged; only the debugging labor shifts to Codex, so
  Claude's final gate run is normally a fast confirmation instead of a debugging session.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 UX blueprint — Codex repo-aware review round 1 processed, 5 findings accepted

Status: Response written, thread at `awaiting-review` for Codex's verification round
(`docs/project/reviews/REVIEW_2026-07-13_stage6-ux-blueprint-full.md`). First Codex review of the
whole blueprint — the angle no prior reviewer had: verification against the shipped repository.
All five findings verified against the code in-session before acceptance; all accepted.

1. **Blocker — upload-flow redesign was understated.** The blueprint claimed preserving uploaded
   files was "cheap" (true only of the FS target): the shipped pipeline has no selection-time
   upload (local `File` state → one `FormData` → batch upload after validation, all-or-nothing),
   two file categories end-to-end vs FS's three, and a component-local `clientSubmissionId`.
   Added an explicit **Upload-flow architecture prerequisite** to the Request section: a
   dedicated architecture task must decide endpoint/auth, opaque client handle +
   `clientSubmissionId` lifecycle, three-category representation (incl. DB-constraint
   migration), per-file retry/remove/progress, atomic adoption at submit, and
   cleanup/idempotency — before any Request-page task is marked `ready`.
2. About-section check resolved from the repo: the shipped copy IS unique trust content
   ("20+ years…", custom-from-scratch) — fold into Hero/Good Fit, not delete.
3. Location precision: shipped map and all four studio photos are placeholder `<div>`s — real
   map embed and photos recorded as Stage 6 must-supply items (the transport/parking sentence,
   by contrast, already ships in `howToFindUsText`, satisfying the batch-2 resolution).
4. **New site-wide decisions (owner, in-session):** global footer loses `mailto:`/`tel:`
   (becomes studio + address + Instagram + copyright; rationale: PRD §2 thesis + FS §2
   task-relevance; keep-and-A/B rejected for Stage 6 — analytics is a PRD §4 Non-Goal — idea
   parked in PROJECT_BACKLOG.md); Home's second Instagram link (Featured Work) kept as
   task-relevant.
5. Blueprint header status line updated (was still saying batch-2 review pending).

Also this session, per owner: the CLAUDE.md commit rule extended — approval is requested **after
staging**, per commit (stage → show staged state → wait for explicit approval → commit); a
blanket earlier "commit" does not carry over.

`pnpm structure` run. No `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 UX blueprint — batch 2 external review closed at consensus, 3 corrections applied

Status: Completed. First review thread run through the formal cross-review protocol
(AI_CROSS_REVIEW.md, `Reviewer: external`); thread with full findings, responses, and consensus
table: `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md`. All findings
accepted; corrections applied to PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions:

1. **Success:** added a bfcache guard (`pageshow` + `event.persisted` → re-run the gate check —
   browser-back restore after a full document navigation bypasses mount-based checks, so the
   reference code could reappear); reworded one-time read to idempotent semantics (dev strict
   mode double-invokes effects); added the missing form-state-clearing rule (successful persist
   clears both the success payload after display and the D-Blueprint 5(a) persisted form state —
   without it, revisiting Request in the same session would show an already-submitted form).
2. **Location:** the review caught a real FS conflict — FS §3.5's "if non-obvious" qualifier
   binds only to entrance instructions, so transport/parking is unconditional must-contain
   content that the blueprint had waived as an "owner content decision" (silent FS override at
   the wrong level). Owner chose the review's recommended resolution over an FS amendment:
   "How to find us" carries at least one sentence of transport/parking content.
3. **Preparation/Aftercare cross-link:** decision unchanged (no cross-link), recorded basis
   corrected from PRD §5 (overclaim — that clause governs public discoverability, not links
   between already-distributed contextual pages) to FS §2 task-relevance; future cross-link
   explicitly marked a cheap blueprint-level change, not a PRD escalation.

Plus one acceptance item carried to future task files (STAGE_6_STRAT_BRIEF.md): site-wide check
that no inbound links to the superseded `policies` route remain (Home hero and Mini Process copy
link to it today). **The Stage 6 UX blueprint is now fully decided and consensus-reviewed across
both batches; next step is cutting it into implementation task files.**

`pnpm structure` not run — no source/structure change. No `pnpm qg` — docs-only.

---

### 2026-07-13 — META: task template moved to docs/framework/templates/

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied).

`docs/project/tasks/STAGE_TASK_TEMPLATE.md` was a framework artifact living under
`docs/project/` — it is a reusable, project-agnostic skeleton (per DOCUMENTATION_SYSTEM_RULES.md,
templates belong to framework docs, reusable across projects), so it was moved via `git mv`
(history preserved) to `docs/framework/templates/STAGE_TASK_TEMPLATE.md`. Generalized the two
project-specific mentions in place: "Stage Source of Truth" and "Acceptance Criteria" sections
now describe the Stage-6-PRD/FS reference as an example rather than a hard-coded assumption,
so the template copies cleanly into a project with no PRD/FS-style doc. Updated the three path
references in AI_TASK_PROTOCOL.md (STRAT Kickoff Prompt persistence line, the parenthetical
IMPL note, and Task Files — Skeleton). Historical PROJECT_STAGE_LOG.md entries mentioning the
old path are left as-is (history is not rewritten).

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 UX blueprint — Success, Location, Preparation, Aftercare decided (batch 2, all 8 sub-topics now complete)

Status: Batch 2 decisions completed (session still open, model switched Sonnet → Fable for this
batch per owner request, then back to Sonnet). Follow-up to the entry below (same day). Closes the
last four of the eight UX-blueprint sub-topics from STAGE_6_STRAT_BRIEF.md. Full text:
PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions (Success/Location/Preparation/Aftercare
sections).

**Success (FS §3.4).** Content and order are fully fixed by FS itself ("Must contain, in order");
this page does not exist in the shipped site (Stages 0–5 used an in-place success state — a
recorded divergence). Decided: data transport via the same module-level client store
D-Blueprint 5(a) already introduced (success payload set on submit, client-side navigation to a
clean `/success` URL with no query data); gate check on mount (empty store → redirect to Home,
covering direct-open/refresh/no-submission cases in one check); one-time read (store cleared
immediately after render, so any revisit — including browser back — also redirects), a known,
accepted trade-off against re-viewing the code on-site (matches FS §4.6's "no public lookup").

**Location (FS §3.5).** Content set fixed by FS, order not specified. Decided: keep the shipped
page's existing order (Address+map-links → map embed → How to find us → Studio Photos) — no
reordering without cause — plus append the primary CTA the shipped page is currently missing
(Location is in FS §2's CTA table). Transport/parking and entrance instructions live inside "How
to find us" as optional owner-added items (FS itself gates entrance instructions on "if
non-obvious"; the owner confirmed neither applies to the current Tel Aviv location and forcing
them in would be friction, not help, per PRD §6).

**Preparation / Aftercare (FS §3.6/§3.7).** The shipped site has no separate pages for these — a
single combined `aftercare` route exists today (before-appointment, tattoo-day,
aftercare-instructions, healing-touch-ups sections), a recorded Stages 0–5 divergence. Splitting
into two routes is direct FS compliance, not a new invention. Decided for both: chronological
block order (short intro → the two FS-mandated content sections each); nav bar renders on the
page but the page stays out of the nav item set, reachable only by direct URL the artist sends at
the right journey moment (PRD §5 — the owner explicitly reconfirmed this distribution model
in-session, including its "no in-product discovery" accepted risk, after the trade-off was
restated); no primary CTA (FS §2 table); the shipped page's "back to policies" links removed
(policies is superseded by Process in Stage 6, and FS §2 only allows secondary links that help
the current task); no cross-link between Preparation and Aftercare (would quietly reintroduce
in-product discovery against the PRD §5 model). Aftercare additionally records an explicit content
boundary: "Healing & touch-ups" covers healing/appropriateness only — touch-up booking terms and
pricing stay exclusively on Process, per FS §3.7's pricing/booking prohibition and FS §5's
canonical-ownership table.

**Status after this entry:** all 8 UX-blueprint sub-topics are decided. Batch 1
(navigation/CTA, Home, Process, Request) has completed one external-review round (4 corrections
applied — see the entry below). Batch 2 (this entry) has not yet been through external review;
next step is preparing that review round, now via the newly-formalized cross-review protocol
(`docs/framework/AI_CROSS_REVIEW.md`) rather than the ad-hoc file exchange batch 1 used.

`pnpm structure` not run — no source/structure change. No `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 UX blueprint — first external review round, 4 corrections applied

Status: Completed for this round (session still open — see STAGE_6_STRAT_BRIEF.md). Follow-up to
the "navigation/CTA, Home, Process, Request format decided" entry below (same day). The four
decided sub-topics were handed to an external AI reviewer for independent verification against
the full PRD/FS text (owner-run, ad-hoc file exchange via `docs/project/temp/` — predates the
Codex cross-review protocol formalized in the entry above; future rounds should use
`docs/framework/AI_CROSS_REVIEW.md` / `docs/project/reviews/` instead). Per the owner: source of
truth for these decisions is the **consensus** across AI + docs + owner, not any single party.

Review found zero PRD/FS contradictions and confirmed the Home/Process block-order reasoning
against the owner's own prior competitor research (unprompted — the reviewer had that context
independently). Four corrections applied to PROJECT_DECISIONS.md — Stage 6 UX Blueprint
Decisions:

1. **Home's double CTA instance** (Hero + end of page) — added an explicit interpretation note:
   FS §2 / acceptance criterion 10's "exactly one primary CTA" governs the primary *action*, not
   the literal instance count; two instances of the same action are not a violation.
2. **About-section removal rationale corrected** — the original citation (FS §3.1 "long-form
   duplicates") does not actually apply to a two-line block; the real basis is PRD §6 ("one user
   problem per content block"). Removal itself still stands, now conditional on confirming the
   real copy has no unique trust content worth folding into Hero/Good Fit instead of deleting.
3. **D-Blueprint 5(a) (required in-session form persistence)** — added an explicit guarantee
   boundary: covers client-side navigation only, not page reload / tab close / mobile OS tab
   eviction (a real scenario); noted the implementation cost (state must outlive the page
   component, so it needs a module-level store) and that this decision increases orphaned Storage
   uploads (already tracked in PROJECT_BACKLOG.md as post-launch/operational, unchanged policy).
4. **D-Blueprint 4 (vertical upload-card stack) rationale strengthened** — added the direct tie to
   PRD D4's review trigger: the stack is what keeps "missing placement photos causing
   clarification rounds" an interpretable signal at all (a carousel/tabs would make low upload
   rates ambiguous — decline vs. never-seen).

One reviewer claim was flagged as unverifiable and intentionally excluded from the fix ("most
valuable upload category" traced to competitor research, not PRD/FS — confirmed as already
correctly excluded from D-Blueprint 4's recorded rationale in the prior session).

`pnpm structure` not run — no source/structure change. No `pnpm qg` — docs-only.

---

### 2026-07-13 — META: Codex connected as independent reviewer (AGENTS.md + cross-review protocol)

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied).

The owner connected OpenAI Codex to the project. Division of labor decided: **Claude Code
remains the primary agent for everything** (design, analysis, implementation); **Codex is the
independent reviewer only** — reviews completed blocks (implementation / spec / design) after
the fact, read-only, no implementation delegation for now (revisit later; rationale: a second
writer would break the single-writer principle and increase — not reduce — the owner's review
load, which is the actual bottleneck).

Artifacts added:

- **`AGENTS.md`** (repo root — Codex's rules file, its CLAUDE.md equivalent): independent-
  reviewer role; read-only everywhere except `docs/project/reviews/`; never commits (commits
  remain Claude Code's job with explicit manual owner approval per CLAUDE.md — note: the
  `.claude/settings.json` permission prompt does not apply to Codex, so the rule + Codex-side
  sandbox settings are the barrier); context list (CLAUDE.md, PROJECT_* docs, stage Source of
  Truth, cross-review protocol); fail-fast.
- **`docs/framework/AI_CROSS_REVIEW.md`** (new framework doc): status-driven review threads —
  one file per reviewed block at `docs/project/reviews/REVIEW_<date>_<slug>.md`, appended
  sections Handoff (Claude) → Review N (Codex) → Response N (Claude, incl. Russian owner
  summary) → … → Consensus; statuses `awaiting-review` / `awaiting-response` / `consensus`
  determine who acts, so the owner's orchestration is two one-line pings per round; accepted
  findings are filed to fixes/task files/PROJECT_BACKLOG.md (review file = discussion record,
  not a work tracker); after consensus the thread moves to `reviews/done/` (never-delete);
  does NOT replace AI_REVIEW_PIPELINE.md.
- **`docs/project/reviews/`** + `done/` created (with .gitkeep).
- **AI_TASK_PROTOCOL.md** (Cross-Session Rules): pointer bullet to AI_CROSS_REVIEW.md.

**Protocol validated end-to-end the same day (dogfood review):** the first review thread
(`reviews/done/REVIEW_2026-07-13_codex-sync-setup.md`) had Codex review the setup itself.
Codex found the thread from the standard one-line ping and followed file/format/status rules
correctly on both rounds. 4 findings (3 should-fix, 1 nit), all accepted and fixed:
reviewer's quality gates narrowed to the non-mutating `lint`/`typecheck`/`test` (Codex itself
caught that `pnpm qg` writes `docs/files-structure.md` via `structure` — and correctly
refused to run it); review-debt definition corrected (`.gitkeep`/`done/` don't count);
uniqueness invariant for `awaiting-review` threads added (zero/multiple → ask the owner);
git `safe.directory` read-only inspection note added. Consensus reached in 2 rounds; thread
moved to `reviews/done/`.

**External reviewer flow added the same day** (owner request; need already proven by the
Stage 6 STRAT session's ad-hoc external review via `docs/project/temp/`): threads now carry a
`Reviewer: codex | external` header field (Codex acts only on `codex` threads — prevents
waiting on the wrong reviewer). For `external` threads the external AI has no repo access, so
Claude Code generates transient self-contained `*.request.md` / `*.answer.md` copy buffers
next to the thread; the owner carries them by copy-paste; answers are normalized into the
thread (single source of history) and the buffers are deleted at Consensus. Owner commands:
`Подготовь внешнее ревью: <тема>` / `Process the external review`. AGENTS.md and
AI_CROSS_REVIEW.md updated accordingly.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — STRAT: Stage 6 UX blueprint — navigation/CTA, Home, Process, Request format decided

Status: In progress (session ongoing, checkpointed mid-session per owner request — not a session
close). First Stage 6 product/UX STRAT session on the approved PRD/FS (prior Stage 6 STRAT session
was workflow-only, see the entry below). Documentation-only — no source/UI code changed; this is
blueprint decision-making, not implementation. Full decision text and rationale: PROJECT_DECISIONS.md
— Stage 6 UX Blueprint Decisions.

**Navigation and CTA (site-wide).** Existing `src/shared/ui/app-nav.tsx` pattern (bottom fixed
tab-bar on mobile, top sticky bar from `sm:`) retained; only the item set changes to Home/Process/
Request/Location (FS §2/PRD D9 — `policies` item becomes `process`). Primary CTA appears at the
end of each content page, plus an additional CTA at the end of the Hero block on Home only.

**Home (FS §3.1).** Block order (not fixed by FS, a blueprint decision): Hero → Featured Work →
Good Fit teaser → Mini Process → Price teaser → CTA. The two-line About section in the
currently-shipped page (`app/[locale]/(public)/page.tsx`) is removed as a FS-prohibited
long-form duplicate; the Instagram link is retained as a secondary link inside Hero.

**Process (FS §3.2).** Block order: Process Overview → Good Fit → Design Process → Pricing →
Booking Policy → FAQ → CTA.

**Request — form format (FS §4).** Field-level order/fields/states were already fixed by FS; the
open question was on-screen format. Decided: single continuous scroll with visually separated
sections (not a wizard, not an accordion) — retains the current `RequestForm.tsx` architecture.
No Review step (submit leads directly to Success/failure, matching FS §4.5's existing states).
Upload categories (fields 5–7) shown as a vertical stack of motivation cards inside one section,
not a carousel/tabs/step, in FS's own field order. In-session form persistence (values + uploaded
files survive navigating away and back) is elevated from FS's "permitted, not required" wording
to a required blueprint behavior — explicitly inside the FS-permitted range. Clean single-entry
browser history and local smooth-scroll-to-invalid-field (no sticky progress indicator) follow
directly from the single-scroll decision. Full argument chain (why scroll beats wizard/accordion,
why cross-step validation doesn't apply, why no Review step) is in PROJECT_DECISIONS.md.

One conclusion (the Request format decision) originated as an external hypothesis from an
out-of-repository ChatGPT research thread predating this project's STRAT/IMPL workflow; it was
independently re-verified against PRD/FS text in-session (checked for conflicts with FS §4.4/§4.5)
before acceptance, and an unverifiable claim in the external material ("most valuable upload
category" — not supported by any PRD/FS/PROJECT_* text) was identified and dropped from the
recorded rationale.

**Not yet discussed this session:** Success, Location, Preparation, Aftercare page blueprints.

**Process notes:** two workflow-friction observations from this session (mid-session persistence
expectations; checking existing repo code before proposing UX patterns) were logged to
AI_FRAMEWORK_IDEAS.md and have already been resolved by a separate META session during this same
session — see the two "2026-07-13" META entries below for the actual protocol changes
(AI_TASK_PROTOCOL.md: STRAT Next-Session Brief mid-session-persistence subsection; STRAT Kickoff
Prompt prior-art line).

`pnpm structure` not run — no source/structure change. No `pnpm qg` — docs-only, per established
precedent for documentation-only passes.

---

### 2026-07-13 — META: remaining open journal items closed (out-of-scope findings rule; framework source of truth)

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Closes the last three open items in the
AI_FRAMEWORK_IDEAS.md journal/ideas as of this date:

- **Out-of-scope findings rule** — AI_TASK_PROTOCOL.md (Cross-Session Rules): findings
  discovered mid-task stay out of the diff; product/code → PROJECT_BACKLOG.md, process →
  observations journal, plus a mention in the task report.
- **Framework source of truth (owner decision 2026-07-13)** — no separate framework master
  repository exists yet; `docs/framework/` in this repository IS the master copy, changes are
  committed here synchronously. DOCUMENTATION_SYSTEM_RULES.md updated accordingly: the stale
  "separate master repository" note corrected; framework-doc examples extended with
  AI_TASK_PROTOCOL.md / AI_WORKFLOW_MASTER.md / journal note; the deliberate scope split
  between AI_DEVELOPMENT_WORKFLOW.md (in-session cycle) and AI_TASK_PROTOCOL.md (session
  organization) cross-referenced.
- **"Implementation plans as executable step sequences" idea** — marked effectively adopted
  via the task-file convention (one file per task with Goal/Scope/Workflow/Acceptance
  Criteria).

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — META: two STRAT-session observations resolved (mid-session persistence; prior-art check)

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Both observations were recorded in
AI_FRAMEWORK_IDEAS.md by a Stage 6 STRAT session and are now marked resolved there.

Changes, both in AI_TASK_PROTOCOL.md:

- **Mid-session persistence** (new subsection under STRAT Next-Session Brief): persistence
  gates the session's END, not every internal step — a live session may discuss several
  sub-topics before writing anything down, and a persistence checkpoint does not close the
  session. Recommended (not mandatory) checkpoint triggers: a decision worth protecting,
  context grown long (summarization risk), scope a parallel session might touch. Confirms the
  owner's reading of the existing "must end by persisting" rule; CLAUDE.md unchanged.
- **STRAT Kickoff Prompt — prior-art line**: existing code is strategic context too — before
  presenting options on any sub-topic, search the repository for prior art; never propose from
  general knowledge what the repo may already implement. Root cause: a STRAT session proposed
  generic mobile-navigation patterns while `src/shared/ui/app-nav.tsx` already implemented one,
  because the kickoff's context list was doc-only.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — META: STRAT continuation note unified into STRAT Next-Session Brief

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied). Supersedes the "STRAT Continuation (unfinished topic)"
design from the entry immediately below (same day). Note: an earlier report that this
unification had been applied came from an agent without write access and never landed — the
change was re-applied for real in this pass and verified by reading the file back (recorded as
a workflow observation in AI_FRAMEWORK_IDEAS.md).

Changes, all in AI_TASK_PROTOCOL.md:

- **STRAT Continuation (unfinished topic)** section replaced by **STRAT Next-Session Brief**:
  every STRAT session (no finished/unfinished branch) ends by overwriting the per-stage brief
  `docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md` — one fixed name per stage, not
  versioned/appended; history via `git log` on the file, so every brief version must reach a
  commit: proposed immediately after writing, committed (with owner approval) before the next
  STRAT session. Contents (pointers, not prose): one-line session summary; Decided
  (pointers to PROJECT_DECISIONS.md/STAGE_LOG entries); Open questions; task files ready vs
  draft; Next topic (same-topic continuation or a new one from PROJECT_STAGE_LOG.md/
  PROJECT_BACKLOG.md). Fail-fast kept: expected brief missing (stage not new) → stop and ask.
  Stage strategy genuinely finished → brief moves to `tasks/done/`.
- **STRAT Kickoff Prompt** rewritten to match: the brief is the topic and pickup point (no
  per-session Topic writing by the owner); first STRAT session on a new stage with no brief →
  stop and ask for the first topic, never invent; session-settings line added (model tier,
  Plan mode, title); closing duty now unconditionally includes writing the brief and
  immediately proposing its commit.
- Cross-Session Rules and the Session Settings Guidance fork bullet updated to reference the
  brief.
- **CLAUDE.md (Workflow)** — universal commit rule added, owner-requested: commits ONLY with
  explicit, manual owner approval, no exceptions — every session type, subagents, and
  automated/scheduled sessions; no doc may override; "commit immediately" in any doc means
  "propose the commit immediately". This resolved the conflict with the brief's original
  immediate-commit wording (rephrased in AI_TASK_PROTOCOL.md the same pass). Technical
  enforcement added alongside the doc rule: new project `.claude/settings.json` with
  permission `ask` rules for `git commit`/`git push` (Bash and PowerShell tools), so any
  agent — including automated sessions — hits a manual permission prompt before committing.

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-13 — META: STRAT continuation note convention (unfinished strategic topics)

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied).

Follow-up in the same META role: closed the STRAT-continuity gap — a strategic session that
must end with its topic unfinished (long context, natural stopping point) had no handoff duty,
and the next STRAT session had no defined pickup point (clean topic close was already covered
by the STRAT Kickoff Prompt). Changes, all in AI_TASK_PROTOCOL.md:

- new **STRAT Continuation (unfinished topic)** section: per-stage continuation note at
  `docs/project/tasks/STAGE_<stage>_STRAT_CONTINUATION.md` (at most one per stage) holding
  pointers only — Decided (pointers to PROJECT_DECISIONS.md/STAGE_LOG entries, never restated),
  Open questions, task files `ready` vs `draft` (ideas concrete enough to file become `draft`
  task files, not note text), optional next step; finished-stage notes move to `tasks/done/`
- **STRAT Kickoff Prompt** extended: read the continuation note if it exists; Topic may be
  "continue from the STRAT continuation note"; closing an unfinished topic requires
  writing/updating the note; fallback rule — Topic says "continue" but no note exists →
  fail-fast, stop and ask the owner (stale kickoff vs failed persistence duty)
- **Session Settings Guidance**: forking clarified as not a continuation mechanism (inherits
  the full parent transcript — same context weight); fresh session + docs is the continuation
  path

Observation recorded and resolved in AI_FRAMEWORK_IDEAS.md — Workflow Observations.
`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-12 — META: AI_TASK_PROTOCOL.md review + STRAT kickoff prompt

Status: Completed. Documentation-only — no source code changed. Owner-approved in-session
(framework docs change rule satisfied).

First META session in the AI Workflow Master role (AI_WORKFLOW_MASTER.md). Reviewed
AI_TASK_PROTOCOL.md and AI_WORKFLOW_MASTER.md for gaps; findings recorded in
AI_FRAMEWORK_IDEAS.md — Workflow Observations (six resolved in this pass, two left open:
out-of-scope-findings destination rule; DOCUMENTATION_SYSTEM_RULES.md staleness — master-copy
fix). Changes applied to AI_TASK_PROTOCOL.md:

- new **STRAT Kickoff Prompt** section (symmetric to the META kickoff): Pre-task Sync + stage
  Source of Truth, topic/expected outcome, 3–5-line understanding confirmation, mandatory
  persistence of outcomes into docs with a final created/updated-files list
- **Lifecycle**: transition owners (`draft → ready` — developer; `ready → in progress` and
  `in progress → done` — executing IMPL session) and a new `superseded` status for
  cancelled/replaced tasks (reason + replacement pointer, moved to `tasks/done/`)
- **Task Files naming**: `<stage>` includes the sub-stage (`STAGE_6A_TASK_01_<slug>.md`)
- new **Cross-Session Rules** section: any session records workflow friction as a one-line
  journal entry; shared docs (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md) allow at most one
  writing session at a time
- **Session Settings Guidance**: usage-limits bullet added (fixes the dangling
  AI_WORKFLOW_MASTER.md Mandate 4 reference)

`pnpm structure` run; no `pnpm qg` — docs-only.

---

### 2026-07-12 — AI task protocol and stage task template introduced

Status: Completed. Documentation-only — no source code changed.

To support the split into strategic (`STRAT:`) and implementation (`IMPL:`) AI sessions, two
workflow documents were added, plus a CLAUDE.md rule:

- `docs/framework/AI_TASK_PROTOCOL.md` — session types (strategic / implementation / meta),
  task-file convention (`docs/project/tasks/`, one file per task,
  `STAGE_<stage>_TASK_<NN>_<slug>.md`), lifecycle (`draft → ready → in progress → done`, completed
  files move to `docs/project/tasks/done/`, never deleted), and session-settings guidance
  (model tier, permission mode, when to start a new session).
- `docs/project/tasks/STAGE_TASK_TEMPLATE.md` — the reusable skeleton copied for every stage /
  sub-stage task: Status, How to run (session settings), Context (Pre-task Sync + stage Source of
  Truth + task-specific docs), Goal, Scope, Out of Scope, enforced workflow (inspect → plan →
  explicit approval → implement → Review Pipeline → report risks; stop and request a PRD/FS
  update if product behavior must change), Acceptance Criteria, Reporting.
- CLAUDE.md — new "Task Files & Session Types" section: a referenced task file is the scope
  boundary; strategic sessions must persist outcomes into docs, not chat-only conclusions.
- `docs/framework/AI_WORKFLOW_MASTER.md` — the standing "AI Workflow Master" role for `META:`
  sessions (process ownership, mandate, working loop, kickoff prompt); observations journal
  lives in AI_FRAMEWORK_IDEAS.md, which was normalized to its own declared idea format and
  extended with a "Workflow Observations (META journal)" section.

Approved by the owner in-session (framework docs change rule satisfied). `pnpm structure` run;
no `pnpm qg` — docs-only.

---

### 2026-07-12 — Stage 6 product documentation integrated (PRD + Functional Specification become Source of Truth)

Status: Completed. Documentation-only pass — no source code, tests, dependencies, configuration,
environment files, or deployment settings were changed.

Two new Stage 6 documents (added to `docs/project/` by the owner) were integrated into the
project documentation as the official Stage 6 Source of Truth:

- **`STAGE_6_PRODUCT_DEFINITION.md` (PRD, v1.0, Approved)** — the authoritative **product**
  document: product context/vision/goals, customer journey, product principles, Stage 6
  Non-Goals, Future Scope, Owner Decisions D1–D10, and change control (PRD §9).
- **`STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS, v1.0, Approved for implementation)** — the
  authoritative **implementation** document for the public website: navigation/CTAs, page
  responsibilities, field-level Request flow, states/failure behavior, content rules, normative
  copy (Appendix A), acceptance criteria (FS §6).

Rules now recorded across the documentation set: all future Stage 6 work follows these two
documents; product behavior changes require updating the PRD/FS first; precedence on conflict is
PRD > FS > older Stage 6 planning text in PROJECT_* docs; engineers escalate open product
questions instead of resolving them in implementation (FS §1).

**Documents updated in this pass:**

- **PROJECT_IMPLEMENTATION_PLAN.md** — Stage 6 section rewritten: new Source of Truth block; the
  previously duplicated Stage 6 task list replaced (superseded by the PRD/FS); items that remain
  in Stage 6 but outside the FS's public-website scope kept explicitly (admin/mobile polish incl.
  the image-viewer device QA and two-column-list candidate, public error & 404 UX, favicon/OG/SEO
  basics, design-system/a11y refinement); exit criteria now include FS §6. Also: the Stage 5
  "Stage 6 is next" note now points at the PRD/FS; Post-Launch Roadmap — File Upload UX:
  thumbnails and per-file progress marked absorbed into Stage 6 (FS §4.3); Other Planned
  Improvements: budget-range/willingness-to-wait and FAQ-accordion items annotated as requiring a
  PRD/FS change first.
- **PROJECT_CONTEXT.md** — Stage 6 note added at the top of MVP Features: the PRD/FS supersede
  the Public Surface / Request Form sections for Stage 6 (those remain as the Stages 0–5
  historical record); Success Criteria now reference FS §6 for public-website completeness.
- **PROJECT_DECISIONS.md** — new "Stage 6 Product Documentation Authority" section (authority,
  rules, precedence, admin-side boundary, relationship to earlier decisions); Reference Code
  Decision annotated: FS §4.6 defines the Stage 6 reference-code format (6-char uppercase
  alphanumeric excluding O/0/I/1), superseding `REQ-YYYY-NNNN` for Stage 6 implementation, with
  the migration path for existing codes left as a to-be-recorded Stage 6 implementation decision.
- **PROJECT_BACKLOG.md** — UX / Product Improvements items absorbed by the PRD/FS struck through
  with pointers (FAQ accordion → FS §5; Not-a-Fit → PRD D7/FS §3.2; Home positioning → FS §3.1;
  price framing → PRD D8; client expectations → FS §3.2; curated gallery → FS §3.1 Featured
  Work); Request Form Improvements now defer to the FS §4.2 field model and its field-inclusion
  rule; public error & 404 UX entry notes the FS does not cover it (remains a Stage 6 plan item);
  the duplicate-file-selection item notes FS §4.3–§4.5 governs any `FileUploadInput` rework.
- **PROJECT_ARCHITECTURE.md** — Client component description annotated: current public page set
  is the Stages 0–5 shipped state; the Stage 6 target page set/navigation is defined in FS §2–§3.
- **PROJECT_STAGE_LOG.md** — Current Stage header switched to Stage 6 (current, planning
  documentation integrated; implementation not started); Current focus updated; this entry added.
- **PROJECT_PRODUCTION_READINESS.md** — reviewed, no change needed: its Stage 6 references are
  timing/manual-QA pointers, not duplicated Stage 6 planning text.

**Known divergences deliberately recorded, not resolved here (implementation work, not
documentation defects):** the shipped Stages 0–5 public site differs from the FS target — e.g.
required vs optional uploads (2 required groups now vs 3 optional categories), contact model
("at least one of email/phone/other" + budget field vs single contact-method select, no budget),
consent-to-policies checkbox vs eligibility confirmation, idea length 10–2000 vs 20–1000, name
2–30 vs 2–80, aftercare page combining preparation content vs separate Preparation/Aftercare
pages, in-place success state vs dedicated Success page with redirect semantics, `REQ-YYYY-NNNN`
vs FS §4.6 code format, and FS §4.5 abuse mitigation not yet existing. These are the Stage 6
implementation gap by definition; the FS governs the target state.

`pnpm structure` run (no change — docs-only). No `pnpm qg` — no source file touched, consistent
with prior docs-only entries. Nothing committed.

---

### 2026-07-10 — Stage 5D closed: Full Application Maturity Audit + Targeted Fix Passes complete

Status: Stage 5D formally closed. Documentation-only entry — no application code, tests,
dependencies, configuration, environment files, dashboards, migrations, or deployment settings
were changed in this closure pass.

**Process (per PROJECT_IMPLEMENTATION_PLAN.md — Stage 5D audit method and exit criteria):**

- 2026-07-08 — primary read-only full-application maturity audit (findings F1–F15), plus
  independent second-opinion findings (independent/Fable audit) — both reconciled together
- 2026-07-08 — Fix Pass 1 (public submit correctness + small hardening), committed as `9bc8e6f`
- 2026-07-09 — read-only reconciliation of every remaining finding against the post-Fix-Pass-1
  code, producing the approved Fix Pass 2 scope
- 2026-07-09/10 — Fix Pass 2 (small correctness/consistency/tests + deferred-findings
  documentation), committed as `043bcb7`
- 2026-07-10 — independent read-only closure verification (fresh-session agent, no access to prior
  audit reports, verified against the repository and docs directly): verdict
  `STAGE_5D_READY_TO_CLOSE`, all ten approved fixes confirmed present and correct with file-level
  evidence, no blockers, commit scopes clean, classification judged honest

**Fixed (across both passes — see the two dated Fix Pass entries below for full detail):**
validated `validation.data` persistence in the public submit route; safe outer-catch submit
logging; max-length validation with visible field errors (including three fields that never
displayed errors at all); UI→BFF import-direction violation resolved via `src/shared/api`;
`server-only` guards; three unused production dependencies removed; UUID validation in the admin
status action; storage-cleanup duplication removed (`cleanupRequestFiles`); dead
`config.supabase.publishableKey` removed; `import/no-internal-modules` raised to `error`;
`getRequestOrigin()` and first Server Action tests added (230 → 239 tests).

**Deferred — deliberately tracked, remain open after closure (PROJECT_BACKLOG.md, each with
rationale and timing):** OAuth locale-query redirect redesign (pre-launch / before locale
expansion); auth callback route edge-branch tests (pre-launch); generated Supabase DB types
(pre-launch owner decision); orphaned Storage objects + absence of a reconciliation mechanism
(post-launch/operational); public error & 404 UX (Stage 6).

**Rejected / no action — with recorded rationale:** raw UUID storage paths in server-side
upload-failure logs (PROJECT_DECISIONS.md — Storage Upload-Failure Log Decision); `/admin`
redirect page auth re-check (covered by the `(protected)` layout gate); duplicated local
`isRequestStatus` guard; trailing-slash `localePath` test. These are deliberate, reviewed
acceptances, not oversights — consistent with Stage 5D's stated goal of deliberate, reviewed debt
rather than zero debt.

**Explicit non-claims — closing Stage 5D does NOT mean:**

- public-launch readiness
- production-environment readiness (domain, custom SMTP, backups/PITR, monitoring, and
  staging/production separation remain undone — PROJECT_PRODUCTION_READINESS.md)
- CI or staging completion (no remote CI exists; deferred per the Stage 5C decision)
- closure of any pre-launch DevOps work or any other open item in
  PROJECT_PRODUCTION_READINESS.md — those close only when explicitly resolved there
- security hardening beyond what Stages 5A–5D actually verified and recorded

**Stage 6 (visual/product polish) is unblocked** and begins from this documented, reviewed
baseline. `pnpm structure` run; no `pnpm qg` — docs-only pass, no source file touched.

---

### 2026-07-09 — Stage 5D Fix Pass 2: Small Correctness, Consistency, Tests, Deferred-Findings Documentation

Status: Completed. Narrow, approved fix pass following the 2026-07-09 read-only reconciliation of
all remaining Stage 5D audit findings (primary F1–F15 + independent/Fable findings) against the
post-Fix-Pass-1 code. Six implementation tasks plus a deferred-findings documentation pass.
Reviewed by the owner and committed as `043bcb7` (2026-07-10); the "No commit made" wording at the
end of this entry reflects the session in which it was written, before that commit.

**1. UUID validation in `updateRequestStatusAction`.** `requests/[id]/actions.ts` passed
`requestId` (arbitrary route input) straight to `updateRequestStatusForStudio`, so a non-UUID value
reached Postgres, threw, and was logged as an infrastructure `error`/`unknown` instead of being
rejected as expected bad input. Now validated with the existing `isUuid` from `@/shared/utils`
(same guard the detail page already uses) immediately after the auth check: an invalid id returns
the existing not-found result (`requestStatusUpdateNotFound` — same response as a missing/
cross-studio request, no new user-visible behavior) and logs `console.warn` with reason
`invalid_request_id`, deliberately without the raw `requestId` value. New test file
`app/[locale]/(admin)/admin/(protected)/requests/[id]/__tests__/actions.test.ts` (4 tests:
invalid id returns not-found without touching the service layer; the warning never contains the
raw id; a near-miss malformed UUID is rejected before the status check; a valid UUID still passes
through and succeeds). **Precedent note:** this is the codebase's first Server Action test and it
mocks `next/headers`/`next/cache`/`next-intl/server` — a deliberate, owner-approved extension of
the Stage 4B.6 "don't mock Next internals" precedent, made because the UUID guard lives in the
action itself and is untestable otherwise. The pattern is available for the deferred auth-callback
route tests (see PROJECT_BACKLOG.md — Auth Callback Route Edge-Branch Tests).

**2. Removed request-upload cleanup duplication (audit finding F1).** `app/api/request/route.ts`'s
local `cleanupStorageFiles` duplicated `services/storage.ts`'s private `cleanupFiles` (same
best-effort semantics, count-only initial log line, error/success logging). The storage helper is
now exported as `cleanupRequestFiles` (renamed to match the module's `uploadRequestFiles`/
`createSignedRequestFileUrl` naming; re-exported from `src/services/index.ts`) and the route's
local copy is deleted — the route also no longer imports `supabase`/`BUCKET` at all. Log prefix
for DB-failure cleanup changes from `[route]` to `[storage]`; behavior (best-effort, never throws,
no paths in the initial line, no client/DTO exposure) is unchanged. `route.test.ts` now mocks
`cleanupRequestFiles` instead of reaching through a mocked `supabase.storage` object, and both DB-
failure paths (unique-violation race and non-unique error) now assert cleanup receives the exact
uploaded paths.

**3. Removed dead config field (audit finding F10).** `config.supabase.publishableKey` in
`src/config/index.ts` had zero readers — its only intended consumer, `services/supabaseAuth.ts`,
reads `SUPABASE_PUBLISHABLE_KEY` from env directly (by design, to stay importable from middleware
without pulling in service-role config). Removed the field; the env var itself remains required
and documented in `.env.example` (inspected — still accurate, no change needed).

**4. `import/no-internal-modules` raised from `warn` to `error` (audit finding F6).** One-word
severity change in `eslint.config.mjs`; no allow-list or other rule change. The repo was already
clean under the rule (0 violations), so architectural deep-import drift now fails `pnpm qg`/CI
instead of accumulating as warnings.

**5. Added `getRequestOrigin()` unit tests (audit finding F13).** New
`src/services/__tests__/supabaseAuth.test.ts` (5 tests) covering the security-relevant
host/protocol derivation: forwarded host+proto preferred, https default when proto absent, raw
`host` fallback, http+localhost local-dev shape, and forwarded-host-over-host precedence. Pure
function, no Next/Supabase mocking.

**6. Stale Fix Pass 1 status wording corrected.** The "Current focus" bullet and the 2026-07-08
Fix Pass 1 entry's Status line said "Not committed — the owner will review"; Fix Pass 1 was
committed as `9bc8e6f` on 2026-07-09 after owner review. Both now say so; the historical body of
the entry (including its original "No commit made" verification wording) is preserved as written.

**Deferred-findings documentation pass.** Verified each deferred/rejected reconciliation item is
recorded with accurate timing; PROJECT_BACKLOG.md updated where absent or stale:

- already documented, timing sharpened in place: OAuth locale-query redirect redesign (now
  explicitly pre-launch / before locale expansion, not a 5D fix pass); Supabase generated DB types
  (now explicitly a pre-launch owner-decision item); orphaned Storage objects (now explicitly
  post-launch/operational, including the general absence of a reconciliation mechanism)
- newly documented: public error & 404 UX (root not-found navigation + missing public error
  boundary / `global-error.tsx`) — Stage 6; auth callback route edge-branch tests — pre-launch,
  with the newly established mocking pattern noted
- the backlog's Stage 5D placeholder rule text updated to point at the real entries
- explicit no-action confirmations (not reopened, no code change): raw UUID storage paths in
  server-side upload-failure logs (decision stands — PROJECT_DECISIONS.md, Storage Upload-Failure
  Log Decision); `/admin` redirect page relies on the `(protected)` layout auth gate and exposes
  no data (no redundant re-check added); the tiny duplicated local `isRequestStatus` guard in the
  status action is deliberately left as-is this pass; the trailing-slash `localePath` test is
  deliberately not added this pass.

**Verification:** `pnpm qg` — structure/lint/typecheck/test/build all PASS. Lint: 0 errors under
the now-`error`-level deep-import rule, 1 pre-existing unrelated warning (Stage 4B.5.1 `<img>` LCP
warning in a test file). 239/239 tests pass (was 230; +9: 4 action tests, 5 `getRequestOrigin`
tests). `git diff --check` clean apart from the known repository-wide CRLF noise (no
`.gitattributes`; line-ending policy deliberately untouched this pass). Diff limited to the six
tasks' files plus PROJECT_BACKLOG.md, PROJECT_STRUCTURE.md, PROJECT_DECISIONS.md, this log, and
the auto-generated `docs/files-structure.md`. No commit made.

---

### 2026-07-08 — Stage 5D Fix Pass 1: Public Submit Correctness + Small Hardening

Status: Completed. Narrow, approved fix pass following the Stage 5D primary maturity audit. Seven
tasks, no broad refactor, no Stage 6 UI polish. Reviewed by the owner and committed as `9bc8e6f`
(2026-07-09); the "No commit made" wording at the end of this entry reflects the session in which
it was written, before that commit.

**1. Fixed validated data persistence.** `POST /api/request` (`app/api/request/route.ts`) was
passing the raw `payload` (from `parseRequestFormData`) to `createRequest()`, not
`validation.data` (the Zod-parsed/transformed result) — meaning trims (`clientName`) and
empty-to-`undefined` transforms (`budget`/`email`/`phone`/`contactOther`) were computed by the
schema but silently discarded before reaching the DB. Now uses `validation.data` for all
schema-owned fields (`clientSubmissionId` still comes from `payload`, since it is not part of the
Zod schema). Confirmed `src/services/db.ts`'s `createRequest` already maps `undefined` → `null` via
`params.budget ?? null` (etc.) before the RPC call — so trimmed-to-`undefined` optional fields now
correctly persist as DB `NULL`, as designed. Updated `mockValidateRequestPayload` in
`route.test.ts` to return the real `{ ok: true, data }` success contract, and added a new
regression test asserting `createRequest` receives the transformed `data`, not the raw payload.

**2. Safe logging for unexpected public submit failures.** The outer `catch` in `POST /api/request`
previously logged nothing for exceptions other than `ClientSubmissionIdError`. Added
`console.error("[route] unexpected submit failure:", message)`, logging only the caught error's
`.message` (never the raw request body, files, email, phone, client name, tokens, cookies, or full
payload) — consistent with this file's existing logging pattern. Client response unchanged (generic
`SERVER_ERROR`, no detail). New test asserts both the generic response and that the logged
arguments never contain `clientName`/`email`.

**3. Max-length validation.** Added to `src/features/request/validation/schema.ts`:
`ideaDescription` max 2000, `budget`/`phone`/`contactOther` max 50 each — each with its own stable
`VALIDATION_KEYS` entry (`idea_too_long`, `budget_too_long`, `phone_too_long`,
`contact_other_too_long`) and English i18n message in `en.json`. Also added stable keys/messages
for the pre-existing but previously-unmapped file-count limit (`.max(MAX_FILES_PER_FIELD)` on
`referenceImages`/`placementImages` — confirmed it previously fell through to Zod's default
"too many items" message, unmapped by `MESSAGE_TO_I18N_KEY`, for any direct API client bypassing
the UI's own `FileUploadInput` cap): `reference_images_too_many`, `placement_images_too_many`.
**Found and fixed while wiring this up:** `budget`, `phone`, and `contactOther` `TextInput`s in
`RequestForm.tsx` were never passed an `error` prop at all — no inline validation message could
ever have displayed for these three fields, for any error reason, not just the new max-length
rule. Added `error={err(field)}` to all three, matching every other field in the form. This exposed
a secondary bug: `getFieldError` was mapping `contact_required` (the shared contact-group error,
already rendered once near the contact section heading) to the same message for `contactOther`
individually, which would have duplicated the text on screen the moment `contactOther` became
error-visible. Fixed by making `getFieldError` return `undefined` for `contact_required`
specifically (that reason is exclusively `getContactGroupError`'s responsibility). New tests: 8
schema tests (2000-char boundary, 50-char boundary for all three fields, file-count message keys),
1 `RequestForm` integration test asserting a server-returned `budget_too_long` fieldError renders
its i18n message. Total tests: 230 (was 224 before this task alone; 230 after all 7 tasks).

**4. Resolved UI→BFF import direction.** `RequestForm.tsx` (a Client Component) was importing
`API_ERROR_CODES`/`REQUEST_FIELDS` from `@/bff` — a direct violation of PROJECT_STRUCTURE.md's
"UI must not depend on BFF" rule, since these constants are needed by the client to build submitted
`FormData` and read the response error code. Moved both constants (and their derived
`ApiErrorCode`/`RequestField` types) into a new `src/shared/api/index.ts` module. `src/bff/request.ts`
and `src/bff/validateFiles.ts` now import them from `@/shared/api` instead of owning them;
`src/bff/index.ts` no longer re-exports them (BFF's barrel now only exports what BFF actually owns:
`ClientSubmissionIdError`, `parseRequestFormData`, `validateRequestPayload`, `validateFiles`, and
their types). Updated all consumers (`RequestForm.tsx`, `app/api/request/route.ts`, and 4 test
files) to import from `@/shared/api`. Added `**/shared/api` to `eslint.config.mjs`'s
`import/no-internal-modules` allowlist (same treatment as the existing `**/shared/utils` entry).
Updated PROJECT_STRUCTURE.md: new `shared/api/index.ts` entry, `bff/request.ts`/`bff/validateFiles.ts`
entries note they import (not own) these constants, and the Dependency Direction table now lists
`bff → services, shared, config, types, features/*/validation` (added `shared`).

**5. Added `server-only` guards.** New direct dependency `server-only` (approved by the owner before
adding, per the no-new-dependencies-without-request rule) added to `src/services/supabase.ts` (the
service_role client) and `src/config/index.ts` (holds `SUPABASE_SECRET_KEY`) — both are genuinely
server-only and have zero Client Component importers (confirmed by import-chain inspection before
adding). **Deliberately not added** to `src/services/supabaseAuth.ts`: it is imported by `proxy.ts`
(Next.js Edge Middleware), a non-RSC build target where `server-only`'s `"react-server"` export
condition does not apply — bundling it there would resolve to the throwing `index.js` and break
middleware. Not added to `services/db.ts`/`storage.ts`/`requests.ts`/`auth.ts` either: all of them
import `services/supabase.ts` transitively, which now already throws first if ever pulled into a
client bundle, making a guard on each of them redundant. Verified via `next build` (compiles all 14
routes + middleware cleanly) and the full Vitest suite (230/230 pass) that both new guards do not
break any existing server-side code path.

**6. Removed unused production dependencies.** Confirmed via repo-wide grep (zero matches outside
`package.json` itself) that `class-variance-authority`, `lucide-react`, and `radix-ui` were unused
in `src/`, `app/`, and `scripts/`. Removed via `pnpm remove`; `pnpm-lock.yaml` updated accordingly.
`next build` confirmed the app still compiles and all routes still generate correctly.

**7. Documented the storage log decision.** Added "Storage Upload-Failure Log Decision (Stage 5D
Fix Pass 1)" to PROJECT_DECISIONS.md: server-side Storage upload-failure/cleanup-result logs may
continue to include the raw UUID-based `storagePath` and raw Supabase error message as diagnostic
signal (unchanged from their pre-existing behavior, out of Stage 5B's original logging-fix scope) —
this does not permit storage paths in any UI/client DTO and does not reverse the Stage 5B
cleanup-summary (count-only) hardening.

**Verification:** `pnpm qg` — structure/lint/typecheck/test/build all PASS. Lint: 0 errors, 1
pre-existing unrelated warning (carried over from Stage 4B.5.1, `<img>` LCP warning in a test file).
230/230 tests pass (was 224 before this pass; +6 net new: 1 route regression test, 1 route
safe-logging test, 8 schema/RequestForm max-length tests, minus 3 pre-existing tests unaffected —
exact delta driven by the new tests listed in tasks 1–3 above). Build succeeds, same 14-route table.
`git diff`/`git status` confirmed changes are limited to the 7 approved tasks' files (route.ts and
its test, bff/request.ts, bff/validateFiles.ts, bff/index.ts, the new shared/api module, the request
feature's schema/validationKeys/errors/RequestForm/tests, services/supabase.ts, config/index.ts,
eslint.config.mjs, package.json/pnpm-lock.yaml, en.json, PROJECT_STRUCTURE.md,
PROJECT_DECISIONS.md) plus this log entry and the auto-generated `docs/files-structure.md`. No
commit made.

---

### 2026-07-08 — DevOps/Environment Direction documented (follow-up to DevOps/workflow audit)

Status: Completed (documentation only). No application code, package scripts, Husky hooks, GitHub
Actions, Vercel/Supabase/Google dashboards, secrets, environment variables, or deployment
configuration were changed.

Follows the same-day read-only DevOps/workflow planning audit. Records the agreed decisions in
PROJECT_DECISIONS.md (new Stage 5C Section D) and PROJECT_PRODUCTION_READINESS.md (Environment
Separation, CI/CD sections updated in place):

- the current controlled-test Supabase project/Vercel deployment is designated to become the
  future **staging** environment (not yet converted); a new, clean **production** environment must
  be created before real client requests are accepted
- separate Supabase projects for staging and production is the approved model; one-project/
  multiple-schema separation is explicitly not approved, since Supabase Auth/Storage/Realtime are
  project-wide, not schema-scoped
- target release flow after launch: feature branch/PR → Preview → stable staging deployment →
  manual smoke/QA → production deploy only after staging verification → production smoke check —
  exact branch names, Vercel alias mechanism, and Redirect URL wildcard syntax deliberately left
  undecided until implementation
- CI/CD direction reaffirmed: smallest possible remote CI check (`pnpm qg`) before public launch;
  Vercel Git integration remains the only deploy mechanism; migration promotion stays manual
  (staging first, verify, then production)
- explicit pending list carried forward: stable staging URL mechanism, OAuth/locale redirect
  redesign (see PROJECT_BACKLOG.md — OAuth Locale-Query Redirect Allowlist Design Debt), Supabase/
  Vercel plan capabilities and pricing, CI Node version policy, written migration promotion
  checklist, staging seed-data approach, production domain/custom SMTP/backups-PITR/monitoring
  posture
- multi-studio/custom-domain note reaffirmed as out of current MVP scope; the existing
  `DEPLOYMENT_STUDIO_ID` config-isolation constraint is preserved unchanged

No conflict found with existing documentation — this pass sharpens the already-recorded Stage 5C
Sections A–C target direction into decided specifics; it does not reverse or contradict them.

`pnpm structure` run — no change to `docs/files-structure.md` (docs-only pass, no source file
touched). `git status` confirmed only documentation files modified; nothing committed, per
instruction.

---

### 2026-07-08 — Stage 5C — closed: real-infrastructure / manual E2E verification complete

Status: Stage 5C closed. This entry consolidates and closes the three dated 2026-07-08 entries
below (deployment findings, locale-prefix fix, DevOps/workflow audit) — it does not repeat their
detail, only records the closure decision and its exact meaning.

**What Stage 5C closure means:**

- Real Vercel deployment and real Supabase infrastructure were manually exercised end-to-end and
  verified working — see the "Verified" list below.
- This is real-infrastructure/manual-E2E-verification completion, **not** public-launch readiness.
- This does **not** mean production-environment setup is complete (see
  PROJECT_PRODUCTION_READINESS.md — Production Environment Setup: domain, custom SMTP, backups/
  PITR, monitoring, and staging/production separation remain undone).
- Closing 5C does **not** close any pre-launch checklist item in PROJECT_PRODUCTION_READINESS.md —
  those remain open until explicitly resolved there.
- Hands off to a DevOps/workflow decision block (git-flow, CI/CD trigger, staging/production
  split — already framed in PROJECT_DECISIONS.md, Stage 5C Deployment Workflow and Environment
  Decisions), then to **Stage 5D — Full Application Maturity Audit**, which has not started.
- **Stage 6 must not begin until Stage 5D is complete.**

**Verified (manually, against the live Vercel/Supabase deployment):**

- Vercel deployment exists and was tested; public request submission works end-to-end
  (form → BFF → Storage upload → DB persistence)
- admin list/detail render correctly; signed image URLs load
- status update persists and is visible after navigation
- email/password admin auth works; protected routes behave correctly (redirect/unauthorized/
  authorized)
- password reset works on Vercel, after the Supabase Site URL update
- Google OAuth works on Vercel for both an authorized and an unauthorized account
- Google OAuth works locally after adding the exact query-bearing Redirect URL
  (`http://localhost:3000/auth/callback?locale=en`)
- local password reset works after adding the exact query-bearing Redirect URL
  (`http://localhost:3000/auth/reset-callback?locale=en`)
- the locale-prefix routing fix (see the dated entry below) was committed and verified both
  locally and on Vercel: `/admin/requests` → `/en/admin/requests`; `/foo/bar` → `/en/foo/bar`;
  `/en/admin/requests` does not double-prefix
- the current Supabase project still contains test data; cleanup is intentionally not required to
  close 5C, since this remains a controlled test environment, not real production data (unchanged
  posture since Stage 5A)

**Known observations / explicitly deferred, not resolved by this closure:**

- deployed interactions felt slower than local dev; no timeout or error was measured — kept as an
  observation only, not a performance bug (see PROJECT_PRODUCTION_READINESS.md — Performance
  Validation, still open)
- the OAuth/reset locale-query Redirect-URL workaround works but is architectural debt before
  future `ru`/`he` locale expansion (see PROJECT_BACKLOG.md — OAuth Locale-Query Redirect Allowlist
  Design Debt)
- no public-production-readiness claim is made
- no real staging/production environment split exists yet
- no custom SMTP configured
- no production domain configured
- no backups/PITR posture confirmed
- no external monitoring configured
- no physical mobile-device viewer QA performed
- git-flow / CI/CD / staging-production design is deferred to the next DevOps/workflow decision
  block (see PROJECT_DECISIONS.md, Stage 5C Deployment Workflow and Environment Decisions)
- **Stage 5D (Full Application Maturity Audit) remains the next required stage before Stage 6
  begins — not started**

No source code, tests, configs, dependencies, migrations, env files, or Vercel/Supabase/Google
settings were changed in this documentation pass. No `pnpm qg` run — docs-only.

---

### 2026-07-08 — Stage 5C — DevOps/workflow read-only audit closure

Status: Completed (audit + documentation only). No application code, package scripts, Husky
hooks, GitHub/Vercel/Supabase settings, secrets, environment variables, or deployment
configuration were changed in this pass.

**Verified facts:**

- `pnpm qg` runs `structure`, `lint`, `typecheck`, `test`, and `build`, in that order (unchanged
  from prior entries).
- `.husky/pre-commit` runs `lint` and `typecheck` only — a documented subset of `qg`, not the full
  gate. This gap is accepted, not fixed, in this pass.
- No GitHub Actions workflow or other remote CI configuration exists in this repository
  (confirmed: no `.github/` directory). No `vercel.json` exists either — Vercel project
  configuration (build settings, Node.js Version, env vars) is dashboard-managed only and not
  visible from the repo.
- **Vercel Project → Node.js Version was manually checked in the Vercel dashboard and confirmed as
  `24.x`.** This is newer than the `>=20` floor declared in `package.json`'s `engines` field
  (added Stage 5B, 2026-07-06) — the floor is satisfied, but the actual deployed runtime (24.x) is
  not the same version documented as "the check still outstanding" in earlier entries this same
  day. Recorded here as the first real confirmation of this previously-outstanding item; no
  `package.json`/`engines` change was made in this pass since a floor (not an exact pin) is still
  the intended check per Stage 5B decisions.
- The current Vercel deployment (from `main`, live since 2026-07-08) remains controlled
  test/verification usage, not public production — unchanged from the Stage 5C Deployment
  Workflow and Environment Decisions (PROJECT_DECISIONS.md, Section C).

**Decision reaffirmed (no new decision made — existing Stage 5C Section B decision confirmed
still in force):**

- Do not add a GitHub Actions workflow or change the pre-commit hook scope at this time.
- Revisit remote CI before public launch, or whenever collaboration/PR volume makes local-only
  `pnpm qg` discipline unreliable (e.g. a second contributor) — whichever comes first.

**Explicitly still pending, not marked complete by this entry:** staging/production Supabase and
Vercel environment separation, and the auth/i18n redirect redesign for locale-query-bearing
`redirectTo` URLs (see PROJECT_STAGE_LOG.md, 2026-07-08 OAuth locale-query entry above) — both
remain open pre-launch items, unchanged.

No `pnpm qg` run in this session — no `src/`/`app/`/test/migration/config file was touched; this
was a read-only audit plus documentation update only. `git status` confirmed only `README.md` and
`PROJECT_STAGE_LOG.md` modified.

---

### 2026-07-08 — Stage 5C — Locale-prefix redirect audit + targeted fix

Status: Completed. Narrow routing bug fix in `proxy.ts` plus focused unit tests; no change to
supported locales, default locale, route structure, auth logic, Supabase/Google/Vercel settings,
env vars, or dependencies.

**Root cause.** `proxy.ts`'s no-locale-prefix branch computed the redirect target by slicing the
original pathname using `firstSegment.length + 1` — this happened to equal the length of
`/${firstSegment}` only when the first segment was treated as a value to strip, which is correct
for a locale-swap but wrong here: the first path segment is real path content (e.g. `admin`, `foo`),
not a locale slot, when no valid locale prefix is present. The slice silently dropped that first
segment: `/foo/bar` (`firstSegment = "foo"`, length 3) sliced at index 4 removed `/foo`, leaving
`rest = "/bar"`, redirected to `/en/bar` — losing `foo` entirely. `/admin/requests` was likewise
redirected to `/en/requests`, a route that does not exist under `[locale]`, producing a 404.

**Fix.** Removed the segment-slicing logic entirely. Extracted two pure helpers into
`src/shared/i18n/localePath.ts` (no Next.js server-runtime imports, so they're importable under
Vitest without the `next/server` resolution failure that occurs when importing `proxy.ts`
directly, which transitively pulls in `next-intl/middleware`):

- `hasSupportedLocalePrefix(pathname)` — first-segment membership check against the existing
  `locales` config (unchanged source of truth; `src/shared/i18n/config.ts`, currently `["en"]`) —
  automatically recognizes future locales (`ru`, `he`, ...) once added there, no hardcoding
- `withDefaultLocalePrefix(pathname)` — prepends `/${defaultLocale}` to the **full, unmodified**
  original pathname; no slicing, no segment replacement

`proxy.ts` now: if `hasSupportedLocalePrefix` is true, delegates to the existing `next-intl`
middleware unchanged (no double-prefixing, since the path already carries a valid locale); if
false (empty path, or any non-locale first segment, including locale-like strings such as `ff` or
`il` that are not in the configured list), redirects to `withDefaultLocalePrefix(pathname)`. Query
string is preserved automatically since only `.pathname` is mutated on the cloned `request.nextUrl`
(`.search` is untouched). The `config.matcher` (`/((?!api|auth|_next|_vercel|.*\..*).*)`) was not
changed — `/api/*`, `/auth/*` (including `/auth/callback`, `/auth/reset-callback`), `/_next/*`,
`/_vercel/*`, and static assets remain excluded from this middleware exactly as before.

**Tests.** New `src/shared/i18n/__tests__/localePath.test.ts` (8 tests): valid locale prefix
recognized (`/en/foo/bar`, `/en/admin/requests`); missing prefix rejected (`/foo/bar`,
`/admin/requests`, `/`); invalid locale-like segment rejected (`/ff/admin/request`); prefixing
preserves both path segments (`/foo/bar` → `/en/foo/bar`, `/admin/requests` → `/en/admin/requests`,
`/ff/admin/request` → `/en/ff/admin/request`); root path (`/` → `/en/`). Total tests: 221 (was 214).
No test mocks `next/server`/`next-intl` middleware internals, consistent with this codebase's
existing precedent of not mocking Next internals.

**Manual verification** against the local dev server (`pnpm dev`, no Supabase/Google/Vercel
Dashboard change): `/` → `/en` (307); `/foo/bar` → `/en/foo/bar` (307, both segments preserved);
`/admin` → `/en/admin` (307); `/admin/requests` → `/en/admin/requests` (307);
`/admin/requests?page=2` → `/en/admin/requests?page=2` (307, query preserved); `/ff/admin/request`
→ `/en/ff/admin/request` (307); `/en/foo/bar` → no redirect, 404 (route genuinely doesn't exist,
not a routing bug — confirms no double-prefixing); `/en/admin/requests` → redirected to
`/en/admin/login` by the existing (unchanged) auth gate, not by this fix; `/auth/callback` → no
locale redirect, 404 (route requires a real OAuth `code` param — expected, confirms the auth
exclusion still holds).

`pnpm qg` — structure / lint / typecheck / test / build all PASS (lint: 0 errors, 1 pre-existing
unrelated warning carried over from Stage 4B.5.1; 221/221 tests, up from 214; build succeeded,
same 14-route table as before, `proxy.ts` still compiles as the sole Proxy/Middleware entry).

Deferred, not part of this fix's scope: localized 404 page navigation-link improvement (owner
observation, noted in the originating TODO) — carried forward as a Stage 5D/Stage 6 polish item,
not implemented here since it was not naturally touched by this routing fix.

Not committed — the owner will review before any commit.

---

### 2026-07-08 — Stage 5C — Real infrastructure verification: first deployment findings

Status: In progress. Not a Stage 5C closure entry. No application code, tests, migrations, or
dependency changes in this session — deployment configuration, Supabase Auth Dashboard
configuration, and Google Cloud OAuth configuration only, plus this documentation.

**Vercel deployment.**

- First Vercel deployment was made from `main`, not a Preview-branch deployment. This is a real
  deployed environment — it does not by itself mean the application is ready for public launch.
- `package.json` already declares `"engines": { "node": ">=20" }` (Stage 5B, 2026-07-06). Before
  any future deployed E2E run or real release, the Vercel Project's Node.js Version setting must
  still be verified/set to 20+ — not yet independently re-confirmed as part of this session beyond
  the prior engines declaration.
- Vercel environment variables in use are the existing server-side project values: `SUPABASE_URL`,
  `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `DEPLOYMENT_STUDIO_ID`. No
  `NEXT_PUBLIC_SUPABASE_URL` is used by current code, and none should be added without a real code
  need — no such need exists today.

**Supabase Auth URL configuration.**

- Supabase Site URL changed from a localhost value to the deployed Vercel URL
  (`https://tattoo-request-app-woad.vercel.app`). This fixed deployed reset-password email
  fallback behavior (the email link previously defaulted to the wrong origin).
- Redirect URLs (the allowlist for explicit `redirectTo` values, distinct from Site URL's role as
  the default/fallback) now include both localhost and deployed callback routes:
  `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/reset-callback`,
  `https://tattoo-request-app-woad.vercel.app/auth/callback`,
  `https://tattoo-request-app-woad.vercel.app/auth/reset-callback`. Local development continues to
  work via the localhost entries.

**Deployed E2E findings — verified against the live Vercel deployment:**

- public request submission (form → BFF → Storage → DB) works
- uploads/Storage/DB persistence/admin list/admin detail/signed image URLs/status update all work
- email/password admin auth works
- protected admin route behavior (redirect/unauthorized/authorized) works
- password reset works end-to-end, after the Site URL change above
- Google OAuth works for both an authorized Google account (existing `studio_members` row) and an
  unauthorized one (no row — correctly denied)

**Observation, not a confirmed finding:** deployed interactions felt noticeably slower than local
dev. No timeout or error was observed. This is recorded as an observation only — possible
contributing factors include Vercel cold starts and region distance from the Supabase project, but
no measurement was taken and no performance claim is made. See
PROJECT_PRODUCTION_READINESS.md — Performance Validation for the pre-existing measurement
requirement this observation feeds into; it does not satisfy that requirement.

**Still pending, explicitly not resolved by this entry:**

- local reset-password re-verification, blocked on Supabase's built-in email provider rate-limit
  window from repeated testing (see PROJECT_PRODUCTION_READINESS.md — Email Delivery)
- final written Stage 5C E2E result/closure — this entry is a findings record, not a closure
- the active locale-routing TODO is being handled separately and must not be read as resolved here

**Google OAuth cleanup and current state.**

- A dedicated Google Cloud project (`Tattoo Request App`) now exists, containing exactly one
  intended OAuth Web Client (`Supabase Auth`), whose authorized redirect URI is the Supabase
  callback (`https://<project-ref>.supabase.co/auth/v1/callback`). The new Client ID/Secret were
  saved in the Supabase Google provider configuration. Vercel Google OAuth was manually verified
  working after this change (see Deployed E2E findings above).
- Two older, unrelated Google Cloud projects (`UTI-shop`, `Tann Mann Gaadi Auth`) were deleted by
  the owner after the new OAuth flow was verified working. No claim is made here about
  deletion-recovery windows or any other status of those old projects beyond this factual owner
  action. No secrets or Client IDs are recorded in this document.

**OAuth locale-query technical debt (recorded, not resolved).**

- Local Google OAuth initially fell back incorrectly to the Vercel Site URL. Browser inspection
  confirmed the app actually sends `redirect_to=http://localhost:3000/auth/callback?locale=en`
  (locale is appended as a query param, per the existing 4A.6/4A.7 mechanism).
- Adding that exact query-bearing localhost URL to Supabase Redirect URLs made local OAuth work
  again — a working workaround, verified live, **not the desired long-term design**:
  - Supabase's Redirect URL allowlist matches full URLs, including the query string, so it should
    not require one allowlisted entry per locale query value
  - future `ru`/`he` locale expansion should not require manually adding
    `...auth/callback?locale=ru`, `...auth/callback?locale=he`, etc. to the allowlist one at a time
  - a deliberate auth/i18n redirect design cleanup is needed before locale expansion, or this
    should be explicitly scoped into Stage 5D or a later stage
- No eventual solution is invented or chosen here. This is recorded as an open architectural
  finding with a working interim workaround — not resolved, not scheduled to a specific sub-stage
  yet beyond the general Stage 5D candidacy noted above.

No `pnpm qg` run in this session — no `src/`/`app/`/test/migration file was touched; all changes
were Vercel/Supabase Dashboard/Google Cloud configuration, verified live. `git status`: clean, no
repository file modified prior to this documentation pass.

---

### 2026-07-06 — Stage 5B — Dependency security remediation

Status: Completed. Narrow `pnpm` version bumps of exactly three direct dependencies, approved by
the owner following a read-only dependency-security audit performed earlier the same day (98
`pnpm audit` advisories found: 1 critical, 36 high, 51 moderate, 11 low). No source-code, route,
Supabase, env-var, CI, or migration change.

Updated (via `pnpm add`, no `--latest`, no major-version jump for any package):

- `next`: `16.1.6` → `16.2.10` (production, direct). Resolves all 19 `next` advisories, including
  high-severity middleware/proxy-bypass, Server Components DoS, SSRF via WebSocket upgrades, and
  CSRF-bypass findings — the only advisories in the prior audit confirmed reachable by the actual
  served app.
- `next-intl`: `4.8.2` → `4.13.1` (production, direct). Resolves all 3 `next-intl` advisories,
  including an open-redirect and a prototype-pollution finding via translation-catalog keys.
- `vitest`: `4.0.18` → `4.1.10` (dev-only, direct). Resolves the sole critical-labeled advisory
  (Vitest UI-server arbitrary file read/execute) — not production-reachable in this project since
  `test:ui` is a manual, developer-invoked, localhost-only script never run in `pnpm qg` or CI, but
  updated anyway since a safe minor fix was available at no cost.

Registry check performed before updating: confirmed `16.2.10`/`4.13.1`/`4.1.10` were each the
latest stable version within the requested minor range (`16.2.x`, `4.x`, `4.1.x` respectively), and
checked peer-dependency declarations for all three target versions plus `eslint-config-next`
(unchanged) — no compatibility conflict found; proceeded without needing to flag a risk.

Diff scope confirmed narrow: `git diff --stat` after the update showed only `package.json` (three
lines: `next`, `next-intl`, `vitest` version fields) and `pnpm-lock.yaml` (130 insertions / 138
deletions). Inspected the lockfile diff directly — every changed entry belonged to one of the three
updated packages themselves (their own platform-specific subpackages, e.g. `@next/swc-*`,
`@next/env`) or their own transitive dependencies (`use-intl`, `icu-minify`,
`@formatjs/intl-localematcher`, `next-intl-swc-plugin-extractor` for next-intl; `@vitest/spy`,
`@vitest/mocker`, `@vitest/runner`, `tinyrainbow`, `std-env`, `es-module-lexer` for vitest). No
unrelated direct dependency (React, TypeScript, ESLint, Vite, shadcn, Supabase, Tailwind) appeared
in the diff, matching the approved scope exactly.

No source-code change was required — `pnpm qg` passed on the first attempt after the bump:
structure (no changes — no structural file was affected by a version bump), lint (0 errors, 1
pre-existing unrelated warning carried over from Stage 4B.5.1), typecheck (clean), test (204/204
passing, unchanged count), build (`next build` succeeded under the new Next 16.2.10, all 14 routes
compiled, same route table as before).

Post-update `pnpm audit --json` re-run and diffed against the pre-update result: advisory count
98 → 75, critical count 1 → 0. Confirmed zero remaining advisories naming `next`, `next-intl`, or
`vitest` as the affected module. The remaining 75 advisories are exactly the same dev-only,
non-production-reachable dependency chains already identified and classified "defer deliberately"
in the read-only audit earlier this session — `shadcn`'s bundled `@modelcontextprotocol/sdk`
(Express/Hono/ajv/qs/path-to-regexp, never executed as a server by this app; 39 advisories),
`eslint`/`eslint-config-next`'s transitive `minimatch`/`ajv`/`flatted`/`js-yaml` (lint-time only,
no external input; 14 advisories), `@vitejs/plugin-react`'s `vite`/`esbuild`/`picomatch`/
`@babel/core` chain (Vite dev-server issues not exposed as a server here; 10 advisories), `jsdom`'s
`undici` chain (test-only; this suite mocks Supabase directly rather than making real network
calls; 11 advisories), and `@tailwindcss/postcss`'s `postcss` (build-time compilation of fixed
local CSS source only; 1 advisory). None of these were touched — remediating them would require
major-version bumps of `eslint`, `vite`, `typescript-eslint`, or `shadcn` itself (the last being
entirely outside this repo's control, since the vulnerable code is bundled inside `shadcn`'s own
dependency tree), both explicitly outside the approved narrow scope for this task.

`git status` after the update: only `package.json` and `pnpm-lock.yaml` modified. Not committed,
per instruction — the owner will review before any commit.

---

### 2026-07-06 — Admin image viewer — fit-to-screen initial sizing + 2x zoom

Status: Completed (code). Manual browser/device verification not performed in this session — the
developer has confirmed they will check this themselves. No server/data/signing/upload/Storage/
Supabase change; no new dependency.

Follow-up to the 2026-07-05 viewer tuning entry below, which was found insufficient: manual testing
showed the small 64×64 test image (`REQ-2026-0010`) gained *some* zoom range but still opened tiny
in the fullscreen viewer — the expected fit-to-screen behavior was missing.

Root cause, confirmed by reading `yet-another-react-lightbox@3.32.0`'s bundled source directly
(`dist/index.js`, `dist/plugins/zoom/index.js`), not assumed: `ImageSlide`'s only sizing output is
an inline style `{ maxWidth: min(imageWidthPx, 100%), maxHeight: min(imageHeightPx, 100%) }` — a
**ceiling**, never a forced size. The 2026-07-05 fix (`slide.width/height = 4096`) correctly raised
this ceiling and, separately, raised the Zoom plugin's own max-zoom-rect calculation (confirmed to
read the identical `Math.max(slide.width, ..., naturalWidth)` value) — but a plain `<img>` with no
`width`/`height` HTML attribute and only a `max-width`/`max-height` CSS cap still renders at its
own intrinsic/natural size when that's smaller than the cap. CSS `max-*` properties cannot force a
replaced element to grow past its natural size; only `ImageSlide`'s inline style existed, and it
never set `width`/`height` as a forced value. Confirmed `carousel.imageFit` (`contain`/`cover`) has
no effect on this — it only controls `object-fit` *within* whatever box the image already occupies,
not the box's size.

Confirmed the correct, officially-typed lever is `carousel.imageProps` (`ImageProps | ((slide) =>
ImageProps)`, documented in `types.d.ts`) — merged **last** into the exact same inline style object
`ImageSlide` builds (`{ ...defaultStyle, ...style, ...imagePropsStyle }`), and passed through
unchanged by the Zoom plugin's `ZoomWrapper` to the underlying `ImageSlide` regardless of zoom
state. Also confirmed the typed `styles` prop's slot list (`SlotType`) has no image-level slot at
all — it cannot target the `<img>` element, ruling it out. No CSS override was needed or used.

Completed (`src/features/admin/ui/RequestImageViewer.tsx`):

- Existing `slide.width/height` ceiling (previously an inline `4096` local, now named
  `VIEWER_IMAGE_MAX_DIMENSION`) kept — confirmed still necessary for the Zoom plugin's max-zoom
  math, not redundant with the new fix; both address different parts of the same underlying clamp
- New `viewerImageProps = { style: { width: "100%", height: "100%" } }` passed via
  `carousel={{ imageFit: "contain", imageProps: viewerImageProps }}` — makes the image fill its
  slide box; `imageFit: "contain"` (unchanged) then preserves aspect ratio with no crop, upscaling
  small images to a useful size (blur on upscale is accepted per the stated policy, not treated as
  a defect)
- `maxZoomPixelRatio` renamed to a named `VIEWER_MAX_ZOOM_PIXEL_RATIO = 2` constant; value
  unchanged — now correctly means "2x from the fitted display size" once initial sizing is fixed,
  confirmed via the Zoom plugin's `useZoomImageRect` (`maxZoom = maxImageRect.width /
  imageRect.width`, where `imageRect` is the already-contain-fitted box)
- All three tuning values/objects consolidated into one named, commented config block above the
  component, explaining the YARL sizing model and why each value exists — avoids unexplained magic
  numbers
- No resolution-based branching anywhere — the same fixed config applies uniformly to every slide,
  small or large; a large real photo's `naturalWidth` already exceeds any reasonable `Math.max`
  comparison here, so behavior for normal-sized photos is unaffected
- Combined slide ordering, signed-URL reuse, unavailable-file exclusion, close/Escape/backdrop
  close, and single-image arrow-hiding are all unchanged
- `src/features/admin/__tests__/RequestImageViewer.test.tsx`: mock `Lightbox` now captures the
  full props object passed to it (via a hoisted ref) so `carousel`/`zoom` config can be asserted
  directly, not just slide content. One new test added: confirms `carousel.imageFit === "contain"`,
  `carousel.imageProps.style === { width: "100%", height: "100%" }`, and
  `zoom.maxZoomPixelRatio === 2` are all passed to `Lightbox`. This is explicitly a config/regression
  assertion, not a claim that jsdom can verify real fit-to-screen rendering — it cannot; that
  requires a real browser. All 7 previously-existing tests unchanged and passing
- Total tests: 204 (was 203) — all pass. `pnpm qg` — structure / lint / typecheck / test / build
  all PASS (lint: 0 errors, 1 pre-existing unrelated warning carried over from Stage 4B.5.1)

**Manual verification required, not performed in this session** (no browser-automation tool
available; developer has confirmed they will verify directly): open `REQ-2026-0010` (tiny 64×64
image) and confirm it now visibly fills most of the available viewer area at open (not tiny),
preserves aspect ratio with no crop, and reaches roughly 2× zoom from that fitted size with working
pan; open `REQ-2026-0007` (real ~1–4 MB photos) and confirm display/zoom/pan/swipe/close are
unaffected and not oddly oversized; confirm the admin detail page's inline (non-viewer) preview is
unchanged; confirm opening the viewer still triggers no new signed-URL request. These checks are
explicitly left to the developer, not claimed as done here.

**Physical mobile-device verification (iPhone Safari, Android Chrome — pinch zoom, pan after zoom,
double tap, swipe, portrait/landscape) remains outstanding, unchanged from Stage 4B.5.1/Stage 6** —
this session made no attempt at it and does not claim it complete. `controller.closeOnPullDown`
remains disabled, still gated on that same physical verification, unchanged by this fix.

---

### 2026-07-05 — Admin image viewer — small-image sizing/zoom tuning

Status: Completed (code). Manual physical-device verification not performed in this session — see
outstanding items below. No server/data/signing/upload/Storage/Supabase change; no new dependency.

Trigger: the Stage 5B.1 smoke-test request (`REQ-2026-0010`) uploaded a genuine, valid, non-blank
64×64 PNG. On the admin detail page's inline preview it rendered fine (natural size within its
card), but opening it in the fullscreen `RequestImageViewer` showed it as a near-invisible tiny
square with effectively no useful zoom. Investigated as a real admin UX gap, not a Storage/signing/
upload defect (confirmed separately in the prior blank-image audit that the file itself was a
correctly uploaded, correctly signed, valid image).

Root cause, found by reading `yet-another-react-lightbox@3.32.0`'s actual bundled source
(`dist/index.js`), not assumed from docs: `ImageSlide` applies an inline
`maxWidth/maxHeight: min(imageWidthPx, 100%)` style, where `imageWidthPx` is
`Math.max(slide.width ?? 0, ...srcSet widths, loaded <img>.naturalWidth)`. With no `width`/`height`
set on the slide object (the case before this fix — `AdminRequestFile` has never carried image
dimensions, per the Stage 4B DTO decisions), YARL falls back to the image's real natural pixel size
as the display ceiling — 64px for this file — regardless of `carousel.imageFit` (`contain` vs
`cover` only changes how the image fills that already-clamped box, not the box size). Confirmed the
Zoom plugin's own max-zoom-rect calculation (`dist/plugins/zoom/index.js`) uses the exact same
`Math.max(slide.width, srcSet widths)` value, multiplied by `maxZoomPixelRatio` — so
`maxZoomPixelRatio` alone, without a `width`/`height` override, would still compute a max zoom
relative to the tiny natural size and stay uselessly small. No dedicated "disable clamp" option
exists in the library; `slide.width`/`height` is the documented, intended lever for this, not a
workaround.

Fix (`src/features/admin/ui/RequestImageViewer.tsx`):

- Every slide now declares a fixed `width: 4096, height: 4096` alongside `src`/`alt`. This is a
  ceiling only, not a forced/real size — per the `Math.max` logic above, a large real photo's
  `naturalWidth` already exceeds this value, so behavior for normal-sized photos is unaffected;
  only genuinely small source images (like the 64×64 fixture) get a materially larger display
  ceiling than their own native pixels
- `carousel={{ imageFit: "contain" }}` set explicitly (this was already the library default — no
  visual change, added only for clarity/intent)
- `zoom={{ maxZoomPixelRatio: 2 }}` added, now meaningful because it multiplies against the new
  `width`/`height` ceiling rather than the tiny natural size
- No per-image resolution branching, no CSS override, no custom gesture/pinch/pan code — the fix
  is one uniform constant applied to every slide identically, small or large
- Combined slide ordering (reference then placement), signed-URL reuse (no new signing on open),
  unavailable-file exclusion, no-crop/natural-aspect-ratio behavior, close button/Escape/backdrop
  close, and single-image arrow-hiding are all unchanged
- `src/features/admin/__tests__/RequestImageViewer.test.tsx`: mock `Lightbox`'s stub now forwards
  `width`/`height` onto the rendered `<img>` so behavior is actually assertable; one new test added
  confirming every slide carries `width="4096" height="4096"`. All 6 existing tests unchanged and
  passing
- Total tests: 203 (was 202) — all pass. `pnpm qg` — structure / lint / typecheck / test / build
  all PASS (lint: 0 errors, 1 pre-existing unrelated warning carried over from Stage 4B.5.1)

**Manual verification required, not performed in this session** (no browser-automation tool
available): open `REQ-2026-0010` (tiny 64×64 image) in the admin viewer and confirm it now opens at
a usefully inspectable size with working zoom/pan; open `REQ-2026-0007` (real ~1–4 MB photos) and
confirm normal display/zoom/swipe/close are unaffected; confirm the admin detail page's inline
(non-viewer) preview images are unchanged; confirm opening the viewer still triggers no new
signed-URL request. These checks were explicitly left to the developer to perform in a real
browser rather than claimed as done here.

**Physical mobile-device verification (iPhone Safari, Android Chrome — pinch zoom, pan after zoom,
double tap, swipe, portrait/landscape) remains outstanding, unchanged from Stage 4B.5.1/Stage 6** —
this session made no attempt at it and does not claim it complete. `controller.closeOnPullDown`
remains disabled, still gated on that same physical verification, unchanged by this fix.

---

### 2026-07-05 — Stage 5B.2 — Storage bucket MIME/size limits

Status: Completed. One Storage-API bucket-config update applied and verified against the live
Supabase project; no RLS/Storage policy, application code, route, dependency, migration, or env
var change.

Preflight (read-only): confirmed `request-images` bucket existed with `public: false` (already
correct) but `file_size_limit: null` and `allowed_mime_types: null` (no restriction configured at
the bucket level — matching the gap identified in Stage 5A.2).

Completed:

- Determined the bucket-config update should go through the Supabase Storage API's
  `updateBucket()` (the same method the Dashboard uses internally), not a raw SQL `UPDATE` on
  `storage.objects`/`storage.buckets` — bucket configuration is Storage-service-managed state, not
  a plain table row safe to hand-edit outside the Storage API's own validation, and not something
  the Supabase CLI's `storage` subcommand (object-level only: `ls`/`cp`/`mv`/`rm`) exposes directly
- Applied via a small, temporary, uncommitted Node script using the existing service-role
  credentials (same pattern as Stage 5A.4/5B.1), removed immediately after use: `updateBucket
  ("request-images", { public: false, fileSizeLimit: 10485760, allowedMimeTypes: ["image/jpeg",
  "image/png", "image/webp", "image/heic", "image/heif"] })`
- Post-change verification (read-only): re-queried `storage.buckets` and confirmed `public: false`
  (unchanged), `file_size_limit: 10485760` (10 MB, exact match), `allowed_mime_types` exactly the
  five target values, in the exact order set — matches `validateFiles`'s existing app-layer
  allow-list with no drift
- **Real smoke test performed:** submitted one real request through the running local dev server's
  public `POST /api/request` route with a genuine non-blank 64×64 generated PNG (~7.8 KB, well
  under the new 10 MB limit) for both required image fields — received
  `{"ok":true,"referenceCode":"REQ-2026-0011"}`. Verified directly (read-only): both
  `request_files` rows persisted with the correct byte size and new-format storage paths; signed
  URLs generated successfully for both files via the same `createSignedRequestFileUrl()` path
  admin uses, both returned HTTP 200 with correct `content-type`/`content-length` matching the
  uploaded file. Visual admin list/detail rendering left to the developer to confirm directly
  in-browser, consistent with the Stage 5B.1 smoke test
- No `pnpm qg` run — no `src/`/`app/`/test file was touched; this change is entirely external
  Supabase Storage configuration, verified directly against the live project instead
- `git status` after the change: clean — no repository file was modified or left behind by the
  temporary script

No RLS policy, Storage RLS policy, application code, route, dependency, migration, or environment
variable was changed. Docs updated: this entry, plus PROJECT_IMPLEMENTATION_PLAN.md and
PROJECT_PRODUCTION_READINESS.md (bucket limits marked configured). Stage 5B overall remains not
complete — only 5B.1 and 5B.2 are done.

---

### 2026-07-05 — Stage 5B.1 — `create_request` search_path hardening

Status: Completed. One narrow schema migration applied and verified against the live Supabase
project; no RLS/Storage policy, application code, route, dependency, env var, or Dashboard change.

Preflight (read-only): confirmed working tree clean; confirmed exactly one `create_request`
overload live, matching the expected 13-argument signature; confirmed `proconfig` was still `null`
(unchanged since Stage 5A.2).

Completed:

- New migration `supabase/migrations/20260705155244_harden_create_request_search_path.sql`:
  `ALTER FUNCTION public.create_request(...) SET search_path = public, pg_temp;` — the narrow
  `ALTER FUNCTION` form was used deliberately instead of `CREATE OR REPLACE FUNCTION`, since it
  touches only `pg_proc.proconfig` and cannot affect the function body, parameters, return type,
  or grants (`proacl`). Migration comment records the rollback SQL (`ALTER FUNCTION ... RESET
  search_path`) inline.
- Applied via `pnpm exec supabase db push` (not the SQL Editor). `pnpm exec supabase migration
  list` confirmed Local = Remote for the new timestamp.
- `pnpm exec supabase db advisors --linked --type security --level info`: the
  `function_search_path_mutable` finding for `create_request` (present in Stage 5A.2) no longer
  appears. Remaining findings are unchanged and already documented as intentional/deferred in
  Stage 5A (`rls_enabled_no_policy` ×4, the Supabase-platform `rls_auto_enable` findings ×2,
  leaked-password-protection).
- Live metadata re-verified after the change: `prosecdef = false` (unchanged, still invoker mode),
  `proconfig = ["search_path=public, pg_temp"]` (new), `EXECUTE` grants unchanged
  (`service_role`/`postgres` only). RLS-enabled state and zero-policy count across all tables and
  `storage.objects` were also re-checked and confirmed unchanged, as a defense-in-depth check since
  this touched the same function inspected during Stage 5A.
- **Real smoke test performed:** submitted one real request through the running local dev server's
  public `POST /api/request` route (via `curl`, one generated 1×1 PNG per required image field) —
  received `{"ok":true,"referenceCode":"REQ-2026-0010"}`. Verified directly in the DB (read-only):
  the row persisted with the correct `studio_id`, 2 linked `request_files` rows, both in the
  current `{studioId}/{clientSubmissionId}/...` storage-path format. Visual confirmation in the
  admin list/detail UI was left to the developer to check directly in-browser rather than
  performed in this session.
- `pnpm qg` — structure / lint / typecheck / test / build all PASS (202/202 tests; lint: 0 errors,
  1 pre-existing unrelated warning carried over from Stage 4B.5.1) — expected, since no
  `src/`/`app/` file was touched by this migration; this run confirms no regression, not that the
  gates were required by the change itself.
- `git status` after the migration file was added: only the new migration file appears; no other
  file was modified.

No RLS policy, Storage policy, application code, route, dependency, or environment variable was
changed. Docs updated: this entry, and PROJECT_IMPLEMENTATION_PLAN.md's Stage 5B task list (item
marked complete). Stage 5B overall remains not complete — only this one sub-item.

---

### 2026-07-05 — Stage 5A — Security / Data-Boundary Planning closed

Status: Completed. Read-only audits, live verification, an owner-approved cleanup, and an
independent review — no application code, tests, routes, dependencies, or Supabase policy/schema
changes. The only mutations performed anywhere in Stage 5A were the explicitly approved 5A.4
deletions described below.

**5A.1 — Repo/security/data-boundary audit (read-only).** Reviewed all migrations under
`supabase/migrations/`, the full service layer (`services/supabase.ts`, `supabaseAuth.ts`,
`auth.ts`, `db.ts`, `storage.ts`, `requests.ts`), the BFF (`bff/request.ts`,
`app/api/request/route.ts`), and every admin route/action. Confirmed: the browser never accesses
Supabase DB or Storage directly; the public request route is fully BFF/service-role mediated;
every admin entry point independently calls `getAuthenticatedStudioMember()` and scopes queries
by `studio_id`; raw `storagePath` never crosses into a UI DTO (structurally enforced); no
`NEXT_PUBLIC_` secret exposure; no Client Component imports the service-role client. Found that
migrations enable RLS on `requests`/`request_files` but no migration defines any policy, and that
`studios`/`studio_members` had no RLS statement in migration history at all (later found in 5A.2
to be RLS-enabled anyway, via a Supabase-platform mechanism — see below).

**5A.2 — Live Supabase read-only verification.** Using `supabase db advisors --type security` and
a series of read-only `supabase db query` `SELECT` statements against the linked project
(`vjjvouihcvqmupjojgrs`, the only project — no separate staging project exists). Confirmed RLS is
enabled on all four tables (`studios`/`studio_members` are enabled via a Supabase-managed event
trigger, `rls_auto_enable`/`ensure_rls`, not a project migration) with zero policies anywhere,
matching intentional deny-all-except-`service_role`. Confirmed zero `SELECT`/`INSERT`/`UPDATE`/
`DELETE` grants to `anon`/`authenticated` on any table. Confirmed the `request-images` Storage
bucket is private with no bucket-level MIME/size limits configured (enforced only in app code) and
RLS-enabled-zero-policies on `storage.objects`, same posture as the DB tables. Confirmed
`create_request` runs as invoker (not `SECURITY DEFINER`) with `EXECUTE` restricted to
`service_role`/`postgres` only. Found 6 of 18 `request_files` rows used the pre-3D.6 legacy
storage-path format (no `{studioId}/` prefix), and 2 Storage objects with no corresponding DB row
(pre-existing orphans, unrelated to the legacy-path finding). Flagged Auth Dashboard settings
(SMTP, redirect URLs, rate limits) as not inspectable via the available read-only CLI path in this
session — still requires manual Dashboard verification.

**5A.3 — Legacy-data cleanup plan (read-only planning only).** Identified the 6 legacy-path files
belonged to exactly 3 requests (`REQ-2026-0002`, `REQ-2026-0003`, `REQ-2026-0004`), all created
2026-06-22, before the studio/domain-foundation migration existed — `REQ-2026-0002` is explicitly
named as a Stage 3C.3 test row in the `make_client_name_not_null` migration's own comment,
corroborating the classification. Determined the safe deletion order (Storage objects first, then
DB parent rows, relying on the existing `request_files` `ON DELETE CASCADE`) and that DB deletion
does not cascade to Storage. Did not delete anything in this sub-stage — produced a plan only, and
surfaced explicit owner-decision questions (confirm test-data classification; whether to touch the
2 unrelated orphaned Storage objects; whether a pre-delete snapshot was wanted).

**5A.4 — Owner-approved destructive cleanup.** Owner confirmed all 3 requests as test/dev data.
Preflight re-verified the exact set (3 requests, 6 linked files, all legacy-format, no mixed
paths, all 6 Storage objects present) immediately before acting. Deleted the 6 Storage objects via
a temporary, uncommitted script using the existing service-role credentials (removed immediately
after use); verified all 6 were gone; then deleted the 3 `requests` rows by exact reference code,
which cascaded to remove the 6 `request_files` rows via the existing FK. Post-cleanup verification
confirmed: 0 legacy-path `request_files` rows remain (was 6); all 12 remaining `request_files.
storage_path` values match the `{studioId}/{clientSubmissionId}/...` convention; the 2 unrelated
orphaned Storage objects were left untouched, as scoped. No RLS/policy/migration/code/env/
Dashboard change was made as part of this cleanup.

**Independent review.** A second, independent review of the 5A findings and the proposed
security/data-boundary posture was performed; consensus was reached with no unresolved
disagreement. See PROJECT_DECISIONS.md — Stage 5A Security / Data-Boundary Decisions for the full
decision record this stage produced (access model, RLS posture, Storage posture, staging and
backup deferrals, and the revised Stage 5B scope).

Total tests: unchanged (202) — no application code was touched at any point in Stage 5A. No
`pnpm qg` run — this stage made no source/test/build-relevant change; the only mutations were the
explicitly-scoped 5A.4 data deletions, verified directly via Supabase queries, not via the test
suite.

Outstanding from Stage 5A, carried to Stage 5B or later (see PROJECT_DECISIONS.md and
PROJECT_BACKLOG.md for full detail): Auth Dashboard verification (SMTP, redirect URLs, rate
limits, leaked-password protection); `create_request`'s mutable `search_path` hardening; Storage
bucket MIME/size limits (Dashboard); the 2 unrelated orphaned Storage objects; staging environment
setup; backup/PITR posture.

---

### 2026-07-04 — Stage 4B — Admin Dashboard closed (documentation-only closure)

Status: Completed. Documentation-only — no source, test, route, schema, or Supabase changes.

Formal closure of Stage 4B, following developer decision that Stage 4B is
implementation-complete and may be closed now, with the 4B.5.1 physical mobile-device viewer
verification intentionally deferred (not a closure blocker).

- All Stage 4B sub-stages (4B.0–4B.6) are implemented, committed, and (where applicable) manually
  verified against real Supabase data — see the dated entries below for each.
- The only outstanding item — physical mobile-device verification of the 4B.5.1 image viewer
  (iPhone Safari, Android Chrome) — is explicitly **not** treated as a Stage 4B blocker. It is
  moved to Stage 6 (mobile/visual polish) and pre-release manual QA, alongside the related
  low-resolution-zoom follow-up (`zoom={{ maxZoomPixelRatio: 2 }}`, evaluate only after real-device
  testing, no resolution-based logic) — see `PROJECT_IMPLEMENTATION_PLAN.md` (Stage 6) and
  `PROJECT_BACKLOG.md` (Admin image viewer entry).
- "Current Stage" above updated: Stage 4B marked closed; current focus moves to Stage 5
  (Production Hardening) preparation/audit planning. Stage 5 itself has not been started — no
  Stage 5 work performed in this entry.
- No claim of production-readiness or release-readiness is made here — Stage 5 and Stage 6 remain
  ahead of that, per `PROJECT_IMPLEMENTATION_PLAN.md`.

---

### 2026-07-04 — Stage 4B.6 — Request Status Update

Status: Completed. Committed as `44f11c4` (feat(4B.6): add admin request status update). Manual
verification against real Supabase data completed successfully before commit — see the closure
note at the end of this entry.

Implemented as one small vertical slice, following a read-only audit and a pre-implementation
confirmation pass (both completed earlier the same day) that resolved all open questions before
any file was touched.

Completed:

- `src/services/db.ts`: `updateRequestStatusForStudio(studioId, requestId, status)` — updates
  `requests.status` in one query scoped to `id = requestId AND studio_id = studioId`, with
  `.select("id")` chained after `.update()` so the response reflects actually-matched rows; returns
  `true` if ≥1 row matched, `false` if 0 rows matched (missing request or cross-studio request —
  indistinguishable, same convention as `getRequestForStudio`); throws on Supabase infrastructure
  error. Exported from `src/services/index.ts` (unlike `getRequestForStudio`) since the Server
  Action calls it directly — no DB+Storage orchestration needed here
- `app/[locale]/(admin)/admin/(protected)/requests/[id]/actions.ts` (new): `updateRequestStatusAction(locale, requestId, prev, formData)`
  — independently calls `getAuthenticatedStudioMember()` before any write; validates the submitted
  `status` form field against `REQUEST_STATUS_OPTIONS` before calling
  `updateRequestStatusForStudio()`, scoped to the authenticated member's own `studioId` (never a
  client-supplied value); 0 rows affected returns a generic inline error
  (`admin.requestStatusUpdateNotFound`), not `notFound()` — this is a form submission, not a
  navigation, and must not blow away the admin's current view; on success calls `revalidatePath()`
  for both the detail route and the list route and returns `{ ok: true }`, no redirect
- `src/features/admin/types/index.ts`: added `UpdateRequestStatusResult` (`{ ok: true } | { ok: false; error: string }`)
  — feature-owned, not a `@/services` re-export, since it is the Server Action's own result
  contract, not a DB/service DTO
- `src/features/admin/ui/RequestStatusForm.tsx` (new): the only new Client Component for this
  stage, mirroring the narrow-client-boundary precedent already set by `RequestImageViewer`.
  Renders a `<select>` (defaulted to `currentStatus`) populated from `REQUEST_STATUS_OPTIONS`, a
  submit button (disabled while pending), and uses `useActionState` (same pattern as
  `LoginForm`/`ResetPasswordForm`) for inline `role="alert"` error / `role="status"` success
  messaging. Status remains text-visible throughout, never color-only
- `src/features/admin/ui/RequestDetail.tsx`: renders `RequestStatusForm` beneath the existing
  reference-code/status-badge header, receiving a `locale`+`requestId`-bound action from the page
  as a new required `updateStatusAction` prop; the existing read-only status badge is unchanged
  (still shows the persisted status; the form is the separate control to change it)
- `app/[locale]/(admin)/admin/(protected)/requests/[id]/page.tsx`: binds
  `updateRequestStatusAction` via `.bind(null, locale, id)` and passes it to `RequestDetail`
- `src/features/admin/ui/index.ts`: exports `RequestStatusForm`
- `src/shared/i18n/messages/en.json`: added `admin.requestStatusLabel`,
  `requestStatusUpdateButton`, `requestStatusUpdateButtonLoading`, `requestStatusUpdateSuccess`,
  `requestStatusUpdateFailed`, `requestStatusUpdateNotFound`

**Deviation found and corrected during implementation — `features/admin/config`'s
`REQUEST_STATUS_OPTIONS` re-export:** the pre-implementation confirmation pass had incorrectly
assumed `src/features/admin/config/index.ts`'s existing `export { REQUEST_STATUS_OPTIONS } from "@/services"`
re-export was safe for `RequestStatusForm` (a Client Component) to use directly. Implementing and
running tests revealed this was wrong: `@/services`' runtime exports transitively import the live
Supabase client (`services/supabase.ts` → `@/config`), whose `requireEnv()` throws immediately
without real `SUPABASE_URL`/`SUPABASE_SECRET_KEY`/etc. env vars — safe for Server
Components/Actions (which already run with real env vars), but not for a Client Component or its
Vitest tests (no env vars set under Vitest, by design — every other test mocks `../supabase`
directly rather than relying on real env vars). This broke `RequestDetail.test.tsx` (previously
7/7 passing) the moment `RequestDetail` started importing the runtime value. Every existing admin
UI component only ever imported **types** from this chain, never a runtime value — confirmed via a
repo-wide check before deciding on a fix, and flagged to the developer rather than silently worked
around. Developer decision: `features/admin/config/index.ts` no longer re-exports
`REQUEST_STATUS_OPTIONS` from `@/services`; it now defines a local literal tuple (typed against
the `RequestStatus` type, a type-only import, which is safe), duplicating the five status string
values. This mirrors the existing precedent of `admin.placementLabels`/`sizeLabels`/`colorLabels`
already duplicating label text from `features/request`'s config for an analogous reason. The DB
source of truth (`REQUEST_STATUS_OPTIONS` in `services/db.ts`) is unchanged and still the only
thing the Server Action validates against — the UI-facing duplication cannot become a security
boundary, since an invalid/tampered submitted value is still rejected server-side
- `RequestDetail.test.tsx`: all 7 existing tests updated to pass a `noopUpdateStatusAction` stub
  for the newly-required `updateStatusAction` prop (no behavioral change to existing assertions);
  one assertion (`getByText("New")`) scoped to `{ selector: "span" }` since the new status
  `<select>` now also renders a `New` `<option>`, making the unscoped query ambiguous
- New `src/features/admin/__tests__/RequestStatusForm.test.tsx` (4 tests): current status
  preselected, all five options render, success message shown on `{ ok: true }`, generic inline
  error shown on `{ ok: false, error }` — via injected action props, no `next/headers`/`next/cache`
  mocking
- New tests in `src/services/__tests__/db.test.ts` for `updateRequestStatusForStudio` (8 tests):
  correct `id` + `studio_id` scoping, success (true) result, 0-rows-affected (false) result
  including the cross-studio case, Supabase error throws (+ message propagation), all five status
  values accepted
- **No Server Action tests added** — confirmed during the pre-implementation pass and unchanged
  during implementation: no test in this codebase mocks `next/headers`/`next/cache` directly (not
  even for the pre-existing login/logout/reset-password actions, which have zero tests), and the
  action's actual logic (status validation, scoped update, 0-row handling) is already covered by
  the `db.ts` unit tests above. The action itself is thin, mechanical composition — same category
  as untested page-level Server Component orchestration elsewhere in this codebase
- `eslint.config.mjs`: added `**/features/*/types` to the `import/no-internal-modules` allow-list
  — first time `app/` needs to import a feature's `types/` module directly (the new
  `actions.ts`); mirrors the existing `**/features/*/validation` entry. `app → features` was
  already an allowed dependency direction in `PROJECT_STRUCTURE.md`; this only silences a lint
  warning for an already-permitted import, it does not change any dependency rule
- `src/services/index.ts`: now also exports `updateRequestStatusForStudio` (unlike
  `getRequestForStudio`, which stays unexported) — the Server Action calls it directly, and there
  is no DB+Storage orchestration step needed for a plain scoped status write
- No status transition graph, terminal-state enforcement, notes, activity history, route changes,
  DB schema changes, new dependencies, or optimistic UI updates — all explicitly out of scope per
  the confirmed plan, none added. Same-status submission remains valid (not blocked)
- Total tests: 202 (was 187 at last commit) — `updateRequestStatusForStudio` (8 new tests in
  `db.test.ts`), `RequestStatusForm` (4 new tests); all previously-passing tests still pass.
  `pnpm qg` — structure / lint / typecheck / test / build all
  PASS (lint: 0 errors, 1 pre-existing unrelated warning carried over from Stage 4B.5.1)
- `PROJECT_STRUCTURE.md`: updated (new `actions.ts` entry, `RequestDetail`/`page.tsx` wiring notes,
  `RequestStatusForm` entry, `features/admin/config` re-export correction, `updateRequestStatusForStudio`
  entry under `services/db.ts`)
- `docs/files-structure.md`: updated via `pnpm structure`

**Manual verification completed before commit:** submitting a real status change as the
authenticated studio member end-to-end succeeds; the detail page reflects the new status; the
list page reflects the new status after navigation; a same-status update also succeeds (not
blocked). Committed as `44f11c4` after this verification passed.

**Stage 4B closure note (added after this entry, same day):** with 4B.6 verified and committed,
the only outstanding item before Stage 4B can be considered fully closed is the 4B.5.1 image
viewer's physical mobile-device verification (iPhone Safari, Android Chrome — see the 4B.5.1
entry above), which remains pending, unchanged.

---

### 2026-07-04 — Follow-up — FileUploadInput selection UX polish

Status: Completed. Committed as `202c1f3` (feat(4B.5.1): add image viewer + upload UX fixes —
bundled with the Stage 4B.5.1 viewer commit below, since nothing from this session had been
committed yet at the time).

Small follow-up to the file-upload accumulation fix (see the debugging entry below): improves
public request form upload UX without changing `MAX_FILES_PER_FIELD` or any server/storage/DB
behavior.

- `src/features/request/ui/FileUploadInput.tsx`: added a non-blocking warning (`role="alert"`,
  styled as `text-muted-foreground` — same tone as `FieldHint`, not `FieldError`'s destructive
  styling, since this is a warning, not a validation error) shown when a picker selection would
  exceed `maxFiles`; the extra files are still silently capped (existing accumulation behavior),
  the warning only makes that capping visible. Warning clears on any subsequent change to the
  selected-files list (add within the remaining limit, or remove) — simplest predictable rule,
  developer-confirmed over a more conservative "only clears once back under the limit" variant.
  Added a small remove button (`&times;`, `type="button"`, `aria-label` via the new
  `removeFileLabel(fileName)` prop — never an icon-only unlabeled control) next to each selected
  filename; removing a file updates the list immediately and frees a slot for another pick.
- `maxFilesWarning: string` and `removeFileLabel: (fileName: string) => string` are required
  props (not optional) — both call sites in `RequestForm.tsx` always supply them, and making them
  required removes any hardcoded-English fallback string from the component, keeping all
  user-visible text i18n-driven with no exceptions.
- `RequestForm.tsx`: `referenceImagesHint`/`placementImagesHint` now interpolate `{maxFiles}`
  (previously hardcoded "Up to 3 images/photos" in the English source, inconsistent with
  `uploadButtonText`, which already interpolated it) — passes `MAX_FILES_PER_FIELD` the same way
  as the existing `buttonText` prop, no new source of truth introduced. `maxFilesWarning` and
  `removeFileLabel` passed the same way for both `referenceImages` and `placementImages` fields.
- `src/shared/i18n/messages/en.json`: added `uploadMaxFilesWarning` ("You can upload up to
  {maxFiles} images. Extra files were not added.") and `uploadRemoveFile` ("Remove {fileName}");
  changed `referenceImagesHint`/`placementImagesHint` to use `{maxFiles}` interpolation instead of
  a hardcoded "3".
- No new color token added: no "warning" semantic color exists in this theme (only
  `foreground`/`muted-foreground`/`destructive`/`accent`/`primary`/`secondary`/`sidebar-*`);
  introducing a raw Tailwind palette color (e.g. `amber-600`) not tied to the theme's CSS
  variables was considered and rejected — developer confirmed reusing `text-muted-foreground`
  (same as `FieldHint`) instead, avoiding a new, undocumented styling pattern outside the existing
  token system.
- No new icon dependency added — remove control uses a plain `&times;` glyph with an `aria-label`,
  per the task's constraint.
- Tests: `src/features/request/__tests__/FileUploadInput.test.tsx` extended from 3 to 7 tests —
  added: warning appears when a pick would exceed `maxFiles` (extras dropped); no warning when a
  pick stays within the limit; warning clears when a selected file is removed; removing a file
  updates the rendered list and allows adding another file afterward. All 3 existing accumulation/
  cap tests unchanged and still passing.
- No changes to `RequestForm.submission.test.tsx` (48 tests total in `src/features/request/`, all
  passing) — the new props are additive and don't change the form's submission/FormData behavior.
- No server, storage, DB, validation-schema, or admin-viewer changes. `MAX_FILES_PER_FIELD` value
  itself unchanged.
- `PROJECT_BACKLOG.md` checked for an existing upload delete/replace UX item to update or
  remove — none found (only a MIME-verification and an unrelated form-fields backlog item exist
  under "Request Form Improvements"); left unchanged.
- `docs/files-structure.md`: no new files added (only existing `FileUploadInput.tsx` and its test
  modified in place) — refreshed via `pnpm structure` as part of the mandatory pre-commit step,
  no structural entries changed.

Total tests: 187 (was 183) — all pass. `pnpm qg` — structure / lint / typecheck / test / build all
PASS.

---

### 2026-07-04 — Post-4B.5.1 debugging — route-transition console warning + file-upload regression check

Status: Completed. The code fixes from this entry (conditional `<Lightbox>` mounting, the
`FileUploadInput` accumulation fix) are committed as part of `202c1f3`. This entry's DevTools
warning investigation itself produced no code change — its conclusion (dev-tooling/React-internals
interaction, not an app bug) stands as documentation only.

Two issues investigated after Stage 4B.5.1:

**Issue A — admin list ↔ detail client navigation React DevTools warning**

Reported symptom: `We are cleaning up async info that was not on the parent Suspense boundary.
This is a bug in React.`, stack pointing at React DevTools' `installHook.js`. Only appears on
admin `/admin/requests` ↔ `/admin/requests/[id]` client-side navigation (card click, back link);
never on direct load of either route, never on public route transitions, never on
viewer open/close, never with React DevTools disabled.

Diagnostic steps performed (temporary, non-committed toggles, each reverted after test and
confirmed reverted via `git diff HEAD`):

- Conditionally mounted `<Lightbox>` only when `open === true` (was previously always mounted
  with `open={false}`) — retested by the developer; did not remove the warning.
- **Round 1 (initial report, later found ambiguous):** temporarily removed the entire
  `RequestImageViewer` client-component boundary from `RequestDetail.tsx`, with no visible marker
  to confirm hot-reload had actually applied the change. The developer's result ("error still
  appears") was recorded, but there was no independent confirmation the diagnostic build was
  actually being served — flagged and redone.
- **Round 2 (precise, marker-confirmed):** repeated the same removal (`RequestImageViewer` →
  direct `RequestImageGroup` rendering, no click-to-open, no client component in the image area),
  this time with an unmissable visible banner ("DIAGNOSTIC: viewer disabled") rendered above the
  images. Developer confirmed the banner was visible (hot-reload verified) and the warning **still
  appeared** on the first list → detail navigation after a page reload. **This conclusively rules
  out YARL/Zoom and the `RequestImageViewer` client boundary as the trigger.**
- **New precise behavior established in Round 2:** the warning fires only **once per fresh page
  reload**, on the first client-side list ↔ detail navigation after that reload. Repeated
  navigation back and forth after that first occurrence does not reproduce it again. Reloading
  either route resets this — the next first navigation shows it once more.
- Compared `RequestCard`'s link and `RequestDetail`'s back link: both use the same locale-aware
  `Link` from `@/shared/i18n` (`next-intl/navigation`), no raw `<a>`/`next/link` mismatch; neither
  passes through the `/admin` redirect stub (`RequestCard` already targets `/admin/requests/[id]`
  directly).
- Compared route shapes: `app/[locale]/(admin)/admin/(protected)/requests/page.tsx` and
  `.../requests/[id]/page.tsx` are both genuinely `async function` Server Components (`await
  params`, `await cookies()`, `await getAuthenticatedStudioMember()`, `await
  listRequestsForStudio()`/`await getAdminRequestDetail()`), each with a sibling `loading.tsx`
  (Next.js's own implicit per-route-segment Suspense boundary). By contrast, every public route
  (`(public)/page.tsx`, `request/page.tsx`, etc.) is a fully synchronous Server Component — no
  `await` anywhere — confirmed via repo-wide search (zero matches for `async function`/`await
  params`/`await cookies` under `(public)`).
- Inspected `proxy.ts` (Next.js middleware): runs `await supabase.auth.getUser()` on every
  matched request (matcher excludes only `api|auth|_next|_vercel|.*\..*`), including client-side
  RSC navigation requests, for both admin and public routes alike. Ruled out as the sole
  differentiator — it runs identically on public route transitions, which never show the warning.
- Checked for explicit `prefetch` props: none found anywhere in the codebase (`grep` for
  `prefetch` under `src/`/`app/` returns no matches), meaning every `Link` (`RequestCard`'s card
  links, `RequestDetail`'s back link, and every public-page `Link`) uses Next.js's App Router
  default prefetch behavior — viewport-visible links are automatically prefetched shortly after
  the containing page mounts.

**Strongest current theory (evidence-based, not independently browser-verified):** the detail
route is a genuinely dynamic (`ƒ`, confirmed in the `next build` route table — not statically
generated) async Server Component. On a fresh page load, `/admin/requests`' card `Link`s (and,
symmetrically, the detail page's back `Link`) are not yet in the Router Cache, so Next.js's
default auto-prefetch performs one real dynamic RSC fetch of the counterpart route shortly after
mount. That first fetch-and-stream-in of a genuinely async segment is the one moment new "async
info" is created and can be torn down against a Suspense boundary in a way React's internal
bookkeeping — as instrumented by React DevTools' `installHook.js` — flags as unexpected. Once
that segment is in the Router Cache, subsequent navigations reuse the cached payload and never
repeat the same first-fetch code path, which matches the observed "fires once per reload, never
again until reload" behavior exactly. This is consistent with every other constraint gathered:
never on public routes (their target routes are static, not dynamic, so no comparable first
dynamic-fetch event occurs), never on direct load (prefetch requires the page to have mounted and
a `Link` to become viewport-visible first — a direct load of the detail page has no counterpart
link to prefetch anything from), never without DevTools (the instrumentation that surfaces the
warning is DevTools' own hook).

**This has not been independently verified against Next.js's Router Cache internals or a
minimal non-admin dynamic-route repro** — no browser-automation tool is available in this
session to trace network/prefetch activity directly. It remains the strongest theory consistent
with 100% of the reproduction evidence gathered so far, not a confirmed root cause.

**Conclusion:** Viewer/YARL is **conclusively excluded** (Round 2, marker-confirmed). Routing
cleanup and `Link` component choice are **not implicated** (identical `Link` on both sides,
neither goes through the `/admin` redirect). The warning is most likely a one-time interaction
between Next.js's default link-prefetch behavior and a genuinely dynamic async Server Component
route, surfaced only by React DevTools' Suspense-adjacent instrumentation — a known class of
React 19 + Next.js App Router + DevTools interaction, not an application logic bug. No concrete
app-level fix is being proposed: per the task's explicit constraint, no `<Suspense>` wrapper or
admin architecture change was made speculatively on the basis of a DevTools-only warning with no
observed UI impact.

**Fix kept:** conditional `<Lightbox open={open} .../>` mounting in `RequestImageViewer.tsx`
(only mounts when `open === true`, previously always mounted with `open={false}`). This is kept
strictly on its own merits (no unmounted-but-present dialog component sitting in the tree) — it is
explicitly **not** presented as a fix for this warning, since Round 2 confirmed the warning
occurs even with the entire viewer removed.

Recommendation: leave as a known dev-tooling/React-internals warning, visible only with React
DevTools attached; UI behavior is unaffected; no data, auth, or navigation correctness issue
observed. If full confirmation of the prefetch theory is wanted later, the concrete test is: open
Chrome DevTools' Network tab filtered to Fetch/XHR, reload `/admin/requests`, watch for an RSC
fetch of `/admin/requests/[id]` firing shortly after load (before any click) — its timing should
line up with the moment the console warning appears. Re-evaluate this whole finding if the
warning starts appearing without DevTools, in a production build, or after a React/Next.js
upgrade.

**Issue B — file upload only accepted one image instead of up to `MAX_FILES_PER_FIELD` (3)**

Root cause found in `src/features/request/ui/FileUploadInput.tsx`'s `handleChange`: each file-
picker selection **replaced** the field's entire value (`onChange(selected.slice(0, maxFiles))`)
instead of merging with the existing `value` prop. Selecting multiple files within one picker
dialog (Ctrl/Shift-click) already worked correctly up to 3; the observed regression reproduces
whenever a user opens the picker, selects one file, then reopens the picker and selects another —
the second pick silently discarded the first.

Confirmed via `git diff --stat HEAD -- src/features/request/` (empty) and `git log` (last touch:
Stage 3C.3.5) that no code in `src/features/request/` changed in this branch — this is
**pre-existing behavior, not a regression introduced by 4B.5.1** or any other change in this
diff; it was newly observed during manual testing, not newly broken.

Fix: `handleChange` now does `const combined = [...value, ...selected].slice(0, maxFiles)` —
accumulates newly picked files onto the existing selection, still capped at `maxFiles`.

Tests added: `src/features/request/__tests__/FileUploadInput.test.tsx` (new, 3 tests) — selecting
multiple files in one pick keeps all of them up to `maxFiles`; accumulates files across separate
single-file picks instead of replacing (the regression's exact repro); caps accumulated files at
`maxFiles` when the existing selection plus a new pick would exceed it. Uses
`@testing-library/user-event`'s `upload()` (already a project dependency) rather than firing a raw
`change` event, and an explicit `afterEach(() => cleanup())` (matching the existing pattern in
`RequestCard.test.tsx`) — needed because `vitest.config.ts` does not set `globals: true`, so
RTL's automatic per-test cleanup is not registered implicitly in this project.

No changes to `RequestForm.tsx`, `MAX_FILES_PER_FIELD`, server-side `validateFiles()`, or the
FormData-append loop — all already correct (form already loops over the full array and appends
every file; server already allows up to 3).

Total tests: 183 (was 180) — all pass. `pnpm qg` — structure / lint / typecheck / test / build all
PASS.

Remaining manual checks (not performed in this session — no browser-automation tool available):
live confirmation in an actual browser that Issue B's fix resolves the symptom exactly as
described (accumulate across repeated single-file picks, still capped at 3, for both
reference and placement fields); all previously-outstanding Stage 4B.5.1 physical-device
verification (iPhone Safari, Android Chrome, swipe-down-to-close) remains outstanding, unchanged
by this session.

---

### 2026-07-04 — Stage 4B.5.1 — Minimal Image Viewer / Zoom implementation

Status: Completed (code). Committed as `202c1f3` (feat(4B.5.1): add image viewer + upload UX
fixes). **Physical mobile-device verification (iPhone Safari, Android Chrome — pinch zoom, pan
after zoom, double tap, swipe, portrait/landscape) remains pending** until the app is deployed or
a mobile-accessible preview environment is available for real-device testing; desktop manual
verification (open, close button, backdrop, Escape, double-click zoom/reset, drag/pan after zoom)
is complete and passed (see the debugging entry above). Swipe-down-to-close
(`controller.closeOnPullDown`) remains intentionally not enabled, gated on that same pending
mobile verification.

Pre-implementation verification performed (against real shipped package artifacts, not just
prose docs): downloaded and inspected `yet-another-react-lightbox@3.32.0`'s type definitions
directly. Confirmed `peerDependencies` (`react`/`react-dom` `^16.8.0 || ^17 || ^18 || ^19`)
explicitly cover React 19.2.3 — no incompatibility found, so the `react-photo-view` fallback was
not needed and not installed. Confirmed via the shipped `.d.ts` files and official Zoom plugin
docs: pinch-to-zoom/pan/double-tap-zoom-reset are native Zoom plugin behavior (no custom gesture
code); `render.buttonPrev`/`buttonNext` are independent `RenderFunction` props that can return
`null` to hide arrows, structurally decoupled from `controller.disableSwipeNavigation` (left
unset, so swipe/keyboard navigation stays active); `controller.closeOnEscape` defaults `true`;
`controller.closeOnBackdropClick` defaults `false` (explicitly enabled); `controller.
closeOnPullDown` is a real, first-class documented boolean, not custom gesture code, but no
documented interaction with the Zoom plugin was found in either module's type augmentation —
meaning its real-device safety could only be confirmed by physical testing, not by reading docs.
Confirmed only one CSS file ships (`dist/styles.css` / `yet-another-react-lightbox/styles.css`);
the Zoom plugin itself ships no separate stylesheet (unlike captions/counter/thumbnails plugins).

Developer decision point: whether to enable `closeOnPullDown` now (flagged unverified) or omit it
this pass pending real-device testing. **Decided: omit.** Prioritizes reliable pinch/pan over an
unverified close gesture; no custom pull-down code was written either way.

Completed:

- `yet-another-react-lightbox@3.32.0` installed (single new dependency; no `react-photo-view`)
- `src/features/admin/ui/RequestImageViewer.tsx` (new): the sole new Client Component
  (`"use client"`), the one narrow client boundary added for this stage. Receives reference and
  placement file DTOs as props, renders both existing `RequestImageGroup`s unchanged in layout,
  builds one combined available-only slide list (reference images first, then placement images),
  and owns `open`/`initialIndex` local state (`useState`, no global state). Renders YARL's
  `<Lightbox>` with the `Zoom` plugin, `closeOnBackdropClick: true`, default `closeOnEscape`,
  default close button, and `render.buttonPrev`/`buttonNext` returning `null` when only one
  available image exists (so a single-image request never shows dead-end arrows)
- `src/features/admin/ui/RequestImageCard.tsx`: added an optional `onClick` prop; when present
  and the file is `"available"`, renders the image inside a `<button type="button">` instead of a
  bare `<img>`; unavailable files are unaffected (still never interactive)
- `src/features/admin/ui/RequestImageGroup.tsx`: added an optional `onImageClick(fileId)` prop,
  threaded down to each `RequestImageCard`
- `src/features/admin/ui/RequestDetail.tsx`: replaced the two direct `RequestImageGroup` renders
  with a single `RequestImageViewer` call, passing both file arrays and translated labels. Remains
  a Server Component — the client boundary starts inside `RequestImageViewer`, not at `
  RequestDetail` or the route's `page.tsx`. Server data-fetching path (`getAdminRequestDetail`,
  signed URLs) untouched
- `src/features/admin/ui/index.ts`: added `RequestImageViewer` export
- `src/shared/i18n/messages/en.json`: added `admin.imageViewerClose` ("Close") — used only for
  YARL's `labels.Close` override; no other new UI copy needed since YARL's own controls (nav
  arrows aside) are not otherwise re-labeled
- `eslint.config.mjs`: added `yet-another-react-lightbox/*` and `yet-another-react-lightbox/**` to
  the `import/no-internal-modules` allow-list — required for the library's own public subpath
  exports (`/plugins/zoom`, `/styles.css`), same rationale as the existing `**/shared/utils`/
  `**/shared/ui` entries (public API surface, not a deep internal reach)
- `src/features/admin/__tests__/RequestImageViewer.test.tsx` (new, 6 tests): viewer dialog does
  not render until an available image is clicked; opens at the clicked reference image with the
  correct signed `src`; opens at the clicked placement image at the correct combined index;
  combined slide count is reference-then-placement (2, from 1 available reference + 1 available
  placement in the fixture); unavailable files are visible but not rendered as a `button` (not
  interactive) and excluded from the slide set; close control closes the dialog. YARL itself is
  mocked (including its CSS and Zoom plugin subpath imports) per the task's own instruction not to
  turn library internals into brittle tests
- Existing `RequestDetail.test.tsx` (7 tests) required no changes and all still pass unmodified,
  including the signed-URL `src`/alt assertion and the no-`storagePath`/`storage_path`-leakage
  check — YARL's `<Lightbox>` renders `null`-equivalent output while `open` is `false` (the
  default), so its presence in the tree doesn't disturb the existing closed-state assertions
- No changes to `RequestDetailSkeleton`, route `page.tsx`/`loading.tsx`/`error.tsx`/
  `not-found.tsx`, `services/requests.ts`, `services/storage.ts`, signing logic, or any DB/
  Supabase code — server detail page and data-fetching path fully unchanged, per the architecture
  constraint
- Total tests: 180 (was 174) — all pass
- `pnpm qg` — structure / lint / typecheck / test / build all PASS
- `PROJECT_DECISIONS.md`: Minimal Image Viewer / Zoom section updated to record the as-implemented
  behavior (combined slide-set ordering, hidden single-image arrows, `closeOnPullDown` explicitly
  NOT enabled this pass with rationale, updated manual-verification and deferred/follow-up notes)
- No status update, notes, unread tracking, filters, thumbnails, captions, metadata overlay,
  download control, or visual redesign added — all remain out of scope per the approved decision

Manual verification NOT performed in this session (no physical devices available): iPhone Safari
(open, pinch zoom, pan after zoom, double tap, swipe left/right, close button, backdrop tap,
portrait → landscape), Android Chrome (same, plus confirm no browser-pinch conflict), desktop
(open, Escape, backdrop, optional keyboard arrows), and a browser network check confirming viewer
open triggers no new signed-URL request. `pnpm build`'s successful compilation is not a substitute
for this — flagged as an outstanding requirement, not claimed as done.

---

### 2026-07-03 — Stage 4B.5.1 — Image viewer decision update (documentation only)

Status: Planned — decision updated, implementation not started

Problem: the existing Stage 4B.5.1 entry in `PROJECT_DECISIONS.md` (recorded earlier the same
day) preferred a native `<dialog>`/lightweight Client Component first, with any zoom dependency
evaluated only after real-device testing showed native/CSS zoom unreliable. That direction is
now superseded by a developer-approved dependency decision, made before implementation began.

Completed:

- `PROJECT_DECISIONS.md` — Minimal Image Viewer / Zoom section: the original native-first
  direction is explicitly marked superseded (kept in a collapsed `<details>` block for history,
  not deleted) and replaced with an approved decision: use `yet-another-react-lightbox` (YARL) +
  its official Zoom plugin; no custom pinch/pan gesture handling; `react-medium-image-zoom`
  evaluated and rejected (insufficient for reliable touch pan after zoom); `react-photo-view` as
  fallback only if YARL has a real, confirmed React 19/Next 16 compatibility issue found during
  implementation — not pre-approved as a co-install. Scope boundaries restated against the
  approved library (reuse existing signed URL, no new signing call, dark uncropped/letterboxed
  background, pinch/pan/double-tap via the Zoom plugin, natural orientation reflow, 44px close
  button + Escape + backdrop-tap required). Swipe-down-to-close documented as conditional —
  enabled only if YARL actually supports it and only after device testing confirms no conflict
  with zoom/pan, not claimed as guaranteed. Accepted signed-URL-expiry limitation (~1 hour, no
  refresh-on-open) recorded explicitly. Required manual verification checklist (iPhone Safari,
  Android Chrome, desktop, network-level no-new-signing check) recorded.
- `PROJECT_IMPLEMENTATION_PLAN.md` — Stage 4B section's `### 4B.5.1` summary rewritten to match:
  names YARL + Zoom plugin, the `react-medium-image-zoom` rejection, the `react-photo-view`
  fallback condition, and that no dependency has been installed yet.
- `PROJECT_STAGE_LOG.md` — "Current focus" line above updated to name the superseding decision.
- `PROJECT_CONTEXT.md` — checked; contains no Stage 4B.5.1-specific wording (only the general
  Admin Interface scope section, already accurate), so left unchanged per this task's own scope
  limit.
- No source code, tests, `package.json`, lockfile, dependencies, routes, database schema, or
  Supabase configuration changed. No package installed. Stage 4B.5.1 remains **not implemented**.
- `pnpm qg` run after documentation changes (no source changed) — structure / lint / typecheck /
  test / build all PASS.

---

### 2026-07-03 — Routing cleanup — request list moved to `/[locale]/admin/requests`

Status: Completed (not yet committed)

Problem: after Stage 4B.5, `/[locale]/admin` rendered the request list while
`/[locale]/admin/requests/[id]` was the detail route — an inconsistent URL hierarchy with no
list page at the intermediate `/[locale]/admin/requests` path.

Approved target IA: `/[locale]/admin` → redirects to `/[locale]/admin/requests` (request list) →
`/[locale]/admin/requests/[id]` (detail). Reason: requests are the current primary admin
workspace; this removes the missing intermediate route and leaves `/admin` available as a future
dashboard/home once metrics/calendar/settings exist (not built now).

Pre-edit inspection: confirmed `(protected)/layout.tsx` is the sole auth gate (independent
`getAuthenticatedStudioMember()` call, wraps all `(protected)` children) and is unaffected by
moving pages beneath it; confirmed `RequestCard`'s link to `/admin/requests/[id]` was already
correct and needed no change; found three stale `/admin` links needing update
(`RequestDetail.tsx` back link, detail route's `error.tsx` and `not-found.tsx`); confirmed
login/OAuth/reset-password success redirects intentionally keep targeting `/${locale}/admin`
(now a valid one-hop redirect stub, not a broken link) — out of scope to change per the task's
own constraint ("`/admin` itself remains valid and redirects").

Completed:

- `app/[locale]/(admin)/admin/(protected)/page.tsx`, `loading.tsx`, `error.tsx` moved (via
  `git mv`) to `app/[locale]/(admin)/admin/(protected)/requests/{page,loading,error}.tsx` —
  same auth/data logic, no behavior change; exported function names renamed
  `AdminPage`/`AdminLoading`/`AdminError` → `AdminRequestsPage`/`AdminRequestsLoading`/
  `AdminRequestsError` for clarity now that a separate `(protected)/page.tsx` exists
- New `app/[locale]/(admin)/admin/(protected)/page.tsx`: minimal Server Component that reads
  `locale` from params and calls `redirect(`/${locale}/admin/requests`)` — no client-side
  redirect, no business logic; still rendered only after `(protected)/layout.tsx`'s auth gate
  passes, so unauthenticated/unauthorized users never reach it (same as every other page in this
  route group)
- Internal links updated: `src/features/admin/ui/RequestDetail.tsx` back link, detail route's
  `error.tsx` and `not-found.tsx` back links — all `/admin` → `/admin/requests`;
  `RequestCard.tsx`'s link to `/admin/requests/[id]` required no change (already correct)
- `RequestDetail.test.tsx`: back-link assertion updated from `/en/admin` to `/en/admin/requests`
- Repo-wide search for stale bare `/admin` href/route references in source: none remaining
  outside the intentionally-unchanged login/OAuth/reset-password redirect targets
- No new test added for the `(protected)/page.tsx` redirect itself — same category as every
  other Server Component page/redirect in this codebase (login page's authenticated-redirect
  branch, OAuth callback, etc.), none of which have dedicated tests; would require introducing a
  new App Router page-testing pattern not otherwise used in this project
- No auth weakening: the redirect stub is still a child of `(protected)/layout.tsx`; no
  independent-auth-check pages had their auth logic touched; UUID/not-found behavior on the
  detail route unchanged; no status-update, viewer/zoom, or visual redesign work performed
- Total tests: 174 (unchanged — one assertion updated, no tests added or removed)
- `pnpm qg` — structure / lint / typecheck / test / build all PASS; build output confirms both
  `/[locale]/admin` and `/[locale]/admin/requests` are registered routes
- `PROJECT_ARCHITECTURE.md`, `PROJECT_STRUCTURE.md`, `PROJECT_IMPLEMENTATION_PLAN.md`,
  `docs/files-structure.md`: updated; corrected the previous 4B.5 log entry's stale "not yet
  committed" status (it was committed as a prior step in this session)

Manual verification: not performed against a live browser in this session. A dev server was
already running locally from an earlier session on port 3000, started outside this task; it was
left untouched rather than restarted, since restarting/killing a process not started by this
task is a side-effecting action beyond this routing cleanup's scope. `pnpm build`'s successful
compilation of the moved/new route files, plus the registered-route list in its output, is the
verification performed instead. Flagged as a limitation, not claimed as full manual verification.

---

### 2026-07-03 — Stage 4B.5 — Admin Request Detail UI

Status: Completed (committed as `b50535b` — feat(4B.5): add admin request detail UI)

Pre-implementation inspection: an empty `requests/` directory already existed under
`(protected)/`, so the new dynamic route slotted in without restructuring. No shared UUID
validation utility existed anywhere in the codebase. No admin-scoped `not-found.tsx` existed —
only the global `app/not-found.tsx` (hardcoded English, own `<html>/<body>`, not locale/i18n
aware), which could not be reused as-is for a locale-aware, i18n-driven, list-linking message.

Completed:

- `app/[locale]/(admin)/admin/(protected)/requests/[id]/page.tsx`: Server Component; calls
  `getAuthenticatedStudioMember()` independently (same rule as every other Stage 4B entry point);
  redirects to login on `unauthenticated`; validates route `id` as a UUID via the new `isUuid()`
  helper before any data access — invalid UUID → `notFound()`; calls
  `getAdminRequestDetail(studioId, id)` — `null` → `notFound()` (uniform for missing and
  cross-studio, matching the existing decision; no distinguishing signal); DB/service errors are
  not caught, they propagate to `error.tsx`
- `src/shared/utils/uuid.ts`: `isUuid(value)` — small regex-based UUID v1–v5 validator, exported
  from the existing `src/shared/utils/index.ts` barrel (first cross-boundary consumer of
  `@/shared/utils` from `app/`; `**/shared/utils` added to the `import/no-internal-modules`
  eslint allow-list, matching the existing `**/shared/ui` entry, to keep the barrel import
  warning-free)
- `src/features/admin/ui/RequestDetail.tsx`: composes the full mobile-first single-column detail
  layout — back link to `/admin`, reference code as `<h1>`, text-visible status badge; client name
  plus compact `mailto:`/`tel:` quick-action links (rendered only when `email`/`phone` are
  present; `contactOther` stays plain text, never a link); tattoo brief (description never
  truncated, plus placement/size/color via a `<dl>`, budget only when present); a repeated full
  contact `<dl>` section rendering only present fields (no empty rows, whole section omitted if no
  contact fields exist); reference then placement image groups; footer metadata (created date via
  `Intl.DateTimeFormat`, not string-slicing; consent as text, not color-only)
- `src/features/admin/ui/RequestImageGroup.tsx` / `RequestImageCard.tsx`: image groups are `
  <section>`s with an `<h2>`; one column, full width, natural aspect ratio, no crop, plain `<img>`
  (not `next/image`, consistent with the private-signed-URL decision), no click/tap behavior (that
  remains Stage 4B.5.1); an unavailable file renders a same-width placeholder with the original
  filename and a generic "unavailable" label — never hidden, never the raw error
- `src/features/admin/ui/RequestDetailSkeleton.tsx`: data-free, `aria-hidden`, mirrors the
  header/client/brief/images structure; wired into a new
  `.../requests/[id]/loading.tsx` (no auth check, matching the list route's `loading.tsx`)
- `.../requests/[id]/error.tsx`: Client Component (required by Next.js), generic translated
  message, retry button, and a link back to the list — same pattern as the list route's
  `error.tsx`, extended with the back link
- `.../requests/[id]/not-found.tsx`: new admin-scoped boundary (nearest existing one, the global
  `app/not-found.tsx`, could not satisfy the locale-aware/i18n/list-link requirements); generic
  "request not found" message plus a link back to `/admin`
- i18n: all new user-visible strings added to the existing `admin` namespace in `en.json`
  (`backToRequests`, `emailAction`, `phoneAction`, brief/contact labels, image-group titles,
  `imageUnavailable`, metadata labels, and the detail route's own error/not-found strings) — no
  new namespace, no hardcoded copy
- 11 new tests: `RequestDetail` (7 — core sections/fields, mailto/tel quick actions, only-present
  contact fields with `contactOther` rendered as plain text, available image alt+src, unavailable
  image placeholder with filename, no raw storage path anywhere in rendered output, back link
  target) and `isUuid` (4 — valid UUID, non-UUID string, malformed UUID-like string, empty
  string). No route-level test added for the page itself — same category as the existing list
  page (`(protected)/page.tsx`), which also has no dedicated test; it is Next.js Server Component
  orchestration of already-tested `getAuthenticatedStudioMember`/`getAdminRequestDetail`, not
  project-owned logic
- No status update, notes, unread tracking, filters, calendar, or any image viewer/zoom/lightbox
  added — all remain out of scope, deferred to Stage 4C / Stage 4B.5.1 as documented
- Total tests: 178 (was 163) — all pass
- `pnpm qg` — structure / lint / typecheck / test / build all PASS
- `PROJECT_STRUCTURE.md`, `docs/files-structure.md`, `PROJECT_IMPLEMENTATION_PLAN.md`: updated

Manual verification performed: confirmed (via `curl` against the already-running local dev
server) that an unauthenticated request to the new detail route still redirects to
`/en/admin/login` (200 after redirect) — the new route does not bypass or break the existing auth
gate. Real authenticated rendering against seeded Supabase data, the true not-found page, portrait/
landscape mobile viewport rendering, and available/unavailable image states in a live browser were
**not** verified end-to-end in this session (no interactive browser session available) — flagged
as a limitation, not claimed as verified.

---

### 2026-07-03 — Stage 4B.5 / 4B.5.1 — Request Detail UI + Image Viewer planning

Status: Documentation only — implementation not started

Completed:

- Architecture/UI review completed for Stage 4B.5 (Admin Request Detail UI) and a new small
  follow-up Stage 4B.5.1 (Minimal Image Viewer / Zoom); decisions recorded in
  `PROJECT_DECISIONS.md` under Stage 4B Admin Dashboard Architecture — Request Detail UI and
  Minimal Image Viewer / Zoom
- 4B.5 scope recorded: route `/[locale]/admin/requests/[id]`; independent
  `getAuthenticatedStudioMember()` call; `getAdminRequestDetail(studioId, requestId)`; uniform
  `notFound()` for invalid UUID / missing / cross-studio (no distinguishing signal, matching the
  existing Stage 4B not-found decision); content order (reference code + status, client name +
  quick contact links, tattoo brief, full contact block, reference images, placement images,
  date/consent as metadata, back link); mobile-first single column; images as plain `<img>` at
  natural aspect ratio, no crop, no new-tab link, no click behavior in this step; unavailable
  file → same-width placeholder with filename + safe label; route-level loading/error states;
  admin i18n namespace only
- 4B.5.1 scope recorded as a separate, smaller follow-up immediately after 4B.5 and before
  status update: tap-to-fullscreen viewer, no new tab, native `<dialog>`/lightweight Client
  Component preferred, accessible close + Escape, reuses the already-signed URL, no
  gallery/download/animation/custom zoom controls; pinch-zoom reliability must be verified on
  real iPhone Safari and real Android Chrome before shipping; a narrowly scoped zoom dependency
  (e.g. `react-medium-image-zoom`) may only be evaluated later, after separate approval, if
  native/CSS zoom proves unreliable on those real devices
- A later Stage 6 visual-polish candidate noted in `PROJECT_IMPLEMENTATION_PLAN.md` (Stage 6 —
  mobile polish task): admin request list could move to a two-column card grid in mobile
  landscape / tablet-width views. Not decided, not a functional blocker, no change to the
  Stage 4B.4 list — it remains single-column mobile-first until that later review
- `PROJECT_IMPLEMENTATION_PLAN.md`: Stage 4B section gained `### 4B.4` (completed, pointer to
  the stage-log record) and `### 4B.5` / `### 4B.5.1` (planned, pointer to the new
  `PROJECT_DECISIONS.md` entries) headers, following the same sub-stage-header convention
  already used for 4B.0/4B.1; Stage 6's "mobile polish" task gained the two-column-grid
  candidate note
- Corrected stale status on the existing Stage 4B.4 log entry below (was "Completed (not yet
  committed)"; Stage 4B.4 was committed as `11e256c` after that entry was written) and updated
  "Current focus" above
- No pages, components, routes, viewer, dependencies, or migrations added — documentation only
- `pnpm qg` run after doc changes (no source changed) — lint / typecheck / test / build all PASS

---

### 2026-07-02 — Stage 4B.4 — Admin Request List UI

Status: Completed (committed as `11e256c` — feat(4B.4): add admin request list UI)

Inspection performed before implementation: existing `(protected)/layout.tsx` already renders a
header (admin label + sign-out) for both authorized and unauthorized branches, so no shell
adjustment was needed. The route `/[locale]/admin` already resolves to `(protected)/page.tsx`
(a placeholder) — extended in place.

Completed:

- `app/[locale]/(admin)/admin/(protected)/page.tsx`: now a Server Component that independently
  calls `getAuthenticatedStudioMember()` (in addition to the layout's own check, per the
  documented "every entry point re-verifies independently" rule); redirects to login on
  `unauthenticated`; renders nothing on `unauthorized` (unreachable in practice — the layout's
  own unauthorized branch does not render `{children}` — but the page does not assume that);
  calls `listRequestsForStudio(studioId)` only after a successful auth check; does not catch
  DB errors — they propagate to the new route `error.tsx`
- `src/features/admin/ui/` created: `RequestCard` (one semantic `Link` — from `@/shared/i18n`,
  locale-aware — per card, no clickable div; shows referenceCode + status first, client name
  prominent, placement/size/color compact, date secondary — matches the approved mobile-first
  compact-card layout), `RequestList` (maps DTOs to cards, renders `EmptyState` when empty),
  `RequestListSkeleton` (data-free, 5 skeleton cards, `aria-hidden`), `EmptyState` (no shared
  equivalent existed); barrel at `src/features/admin/ui/index.ts`
- `RequestCard`/`RequestList` are plain (Server Component–compatible) functions that receive a
  server-obtained `t` (`getTranslations` return value) and `locale` as props from the page,
  following the same "Server Component translates, passes strings/fn down" pattern already used
  by the login/reset-password pages — avoids making the list a Client Component
- Date formatting: `Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day:
  "numeric" })` — no string slicing
- Status label: looked up via `t.has("statuses.<value>")` with a raw-value fallback if missing —
  status remains text-visible (not color-only), and `REQUEST_STATUS_OPTIONS`
  (`services/db.ts`) remains the sole source of truth for which values are valid; the new
  `admin.statuses.*` i18n keys are presentation-only labels, not a second source of truth
- Placement/size/color labels: **explicit developer decision** — `features/admin` may not import
  `features/request` directly (PROJECT_STRUCTURE.md, "features must not depend on other features
  directly"), and `features/request/config` exports only value lists, not label text (labels live
  only inside the `request` i18n namespace). Rather than a cross-namespace i18n read (rejected —
  would silently couple `admin` to `request`'s key shape with no import-time guardrail), new
  `admin.placementLabels.*` / `admin.sizeLabels.*` / `admin.colorLabels.*` i18n maps were added,
  keyed by the same value strings already owned by `features/request/config`
  (`PLACEMENT_OPTIONS`/`SIZE_OPTIONS`/`COLOR_OPTIONS`). Same raw-value-fallback behavior as
  status for any unrecognized value. This duplicates label *text* once (English words only) but
  not the source of truth for valid *values*
- `app/[locale]/(admin)/admin/(protected)/loading.tsx`: data-free skeleton via
  `RequestListSkeleton` — first `loading.tsx` in the app
- `app/[locale]/(admin)/admin/(protected)/error.tsx`: Client Component (required by Next.js),
  generic translated message only (no DB/internal details), includes reset/retry — first
  `error.tsx` in the app, no prior pattern to match or contradict
- i18n: `admin.requestListTitle`, `requestListEmpty`, `requestListErrorTitle`,
  `requestListErrorMessage`, `requestListRetry`, `statuses.*`, `placementLabels.*`,
  `sizeLabels.*`, `colorLabels.*` added to `en.json` under the existing `admin` namespace — no
  new namespace, no hardcoded UI copy
- 7 new tests: `RequestCard` (4 — required fields render incl. status as text, links to the UUID
  detail route, falls back to raw value for an unrecognized placement/size/color, locale-aware
  date formatting not string-slicing), `RequestList` (2 — one card per request, empty-state
  message with no links rendered), `RequestListSkeleton` (1 — data-free, `aria-hidden`). `next-
  intl`'s `Link` is mocked the same way `RequestForm.submission.test.tsx` already mocks
  `next-intl` (real `next-intl/navigation` `Link` fails under plain jsdom/vitest — needs Next.js
  navigation internals not present in the test environment)
- No request detail UI, status update, filters/search/pagination, unread/read behavior, metrics,
  or appointment/calendar work — out of scope, none added
- `PROJECT_IMPLEMENTATION_PLAN.md` — Stage 4C tasks/exit criteria extended: unread indicator
  clarified as list-card-relevant; new "list UI enhancements deferred from 4B.4" bullet (status
  tabs/hide-closed, filters/search, configurable sorting; appointment-date sorting noted as
  belonging to a future Appointment/Calendar model, not this list) — no change to Stage 4B's own
  scope/exit criteria, which already only required "admin can view the request list"
- Total tests: 163 (was 156) — all pass
- lint / typecheck / test / build — all PASS (`pnpm qg`)
- `PROJECT_STRUCTURE.md`, `docs/files-structure.md`: updated

Manual verification performed: dev server started; unauthenticated request to `/en/admin`
confirmed to redirect to `/en/admin/login` (200 after redirect) — the new page code does not
break the existing auth gate. No real authenticated Supabase session was available in this
session, so real card rendering against seeded data, the empty state, and the detail-route link
in a live browser were **not** verified end-to-end — flagged as a limitation, not claimed as
verified.

---

### 2026-07-02 — Stage 4B.3 — Request Detail Data Access + Signed Image URLs

Status: Completed

Completed:

- `src/services/db.ts`: `getRequestForStudio(studioId, requestId)` — queries a single `requests`
  row filtered by both `id = requestId` and `studio_id = studioId`, with a nested
  `request_files(...)` relationship select in one query; returns `null` uniformly for a missing
  request and a cross-studio request (the `.eq("studio_id", ...)` filter simply excludes
  non-matching rows — there is no separate branch that could leak which case occurred); does not
  query by `referenceCode`; internal `RequestDetailDbRecord`/`RequestFileDbRecord` types and
  `mapRequestDetailRow()` mapper (snake_case → camelCase, narrows/validates `status`, throws on
  an unrecognized value) — **not exported** from `src/services/index.ts`; throws on Supabase error
- `src/services/storage.ts`: `createSignedRequestFileUrl(storagePath)` — calls Supabase Storage
  `createSignedUrl()` against the `request-images` bucket via the service_role client, explicit
  3600-second (~1 hour) expiry, throws on signing error — **not exported** from
  `src/services/index.ts`; the only caller is `services/requests.ts`
- `src/services/requests.ts` (new module): thin server-only orchestration composing `db.ts` +
  `storage.ts`. `getAdminRequestDetail(studioId, requestId)` calls `getRequestForStudio()`,
  returns `null` immediately without attempting any signing if that returns `null`; otherwise
  signs every file via `Promise.all`, with each file's signing wrapped in its own try/catch so
  one file's failure cannot reject the whole detail result. Failed files become
  `{ status: "unavailable", id, originalName, type }` (no `signedUrl`); failures are logged as
  `console.warn("[requests] file signing failed", { fileId, reason })` with `reason` classified
  into `"not_found" | "permission_denied" | "unknown"` — the raw Supabase error message and the
  raw `storagePath` are never logged. Exports the public DTOs `AdminRequestDetail` (no
  `storagePath` anywhere in its shape — verified by a dedicated test) and `AdminRequestFile`
  (discriminated union on `status`)
- **This is the one approved exception to "no `services/admin.ts`"** (see
  PROJECT_DECISIONS.md — Stage 4B Admin Dashboard Architecture): `requests.ts` is not a
  feature-oriented service split — `db.ts` and `storage.ts` still own all DB/Storage access
  respectively. The exception is narrow: this operation spans two external providers in one
  logical result and must hide one provider's internal identifiers (`storagePath`) from
  anything crossing out of `src/services/`
- `src/services/index.ts`: exports only the public-safe surface — `getAdminRequestDetail`,
  `AdminRequestDetail`, `AdminRequestFile`. `getRequestForStudio`, `createSignedRequestFileUrl`,
  and all internal DB detail/file types remain unexported, matching the requested export
  boundary
- `src/features/admin/types/index.ts`: re-exports `AdminRequestDetail`, `AdminRequestFile`
  alongside the existing `AdminRequestListItem`/`RequestStatus` re-exports, from `@/services`
- Budget field: `AdminRequestDetail.budget: string | null` included even though the task's field
  list omitted it — confirmed with the developer that this was an oversight in the task spec,
  not a deliberate exclusion; `budget` is a real nullable `requests` column and part of the
  original request form, unlike notes/unread/metrics which are explicitly deferred elsewhere
- 12 new tests in `src/services/__tests__/db.test.ts` for `getRequestForStudio`: queries by both
  `id` and `studio_id`, returns `null` for missing request, returns `null` (same code path) for
  cross-studio request, maps snake_case detail + nested `request_files` to camelCase, maps empty
  files array, throws on unrecognized status, throws on Supabase error (+ message propagation)
- 5 new tests in `src/services/__tests__/storage.test.ts` for `createSignedRequestFileUrl`:
  calls `createSignedUrl` with the exact path and `3600`, uses the `request-images` bucket,
  returns the signed URL, throws on signing error (+ message propagation)
- New `src/services/__tests__/requests.test.ts` (13 tests) for `getAdminRequestDetail`: returns
  `null` without signing when DB detail is `null`, calls `getRequestForStudio` with the right
  args, all-files-succeed → all available, one-of-several-fails → only that file unavailable
  (others still available), a failure does not reject the whole result, logs safe `fileId`/
  `reason` and never the raw `storagePath` or Supabase error text, classifies error messages
  into the three safe reason buckets (parameterized), the returned DTO never contains
  `storagePath` anywhere (JSON-stringified check), non-file fields map through unchanged, DB
  errors propagate uncaught
- No pages/UI, Server Actions, status update, notes/unread/metrics, appointments/calendar,
  tasks, or migrations — out of scope for this step, none needed
- Total tests: 156 (was 130) — all pass
- lint / typecheck / build — all PASS

**Pre-commit cleanup and real Supabase verification (same day, before commit):**

- `RequestDetailDbRecord` and `RequestFileDbRecord` in `src/services/db.ts` changed from
  `export interface` to plain (non-exported) `interface`. Confirmed neither was imported by name
  anywhere outside `db.ts` — `requests.ts` consumes `getRequestForStudio()`'s return type by
  inference only, and `services/index.ts` never re-exported them. `pnpm typecheck` passes
  unchanged, confirming structural typing across the module boundary does not require the named
  export. These internal DB shapes are now fully private to `db.ts`, matching the documented
  "internal DB detail/file types are not exported" boundary.
- Real Supabase verification performed via a temporary, non-committed Vitest test
  (`src/services/__tests__/_tmp-4b3-verify.test.ts`, deleted immediately after the run) that
  called the actual `getAdminRequestDetail()` against the linked project (env loaded from
  `.env.local` via `process.loadEnvFile()`, no new dependency added). Confirmed against one real
  existing request (studio `2617c7d8-...`, 4 real request rows exist, each with 2 real files):
  - the `request_files(...)` Postgrest relationship-select used by `getRequestForStudio()`
    executes correctly against the real database (previously only exercised against mocks)
  - `getAdminRequestDetail()` returns a non-null DTO with exactly the expected top-level keys
    (no extra, no missing)
  - the DTO contains no `storagePath` key anywhere (verified via `JSON.stringify` substring
    check, not a manual read)
  - both real files signed successfully (`status: "available"` for both) and the signed URL had
    a plausible signed-URL shape (`https://` prefix) — the URL value itself was never printed or
    recorded, only a boolean check
  - cross-studio/missing-request behavior was not re-verified against real infra in this pass —
    mocked tests already cover both cases and the task did not require it
- No temporary files remain in the working tree — confirmed via `git status` after deletion.
- `PROJECT_STRUCTURE.md`, `PROJECT_DECISIONS.md`, `PROJECT_ARCHITECTURE.md`,
  `docs/files-structure.md`: updated

---

### 2026-07-02 — Stage 4B.2 — Domain Contracts + Request List Data Access

Status: Completed (not yet committed)

Completed:

- `src/services/db.ts`: `REQUEST_STATUS_OPTIONS` (readonly tuple `"new" | "active" | "booked" |
  "completed" | "rejected"`, source of truth, mirrors the `requests.status` DB `CHECK`
  constraint), `RequestStatus` type, `AdminRequestListItem` DTO (`id`, `referenceCode`,
  `clientName`, `placement`, `size`, `color`, `status`, `createdAt` — no `studioId`, no raw row,
  no file data, no notes/unread/metrics fields), internal `mapRequestListRow()` (snake_case →
  camelCase, narrows/validates `status`, throws on an unrecognized value), `listRequestsForStudio
  (studioId)` (selects only list-DTO columns, scoped by `.eq("studio_id", studioId)`, ordered
  `created_at` descending, throws on Supabase error, returns mapped DTOs) — no `request_files`
  query in this step, per scope
- `src/services/index.ts`: exports `listRequestsForStudio`, `REQUEST_STATUS_OPTIONS`,
  `AdminRequestListItem`, `RequestStatus` alongside existing `db.ts` exports
- `src/features/admin/types/index.ts` and `src/features/admin/config/index.ts` created —
  re-export the above from `@/services` (the barrel, not a deep `@/services/db` import); no
  top-level `src/features/admin/index.ts`, matching the existing `features/request/` pattern
  which also has none
- **Layering decision (approved before implementation):** `AdminRequestListItem`,
  `RequestStatus`, `REQUEST_STATUS_OPTIONS` are defined in `services/db.ts`, not in
  `features/admin/types`/`config`, because `services` must not import from `features` per
  PROJECT_STRUCTURE.md's Dependency Direction, while `db.ts` owns the query and row→DTO
  mapping. `features/admin/types`/`config` re-export from `@/services` as the feature-facing
  import point. Recorded in PROJECT_DECISIONS.md — Stage 4B Admin Dashboard Architecture
- No eslint allowlist change needed — `@/services` (the barrel) was already the standard import
  path used everywhere else in the codebase; no deep import introduced
- **Status model alignment (internal audit + external architecture/product review, before
  commit):** `contacted` replaced with `active`. `in_progress` was proposed and rejected —
  `in_progress` and `booked` are orthogonal dimensions that a single exclusive status field
  cannot encode together. Full semantics, rationale, Stage 4B validation behavior (allowed-value
  check only, no transition graph, no terminal-state enforcement, same-status updates valid),
  future domain direction (appointments/calendar, task/design workflow, notes/activity history —
  all explicitly non-binding, not implemented), and a post-launch discovery checkpoint (~4–8
  weeks after real usage) recorded in PROJECT_DECISIONS.md — Request Status Semantics
- `supabase/migrations/20260702114509_update_request_status_values.sql` created (via
  `pnpm exec supabase migration new`, following the documented migration workflow): backfills any
  existing `status = 'contacted'` rows to `'active'`, then drops and re-adds the
  `requests.status` CHECK constraint (now explicitly named `requests_status_check`) to allow
  `'new', 'active', 'booked', 'completed', 'rejected'`. Does not modify
  `20260622000000_create_requests.sql` or any other previously applied migration.
- **Applied and verified** via `pnpm exec supabase db push` (developer-approved step, separate
  from the implementation pass above): `pnpm exec supabase migration list` confirms Local =
  Remote for all five migrations including `20260702114509`. Post-push verification via
  `pnpm exec supabase db query --linked`: `requests_status_check` exists with exactly
  `CHECK ((status = ANY (ARRAY['new', 'active', 'booked', 'completed', 'rejected'])))`; live row
  counts by status show all 4 existing rows at `status = 'new'` (no other statuses populated
  yet); `SELECT COUNT(*) FROM requests WHERE status = 'contacted'` returns 0. Satisfies
  PROJECT_DECISIONS.md — Database Stage Completion Criteria (migration applied to the real
  Supabase project, affected DB objects verified).
- 7 new tests in `src/services/__tests__/db.test.ts`: studio_id scoping, exact column selection,
  `created_at` descending order, snake_case→camelCase mapping, empty array on no results, throws
  on Supabase error (with message propagation), throws on an unrecognized status value
- 6 additional tests added during the status-model alignment: throws for the retired `'contacted'`
  value specifically (regression guard, not just the generic unknown-status case), and one
  parameterized test per accepted value (`new`, `active`, `booked`, `completed`, `rejected`)
- No detail data access, signed URL helper, admin pages/UI, Server Actions, status update
  endpoint, or Stage 4C work performed — out of scope for this step
- Total tests: 130 (was 117) — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_DECISIONS.md`, `PROJECT_CONTEXT.md`,
  `PROJECT_IMPLEMENTATION_PLAN.md`, `docs/files-structure.md`: updated
- Repository-wide search for stale `contacted` status references performed: only remaining hit
  is the historical Stage 3D.5 log entry below (dated 2026-06-06, describing status values as
  they were corrected to match the DB constraint at that time) — left unchanged as an accurate
  historical record, clearly dated and not describing current state. The original
  `20260622000000_create_requests.sql` migration still contains `'contacted'` in its `CHECK`
  clause text — this is expected and correct: old applied migrations are not modified; the new
  migration supersedes it at the DB level.

---

### 2026-07-02 — Stage 4B.1 — Documentation + Architecture Foundation

Status: Completed (documentation only — no implementation)

Completed:

- Stage 4B.0 read-only architecture/data-access audit completed (no code changes): smallest
  clean server-side architecture for list/detail/signed-URLs/status-update; service vs. route
  vs. Server Component/Server Action responsibility boundaries; DTO shapes; signed URL strategy;
  status-update flow; schema verified directly against migration files (not assumed from docs);
  test strategy; and the Stage 4B scope documentation gap (PROJECT_IMPLEMENTATION_PLAN.md and
  PROJECT_CONTEXT.md still described the original larger Stage 4B task list)
- External architecture review completed on the 4B.0 audit findings; decisions approved
- Stage 4B scope reduced: dashboard metrics, admin notes, and unread/read tracking deferred to
  a new explicit Stage 4C — Admin Dashboard Enhancements (not started, no architecture decided)
- Stage 4B now scoped to: admin request list, request detail, private request images via
  server-generated signed URLs, request status update, empty/loading/error states
- Architecture decisions recorded in `PROJECT_DECISIONS.md` — Stage 4B Admin Dashboard
  Architecture: DB UUID route param (not `referenceCode`, which is sequential/enumerable);
  every page/action calls `getAuthenticatedStudioMember()` independently before any data
  access; every DB read/update scoped by `studio_id = studioId`; Server Components for reads,
  Server Action for status update; `src/services/db.ts` and `src/services/storage.ts` extended
  directly, no `services/admin.ts`; DTO/types in `src/features/admin/types`, UI in
  `src/features/admin/ui`; signed URLs generated only from already studio-scoped file records,
  raw `storagePath` never in a UI DTO; 0-row status update treated as not-found, not success;
  cross-studio access and missing-request both return uniform not-found
- `PROJECT_IMPLEMENTATION_PLAN.md`: Stage 4B task list and exit criteria rewritten to match
  reduced scope; 4B.0 and 4B.1 recorded as completed sub-stages; new Stage 4C added for the
  deferred items; UI-architecture-audit requirement satisfied via a concise note (reuse
  `src/shared/ui`, admin-only UI under `src/features/admin/ui`, no new design system/deps)
  rather than a separate audit stage, since scope is now small enough not to need one
- `PROJECT_CONTEXT.md`: Admin Interface section aligned with reduced current scope; notes/
  unread/metrics marked deferred to Stage 4C
- `PROJECT_ARCHITECTURE.md`: stale generic "Admin Flow" section (implied client-side fetching,
  mentioned notes) replaced with a concrete Stage 4B flow (list / detail+images / status update)
  matching the approved architecture
- No implementation performed: no pages, UI, status action, signed URL logic, or data queries
  added. No optional `src/features/admin/types`/`config` scaffold added either — see rationale
  below
- Total tests: 117 (unchanged — no code touched)
- lint / typecheck / test / build — all PASS (`pnpm qg`)

Note on the optional type/config foundation offered in scope: not added in this pass. The
approved DTO/config shapes (`RequestStatus`, `REQUEST_STATUS_OPTIONS`, list/detail/file DTOs)
are recorded in prose in `PROJECT_DECISIONS.md`/this entry, but creating the actual
`src/features/admin/types` and `src/features/admin/config` files was deferred to the first
implementation step so that adding those files and wiring `PROJECT_STRUCTURE.md`/
`docs/files-structure.md` happens together with their first real usage, rather than landing an
empty scaffold in a documentation-only step.

---

### 2026-07-01 — Stage 4A.8 — Audit fix pass; Stage 4A closed

Status: Completed

Non-blocking findings from the Stage 4A.8 audit addressed:

- **Origin construction:** `getRequestOrigin(headers)` added to `src/services/supabaseAuth.ts`; derives `protocol://host` preferring `x-forwarded-host`/`x-forwarded-proto` (reverse-proxy-set, not client-controlled in production) over the raw `Host` header. Replaces duplicated inline origin logic previously in `googleLoginAction` and `forgotPasswordAction`. No `NEXT_PUBLIC_` env var introduced; local dev and production both continue to resolve correctly (Vercel sets these headers; local dev falls through to `host`).
- **Callback duplication:** documented as an accepted, intentional tradeoff in `PROJECT_DECISIONS.md` (Password Reset section) — `/auth/callback` and `/auth/reset-callback` remain separate, not merged.
- **`getUser()` consistency:** `getOptionalUser(cookies)` extracted in `src/services/auth.ts` — returns the user or `null`, treating `AuthSessionMissingError` as "no user" and rethrowing any other error. `getAuthenticatedStudioMember()` now calls it internally (no behavior change — pure extraction). `login/page.tsx` and `reset-password/page.tsx` now call `getOptionalUser()` instead of the SSR client's `getUser()` directly, so unexpected auth errors are no longer silently discarded. 4 new tests added for `getOptionalUser` in `src/services/__tests__/auth.test.ts` (total 10 tests in file).
- **Admin i18n:** all Stage 4A auth UI strings (login, forgot-password, reset-password, protected-layout header/unauthorized/sign-out) moved from hardcoded English literals to a new `admin` namespace in `src/shared/i18n/messages/en.json`. Server Components and Server Actions use `getTranslations({ locale, namespace: "admin" })` from `next-intl/server` (first use of the server-side next-intl API in this codebase — Client Components previously only used `useTranslations`). Client Components (`LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `SignOutButton`) receive translated strings as props from their Server Component parent rather than calling `next-intl` themselves. No ru/he translations added; no visual or behavioral change — this is a like-for-like string relocation. `(protected)/page.tsx` (Stage 4B admin dashboard placeholder) intentionally left untouched — out of Stage 4A scope.
- Manual end-to-end password-reset verification (flagged as outstanding in the Stage 4A.7.2 log entry) completed successfully.
- No Stage 4B work performed; no password policy or show/hide-password toggle added (both remain in `PROJECT_BACKLOG.md`); no callback merge.
- Total tests: 117 (was 113) — all pass
- lint / typecheck / build — all PASS
- `PROJECT_DECISIONS.md`, `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`, `docs/files-structure.md`: updated

**Stage 4A — Admin Authentication is now CLOSED.** All sub-stages (4A.1–4A.8) complete; audit findings resolved; manual verification complete. Proceeding to Stage 4B.

---

### 2026-07-01 — Stage 4A.8 — Final Architecture & Production Readiness Audit

Status: Completed (audit only, no code changes)

Full audit conducted per PROJECT_PRODUCTION_READINESS.md — Architecture & Documentation Audit Checkpoints protocol. Verdict: READY AFTER MINOR FIXES. No Critical or High findings. Medium/Low findings (origin construction duplication, callback route duplication, admin i18n gap, `getUser()` error-handling inconsistency) addressed in the fix pass above.

---

### 2026-07-01 — Stage 4A.7.2 — Password Reset implementation

Status: Completed

Completed, exactly per the Stage 4A.7.1 documented architecture:

- `app/[locale]/(admin)/admin/forgot-password/page.tsx` + `ForgotPasswordForm.tsx` + `actions.ts`: `forgotPasswordAction(locale, prev, formData)` calls `resetPasswordForEmail(email, { redirectTo })` via SSR auth client (writable cookies); `redirectTo` points at `/auth/reset-callback?locale=<locale>`; always returns `{ sent: true }` regardless of the Supabase result — no user enumeration; `?error=reset` renders an inline expired/invalid-link message; link back to login
- `app/auth/reset-callback/route.ts`: fixed non-locale route, separate from `app/auth/callback/route.ts`; reads `code`/`locale`, validates locale with the same `isSupportedLocale` pattern as the OAuth callback; missing code or `exchangeCodeForSession` error → redirect to `forgot-password?error=reset`; success → redirect to `reset-password`; no authorization or business logic
- `app/[locale]/(admin)/admin/reset-password/page.tsx` + `ResetPasswordForm.tsx` + `actions.ts`: page checks for an active session with a read-only cookie handler; no session → "Reset link has expired or is no longer valid." with a link to `forgot-password`; session present → password + confirm-password form; `resetPasswordAction` validates both fields present and matching, calls `updateUser({ password })`, immediately calls `signOut()` on success, then redirects to `login?reset=success`; generic error message on failure (no technical details)
- `app/[locale]/(admin)/admin/login/page.tsx`: renders inline "Password updated. Please sign in with your new password." on `?reset=success`; added "Forgot password?" link to `forgot-password`; existing email/password and Google OAuth behavior unchanged
- Password minimum length: `minLength={6}` HTML attribute only (matches Supabase's default server-side minimum) — no new validation library, no extracted schema, per the "keep Supabase-level validation only" option
- `proxy.ts`: no change needed — matcher already excludes `/auth` broadly, confirmed before implementation
- No `studio_members` changes; no RBAC; no invite flow; Google OAuth untouched
- No new tests — all three actions and the callback route are Supabase SDK orchestration + Next.js redirects, same category as `loginAction`/`logoutAction`/`app/auth/callback/route.ts` (not tested per strategy); no isolated project-owned logic (e.g. extracted schema or locale-fallback helper) existed to unit-test separately
- Total tests: 113 — all pass (unchanged)
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `docs/files-structure.md`, `PROJECT_STAGE_LOG.md`: updated
- No deviation from the Stage 4A.7.1 documented architecture — `PROJECT_DECISIONS.md`, `PROJECT_ARCHITECTURE.md`, `PROJECT_IMPLEMENTATION_PLAN.md` unchanged

Manual verification still required (not yet performed in this session): forgot-password with existing/non-existing email → same generic message; real email link → `reset-password`; expired/reused/bad code → `forgot-password?error=reset`; password mismatch → inline error; successful reset → forced sign-out → login with new password; `/admin` still requires auth + `studio_members` (unchanged, not touched this stage).

Manual Supabase dashboard setup still required (not code, not committed): add `http://localhost:3000/auth/reset-callback` (and later the production origin) to Authentication → URL Configuration → Redirect URLs; verify the default "Reset Password" email template / `{{ .ConfirmationURL }}`. No new secrets, no Google Cloud changes, no env changes.

---

### 2026-07-01 — Stage 4A.7.1 — Password Reset documentation-first update

Status: Documentation only — implementation not started

Documented (agreed architecture, prior to implementation):

- Routes: `admin/forgot-password/{page,actions}.ts`, `auth/reset-callback/route.ts`, `admin/reset-password/{page,actions}.ts` — both admin pages outside `(protected)`
- Dedicated `/auth/reset-callback`, separate from `/auth/callback` (OAuth-only) — different destination, different risk profile, avoids hidden branching in a route documented elsewhere as "no business logic"
- Full flow recorded: `resetPasswordForEmail` → email → `exchangeCodeForSession` → `reset-password` page → `updateUser({ password })` → forced `signOut()` → redirect to `login?reset=success`
- Recovery session caveat: Supabase does not issue a distinct "recovery-only" session type; the session from `exchangeCodeForSession` is a normal session indistinguishable at the cookie level from a regular login. Accepted MVP mitigation is routing discipline (reset-password outside `(protected)`) + forced sign-out after password update — not a hard session-type barrier. A real barrier would require a client-side Supabase auth client listening for `PASSWORD_RECOVERY`, which does not exist in this codebase (SSR/server-actions only) — rejected as over-engineering for a single low-volume admin
- Expired/invalid link UX: callback failure → `forgot-password?error=reset`; `reset-password` page with no session → "Reset link has expired or is no longer valid." state, not a silent login redirect
- User enumeration: `forgot-password` always returns the same generic message regardless of whether the email exists
- Locale preserved via `?locale=` on `redirectTo`, same mechanism as Google OAuth (4A.6)
- Link scanners/prefetching documented as a known limitation (pre-opened links can consume single-use codes) — no mitigation planned for MVP
- Manual Supabase setup documented: add `/auth/reset-callback` to the Redirect URLs allow-list (dev now, prod later); verify default Reset Password email template; no new secrets, no Google Cloud changes, no env changes
- Test approach documented: no unit tests expected by default (same category as `loginAction`/`logoutAction`/OAuth callback); manual end-to-end verification required
- `PROJECT_STRUCTURE.md` intentionally not updated — documents only files that exist; will be updated during implementation like every prior stage
- No code changes; no package changes
- lint / typecheck / test / build — all PASS (no source changed)

Files updated: `PROJECT_DECISIONS.md`, `PROJECT_ARCHITECTURE.md`, `PROJECT_IMPLEMENTATION_PLAN.md`, `PROJECT_STAGE_LOG.md`

---

### 2026-07-01 — Stage 4A.6 fix — OAuth callback error handling

Status: Completed

Completed:

- `app/auth/callback/route.ts`: missing `code` now redirects to `/${locale}/admin/login?error=oauth` instead of proceeding to `/${locale}/admin`
- `exchangeCodeForSession(code)` result is now checked; on `error`, redirects to `/${locale}/admin/login?error=oauth` instead of unconditionally redirecting to admin
- Previously, a failed or missing code exchange still redirected to `/${locale}/admin`, relying on the protected layout's `unauthenticated` branch to redirect back to login — functionally recoverable but silent (no error surfaced) and slower (extra redirect hop)
- No authorization or business logic added; locale fallback unchanged; admin redirect only reached on confirmed session exchange
- No new tests — same category as the rest of the callback route (Supabase SDK result branching + Next.js redirect, not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS

---

### 2026-07-01 — Stage 4A.6 — Google OAuth

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/login/actions.ts` — `googleLoginAction(locale)` server action added: calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } })` via SSR auth client with writable cookies; redirects the browser to the returned Google consent URL; redirects to `/${locale}/admin/login?error=oauth` on failure
- Chose server-action + `skipBrowserRedirect: true` over a browser Supabase client after explicit evaluation: fully PKCE-correct (code verifier persisted via the same writable `CookieHandler` already used by `loginAction`/`logoutAction`), requires no `NEXT_PUBLIC_` env vars, and introduces no new client-side Supabase client module
- `app/[locale]/(admin)/admin/login/LoginForm.tsx` — added a second, separate `<form>` with a `Google` button wired to `googleAction` (server action passed as prop); no styling beyond existing primitives; kept as a sibling form, not nested, to stay valid HTML
- `app/[locale]/(admin)/admin/login/page.tsx` — binds `googleLoginAction` to locale; reads `?error=oauth` search param and renders an inline error message when present
- `app/auth/callback/route.ts` created: fixed non-locale Route Handler; reads `code` + `locale` query params; exchanges code for session via `supabase.auth.exchangeCodeForSession()` (SSR auth client, writable cookies); redirects to `/${locale}/admin` (`defaultLocale` fallback if `locale` missing/unsupported); no authorization or business logic — admin `(protected)` layout performs the authorization check after redirect, unchanged
- Locale preservation: `redirectTo` passed to `signInWithOAuth` includes `?locale=<locale>`; Google and Supabase preserve this query param through the redirect chain back to `/auth/callback`
- `proxy.ts`: matcher updated to exclude `/auth` (alongside existing `/api`, `/_next`, `/_vercel` exclusions) — without this, the fixed non-locale `/auth/callback` route would have been redirected to `/${defaultLocale}/auth/callback` by the locale-redirect logic, breaking the OAuth round trip. Found and fixed before implementation, per user confirmation.
- No `studio_members` changes; no invite flow; no RBAC; no password reset — out of scope per stage definition. A Google-authenticated user with no `studio_members` row still hits the existing `unauthorized` branch in the protected admin layout (unchanged from Stage 4A.3–4A.5)
- No new tests — both new code paths orchestrate Supabase SDK calls + Next.js redirects, same category as `loginAction`/`logoutAction` (not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `docs/files-structure.md`, `PROJECT_STAGE_LOG.md`: updated

Required manual Supabase/Google dashboard setup (not code, not committed):

1. Google Cloud Console: create an OAuth 2.0 Client ID (Web application). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase Dashboard → Authentication → Providers → Google: enable, paste the Google Client ID and Client Secret.
3. Supabase Dashboard → Authentication → URL Configuration: add the app's `/auth/callback` URL (e.g. `http://localhost:3000/auth/callback` for local dev, plus the production origin) to the Redirect URLs allow-list — `signInWithOAuth`'s `redirectTo` must match an allowed URL or Supabase rejects it.
4. No secrets stored in this repo; Google Client ID/Secret live only in the Supabase dashboard.

Manual verification still required (not yet performed in this session): click Google → complete Google login → return to app → confirm authenticated-but-not-a-`studio_members`-member sees "This account is not authorized." → confirm a `studio_members` member reaches `/admin`.

Concern flagged before Stage 4A.7 (password reset): none blocking. Note that the `?error=oauth` query param on the login page is a plain URL param, not itself a security-sensitive value — no action needed, but worth being aware of when adding the password-reset request/confirm flow, which will introduce its own query-param-carried state (reset token) requiring more care.

---

### 2026-07-01 — Stage 4A.5 fix — Sign out from unauthorized state

Status: Completed

Completed:

- Manual testing found authenticated-but-unauthorized users (no `studio_members` row) had no way to sign out — stuck on "This account is not authorized." with an active session
- `app/[locale]/(admin)/admin/(protected)/layout.tsx`: unauthorized branch now also renders `SignOutButton` (reused as-is) above the message; `boundLogoutAction` moved above both branches so it's available to both
- No changes to `actions.ts` or `SignOutButton.tsx` — fully reused
- No changes to authorization logic or `studio_members`
- No new tests — same rationale as Stage 4A.5 (orchestration only)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STAGE_LOG.md`: updated; `PROJECT_STRUCTURE.md` unchanged (no new files, no responsibility changes)

---

### 2026-07-01 — Stage 4A.5 — Logout

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/(protected)/actions.ts` — `logoutAction(locale)` server action: calls `supabase.auth.signOut()` via SSR auth client with writable cookies, then redirects to `/${locale}/admin/login`
- `app/[locale]/(admin)/admin/(protected)/SignOutButton.tsx` — Client Component; form wired to the locale-bound `logoutAction`
- `app/[locale]/(admin)/admin/(protected)/layout.tsx` — minimal header added (renders only once auth + authorization checks pass): "Admin" label + `SignOutButton`; unauthenticated/unauthorized branches unchanged
- Logout terminates authentication only — no `studio_members` writes, no authorization logic; `getAuthenticatedStudioMember()` remains the sole authorization gate
- No new tests — `logoutAction` orchestrates Supabase SDK + Next.js redirect, same category as `loginAction` (not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`, `docs/files-structure.md`: updated

---

### 2026-06-30 — Stage 4A.4 — Email/Password Login Page

Status: Completed

Completed:

- Route group restructured: `app/[locale]/(admin)/admin/layout.tsx` moved to `app/[locale]/(admin)/admin/(protected)/layout.tsx` and `app/[locale]/(admin)/admin/page.tsx` moved to `(protected)/page.tsx`. This is required: the old layout wrapped the login page, causing an infinite redirect loop for unauthenticated users. The `(protected)` route group excludes the login route. URLs are unchanged.
- `app/[locale]/(admin)/admin/login/actions.ts` — `loginAction(locale, prev, formData)` server action: calls `supabase.auth.signInWithPassword()` via SSR auth client with writable cookies; on success redirects to `/${locale}/admin`; on failure returns `{ error: "Invalid email or password." }` (no technical details exposed)
- `app/[locale]/(admin)/admin/login/LoginForm.tsx` — Client Component; uses `useActionState` for server action integration; inline error display; loading state ("Signing in…") while pending
- `app/[locale]/(admin)/admin/login/page.tsx` — Server Component; reads Supabase session on render; authenticated user → redirect to `/${locale}/admin`; unauthenticated → renders LoginForm with locale-bound action
- Authenticated users visiting `/[locale]/admin/login` are redirected to `/[locale]/admin` (server-side, before page renders)
- Logout remains Stage 4A.5; Google OAuth remains Stage 4A.6
- No new tests for login page — orchestrates Supabase SDK + Next.js redirect (not tested per strategy); `loginAction` error branch is a pass-through of an external SDK result
- Bugfix (pre-commit): `getAuthenticatedStudioMember()` now treats `AuthSessionMissingError` from `getUser()` as `unauthenticated` instead of throwing — unauthenticated access to `/[locale]/admin` now correctly redirects to login instead of crashing. New test added for this case. See `src/services/auth.ts`.
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`: updated

---

### 2026-06-30 — Stage 4A.3 — Admin Route Protection

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/layout.tsx` created: server component auth gate
- Calls `getAuthenticatedStudioMember()` with read-only cookie handler (setAll no-op — server component cannot write cookies; middleware handles refresh)
- No session (`unauthenticated`) → `redirect(`/${locale}/admin/login`)`
- Session but no `studio_members` row (`unauthorized`) → renders `<p>This account is not authorized.</p>`
- Session + membership → renders `{children}`
- `app/[locale]/(admin)/admin/login/page.tsx` created: minimal placeholder so redirect target resolves; no form, no auth logic
- `eslint.config.mjs`: `**/services/auth` added to `import/no-internal-modules` allow-list (same pattern as `supabaseAuth`)
- No new tests — layout orchestrates `getAuthenticatedStudioMember` (already tested 6/6) and Next.js framework behavior (not tested per strategy)
- Total tests: 112 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`: updated

---

### 2026-06-30 — Stage 4A.2 — Shared Authorization Function

Status: Completed

Completed:

- `src/services/auth.ts` created: `getAuthenticatedStudioMember(cookies: CookieHandler)` shared authorization gate
- Returns `AuthResult` discriminated union: `{ ok: true, userId, studioId }` | `{ ok: false, reason: "unauthenticated" | "unauthorized" }`
- Expected auth failures are business outcomes (ok: false); infrastructure errors (Supabase auth error, DB error) throw
- Session identity via SSR auth client (`createSupabaseAuthClient`); membership via service-role client (`supabase`) querying `studio_members`
- Not exported through `services/index.ts` barrel — intentionally imported directly by callers (same pattern as `supabaseAuth.ts`)
- `src/services/__tests__/auth.test.ts` created: 6 tests — authenticated + member, authenticated + no member, unauthenticated, auth error throws, DB error throws, error message propagated
- Total tests: 112 (was 106) — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_DECISIONS.md`, `PROJECT_STAGE_LOG.md`: updated to reflect `AuthResult` discriminated union (was described as `null`-returning in architecture docs)
- Deferred: Supabase generated Database types — `membership.studio_id as string` cast noted; tracked in PROJECT_BACKLOG.md for Stage 5 or earlier

---

### 2026-06-30 — Stage 4A.1 — Supabase SSR Auth Foundation

Status: Completed

Completed:

- `@supabase/ssr 0.12.0` installed as dependency
- `SUPABASE_PUBLISHABLE_KEY` added to `src/config/index.ts` (`config.supabase.publishableKey`) and `.env.example`
- `src/services/supabaseAuth.ts` created: `createSupabaseAuthClient(cookies)` factory using `@supabase/ssr`; reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` directly from `process.env` (does not import `@/config`) to keep service_role config out of the middleware bundle; accepts `CookieHandler` (getAll/setAll) for use in both middleware and server components; scoped to session identity only
- `proxy.ts` extended: session refresh via `supabase.auth.getUser()` after intl middleware runs; cookie read/write wired to request/response; no auth logic, no redirects; i18n behavior unchanged
- `eslint.config.mjs`: `**/services/supabaseAuth` added to `import/no-internal-modules` allow list (intentionally not exported through barrel)
- `docs/project/PROJECT_STRUCTURE.md`: `supabaseAuth.ts` entry updated from planned to implemented
- Quality gates: lint ✓, typecheck ✓, 106/106 tests ✓, build ✓

Note: `.env.local` requires `SUPABASE_PUBLISHABLE_KEY` set to the publishable key from the Supabase dashboard (Settings → API Keys → Publishable key). A placeholder is present; replace before running any auth flow.

---

### 2026-06-30 — Stage 4A — Admin Authentication (architecture documentation)

Status: Documentation only — implementation not started

Documented:

- Authentication vs Authorization distinction: Supabase session proves identity; `studio_members` row proves access; both required
- Two Supabase clients: service_role client (existing, DB/Storage) + SSR auth client (new in 4A, session identity only)
- `proxy.ts` role clarified: sole Next.js middleware entry point; will be extended with SSR session refresh; must not create parallel `middleware.ts`
- Admin route protection: no session → redirect to login; session without `studio_members` row → unauthorized page; session + row → admin content
- `getAuthenticatedStudioMember()` planned in `src/services/auth.ts`: returns `AuthResult` discriminated union (`{ ok: true, userId, studioId }` | `{ ok: false, reason }`); Stage 4B handlers must call this and scope data by `studioId`
- Login: `app/[locale]/(admin)/admin/login/page.tsx`; email/password; Google OAuth if feasible
- OAuth callback: `app/auth/callback/route.ts` — code exchange and redirect only; no business logic
- Logout: clears session, locale-aware redirect to login
- Password reset: request-link flow + reset page; recovery session must not grant admin access prematurely
- Manual admin activation: developer inserts `studio_members` row; no invite flow, no RBAC
- Stage 5 boundary: application-layer auth enforcement in Stage 4 is an accepted temporary risk; RLS deferred to Stage 5
- Stage 4A implementation sequence (4A.1 → 4A.8) documented in PROJECT_IMPLEMENTATION_PLAN.md

Files updated: PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_STRUCTURE.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_STAGE_LOG.md

No code changes.

---

### 2026-06-30 — Stage 3D.6 — Domain Foundation

Status: Completed

Completed (3D.6.2 — Application Wiring):

- `DEPLOYMENT_STUDIO_ID` added to `.env.example` and `src/config/index.ts` (`config.app.deploymentStudioId`)
- `uploadRequestFiles()` in `src/services/storage.ts`: accepts `studioId` as new second parameter; storage path changed from `{clientSubmissionId}/{type}/{file}` to `{studioId}/{clientSubmissionId}/{type}/{file}`; all existing cleanup/retry behavior unchanged
- `CreateRequestParams` in `src/services/db.ts`: `studioId` field added; `p_studio_id` passed as first argument to `create_request` RPC
- Route handler (`app/api/request/route.ts`): `resolveStudioId()` helper reads `config.app.deploymentStudioId`; `studioId` resolved once and passed to both `uploadRequestFiles` and `createRequest`; resolver is isolated so it can be replaced by slug/domain resolution in Stage 4 without touching the rest of the handler
- Tests updated: `STUDIO_ID` constant added to storage and route fixtures; storage path expectations updated throughout; `p_studio_id` added to db RPC assertion; `@/config` mocked in route.test.ts; two new route assertions added (passes studioId to upload, passes studioId to createRequest)
- Total tests: 106 (was 104) — all pass
- lint / typecheck / build — all PASS

Completed (3D.6.1 — DB Migration):

- `supabase/migrations/20260629154719_domain_foundation.sql` applied to remote
- `studios` table: id (UUID PK, fixed seed `2617c7d8-23bb-4269-ab2e-fd104c3d12b8`), name, created_at; GRANT INSERT/SELECT/UPDATE to service_role
- `studio_id` UUID column added to `requests`; all existing rows backfilled to Masha's studio UUID; NOT NULL enforced; FK constraint added
- `studio_members` table: composite PK (user_id, studio_id), references auth.users + studios; GRANT INSERT/SELECT/DELETE to service_role; starts empty (populated in Stage 4A)
- Old `create_request` RPC (12 params) dropped; new `create_request` (13 params, adds p_studio_id) created; REVOKE from PUBLIC / GRANT EXECUTE to service_role
- Migration list confirmed: all 4 migrations Local = Remote
- Quality gates at audit time: 106 tests PASS, lint PASS, typecheck PASS, build PASS

---

### 2026-06-29 — Stage 3D.6 — Domain Foundation (planning update after architecture review)

Status: Planning updated — implementation pending

Additional decisions recorded:

- Storage path structure changed: `{clientSubmissionId}/{type}/{file}` → `{studioId}/{clientSubmissionId}/{type}/{file}`
  Reason: aligns storage ownership with studio model; makes future Storage RLS policies straightforward.
  Existing stored paths remain valid (DB stores full path); only new uploads use the new structure.
- RLS confirmed NOT included in Stage 3D.6. All three new/updated tables (`studios`, `studio_members`, `requests`) remain without RLS policies until Stage 5. Access goes through service_role only.
- Authentication and authorization model documented: Auth session proves identity; `studio_members` row proves access. Stage 4A must enforce both.
- Staging environment (Supabase + Vercel preview) deferred to Stage 5 as an explicit decision point — not required before 3D.6 or 4A.
- Deferred items confirmed: role column, is_active/soft-delete, invite flow, billing, multi-studio routing.

### 2026-06-28 — Stage 3D.6 — Domain Foundation (initial planning)

Status: Superseded by 2026-06-29 update above

Decisions recorded:

- `studios` and `studio_members` tables defined; schema documented in PROJECT_DECISIONS.md
- `studio_id` FK column will be added to `requests`; backfill strategy for existing rows documented
- `create_request` RPC will be updated to accept `p_studio_id`
- `DEPLOYMENT_STUDIO_ID` env var chosen for single-studio route resolution
- `studio_members` supersedes the earlier `admin_profiles` direction; 4A will use `studio_members` as the access gate
- `getRequestByClientSubmissionId()` confirmed to remain global (no studio filter)
- Stage placed before 4A due to zero-data migration cost
- Stage 3D.6 added to PROJECT_IMPLEMENTATION_PLAN.md with full scope, exit criteria, and deferred items

No code changes.

---

### 2026-06-24 — Stage 3D.5.3 — Supabase CLI Migration Workflow

Status: Completed

Completed:

- Supabase CLI v2.107.0 installed as project devDependency (`pnpm add -D supabase`)
- `pnpm exec supabase` confirmed as the canonical invocation going forward
- `supabase init` run: `supabase/config.toml` and `supabase/.gitignore` created
- Project linked to remote: `supabase link --project-ref vjjvouihcvqmupjojgrs`
- Pre-repair audit: `migration list` confirmed all three migrations had empty Remote column (expected — all were applied manually via SQL Editor; `supabase_migrations.schema_migrations` was empty)
- Migration history repaired (metadata only, no schema changes):
  - `20260622000000` → applied
  - `20260622000001` → applied
  - `20260623000000` → applied
- Post-repair `migration list` confirmed Local = Remote for all three migrations
- Global binary (`C:\Users\danik\AppData\Local\supabase\`) removed; project-local CLI verified working independently
- lint / typecheck / tests (104/104) / build — all PASS

---

### 2026-06-23 — Stage 3D.5 — Architecture & Documentation Audit / Fix Pass

Status: Completed

Audit (3D.5.1):

- Full audit of all PROJECT_* docs, code, migrations, and tests after Stage 3D completion
- Findings: 2 Critical (stale stage log, missing 3D.5 in plan), 3 High (client_name nullable, BUCKET duplicate, stale current focus), several Medium/Low doc gaps
- No code correctness issues found; all quality gates passed; idempotency flow confirmed correct

Fix pass (3D.5.2):

- `PROJECT_STAGE_LOG.md`: removed stale "Next expected step: Stage 3D" block; updated current focus; added completed stages list
- `PROJECT_IMPLEMENTATION_PLAN.md`: added Stage 3D.5 sub-stage under Stage 3D; added Stage 3D.5.3 planned sub-stage
- `PROJECT_CONTEXT.md`: added `clientName` to Request Form scope; corrected status values to match DB CHECK constraint (`new / contacted / booked / completed / rejected`)
- `PROJECT_BACKLOG.md`: removed stale Route-Level Tests backlog item (tests added in Stage 3D.0)
- `PROJECT_STRUCTURE.md`: added `getRequestByClientSubmissionId()` to services/db.ts section
- `src/services/storage.ts`: exported `BUCKET` constant
- `app/api/request/route.ts`: removed local `BUCKET` definition; imports from `@/services`
- `app/api/request/__tests__/route.test.ts`: added `BUCKET` to `@/services` mock
- `supabase/migrations/20260623000000_make_client_name_not_null.sql`: backfills null `client_name` rows with `[unknown]`, then enforces `NOT NULL` constraint; patch SQL applied manually to live Supabase project
- `PROJECT_PRODUCTION_READINESS.md`: added Architecture Audit Checkpoints section; added E2E integration testing section reference; updated migration workflow note
- `PROJECT_BACKLOG.md`: added Migration Workflow and Automated E2E Tests sections

Documentation sync (3D.5.3 prep):

- `PROJECT_IMPLEMENTATION_PLAN.md`: added Stage 3D.5.3 — Supabase CLI Migration Workflow
- `PROJECT_PRODUCTION_READINESS.md`: added Architecture Audit Checkpoints section
- Confirmed all planned future items already documented: Repeat Client Indicator ✓, AI Tattoo Title ✓, performance validation ✓, E2E test coverage ✓, dependency/security review ✓

---

### 2026-06-22 — Stage 3D.0 — Request Identity & Idempotency

Status: Completed

Completed:

- `supabase/migrations/20260622000001_add_client_submission_id_unique.sql` created:
  - `ALTER TABLE requests ADD CONSTRAINT requests_client_submission_id_key UNIQUE (client_submission_id)`
  - Separate migration from Stage 3C.3 — applies cleanly on top of the already-deployed schema
- `getRequestByClientSubmissionId(clientSubmissionId)` added to `src/services/db.ts`:
  - queries `requests` table by `client_submission_id` using `.maybeSingle()`
  - returns existing `reference_code` as string, or `null` if not found
  - throws on Supabase error
  - exported through `src/services/index.ts`
- Route handler (`app/api/request/route.ts`) updated with three-path idempotency flow:
  1. Pre-upload lookup: if `clientSubmissionId` already exists → log `[route] idempotent replay: REQ-XXXX` → return `{ ok: true, referenceCode }` immediately (no upload, no DB insert)
  2. Normal path: lookup returns null → upload files → create request → return `{ ok: true, referenceCode }`
  3. Race-condition fallback: `createRequest` throws with unique constraint message → cleanup uploaded files → re-fetch by `clientSubmissionId` → if found: log `[route] idempotent race recovered: REQ-XXXX` → return `{ ok: true, referenceCode }`; if not found: return 500
- All three paths return identical `{ ok: true, referenceCode }` response shape — client cannot distinguish them
- Race detection: string-matches `"23505"` (Postgres unique violation code) or `"unique constraint"` in error message; all other DB errors remain 500
- `app/api/request/__tests__/route.test.ts` created: 11 route-level tests covering:
  - normal success flow
  - upload order (uploadRequestFiles called before createRequest)
  - replay returns existing referenceCode
  - replay does not call uploadRequestFiles or createRequest
  - response shape identity between normal and replay
  - race: cleanup + fetch existing → success
  - race: cleanup + fetch returns null → 500
  - non-unique DB error → 500 (no race recovery attempted)
  - payload validation failure
  - file validation failure
- `src/services/__tests__/db.test.ts` updated: 4 new tests for `getRequestByClientSubmissionId` (returns code, returns null, throws on error, includes error message); total 10 tests in file
- Total tests: 104 (was 89) — all pass
- lint / typecheck / build — all PASS

Architecture confirmed before implementation:
- Option A (route-level lookup) chosen over Option B (RPC-level upsert) — keeps `create_request` RPC as pure insert; deduplication logic in the orchestration layer where it belongs
- Both replay paths (lookup hit and race recovery) log distinct messages but return identical response
- UNIQUE constraint is the DB safety net; application-level lookup is an optimization to avoid unnecessary uploads on replays

---

### 2026-06-22 — Stage 3C.3.5 — Client Name

Status: Completed

Completed:

- `clientName` field added to `requestFormSchema`: required, `.trim()`, min 2, max 30
- `CLIENT_NAME_REQUIRED`, `CLIENT_NAME_TOO_SHORT`, `CLIENT_NAME_TOO_LONG` added to `VALIDATION_KEYS`
- `MESSAGE_TO_I18N_KEY` in `lib/errors.ts` updated with three new mappings
- `REQUEST_FIELDS.clientName` added to BFF
- `ParsedRequestPayload.clientName: string` added; `parseRequestFormData` reads the field from FormData
- `CreateRequestParams.clientName` updated from `string | undefined` to `string`; `?? null` fallback removed from RPC call
- Route handler wired: `clientName: payload.clientName` replaces the previous `clientName: undefined` placeholder
- `RequestForm.tsx`: `clientName` TextInput added as first form field; `defaultValues` and `FormData.append` updated
- i18n: `clientNameLabel`, `clientNamePlaceholder`, `errors.clientNameRequired`, `errors.clientNameTooShort`, `errors.clientNameTooLong` added to `en.json`
- No DB migration needed — `client_name TEXT` column already exists in `requests` table (added in Stage 3C.3)
- Tests: 8 new + existing fixtures updated — schema (6 new: required, too-short, too-long, trim, boundary 2, boundary 30), BFF parsing (2 new: parses clientName, absent → empty string), FormData assertion added to submission test, db fixture updated (clientName: undefined → "Alex", p_client_name null assertion → string assertion)
- Total tests: 89 (was 81) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-22 — Stage 3C.3 — Request Persistence

Status: Completed (migration applied, end-to-end verified)

Completed:

- `supabase/migrations/20260622000000_create_requests.sql` created:
  - `request_seq` sequence (global, no yearly reset)
  - `requests` table: id (UUID PK), reference_code (UNIQUE), client_submission_id (UNIQUE), description, placement, size, color, email, phone, contact_other, consent, status (default 'new'), read_at (nullable), created_at
  - `request_files` table: id (UUID PK), request_id (FK → requests, CASCADE), type, storage_path, original_name, mime_type, size, created_at
  - RLS enabled on both tables; no policies (service_role key bypasses RLS)
  - `create_request(...)` RPC function: atomically inserts request + files, generates `reference_code` (`REQ-YYYY-NNNN`), returns `{ id, referenceCode }`
- `src/services/db.ts` created: `createRequest(params)` calls RPC, maps optional fields to null, returns `CreatedRequest`
- `src/services/index.ts` updated: exports `createRequest` and `CreatedRequest`
- `app/api/request/route.ts` updated:
  - calls `uploadRequestFiles` then `createRequest` in sequence
  - on DB failure: cleanup uploaded storage files, log attempt and result, return 500
  - returns `{ ok: true, referenceCode }` (replaces temporary UUID placeholder)
- `src/features/request/ui/RequestForm.tsx` updated: `requestId` → `referenceCode`; reads `response.referenceCode`; renders via `successReferenceCode` i18n key
- `src/shared/i18n/messages/en.json` updated: `successRequestId` → `successReferenceCode` with `{referenceCode}` interpolation
- `src/services/__tests__/db.test.ts` created: 5 tests — correct RPC call, null optional fields, empty files, RPC error throws, error message propagated
- `src/features/request/__tests__/RequestForm.submission.test.tsx` updated: all `requestId` mock values replaced with `referenceCode`
- Total tests: 81 (was 74) — all pass
- lint / typecheck / build — all PASS

Post-implementation fixes during migration runtime debugging:

- `GRANT USAGE, SELECT ON SEQUENCE request_seq TO service_role` — sequence not auto-granted to service_role in Supabase SQL migrations
- `GRANT INSERT, SELECT, UPDATE ON TABLE requests TO service_role` — table permissions not auto-granted either
- `GRANT INSERT, SELECT ON TABLE request_files TO service_role` — same root cause
- Root cause documented: Supabase `service_role` has `BYPASSRLS` but does NOT receive table/sequence permissions automatically when schema is created via SQL (unlike dashboard-created tables); all grants must be explicit in migration
- `UPDATE` on `requests` included proactively for admin panel status/read_at updates (Stage 4B)
- `SECURITY DEFINER` evaluated and rejected in favour of explicit grants — maintains least privilege, respects RLS model

End-to-end verification (manual, real Supabase):

- Migration applied successfully in Supabase SQL Editor
- `requests` and `request_files` tables created with RLS enabled
- `create_request` RPC function verified in Database → Functions
- `request_seq` sequence created and accessible to `service_role`
- Real form submission completed end-to-end
- `referenceCode` generated correctly (`REQ-2026-NNNN` format)
- Request record persisted in `requests` table
- File records persisted in `request_files` table
- Files visible in Supabase Storage under `{clientSubmissionId}/reference/` and `.../placement/`
- Success screen displays `referenceCode`
- Cleanup-on-failure path verified during debugging (storage files deleted on DB error)

---

### 2026-06-21 — Documentation sync before Stage 3C.3

Status: Documentation only

Decisions recorded:

- **Reference Code**: human-facing `referenceCode` field (`REQ-YYYY-NNNN`) — server-generated, stored in DB, shown on success screen and in admin panel. DB UUID remains primary key; `clientSubmissionId` remains technical idempotency/storage identifier. See PROJECT_DECISIONS.md — Reference Code Decision.
- **Client Name**: required `clientName` field added to product scope. Dedicated small stage `3C.3.5` added before admin work. See PROJECT_DECISIONS.md — Client Name Decision.
- **AI Tattoo Title**: recorded as a post-MVP backlog idea only — no architecture work, no DB column reserved. See PROJECT_BACKLOG.md.

Plan updates:

- `3C.3` updated: `referenceCode` generation added to scope; `clientName` column noted in schema task
- `3C.3.5` added: dedicated Client Name field stage
- `3D.0` updated: deduplication returns existing `referenceCode` from DB
- `requestId` terminology clarified throughout plan: `requestId` in historical log entries preserved as-is (refers to the temporary placeholder value); `referenceCode` used for the permanent human-facing identifier going forward

No code changes.

---

### 2026-06-21 — Stage 3C.2.2 — Storage Integration

Status: Completed

Completed:

- `src/services/storage.ts` created: `uploadRequestFiles(files, clientSubmissionId)` — uploads reference and placement images to `request-images/{clientSubmissionId}/{type}/` with deterministic filenames (`reference-01.jpg`, `placement-01.jpg`, ...)
- Per-file retry: up to 3 attempts, exponential backoff (200ms base), transient errors only (`isTransientError()` checks network/timeout/5xx keywords)
- Cleanup on failure: tracks uploaded paths, calls `supabase.storage.remove()` on partial failure — logs attempt and result, does not rethrow cleanup errors
- `UploadedFile` and `FileType` types exported through `src/services/index.ts`
- Route handler (`app/api/request/route.ts`) updated: `uploadRequestFiles` called after `validateFiles`; temporary success response unchanged
- 8 tests in `src/services/__tests__/storage.test.ts`: upload success, empty files, retry success, retry exhaustion, non-transient no-retry, partial cleanup, cleanup failure logging, no cleanup when nothing uploaded
- Total tests: 74 (was 66) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-21 — Stage 3C.2.1 — Storage Foundation

Status: Completed

Completed:

- `clientSubmissionId` field added to `REQUEST_FIELDS` constant
- `ParsedRequestPayload` interface updated: `clientSubmissionId: string` added
- `UUID_REGEX` and `ClientSubmissionIdError` added to `src/bff/request.ts`; `parseRequestFormData` validates presence and UUID v4 format — throws `ClientSubmissionIdError` on failure
- `ClientSubmissionIdError` exported through `src/bff/index.ts`
- Route handler updated: catches `ClientSubmissionIdError` and returns 400 with structured `VALIDATION_ERROR` (not 500)
- `RequestForm.tsx`: `clientSubmissionId` generated once via `useState(() => crypto.randomUUID())`, appended to FormData on every submit
- Tests updated: `clientSubmissionId` added to all `validPayload` fixtures; 5 new tests added (parses id, missing → throws, invalid → throws, UUID v1 rejected, UUID v4 accepted, FormData includes valid UUID)
- Total tests: 66 (was 61) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-21 — Stage 3C.2 — Architecture Review (documentation only)

Status: Documentation sync completed

Decisions recorded:

- Image Proxy rejected; signed URLs chosen for admin image access (technical review completed)
- Single private bucket `request-images` confirmed
- Folder structure: `request-images/{clientSubmissionId}/{type}/`
- Storage filenames: deterministic by type and index; originalName as DB metadata only
- `clientSubmissionId` moved forward from Stage 3D into Stage 3C.2.1 (storage use only)
- Upload reliability: per-file retry, 2–3 attempts, exponential backoff, transient failures only
- Failure handling: all-or-nothing; cleanup + logging on upload failure and DB failure
- Stage 3C.2 split into 3C.2.1 (Storage Foundation) and 3C.2.2 (Storage Integration)
- PROJECT_DECISIONS.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_STAGE_LOG.md updated

No code changes.

---

### 2026-06-21 — Stage 3C.1 — Supabase Foundation

Status: Completed

Completed:

- `@supabase/supabase-js 2.108.2` added as dependency
- `.env.example` created with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
- `src/config/index.ts` populated: `requireEnv()` helper, `config.supabase.url` + `config.supabase.secretKey` — throws at module load if env vars missing
- `src/services/supabase.ts` created: server-side Supabase client with `persistSession: false`
- `src/services/index.ts` updated: exports `supabase` through public API
- `docs/project/PROJECT_DECISIONS.md` updated: MVP Quality Standard, Admin Authentication Requirement, Quality Gates Policy
- `docs/files-structure.md` updated
- Connection verification: manual — `pnpm dev` startup throws immediately if env vars are missing; first real DB query in Stage 3C.3 will confirm network connectivity
- lint / typecheck / tests (61/61) / build — all PASS

---

### 2026-06-20 — Stage 3B Pre-3C Fixes

Status: Completed

Completed:

- `ParsedRequestPayload.consent` typed as `true | undefined`; unsafe `(undefined as unknown as true)` cast removed from `parseRequestFormData`
- `RequestForm.tsx`: success branch now gates on `response.ok === true`; `requestId` stored as `response.requestId ?? null` and rendered conditionally — decouples success state from requestId presence
- `en.json`: removed "(optional)" from Email, Phone, Other contact labels — redundant with existing contact section hint
- Contact validation timing: confirmed implementation bug — `z.literal(true)` returns `INVALID` (aborted) when consent is missing, which causes `ZodObject` to abort entirely, skipping `superRefine`. Result: contact group error and any server-side file error never appear on first submit when consent is also missing. Fix: replaced `z.literal(true)` with `z.custom<true>(v => v === true, { message: K.CONSENT_REQUIRED, fatal: false })` — non-fatal custom validation marks dirty instead of aborting, so `superRefine` always runs. All 54 tests pass.

---

### 2026-06-20 — Stage 3B.5 — File Transport Validation

Status: Completed

Completed:

- `validateFiles()` added to `src/bff/validateFiles.ts`: checks MIME type and file size per field, returns `FileValidationResult`
- allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`
- max file size: 10 MB per file; first failing file per field stops further checks on that field
- `ValidationErrorResult` reused — errors surface through existing `fieldErrors` contract
- `src/bff/index.ts` updated: exports `validateFiles` and `FileValidationResult`
- `app/api/request/route.ts` updated: sequential flow — `validateRequestPayload` first, then `validateFiles`
- `file_type_invalid` and `file_too_large` keys added to `MESSAGE_TO_I18N_KEY` and `en.json`
- upload format hint (`uploadFormatsHint`) added to `en.json`; both `FileUploadInput` fields in `RequestForm` show combined hint
- 9 new tests in `src/bff/__tests__/validateFiles.test.ts`; all 54 tests pass; lint, typecheck, build — PASS

---

### 2026-06-20 — Stage 3B.4 — Server Validation UX

Status: Completed

Completed:

- `setError` extracted from `useForm` in `RequestForm.tsx`
- `onSubmit` updated: when API returns `ok: false` with `code === "VALIDATION_ERROR"`, maps `fieldErrors` entries to `setError(field, { message })` using first error per field
- `status` reset to `"idle"` after field errors are set — form stays interactive for retry
- Empty `fieldErrors` with `VALIDATION_ERROR` falls back to generic `"error"` status
- Non-validation errors keep existing generic error behavior unchanged
- 3 new tests: fieldErrors mapped to field UI, empty fieldErrors → generic error banner, retry after validation error
- all 45 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Stage 3B.3 — Server validation

Status: Completed

Completed:

- `validateRequestPayload()` added to `src/bff/request.ts`: reuses `requestFormSchema.safeParse()`, returns typed `ValidationResult`
- `parseRequestFormData()` updated: consent `"true"` string converted to boolean `true`
- `ParsedRequestPayload` updated: `consent: true` (boolean literal)
- `POST /api/request` route handler updated: validates payload, returns 400 + structured error or 500 on exception
- Error contract: `{ ok: false, error: { code: "VALIDATION_ERROR", fieldErrors, formErrors } }` for validation failures
- `src/bff/index.ts` updated: exports `validateRequestPayload` and new types
- `eslint.config.mjs`: added `features/*/validation` to allow-list for BFF import
- `PROJECT_STRUCTURE.md`: dependency rule updated — `bff → features/*/validation` explicitly allowed
- 10 new tests in `src/bff/__tests__/validateRequestPayload.test.ts`; 2 existing tests updated in `request.test.ts`
- all 42 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Documentation — Stage 3B.4 Server Validation UX added to plan

Status: Documentation only

Notes:

- Added Stage 3B.4 — Server Validation UX to PROJECT_IMPLEMENTATION_PLAN.md immediately after Stage 3B.3.
- Scope: consume server `fieldErrors` response, map to RHF `setError()`, display per-field server errors, preserve existing client-side UX.
- Former Stage 3B.4 (File transport) renumbered to Stage 3B.5.
- No code changes.

---

### 2026-06-06 — Stage 3B.2 — Success / Error UX

Status: Completed

Completed:

- local submit state machine: idle → submitting → success | error
- success: form replaced with inline success block showing requestId from API response
- error (API failure or network error): inline alert banner, form remains visible for retry
- loading: button disabled, text switches to "Sending…" key
- 5 new i18n keys added to `request` namespace: submitButtonLoading, successTitle, successMessage, successRequestId, errorMessage
- 4 new tests added: success state, error (API), error (network), retry flow
- all 30 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Documentation — Request Identity & Idempotency decision recorded

Status: Documentation only

Notes:

- Production requirement identified during Stage 3 review: without a deduplication mechanism, users can accidentally submit duplicate requests (refresh, network retry, repeated taps).
- Decision recorded in PROJECT_DECISIONS.md: introduce `clientSubmissionId` (UUID), generated on the client before submission, stored in the database with a unique constraint.
- Server behavior defined: idempotent — if `clientSubmissionId` already exists, return existing request info without creating a duplicate.
- UX goal added: user and artist both receive the same request reference ID; Telegram notifications include it.
- Stage 3D added to PROJECT_IMPLEMENTATION_PLAN.md as the dedicated implementation stage for this story.
- Former Stage 3D (Notifications and Stabilization) renamed to Stage 3E; sub-stage labels updated accordingly.
- Not assigned to Stage 3B.2.

---

### 2026-06-06 — Stage 3B.1 — Payload contract + API route + first end-to-end submit

Status: Completed

Completed:

- FormData contract defined: text fields + repeated file keys (referenceImages, placementImages), optional fields omitted when empty, consent as string "true"
- src/bff/request.ts: ParsedRequestPayload interface + parseRequestFormData()
- src/bff/index.ts: exports parseRequestFormData and ParsedRequestPayload as public API
- app/api/request/route.ts: POST handler, parses FormData via BFF, returns { ok: true, requestId: uuid }
- RequestForm.tsx: onSubmit replaced with real fetch to /api/request, console.log on response

---

### 2026-06-06 — Stage 3 — Planning sync (round 2)

Status: Planning completed

Notes:

- File data model direction confirmed: typed file collection (type, storagePath, originalName, mimeType, size)
- Two upload inputs on current form confirmed: reference images and placement images — map to type values
- Mobile upload requirement clarified: native file input for MVP (gallery/camera/files); no advanced upload UI needed now
- Image Proxy technical review scheduled for start of Stage 3C.2
- .env.example / env var documentation scheduled for Stage 3C.1
- Stale backlog item removed: "real upload flow to storage" (now Stage 3C task, not backlog)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_BACKLOG.md updated

---

### 2026-06-06 — Stage 3 — Planning sync

Status: Planning completed

Notes:

- Stage 3A (form UI) confirmed complete via codebase audit
- Backend slice (API, storage, database) not yet started — confirmed
- Stage 3 execution plan approved: sub-stages 3B → 3C → 3D defined in PROJECT_IMPLEMENTATION_PLAN.md
- Storage direction approved: Supabase Storage, private bucket
- Service layer rule documented: no provider abstractions, YAGNI-compliant
- File access decision documented: Image Proxy through BFF (pending short technical review before implementation)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md updated to reflect all decisions

---

### 2026-04-08 — Stage 2 — Public Pages

Status: Completed

Completed:

- Home sections (hero, gallery placeholder, how it works, about)
- Policies page with full content
- Aftercare page with full content
- Location page
- CTA links verified — all lead to /request
- Navigation links verified across all public pages

### 2026-03-24 — Stage 2 — Public Pages (partial)

Status: Superseded

Completed at that point:

- Home sections (Gallery, How It Works, About)
- Policies page
- Location page

---

### Stage 1 — App Shell & Navigation

Status: Completed

Completed:

- Layout and navigation implemented
- Route groups created (public, admin)
- Base pages added (home, policies, location)
- Responsive navigation (mobile + desktop)
