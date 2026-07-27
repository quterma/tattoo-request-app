Purpose  
Define a clear, executable implementation plan for the project.

Scope  
Development stages and execution order.  
No architecture explanations.

Audience  
AI agents and developers implementing the system.

---

# Execution Rule

AI must implement only what is defined in PROJECT_CONTEXT and PROJECT_DECISIONS.

No extra features, optimizations, or enhancements unless explicitly requested.

---

# Implementation Strategy

The project is implemented in incremental stages.

Each stage must:

- result in a working, testable state
- have clear exit criteria
- not break previous functionality

---

# Stage 0 — Foundation

Goal: prepare the technical base.

Tasks:

- project setup (Next.js, TypeScript)
- basic configuration (eslint, tsconfig, aliases)
- UI foundation (Tailwind, base components)
- i18n setup
- routing structure (public/admin)
- initial project structure
- documentation setup

Exit Criteria:

- project builds without errors
- routing works (basic pages accessible)
- base UI components render correctly
- i18n works for at least one page
- project structure matches PROJECT_STRUCTURE.md

---

# Stage 1 — App Shell

Goal: build basic navigation and layout.

Tasks:

- layout components
- navigation (mobile + desktop)
- route groups (public, admin)
- basic pages:
  - home
  - policies
  - location

Exit Criteria:

- navigation works across all pages
- layout is consistent
- mobile and desktop navigation function correctly
- pages are accessible and render without errors

Result:

- navigable application with static content

---

# Stage 2 — Public Content

Goal: complete public-facing pages.

Tasks:

- home sections (hero, gallery, how it works, about)
- policies content
- location page
- links and CTA flow

Exit Criteria:

- all public pages contain real content (no placeholders)
- CTA leads to request flow
- links between pages are correct
- layout remains consistent

Result:

- ready public surface

---

# Stage 3 — Request Flow (Core)

Goal: implement request submission.

## Stage 3A — Form UI (completed)

- request form UI
- form validation (client-side, Zod + RHF)
- file selection (client-side only)

## Stage 3B — API Layer

### 3B.1 — Payload contract + API route + first end-to-end submit

- define request payload contract (FormData shape)
- implement POST /api/requests Route Handler
- wire form submit to API route
- verify first end-to-end round trip (no storage or DB yet)

### 3B.2 — Success / Error UX

- implement success state after submission
- implement error state on API failure
- handle loading state in form

### 3B.3 — Server validation

- validate incoming payload server-side
- return structured validation errors
- handle errors in form UI

### 3B.4 — Server Validation UX

- consume server `fieldErrors` response on the client
- map `fieldErrors` → RHF `setError()` to display server-side messages per field
- map `formErrors` → contact group error display
- preserve existing client-side validation UX
- no persistence, no storage, no Supabase

### 3B.5 — File transport

- transport files from client to BFF via FormData
- validate file count and type server-side

## Stage 3C — Data Layer

### 3C.1 — Supabase foundation

- configure Supabase client (server-side)
- set up environment variables
- document required env vars in .env.example
- verify connection

### 3C.2 — File Storage

Architecture decisions confirmed in pre-implementation review. See PROJECT_DECISIONS.md: Storage Decisions, Upload Reliability Decisions, Failure Handling Decisions, clientSubmissionId — Storage Foundation.

#### 3C.2.1 — Storage Foundation

- introduce `clientSubmissionId` (UUID v4) on the client: generated before form submission, included in payload
- wire `clientSubmissionId` through `ParsedRequestPayload`, `parseRequestFormData`, and route handler (storage path use only — full idempotency logic is Stage 3D)
- document bucket name, folder structure, and filename convention in PROJECT_DECISIONS.md (done)
- update `.env.example` if any new storage-specific env vars are needed
- no upload logic yet

#### 3C.2.2 — Storage Integration

- implement `uploadRequestFiles()` in service layer: accepts files + clientSubmissionId, returns typed file records
- storage path: `request-images/{clientSubmissionId}/{type}/{type}-{index}.{ext}`
- extension derived from MIME type at upload time; `originalName` stored as metadata only
- per-file retry: 2–3 attempts with exponential backoff; transient/network failures only; validation failures do not retry
- track successfully uploaded files as upload proceeds (not the intended list)
- on final upload failure: delete already-uploaded files, log cleanup attempt and result, return error
- on DB failure (Stage 3C.3): delete uploaded files, log cleanup attempt and result, return error
- integrate into route handler after `validateFiles`
- tests: upload success, per-file retry, partial failure + cleanup, cleanup failure logged

Note: file count per field (MAX_FILES_PER_FIELD) is currently enforced by `requestFormSchema` inside `validateRequestPayload`, before `validateFiles` runs. `validateFiles` does not independently cap count — do not decouple validation order without updating both.

Note: MIME type validation in `validateFiles` trusts `file.type` from the multipart Content-Type header (browser-provided). Magic-byte verification is not implemented. Acceptable for MVP at low volume; revisit if abuse is observed.

### 3C.3 — Request persistence

- define requests table schema (includes `referenceCode`, `clientSubmissionId`, `clientName`, and file records)
- generate `referenceCode` server-side on insert (`REQ-YYYY-NNNN` format, sequential per year)
- implement request insert via service layer
- link uploaded file references to request record
- return `referenceCode` in the API success response; update success UX to display it

Note: the route currently generates a temporary `crypto.randomUUID()` as a placeholder and returns it to the client without storing it. In 3C.3, the placeholder is replaced by `referenceCode` from the DB insert result. The client success UX already renders the value conditionally and will work once the real value is returned.

### 3C.3.5 — Client Name field

- add `clientName` to the request form (required text input)
- add `clientName` to `requestFormSchema` and `ParsedRequestPayload`
- store `clientName` in the DB request record (column added in 3C.3 schema)

### 3C.4 — End-to-end submission

- full flow: form → API → storage → database
- verify request is stored correctly with file references

## Stage 3D — Request Identity & Idempotency

**Production Requirement.**

Goal: prevent duplicate requests from reaching the artist.

Note: `clientSubmissionId` client generation and payload wiring is introduced in Stage 3C.2.1 (storage folder use only). Stage 3D completes the full idempotency story.

### 3D.0 — clientSubmissionId idempotency ✓ completed

- store `clientSubmissionId` in the database with a unique constraint on the requests table
- implement server-side deduplication: if `clientSubmissionId` already exists, return existing request info (including `referenceCode`) without creating a duplicate
- `referenceCode` is already stored in the DB from 3C.3; deduplication returns the existing record's `referenceCode`

Note: `ParsedRequestPayload`, `parseRequestFormData` (BFF), `RequestForm.tsx` (client FormData build), and the route handler will already include `clientSubmissionId` from 3C.2.1. Stage 3D adds the DB constraint and deduplication logic only.

Must be complete before public production launch and before broad user testing.

### 3D.5 — Architecture & Documentation Audit / Fix Pass ✓ completed

- audit all PROJECT_* docs, code, migrations, and tests after Stage 3D
- fix documentation gaps and code-level inconsistencies found during audit
- enforce `NOT NULL` on `client_name` via migration with non-destructive backfill
- deduplicate `BUCKET` constant between `storage.ts` and `route.ts`

### 3D.5.3 — Supabase CLI Migration Workflow ✓ completed

- install and verify Supabase CLI as project devDependency
- link existing Supabase project (`supabase link`)
- repair migration history for the three manually-applied migrations
- document verified migration workflow in PROJECT_DECISIONS.md

## Stage 3D.6 — Domain Foundation

Goal: add a minimal studio ownership model before Admin Authentication.

Every request belongs to a studio. This is domain foundation, not full SaaS or multi-tenancy.
Placed here because migration cost is lowest before real production data exists.

Tasks:

- create `studios` table (id, name, created_at)
- create `studio_members` table (user_id FK → auth.users, studio_id FK → studios, created_at)
- add `studio_id` FK column to `requests` (NOT NULL)
- backfill all existing requests to Masha's studio (fixed UUID generated before migration)
- drop and recreate `create_request` RPC to accept `p_studio_id` parameter
- update storage path structure from `{clientSubmissionId}/{type}/{file}` to `{studioId}/{clientSubmissionId}/{type}/{file}`
- add `DEPLOYMENT_STUDIO_ID` env var to config layer and `.env.example`
- update `createRequest()` in service layer to accept and pass `studioId`
- update route handler to resolve `studioId` from `config.app.deploymentStudioId`
- update affected tests
- apply migration via CLI; verify end-to-end with a real form submission

