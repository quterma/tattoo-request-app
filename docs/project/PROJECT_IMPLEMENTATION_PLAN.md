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
**Stage 5A is complete (2026-07-05)** — see PROJECT_STAGE_LOG.md for the full dated record and
PROJECT_DECISIONS.md, Stage 5A Security / Data-Boundary Decisions, for the decisions it produced.
5B–5D have not started.

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

## Stage 5C — Real Infrastructure and End-to-End Verification

Goal: verify the hardened application against real, deployed infrastructure.

Tasks:

- E2E / integration test coverage against real Supabase infrastructure (see PROJECT_PRODUCTION_READINESS.md)
- performance validation on deployed environment
- deployment (Vercel + Supabase production)
- manual smoke test of full submission and admin flow against the deployed environment

Result: a verified, deployed application — the completed production architecture that Stage 5D
will audit.

## Stage 5D — Full Application Maturity Audit + Targeted Fix Pass

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

# Stage 6 — Product Experience Polish

Goal: elevate UI/UX quality after the initial release.

Stage 6 begins only after Stage 5D's audit/fix pass is closed (see Stage 5D above) — visual
polish should build on a reviewed, documented baseline, not on unreviewed accumulated debt.

This stage does not ship new features — it improves what exists.

Tasks:

- complete UI/UX pass across all public pages and the admin interface
- landing page improvements (copy, layout, positioning, trust signals)
- request flow optimization (reduce friction, improve guidance)
- onboarding and conversion improvements
- mobile polish (spacing, touch targets, scroll behavior)
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
- design system refinement (typography, color, spacing consistency)
- animations and micro-interactions
- accessibility and readability improvements
- trust-building content (portfolio, process, social proof)
- basics: favicon, Open Graph / social preview image, meta description/SEO tags

Exit Criteria:

- visual and interaction quality is consistently high across all surfaces
- mobile experience is polished
- no regressions in core flows

Result:

- refined product experience ready for growth

---

# Post-Launch Roadmap

These features are out of scope for the initial production release (Stages 0–6).
Each item requires a dedicated planning and decision phase before implementation.

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
- image previews (thumbnails)
- drag-and-drop, progress indicator
- prevent duplicate file selection before submit (nice-to-have; not blocking Stage 4B) — likely
  via a file-identity heuristic (`name + size + lastModified + type`, since `File` objects from
  separate picker selections are never `===`-equal even for the same underlying file) to silently
  skip re-adding a file already in the current selection. Not implemented; small, optional,
  post-release or pre-release-polish candidate.

## Other Planned Improvements

- budget range and willingness-to-wait fields on the request form
- FAQ accordion on the policies page
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
