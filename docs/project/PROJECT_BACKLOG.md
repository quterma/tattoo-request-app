# PROJECT_BACKLOG

Items here are candidates for future work that are not yet assigned to a stage.
Larger post-launch initiatives are tracked in PROJECT_IMPLEMENTATION_PLAN.md — Stage 2 (Post-Launch Roadmap).

**Stage 5D findings rule:** Stage 5D (Full Application Maturity Audit + Targeted Fix Pass — see
PROJECT_IMPLEMENTATION_PLAN.md) will produce findings classified as must-fix / fix-if-small /
defer / reject. Any finding classified as "defer deliberately" must be recorded here with a short
rationale and a pointer to the audit report or Stage 5D closure entry (PROJECT_STAGE_LOG.md) —
not silently dropped. Stage 5D deferred findings are recorded in the entries below (see the
2026-07-09 Fix Pass 2 entry in PROJECT_STAGE_LOG.md for the full fix/defer/reject reconciliation).

---

## UX / Product Improvements

**Absorbed into Stage 6 documentation (2026-07-12):** the items below are now covered by the
Stage 6 Source of Truth documents — `STAGE_6_PRODUCT_DEFINITION.md` (PRD) and
`STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS). They are kept here struck-through as the record of
where the ideas originated; the PRD/FS versions govern. Do not implement from this list.

- ~~FAQ as accordion on /policies page (after content stabilization)~~ — FAQ's canonical page is
  Process (FS §5); presentation per FS §5 ("expandable details where appropriate")
- ~~Add "Not a Fit" block (small tattoos, rush jobs, no concept, low budget)~~ — PRD D7 (Good Fit
  content with respectful redirect); canonical Good Fit content on Process (FS §3.2)
- ~~Sharpen positioning on Home (3–6 hour sessions, large-scale work, Masha's style)~~ — Home
  spec: Hero one-line specialization + Good Fit teaser (FS §3.1, PRD D7)
- ~~Price framing ("starting from …", filtering out low-budget clients)~~ — PRD D8 (Home price
  teaser, canonical pricing on Process); FS §3.1/§3.2/§5
- ~~Client expectations section (trust the artist's style, multiple sessions, no
  micro-revisions)~~ — Process page content (FS §3.2: Design Process, Good Fit); owner-authored
  copy per FS §3
- ~~Curated gallery: 5–8 strong works instead of full feed~~ — FS §3.1 Featured Work (4–8
  owner-curated images)

### Footer contact links — post-launch A/B candidate (Stage 6 UX blueprint decision, 2026-07-13)

The Stage 6 blueprint removes the `mailto:`/`tel:` links from the global public footer (footer
becomes studio name + address + Instagram + copyright) — see PROJECT_DECISIONS.md, Stage 6 UX
Blueprint Decisions, "Global footer". The owner considered keeping them behind a styled contact
block and A/B-testing which converts better; that test is impossible in Stage 6 (analytics is a
PRD §4 Non-Goal), so the idea is parked here. **When:** post-launch, only if analytics tooling
is ever adopted (PRD Future Scope) or if real-world demand for direct contact appears — in the
latter case restoring the two links is a one-line change and needs no test.

---

## Request Form Improvements

- **Field model authority (2026-07-12):** the Stage 6 request-form field model is defined in
  STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.2 (which supersedes the PROJECT_CONTEXT.md Request Form
  section for Stage 6). The FS's field-inclusion rule forbids adding any field outside its table
  without escalation. The following remain post-MVP candidates, but each now requires a PRD/FS
  change first (PRD §9 Change Control) before implementation:
  - ~~budget range~~ — **resolved 2026-07-14: an optional free-text Budget field was added to
    FS §4.2 (field 12) by owner decision; now in Stage 6 scope via Item 3, not a backlog candidate.**
    (The shipped form already carried a `budget` field; Item 3 keeps it and brings it into FS
    compliance.)
  - willingness to wait

- File upload: prevent selecting the same file twice before submit. Nice-to-have, small,
  optional — post-release polish or an easy pre-release addition, not blocking Stage 4B. Likely
  approach: a file-identity heuristic (`name + size + lastModified + type`) applied in
  `FileUploadInput`'s `handleChange`, since two `File` objects from separate picker selections are
  never reference-equal even when they represent the same underlying file. Not implemented — see
  PROJECT_IMPLEMENTATION_PLAN.md — Post-Launch Roadmap — File Upload UX for the fuller note.
  (2026-07-12: still open; the Stage 6 upload UX itself is specified in FS §4.3–§4.5 —
  thumbnails, per-file progress/failure/remove — and governs any rework of `FileUploadInput`.)

- **`required_error` not reachable when a required string field is entirely absent from submitted
  FormData (found during Codex review of TASK_09, 2026-07-18).** Every required string field in
  `requestFormSchema` (`clientName`, `ideaDescription`, `placement`, `contactMethod`, etc.) is read
  in `src/bff/request.ts` via `formData.get(f.<field>) as string` — a type assertion with no
  runtime coercion. `FormData.get()` returns `null`, not `undefined`, when a key is absent, so a
  malformed/missing submission reaches zod as `null` rather than `undefined`. Zod's
  `{ required_error }` only fires for `undefined`; a `null` falls through to Zod's own untranslated
  default type-error message instead of the field's stable `..._required` key. Not a regression
  from any one field's task — it's the shared BFF-parsing pattern, so a fix (e.g. `?? ""` at each
  read, or an `invalid_type_error` alongside each `required_error`) should be done once across all
  affected fields, not per-field. Low priority: only reachable via a hand-crafted request bypassing
  the client form (the client always sends a string), so it affects API error-key stability for
  malformed direct POSTs, not any real user path.

- **Oversized-file error copy — length/wording, for the Item 6 visual pass (2026-07-14, from the
  Item 1 live check).** The current message ("This image is over 4 MB. Please use a smaller one — a
  screenshot usually works.") overflows a narrow mobile row when shown next to the thumbnail and the
  remove control. This is *content/visual polish, not behavior* — it does not belong in Item 3 (which
  fixes the upload card's structure and behavior). Handle it during the Stage 6 visual/content pass
  (Item 6-adjacent): shorten the copy and decide whether the "a screenshot usually works" hint stays
  (owner leans toward dropping it). The i18n key lives in `en.json`; do not change the *behavior*
  (the 4 MB rejection itself is FS §4.3 and is correct).
  **ASSIGNED 2026-07-26 (STRAT):** the visual pass now exists as
  `tasks/STAGE_6_TASK_18_visual_consistency.md` and carries this as scope item 11 — the single copy
  change that task is permitted to make, pre-approved by this entry. The executor confirms the
  final wording with the owner at plan time.
  **DISCHARGED 2026-07-26 (IMPL, Item 18 Block B).** Wording confirmed with the owner at plan time
  and shipped: **"Over 4 MB — use a smaller image."** (78 → 32 chars). The "a screenshot usually
  works" hint was dropped, per the leaning recorded above. Behavior untouched — the 4 MB rejection
  is FS §4.3 and is unchanged. The *cause* of the overflow was also fixed, which this entry had
  mis-attributed to copy length alone: the message span carried `shrink-0` inside a non-wrapping
  flex row, so it could never wrap or compress at any width and pushed the remove control off-screen
  regardless of string length. The span is now shrinkable and the remove control carries `ms-auto`.
  Verified by rendering the real form at 320px with a 5 MB upload: the message fits on one line and
  the `×` sits inside the row edge.

---

## Frontend Improvements

- Extract typography components:
  - SectionTitle
  - SectionText
  - BulletList

- Replace split("\n") in i18n with string arrays

- ~~**Public error & 404 UX**~~ — **resolved 2026-07-19**, Stage 6 Item 11
  (`STAGE_6_TASK_11_public_error_404.md`). Root `app/not-found.tsx` now localized (via `en.json`
  directly — single locale, no locale-tier file needed, see PROJECT_DECISIONS.md — "Public 404 /
  error boundary (Item 11)") with a Home link; `app/[locale]/(public)/error.tsx` added as the
  public error boundary, inheriting the `(public)` layout's shell automatically (retry via
  `unstable_retry()` + Home). No `global-error.tsx` (owner-accepted deviation, negligible risk).
  See PROJECT_STAGE_LOG.md, 2026-07-19 entry.

- **Geist is downloaded on every visit and never rendered (2026-07-26, from Stage 6 Item 18
  Block A).** `app/[locale]/layout.tsx` loads `Geist` via `next/font/google` and sets its variable
  on `<body>`; `app/globals.css` maps `--font-sans: var(--font-geist)`. But
  `body { font-family: var(--font-stack-base) }` in `@layer base` wins, and **no TSX uses
  `font-sans`** — so the webfont is fetched on every page load and never paints a single glyph.
  **This is a measurable cost (an extra request + transferred bytes for every visitor), not a
  question of taste** — whichever font Stage 7 chooses, paying for one that is not displayed is
  wrong today. Item 18 could not fix it: adopting Geist is a font change (explicitly out of its
  scope) and dropping the loader means editing `layout.tsx`, which is outside both of its blocks'
  write surfaces. Stage 7 decides *which* font; the waste should be removed regardless of that
  decision.

- **`app/not-found.tsx` inline styles — verify values, do NOT "de-drift" (2026-07-26, from Stage 6
  Item 18 Block A).** The file hardcodes `fontSize: "2rem"`, `#71717a`, `#18181b` as inline styles.
  **This is forced, not drift.** As Next.js's root not-found it renders its own `<html>`/`<body>`
  and lives outside the `[locale]` tree — i.e. outside the `layout.tsx` that is the only importer of
  `globals.css` — so **it has no stylesheet by construction** and inline styles are the only
  mechanism available. This is a consequence of the Item 11 design
  (PROJECT_DECISIONS.md — "Public 404 / error boundary (Item 11)"), not a defect.
  **Action for Stage 7 is to check that these three values have not diverged from the final
  palette/type scale — not to remove the inline styles.** Reading this entry as "eliminate the
  inline styles" would break the Item 11 decision.