No RLS policies in this stage. All access remains through service_role.

Deferred:

- RLS policies on `studios`, `studio_members`, `requests`, and Storage — Stage 5
- billing, trial, subscription columns — SaaS phase
- role column on `studio_members` — deferred until RBAC is needed
- workspace routing / multi-studio URL resolution — post-launch
- invite flow — post-launch
- staging Supabase project and Vercel preview/staging environment — Stage 5 decision point

Exit Criteria:

- `studios` and `studio_members` tables exist in Supabase
- all `requests` rows have a non-null `studio_id`
- `create_request` RPC accepts `p_studio_id`; old signature removed
- storage uploads use `{studioId}/{clientSubmissionId}/{type}/{file}` path structure
- `DEPLOYMENT_STUDIO_ID` wired through config → service → route
- pnpm qg passes (lint + typecheck + tests + build)
- `pnpm exec supabase migration list` shows Local = Remote
- one real end-to-end form submission succeeds with correct `studio_id` persisted and new storage path

Notes:

- `studio_members` replaces `admin_profiles` as the access gate for Stage 4A
- `getRequestByClientSubmissionId()` remains global (no studio filter) — see PROJECT_DECISIONS.md
- Masha's studio UUID must be generated and fixed before writing the migration SQL
- existing stored file paths remain valid; DB `storage_path` column stores the full path

---

# Stage 4 — Admin

Goal: implement protected admin interface for request management.

## Stage 4A — Admin Authentication

Goal: protect admin access before public launch.

**Required before public launch.** See PROJECT_DECISIONS.md — Admin Authentication Requirement.

Authorization model (see PROJECT_DECISIONS.md — Admin Authentication Architecture):

- Authentication: Supabase Auth session confirms who the user is
- Authorization: `studio_members` row confirms which studio data they may access
- A valid session alone is not sufficient — a `studio_members` row is required
- Users with no `studio_members` row must not access admin routes even if authenticated

Implementation sequence:

### 4A.1 — Supabase SSR Auth Client

- Install `@supabase/ssr`
- Create `src/services/supabaseAuth.ts`: cookie-session Supabase client
- Extend `proxy.ts` with Supabase SSR session refresh (preserve i18n behavior)
- Add any required env vars to `src/config/index.ts` and `.env.example`

### 4A.2 — Shared Authorization Function

- Create `src/services/auth.ts`
- Implement `getAuthenticatedStudioMember()`: checks Supabase session + `studio_members` row
- Returns `{ userId, studioId }` or `null`
- Export through `src/services/index.ts`

### 4A.3 — Admin Route Protection

- Add server component auth check to `app/[locale]/(admin)/admin/layout.tsx`
- No session → redirect to locale-aware `/[locale]/admin/login`
- Session but no `studio_members` row → render unauthorized page ("This account is not authorized.")
- Session + row → render admin content

### 4A.4 — Login Page

- Create `app/[locale]/(admin)/admin/login/page.tsx`
- Email/password login form via Supabase Auth SSR client
- On success: redirect to `/[locale]/admin`
- On failure: display error message inline

### 4A.5 — Logout

- Add logout action (server action or route handler)
- Clears Supabase session
- Redirects to locale-aware login page

### 4A.6 — OAuth Callback (if Google OAuth is included)

- Create `app/auth/callback/route.ts`
- Exchanges code for session; redirects to `/[locale]/admin`
- No authorization or business logic in callback

### 4A.7 — Password Reset

Routes (outside `(protected)`):

- `app/[locale]/(admin)/admin/forgot-password/page.tsx` + `actions.ts` — email form; calls `resetPasswordForEmail(email, { redirectTo })`; always returns a generic success message (no user enumeration)
- `app/auth/reset-callback/route.ts` — dedicated fixed non-locale callback (not `/auth/callback`); exchanges code via `exchangeCodeForSession()`; redirects to `reset-password` on success, to `forgot-password?error=reset` on missing/invalid code or exchange failure
- `app/[locale]/(admin)/admin/reset-password/page.tsx` + `actions.ts` — new-password form; if no active session, shows an expired/invalid-link state (not a login redirect); action calls `updateUser({ password })`, then immediately `signOut()`, then redirects to `login?reset=success`

Locale preserved via `?locale=` on `redirectTo`, same mechanism as Google OAuth (4A.6).

See PROJECT_DECISIONS.md — Password Reset for the full flow, the recovery-session caveat (no distinct restricted session type; enforced via routing + forced sign-out), and the link-scanner/prefetch limitation.

No unit tests expected by default (same category as `loginAction`/`logoutAction`/OAuth callback — SDK orchestration + redirects); add tests only for isolated project-owned logic if extracted (e.g. a locale-fallback helper). Manual end-to-end verification with real Supabase is required — see PROJECT_TESTING_STRATEGY.md conventions already applied to 4A.4–4A.6.

### 4A.8 — Manual Activation Documentation

- Document the manual `studio_members` insert step in project docs (or internal dev notes)
- No invite flow, no self-service registration for admin access

Exit Criteria:

- admin routes are not publicly accessible without a valid session
- unauthenticated users are redirected to login
- authenticated users without a `studio_members` row see the unauthorized page
- authenticated users with a `studio_members` row can access admin content
- login (email/password) works correctly
- logout clears session and redirects to login
- password reset flow works end-to-end
- `proxy.ts` still handles i18n routing correctly; no regression
- `pnpm qg` passes (lint + typecheck + tests + build)

Result:

- admin interface is protected

---

## Stage 4B — Admin Dashboard ✓ closed (implementation-complete, 2026-07-04)

Goal: implement request management interface.

Closed 2026-07-04 — see PROJECT_STAGE_LOG.md (2026-07-04 closure entry) for the formal closure
record. All sub-stages below (4B.0–4B.6) are implemented and committed. Closure is an
implementation closure: the one outstanding item, 4B.5.1's physical mobile-device viewer
verification, is deferred to Stage 6 / pre-release manual QA (not completed, not a Stage 4B
blocker) — see 4B.5.1 below and Stage 6.

**Reduced approved scope** (recorded 2026-07-02, see PROJECT_DECISIONS.md — Stage 4B Admin
Dashboard Architecture): dashboard metrics, admin notes, and unread/read tracking are deferred
out of Stage 4B — see Stage 4C below. Stage 4B delivers the minimal request-management loop only.

**UI architecture note** (satisfies the "UI architecture audit before implementation"
requirement without a separate audit stage, given the reduced scope): use existing shared UI
primitives/design system (`src/shared/ui`) wherever they fit; add admin-specific UI only under
`src/features/admin/ui`. No new design system, no broad visual polish, no new dependencies.

### 4B.0 — Architecture & Data-Access Audit ✓ completed

Read-only audit (no code changes) of the smallest clean server-side architecture for list,
detail, signed URLs, and status update; service/route responsibility boundaries; DTO shape;
route/data-fetching pattern; signed URL strategy; status-update flow; schema verification
against real migrations; test strategy; and the Stage 4B scope documentation gap (this stage's
task list and PROJECT_CONTEXT.md still described notes/unread/metrics as in-scope). Findings
reviewed externally; approved decisions recorded in PROJECT_DECISIONS.md and applied to this
stage's task list and exit criteria below.

### 4B.1 — Documentation + Architecture Foundation ✓ completed

Documentation-only step (this entry). Updates Stage 4B scope, exit criteria, and cross-doc
consistency (PROJECT_CONTEXT.md, PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md) to match the
reduced approved scope and the 4B.0 audit's approved architecture decisions. No pages, UI,
status action, signed URL logic, or data queries implemented yet.

Tasks:

