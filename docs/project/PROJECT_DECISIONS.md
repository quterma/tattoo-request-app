Purpose  
Record important product and technical decisions that should not be re-evaluated during normal implementation.

Scope  
Stable decisions affecting product scope, architecture, and implementation boundaries.  
Does not contain temporary tasks or progress logs.

Audience  
AI agents and developers working on the project.

---

# Admin Authentication Requirement

Admin authentication is required before the first public release.

The admin interface must not be publicly accessible in production.

Hidden URLs, unlinked routes, or security through obscurity are not considered sufficient protection.

Authentication may be implemented after the request submission flow is completed, but must be completed before public launch.

---

# Quality Gates Policy

After every implementation task and before presenting results, the following must be run automatically:

- lint
- typecheck
- tests
- build

Do not wait for human confirmation before running quality gates.

Human review is required before commits, not before validation.

---

# MVP Quality Standard

This is a production MVP — not a prototype.

MVP means limited scope, not reduced quality.
Every feature included in the first public release must be production-ready for real client usage.

---

# Product Decisions

- The product is a production MVP for a single real tattoo artist.
- The product is not a SaaS platform.
- The main goal is to replace unstructured chat-based intake with a structured request flow.
- Mobile-first usage is the primary target.
- English is the active MVP language.
- RU and HE are reserved for later validation and expansion.

---

# Scope Decisions

- Booking and calendar integration are out of scope for MVP.
- Payments and deposits are out of scope for MVP.
- Instagram and WhatsApp API integration are out of scope for MVP.
- CMS and advanced content editing are out of scope for MVP.
- Multi-artist support is out of scope for MVP.
- Advanced analytics are out of scope for MVP.

---

# UX Decisions

- The request form is the core feature of the product.
- Static public pages are intentionally simple and support the request flow.
- Image uploads are part of the initial request process.
- Files are immutable after submission.
- Public users are anonymous.
- Admin access is private and limited.

---

# Architecture Decisions

- The system uses a single web application with a managed backend.
- No standalone custom backend service is planned for MVP.
- Backend-for-frontend (BFF) may be used via Next.js Route Handlers where needed.
- Supabase (PostgreSQL) is the chosen database, treated as an external managed system.
- Supabase Storage is the chosen file storage. Storage bucket must be private.
- Telegram is the planned notification channel (post-launch, not part of the initial production release).
- Global state management is not used in MVP.
- Feature-oriented frontend structure is used.

---

# Service Layer Decisions

- External systems (database, storage, Telegram) must be accessed through the service layer only.
- Do not introduce provider abstractions, DI containers, factory patterns, or interface hierarchies unless a second real provider is added.
- Keep service layer simple and YAGNI-compliant.

---

# File Access Decisions

- File access mechanism for admin: signed URLs generated server-side in the BFF.
- Image Proxy through BFF was considered and rejected. Technical review completed in Stage 3C.2 planning.
- Reasons: signed URLs are simpler, have no streaming overhead, and Supabase enforces private bucket access without a proxy layer.
- Signed URLs are generated on demand when the admin loads a request. Expiry: ~1 hour.
- Admin access only. Public users never receive signed URLs or storage paths.

---

# File Data Model Decisions

Request files are modeled as a typed collection. Each file record contains:

- type: "reference" | "placement"
- storagePath
- originalName
- mimeType
- size

The current request form has two upload inputs: reference images and placement images.
These map directly to the two type values above.

This is the data-shape direction for persistence. Implementation is part of Stage 3C.3.

---

# Storage Decisions

## Bucket

- Single private Supabase Storage bucket: `request-images`
- Bucket must remain private at all times

## Folder Structure

```
request-images/{clientSubmissionId}/reference/
request-images/{clientSubmissionId}/placement/
```

## Storage Filenames

- Storage filenames do not use original filenames
- Deterministic naming by type and index:
  - `reference-01.jpg`, `reference-02.jpg`, ...
  - `placement-01.jpg`, `placement-02.jpg`, ...
- `originalName` is retained as metadata in the DB record only
- Extension is derived from the file's MIME type at upload time

## Images

- Store original files without modification
- No compression, no resizing
- Admin can view and download full-quality originals

---