- Admin image viewer (`RequestImageViewer`, YARL Zoom) — physical mobile-device verification
  deferred from Stage 4B.5.1, carried into Stage 6 / pre-release manual QA (does not block Stage
  4B closure — see PROJECT_STAGE_LOG.md, 2026-07-04 closure entry, and
  PROJECT_IMPLEMENTATION_PLAN.md, Stage 6):
  - Required verification: physical iPhone Safari + physical Android Chrome — open, pinch zoom,
    pan after zoom, double tap, swipe left/right, close button, backdrop tap, portrait ↔
    landscape rotation. Never performed during Stage 4B (no physical device / deployment access).
  - ~~Low-resolution images barely zoom / open tiny in the viewer~~ — **resolved 2026-07-06**: a
    2026-07-05 attempt (`slide.width/height = 4096` + `maxZoomPixelRatio: 2`) fixed the zoom
    ceiling but manual testing found the initial viewer image still opened tiny. The actual fix
    (2026-07-06) adds `carousel.imageProps: { style: { width: "100%", height: "100%" } }`, the
    officially-typed YARL lever for overriding the image element's own style — small source images
    (e.g. the 64×64 Stage 5B.1 smoke-test image) now fit-to-screen on open via `imageFit:
    "contain"`, with roughly 2x zoom available from that fitted size, without affecting
    normal-resolution photos. See PROJECT_STAGE_LOG.md (2026-07-06 entry) and
    PROJECT_DECISIONS.md — Minimal Image Viewer / Zoom for the full fix and rationale. Manual
    real-browser verification of this fix is still pending (see the physical-device item above,
    which remains separately outstanding) — the developer has confirmed they will check it
    themselves.
  - `controller.closeOnPullDown` (swipe-down-to-close) remains gated on the physical mobile-device
    verification above, unchanged by the sizing/zoom fix (see PROJECT_DECISIONS.md — Minimal Image
    Viewer / Zoom).

---

## MIME Type Verification — done (Stage 6 Item 1, 2026-07-14)

Resolved as part of the upload-flow architecture redesign: `src/bff/validateFiles.ts`
(`validateSingleFile`) now sniffs the first bytes of every uploaded file and checks them against
the file's own declared MIME type (JPEG/PNG/WEBP/HEIC magic numbers), not just the
browser-provided `Content-Type` header. See PROJECT_DECISIONS.md — "Stage 6 Upload-Flow
Architecture", §1.

