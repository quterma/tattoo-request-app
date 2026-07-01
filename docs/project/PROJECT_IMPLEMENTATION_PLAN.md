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

## Stage 4B — Admin Dashboard

Goal: implement request management interface.

**Before implementation: conduct a UI architecture audit** to confirm component structure,
data-fetching patterns, and how the existing design system and UI primitives will be applied
consistently across the admin surface.

Tasks:

- request list with unread/new indicators
- request details page (data + images via signed URLs)
- status management (new / contacted / booked / completed / rejected)
- admin notes
- basic dashboard metrics:
  - total request count
  - count by status
  - requests this week / month
  - last request received timestamp

Exit Criteria:

- admin can view all requests
- admin can open request details with images
- admin can update status and notes
- unread indicator reflects read/unread state
- dashboard metrics display correctly
- UI uses existing design system and primitives

Result:

- admin can manage requests

---

# Stage 5 — Production Hardening

Goal: verify readiness and deploy to production.

Tasks:

- full app-wide audit and fix pass (architecture, security, frontend/BFF, documentation, UX flows, accumulated tech debt) — see PROJECT_PRODUCTION_READINESS.md, Architecture & Documentation Audit Checkpoints
- E2E / integration test coverage (see PROJECT_PRODUCTION_READINESS.md)
- security review checklist (see PROJECT_PRODUCTION_READINESS.md)
- RLS policies for `studios`, `studio_members`, `requests`, `request_files`, and Storage
- environment separation: decide on and set up staging Supabase project and Vercel preview/staging environment before public launch
- production environment setup: domain, production env vars, Google OAuth production redirect URI, backups, monitoring/logging (see PROJECT_PRODUCTION_READINESS.md, Production Environment Setup)
- performance validation on deployed environment
- logging and error handling review
- dependency security audit (`pnpm audit`)
- CI/CD: GitHub → Vercel preview/production deploy flow, `pnpm qg` gate before merge (see PROJECT_PRODUCTION_READINESS.md, CI/CD)
- deployment (Vercel + Supabase production)
- final release checklist — sign off on all quality gates

Exit Criteria:

- all items in PROJECT_PRODUCTION_READINESS.md are resolved or explicitly deferred
- security checklist complete
- application deployed and accessible
- no critical bugs or regressions
- manual smoke test of full submission and admin flow passes

Result:

- production-ready application, publicly launched

---

# Stage 6 — Product Experience Polish

Goal: elevate UI/UX quality after the initial release.

This stage does not ship new features — it improves what exists.

Tasks:

- complete UI/UX pass across all public pages and the admin interface
- landing page improvements (copy, layout, positioning, trust signals)
- request flow optimization (reduce friction, improve guidance)
- onboarding and conversion improvements
- mobile polish (spacing, touch targets, scroll behavior)
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

- per-file delete and replace
- accumulate files across multiple selections
- image previews (thumbnails)
- drag-and-drop, progress indicator

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