# Upload Reliability Decisions

- Per-file retry on transient/network failures
- 2–3 automatic retries with exponential backoff
- No retry for validation failures
- Only failed files are retried — not the entire batch

---

# Failure Handling Decisions

- All-or-nothing submission: either all files and the DB record are created, or nothing persists
- If upload process ultimately fails after retries: delete already-uploaded files, return error to client
- If DB insert fails after successful uploads: delete uploaded files, return error to client
- All cleanup attempts must be logged
- All cleanup failures must be logged explicitly

---

# clientSubmissionId — Storage Foundation

- `clientSubmissionId` is introduced in Stage 3C.2 as the storage folder identifier
- Generated client-side (UUID v4) before form submission
- Sent with the request payload; used to name the storage folder
- Full idempotency logic (deduplication, unique constraint, server-side check) remains in Stage 3D
- Storage folder structure must remain compatible with future resumable-upload support

---

# Upload UX Decisions

- File input must support mobile users selecting images from phone gallery, files, or camera where the browser and OS support it.
- Native file input behavior is used for MVP. No drag-and-drop, thumbnails, or advanced upload UI required.

---

# Development Decisions

- The project must remain simple and avoid over-engineering.
- AI agents must follow framework and project documentation.
- Large refactors require approval.
- New dependencies require approval.
- Testing remains minimal and focused on regression-prone logic.
- Manual verification is acceptable for layout and static content.

---

# Reference Code Decision

Every submitted request is assigned a human-readable reference code.

- Format: `REQ-YYYY-NNNN` (e.g., `REQ-2026-0001`)
- Generated server-side on request creation
- Stored in the database alongside the DB primary key (UUID)
- Shown to the client on the success screen after submission
- Shown in the admin panel for request management
- Used in communication between the artist and client

## Identifier Roles

| Identifier | Type | Purpose |
|---|---|---|
| DB UUID (`id`) | UUID | Primary key, internal DB reference |
| `clientSubmissionId` | UUID v4 | Technical idempotency identifier, storage folder path |
| `referenceCode` | `REQ-YYYY-NNNN` | Human-facing identifier, shown to client and admin |

`referenceCode` is the identifier used in all human-facing contexts. DB UUID and `clientSubmissionId` are internal and never shown to users.

---

# Client Name Decision

A required `clientName` field is introduced to the request form.

- Purpose: enables the artist to address clients by name in communication and admin workflow
- Required field — no anonymous submissions
- Single field (not first/last name split)
- Validation: required, trim, min 2, max 30 characters
- Stored with the request record in the database (`client_name TEXT` column)
- Shown in the admin panel alongside request details
- Implemented in Stage 3C.3.5 (dedicated stage before admin panel work)

---

# Request Identity & Idempotency Decisions

**Production Requirement — not Nice-to-Have.**

## Problem

Without authentication, users may accidentally submit the same request multiple times due to:

- page refresh
- network issues
- repeated submit attempts
- browser or app interruptions

Duplicate requests reaching the artist are unacceptable for production.

## Decision

Introduce a client-generated submission identifier: `clientSubmissionId` (UUID).

- generated on the client before submission
- sent with every request attempt
- stored with the request record in the database

## Server Behavior

When a request arrives:

- if `clientSubmissionId` is new → create the request
- if `clientSubmissionId` already exists → do not create a duplicate; return existing request information

Goal: idempotent request creation.

## User Experience

After successful submission:

- user receives the `referenceCode` (e.g., `REQ-2026-0001`) on the success screen
- future support and communication use `referenceCode` as the shared identifier
- when Telegram notifications are implemented (post-launch), the artist will receive the same `referenceCode` in the notification

## Implementation

Implemented in Stage 3D.0 (completed). Applied before public production launch as required.

---

# Database Stage Completion Criteria

Unit tests, typecheck, and build are insufficient to verify database-related stages.

Stages involving migrations, RLS, RPC functions, permissions, or storage policies are only considered complete when:

- migration applied to the real Supabase project
- at least one successful end-to-end operation performed against real infrastructure
- affected database objects verified (tables, functions, permissions, storage, policies)

Reason: runtime permission issues (e.g. sequence grants, table grants) are invisible to unit tests and are only discovered during real Supabase execution. This was observed during Stage 3C.3 debugging.