---

## API Route Constants (post-MVP)

Revisit route/path constants when admin routes, image proxy, and additional API endpoints are added.
Currently `/api/request` is the only endpoint and is used in one place — centralizing it now would be premature.
Introduce a `API_ROUTES` constant in `src/bff` or `src/shared/config` at that point.

---

## Automated E2E / Integration Tests (pre-release)

Unit and route-level tests cover isolated logic and handler orchestration against mocks.
The following flows have no test touching a real database or storage layer:

- normal request submit: form → API → storage → DB → referenceCode returned
- replay with same `clientSubmissionId`: same `referenceCode`, no duplicate DB row
- UNIQUE constraint race fallback: cleanup + existing referenceCode returned
- failed DB insert: uploaded storage files deleted
- **Success page gate + bfcache in a real browser** (Stage 6 Item 4, 2026-07-18): CO-1/CO-2 were
  verified by a manual owner pass, not automated. jsdom unit tests cover the handler logic
  (empty-store redirect, one-time read, second-mount redirect, persisted-`pageshow` redirect —
  `SuccessView.test.tsx`), but the real-browser behaviours — a successful submit landing on
  `/success`, and browser-back/refresh/direct-open redirecting via the back-forward cache — need an
  e2e test. From `reviews/done/REVIEW_2026-07-18_stage6_success_page.md` (Requested by: IMPL: Stage 6
  Task 04); owner flagged intent to add "нормальные тесты" for this.

Address before production release (Stage 5). Options:
- Vitest integration tests with a real Supabase test project (separate from production)
- Playwright / end-to-end tests against a local or preview deployment
- Manual test protocol executed before each release (minimum viable option for MVP)

See PROJECT_PRODUCTION_READINESS.md — Integration / End-to-End Test Coverage for full details.

---

## Show/Hide Password Toggle

Add a show/hide password toggle to the login and reset-password forms (and any future signup/password forms). UI/Auth polish — not blocking Stage 4A.7.

---

## Password Policy

Define a project-wide password policy before production launch (e.g. minimum length + complexity, or a passphrase-friendly minimum-length-only approach). Apply it consistently to the reset-password form and any future signup/password flows. Not decided or invented during Stage 4A.7 — reset-password currently relies on Supabase's default minimum only (see PROJECT_DECISIONS.md — Password Reset). Consider reusing the existing zod + RHF validation pattern from the request form (`src/features/request/validation`) if a client-side schema is introduced.

---

## Supabase Generated Database Types

Generate Supabase TypeScript database types via the Supabase CLI (`supabase gen types typescript`) and use `createClient<Database>()` for both Supabase clients (`supabase.ts`, `supabaseAuth.ts`).

Goal: improve query result typing across all service modules and remove narrow casts such as `membership.studio_id as string` in `services/auth.ts`.

Suggested timing: Stage 5 Production Hardening, or earlier if Stage 4B introduces many Supabase queries that require similar casts.

**Stage 5D reconciliation (2026-07-09):** deliberately not implemented in the Stage 5D fix passes —
introducing generated types is a tooling/pattern decision (codegen step, regeneration workflow),
not a narrow fix. Remains a pre-launch owner-decision item: evaluate before public launch, adopt
or explicitly reject with rationale.

---

## OAuth Locale-Query Redirect Allowlist Design Debt (found during Stage 5C, 2026-07-08)

Local Google OAuth was found to send `redirect_to=http://localhost:3000/auth/callback?locale=en`
(locale appended as a query param, per the existing 4A.6/4A.7 mechanism). Supabase's Redirect URL
allowlist matches full URLs including the query string, so this exact query-bearing localhost URL
had to be added to the allowlist to make local OAuth work again after the Site URL was changed to
the deployed Vercel origin (see PROJECT_STAGE_LOG.md, 2026-07-08 entry, and PROJECT_DECISIONS.md —
Stage 5C Deployment Workflow and Environment Decisions).

This is a working workaround, verified live, **not the desired long-term design**:

- the allowlist should not need one entry per locale query value
- future `ru`/`he` locale expansion should not require manually adding
  `...auth/callback?locale=ru`, `...auth/callback?locale=he`, etc. one at a time
- a deliberate auth/i18n redirect design cleanup is needed before locale expansion

No eventual solution is chosen here. **Stage 5D reconciliation (2026-07-09):** deliberately not
redesigned in the Stage 5D fix passes — this is a pre-launch design item: resolve before public
launch or before any `ru`/`he` locale expansion, whichever comes first. The interim allowlist
workaround remains in place and working. Not resolved as of this entry.

---

## Orphaned Storage Objects (found during Stage 5A)

During Stage 5A.2/5A.3 (live Supabase read-only verification, 2026-07-05), 2 objects were found in
the `request-images` bucket with no corresponding `request_files` DB row — likely leftover from an
upload that succeeded before a later step failed, prior to the DB row being created. Deliberately
**not** deleted as part of the Stage 5A.4 legacy-path cleanup (that cleanup was scoped only to the
6 legacy-format files tied to 3 confirmed test requests) — these 2 objects are a separate, smaller
hygiene item requiring their own explicit owner confirmation before deletion, same protocol as
5A.3/5A.4. See PROJECT_STAGE_LOG.md (2026-07-05 entry) and PROJECT_DECISIONS.md — Stage 5A
Security / Data-Boundary Decisions, Storage Model, for the full context. Not blocking Stage 5B.

**Stage 5D reconciliation (2026-07-09):** classified post-launch/operational — both the 2 known
orphans (still awaiting explicit owner confirmation before deletion) and the general absence of an
orphaned-object reconciliation/cleanup mechanism are accepted operational debt; best-effort
in-request cleanup (`cleanupRequestFiles`) remains the only automatic mechanism. Revisit
post-launch or if orphan volume grows.