- admin request list (all requests for the authenticated member's studio)
- request detail page (data + images via server-generated signed URLs)
- status management (new / active / booked / completed / rejected) — see PROJECT_DECISIONS.md,
  Request Status Semantics
- empty / loading / error states for list and detail

Architecture (see PROJECT_DECISIONS.md — Stage 4B Admin Dashboard Architecture for full detail):

- route param is the DB UUID `id` (`/[locale]/admin/requests/[id]`), not `referenceCode`
  (sequential/enumerable) — UI displays `referenceCode`, UUID stays technical/internal
- Server Components for list/detail reads; Server Action for status update
- every page/action calls `getAuthenticatedStudioMember()` before any data access
- every DB read/update includes `studio_id = studioId` scoping
- `src/services/db.ts` and `src/services/storage.ts` extended directly — no `services/admin.ts`
- DTO/types in `src/features/admin/types`; admin UI components in `src/features/admin/ui`
- signed URLs generated only from file records returned by an already studio-scoped request
  query; raw `storagePath` never enters a UI DTO
- status update matching 0 rows is `not found`, not silently treated as success
- cross-studio detail access and a genuinely missing request both return the same uniform
  not-found behavior — no distinguishing signal
- status update validates only that the requested value is one of the five allowed values —
  no transition graph, no terminal-state enforcement, same-status updates are valid (see
  PROJECT_DECISIONS.md — Request Status Semantics)

Exit Criteria:

- admin can view the request list, scoped to their own studio only
- admin can open a request's detail page with images (signed URLs), scoped to their own studio
- admin can update a request's status, scoped to their own studio; cross-studio update is
  rejected as not-found, not silently ignored or misreported as success
- list and detail pages handle empty, loading, and error states
- UI uses existing design system and primitives where applicable; admin-only UI lives under
  `src/features/admin/ui`
- `pnpm qg` passes (lint + typecheck + tests + build)

Result:

- admin can view and triage requests for their own studio

### 4B.4 — Admin Request List UI ✓ completed

Mobile-first card list, originally at `/[locale]/admin`, moved to `/[locale]/admin/requests` in
a post-4B.5 routing cleanup (`/[locale]/admin` now redirects there — see PROJECT_STAGE_LOG.md);
see PROJECT_STAGE_LOG.md for the full completion record.

### 4B.5 — Admin Request Detail UI ✓ completed

`/[locale]/admin/requests/[id]`, Server Component, independent `getAuthenticatedStudioMember()`
call, `getAdminRequestDetail()`, uniform `notFound()` for invalid id/missing/cross-studio,
mobile-first single-column layout, plain `<img>` at natural aspect ratio with no crop and no
click behavior, route-level loading/error/not-found states. Excludes status update, notes,
unread, filters, calendar, and any image viewer/zoom — see PROJECT_STAGE_LOG.md for the full
completion record.

### 4B.5.1 — Minimal Image Viewer / Zoom ✓ complete (implementation); physical mobile verification deferred to Stage 6 / pre-release QA

Small follow-up step immediately after 4B.5, before status update. Full decisions and the
implementation record are in PROJECT_DECISIONS.md — Minimal Image Viewer / Zoom (under Stage 4B
Admin Dashboard Architecture) and PROJECT_STAGE_LOG.md (2026-07-04 entry). Summary: tap an
available image → fullscreen in-app viewer (no new tab), built with `yet-another-react-lightbox`
3.32.0 (YARL) + its official Zoom plugin — no custom pinch/pan gesture handling; `react-photo-
view` fallback was not needed (no React 19/Next 16 incompatibility found). All available images
across the request (reference then placement) form one combined swipeable slide set. Reuses the
already-signed URL, no new signed-URL request on open; dark uncropped/letterboxed background;
pinch-zoom, pan, double-tap zoom/reset via the Zoom plugin; close button, Escape, and
backdrop-tap all enabled; nav arrows hidden when only one image exists, swipe navigation left
active. `closeOnPullDown` (swipe-down-to-close) intentionally left disabled this pass — no
physical device available to verify it doesn't conflict with pinch/pan. No gallery/download/
animation/custom zoom-button controls.

Implementation and desktop manual verification are complete; this sub-stage's code is done.
**Physical iPhone Safari / Android Chrome device verification was not performed** (no device/
deployment access during Stage 4B) and is **not** claimed as done. It does not block Stage 4B
closure — it is deferred to Stage 6 (mobile polish) and/or pre-release manual QA, together with
`closeOnPullDown` — see Stage 6 below and PROJECT_BACKLOG.md. **The low-resolution-zoom follow-up
was implemented 2026-07-06** (fit-to-screen initial sizing via `carousel.imageProps` +
`maxZoomPixelRatio: 2`, after a 2026-07-05 attempt was found insufficient by manual testing; see
PROJECT_STAGE_LOG.md 2026-07-06 entry and PROJECT_DECISIONS.md — Minimal Image Viewer / Zoom); only
its manual real-browser verification and the physical-device checks above remain outstanding.

### 4B.6 — Request Status Update ✓ completed

Committed as `44f11c4` (feat(4B.6): add admin request status update). Full implementation and
decision record in PROJECT_STAGE_LOG.md (2026-07-04 entry) and PROJECT_DECISIONS.md — Request
Status Semantics. Summary: Server Action (`updateRequestStatusAction`) independently calls
`getAuthenticatedStudioMember()` before any write, validates the submitted status against
`REQUEST_STATUS_OPTIONS`, and calls `updateRequestStatusForStudio(studioId, requestId, status)` —
one query scoped to `id = requestId AND studio_id = studioId`; 0 matched rows (missing or
cross-studio request) returns a generic inline not-found error, not silent success. New
`RequestStatusForm` Client Component (the only new client boundary this stage) renders a `<select>`
+ submit button via `useActionState`, mirroring the existing `LoginForm`/`ResetPasswordForm`
pattern. No status transition graph, no terminal-state enforcement, no notes, no activity history,
no route changes, no DB schema changes, no new dependencies — same-status submission remains
valid, all explicitly out of scope per the confirmed plan.

Manual verification of the live status-update flow was completed successfully before commit:
status change succeeds, detail page reflects the new status, list page reflects the new status
after navigation, and same-status update works. `pnpm qg` — structure / lint / typecheck / test /
build all PASS (202/202 tests).

---

## Stage 4C — Admin Dashboard Enhancements (deferred from Stage 4B)

Goal: extend the Stage 4B request-management loop with tracking and visibility features that
are not required for the minimal admin loop to function.

Deferred here on 2026-07-02 — see PROJECT_DECISIONS.md — Stage 4B Admin Dashboard Architecture.
Not started; no architecture decided yet for this stage.

Tasks:

- unread/read tracking (`read_at` column already exists on `requests`, unused until this stage) —
  includes an unread/new indicator on list cards (deferred from Stage 4B.4 list UI)
- admin notes (internal notes per request — no DB column exists yet; schema change required)
- basic dashboard metrics:
  - total request count
  - count by status
  - requests this week / month
  - last request received timestamp
- list UI enhancements deferred from Stage 4B.4 (list is currently a fixed, unfiltered,
  newest-first feed with no per-card controls):
  - status tabs / hide-closed toggle
  - filters and search
  - configurable sorting
  - appointment-date sorting belongs to a future Appointment/Calendar model, not this list

Exit Criteria:

- unread indicator reflects read/unread state
- admin can add and view internal notes per request
- dashboard metrics display correctly
- list supports status filtering/tabs and search, with configurable sorting

Result:

- admin has richer visibility into request volume and history

---

# Stage 5 — Production Hardening

Goal: verify readiness and deploy to production.

Stage 5 is executed as four ordered sub-stages, **5A → 5B → 5C → 5D**, in that sequence. Each
sub-stage builds on the previous one; Stage 5D (the final full-application maturity audit) is
deliberately last, after security/data-boundary work and real-infrastructure verification, so it
assesses a production architecture that is actually complete rather than a work-in-progress one.
**Stage 5A is complete (2026-07-05); Stage 5C is closed (2026-07-08, real-infrastructure/manual E2E
verification — not a production-readiness claim); Stage 5D is closed (2026-07-10 — see the Stage 5D
closure entry in PROJECT_STAGE_LOG.md)** — see PROJECT_STAGE_LOG.md for the full dated record and
PROJECT_DECISIONS.md, Stage 5A Security / Data-Boundary Decisions, for the decisions 5A produced.
Stage 5B's core hardening tasks are complete, but several of its listed items (custom SMTP / rate
limits / leaked-password protection verification, production environment setup, CI/CD) remain open
as pre-launch work — see the Stage 5B task list below and PROJECT_PRODUCTION_READINESS.md.
**Stage 6 is the next development stage** — governed by `STAGE_6_PRODUCT_DEFINITION.md` (PRD) and
`STAGE_6_FUNCTIONAL_SPECIFICATION.md` (see Stage 6 below); pre-launch requirements remain
separately open and are not implied complete by Stage 5D closure.