---

# Migration Workflow Decisions

## CLI

Supabase CLI is installed as a project devDependency (`supabase` npm package).

- Canonical invocation: `pnpm exec supabase <command>`
- Never use a globally installed binary — version must be pinned and reproducible via `pnpm install`
- CLI version is managed in `package.json` devDependencies

## Applying migrations

All future schema changes must be applied via CLI, not the Supabase SQL Editor:

1. Create migration file: `pnpm exec supabase migration new <name>`
2. Write SQL in the generated file under `supabase/migrations/`
3. Apply to remote: `pnpm exec supabase db push`
4. Verify: `pnpm exec supabase migration list` — Local and Remote columns must match

## Verifying migration state

After any migration operation, confirm with:

```
pnpm exec supabase migration list
```

Local and Remote columns must show identical timestamps for all rows.

## Historical context

Migrations for Stages 3C.3, 3D.0, and 3D.5.2 were applied manually via SQL Editor before the CLI was introduced. Migration history was repaired in Stage 3D.5.3 using `supabase migration repair --status applied <timestamp>`. Repair is metadata-only — it records that a migration is already applied without re-executing its SQL.

---

# Domain Foundation Decisions (Stage 3D.6)

## Studio Ownership Model

Every request belongs to a studio. This is the minimal ownership layer added before Admin Authentication.

### Tables