**Stage 6 Item 1 update (2026-07-14):** the upload-flow redesign (selection-time upload, before a
request row exists) structurally increases orphan volume — anticipated and accepted by
D-Blueprint 5(a). "Orphaned" is now precisely definable: a Storage object with no `request_files`
row referencing its path. New expected sources beyond the original finding: abandoned forms (the
dominant one), client-side file removal (deliberately does not delete server-side — see
PROJECT_DECISIONS.md §4), a retry after a timeout-that-actually-succeeded, and expired upload
handles (~2h TTL). Containment added instead of a cleanup job: a 12-object per-session Storage cap
and an in-memory per-IP rate limit on `/api/upload`. `cleanupRequestFiles` remains the only
automatic mechanism (now used only for the original in-request case, not on submit-time races/
failures — see PROJECT_DECISIONS.md §5). No reconciliation job is built here; still revisit
post-launch or if volume grows. Full context: PROJECT_DECISIONS.md — "Stage 6 Upload-Flow
Architecture", §6.

---

## Unbounded automated storage growth on `/api/upload` — PRE-LAUNCH BLOCKER (Stage 6 Item 1, 2026-07-14)

**Not a "revisit if abuse appears" item — a known-open hole with an owner-accepted deferral.** Raised
by the independent Codex review of Stage 6 Item 1 (`docs/project/reviews/done/
REVIEW_2026-07-14_stage6-item1-upload-flow.md`, Finding 3), which correctly showed that the
architecture's stated abuse ceiling does not exist.

`POST /api/upload` is public and unauthenticated. Its two supposed bounds both fail against an
automated caller:

- the **per-session object cap** (12 objects per `clientSubmissionId`) is *caller-resettable* — the
  id is chosen by the client, so a bot mints a fresh UUID per upload and never approaches the cap.
  It bounds an honest session, not a hostile one. (Concurrent uploads under one id can also all read
  the same pre-upload count and pass the check before any write lands.)
- the **in-memory per-IP rate limiter** (`src/bff/rateLimit.ts`) is per-instance on Vercel's
  multi-instance runtime, so a distributed caller gets some multiple of the configured limit.

What *does* hold: each object is size-capped (4 MB) and must be a real image (MIME allowlist +
magic-byte check), and the bucket is private with no public read path. So the exposure is storage
growth and cost, not data exposure.

**Accepted for now** because the site is not publicly launched and takes ~5–20 real requests/week.
**Must be closed before public launch** with a non-caller-resettable durable control.

PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture" §1 records the same, and explicitly
withdraws the earlier false claim that the session cap was "the real ceiling".

**RESOLVED direction 2026-07-22 (STRAT + Codex research — Item 10 decided, task cut).** The owner
reframed Item 10 as a **layer** (durable limit + alert/diagnostics + kill-switch + spend safeguards),
ran a Codex research thread, and decided the mechanism:

- **Option B — a durable per-IP fixed-window Upstash quota** (60 admitted uploads / IP / 24h,
  fail-closed `503`, `429`+`Retry-After` on breach) replacing the per-instance in-memory limiter on
  `/api/upload`. A structured `console.warn` on every 429/503 (in-code) plus a dashboard Firewall/Log
  alert (owner-debt) is how the owner learns it fired.
- **Option C (global circuit-breaker)** — the only thing that bounds a *distributed* caller — is
  **deferred behind explicit triggers** (distributed spike, cost threshold, response-window loss,
  marketing reach, or SaaS). B is the first layer of C, not a throwaway.
- The old **"if Pro → Vercel KV, else → Upstash" fork is dead**: Vercel KV no longer exists (migrated
  to Upstash, Dec 2024); Pro is a terms-only decision, not a limiter dependency.