## Stage 5A — Security / Data-Boundary Planning ✓ completed (2026-07-05)

Goal: decide and document the security and data-boundary architecture before implementing it.

Completed as four read-only sub-stages plus an independent review (5A.1 repo/security audit, 5A.2
live Supabase read-only verification, 5A.3 legacy-data cleanup plan, 5A.4 owner-approved
destructive cleanup of confirmed test data, independent Claude review/consensus) — see
PROJECT_STAGE_LOG.md (2026-07-05 entry) for the full record and PROJECT_DECISIONS.md, Stage 5A
Security / Data-Boundary Decisions, for the resulting decisions.

Outcome (see PROJECT_DECISIONS.md for full rationale):

- BFF + server-only `service_role` confirmed and retained as the primary access model; no
  browser-side Supabase DB/Storage access exists or is planned for the current single-studio scope
- RLS confirmed enabled on all four app tables (`studios`, `studio_members`, `requests`,
  `request_files`) and on `storage.objects` for the `request-images` bucket; **zero policies is a
  deliberate deny-all-by-omission decision, not a gap** — no policy is added until a real
  non-service-role access path exists
- `studio_members` self-read policy and Storage path-prefix policies were considered and
  explicitly deferred, not rejected
- 3 confirmed test/dev requests (`REQ-2026-0002/0003/0004`) and their 6 legacy-format Storage
  objects were deleted with owner approval; legacy-path DB count is now 0; 2 unrelated orphaned
  Storage objects were intentionally left untouched (tracked in PROJECT_BACKLOG.md)
- Staging-environment setup is deferred — not required for the revised, minimal Stage 5B scope,
  but required before any future change that adds real authenticated-role RLS policies, browser
  Supabase access, multi-studio behavior, or a `create_request` signature/behavior change
- Full backup posture (DB dump, Storage backup, PITR) is deferred until real data exists or
  pre-launch — current data remains test data

Result: an approved, documented security/data-boundary posture, with a revised Stage 5B scope
below reflecting the "no RLS policy implementation yet" decision.

## Stage 5B — Production Hardening Implementation

Goal: implement the minimal hardening tasks approved coming out of Stage 5A, plus the remaining
Stage 5 hardening tasks. **Revised scope (2026-07-05, see PROJECT_DECISIONS.md — Stage 5A Security
/ Data-Boundary Decisions): no RLS or Storage policy implementation in this pass** — the Stage 5A
consensus is that RLS-enabled-with-zero-policies is the intentional current posture, not a
placeholder awaiting 5B. Policies are added only in a future stage when a real non-service-role
access path is introduced.

Tasks:

- ✓ **completed 2026-07-05 (Stage 5B.1)** — `create_request` hardening migration: fixed the
  mutable `search_path` finding from `supabase db advisors` via
  `supabase/migrations/20260705155244_harden_create_request_search_path.sql`
  (`ALTER FUNCTION ... SET search_path = public, pg_temp`) — a narrow, low-risk migration, not a
  policy change. Verified live: advisor finding gone, signature/grants/security-mode unchanged,
  real smoke-test submission succeeded. See PROJECT_STAGE_LOG.md (2026-07-05 entry) for the full
  record.
- ✓ **completed 2026-07-05 (Stage 5B.2)** — Storage bucket (`request-images`) MIME-type and
  file-size limits configured via the Supabase Storage API (`updateBucket()`, not a Dashboard
  click-through and not a SQL migration): `file_size_limit` 10 MB, `allowed_mime_types` the same
  five types `validateFiles` already enforces app-side (`image/jpeg`, `image/png`, `image/webp`,
  `image/heic`, `image/heif`); `public` confirmed still `false`. Verified live: bucket config
  re-read and matches exactly; real smoke-test submission with a valid non-blank image succeeded
  and signed-URL access still works. See PROJECT_STAGE_LOG.md (2026-07-05 entry) for the full
  record.
- Auth Dashboard verification: confirm redirect URLs (OAuth callback, password-reset callback,
  including the production origin once known), custom SMTP configuration status, rate limits, and
  enable "Leaked Password Protection" (flagged by `supabase db advisors`) — Dashboard verification,
  not code
  - ◐ **partially done, 2026-07-08** — Site URL and Redirect URLs updated to include the deployed
    Vercel origin alongside localhost (see PROJECT_STAGE_LOG.md, 2026-07-08 entry); this fixed
    deployed reset-password email behavior and is verified live. Custom SMTP configuration status,
    rate limits, and "Leaked Password Protection" are **still not verified/enabled** — not done by
    this entry.
- production environment setup: domain, production env vars, Google OAuth production redirect URI, backups, monitoring/logging (see PROJECT_PRODUCTION_READINESS.md, Production Environment Setup)
  - ✓ **completed 2026-07-06** — Node runtime floor declared: `package.json` now has
    `"engines": { "node": ">=20" }`, closing a small deployment-readiness risk (local dev Node 24,
    no prior declared floor) found during the read-only Stage 5B environment/deployment audit.
    `engines` documents the supported minimum; it does not replace manually checking/setting the
    Vercel project's Node.js Version to 20+ before the first deployed E2E test — that check remains
    an outstanding manual step. No `.nvmrc`, no `vercel.json`, no dependency/script/lockfile change.
    See PROJECT_STAGE_LOG.md (2026-07-06 entry) for the full record.
- logging and error handling review
- ✓ **completed 2026-07-06** — dependency security audit (`pnpm audit`) executed and resolved:
  read-only audit found 98 advisories; owner approved a narrow remediation bumping exactly three
  direct dependencies (`next` `16.1.6`→`16.2.10`, `next-intl` `4.8.2`→`4.13.1`, `vitest` `4.0.18`→
  `4.1.10`, no major-version jumps), resolving all `next`/`next-intl` advisories and the sole
  critical-labeled advisory; `pnpm qg` passed with no source changes; remaining 75 advisories are
  dev-only/non-reachable chains (`shadcn`'s bundled SDK, `eslint` transitive deps, Vite dev-server
  chain, `jsdom`/`undici`, `postcss`), documented and deliberately deferred. See
  PROJECT_STAGE_LOG.md (2026-07-06 entry) for the full record.
- CI/CD: GitHub → Vercel preview/production deploy flow, `pnpm qg` gate before merge (see PROJECT_PRODUCTION_READINESS.md, CI/CD)

Explicitly out of scope for this Stage 5B pass (deferred, see PROJECT_DECISIONS.md): RLS policy
implementation on any table; Storage path-prefix policies; staging Supabase project / Vercel
staging environment setup (not a hard blocker for this minimal pass); full backup/PITR posture.

Result: hardened application, ready for real-infrastructure verification.

## Stage 5C — Real Infrastructure and End-to-End Verification ✓ closed (2026-07-08)

Goal: verify the hardened application against real, deployed infrastructure.

**Closed 2026-07-08 as real-infrastructure/manual-E2E-verification complete** — see
PROJECT_STAGE_LOG.md (2026-07-08 closure entry) for the full verified-flow list and the explicit
list of what remains deferred. A Vercel deployment from `main` exists; the core public/admin flows
(submission, uploads, admin list/detail, signed images, status update, email/password auth,
protected routes, password reset, Google OAuth for both authorized and unauthorized accounts) were
manually verified against it, and the locale-prefix routing bug was fixed and verified both locally
and on Vercel. **This closure is real-environment verification only — it is not a
production-readiness or public-launch claim, and it does not close any PROJECT_PRODUCTION_READINESS.md
checklist item** (domain, custom SMTP, backups/PITR, monitoring, staging/production split all
remain open there).

Explicitly not done, carried forward (not blockers to this closure, but not resolved by it):

- E2E/integration test coverage against real Supabase infrastructure — verification so far was
  manual, not automated (see PROJECT_PRODUCTION_READINESS.md)
- performance measurement on the deployed environment — only a qualitative "felt slower" observation
  exists, no measurement taken (see PROJECT_PRODUCTION_READINESS.md, Performance Validation)
- the separate staging/production environment split (still just one Supabase project / one Vercel
  deployment, used for controlled test data — see Decision C below)