**`studios`**
- `id UUID PRIMARY KEY`
- `name TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**`studio_members`**
- `user_id UUID NOT NULL REFERENCES auth.users(id)`
- `studio_id UUID NOT NULL REFERENCES studios(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `PRIMARY KEY (user_id, studio_id)`

**`requests.studio_id`**
- `UUID NOT NULL REFERENCES studios(id)` — added in Stage 3D.6
- Backfilled for all existing rows to Masha's studio UUID

### `studio_members` replaces `admin_profiles`

The earlier direction of using a standalone `admin_profiles` table as the access gate for admin auth is superseded. `studio_members` provides the same gate (a row confirms access) while also carrying studio ownership semantics. Stage 4A will check for an active `studio_members` row when authorizing admin access.

### Idempotency lookup remains global

`getRequestByClientSubmissionId()` queries `requests` without a studio filter. This is intentional and must not be changed.

Reason: `client_submission_id` has a global UNIQUE constraint. The idempotency and race-recovery logic only needs to find the row by submission ID — which studio it belongs to is irrelevant for deduplication. Adding a studio filter would require the route to know the studio before the lookup, which is circular and unnecessary.

### `DEPLOYMENT_STUDIO_ID` env var

The public request submission route has no authenticated context. For a single-studio deployment, the studio to assign to incoming requests is resolved from a `DEPLOYMENT_STUDIO_ID` environment variable.

- Server-only (not `NEXT_PUBLIC_`)
- Added to `config.app.deploymentStudioId` in `src/config/index.ts`
- Documented in `.env.example`
- When multi-studio routing is built, this env var becomes an optional fallback

### Storage Path Change

Stage 3D.6 includes changing the storage path structure from:

```
{clientSubmissionId}/{type}/{file}
```

to:

```
{studioId}/{clientSubmissionId}/{type}/{file}
```

Reason: aligns storage ownership with the studio ownership model. Makes future Storage RLS policies straightforward — policies can filter on the leading `studioId` path segment.

Existing stored file paths remain valid because the DB `storage_path` column stores the full path. Only new uploads use the new structure.

### RLS in Stage 3D.6

RLS is **not** enabled on `studios`, `studio_members`, or updated on `requests` in Stage 3D.6.

All access goes through the BFF using the `service_role` key, which bypasses RLS. RLS policies for all application tables and storage are explicit Stage 5 (Production Hardening) tasks.

### Authentication and Authorization Model

- **Authentication** proves who the user is — Supabase Auth session.
- **Authorization** decides which studio data they may access — based on `studio_members` membership.
- Access check: a valid Supabase Auth session + a matching row in `studio_members` for the target studio.
- For public request creation (unauthenticated context): studio is resolved from `DEPLOYMENT_STUDIO_ID`.
- Stage 4A must use `studio_members` as the admin access gate — a user with no row in `studio_members` must not access admin routes even if authenticated.

### Deferred

- RLS policies on `studios`, `studio_members`, `requests`, and Storage — deferred to Stage 5
- Role column on `studio_members` — deferred until RBAC is needed
- `is_active` flag on `studio_members` — revoke access by row deletion for now
- Workspace routing / multi-studio URL resolution — post-launch
- Invite flow — post-launch
- Billing, trial, subscription columns — SaaS phase
- Staging Supabase project and Vercel preview/staging environment — Stage 5 decision point (not required before 3D.6 or 4A)

### Why before 4A

Migration cost is lowest before any production data exists. Adding `studio_id NOT NULL` to `requests` with zero real rows requires only a trivial backfill. After Masha's launch, the same migration touches live data.

---

# Admin Authentication Architecture (Stage 4A)

## Authentication vs Authorization

- **Authentication** — a valid Supabase Auth session proves who the user is.
- **Authorization** — a `studio_members` row proves which studio the user may access.
- A valid Supabase session alone is not sufficient for admin access.
- Both checks are required. A user authenticated but absent from `studio_members` must be rejected.

## Supabase Clients

Two separate Supabase clients are used:

**Service role client** (`src/services/supabase.ts` — existing)
- Uses `SUPABASE_SECRET_KEY` (service_role key)
- Server-only; must never be exposed to the client
- Used for all DB and Storage operations (bypasses RLS while RLS is deferred)
- Not used for session/auth identity checks

**SSR auth client** (`src/services/supabaseAuth.ts` — new in Stage 4A)
- Uses `@supabase/ssr` package with cookie-based session handling
- Used only to verify the current user's session identity
- Must not be used to query `requests`, `request_files`, or admin business data in Stage 4
- Named `supabaseAuth` to distinguish from the service role client

## `proxy.ts` — Next.js Middleware

- `proxy.ts` is the Next.js middleware entry point in this project (not `middleware.ts`)
- Currently handles next-intl locale routing
- Stage 4A will extend it to add Supabase SSR session refresh (cookie rotation)
- Must preserve existing i18n behavior; must not break locale routing
- Admin redirects in middleware must be locale-aware (e.g. `/en/admin/login`)
- A parallel `middleware.ts` must not be created

## Admin Route Protection

Protected admin layout: `app/[locale]/(admin)/admin/layout.tsx`

Three states:

| State | Behavior |
|---|---|
| No valid Supabase session | Redirect to locale-aware `/[locale]/admin/login` |
| Valid session, no `studio_members` row | Render unauthorized page: "This account is not authorized." |
| Valid session + `studio_members` row | Render admin content |

## Shared Authorization Function

A shared server-side function is added in Stage 4A:

- Location: `src/services/auth.ts`
- Function: `getAuthenticatedStudioMember(cookies: CookieHandler)`
- Returns: `AuthResult` — `{ ok: true, userId, studioId }` | `{ ok: false, reason: "unauthenticated" | "unauthorized" }`
- Expected failures are business outcomes (ok: false); infrastructure errors throw
- Checks: valid Supabase Auth session AND matching `studio_members` row
- Stage 4B route handlers must call this function and scope all data queries to the returned `studioId`

## Future Authorization States (Post-MVP)

Current MVP intentionally supports only two authorization outcomes:

- `unauthenticated` → redirect to login
- `unauthorized` → access denied

As the product evolves into a multi-studio SaaS, the generic `unauthorized` state may be replaced or expanded with more specific business states, for example:

- membership required
- invitation required
- subscription/payment required
- studio disabled
- insufficient role/permissions

The shared authorization API (`AuthResult`, `AuthFailureReason`) is intentionally designed to evolve without requiring breaking changes to callers.

---

## Login and Registration

- Login route: `app/[locale]/(admin)/admin/login/page.tsx`
- Email/password login via Supabase Auth
- Google OAuth login and registration: included in Stage 4A if feasible; may be split to 4A.1 if needed
- Registration creates a Supabase Auth user only
- Newly registered users have no admin access until manually inserted into `studio_members`

## OAuth Callback

- Fixed non-locale route: `app/auth/callback/route.ts`
- Responsibility: exchange auth code for a session and redirect
- Must not contain authorization or business logic

## Logout

- Clears Supabase session (server-side)
- Redirects to locale-aware login page

## Password Reset

Routes:

- `app/[locale]/(admin)/admin/forgot-password/page.tsx` + `actions.ts` — request-link form, outside `(protected)`
- `app/auth/reset-callback/route.ts` — fixed non-locale callback, dedicated to password recovery
- `app/[locale]/(admin)/admin/reset-password/page.tsx` + `actions.ts` — new-password form, outside `(protected)`

Both `forgot-password` and `reset-password` live outside `(protected)` because they must be reachable without a `studio_members` row and without treating the visitor as already authorized.

### Dedicated callback (not `/auth/callback`)

`/auth/reset-callback` is separate from the existing OAuth callback:

- `/auth/callback` is Google OAuth only
- Recovery redirects to `/[locale]/admin/reset-password`, not `/[locale]/admin`
- Recovery has a different risk profile (see recovery-session caveat below)
- Keeping callbacks single-purpose avoids hidden branching (`type=recovery` vs OAuth) inside a route documented elsewhere as "no business logic"

`proxy.ts` matcher already excludes `/auth` — no middleware change required for the new route.

**Accepted duplication:** `app/auth/callback/route.ts` and `app/auth/reset-callback/route.ts` are structurally near-identical (locale resolution, code-presence check, `exchangeCodeForSession`, error branch) — only the redirect targets differ. This duplication is intentional, not an oversight: the two routes are single-purpose, have different destinations, and have different risk profiles (OAuth login vs. password recovery). Merging them would reintroduce the hidden-branching problem the split was designed to avoid. Do not merge.

### Flow

1. User clicks "Forgot password?" on the login page, submits email on `forgot-password`
2. Action calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, `redirectTo` = `/auth/reset-callback?locale=<locale>`
3. Supabase sends the reset email (default template / `{{ .ConfirmationURL }}`)
4. User opens the link; `/auth/reset-callback` exchanges the code via `exchangeCodeForSession(code)`
5. On success → redirect to `/${locale}/admin/reset-password`; on missing/invalid code or exchange failure → redirect to `/${locale}/admin/forgot-password?error=reset`
6. User submits new password; action calls `supabase.auth.updateUser({ password })`
7. On success, action immediately calls `supabase.auth.signOut()`, then redirects to `/${locale}/admin/login?reset=success`

### Recovery session caveat (accepted MVP risk)

Supabase's recovery flow does **not** create a special restricted "recovery-only" session. After `exchangeCodeForSession(code)`, the resulting session cookie is a normal authenticated session — indistinguishable at the SSR cookie level from a regular login session. `getAuthenticatedStudioMember()` has no way to tell "this session came from a recovery link and hasn't completed its purpose yet" from "this is a normal logged-in admin."

Accepted approach:

- route straight from the reset callback to `reset-password`, never to `/admin`
- `reset-password` lives outside `(protected)`, so it never goes through the authorization gate
- immediately force `signOut()` after a successful password update, before redirecting to login
- user must log in again with the new password

This is routing discipline and exposure-window reduction, not a hard session-type barrier. The exposure window is: from the moment the recovery link is opened until the new password is submitted (or the user abandons the flow). Building a real barrier would require a client-side Supabase auth client listening for the `PASSWORD_RECOVERY` auth-state-change event — no client-side Supabase client exists in this codebase today (server actions + SSR only), and introducing one is a real architectural addition, not a trivial reuse. Rejected for MVP as over-engineering relative to a single low-volume admin.

### Expired / invalid reset link UX

- `/auth/reset-callback` with no `code` or a failed exchange → redirect to `/${locale}/admin/forgot-password?error=reset`
- `/[locale]/admin/reset-password` loading with no active session → do not silently show/redirect to login as the primary UX; show "Reset link has expired or is no longer valid." with a link back to `forgot-password`

### User enumeration

`forgot-password` always returns the same generic message regardless of whether the email matches an account: "If an account with this email exists, a reset link has been sent." The action must never reveal whether the email exists.

### Locale preservation

Same mechanism as Google OAuth (Stage 4A.6): append `?locale=<locale>` to `redirectTo`; `/auth/reset-callback` validates the `locale` query param and falls back to `defaultLocale` if missing/unsupported.

### Link scanners / prefetching (known limitation)

Some mail clients and corporate security scanners pre-open links in email bodies, which can consume a single-use recovery code before the real user clicks it. If this happens, the user lands on the expired/invalid state and must request a new reset link. No mitigation planned for MVP — documented as a known limitation.

### Manual Supabase setup required

- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs: add `http://localhost:3000/auth/reset-callback` (dev), plus the production origin equivalent later
- Verify the "Reset Password" email template uses the default Supabase recovery link / `{{ .ConfirmationURL }}`
- No new secrets, no Google Cloud changes, no env var changes

### Recovery sessions must not grant admin access before reset is completed

This remains the governing rule from the original Stage 4A architecture note — enforced here via routing discipline (reset-password outside `(protected)`) plus forced sign-out, not via a distinct session type.

## Manual Admin Activation

- First admin user signs up or logs in to create a Supabase Auth account
- Developer manually inserts `auth.users.id` into `studio_members` with the correct `studio_id`
- No invite flow, no RBAC, no role column, no `is_active` flag, no SaaS onboarding
- Remove access by deleting the `studio_members` row

## Application-Layer Authorization (Stage 4 boundary)

Until Stage 5 RLS, admin authorization is enforced at the application layer only.

- This is an accepted temporary risk, not an oversight
- Stage 4B route handlers must explicitly call `getAuthenticatedStudioMember()` before any data access
- Stage 5 will add RLS and Storage policies as defense-in-depth

---

# Stage 4B Admin Dashboard Architecture

Decided 2026-07-02, following the 4B.0 read-only architecture/data-access audit and external
review. Reduces Stage 4B scope and records the approved architecture before implementation.

## Reduced Scope

Stage 4B delivers only: admin request list, request detail, private request images via
server-generated signed URLs, request status update, and empty/loading/error states.

Deferred to Stage 4C (see PROJECT_IMPLEMENTATION_PLAN.md): dashboard metrics, admin notes,
unread/read tracking. Also out of scope, unchanged from earlier decisions: RBAC, invite flow,
RLS/Storage policies (Stage 5), SaaS onboarding.

Reason: the 4B.0 audit found PROJECT_IMPLEMENTATION_PLAN.md and PROJECT_CONTEXT.md still
described the larger original Stage 4B task list (list + detail + status + notes + unread +
metrics) after this narrower scope had already been informally agreed. This decision makes the
reduction explicit and authoritative.

## Route Param: DB UUID, Not `referenceCode`

- Detail route is `/[locale]/admin/requests/[id]` where `id` is the DB UUID.
- `referenceCode` (`REQ-YYYY-NNNN`) is sequential and enumerable — using it as a route param
  would let anyone guess adjacent requests' URLs. The DB UUID is not guessable.
- UI displays `referenceCode` to the admin; the UUID stays a technical/internal identifier used
  only for routing and DB lookups — consistent with the existing Identifier Roles table (see
  Reference Code Decision above), which already designates the UUID as internal-only.

## Authorization Pattern

- Every Stage 4B page and Server Action calls `getAuthenticatedStudioMember()` before any data
  access — no exceptions, even where a parent layout already performed the check. Each
  entry point re-verifies independently rather than trusting a value passed down from a
  parent render.
- Every DB read and update includes `studio_id = studioId` scoping, using the `studioId` from
  that call's own `getAuthenticatedStudioMember()` result — never a client-supplied value.
- Status update matching 0 rows (wrong studio, or request does not exist) is treated as
  `not found`, not silently treated as success. The application must check the affected row
  count and branch on it, not assume a Supabase update without an error means a row changed.
- Cross-studio detail access and a genuinely missing request both produce the same uniform
  not-found response. The app must not leak whether a request exists in a different studio —
  no distinguishing error message, status code, or timing difference between the two cases.

## Server Components for Reads, Server Action for Writes

- List and detail pages fetch data directly in Server Components via service-layer calls —
  no Route Handler needed for reads, consistent with `PROJECT_ARCHITECTURE.md`'s BFF guidance
  ("used only when required").
- Status update is a Server Action, matching the existing pattern from Stage 4A
  (`loginAction`, `logoutAction`, `resetPasswordAction`).

## Service Layer: Extend Existing Modules, No `services/admin.ts`

- `src/services/db.ts` gains the list/detail/status-update query functions.
- `src/services/storage.ts` gains the signed-URL generation function.
- No new `services/admin.ts` module. The operations are plain scoped reads/writes on
  `requests`/`request_files`, the same category of work already living in `db.ts`; splitting
  services by feature instead of by external system would be a new organizing principle not
  used anywhere else in this codebase, and contradicts the Service Layer Decisions above
  ("keep service layer simple and YAGNI-compliant").
- DTO/types live in `src/features/admin/types`; admin UI components live in
  `src/features/admin/ui` — matching the existing `features/request` folder shape.

**Clarification (added Stage 4B.2):** `AdminRequestListItem`, `RequestStatus`, and
`REQUEST_STATUS_OPTIONS` are *defined* in `src/services/db.ts`, not in
`src/features/admin/types`/`config`. Reason: `services` must not import from `features` (see
PROJECT_STRUCTURE.md — Dependency Direction), but `db.ts` owns the `requests` query and the
DB-row-to-DTO mapping, including status narrowing/validation — that mapping logic needs the
type at the point it's produced. `src/features/admin/types/index.ts` and
`src/features/admin/config/index.ts` re-export these from `@/services` (the service barrel, not
a deep `@/services/db` import) so the rest of the admin feature still imports them from the
documented feature-local location. This is a narrow, one-directional exception: the type is
owned by the service layer; the feature layer only re-exports for its own consumers'
convenience. It does not create a `services → features` dependency in either direction.

**`services/requests.ts` — the one exception to "no `services/admin.ts`" (added Stage 4B.3):**
`src/services/requests.ts` is a thin server-only orchestration module that composes `db.ts`
(request detail) and `storage.ts` (signed URLs) into the final admin detail DTO. This does not
reverse the "no `services/admin.ts`" decision above — `requests.ts` is not a feature-oriented
service split; `db.ts` still owns all DB access and `storage.ts` still owns all Storage access.
The exception is narrow and justified by a different concern: this one operation spans two
external providers in a single logical result, and it is the layer responsible for ensuring
`storagePath` (an internal DB/Storage implementation detail) never crosses into `app/`/
`features/` code. Composing two providers and hiding one provider's internal identifiers from
the rest of the request is orchestration, not a second "domain service" — if a third operation
ever needs only DB access or only Storage access, it still belongs directly in `db.ts` or
`storage.ts`, not funneled through `requests.ts`.

## Signed URLs

- Signed URLs are generated server-side, only from file records returned by an already
  studio-scoped request query (i.e., only after the detail lookup has confirmed the request
  belongs to the authenticated member's studio) — never generated from an unscoped or
  client-supplied storage path. Enforced structurally: `getRequestForStudio()` (the only source
  of file records with a `storagePath`) is only ever called from `services/requests.ts`, and
  only that module calls `createSignedRequestFileUrl()`.
- Raw `storagePath` must never be included in a DTO returned to UI code. Only the resulting
  signed URL is exposed. `AdminRequestDetail`/`AdminRequestFile` (the public DTOs) have no
  `storagePath` field anywhere in their shape — verified by a dedicated test in
  `requests.test.ts`.
- Expiry: 3600 seconds (~1 hour), matching the existing File Access Decisions above.
- **Per-file signing failure (Stage 4B.3):** each file is signed independently; one file's
  signing failure does not fail the whole detail request. A failed file is represented in the
  result as `{ status: "unavailable", id, originalName, type }` (no `signedUrl`) rather than
  omitted or causing the whole page to error. The failure is logged as
  `console.warn("[requests] file signing failed", { fileId, reason })`, where `reason` is
  classified into one of `"not_found" | "permission_denied" | "unknown"` from the Supabase error
  message — the raw error message and the raw `storagePath` are never logged, to avoid leaking
  internal storage layout details into application logs.
- Continues the existing File Access Decisions above (signed URLs, ~1 hour expiry, admin-only,
  BFF/service-layer generation) — Stage 4B is the first real caller of that decision.

---

# Request Status Semantics

Decided 2026-07-02, following an internal audit and external architecture/product review,
before the Stage 4B.2 implementation was committed. Replaces `contacted` with `active` in
`REQUEST_STATUS_OPTIONS`/`RequestStatus` (`src/services/db.ts`) and in the `requests.status` DB
`CHECK` constraint.

## Approved Status Values

- `new` — received; not yet reviewed or responded to.
- `active` — ongoing relationship; no concrete next appointment scheduled.
- `booked` — a concrete next appointment exists, whether a consultation or a tattoo session.
- `completed` — the work/request is considered finished.
- `rejected` — closed without proceeding.

`in_progress` was proposed and explicitly rejected — see below.

## Why `active` Replaces `contacted`, and Why Not `in_progress`

`requests.status` is a coarse operational summary / next-action field — it answers "what does
the artist need to do next about this request," not "what stage of tattoo work is this at."

`in_progress` and `booked` are orthogonal dimensions and can both be true at once (a request can
be "in progress" on design work while also having a booked appointment, or have no appointment
booked yet while still being actively worked). A single exclusive status field must not try to
encode two independent dimensions at once — adding `in_progress` alongside `booked` would force
an artificial priority ordering between two things that are not mutually exclusive in reality.
`active` avoids this: it means only "ongoing relationship, no concrete next appointment yet,"
which is a single, unambiguous condition.

## What `requests.status` Must Not Encode

This field is intentionally coarse. It must not attempt to represent:

- appointment/session lifecycle (scheduling, rescheduling, cancellation)
- multi-session tattoo work progress (session 1 of N, healing between sessions, etc.)
- sketch/design work state
- task deadlines
- notes or activity history

These are separate domain concerns — see Future Domain Direction below.

## Stage 4B Validation Behavior

- The server validates only that a requested status value is one of the five allowed values.
- No transition graph or transition validation is implemented in Stage 4B — any allowed value
  may be set from any other allowed value.
- No terminal-state enforcement in Stage 4B — e.g., updating a `rejected` or `completed` request
  back to `new` is not blocked at this stage.
- Same-status updates are valid (setting a request's status to the value it already has is not
  an error).
- This is a deliberate scope boundary, not an oversight: Stage 4B is a coarse operational tool,
  and transition rules are workflow modeling that requires more real usage context than exists
  today (see Post-Launch Discovery Checkpoint below).

## Future Domain Direction (Explicitly Non-Binding, Not Implemented)

The following are named to record product direction and prevent scope from silently drifting
into Stage 4B/4C. None of this is architecture, schema, or implementation — no DB tables,
columns, or field shapes are committed here. Each requires its own dedicated planning phase
before any implementation begins.

**Appointment / Calendar Model** — appointments for consultation and tattoo sessions; create,
move, cancel; multi-session support; a future admin calendar view; later evaluate external
calendar sync and whether to surface full/external/internal calendar availability. This belongs
on the post-launch roadmap as its own named item — see PROJECT_IMPLEMENTATION_PLAN.md — Post-
Launch Roadmap. It must not be silently folded into Stage 4C.

**Task / Design Workflow Model** — sketch/design/preparation tasks and their deadlines, tracked
separately from `requests.status`.

**Notes / Activity History** — Stage 4C begins with plain internal notes (already scoped there).
Structured activity history and any status-transition rules are deferred until there is enough
real workflow context to design them well — not part of Stage 4C's current scope.

## Post-Launch Discovery Checkpoint

Add a review checkpoint roughly 4–8 weeks after real production usage begins, to revisit:

- whether `active` needs to be split into more specific states
- terminal-state and reopen policy (should `rejected`/`completed` be revisable, and under what
  rule)
- appointment/calendar priority and integration needs
- task visibility and deadline handling
- the actual shape of multi-session workflows observed in real use

This checkpoint is a scheduling note, not a commitment to build any of the above — the point is
to decide with real data instead of speculating now.

---

# Rule for Future Changes

All architectural, product, or behavioral decisions MUST be recorded in this document.

Any decision in this document may be changed only when explicitly updated by the developer.

---

If implementation contradicts this document, implementation must be stopped and clarified.