**Implemented 2026-07-22, live-verified 2026-07-23** (`d5e8ae3`; task in
`tasks/done/STAGE_6_TASK_10_upload_abuse_mitigation.md`; research
`research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md`; full decision
PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation"). CO-1/2/3/5 discharged with live
evidence (forged IP headers mint no fresh bucket; 429 with a 24h window survived a redeploy; an
independent egress was unaffected; a limiter-down condition returned 503 with no Storage write).
**The launch blocker is NOT fully closed:** CO-4 — the Firewall/Log alert, the WAF deny drill, and
the Vercel/Supabase spend safeguards — is **open owner pre-release debt** (deferred 2026-07-23: all
three need Vercel Pro, which is a pre-launch decision anyway). Tracked in STAGE_6_STRAT_BRIEF.md →
"Owner pre-deploy actions" and PROJECT_PRODUCTION_READINESS.md.

---

## Upload 503 (limiter-unavailable) copy is not actionable (Stage 6 Item 10 follow-up, 2026-07-23)

Raised by the owner while running Item 10's CO-2 live verification; filed here so it is not lost when
the task closes. **Not a blocker** — the fail-closed path works correctly, only its wording is weak.

When the durable limiter is unavailable, `/api/upload` returns a fail-closed `503` and the UI shows
`upload_invalid`: *"Your images could not be attached. Press Retry on each one, then send again —
nothing else you typed was lost."* It reads as a hard error and **omits the one thing that matters:
the request can be submitted without images** (FS §4.5 — a failed upload never blocks submission).
The 429 path got a clearer message in Item 10 (`upload_rate_limited`); the 503/transient path did not.

Rare, but when it fires it hits **every visitor at once** (the store is down for everyone). Needs a
copy change checked against FS §4.5 — and against the PRD if the wording is normative — hence a small
task, not a hotfix. Scope: one i18n key (both locales) plus whichever branch of
`src/features/request/lib/upload.ts` maps 5xx.

---

## Re-review Item 17 before release — cross-review loop exited without consensus (Stage 6 Item 17, 2026-07-25) — **CLOSED 2026-07-27**

**CLOSED 2026-07-27 by Stage 6 Item 13's acceptance sweep (CO-3).** The re-review was performed by a
Codex session with no exposure to the original 9-round loop, briefed to report **code findings only**
so the documentation churn that killed that thread could not repeat. **Verdict: no follow-up work
needed before release — no production-code finding.** Verified: every runtime secret consumer
deep-imports `@/config/env` rather than the client-safe barrel; public consumers import identity from
the barrel; no duplicate raw address, Instagram URL or handle remains outside `studio.ts`; the
remaining "Masha Karda" literals are composed owner-authored SEO sentences, not competing identity
fields. The **partial** config boundary (studio identity in `src/config/`, request-behavior settings in
`src/features/request/config/form.ts`) was judged **coherent** — making the extraction total would
weaken feature ownership without improving secret/client separation. Thread:
`research/RESEARCH_2026-07-27_item13-static-criteria-and-item17-rereview.md`, Part B.

*Original entry kept below for the record.*

**For STRAT.** Item 17's Codex cross-review ran **9 rounds** and was ended by owner decision, not
by a clean round. Rounds 1–3 found real defects (a CO-1 gap: two bare studio-name literals still
outside the config; write-surface and `.claude/settings.json` hygiene) — all fixed. **Rounds 4–9
produced no production-code finding whatsoever**: every one was a reporting-document inconsistency,
most of them self-inflicted (each round's own prose fix desynchronizing a count or a claim that the
next round then caught). The loop had stopped converging on code quality and was blocking delivery.

Owner decision: commit the work, exit the loop, and **re-review before release** rather than keep
paying round-trips for documentation churn. Risk is bounded and explicitly accepted:

- The production refactor itself was independently verified clean by Codex in each of the last six
  rounds ("no production-code finding remains" stated verbatim in Rounds 7, 8, and 9).
- `pnpm qg` green throughout; CO-3 (byte-identical rendered output) live-verified after Reviews 1–5.
- The only findings ever left unfixed at exit: none — Round 9's single finding was applied before
  the close.

Scope when picked up: a fresh cross-review pass over Item 17's committed diff, ideally **after**
the META decisions on review-loop mechanics land (`AI_FRAMEWORK_IDEAS.md`, 2026-07-25 entry —
round caps, possible MCP-wrapped Codex auto-loop), so the re-review does not reproduce the same
churn. Natural fit: the pre-release verification pass alongside Item 13's acceptance sweep.

Source thread: `docs/project/reviews/done/REVIEW_2026-07-25_stage6-item17-studio-config-extraction.md`,
requested by `IMPL: Stage 6 item 17 — studio config extraction`.

---

## Placeholder-marker convention: Item 16 and STRAT brief still teach the superseded grep (Stage 6 Item 17, 2026-07-25)

Raised by Codex cross-review (round 3/4) of `STAGE_6_TASK_17_studio_config_extraction.md`. Filed
here so the gap is not lost when Item 17 closes — Item 17's CO-2 consolidated three separate
placeholder markers (`__meta_TODO`, `__intro_TODO`, `__asset_TODO`) into one combined grep,
documented in `PROJECT_PRODUCTION_READINESS.md`'s new "Pre-Deploy Content Swaps" section, and
repointed every in-code/data marker comment at it. Item 17 could not fix two remaining documents
that still teach the superseded convention, because both are outside an IMPL session's write
authority:

- `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md` (`draft`) still instructs its future
  executor to run the separate `__asset_TODO` grep and write the result into
  `STAGE_6_STRAT_BRIEF.md`'s "Pre-deploy swaps to track" (§3, "Marker + tracking").
- `docs/project/tasks/STAGE_6_STRAT_BRIEF.md` itself still documents separate `__meta_TODO`/
  `__asset_TODO` grep commands and references the now-removed `INSTAGRAM_HANDLE` (Item 17 deleted
  it from `src/features/request/config/form.ts`).

Until a STRAT session amends both, the repository still carries a live, executable path back to
the conflicting convention — Item 16's own CO-1 would close against the wrong reference if run
as currently written. Item 17's CO-2 disposition is recorded as
closed-for-its-own-code / open-pending-this-follow-up (see the task file).

**RESOLVED 2026-07-26 (STRAT), both halves:**

- *Item 16's half fixed itself correctly.* The task ran and closed with its CO-1 pointing at
  `PROJECT_PRODUCTION_READINESS.md`, not at the brief — the risk this entry named did not
  materialize. Its Scope §3 was amended during execution for exactly this reason.
- *The brief's half is fixed now.* `STAGE_6_STRAT_BRIEF.md` was rewritten this session: its
  "Pre-deploy swaps to track" section is reduced to a pointer at
  `PROJECT_PRODUCTION_READINESS.md`'s combined grep, and the stale `INSTAGRAM_HANDLE` reference
  (Item 17 deleted that constant) is gone. This follows the preference the earlier STRAT session
  recorded in `AI_FRAMEWORK_IDEAS.md`'s 2026-07-24 entry on the brief-vs-durable-doc tension:
  when a brief and a durable doc hold the same content, the brief becomes the pointer.

Source thread: `docs/project/reviews/done/REVIEW_2026-07-25_stage6-item17-studio-config-extraction.md`
(Round 3), requested by `IMPL: Stage 6 item 17 — studio config extraction`.

Scope when picked up: amend `STAGE_6_TASK_16_placeholder_assets.md` §3 to point at
`PROJECT_PRODUCTION_READINESS.md`'s combined grep instead of the STRAT brief; replace or update
the brief's "Pre-deploy swaps to track" section (either fix its stale content or reduce it to a
pointer at the readiness doc, per the STRAT session's own preference recorded in
`AI_FRAMEWORK_IDEAS.md`'s 2026-07-24 entry on the same brief-vs-durable-doc tension). Natural fit
for the STRAT session that next touches Item 16 (before it leaves `draft`) — not worth a
standalone task file on its own.

---

## Home mobile-viewport read-through — CO-2 gap (Stage 6 Item 5, 2026-07-24)

Raised by Codex cross-review (round 7) of `STAGE_6_TASK_05_home_rebuild.md`. Filed here so the gap
is not lost when Item 5 closes — the owner ruled the check should be deferred, not blocking, but a
deferral needs a canonical work item, not just a note in the task file or a mention in
`STAGE_6_STRAT_BRIEF.md` (a STRAT-brief line is not a work item per `AI_TASK_PROTOCOL.md`).

Item 5's CO-2 requires a "live mobile read-through of /en" (block order, teaser links, no orphaned
i18n keys, clean build). Everything except the actual rendered **mobile-viewport** check was
evidenced some other way: block order and teaser-link targets via `curl` against a dev server; the
i18n key cross-check by comparing `page.tsx`'s `t()` calls against `en.json`'s keys in both
directions; the clean build via `pnpm qg`. No headless-browser tool (chromium-cli/Playwright) was
available in the implementing session's environment — the same gap Item 6 recorded for its own CO-2.