- the OAuth/reset locale-query Redirect-URL allowlist design debt (working workaround in place;
  see PROJECT_BACKLOG.md) — a candidate for Stage 5D or later, not yet assigned

Hands off to: a DevOps/workflow decision block (git-flow, CI/CD trigger, staging/production split
— see PROJECT_DECISIONS.md, Stage 5C Deployment Workflow and Environment Decisions), then **Stage
5D — Full Application Maturity Audit** (since closed, 2026-07-10 — see below). Stage 6 must not
begin until Stage 5D is complete — that condition is now satisfied.

Result: a verified, deployed application — the completed production architecture that Stage 5D
will audit.

## Stage 5D — Full Application Maturity Audit + Targeted Fix Pass ✓ closed (2026-07-10)

**Closed 2026-07-10** — primary audit (2026-07-08), findings reconciliation, Fix Pass 1 (commit
`9bc8e6f`) and Fix Pass 2 (commit `043bcb7`) complete; independent read-only closure verification
returned `STAGE_5D_READY_TO_CLOSE`. See PROJECT_STAGE_LOG.md, 2026-07-10 Stage 5D closure entry,
for what was fixed/deferred/rejected. Closure is not a public-launch/production-readiness claim —
pre-launch items remain open in PROJECT_PRODUCTION_READINESS.md and PROJECT_BACKLOG.md.

Goal: a structured, evidence-based final audit of the whole shipped MVP — not just Stage 5's own
new code — to catch immature architecture, duplication, rough code, hidden security issues,
stale docs, or avoidable technical debt before Stage 6 visual/product polish and release.

This is a **codebase/product maturity audit**, not a visual redesign and not license to expand
product scope. It runs after 5A–5C, once the production architecture is actually complete.

It is designed to answer: *is there anything structurally weak, duplicated, inconsistent,
insecure, under-tested, misleadingly documented, or unnecessarily immature that should be fixed
before visual polish and release preparation?*

### Audit scope

Full-application review across these lenses:

- architecture and layering / dependency boundaries
- server/client boundaries and accidental client exposure
- auth, authorization, tenant/studio scoping, RLS/service-role/storage-policy assumptions
- API / Server Action / Route Handler contracts and error handling
- duplication, competing sources of truth, inconsistent DTO/config/type ownership
- component size, responsibility boundaries, naming, dead code, stale abstractions, unnecessary complexity
- form/submission/upload/idempotency/error-state correctness
- test strategy and meaningful regression-risk gaps
- accessibility and semantic/UI correctness at the code level
- i18n/locale-routing consistency and hardcoded user-visible copy
- environment/config/secrets/deployment assumptions
- documentation consistency, stale claims, mismatch between docs and code/migrations
- production-readiness risks and "looks unfinished / junior / fragile" findings

### Audit method

Two-pass approach:

1. **Primary repo-aware audit** by the main implementation agent (Claude Code or equivalent):
   direct inspection of source, tests, migrations, configuration, and docs.
2. **Independent second-opinion audit** by a different capable agent/tool where available (for
   example Codex), using the same agreed audit brief, independently reviewing the repository.

The second audit is recommended, not a hard blocker if unavailable. If it cannot be run, the
primary audit's report must state that limitation explicitly, rather than silently proceeding as
if two audits occurred.

Then a human/lead synthesis step, required regardless of how many audits ran:

