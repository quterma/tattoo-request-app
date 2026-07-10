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

- FAQ as accordion on /policies page (after content stabilization)
- Add "Not a Fit" block (small tattoos, rush jobs, no concept, low budget)
- Sharpen positioning on Home:
  - focus on 3–6 hour sessions
  - large-scale work
  - Masha's style
- Price framing:
  - "starting from …"
  - filtering out low-budget clients
- Client expectations section:
  - trust the artist's style
  - multiple sessions possible
  - no micro-revisions
- Curated gallery:
  - 5–8 strong works instead of full feed

---

## Request Form Improvements

- Required form fields are defined in PROJECT_CONTEXT.md (Request Form section).
  The following fields are candidates for addition or refinement post-MVP:
  - budget range
  - willingness to wait

- File upload: prevent selecting the same file twice before submit. Nice-to-have, small,
  optional — post-release polish or an easy pre-release addition, not blocking Stage 4B. Likely
  approach: a file-identity heuristic (`name + size + lastModified + type`) applied in
  `FileUploadInput`'s `handleChange`, since two `File` objects from separate picker selections are
  never reference-equal even when they represent the same underlying file. Not implemented — see
  PROJECT_IMPLEMENTATION_PLAN.md — Post-Launch Roadmap — File Upload UX for the fuller note.

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
  passes. See PROJECT_STAGE_LOG.md, 2026-07-09 Stage 5D Fix Pass 2 entry.

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