Scope when picked up: an actual rendered check of `/en` at a mobile viewport width (real browser or
headless tool), confirming the block order and layout read correctly and nothing clips/overflows.
Natural fit for Item 13 (FS §6 acceptance sweep) or the not-yet-cut visual pass mentioned in
`STAGE_6_STRAT_BRIEF.md` — either covers Home along with the rest of the public site, so this is not
worth a standalone task file.

**ASSIGNED 2026-07-26 (STRAT) — no longer unowned.** The visual pass is cut:
`tasks/STAGE_6_TASK_18_visual_consistency.md`, whose **CO-1** requires all six public routes
captured and checked at 320/375/768/1280 and the findings recorded. The missing capability that
caused this gap in the first place is delivered by
`tasks/TOOLING_TASK_02_playwright_screenshots.md` (`playwright` + `pnpm shot`). Item 6's identical
CO-2 half is routed to the same place. This entry stays as the record of the gap; the work now
lives on the task.

**DISCHARGED 2026-07-26 (IMPL, Item 18 Block B — CO-1).** `/en` was captured and inspected at
320/375/768/1280 along with the other five public routes (24 captures), against a production build.
`scrollWidth === viewport` at every width — nothing clips or overflows — and a Playwright harness
additionally confirmed no content is overlapped by the fixed bottom nav at any width. Block order
and teaser links were unaffected by the block (no JSX reordering; verified in the diff). The
headless-browser gap that produced this entry no longer exists. **Item 6's identical CO-2 half is
discharged by the same sweep.** Kept as the historical record of the gap and how it closed.

---

## Client-side image compression for uploads — needs research (Stage 6 Item 1, 2026-07-14)

Per-file upload limit is **4 MB**, forced by Vercel's 4.5 MB Function request-body ceiling (see
PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture", "Per-file size ceiling"). FS §4.3 permits
client-side downscaling/compression but Stage 6 does not implement it: an oversized file is simply
rejected with a clear message telling the visitor to use a smaller image.

**Residual risk this leaves:** a high-resolution phone photo (48 MP JPEG, or an unconverted HEIC) can
exceed 4 MB, and the visitor must reduce it themselves. Expected inputs (Instagram screenshots,
reference images, ordinary phone photos of a body area) sit well under the limit, so this may never
bite — but a body-placement photo taken on a modern phone is exactly the case most likely to.

**Open questions for research (owner: do not implement before these are answered):**
- Only compress files *over* the limit, leaving everything else untouched at original quality? (The
  artist needs full quality to judge a design — blanket compression is not acceptable.)
- What output parameters are adequate for judging a tattoo design (long-edge px, JPEG quality)?
- HEIC: browsers cannot decode it natively — accept the gap (iOS usually converts to JPEG on web
  form upload anyway), or take a decoding dependency (`heic2any`, ~200 KB)?
- What do comparable products do — is rejection-with-a-message actually the norm, making this a
  non-problem?

Not blocking Item 1: the form works and complies with FS without it.

---

## Auth Callback Route Edge-Branch Tests (Stage 5D finding, pre-launch, 2026-07-09)

`app/auth/callback/route.ts` and `app/auth/reset-callback/route.ts` have no automated tests for
their edge branches (missing `code`, unsupported `locale` fallback, `exchangeCodeForSession`
failure). Deliberately not added in the Stage 5D fix passes: these route handlers require mocking
`next/headers` cookies, and until 2026-07-09 the codebase avoided mocking Next internals entirely
(Stage 4B.6 precedent). Stage 5D Fix Pass 2 introduced the first such test
(`requests/[id]/__tests__/actions.test.ts`, mocking `next/headers`/`next/cache`/`next-intl/server`)
— that pattern can be extended to the callback routes. Decide and implement the approach before
public launch; the flows themselves are manually verified live (Stage 5C).

---

## Documentation: context-budget cleanup (Codex analysis 2026-07-13, deferred execution)

Source: `docs/project/reviews/done/REVIEW_2026-07-13_docs-context-budget.md` (consensus reached;
execution deferred by the owner — usage budget + a concurrent IMPL session writing to the same
shared docs). Requested by `META: AI Workflow Master`.

**Trigger:** a fresh IMPL session reported `PROJECT_STAGE_LOG.md` was too large to read whole and
silently degraded its own mandatory Pre-task Sync. The four mandatory sync docs total ~5,600
lines (STAGE_LOG alone: 3,639, of which 3,312 are the append-only journal).

**Take first, as one pass (highest value, low risk):**

- **A — hot-path split.** Create `docs/project/PROJECT_CURRENT_STATE.md` (~50–100 lines: current
  stage + its Source of Truth, active tasks and their blockers, owner-supplied assets pending, one
  pointer to the STRAT brief / implementation plan). Pre-task Sync reads it **first**;
  `PROJECT_STAGE_LOG.md` stays at its current path (no rename — preserves every existing dated
  pointer) and becomes an on-demand journal, not a session-start read. Replace the old Current
  Stage block with a pointer so only one writable current-state source exists.
- **B — targeted-read rule for `PROJECT_DECISIONS.md`** (1,726 lines): scan headings, read the
  sections the task names plus those relevant to its domain; full read only for cross-domain
  strategy/audits. **Do not** create a decisions index (duplication + sync cost) and **do not**
  split by stage — Stages 3–5 decisions on Storage/identity/auth/service-layer are still binding
  ("old decision ≠ inactive decision").
- **Migration is not a two-line edit:** every mandatory-read enumeration must be updated —
  `.claude/CLAUDE.md`, `docs/framework/templates/CLAUDE_TEMPLATE.md`, the stage-task template,
  kickoff wording — **and `AGENTS.md`, which independently tells Codex to read the Stage Log
  first** (otherwise Codex keeps the identical problem).
- **Regrowth rule:** `PROJECT_CURRENT_STATE.md` is **replacement-only** — completed items are
  removed once logged, never accumulated.

**Later passes (accepted, lower priority):**

- C — stale duplication: `PROJECT_CONTEXT.md`'s Stages 0–5 public-surface/form lists → pointer to
  the Stage 6 PRD/FS; `PROJECT_ARCHITECTURE.md`'s batch-upload flow labelled "shipped baseline"
  until the upload-architecture task decides the target.
- `PROJECT_IMPLEMENTATION_PLAN.md` (1,070 lines) has become a second history *and* a second
  backlog (~800 lines of completed Stages 0–5) while Stage 6 has its own plan — archive the
  completed-stage detail behind a compact pointer.