- merge findings from all audits performed
- remove duplicates/noise
- verify each finding against the actual code (no finding is accepted on an agent's word alone)
- classify each finding (see Finding classification below) before any implementation begins

### Finding classification

Every finding must be placed into exactly one of:

- **Must fix before Stage 6** — correctness, security, data integrity, serious maintainability,
  broken boundary, or release-risk issue
- **Fix during Stage 5 if small** — clear improvement with bounded scope and low regression risk
- **Defer deliberately** — valid but not justified before launch; must be added to
  PROJECT_BACKLOG.md with rationale and a pointer back to the audit report / Stage 5D closure entry
- **Reject / no action** — false positive, preference-only, speculative, or not worth the
  complexity

No broad refactor may start from an audit finding without a separately approved, bounded
implementation plan. Finding something during the audit does not itself authorize fixing it.

### Deliverables

- a dated audit report (or reports) with evidence and affected files
- a consolidated findings register with classification and rationale
- a small approved remediation plan for accepted fixes
- targeted implementation and regression tests/manual checks where appropriate
- documentation updates for decisions, structure, architecture, backlog, and stage log as needed
- a final Stage 5D closure note in PROJECT_STAGE_LOG.md stating what was fixed, deferred,
  rejected, and what remains intentionally accepted

### Exit Criteria

Stage 5D is complete only when:

- both audits have been completed, or the absence of the independent audit is explicitly recorded
- findings are consolidated and classified
- all "must fix before Stage 6" findings are resolved and verified
- accepted small fixes are completed, or consciously moved to backlog with rationale
- no unreviewed high-risk architecture/security/correctness concern remains
- docs reflect the final state honestly
- quality gates (`pnpm qg`) pass after the fix pass
- Stage 6 begins from a documented, reviewed baseline

Stage 5D is not a promise of zero technical debt — the goal is deliberate, reviewed debt, not
perfection.

## Stage 5 Exit Criteria

- all items in PROJECT_PRODUCTION_READINESS.md are resolved or explicitly deferred
- security checklist complete (5A/5B)
- application deployed and accessible (5C)
- no critical bugs or regressions
- manual smoke test of full submission and admin flow passes (5C)
- Stage 5D's exit criteria above are met

Result:

- production-ready application, publicly launched, reviewed via Stage 5D before Stage 6 begins

---

# Stage 6 — Product Experience Polish — CLOSED 2026-07-27

Goal: elevate UI/UX and product quality of the public website and polish the admin experience.

Stage 6 begins only after Stage 5D's audit/fix pass is closed (see Stage 5D above) — it builds
on a reviewed, documented baseline, not on unreviewed accumulated debt.

**CLOSED 2026-07-27 by owner decision**, on the evidence of Item 13's acceptance sweep
(`tasks/done/STAGE_6_TASK_13_acceptance_sweep.md`), whose verdict reached consensus on a clean
round 6 of an independent cross-review. All 19 items are done. All three exit criteria are met:
FS §6 verifies 13/13 (8 measured in a browser against a production build, 6 read from code by a
delegated independent session, and C5's persistence half closed by one live production submit —
reference code `PK79WU`); the site is internally consistent (Item 18); `pnpm qg` exits 0 with no
regressions.

**Closing Stage 6 is not a launch-readiness claim.** Ten `__asset_TODO` placeholders, the visual
identity, and every deployment/operational item remain open by design — they are **Stage 7** and
**Stage 8** below, which is the whole point of the 2026-07-27 split (PROJECT_DECISIONS.md —
"Stage 8 — Pre-Release and Launch created; the three-way split of 'pre-launch'").

## Source of Truth (2026-07-12 — see PROJECT_DECISIONS.md, Stage 6 Product Documentation Authority)

Stage 6 is governed by two dedicated documents in `docs/project/`:

- **`STAGE_6_PRODUCT_DEFINITION.md` (PRD)** — the authoritative **product** document: product
  context, vision, goals, customer journey, product principles, Non-Goals, and Owner Decisions
  D1–D10.
- **`STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS)** — the authoritative **implementation** document
  for the public website: navigation and CTAs, page responsibilities, the Request flow at field
  level, states/failure behavior, content rules, normative copy (Appendix A), and acceptance
  criteria (FS §6).

Rules:

- All future Stage 6 work on the public website must follow these two documents. This plan does
  not restate their scope — the earlier Stage 6 task list previously duplicated here is
  superseded by them.
- Product behavior changes require updating the PRD/FS **first** (PRD §9 Change Control), then
  implementation. Engineers must not resolve open product questions during implementation
  (FS §1 Escalation rule).
- On conflict, the PRD wins over the FS; both win over any older Stage 6 planning text remaining
  in PROJECT_* documents.

## In Stage 6 but outside the FS's public-website scope

Carried Stage 6 items not covered by the PRD/FS (tracked here and in PROJECT_BACKLOG.md):

- admin interface polish, including mobile polish (spacing, touch targets, scroll behavior)
  - candidate (noted 2026-07-03, not decided): admin request list in mobile landscape /
    tablet-width view could move to a two-column card grid if it improves use of horizontal
    space; the Stage 4B.4 list stays single-column mobile-first until this visual review —
    not a functional blocker, no change made now
  - deferred from Stage 4B (see PROJECT_IMPLEMENTATION_PLAN.md — 4B.5.1, PROJECT_STAGE_LOG.md
    2026-07-04 closure entry): physical mobile-device verification of the 4B.5.1 admin image
    viewer — iPhone Safari + Android Chrome, pinch zoom, pan after zoom, double tap, swipe,
    close button, backdrop tap, portrait/landscape. Never performed (no device/deployment access
    during Stage 4B); not a Stage 4B blocker. Also gates `controller.closeOnPullDown`
    (swipe-down-to-close) — see PROJECT_BACKLOG.md. The low-resolution-image zoom-cap follow-up
    was implemented 2026-07-06 (fit-to-screen initial sizing via `carousel.imageProps` +
    `maxZoomPixelRatio: 2`, after a 2026-07-05 attempt was found insufficient; see
    PROJECT_STAGE_LOG.md 2026-07-06 entry) — only its manual real-browser verification remains,
    tracked alongside the physical-device checks above
- public error & 404 UX (localized 404 with navigation, minimal public error boundary /
  `global-error.tsx`) — Stage 5D deferred finding, see PROJECT_BACKLOG.md; the FS does not
  define error/404 pages
- basics: favicon, Open Graph / social preview image, meta description/SEO tags (public site,
  not specified by the FS)
- design system **consistency** (one token system, one type scale, one spacing rhythm) and
  accessibility/readability fixes on the **public** website — Stage 6 Item 18. **Narrowed
  2026-07-26:** this line previously read "design system refinement (typography, color, spacing
  consistency) … across both public and admin surfaces", which was broad enough to authorize a full
  visual design pass. It no longer does — establishing a visual identity (palette, fonts, layout
  language, art direction) and the admin surfaces both moved to **Stage 7** below. See
  PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design (2026-07-26)".

Exit Criteria:

- every FS §6 acceptance criterion verifies true for the public website
- the public website is internally **consistent**: one token system, no dead CSS, no ad-hoc
  per-page spacing overrides, and no viewport at which a page clips or overflows
- no regressions in core flows

**All three exit criteria are met as of 2026-07-27 — Stage 6 is READY TO CLOSE, awaiting the owner's
closure.** Established by Item 13's acceptance sweep (`tasks/done/STAGE_6_TASK_13_acceptance_sweep.md`),
whose verdict reached **consensus on a clean round 6** of an independent cross-review
(`reviews/done/REVIEW_2026-07-27_stage6-item13-acceptance-sweep-verdict.md`, 7 findings, all accepted).

- **FS §6 — 13/13 verify.** 8 criteria measured in a browser against a production build, 6 read from
  code by a delegated independent session, and **C5's persistence half closed by one live production
  submit (`PK79WU`)** — the owner chose to satisfy the criterion rather than waive it after round 1
  rejected deferring that evidence to launch.
- **Consistency** — discharged by Item 18 (24 captures, `scrollWidth === viewport` at 6 routes × 4
  widths; `mb-*` counters and `py-*` overrides grep to 0) and re-confirmed by Item 13's mobile QA.
- **No regressions** — `pnpm qg` exit 0 (33 files / 408 tests) on the final tree.

**Not closed by this, and deliberately outside the gate:** the 10 `__asset_TODO` placeholders (a
**launch** gate — no FS §6 criterion mentions assets, and requiring real photography here would
deadlock Stage 6 against the stage that follows it), physical-device verification, tap-target heights
(→ Stage 7), and the owner pre-release debts in PROJECT_PRODUCTION_READINESS.md. **Stage 6 closing is
not a launch-readiness claim.**

**Removed from Stage 6's exit criteria 2026-07-26** (moved to Stage 7): "visual and interaction
quality is consistently high across all surfaces" and "mobile experience is polished". Both are
retained verbatim as Stage 7 exit criteria. The reason is recorded in the decision above: as
written they made Stage 6 un-closeable, because "consistently high visual quality" cannot be
judged against a site whose every image is an AI placeholder and whose real photography is weeks
out. Note "mobile experience is polished" also implied a physical-device check that no session in
this repository can perform — it is tracked in PROJECT_PRODUCTION_READINESS.md and does not gate
Stage 6.

Result:

- a complete, internally consistent public website that satisfies its functional specification

---

# Stage 7 — Visual Design

Goal: give the product a deliberate visual identity, and polish the admin surfaces, against real
content.

Created 2026-07-26 by owner decision — see PROJECT_DECISIONS.md, "Stage 7 — Visual Design
(created 2026-07-26)". Stage 7 did not previously exist; Stage 6 was the last stage before the
Post-Launch Roadmap, and its scope had absorbed both consistency work and visual design. Splitting
them lets Stage 6 close on objectively checkable criteria while the design work waits for the
input it actually needs.

Stage 7 begins only after Stage 6 closes (FS §6 acceptance sweep, Item 13) **and** the owner's
real photography and curated portfolio work exist. Designing against the AI placeholders currently
in the tree would have to be redone once real images land — that is the whole reason this stage is
separate.

**Scope confirmed and widened by owner decision 2026-07-27**, at Stage 6 closure: everything visual
lands here, and everything about servers, deployment and release moves to the new **Stage 8** below.
The two lists were previously entangled under "pre-launch".

Scope:

- **Real photography and curated portfolio work replace all 10 `__asset_TODO` placeholders** —
  4 Home Featured Work, 3 Location studio interiors, the favicon, the OG image, the Home hero.
  Owner decision 2026-07-27: this is **visual work, not a deploy chore**, so it belongs here rather
  than in the release stage. It also discharges Item 16's accepted risk — AI-generated
  "tattoo-like" artwork must never reach public launch, where it would present non-existent work as
  the artist's. Marker inventory and the canonical grep: PROJECT_PRODUCTION_READINESS.md —
  Pre-Deploy Content Swaps.
- visual identity: colour palette, typography (the site currently ships the system font stack),
  and the layout language across the public website
  - **Geist is downloaded on every visit and never rendered** (found 2026-07-26, Item 18 Block A):
    `next/font/google` loads it and `@theme` maps `--font-sans`, but `body` uses the system stack
    and `font-sans` appears nowhere in the TSX. Either adopt it or remove the download — leaving it
    is the only option that costs bandwidth for nothing. PROJECT_BACKLOG.md — Frontend Improvements.
  - **`app/not-found.tsx` is a third styling system by construction** — it renders its own
    `<html>`/`<body>` outside the `[locale]` tree, and `globals.css` is imported only in
    `app/[locale]/layout.tsx`, so it has no stylesheet at all and hardcodes inline values. This is
    deliberate (Item 11), not drift. If Stage 7 changes the palette, this page will not follow —
    decide whether that matters.
  - PROJECT_BACKLOG.md — Frontend Improvements also holds two long-standing refactor candidates
    that a typography pass naturally absorbs: extracting `SectionTitle`/`SectionText`/`BulletList`,
    and replacing `split("\n")` in i18n with string arrays. Neither is required; both are cheapest
    to do while the same files are open.
- art direction for real photography and curated portfolio work, including whether desktop needs
  different treatment from the mobile-first single-image-per-slot approach Item 16 shipped
  (PROJECT_BACKLOG.md — "Desktop art direction for placeholder images")
- admin interface polish, including mobile polish (spacing, touch targets, scroll behavior) and the
  two-column card grid candidate noted 2026-07-03 — carried here from Stage 6
- **public-site tap-target heights — measured 2026-07-27 by Item 13's mobile QA**, so Stage 7 starts
  from numbers rather than an impression. Every interactive element is ≥44px **wide**, but several
  fall short in **height** at all four widths (320/375/768/1280): **primary nav links 28px** — the
  fixed bottom bar on mobile, i.e. the main navigation on the primary surface; Process FAQ's
  Preparation/Aftercare links **21px**; Location's map links **36px**; the Instagram icon links on
  Location/Preparation/Aftercare **16×16px**; `<select>` controls on `/request` **39px**. None of this
  blocked Stage 6 — no FS §6 criterion mentions tap-target size — and headless Chromium measures CSS
  boxes, not fingers, so the physical-device check remains the instrument that settles it.
- accessibility beyond the contrast/readability fixes Stage 6 Item 18 makes
- **physical mobile-device verification** — the checks no tool in this repository can perform, since
  headless Chromium measures CSS boxes, not fingers: the Stage 4B.5.1 admin image-viewer gestures
  (pinch zoom, pan, double tap, swipe, backdrop tap, rotation — also gating
  `controller.closeOnPullDown`), the favicon in a real browser tab (light and dark chrome, Item 16
  CO-2), and the tap-target findings above on an actual phone.
- **Show/Hide password toggle** on the admin login/reset forms (PROJECT_BACKLOG.md) — admin UI
  polish, folded in with the admin surfaces above rather than kept as a floating item.
- **The artist's own copy pass over the live site** (Stage 6 Item 6, CO-3 — open by design since
  2026-07-24). The shipped copy is research-derived and owner-approved, but never read by the artist
  herself. Routed here by owner decision 2026-07-27 rather than to Stage 8: she is already looking
  at the site during this stage for photography and art direction, and **a copy change alters text
  length, which moves layout** — doing it inside the stage that owns layout costs one pass instead
  of a redo after Stage 7 has closed. Source:
  `tasks/done/STAGE_6_TASK_06_process_content.md` CO-3; tracked meanwhile in
  PROJECT_PRODUCTION_READINESS.md — Owner Pre-Release Actions.

Not in scope: product behavior, content, navigation or the request-flow field model — all of that
is FS-governed and settled in Stage 6. A Stage 7 change that alters behavior needs a PRD/FS
amendment first (PRD §9 Change Control), exactly as in Stage 6. **Servers, deployment, CI/CD,
security review and the release itself are Stage 8**, not here.

Exit Criteria:

- visual and interaction quality is consistently high across all surfaces
- mobile experience is polished, verified on at least one physical iOS and one physical Android device
- no `__asset_TODO` placeholder remains — `grep -rn "__asset_TODO" app/ src/ public/` returns zero
- no regressions in core flows

Result:

- a product that looks finished, on real content, ready to be prepared for release

---

# Stage 8 — Pre-Release and Launch

Goal: make the application actually deployable, operable and safe to run in public — then release it.

Created 2026-07-27 by owner decision, at Stage 6 closure. Everything about servers, deployment,
CI/CD and security had accumulated across PROJECT_PRODUCTION_READINESS.md, PROJECT_BACKLOG.md and
five different tasks' completion obligations, tracked as "pre-launch" but owned by no stage. Stage 8
is that owner. **Its final step is the release.**

Stage 8 begins after Stage 7 closes. Individual items may be pulled forward when convenient (the
Vercel Pro decision in particular gates several others), but the stage is not "in progress" until
Stage 7 is done.

**This stage needs its own planning pass before execution** — the list below is scope, not a
sequenced plan, exactly as Stage 7's list was on the day it was created. A STRAT session cuts it
into ordered items with task files.

## Scope

### A. Platform and environment decisions

- **Vercel Pro decision** — the Hobby plan's commercial-use restriction makes this a terms question,
  not a technical one; it also gates alerts and WAF below. Owner decision 2026-07-23: settle it
  together with the Item 10 operational debt, since doing those first means building throwaway
  workarounds. PROJECT_PRODUCTION_READINESS.md — Production Environment Setup.
- **Environment separation** — separate Supabase staging and production projects, separate Vercel
  environment values, per-environment Auth Site URL / Redirect URLs / OAuth config, and a written
  migration promotion process. Decided in principle 2026-07-08 (the current controlled-test project
  becomes **staging**; a clean **production** project is created); **none of it built yet**.
  One-project/multiple-schema separation is explicitly not an approved option.
- **Custom domain** and the `robots` `noindex` → `index` flip at launch (marker `__meta_TODO`).
- **Item 12 CO-5** — enable Vercel's "System Environment Variables" access, then confirm the
  deployed `/en` renders an `og:image` on a public `https://` origin returning 200. Without it
  `metadataBase` silently falls back to `http://localhost:3000`.

### B. Operational safety (Item 10 CO-4 — the open launch blocker)

The durable per-IP upload quota is shipped and live-verified; what remains is how the owner *learns
it fired* and what stops the bill. **The PROJECT_PRODUCTION_READINESS launch blocker is not closed
until all four are done.**

- Firewall/Log alert on the `/api/upload` signal, with a real recipient, **triggered once** to prove
  delivery. The code already emits the structured `console.warn` it keys on.
- WAF method+path Deny drill on `POST /api/upload` — the real kill-switch, no redeploy needed.
- Vercel + Supabase spend caps and notifications. Option B bounds one source, not the number of them.
- Env cleanup: remove the unused Marketplace-created `KV_*` / `REDIS_URL` vars, and decide whether
  `UPSTASH_REDIS_REST_*` + `UPLOAD_TOKEN_SECRET` belong in **Preview** — see the dev/preview gap in
  section D, which is the same missing credential seen from the developer's side.

### C. Security review and hardening

- Complete the Security Review Checklist in PROJECT_PRODUCTION_READINESS.md (RLS, storage
  permissions, env vars/secrets, upload boundary, API validation boundary — several already
  verified live in Stage 5A, the checklist records which).
- **Custom SMTP** in Supabase Auth + email deliverability (SPF/DKIM). The built-in provider is
  ~2 emails/hour and cannot be raised without it — a real constraint on password reset.
- **Supabase auth hardening** — leaked-password protection and auth rate limits (carried open from
  the Stage 5B task list).
- **Password policy** — define one project-wide and apply it to reset-password and any future
  password forms; today only Supabase's default minimum applies (PROJECT_BACKLOG.md).
- **OAuth locale-query redirect allowlist** — the working Stage 5C workaround needs one allowlist
  entry per locale query value. Redesign before public launch or before any `ru`/`he` expansion,
  whichever comes first (PROJECT_BACKLOG.md).
- `pnpm audit` and resolve/document high and critical findings (PROJECT_PRODUCTION_READINESS.md —
  Dependency Security).
- **Backup posture** — DB dump, Storage backup, PITR retention. Deliberately deferred until real
  data exists; that condition is met at launch, so it is settled here, not claimed as done.

### D. Developer and CI infrastructure

- **CI/CD** — none exists. PROJECT_PRODUCTION_READINESS.md — CI/CD records the decision and trigger.
- **The dev/preview environment cannot exercise image uploads at all.** `.env.local` carries a
  placeholder Upstash URL, so `checkUploadQuota` hits its fail-closed deadline and `/api/upload`
  returns 503 locally, every time. Failing closed is correct and production is unaffected — but a
  developer cannot test the app's most failure-prone surface, and **any preview deploy has the same
  hole** because `UPSTASH_REDIS_REST_*` and `UPLOAD_TOKEN_SECRET` are Production-only. Options and
  the trade-offs are recorded in PROJECT_BACKLOG.md — "FOR STRAT — dev environment cannot exercise
  image uploads"; note that a dev-only in-memory fallback puts an `if (dev)` branch inside a
  security control and needs a hard guarantee it cannot activate in production.
- **Automated end-to-end / integration coverage** — no test today touches a real database or
  storage layer. The uncovered flows are enumerated in PROJECT_BACKLOG.md — "Automated E2E /
  Integration Tests", including the Success-page gate and bfcache behaviour in a real browser.
- **Auth callback route edge-branch tests** — missing `code`, unsupported `locale`, and
  `exchangeCodeForSession` failure are untested; the pattern for mocking `next/headers` now exists
  (PROJECT_BACKLOG.md).
- **Supabase generated database types** — adopt (`supabase gen types typescript`) or explicitly
  reject with rationale; a pre-launch owner decision left open since Stage 5D (PROJECT_BACKLOG.md).

### E. Content and copy verification that only the real world settles

- **The `/api/upload` 503 copy is not actionable.** When the limiter is unavailable the visitor sees
  a hard error that **omits the one thing that matters — the request can be submitted without
  images** (FS §4.5). Confirmed live by the owner on 2026-07-27, who hit the path and had no
  indication he could simply send the request. Rare, but when it fires it hits every visitor at
  once. Fix the copy against FS §4.5 and verify it on a **real** server failure, not a
  browser-simulated one — Item 13's sweep aborted the request in the browser, which exercises a
  different branch of `src/features/request/lib/upload.ts`, and so could not have caught this.
- **Performance validation** before release (PROJECT_PRODUCTION_READINESS.md).

### F. Release

The final step of this stage and of the pre-launch programme: flip `robots` to `index`, point the
domain, and go live — with the Owner Pre-Release Actions checklist in
PROJECT_PRODUCTION_READINESS.md verified clear, not assumed.

## Not in scope

Post-launch features (Telegram notifications, calendar, payments, chat, analytics — see the
Post-Launch Roadmap below) and anything visual (Stage 7). Operational items explicitly accepted as
post-launch — orphaned-storage reconciliation, the file-upload duplicate-selection heuristic, the
`required_error`/`null` FormData parsing nit, client-side image compression, API route constants —
stay in PROJECT_BACKLOG.md and are not Stage 8 work unless promoted deliberately.

Exit Criteria:

- staging and production are separate, and production has never held test data
- the Owner Pre-Release Actions checklist in PROJECT_PRODUCTION_READINESS.md is fully checked
- the Item 10 CO-4 launch blocker is closed — alert delivered once, WAF drill performed, spend caps set
- a request submitted by a real visitor on the production domain persists, is visible in admin, and
  the artist is able to answer it
- the site is publicly indexable and reachable at the branded domain

Result:

- a released product, operable and monitored

---

# Post-Launch Roadmap

These features are out of scope for the initial production release (Stages 0–8).
Each item requires a dedicated planning and decision phase before implementation.

(Updated 2026-07-27: **Stage 7 — Visual Design** and **Stage 8 — Pre-Release and Launch** were both
created above, and both sit **before** public launch — the release is Stage 8's final step, not a
separate event after this roadmap. Item 16's accepted risk is what puts the asset work pre-launch:
AI-generated "tattoo-like" artwork must not survive to launch. The roadmap below is unchanged in
content.)

Immediately after release: a feedback / bugfix stabilization loop with the real artist user comes
first, before any item below is scheduled. Items in this roadmap are candidates for what follows
stabilization, not a queue to start immediately at launch.

## Telegram Notifications

- new request alert sent to artist via Telegram bot
- reminder for unread requests older than a threshold
- notification includes: client name, reference code, placement, size, description excerpt

Note: Telegram was originally planned for Stage 3E and Stage 5. Decision recorded on 2026-06-28: moved post-launch. The production release (Stages 0–6) ships without notifications.

## Calendar Integration

- booking availability management
- request-to-appointment flow
- block-off dates

## Payments

- deposit collection on booking
- payment link or embedded flow

## Browser / PWA Push Notifications

- admin push alerts for new requests (as alternative or complement to Telegram)
- requires notification permission grant

## PWA Evaluation

- assess whether installability (Add to Home Screen) meaningfully improves mobile UX
- implement only if usage data justifies it

## AI Features

- AI-generated short title or summary for each request (from description + reference images)
- shown in admin panel for at-a-glance scanning
- optional — not required field, not shown to the client
- no DB column reserved; no architecture work until this is prioritized

## Repeat Client Improvements

- highlight matching contact fields (email, phone) across existing requests in the admin panel
- count badge or indicator on the request list
- optionally: manual "repeat client" flag set by the artist
- no DB changes required — existing columns are sufficient

## Analytics Expansion

- add PostHog (behavior tracking, form drop-off analysis)
- add Sentry (error tracking)
- condition: only after real traffic exists

## File Upload UX

- ~~accumulate files across multiple selections~~ — done (see PROJECT_STAGE_LOG.md, 2026-07-04
  file-upload regression fix, committed `202c1f3`)
- ~~per-file delete (before submit)~~ — done (see PROJECT_STAGE_LOG.md, 2026-07-04 FileUploadInput
  selection UX polish, committed `202c1f3`): a remove button next to each selected filename lets
  the user drop a file from the pending selection before submitting. **Per-file replace, and any
  delete/replace of an already-submitted file after submission, remain out of scope** — files are
  immutable after submission per the existing Storage Decisions, and no in-place "swap this file
  for another" interaction exists pre-submit either; removing and re-picking is the only supported
  path today.
- ~~image previews (thumbnails)~~ / ~~progress indicator~~ — **absorbed into Stage 6
  (2026-07-12):** STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.3 requires per-file thumbnails with a
  remove control, upload-on-selection with per-file progress, and per-file failure states for the
  public request form — no longer post-launch for the public surface
- drag-and-drop
- prevent duplicate file selection before submit (nice-to-have; not blocking Stage 4B) — likely
  via a file-identity heuristic (`name + size + lastModified + type`, since `File` objects from
  separate picker selections are never `===`-equal even for the same underlying file) to silently
  skip re-adding a file already in the current selection. Not implemented; small, optional,
  post-release or pre-release-polish candidate.

## Other Planned Improvements

- budget range and willingness-to-wait fields on the request form — **note (2026-07-12):** the
  Stage 6 field model (STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.2) contains no budget field and
  forbids adding fields outside its table without escalation; implementing this item requires a
  PRD/FS change first (PRD §9 Change Control)
- FAQ accordion — **note (2026-07-12):** per STAGE_6_FUNCTIONAL_SPECIFICATION.md §5, the FAQ's
  canonical page is Process (not Policies); presentation ("expandable details where appropriate")
  is governed by the FS
- magic-byte MIME type verification (if abuse observed)
- API route constants consolidation (when multiple endpoints exist)
- typography component extraction (SectionTitle, SectionText, BulletList)
- i18n string arrays to replace `split("\n")` usage

---

## SaaS & Platform Expansion

These items are out of scope for the initial production release (Stages 0–6) and for any single-artist deployment.
Each requires a dedicated planning phase before implementation begins.

### Studio Onboarding

- **Sales-assisted onboarding** — manually onboard the first 5–10 studios; no self-service required at this stage
- **Self-service onboarding** — studio registration flow, guided setup, studio profile creation; only after sales-assisted model is validated

### Subscriptions & Billing

- **Trial period** — free trial for early studios (duration and conversion logic TBD)
- **Paid subscriptions** — recurring billing integration (Stripe or equivalent)
- **Plans and pricing tiers** — feature gating by plan (e.g. request limits, team size, integrations)

### Studio Management

- **Studio settings and profile** — studio name, logo, description, contact info, social links; editable by studio admin
- **Multi-studio routing and public studio pages** — see note below
- **Invite and team management** — invite an assistant or co-artist; manage active team members per studio
- **RBAC / roles** — role column on `studio_members` (e.g. owner, admin, viewer); role-based feature access within a studio

#### Public Studio Routing and Content Model (future, post-launch)

The current MVP uses `DEPLOYMENT_STUDIO_ID` as a single-studio resolver — a temporary mechanism for one production client. It is not a multi-studio architecture.

In a future multi-studio product, each studio would have its own public URL namespace:

```
/masha
/masha/request
/masha/location
/masha/policies
```

Each studio may also have its own public content: copy and texts, pricing and process description, location, gallery, branding and theme, request form configuration.

This model will likely require additional tables (`studio_public_profile`, `studio_content`, or similar) to store per-studio content separately from the core ownership model introduced in Stage 3D.6.

Do not add schema placeholders for this now. The `studios` table introduced in Stage 3D.6 is the correct foundation; the content model is a separate, later design problem.

### Notification Channels & Preferences

- **WhatsApp notifications** — alternative or supplement to Telegram for new request alerts
- **Email notifications** — transactional email for new requests and status changes
- **Notification preferences** — per-studio settings for which channels are active and which events trigger them

### Platform / Internal Admin

- **Platform admin panel** — internal interface for managing studios, subscriptions, support; separate from studio-facing admin

### Research Items

- **Instagram integration** — research feasibility and real demand; potential: sync portfolio posts, add request CTA to profile, track referral source
- **Competitor onboarding research** — review how comparable tools (booking apps, tattoo platforms) onboard studios; inform self-service flow design before building it

---

# Execution Rules

- implement stages sequentially
- do not skip stages
- do not start next stage before completing current
- each stage must satisfy its Exit Criteria
- avoid premature optimization
- keep scope within current stage

---

# Done Criteria

The Production Release (Stages 0–6) is complete when:

- all stages are completed
- request flow works end-to-end
- admin panel is functional
- UI/UX quality meets the production standard defined in Stage 6
- application is deployed and usable in real conditions
