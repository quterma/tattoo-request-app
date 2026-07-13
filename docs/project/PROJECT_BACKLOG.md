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
  - budget range (note: the FS §4.2 field model deliberately contains no budget field)
  - willingness to wait

- File upload: prevent selecting the same file twice before submit. Nice-to-have, small,
  optional — post-release polish or an easy pre-release addition, not blocking Stage 4B. Likely
  approach: a file-identity heuristic (`name + size + lastModified + type`) applied in
  `FileUploadInput`'s `handleChange`, since two `File` objects from separate picker selections are
  never reference-equal even when they represent the same underlying file. Not implemented — see
  PROJECT_IMPLEMENTATION_PLAN.md — Post-Launch Roadmap — File Upload UX for the fuller note.
  (2026-07-12: still open; the Stage 6 upload UX itself is specified in FS §4.3–§4.5 —
  thumbnails, per-file progress/failure/remove — and governs any rework of `FileUploadInput`.)

---

## Frontend Improvements

- Extract typography components:
  - SectionTitle
  - SectionText
  - BulletList

- Replace split("\n") in i18n with string arrays

- **Public error & 404 UX (Stage 5D finding, deferred to Stage 6, 2026-07-09):** the root
  `app/not-found.tsx` shows a bare unlocalized "404" with no navigation link home, and the public
  routes have no error boundary — no root `global-error.tsx` exists and `error.tsx` files exist
  only under admin requests, so an unhandled public-page render error falls through to Next.js's
  default screen. Deferred as Stage 6 visual/product polish (localized 404 with navigation, minimal
  public error boundary / `global-error.tsx`), deliberately not implemented in the Stage 5D fix
  passes. See PROJECT_STAGE_LOG.md, 2026-07-09 Stage 5D Fix Pass 2 entry. (2026-07-12: remains a
  Stage 6 item — STAGE_6_FUNCTIONAL_SPECIFICATION.md does not define error/404 pages, so this is
  tracked in PROJECT_IMPLEMENTATION_PLAN.md, Stage 6, "In Stage 6 but outside the FS's
  public-website scope".)

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

## MIME Type Verification (post-MVP)

`validateFiles` in BFF trusts `file.type` from the multipart Content-Type header (browser-provided). No magic-byte verification is done. Acceptable for MVP at low volume with a known artist audience. Add magic-byte MIME checking if abuse is observed post-launch.

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