- `PROJECT_STRUCTURE.md` (535 lines) is half handwritten file catalogue, duplicating the generated
  `docs/files-structure.md`. **Keep the rules** (dependency direction, layer boundaries, public-API
  constraints — they are lint-enforced via `import/no-internal-modules`); cut the inventory.
- Stage Log entry style: future entries should be milestone pointers (outcome + task/review link +
  unresolved blocker), not file-by-file release notes with pasted gate transcripts — git, task
  files, and review threads already hold that evidence.

---

## Ablation of harness rules — post-MVP retrospective (filed 2026-07-17)

Source: `docs/project/research/done/RESEARCH_2026-07-16_agentic-engineering-practices-scan.md`
(Outcome item 3, `later`; owner decision 2026-07-17).

At the post-MVP retrospective — or at a model-generation change, whichever comes first — test
whether the scaffolding this framework accumulated still pays for itself. Candidates to ablate:
the blanket independent-review rule, the checkpoint size threshold (16 files / 500 churn — recorded
as a *trial* number calibrated on a single positive case), fresh-session guidance, and duplicated
preflight reads.

**Method that keeps this honest:** retire a rule only if the failure that originally motivated it
**no longer reproduces**. Each rule's motivating incident is recorded in AI_FRAMEWORK_IDEAS.md, so
the test is concrete rather than a matter of taste — "this feels like overhead now" is not
evidence. Rules whose failure still reproduces stay, however old they are.

Overlaps `docs/project/tasks/META_TASK_01_framework_consolidation.md` (`draft`) — that task deletes
*duplication*; this item questions whether individual *rules* are still earning their keep. Do them
in the same retrospective pass, in that order (delete duplication first, then ablate what remains).

No action until one of the two triggers above actually occurs (a model-generation change may
arrive before MVP — that counts).

**Evidence available (added 2026-07-25):** `research/done/RESEARCH_2026-07-25_framework-accretion-remeasure.md`
re-measured accretion against the 2026-07-15 baseline with a repeatable method — commit ratio,
framework/runtime share, added lines decomposed by function, and an enforceable-rule-block count per
operational file. Two of the ablation candidates above now have direct data: the fix-now/defer bar
(kept unchanged on that evidence, 2026-07-25) and the 16/500 size trigger (recalibrated and kept —
`research/done/RESEARCH_2026-07-25_review-round-economics.md`). Re-run both methods at the
retrospective rather than re-deriving new ones, so the comparison stays honest.

---

## Unresolved completion obligations behind six closed tasks (filed 2026-07-25)

Source: the first real run of `pnpm project:status`
(`docs/project/tasks/done/TOOLING_TASK_01_project_status_command.md`, `Requested by:` that task's
Claude review pass). Verified against the source documents, not taken from the tool's output.

**Seven** obligations across six `done` tasks lack either completion evidence or a resolvable work
item, which is exactly what AI_TASK_PROTOCOL.md — Completion Obligations forbids at close. (The
command prints nine error lines: two of the seven emit both a `TARGET_*` and an `UNRESOLVED` line —
a known cosmetic duplication recorded in the tool's task file.)

- **Task 03** CO-3 — "expected `None`; confirm at close"; the confirmation was never recorded.
- **Task 05** CO-2 — tracked in `PROJECT_BACKLOG.md` with no anchor, so the pointer resolves to
  nothing checkable.
- **Task 06** CO-2 (`PARTIAL` — mobile-viewport truncation never visually confirmed) and CO-3
  (`OPEN — owner`: the owner/artist copy pass).
- **Task 07** CO-3 and **Task 10** CO-4 — track work in `STAGE_6_STRAT_BRIEF.md`, which the
  protocol explicitly rejects as a work item (a brief is overwritten each STRAT session).
- **Task 12** CO-5 — the Vercel "System Environment Variables" checkbox, carried as owner debt in
  the same brief; it gates a public `og:image` origin at launch.

Also fixed in passing at filing time: `STAGE_6_TASK_17` was `done` but still sat in `tasks/`
(moved to `tasks/done/`).

**Why this is one entry, not six tasks:** the underlying work is heterogeneous (an owner copy pass,
a deploy-time dashboard check, a mobile visual pass, two re-pointings), and the routing decision —
which of these become tasks, which are owner actions, which are already satisfied and just need
their evidence written down — is the owner's. Note that four of the nine are pre-launch items
already tracked in PROJECT_PRODUCTION_READINESS.md in substance; what is missing is the canonical
pointer from the closing task, not necessarily the work.

Run `pnpm project:status` to see the live list; it exits non-zero while any of these stand.

**RESOLVED 2026-07-26 (STRAT).** `pnpm project:status` now reports **0 errors** (4 warnings remain,
all of them the tool's own "legacy task predates the Completion obligations section", which it
classifies as not-an-error). Routing, per obligation:

- **Task 03 CO-3** — confirmed `None` against the tree (`src/config/env.ts` + `.env.example`
  declare the complete required set; nothing in it originates from Item 3). Evidence written into
  the task file; no work item needed.
- **Task 05 CO-2** and **Task 06 CO-2** — the two mobile-viewport halves → `tasks/
  STAGE_6_TASK_18_visual_consistency.md`, whose CO-1 requires all six public routes captured and
  checked at 320/375/768/1280. Their shared root cause — no browser existed here — is fixed by
  `tasks/TOOLING_TASK_02_playwright_screenshots.md`. Task 05's original backlog pointer also gained
  the anchor it was missing, so it resolves as well.
- **Task 06 CO-3** (artist copy pass), **Task 07 CO-3** (real studio photos), **Task 10 CO-4**
  (alert + WAF drill + spend caps), **Task 12 CO-5** (system-env + live OG), **Task 16 CO-3**
  (no generated artwork at launch) → the new **Owner Pre-Release Actions** section of
  PROJECT_PRODUCTION_READINESS.md. These are owner actions no task file can close; that section is
  now their canonical home, and a STRAT session verifies them before the Item 13 sweep.

The two that pointed at `STAGE_6_STRAT_BRIEF.md` (Tasks 07 and 10) were the sharpest case: a brief
is overwritten by every strategic session, so the tracking pointer for the still-open launch
blocker had a lifetime of one session. Kept as a record of why the rule exists.

---

## Desktop art direction for placeholder images — open question (Stage 6 Item 16, filed 2026-07-26)

Item 16 wired 9 owner-generated placeholder images (favicon, 3 studio interior, 4 Featured Work, 1
OG) as single mobile-first assets — the same source image is served at every breakpoint via
`next/image` (`fill` + `sizes`), just resized/cropped by the container, not art-directed per
breakpoint. Owner asked, during the Item 16 wiring session, whether desktop needs different or
additional images (e.g. wider crops, different compositions for a landscape viewport) rather than
the same mobile-first source scaled up.

**Not decided here — out of IMPL scope.** This is a product/design call (does the current
single-image-per-slot approach hold up on desktop, or does Stage 6's mobile-first posture need a
documented exception for these specific blocks) for a STRAT session to pick up, using
`STAGE_6_FUNCTIONAL_SPECIFICATION.md`'s existing mobile-first framing as the starting point. Applies
equally once the images are swapped for real photography — the same question recurs either way.

**ROUTED TO STAGE 7, 2026-07-26 (STRAT).** This is art direction, which the Stage 6 / Stage 7
boundary decision places in Stage 7 (PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary —
consistency vs visual design"; stage scope in PROJECT_IMPLEMENTATION_PLAN.md — Stage 7). The entry
notes the question "recurs either way" once real photography lands — that is precisely why it
waits: Stage 7 runs *after* real photography exists, so it gets answered once, against the images
that will actually ship, instead of twice. Stage 6's Item 18 is explicitly forbidden from touching
it.

---

## FOR STRAT — dev environment cannot exercise image uploads (found in live testing, 2026-07-27)

**Raised by the owner during the Item 13 live submit; owner asked STRAT to decide the shape of the
fix rather than have IMPL pick one.**

**Symptom.** Uploading an image on `localhost` shows a thumbnail, then flips to *"Your images could
not be attached. Press Retry on each one, then send again…"*. Console: `503 (Service Unavailable)`
on `POST /api/upload`. Reproducible every time.

**Cause — not a defect.** `.env.local` holds `UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io`.
That host does not resolve, so `checkUploadQuota` (`src/bff/uploadQuota.ts:76-92`) hits its 3s
fail-**closed** deadline and the route returns 503 (`app/api/upload/route.ts:61-68`). Failing closed
is deliberate and correct: an unreachable quota store must never silently admit uploads, or the abuse
control is bypassed by turning Redis off. **Production is unaffected** — real Upstash credentials
have been configured since 2026-07-23, and uploads work there.

The thumbnail-then-error sequence is also correct: the preview renders locally before the server
answers, and the 503 arrives ~0.3s later.

**The question for STRAT.** A developer currently cannot exercise the upload flow at all locally,
which is a meaningful gap for the app's most failure-prone surface. Options, none obviously right:

1. **A second free Upstash database for dev** — realistic, costs a signup, adds a credential to
   distribute and rotate.
2. **A dev-only in-memory quota fallback** — convenient, but it puts an `if (dev)` branch inside a
   security control, which is exactly where such branches are most dangerous. Would need a hard
   guarantee it cannot activate in production.
3. **Leave as-is and document it** — cheapest; developers test uploads only against a deployed
   preview. Requires saying so somewhere a developer will actually read.

Related: `PROJECT_PRODUCTION_READINESS.md` — Owner Pre-Release Actions already flags that
`UPSTASH_REDIS_REST_*` and `UPLOAD_TOKEN_SECRET` are **Production-only**, so any *preview* deploy
also 500s/503s on `/api/upload`. Whatever STRAT decides should cover preview, not just local.

**ROUTED 2026-07-27 (STRAT) → Stage 8, section D** (PROJECT_IMPLEMENTATION_PLAN.md — Developer and
CI infrastructure). It sits beside the Item 10 CO-4 env cleanup, which is the *same missing
credential seen from the operator's side* — deciding them together is the point. The three options
above travel with it undecided; the STRAT session that cuts Stage 8 picks one. Recorded preference,
not a decision: option 2 (a dev-only in-memory fallback) puts an `if (dev)` branch inside a security
control, and would need a guarantee it cannot activate in production before it is even comparable
to the other two.

## FOR STRAT — the sweep could not have caught the 503, and the error copy is unverified (2026-07-27)

**A gap in Item 13's own method, disclosed rather than buried.** The acceptance sweep tested per-file
upload failure by aborting the request **in the browser** (`route.abort("failed")`), never by taking a
real 503 from the server. Client behaviour looks similar, but the two paths map to different branches
in `src/features/request/lib/upload.ts`, so **the copy a real visitor sees on a genuine server failure
was never verified in this sweep.** The owner hit that exact path within minutes of live testing.

This matters beyond the one message: it is the difference between simulating a boundary and crossing
it — the same class as the mocked-vs-live submit that cross-review round 1 blocked on. Worth STRAT
deciding whether the standing verification method should require at least one real server-error path,
not only browser-level simulation.

`PROJECT_BACKLOG.md` already carries an entry (upload `503` / `upload_invalid` copy) noting the
message "reads as a hard error and omits the one thing that matters: the request can be submitted
without images (FS §4.5)". The owner's report is live confirmation of that entry: after the failure he
had no indication he could simply send the request without pictures. STRAT should decide whether that
copy fix is pre-launch or Stage 7, and whether it is bundled with the dev-environment decision above.

**ROUTED 2026-07-27 (STRAT), split in two — the entry raised a product bug and a process question,
and they belong in different places:**

- **The copy fix → Stage 8, section E** (PROJECT_IMPLEMENTATION_PLAN.md). Not Stage 7: nothing about
  it is visual. It is bundled with the dev-environment decision above, because verifying the fixed
  copy requires *producing a real 503* — which is exactly the capability that entry is about.
- **The method question → META**, filed as "A verification pass must cross at least one real
  boundary, not only simulate it" (`docs/framework/AI_FRAMEWORK_IDEAS.md`), owner decision
  2026-07-27. It is a framework rule, not product work, and the motivating evidence is stronger than
  this one entry: the *same* substitution-of-simulation-for-reality also produced the mocked-submit
  contradiction that cross-review round 1 blocked on, inside the same task.
