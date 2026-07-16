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

**Stage 6 note (2026-07-12):** STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.6 defines a different
reference-code format for the Stage 6 public request flow (6 characters, uppercase alphanumeric
excluding O/0/I/1, unique per request). The FS governs Stage 6 implementation; the
`REQ-YYYY-NNNN` format above is the accurate record of what Stages 3–5 shipped. The migration
path for existing codes (if any real data exists at that point) is a Stage 6 implementation
decision to be recorded when that work is planned. The identifier-role split itself (UUID and
`clientSubmissionId` internal-only, `referenceCode` human-facing) is unchanged.

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

## Request Detail UI (Stage 4B.5 — planned, not yet implemented)

Decided 2026-07-03, after architecture/UI review, before implementation. Documentation only —
see PROJECT_IMPLEMENTATION_PLAN.md for the task list this expands on.

- Route `/[locale]/admin/requests/[id]`; Server Component; independently calls
  `getAuthenticatedStudioMember()` (same rule as every Stage 4B entry point above — does not
  trust the `(protected)` layout's check); calls `getAdminRequestDetail(studioId, requestId)`.
- An invalid UUID or a `null` result from `getAdminRequestDetail` both resolve to Next.js
  `notFound()` — no separate handling and no distinguishing signal between "malformed id",
  "does not exist", and "belongs to a different studio", consistent with the existing uniform
  not-found decision above.
- Content, top to bottom: reference code + text-visible status; client name plus compact quick
  contact links near the top (`mailto:`/`tel:` rendered only when `email`/`phone` are present;
  `contactOther` stays plain text, not a link — no protocol to build a link from); tattoo brief
  (description, placement, size, color, budget); a full contact block repeating only the contact
  values that are actually present; reference images, then placement images; created date and
  consent as lower-priority metadata; a back link to the request list.
- Layout: mobile-first, single column — no desktop-specific layout added in this step.
- Images: one column, full content width, natural aspect ratio — no crop, no `object-fit:
  cover`; plain `<img>`, not `next/image` (avoids Next's remote-image allowlist/optimization
  config for private signed URLs that expire); no new-tab link; no click/tap behavior yet (that
  is Stage 4B.5.1, below). An `"unavailable"` file (per-file signing failure, see the Signed
  URLs section above) renders a same-width placeholder showing the original filename and a safe,
  generic "unavailable" label — never the raw error or storage path.
- Route-level `loading.tsx`/`error.tsx`, matching the pattern already established for the list
  route in Stage 4B.4; all user-visible strings through the existing `admin` i18n namespace.
- Manual verification must include both portrait and landscape on a real mobile viewport:
  layout must not break, and horizontal (landscape-oriented) images must fit within the column
  width without cropping.
- Explicitly out of scope for 4B.5: status update, notes, unread tracking, filters, calendar,
  any image modification, and any lightbox/viewer/zoom interaction.

## Minimal Image Viewer / Zoom (Stage 4B.5.1 — planned, not yet implemented)

Decided 2026-07-03, alongside the 4B.5 decisions above. A separate, small follow-up step
immediately after 4B.5 and before status update — not part of 4B.5 itself.

**Superseded 2026-07-03 (same day):** the original direction below — native `<dialog>`/custom
lightweight Client Component first, with any dependency evaluated only after real-device testing
proved native/CSS zoom unreliable — is superseded by the approved dependency decision recorded
in the subsection immediately below. The original direction's scope boundaries (no gallery
navigation, no download, no custom zoom buttons, reuse the already-signed URL, no new signing
call, 44px close target, Escape-to-close, portrait/landscape verification) remain in force; only
the "native-first, dependency-only-as-fallback" implementation strategy is replaced.

<details>
<summary>Original direction (superseded, kept for history)</summary>

- Initial preferred approach: a native `<dialog>` or an equivalent lightweight Client Component;
  dark fullscreen overlay; an explicit, accessible close button with a minimum 44px tap target;
  Escape-to-close; tap-outside-to-close only if it can be implemented simply and reliably; reuse
  the already-signed URL fetched for the detail page (no new signing call). No gallery
  navigation (next/previous), no download control, no animation, no custom zoom buttons.
- Pinch-to-zoom is important, but native/CSS pinch-zoom behavior inside a custom fullscreen
  overlay is inconsistent across mobile browsers and must be verified on real iPhone Safari and
  real Android Chrome before being considered acceptable.
- If native/CSS zoom proves unreliable on those real devices, do not ship broken zoom. Evaluate
  a narrowly scoped dependency (e.g. `react-medium-image-zoom`) at that point only, and only
  after discussion/approval — no dependency is pre-approved by this entry.

</details>

### Approved Decision: `yet-another-react-lightbox` (YARL) + Zoom Plugin

Decided 2026-07-03. Supersedes the native-first direction above. **Implemented 2026-07-04** — see
PROJECT_STAGE_LOG.md for the implementation record. `yet-another-react-lightbox@3.32.0` installed;
no React 19.2.3 / Next 16.1.6 incompatibility found (peer range `react`/`react-dom`
`^16.8.0 || ^17 || ^18 || ^19` explicitly covers React 19), so the `react-photo-view` fallback was
not needed.

**Library choice:**

- Use `yet-another-react-lightbox` with its official Zoom plugin for the fullscreen viewer.
- Do not build custom pinch/pan gesture handling — the native-first approach above is abandoned
  precisely to avoid hand-rolled touch-gesture math, which is where cross-browser reliability
  problems tend to originate.
- Do not use `react-medium-image-zoom` — evaluated and rejected as insufficient for reliable
  touch pan after zoom (it targets a simpler hover/click-to-zoom interaction, not sustained
  pinch+pan on mobile).
- **Fallback:** `react-photo-view`, and only if YARL has a real, confirmed React 19 / Next 16
  compatibility issue discovered during implementation. Not pre-approved as a co-dependency —
  an either/or choice, not both installed speculatively.
- No dependency is installed by this entry. Installation happens in the implementation step, not
  in documentation.

**Scope (as implemented):**

- Tapping/clicking an available image opens a fullscreen in-app viewer at that exact image. No
  browser new-tab navigation.
- All available images from the whole request (reference images, then placement images, in that
  order) form one combined viewer slide set, enabling swipe/arrow navigation across the full
  image set rather than per-group. This combined-ordering detail was not explicit in the original
  decision text above and is recorded here as the as-implemented behavior.
- Reuses the signed URL already present in the server-provided DTO — no new signed-URL request
  is triggered by opening the viewer.
- Dark fullscreen background (`rgba(0, 0, 0, 0.95)` container background); image remains
  uncropped, naturally letterboxed (no forced crop or `object-fit: cover` inside the viewer).
- Pinch-to-zoom, pan while zoomed, and double-tap to zoom/reset are provided by the Zoom plugin —
  not custom-built. Swipe left/right navigates between slides (YARL's own default behavior); the
  Zoom plugin's pointer handling distinguishes pan-while-zoomed from slide-swipe internally.
- Visual prev/next arrow buttons are hidden (via `render.buttonPrev`/`render.buttonNext`
  returning `null`) when only one available image exists; swipe/keyboard navigation itself is not
  disabled (`controller.disableSwipeNavigation` is left at its default, i.e. navigation remains
  active) — matching "hide arrows without disabling swipe navigation."
- Orientation changes (portrait ↔ landscape) reflow naturally via the library's own layout; no
  special orientation-handling code was added.
- Required close methods implemented: a close button (YARL's default toolbar close button, which
  meets the 44px tap-target requirement), Escape-to-close (`controller.closeOnEscape`, on by
  default), and backdrop-tap-to-close (`controller.closeOnBackdropClick: true`, explicitly set —
  YARL defaults this to `false`).
- **Swipe-down-to-close (`controller.closeOnPullDown`) was evaluated as a real, documented,
  non-custom YARL option but was deliberately NOT enabled in this implementation pass.** It could
  not be verified against real-device pinch/pan behavior in this session (no physical iPhone
  Safari / Android Chrome available), and the approved instruction was to enable it only if
  confirmed not to conflict with zoom/pan. Left disabled (YARL's default) until a future pass
  confirms it is safe on real devices — see Deferred/Follow-up below. This is a deliberate
  scope-narrowing, not an oversight.
- Unavailable files (per-file signing failure) remain non-interactive — no viewer opens for them,
  matching their existing non-clickable placeholder behavior from Stage 4B.5.
- Out of scope, unchanged from the original direction: next/previous UI controls beyond the
  library's own (hidden arrows; swipe/keyboard still work), thumbnails, captions, metadata
  overlay, download control, status update, custom gesture math, signed-URL refresh/re-signing on
  open, and any visual redesign beyond the viewer itself.

**Accepted signed-URL-expiry limitation:** signed URLs expire ~1 hour after generation (see File
Access Decisions above). The viewer intentionally does not request a fresh signed URL on open —
it reuses whatever URL is already present in the detail page's DTO. If an admin leaves the detail
page open past expiry and then opens the viewer, the reused URL may fail to load. This is an
accepted limitation carried over from the existing signed-URL strategy, not something 4B.5.1
introduces or is responsible for fixing; no re-signing/refresh mechanism is in scope here.

**Required manual verification (not yet performed — no physical device available in the
implementation session):**

- Physical iPhone Safari: open, pinch zoom, pan after zoom, double tap, swipe left/right, close
  button, backdrop tap, portrait → landscape rotation.
- Physical Android Chrome: same core checks; additionally confirm the browser's own page-pinch
  gesture does not conflict with the in-viewer pinch handling.
- Desktop secondary check: open, Escape-to-close, backdrop-tap-to-close, optionally keyboard
  left/right slide navigation.
- Browser network check: confirm opening the viewer does not trigger a new signed-URL request.

**Deferred / follow-up:** enabling `controller.closeOnPullDown` (swipe-down-to-close), gated on
the manual device verification above showing no conflict with pinch/pan. Not scheduled as its own
stage — a small follow-up change once device testing is possible.

Implemented 2026-07-04 (code) — manual real-device verification above still outstanding.

**Stage 4B closure note (added 2026-07-04):** Stage 4B was closed as implementation-complete with
this verification still outstanding — it is not a Stage 4B blocker. Deferred to Stage 6 (mobile
polish) and/or pre-release manual QA — see PROJECT_STAGE_LOG.md (2026-07-04 closure entry),
PROJECT_IMPLEMENTATION_PLAN.md (Stage 6), and PROJECT_BACKLOG.md (Admin image viewer entry),
which also carries the gated `closeOnPullDown` and low-resolution-zoom-cap follow-ups.

### Small-image sizing/zoom fix — two-part investigation (2026-07-05, then 2026-07-06)

Triggered by a real Stage 5B.1 smoke request (`REQ-2026-0010`) uploading a genuine, valid 64×64
test image that appeared near-invisible in the fullscreen viewer. Investigated both times by
reading `yet-another-react-lightbox@3.32.0`'s actual bundled source directly (not assumed from
docs) — see PROJECT_STAGE_LOG.md (2026-07-05 and 2026-07-06 entries) for the full root-cause
traces and evidence.

**2026-07-05 attempt (found insufficient by manual testing):** every slide was given a fixed
`width: 4096, height: 4096`, plus `carousel={{ imageFit: "contain" }}` and
`zoom={{ maxZoomPixelRatio: 2 }}`. This correctly raised the Zoom plugin's max-zoom ceiling (its
calculation uses the identical `Math.max(slide.width, ..., naturalWidth)` value), so the small test
image gained *some* zoom range — but manual verification showed the image still opened tiny in the
fullscreen viewer. The gap: `ImageSlide`'s only sizing output is an inline
`max-width`/`max-height` style — a ceiling, never a forced size — so a plain `<img>` with no
`width`/`height` attribute still renders at its own natural pixel size when that's below the
ceiling. `imageFit` has no effect on the box size itself, only on `object-fit` within it.

**2026-07-06 fix (resolves it):** confirmed the correct, officially-typed lever is
`carousel.imageProps` (`ImageProps | ((slide) => ImageProps)`, documented in the package's
`types.d.ts`) — merged *last* into the exact same inline style object `ImageSlide` builds, and
passed through unchanged by the Zoom plugin regardless of zoom state. Confirmed the typed `styles`
prop cannot solve this at all (its slot list has no image-level target). Decision: `RequestImageViewer`
now passes `carousel={{ imageFit: "contain", imageProps: { style: { width: "100%", height: "100%" } } }}`
alongside the existing `slide.width/height = 4096` ceiling (kept — still needed for the Zoom
plugin's max-zoom math; the two fixes address different parts of the same underlying clamp, not
redundant) and `zoom={{ maxZoomPixelRatio: 2 }}` (value unchanged, now correctly means "2x from the
fitted display size" once initial sizing is actually fixed). All three tuning values were
consolidated into one named, commented config block in the component
(`VIEWER_IMAGE_MAX_DIMENSION`, `VIEWER_MAX_ZOOM_PIXEL_RATIO`, `viewerImageProps`) to avoid
unexplained magic numbers.

This is one uniform constant configuration applied to every slide identically — **no
resolution-based branching, no per-image conditional logic, no CSS override, no custom gesture
code.** A large real photo's `naturalWidth` already exceeds the declared ceiling in realistic cases,
so normal-sized photos are unaffected; `width: "100%"; height: "100%"` plus `imageFit: "contain"`
simply makes the image fill and fit its slide box for images of any size, which is the same
behavior a large photo already effectively has.

**This resolves the previously-deferred low-resolution-zoom-cap follow-up** — see
PROJECT_BACKLOG.md for the corresponding backlog update.

**Still outstanding, unchanged by this fix:** physical mobile-device verification (iPhone Safari,
Android Chrome — pinch zoom, pan after zoom, double tap, swipe, portrait/landscape) was not
performed in either session and is not claimed as done; `controller.closeOnPullDown` remains
disabled, still gated on that same physical verification. Manual browser verification of this
specific fix (confirming the tiny-image and real-photo cases both look and zoom correctly) has also
not yet been performed as of this entry — the developer has confirmed they will verify it directly,
see PROJECT_STAGE_LOG.md (2026-07-06 entry).

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

---

# Stage 6 Product Documentation Authority

Decided 2026-07-12, at Stage 6 start. Two dedicated Stage 6 documents were added to
`docs/project/` and are the official Source of Truth for Stage 6:

- **`STAGE_6_PRODUCT_DEFINITION.md` (PRD)** — the authoritative **product** document: product
  context, vision, goals, customer journey, product principles, Stage 6 Non-Goals, Future Scope,
  and Owner Decisions D1–D10 (marketing, request-over-booking, reply channel, optional uploads,
  48-hour response promise, eligibility, fit framing, pricing disclosure, navigation,
  English-only localization).
- **`STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS)** — the authoritative **implementation** document
  for the public website: navigation/CTAs, page responsibilities, the Request flow at field
  level, states and failure behavior, content canonical-ownership rules, normative copy
  (Appendix A), and acceptance criteria (FS §6).

## Rules

- All future Stage 6 work on the public website must follow these two documents.
- Product behavior changes require updating the PRD/FS **first** (PRD §9 Change Control), then
  implementation. Engineers must not expand scope or resolve open product questions during
  implementation (FS §1 Escalation rule) — such questions are escalated as owner decisions.
- Precedence on conflict: PRD > FS > any older Stage 6 planning text in PROJECT_* documents.
  A PRD/FS conflict is a documentation defect and is escalated (PRD §9).
- The internal admin application remains governed by the existing PROJECT_* documentation — the
  FS's responsibility ends when a valid request is durably persisted and assigned a reference
  code (FS §1, Internal boundary).

## Relationship to earlier decisions in this file

Earlier decisions in this file describing the **public** surface as shipped in Stages 0–5
(e.g. request-form field decisions, Reference Code format, contact-field model, consent wording)
remain the accurate record of what was decided and built then. Where the Stage 6 PRD/FS define a
different target (e.g. optional uploads, single contact method, eligibility confirmation,
FS §4.6 reference-code format), the PRD/FS govern Stage 6 implementation; the earlier decision
entries are historical and are annotated in place where the difference is material.
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

# Stage 5A Security / Data-Boundary Decisions

Decided 2026-07-05, following the 5A.1 repo/security audit, 5A.2 live Supabase read-only
verification, 5A.3 legacy-data cleanup plan, 5A.4 owner-approved destructive cleanup, and an
independent Claude review that reached consensus. Full evidence trail is in PROJECT_STAGE_LOG.md
(2026-07-05 entry). This section records the resulting decisions only.

## Access Model — Confirmed, Unchanged

BFF + server-only `service_role` remains the primary and only operational data-access model:

- the browser does not access Supabase DB or Storage directly, and no change introduces this
- app-layer authorization remains primary: `getAuthenticatedStudioMember()` plus explicit
  `studio_id` scoping on every query, exactly as established in Stage 4A/4B
- this decision is a confirmation of the existing model after live verification, not a new
  architecture

## RLS Model — Zero Policies Is Intentional, Not a Gap

Live verification (5A.2) confirmed RLS is enabled on all four application tables (`studios`,
`studio_members`, `requests`, `request_files`) — `studios`/`studio_members` via a Supabase-managed
event trigger (`rls_auto_enable`/`ensure_rls`), not an explicit project migration — and that zero
`CREATE POLICY` statements exist anywhere, with zero `SELECT`/`INSERT`/`UPDATE`/`DELETE` grants to
`anon`/`authenticated` on any table.

**Decision: this is treated as intentional deny-all-by-omission, not an oversight to fix.** With
every access path going through `service_role` (which bypasses RLS entirely), an explicit
"deny-all" policy would be redundant — the absence of any `anon`/`authenticated` grant already
achieves the same effect. Do not add explicit deny-all policies now; doing so would add
maintenance surface without changing actual behavior.

**Add RLS policies only when a real non-service-role access path exists** — for example, a future
direct-from-browser authenticated read, a future Storage direct-upload flow, or a future
multi-studio feature that needs row-level enforcement beyond what the BFF already provides. Until
one of those is actually being built, policy design work would be speculative.

**`studio_members` self-read policy** (a policy letting an authenticated user read their own
membership row directly) was considered and **explicitly deferred**, not rejected — there is no
current caller that would use it (`getAuthenticatedStudioMember()` already reads this via
`service_role`); revisit if a client-side Supabase client is ever introduced.

## Storage Model

- `request-images` bucket remains private (confirmed via live verification, `public: false`)
- Direct `anon`/`authenticated` Storage access remains deny-all / no policies — same rationale as
  the table RLS decision above; `storage.objects` RLS is enabled with zero policies, confirmed live
- **No path-prefix Storage policies now.** The `{studioId}/{clientSubmissionId}/...` path
  convention (established in Stage 3D.6) remains the correct future-ready structure for such a
  policy if one is ever needed, but writing one today would be speculative in the same way a table
  RLS policy would be
- **Legacy paths have been cleaned up:** the 6 `request_files` rows that predated the
  `{studioId}/` prefix convention, belonging to 3 confirmed test/dev requests
  (`REQ-2026-0002/0003/0004`), were deleted with owner approval (5A.3 plan, 5A.4 execution — see
  PROJECT_STAGE_LOG.md). All remaining `request_files.storage_path` values now match the current
  convention (12/12)
- **2 orphaned Storage objects** (objects with no corresponding `request_files` row, found
  incidentally during 5A.2/5A.3, unrelated to the legacy-path cleanup) remain untouched — tracked
  as a separate hygiene item in PROJECT_BACKLOG.md, not part of RLS/Storage policy design

## Staging Environment — Deferred, Not a Hard Blocker for Minimal 5B

A separate staging Supabase project and Vercel preview/staging environment is **not required**
before the minimal Stage 5B hardening pass (search_path fix, bucket Dashboard limits, Auth
Dashboard verification) — these are small, reversible, and independently verifiable live changes.

Staging **is required** before any future work that:

- introduces real `authenticated`-role RLS policies on `requests`/`request_files`
- introduces browser-side Supabase access of any kind
- implements multi-studio behavior
- changes the `create_request` RPC's signature or behavior

Until one of those is scheduled, the single-project model continues, with each live change to the
real project done carefully and verified immediately (as 5A.2–5A.4 did).

**Scoped exception — Stage 6 `create_request` recreations (owner decision 2026-07-15).** The two
Stage 6 IMPL-Task-03 migrations that recreate `create_request` — the reference-code format change
(`20260715124427_stage6_reference_code_format.sql`, FS §4.6) and the Block C contact-model change
(five contact columns) — are **explicitly waived from the staging prerequisite above**. Basis: the
single project still holds test-only data (confirmed 5A.3 classification, unchanged), the changes
are applied via the CLI migration workflow (below) and verified immediately (`migration list`
parity + a live end-to-end submit), and no staging environment exists yet to gate them against.
This is a narrow, dated exception for these two named migrations only — it does **not** reopen the
gate for RLS, browser-side Supabase access, or multi-studio work, and it does not remove the
pre-launch staging requirement (Section C). The contact-model migration's own record is under
"Stage 6 Contact Model — decided 2026-07-15".

## Backup Posture — Deferred, Not Claimed as Ready

Full backup posture (a manual DB dump/export, Storage backup strategy, PITR configuration) is
**deferred** until either real/valuable production data exists or the project reaches pre-launch —
whichever comes first. Current data in the project remains test/dev data (confirmed during 5A.3's
classification), so backup urgency is low today.

A manual DB dump will be produced under explicit owner guidance later, not as part of Stage 5A or
the current minimal Stage 5B scope. **This project does not claim production backup readiness at
this time** — see PROJECT_PRODUCTION_READINESS.md, which is updated to reflect this as an open
pre-launch item, not a completed one. Storage backup remains an accepted risk for now; revisit
before real launch.

## Revised Stage 5B Scope

See PROJECT_IMPLEMENTATION_PLAN.md — Stage 5B for the full task list. Summary of what the Stage 5A
consensus changed:

- **No RLS or Storage policy implementation in Stage 5B** — see RLS Model and Storage Model above
- **Added:** `create_request` `search_path` hardening migration (fixes the `function_search_path_
  mutable` finding from `supabase db advisors`) — a narrow function-definition fix, not a policy
  change
- **Added:** Storage bucket MIME-type/file-size Dashboard limits (10 MB per file, matching the
  app-layer `validateFiles` check as it stood then) — Dashboard configuration, not code or policy.
  **Superseded 2026-07-14:** the app-layer limit is now 4 MB (see "Stage 6 Upload-Flow Architecture"
  — the Vercel Function request-body ceiling). The bucket's 10 MB Dashboard limit is left in place
  as a harmless outer backstop — it no longer *matches* the app limit, it simply cannot be reached
  through the application, since a >4 MB file is rejected before Storage is touched.
- **Added:** Auth Dashboard verification (redirect URLs, custom SMTP status, rate limits, enabling
  "Leaked Password Protection") — Dashboard verification, not code
- Everything else previously planned for Stage 5B (environment separation, production environment
  setup, logging review, dependency audit, CI/CD) is unchanged

---

# Stage 5C Deployment Workflow and Environment Decisions

Recorded 2026-07-08, following the first real Vercel/Supabase deployment verification (see
PROJECT_STAGE_LOG.md, 2026-07-08 entry). These are target-direction decisions, not all
operationalized yet — each says explicitly what is decided vs. what remains to be implemented.

**Stage 5C itself closed 2026-07-08** as real-infrastructure/manual-E2E-verification complete (see
PROJECT_STAGE_LOG.md closure entry) — that closure is not a production-readiness or public-launch
decision, and does not supersede or resolve any of the three sections below. Sections A–C remain
the standing decisions on workflow, CI/CD, and environment separation; they hand off to a
DevOps/workflow decision block and then Stage 5D (Full Application Maturity Audit), which has not
started.

## A. Git / Vercel Workflow — Agreed Direction, Not Yet Implemented

The first Vercel deployment was made directly from `main` rather than from a Preview-branch
deployment. This was a real, useful verification step, but is not the intended ongoing workflow.

Intended minimum workflow, going forward:

- `main` is treated as the production branch only once a real production environment/release
  policy exists (see Section C below) — until then, deploying from `main` remains a pragmatic,
  acknowledged interim state, not a policy.
- Feature work should happen on feature branches / PRs rather than committing directly to `main`.
- Vercel Preview deployments should be used for controlled review/smoke testing before merge.
- A Preview deployment URL can change per deployment/push. Since Supabase's Redirect URL allowlist
  is keyed to exact URLs (see the OAuth locale-query finding in PROJECT_STAGE_LOG.md, 2026-07-08),
  this has a direct implication for auth testing on Preview URLs: each new Preview URL would need
  its own allowlist entry.
- For a single controlled auth smoke test against a Preview deployment, use one stable deployment
  URL for the duration of that test and avoid unnecessary pushes while it remains allowlisted, to
  avoid Redirect URL churn.
- If recurring Preview auth testing becomes necessary (not just one-off smoke tests), evaluate a
  stable branch alias or a dedicated staging environment (see Section C) rather than repeatedly
  editing Supabase Redirect URLs by hand.
- `pnpm qg` remains required before merge for any source/config/dependency change, per the
  Pre-Commit Checklist in `.claude/CLAUDE.md` — unchanged by this decision.

This is a documented target workflow, not a claim that it is fully operationalized. It does not
constitute CI/CD completion — see Section B below for that separate decision.

## B. CI/CD — Explicit Decision and Trigger

Current MVP baseline (unchanged, already in force): local `pnpm qg`, Husky pre-commit lint/
typecheck, Vercel's Git-integration deploy (preview per PR, production per merge to `main`, once
the Section A workflow above is actually in effect).

**Decision:** a required remote CI check (e.g. GitHub Actions running `pnpm qg` or a justified
CI-safe equivalent) is **not currently implemented**, and is not required at the current stage.

**Trigger to add it:** before public launch, or whenever collaboration/PR volume makes
local-only quality gates insufficient (e.g. a second contributor, or enough PR volume that manual
discipline becomes unreliable) — whichever comes first. This is a pre-launch/maturity
prerequisite to decide and implement deliberately when the trigger condition is met, not a claim
that CI is already in place today.

## C. Staging vs. Production Infrastructure — Pre-Launch Requirement

**Current controlled-testing phase (in effect now):**

- One Supabase project may continue to be used for controlled test data only, as it has been
  since Stage 5A.
- The current deployed Vercel environment is not claimed as real production — it is a real
  deployed environment used for verification (see PROJECT_STAGE_LOG.md, 2026-07-08 entry).
- Test-data cleanup remains optional while all data in the project remains test data (unchanged
  from the Stage 5A posture).

**Required before real users / public launch (not done, not started in this session):**

- separate Supabase staging and production projects
- separate Vercel environment variable values for staging and production
- separate Auth Site URL / Redirect URLs / Google OAuth configuration per environment, as needed
- a defined migration promotion/verification process from staging to production
- staging must never be allowed to alter real client data
- custom SMTP, a production domain, backups/PITR, monitoring, and final mobile QA remain separate
  pre-launch decisions/checkpoints (see PROJECT_PRODUCTION_READINESS.md) — none of them are
  claimed as complete by this entry or by the 2026-07-08 deployment work.

No staging/production project split, no new Vercel environment configuration, and no new Supabase
project were created in this documentation pass — this section records the decision and its
trigger only.

## D. DevOps/Environment Direction — Agreed 2026-07-08 (Read-Only Audit Follow-Up)

Recorded following the read-only DevOps/workflow planning audit conducted the same day as Section
A–C above. This subsection sharpens those sections' direction into agreed decisions; it does not
supersede them, and none of the following has been implemented in this documentation pass.

**Staging/production identity.** The current controlled-test Supabase project and Vercel
deployment referenced in Section C is designated to become the future **staging** environment —
it is not renamed or reconfigured by this entry, only its eventual role is decided. It still
contains test data and is still not public production. Before accepting real client requests, a
new, clean **production** Supabase project and Vercel production configuration must be created —
they do not exist yet. This entry does not claim the staging conversion or the production
environment already exist.

**Environment separation model — decided, not a comparison anymore.** Separate Supabase projects
for staging and production is the approved model, superseding the earlier open comparison in
Section C. Each environment must have its own database, Storage bucket, Auth configuration (Site
URL, Redirect URLs, OAuth client config, SMTP/rate-limit settings), and other project-level
operational settings, as applicable. **One-project/multiple-schema separation is not an approved
option** — Supabase Auth, Storage, and Realtime are project-wide, not schema-scoped, so a shared
project cannot actually isolate the auth users and Storage bucket this app depends on. Vercel gets
matching separate environment configuration/deployments per environment.

**Target release flow after launch** (refines Section A; exact mechanics deliberately undecided —
see Pending below):

feature branch / PR → Preview deployment for ordinary review → stable staging deployment → manual
smoke/QA → production deployment only after staging verification → production smoke verification
after release.

Branch names, the Vercel stable-alias mechanism, and any Redirect URL wildcard/pattern syntax are
intentionally left unresolved until verified during implementation — no premature commitment.

**CI/CD direction — reaffirms Section B, no change in substance.** Before public launch, add the
smallest remote CI check that runs `pnpm qg`. Vercel's Git integration remains solely responsible
for deployment — no duplicate deploy pipeline is planned. Migration promotion remains manual and
deliberate: apply and verify on staging first, then apply to production — no automation is
introduced now.

**Explicitly pending, not decided by this entry:**

- the stable staging URL mechanism (Vercel branch alias vs. another approach)
- the OAuth/locale redirect redesign — goal is to remove the Redirect URL allowlist's dependence
  on the `locale` query value; no solution is chosen (see PROJECT_BACKLOG.md, OAuth Locale-Query
  Redirect Allowlist Design Debt)
- exact Supabase/Vercel plan capabilities and pricing for running two environments
- CI Node version policy (relative to the existing `package.json` `engines: ">=20"` floor and the
  Vercel-confirmed `24.x` runtime)
- a written migration promotion checklist
- staging seed-data approach
- production domain, custom SMTP, backups/PITR, and monitoring posture (unchanged open items, see
  PROJECT_PRODUCTION_READINESS.md)

**Multi-studio/custom-domain note.** Per-studio custom domains/subdomains remain out of current MVP
scope — this is a single-studio product, not SaaS (see PROJECT_CONTEXT.md). The existing constraint
that single-studio deployment resolution (`DEPLOYMENT_STUDIO_ID`) stays isolated in config rather
than expanding into routing/middleware is preserved unchanged; this entry does not begin any SaaS
design.

---

# Storage Upload-Failure Log Decision (Stage 5D Fix Pass 1)

Decided 2026-07-08, during the Stage 5D fix pass. Server-side Storage upload-failure logs
(`services/storage.ts`'s `uploadRequestFiles`/`cleanupFiles` — since Stage 5D Fix Pass 2 exported
as `cleanupRequestFiles` and reused by `app/api/request/route.ts`, whose duplicated local helper
was removed) may continue to include the raw, UUID-based `storagePath`
(`{studioId}/{clientSubmissionId}/{type}/{file}`) and the raw Supabase error message as diagnostic
signal. This is intentionally not sanitized in this pass.

**This does not reverse or weaken any existing hardening:**

- Raw storage paths must still never appear in any DTO returned to `app/`/`features/` code (see
  Signed URLs, above) — `AdminRequestDetail`/`AdminRequestFile` still have no `storagePath` field.
- The Stage 5B cleanup-summary hardening (logging a file *count*, not the path array, on the
  cleanup-start log line) is unchanged.
- This decision covers only the *upload-failure* and *cleanup-result* log lines that were already
  left out of the Stage 5B logging fix pass's scope — it does not newly add raw-path logging
  anywhere it wasn't already present.

**Reason:** the path segments are internal UUIDs (`studioId`, `clientSubmissionId`), not client
PII — no email, phone, name, or other personal data is present in a storage path. Losing this
detail from server logs would make diagnosing a real upload failure (which file, which
studio/submission) meaningfully harder, for a privacy benefit that does not apply here. Revisit
only if a concrete reason to strip it emerges (e.g. a stricter log-retention/compliance
requirement).

---

# Stage 5D Fix Pass 2 Decisions (2026-07-09)

## Server Action Tests May Mock Next Internals

Until this pass, the codebase deliberately avoided mocking `next/headers`/`next/cache` (Stage 4B.6
precedent — no Server Action tests). Fix Pass 2 introduces the first Server Action test file
(`requests/[id]/__tests__/actions.test.ts`), mocking `next/headers`, `next/cache`, and
`next-intl/server` via `vi.mock`, because the new `requestId` UUID guard lives inside
`updateRequestStatusAction` and is untestable otherwise. Decision: this mocking pattern is now an
accepted, deliberate option for action/route-handler tests **when the behavior under test lives in
the action/handler itself** — it does not retroactively require tests for existing actions, and
service-layer behavior should still be tested at the service layer. The deferred auth-callback
route tests (PROJECT_BACKLOG.md) are the expected next user of this pattern.

## Deep-Import Lint Rule Is Now Blocking

`import/no-internal-modules` raised from `warn` to `error` in `eslint.config.mjs` (Stage 5D audit
finding F6). The allow-list is unchanged; the repo had zero violations at flip time. Rationale:
import-direction/public-API discipline is an architectural invariant in this project
(PROJECT_STRUCTURE.md — Import Rules), and Stage 5D Fix Pass 1 showed violations can accumulate
silently as warnings (the UI→BFF violation existed under `warn`). New deep imports now fail
`pnpm lint`/`pnpm qg`; legitimate new public surfaces must be added to the allow-list explicitly.

---

# Stage 6 UX Blueprint Decisions

Decided 2026-07-13, Stage 6 STRAT session (UX blueprint topic — see
`docs/project/tasks/STAGE_6_STRAT_BRIEF.md`). Scope: page structure, block order, flows, states,
navigation/CTA placement — no visual design (colors, typography, spacing, imagery), per the
brief's stated boundary. These decisions sit strictly inside the PRD/FS corridor: none contradict
or require a PRD/FS change; §4.5's permitted in-memory persistence is the only place a blueprint
decision turns a FS "permitted" into a blueprint-level "required" (D-Blueprint 5 below), which the
FS itself allows. Status: **all 8 sub-topics decided and reviewed (2026-07-13)** — batch 1
(navigation/CTA, Home, Process, Request): externally reviewed, 4 corrections folded in; batch 2
(Success, Location, Preparation, Aftercare): externally reviewed to consensus
(`docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md`), 3 corrections
folded in; plus a repo-aware Codex review over the whole blueprint
(`docs/project/reviews/REVIEW_2026-07-13_stage6-ux-blueprint-full.md`), whose corrections are
marked "(Codex review)" below.

Some conclusions below originated as an external hypothesis (an out-of-repository ChatGPT
research thread predating this project's STRAT/IMPL workflow) and were independently verified
against PRD/FS text in this session before being accepted; only the verified conclusions are
recorded here, not the external material itself.

**Consensus note.** Per the owner: the source of truth for these decisions is neither this
document, nor any single AI, nor the owner alone, but the consensus reached across them. The
Navigation/CTA, Home, Process, and Request sections below were independently reviewed by a second
AI (2026-07-13, cross-session, given only the batch of decisions plus the relevant FS/PRD
excerpts) before being finalized; four corrections from that review are folded in below (CTA
interpretation note, About-removal rationale, D-Blueprint 5(a) guarantee boundary, D-Blueprint 4
rationale addition). Nothing required a PRD/FS escalation.

## Navigation and CTA placement (site-wide)

- **Navigation pattern unchanged.** The existing `src/shared/ui/app-nav.tsx` component (bottom
  fixed tab-bar on mobile, top sticky bar from the `sm:` breakpoint up) is retained as the Stage 6
  pattern. Only its item set changes, to match FS §2/PRD D9 exactly: Home, Process, Request,
  Location (was Home, Request, Policies, Location — `policies` is replaced by `process`, item
  order follows D9).
- **Primary CTA placement on content pages** (Home, Process, Location): the primary CTA block
  appears once at the end of the page, after all content. On Home only, an additional CTA appears
  at the end of the Hero block, for visitors who are ready to act immediately. The CTA never
  competes with the nav bar — nav is site navigation, CTA is an in-content action.
- **Interpretation of "one primary CTA per page" (FS §2, acceptance criterion 10) for the Home
  double instance.** "Exactly one primary CTA" governs the primary *action* a page offers, not the
  literal count of button instances on screen. Two instances of the identical "Start Your Request"
  action (Hero + end of page) are the same action repeated for scroll convenience on a long
  mobile page, not two competing CTAs — a *different* action (e.g. a second, distinct CTA) would
  violate the rule; a repeated instance of the *same* one does not. This interpretation is recorded
  explicitly here, as a UX-review pass (2026-07-13, cross-checked against another AI reviewer)
  flagged it as the one point in this batch with a plausible literal-reading conflict, i.e. a
  "decision by silence" the blueprint should not leave implicit.
- **Global footer (Codex review — the blueprint had ignored an existing site-wide action
  surface).** Every public page renders `PublicFooter` (`app/[locale]/(public)/layout.tsx`),
  which today exposes studio name, address, email (`mailto:`), phone (`tel:`), Instagram, and
  copyright. Owner decision (2026-07-13): **email and phone links are removed**; the Stage 6
  footer is studio name + address + Instagram + copyright. Rationale: the product's core thesis
  (PRD §2) is replacing unstructured contact with the structured request — `mailto:`/`tel:` on
  every page invite exactly the channel the product replaces, and they serve no page's current
  task (FS §2's secondary-link rule); the legitimate needs they might serve are already covered
  (address stays for trust, Instagram stays per D1, Location covers arrival). "Keep and A/B-test
  later" was considered and rejected for Stage 6 — analytics is an explicit PRD §4 Non-Goal, so
  the test could not run; the idea is recorded in PROJECT_BACKLOG.md as a post-launch candidate
  instead. Cheap reversal noted: restoring the two links is a one-line change if real-world
  demand appears.
- **Home's second Instagram instance stays (Codex review flagged it as undecided).** Home has
  Instagram links in Hero (decided in this blueprint) *and* under Featured Work ("see more on
  Instagram") — the second was never explicitly decided. Owner decision (2026-07-13): keep both.
  The Featured Work instance serves precisely that block's task (browsing more work = fit
  confirmation), passing FS §2's task-relevance rule, and the same action-vs-instance
  interpretation already adopted for the CTA applies: same action, two placements, no competing
  action introduced.

## Home page (FS §3.1)

- **Block order** (FS §3.1 lists required blocks without an explicit order, unlike Success §3.4
  which says "in order" — the order is this blueprint's decision to make):
  Hero → Featured Work → Good Fit teaser → Mini Process → Price teaser → primary CTA.
  Rationale: cheapest visual/positioning filters ("do I like the work / am I a fit") come before
  the more detailed content (process mechanics, price), so visitors who are not a fit disengage
  before investing attention in details that no longer matter to them. This is a funnel-logic
  hypothesis, not validated against real traffic data — flagged as a candidate for future
  analytics/A-B review, not a Stage 6 blocker.
- **About section removed — corrected rationale.** The currently-shipped Home
  (`app/[locale]/(public)/page.tsx`) has a two-line About section not listed among FS §3.1's
  required blocks. A UX-review pass (2026-07-13) caught that the original rationale for removing
  it ("FS §3.1's Must-not-contain: long-form duplicates") does not actually apply — a two-line
  block is not long-form by definition, and content outside both the "must contain" and "must not
  contain" lists is not itself prohibited by FS. The standalone About block is removed as a
  blueprint-level structure decision rather than because FS forbids it. **Condition resolved
  (Codex review checked the real copy):** the shipped About lines (`en.json` — "20+ years of
  experience in painting, calligraphy, and tattoo art." / "Every piece is custom — designed from
  scratch, just for you.") ARE unique trust content — the shipped Hero holds only the studio name
  and "Custom tattoos in Tel Aviv", and no Good Fit block exists yet. Repo review confirmed this
  copy is not disposable duplicate content, so the outcome is the fold path, not deletion: the
  standalone About block is removed as a structure, and its unique trust content (tenure,
  custom-from-scratch promise) must be folded into Hero and/or the Good Fit teaser when Home is
  built. Final wording remains owner-authored.
- **Instagram link retained** as a secondary contextual link inside the Hero block (not a content
  block, not competing with the primary CTA) — consistent with PRD D1 (Instagram as the primary
  acquisition channel).

## Process page (FS §3.2)

- **Block order** (same "order not specified by FS" situation as Home):
  Process Overview → Good Fit → Design Process → Pricing → Booking Policy → FAQ → primary CTA.
  Rationale: orientation first, then the same fit-filter as Home but in full, then how the design
  process actually works, then price (once the visitor understands what they're paying for), then
  booking rules, then residual questions (FAQ), then CTA.

## Request page — form format (FS §4)

FS §4.1 fixes the field-level block order (Introduction → Idea → Project Details → Reference
Uploads → Contact → Eligibility & Privacy → Submit) and §4.2–§4.7 fix every field and state in
detail; the open blueprint question was strictly the on-screen format, not the block order or
field set.

- **D-Blueprint 1 — Format: single continuous scroll with visually separated sections.** Not a
  multi-step wizard, not an accordion. Retains the current `RequestForm.tsx` architecture (one
  RHF form, one submit). Three independent arguments converge: (a) product — "a structured first
  Direct message, not a booking system" (PRD principles, §6) is a single-message metaphor; a
  wizard with steps/progress bar reads as booking-system language, which PRD deliberately
  distances itself from; (b) cognitive load — with ~7 fields actually filled in, a scroll makes
  the full scope of effort visible immediately (lower perceived load), while a wizard hides scope
  and creates step-count anxiety, and an empty step containing only three optional upload cards
  plus a "next" button silently implies something must be uploaded, undermining D4's
  optionality; (c) specification cost — FS §4.5 is written in scroll terms ("first invalid field
  scrolled into view and focused"); a wizard would require rewriting the validation/state model,
  i.e. a FS escalation, for no product benefit.
- **D-Blueprint 2 — Cross-step validation: not applicable**, a direct consequence of D-Blueprint 1
  (no steps exist to validate across). Recorded because both wizard-side alternatives were
  independently shown to conflict with existing decisions (a blocking per-step validation would
  make optional upload steps read as required, undermining D4; deferred end-of-flow validation
  would contradict FS §4.5's scroll-to-first-invalid wording) — an independent confirmation that
  the scroll format is not a stylistic preference.
- **D-Blueprint 3 — No Review step.** Submit leads directly to Success or a failure state, as FS
  §4.5 already describes (no Review state exists in FS). In a single scroll, the review function
  already exists physically — the visitor scans their own answers while scrolling toward Submit;
  a separate review screen would duplicate that and add friction against the flow's low-friction
  goal, and would require a FS escalation (a new §4.5 state, a new §6 acceptance criterion). The
  residual risk a review step would catch — a typo in the contact value — is already mitigated by
  format validation (E.164/email/handle charset), the Success-page contact echo (FS §3.4 item 4,
  makes an error visible immediately), and the Instagram fallback as a last-resort channel.
  Accepted as a recorded risk, not a gap.
- **D-Blueprint 4 — Uploads: vertical stack inside the Reference Uploads section**, not a separate
  step, not a carousel/tabs. The three motivation cards (fields 5, 6, 7 — FS Appendix A.1 supplies
  the normative copy for each) are stacked in field order (5 → 6 → 7) within one section. A
  carousel or tabs would hide categories a visitor doesn't swipe/tap to, defeating FS §4.4's
  "communicated benefit" mechanism (a motivation sentence only works if it's seen); a vertical
  stack shows all three at once during normal scrolling. The field order (5→6→7) is FS's own field
  order, not re-derived here. **Additional rationale (added after a 2026-07-13 UX-review pass):**
  the stack also serves PRD D4's review trigger directly — "if missing placement photos recurrently
  cause clarification rounds, the placement photo's optionality is re-decided." That trigger is
  only interpretable if every visitor actually sees the placement-photo card; a carousel or tabs
  would make low upload rates ambiguous (did visitors decline, or never scroll/tap to the card?),
  turning the review signal into a UI artifact instead of a genuine visitor decision. The vertical
  stack is what keeps D4's review trigger measurable.
- **D-Blueprint 5 — "Quick way back", made concrete as three blueprint-level behaviors:**
  - **(a) In-session form persistence is required at the blueprint level — with an explicit
    guarantee boundary.** FS §4.5 permits but does not require in-memory persistence within the
    session ("permitted, not required"); this blueprint makes it required: a visitor who leaves
    Request to check Process for price/fit and returns finds all entered values and uploaded files
    intact. This is the one point where the blueprint adds an obligation beyond FS's floor —
    explicitly allowed by FS's own wording, not a FS conflict. Session-memory only, no server-side
    draft (PRD §4 boundary unchanged).
    **Guarantee boundary (added after a 2026-07-13 UX-review pass, which correctly noted the
    original wording overclaimed):** the guarantee covers client-side navigation within a live
    session only (e.g. Request → Process → Request without a full page reload). It does **not**
    cover a page reload, closing the tab, or the mobile OS evicting a backgrounded tab to reclaim
    memory — a real mobile scenario (visitor leaves the tab to check the artist's Instagram,
    returns minutes later to a reloaded, empty tab). Reload/eviction data loss is an accepted risk,
    not covered by this decision; a stronger guarantee (e.g. `sessionStorage`/`localStorage`)
    is explicitly out of scope here — it raises its own risk (persisting body-placement photos on
    the visitor's device) and was not what was decided.
    **Implementation cost (noted, not decided here):** surviving client-side navigation means the
    form's state cannot live in `RequestForm.tsx`'s local component state (unmounted on navigation
    away) — it requires a module-level store/context that outlives the page. Left for the
    implementing session, not a blueprint-level architecture decision.
    **Known follow-on concern (corrected after the Codex repo review — the first version called
    this "cheap", which was true only of the FS target, not the shipped architecture):** under
    FS §4.3 uploads happen on file selection, so "preserving uploaded files" means preserving
    references to already-uploaded objects — but see the **Upload-flow architecture
    prerequisite** below: the shipped code has no selection-time upload at all, so this
    reference-preserving model first has to be built. Once it exists, this decision increases
    the number of **orphaned uploads** (files uploaded for a request that is ultimately never
    submitted). Cleanup policy for orphaned Storage objects is an internal/operational concern
    outside FS's boundary (FS §1) and already tracked in PROJECT_BACKLOG.md as a
    post-launch/operational item — noted here only because this decision increases their
    volume, not because it changes that policy.
  - **(b) Clean browser history.** A direct consequence of D-Blueprint 1: Request is a single
    history entry; the browser back button goes to the previous site page, predictably, with no
    interception — a wizard would either pollute history with one entry per step or require
    intercepting the back button, both against mobile user expectations.
  - **(c) Validation jumps use local smooth-scroll**, not a state change — the visitor sees what
    they scrolled past and keeps their spatial model of the form. No sticky progress indicator is
    added (a wizard artifact); the visible section structure of the scroll itself serves that
    function.
- **Upload-flow architecture prerequisite (Codex review, blocker finding — recorded so task
  decomposition does not silently inherit a redesign as if it were local UI state).** The
  blueprint's upload decisions (D-Blueprint 4 stack, 5(a) persistence, FS §4.3 semantics) sit on
  an upload model that the shipped architecture does not have. Shipped state:
  `RequestForm.tsx` keeps selected `File` objects in local component state and sends everything
  in one final `FormData`; the API route validates the complete request and only then uploads
  the batch; `services/storage.ts` treats any file failure as batch failure (all-or-nothing with
  cleanup); the type system, DB constraint, and admin viewer know exactly two file categories
  (`reference` | `placement`) versus FS §4.2's three upload fields; and `clientSubmissionId` is
  component-local state, regenerated on every Request mount — it cannot own selection-time
  uploads across the navigation-persistence guarantee of D-Blueprint 5(a) unless it moves into
  the persistent store too. FS §4.3's upload-on-selection with per-file progress, retry, remove,
  and per-file failure isolation is therefore a **redesign of the upload pipeline**, not a form
  tweak. Before any Request-page implementation task is marked `ready`, a dedicated
  architecture task must decide at least: the selection-time upload endpoint and its
  authorization/abuse model; the opaque client-side file handle and the stable
  `clientSubmissionId` lifecycle; the three-category representation across DB, Storage, and the
  admin viewer (including migration of the existing two-category constraint); per-file
  retry/remove/progress semantics; how final submit verifies and atomically adopts exactly this
  submission's uploads; and cleanup/idempotency behavior for unadopted uploads. This is
  security- and data-model-sensitive (public unauthenticated upload surface) and follows
  PROJECT_ARCHITECTURE.md's service-layer rules.

## Success page (FS §3.4) — decided 2026-07-13, batch 2

Content and its order are fully fixed by FS §3.4 ("Must contain, **in order**": confirmation →
reference code → 48-hour expectation → contact echo → channel notes → Back to Home CTA) — not
reopened here. The page does not exist in the shipped Stages 0–5 site (an in-place success state
was shipped instead — a recorded divergence); Stage 6 introduces it as a real route. The open
blueprint questions were the access/data mechanics behind FS's gating rule ("Reachable only
immediately after a successful submission. If opened directly, refreshed, or reached without a
successful submission in the current session, redirect to Home"):

- **Data transport: the module-level client store, clean URL.** On successful submit, the same
  module-level store that D-Blueprint 5(a) already requires for form persistence receives the
  success payload (reference code + the contact method/value as entered), and the client
  navigates to `/success` via client-side routing. The URL carries no data (no query params, no
  path segment): a reload drops module state by nature, which yields FS's "refreshed → redirect
  to Home" behavior for free instead of requiring an invalidation mechanism. The rejected
  alternative (data in URL, e.g. `/success?ref=…`) would keep a shareable/refreshable success URL
  alive — directly contradicting the FS gating sentence.
- **Gate check:** on mount, Success reads the store; an empty store means no successful
  submission in this session → immediate client-side redirect to Home. This single check covers
  all three FS cases (direct open, refresh, no-submission navigation).
- **One-time read (idempotent):** the success payload follows read-once semantics — after Success
  has rendered it, the payload is cleared, and the read-once mechanism must be robust to repeated
  invocation (React dev-mode strict effects double-invoke; a naive read-then-clear effect would
  redirect itself — mechanics left to implementation, the semantics are the blueprint
  requirement). Any revisit (browser back from Home, history navigation, manual URL entry) finds
  the store empty and redirects. Trade-off accepted knowingly: a visitor who navigates away and
  comes back cannot re-view the reference code on-site; the code is delivered once. This matches
  FS's intent (no public lookup functionality, §4.6) and the reply itself arrives via the contact
  channel regardless.
- **bfcache guard (added after the batch-2 external review, which found the gap):** the
  "any revisit redirects" guarantee relies on a fresh mount re-running the gate check — which
  holds for client-side route transitions and new tabs, but not for a browser-back restore from
  the back-forward cache after a full document navigation away from Success (bfcache restores the
  whole DOM without a mount, common on mobile Safari/Chrome). Blueprint requirement: Success
  listens for `pageshow` and re-runs the gate check when `event.persisted === true` — restored
  page + empty store → redirect. With this, the gating matches FS §3.4 in every case, not just
  the mounted ones.
- **Form-state clearing on successful submit (gap found by the same review — neither batch had
  stated it):** a successful persist clears *both* stores' contents: the success payload (after
  its one-time display) *and* the persisted Request form state from D-Blueprint 5(a). Without
  this line, a visitor returning to Request in the same session would find the form pre-filled
  with an already-submitted request.

## Location page (FS §3.5) — decided 2026-07-13, batch 2

FS §3.5 fixes the content set (address, map, studio photos, transport/parking, entrance
instructions if non-obvious; no marketing content) but not the order.

- **Block order: keep the shipped page's order**: Address (with map-provider links: Google Maps /
  Apple Maps / Waze) → map embed → How to find us → Studio Photos, **plus the primary CTA
  appended at the end** per the site-wide CTA decision (Location is in FS §2's CTA table —
  "Start Your Request"). Prior art respected: the page exists
  (`app/[locale]/(public)/location/page.tsx`); no reordering without cause. **Content-state
  precision (Codex review corrected an overstatement here):** the shipped page supplies the
  chosen block order, the address/provider links, and — already — the transport/parking sentence
  ("easily accessible by public transport and there is street parking available nearby",
  satisfying the batch-2 resolution as shipped); but the "map" is an empty placeholder `<div>`
  and all four "studio photos" are empty placeholder `<div>`s. Stage 6 implementation must
  supply a real map embed and real studio photos (both FS §3.5 must-contain items) in addition
  to appending the CTA — the earlier claim that the CTA was "the only structural gap" understated
  this and risked the two placeholder items dropping out of task acceptance.
- **Transport/parking and entrance instructions live inside "How to find us"**, not as separate
  blocks — with different requiredness, corrected after the batch-2 external review caught a real
  FS conflict in this decision's first version. FS §3.5 reads "Must contain: address, map, studio
  photos, transport/parking, entrance instructions **if non-obvious**" — the conditional
  qualifier binds to entrance instructions only; **transport/parking is unconditional
  must-contain content and cannot be waived by a blueprint- or content-level decision** (the
  first version of this entry did exactly that, framing its omission as an "owner content
  decision" — an FS violation resolved silently at the wrong level). Owner-decided resolution
  (2026-07-13, choosing the review's recommended option over an FS amendment): "How to find us"
  carries **at least one sentence of transport/parking content** (e.g. whether nearby parking
  exists, nearest transit stop) — minimal, literal satisfaction of the FS item, and genuinely
  arrival-friction information for an Israeli city (the page's FS purpose). Entrance instructions
  remain conditional per FS's own "if non-obvious" and are omitted for the current location.

## Preparation page (FS §3.6) — decided 2026-07-13, batch 2

The shipped site has no Preparation page — its content lives inside the combined `aftercare`
route (sections: before-appointment, tattoo-day, aftercare-instructions, healing-touch-ups), a
recorded Stages 0–5 divergence. **Stage 6 splits it into two routes per FS §3.6/§3.7**; this is
FS compliance, not a new blueprint invention.

- **Blocks, chronological:** short intro (1–2 lines: who this page is for — booked clients — and
  what it covers) → Before appointment → Tattoo day.
- **Navigation presence:** the nav bar is rendered on this page (FS §2 — primary navigation is
  "identical and persistent on all public pages") while the page itself is absent from the nav's
  item set (PRD D9). Reaching the page is by the artist-sent direct URL (primary path) plus a
  global-footer link (in-product fallback discovery). **(Superseded 2026-07-14 — this entry
  originally read "by direct URL only … no in-product discovery is an accepted risk"; see
  "Preparation/Aftercare in-product discovery" above, which reversed that and amended PRD §5/FS §2.)**
- **No primary CTA** (FS §2 table: none for content pages Preparation/Aftercare).
- **The shipped page's "back to policies" links (top and bottom) are removed:** the policies page
  is superseded in Stage 6 (nav item becomes Process), and FS §2 allows secondary links only when
  they help complete the current task — a preparing client's task is not served by Process.
- **No cross-link to Aftercare — on task-relevance grounds (rationale corrected after the
  batch-2 external review):** FS §2 allows secondary links only when they help complete the
  page's current task, and the Preparation reader's task (their session is still ahead) is not
  aftercare — so the link earns no place. Explicitly noted: PRD §5's "no in-product fallback
  discovery (no footer links)" does **not** forbid such a link — that clause is about public-page
  discoverability, and seeing a Preparation→Aftercare link already requires having received the
  Preparation URL from the artist. The first version of this entry cited PRD §5 as the basis —
  an overclaim (same class as batch 1's "long-form duplicate"). Recording the honest, narrower
  basis keeps the future cost of change accurate: if the owner later wants a "what comes after"
  link here (a plausible pre-session-anxiety case), that is a cheap blueprint-level change, not a
  PRD escalation.

## Aftercare page (FS §3.7) — decided 2026-07-13, batch 2

Mirror of Preparation (same split, same rules).

- **Blocks, chronological:** short intro → Aftercare instructions (immediate care) → Healing &
  touch-ups (longer-term expectations).
- Nav bar present / absent from nav item set; no primary CTA; "back to policies" links removed;
  no cross-link to Preparation — same rationale as the Preparation section above, applied
  symmetrically. Discovery: artist-sent direct URL plus a global-footer link, same as Preparation
  (superseded 2026-07-14 — see "Preparation/Aftercare in-product discovery" above).
- **Content boundary for "Healing & touch-ups" recorded explicitly:** this section covers healing
  expectations and when a touch-up is appropriate — nothing else. Any touch-up booking terms or
  pricing belong exclusively to Process (Booking Policy): FS §3.7 forbids pricing/booking content
  here, and FS §5's canonical-ownership table places booking rules on Process alone. This line is
  drawn now because touch-ups are the one aftercare topic that naturally drifts toward booking
  language.
- **Tone requirement carried from FS §3.7:** the copy is "written as the artist's own
  instructions" — owner-authored content; per FS §3, missing content blocks implementation, it is
  not improvised by engineering.

## Preparation/Aftercare in-product discovery — decided 2026-07-14 (supersedes the batch-2 "direct URL only" stance)

Owner decision, resolving Item 8's open question Q1 (see STAGE_6_IMPLEMENTATION_PLAN.md). It
**changes the Source of Truth** — PRD §5 and FS §2 were amended in the same change (PRD §9 change
control: the PRD/FS are edited first, then implementation follows). This is recorded as a
first-class product decision, not a blueprint tweak, precisely because it moved PRD/FS text.

- **Decision (Q1):** the global public footer (`src/shared/ui/public-footer.tsx`, rendered on
  every public page by `(public)/layout.tsx`) gains **two links: Preparation and Aftercare**. The
  artist-sent direct URL stays the *primary* path (timed to the client's journey); the footer
  links are **in-product fallback discovery** for a client who has lost the artist's message.
- **Why this reverses the batch-2 stance.** The Preparation/Aftercare batch-2 entries recorded
  "reaching the page is by direct URL only … no in-product discovery is an explicitly accepted,
  recorded risk." The owner re-weighed that risk on 2026-07-14 and decided the lost-link failure
  mode is worth two unobtrusive footer links. The earlier stance is not deleted — it is superseded
  here and annotated in place below.
- **Why the footer, not the nav or a page CTA.** PRD D9 fixes primary navigation at exactly
  Home/Process/Request/Location — the footer is not primary navigation, so this does not add a
  fifth/sixth nav item and does not surface these pages to a first-time Instagram visitor deciding
  fit (the audience the pages are explicitly *not* for). It also does not touch any page's single
  primary CTA (FS §2). Alternatives considered and not taken: links from Process (its task is
  fit-decision, not session prep — weaker task-relevance under FS §2) and a link from Success (FS
  §3.4 fixes Success's content "in order" with a single Back-to-Home CTA — adding a link there is a
  larger spec change for no extra reach the footer doesn't already give).
- **`process.aftercareLink` fate (was deferred here from Item 2):** the Process page's single
  secondary link to `/aftercare` is **removed**; discovery is now the footer's job site-wide, and
  a fit-deciding Process reader's task is not served by an aftercare link (FS §2 secondary-link
  rule). The `process.aftercareLink` i18n key is removed with it.
- **New footer i18n keys:** `footer.preparation`, `footer.aftercare` (labels owner-adjustable
  without changing meaning, per FS Appendix A convention). Routes: `/preparation`, `/aftercare`.

**Q2 (boundary bullet) — decided 2026-07-14:** the last bullet of the shipped `tattooDayItems`
("After the tattoo, we'll take photos, then I'll apply aftercare protection and explain next
steps") **stays in Preparation's Tattoo-day section, copy unchanged.** It describes what happens in
the studio on the day (part of "what to expect on the day", FS §3.6 appointment-preparation scope),
not at-home aftercare — so it does not belong in Aftercare and needs no rewrite.

**Q3 (intro copy) — decided 2026-07-14:** the short intro each page requires (blueprint;
FS §3.6/§3.7) is owner-supplied as:
- `preparation.intro`: "For clients with an upcoming appointment — here's how to prepare and what
  to expect on the day."
- `aftercare.intro`: "Your tattoo is done — here's how to care for it while it heals."
Wording is owner-adjustable without changing meaning (FS Appendix A convention); meaning is fixed.

---

# Stage 6 Upload-Flow Architecture — decided 2026-07-14 (Item 1)

Resolves the Codex blocker finding recorded under "Stage 6 UX Blueprint Decisions — Upload-flow
architecture prerequisite": the shipped batch-upload-at-submit, two-category pipeline could not
support FS §4.3's selection-time upload, D-Blueprint 4's three-category stack, or D-Blueprint
5(a)'s in-session persistence. This is a full redesign of a public, unauthenticated write surface.
Task file: `docs/project/tasks/done/STAGE_6_TASK_01_upload_flow_architecture.md`.

**This entry supersedes, in part:** "File Data Model Decisions" (the two-value `type`), "Storage
Decisions → Folder Structure / Storage Filenames" (deterministic `{type}-{NN}.{ext}` naming),
"Failure Handling Decisions" (all-or-nothing submission with cleanup-on-DB-failure), and narrows
"Upload UX Decisions" ("no thumbnails" — thumbnails are now shown, rendered client-side from the
selected `File`, not fetched). Everything else in those sections (bucket name/privacy, signed-URL
admin access, per-file retry-with-backoff mechanics) is unchanged.

## 1. Selection-time upload endpoint and authorization

New `POST /api/upload` (`app/api/upload/route.ts`): one file + `clientSubmissionId` + category per
call, uploaded via the service layer, returns an **encrypted opaque handle** — never a storage path.

- **Handle = AES-256-GCM ciphertext** (`src/services/uploadToken.ts`, `UPLOAD_TOKEN_SECRET` env var,
  32 random bytes base64, read via `requireEnv`). Plaintext payload: `{ csid, cat, path,
  originalName, mimeType, size, iat }`. Encrypted, not merely signed: a signed-but-readable token
  would put a storage path in the browser, violating the never-expose-storage-path rule
  (PROJECT_ARCHITECTURE.md — Admin Dashboard Flow). TTL ~2h, checked at adoption.
- **Why a raw `clientSubmissionId` is not sufficient authorization.** It is client-generated —
  trusting it for adoption (e.g. "adopt everything under this session's storage prefix") would let
  an attacker who observes a victim's id upload a file under it and have it silently adopted into
  the victim's request, and would make the per-request file cap unenforceable (upload unboundedly,
  submit once). The encrypted handle is the ownership token instead: only the session that uploaded
  a file holds its handle.
- **Progress uses `XMLHttpRequest`, not `fetch`** (`src/features/request/lib/upload.ts`): `fetch`
  has no upload-progress event; FS §4.3 requires per-file progress. XHR also gives `abort()` for
  the remove-while-uploading case.
- **Thumbnails are rendered client-side** from the selected `File` via `URL.createObjectURL` —
  no signed URL is ever issued to the public; signed URLs remain admin-only.
- **Abuse controls**, all in the route handler (`proxy.ts` middleware excludes `/api/*`): a
  `Content-Length` pre-check before buffering; MIME allowlist + the per-file size ceiling + a
  magic-byte sniff checked against the file's *own* declared type (`src/bff/validateFiles.ts` — not
  "matches any allowed format", which would let a mislabeled file through); a per-session Storage
  object cap of 12 (`countObjectsForSubmission`); an in-memory per-IP rate limit
  (`src/bff/rateLimit.ts`, fixed window, no new dependency).
- **Automated bucket-filling is NOT currently bounded — owner-accepted risk, corrected 2026-07-14
  after an independent review.** An earlier version of this entry claimed the per-session object cap
  was "the real ceiling against bucket-filling" and that orphan growth was bounded to a few hundred
  MB/year. **Both claims were false**, and the error is worth recording because it justified one
  weak control with another: `clientSubmissionId` is *caller-chosen*, so an automated caller simply
  mints a fresh UUID per upload and never approaches the 12-object cap (which bounds an honest
  session, not a hostile one); and the only cross-session control is the in-memory per-IP limiter,
  which is per-instance on Vercel's multi-instance runtime and therefore not a bound either.
  Concurrent uploads under one id can also all observe the same pre-upload count and pass the cap
  check before any write lands. **What is actually true:** the controls above bound the *size* of any
  single object and the *shape* of what can be stored (real images only), but nothing currently
  bounds the *number* of objects an automated caller can create. Accepted for now — the site is not
  publicly launched, takes ~5–20 real requests/week, and the bucket is private with no read path for
  the public. **Before public launch this must be closed** with one non-caller-resettable control
  (durable rate limiting via Upstash/Vercel KV, a server-issued upload capability with a durable
  quota, or platform-level protection) — tracked in PROJECT_BACKLOG.md. Adding it now was rejected
  only on dependency cost, not on principle.
- **Rejected: direct-to-Supabase signed upload URLs.** `storage.objects` RLS is enabled with zero
  policies (Stage 5A, verified live) — this would require a new Storage access policy, move
  validation client-side (bypassable by a scripted attacker), and put a storage path in the
  browser. **Caveat added 2026-07-14:** this rejection is what forces every byte through a Vercel
  Function, which is what caps the per-file size at 4 MB (below). If the size ceiling ever becomes
  the binding product constraint, this is the decision to revisit — the trade is "no browser-side
  Supabase access" against "files must fit through a serverless function".

### Per-file size ceiling: 4 MB, and why it is not 10 MB (owner decision 2026-07-14)

FS §4.3 originally specified 10 MB per file. **That was not deliverable on this hosting and was
amended to 4 MB** (FS §4.3 updated first, then the code — PRD §9 change control). The constraint is
the platform, not a preference: **Vercel Node Functions reject any request body over 4.5 MB at the
edge, before application code runs.** Since the design routes every upload through a Function (see
the rejection above), a 10 MB file could never reach `validateSingleFile` — the endpoint would have
advertised a limit it structurally could not honor. Found by an independent review, not by the
in-session pipeline: the route's unit tests call `POST()` directly with a mocked `formData()`, which
bypasses the platform entirely, so no test could have caught it.

- **Per file, not per submission.** Each file is uploaded in its own request (one file per
  `POST /api/upload`), so 9 files of 4 MB are 9 independent requests and never sum against the
  limit. The final `POST /api/request` carries only text plus opaque handle strings — kilobytes.
- **Enforced on both sides**: the client checks before sending (an oversized body dies at the edge
  with an opaque failure, so the visitor would otherwise wait out a doomed upload), and the server
  checks again because the client cannot be trusted. The constant lives once, in
  `src/features/request/config` — the shared, isomorphic layer both sides already read.
- **Accepted residual risk:** a high-resolution phone photo (a 48 MP JPEG, or an unconverted HEIC)
  can exceed 4 MB, and such a visitor must reduce it themselves — the error message says so plainly.
  Expected inputs (Instagram screenshots, reference images, ordinary phone photos of a body area)
  sit well under the limit. **Client-side compression is permitted by FS §4.3 but is not implemented
  in Stage 6** — it would let a visitor submit any-size file transparently, and is the natural fix
  if the residual risk proves real. Deferred pending research (PROJECT_BACKLOG.md): it needs a
  decision on what to compress (only files over the limit, preserving originals otherwise), what
  quality is adequate for judging a tattoo design, and how to handle HEIC, which browsers cannot
  decode natively.

## 2. Client-side handle and `clientSubmissionId` lifecycle

A plain module-level singleton store (`src/features/request/store/requestDraft.ts`), read via
`useSyncExternalStore` (`useRequestDraft.ts` — React built-in, no new dependency). Not React
context: a context Provider would need mounting at the layout level, pushing a client-boundary
concern onto the whole public layout for no benefit a module singleton doesn't already give.

- `clientSubmissionId` is generated **once, lazily**, on first store access — replacing the shipped
  `useState(() => crypto.randomUUID())` in `RequestForm.tsx`, which regenerated on every mount and
  could not survive a navigation.
- Per-file client state (`UploadSlot`): `slotId`, `category`, the retained `File` (for retry),
  `previewUrl`, `status` (`uploading | uploaded | failed`), `progress`, and `handle` once uploaded.
  No storage path is ever held client-side.
- Module state survives client-side navigation by construction (the module isn't re-evaluated) and
  is lost on reload — exactly D-Blueprint 5(a)'s guarantee boundary, with no invalidation code
  needed. It also gives Item 4's Success-page gate its "refresh → redirect to Home" behavior for
  free.
- **Reset (`resetDraft()`) happens only on a successful submit**: revokes preview object URLs,
  clears slots, and mints a **fresh** `clientSubmissionId` (so a second request in the same session
  isn't collapsed into the first by idempotency). It does **not** reset on submit failure — FS §4.5
  requires entered data and uploaded images preserved in place for retry.
- **Implementation note for future work on this store:** with `reactCompiler: true`, every mutation
  must replace the state object rather than mutate in place, so `getSnapshot()` stays referentially
  stable between writes — otherwise `useSyncExternalStore` loops.

## 3. Three upload categories

Replaces `FileType = "reference" | "placement"` with `UPLOAD_CATEGORIES = ["artist_work",
"inspiration", "placement_photo"]` (`src/services/storage.ts`), matching FS §4.2 fields 5–7 exactly.

- `placement_photo`, not `placement` — deliberately distinct from the unrelated `requests.placement`
  body-area column, and changing both category strings (not just adding the third) turns every
  leftover `"reference"`/`"placement"` literal into a compile error, which is how "no code path
  still assumes two categories" is enforced by the type checker.
- **DB migration** `supabase/migrations/20260714025850_three_upload_categories.sql`: drops and
  re-adds the `request_files.type` CHECK constraint (verify the auto-generated constraint name live
  before applying, per "Database Stage Completion Criteria"), with a backfill (`reference` →
  `artist_work`, `placement` → `placement_photo`; owner-confirmed 2026-07-14 that all live rows are
  test/dev data, so the `reference` split is an engineering call, not a product one). **No change
  to the `create_request` RPC** — it writes `p_files[].type` verbatim as JSONB, so only the
  constraint changes; this avoids the Stage 5A staging-environment gate that a RPC signature/
  behavior change would otherwise trigger.
- **Storage path scheme changes** from `{studioId}/{csid}/{type}/{type}-{NN}.{ext}` (a positional
  index, only knowable for a complete batch) to `{studioId}/{csid}/{category}/{uuid}.{ext}` (a
  server-generated UUID per object) — required because selection-time upload has no batch: files
  arrive one at a time, can be removed/retried out of order, and a positional index risks two
  concurrent uploads computing the same name.
- **Admin viewer** (`RequestImageViewer.tsx`) takes a `groups: { title, files }[]` prop instead of
  fixed `referenceFiles`/`placementFiles` pairs — three groups instead of two, same signed-URL and
  per-file-unavailable behavior.

## 4. Per-file progress, retry, remove

State machine per `UploadSlot`: born `uploading` on selection (FS §4.3 — upload starts immediately,
no `idle` state), transitions to `uploaded` (handle set) or `failed` (retryable with the same
retained `File`, producing a new object/handle) or is removed.

- **Remove deletes nothing server-side** — this was reconsidered during design (an earlier instinct
  favored immediate deletion) and rejected: a delete-by-handle endpoint would be a second public
  unauthenticated write surface whose only job is destruction, and holding an unexpired handle would
  be sufficient to delete — a griefing vector (replay a captured handle to destroy a victim's
  in-flight file before they submit) that the design otherwise doesn't have. The only benefit is
  avoiding an orphaned Storage object, and orphan cleanup is already accepted, tracked, out-of-scope
  operational debt (PROJECT_BACKLOG.md). Not worth a new endpoint at this volume.
- **Submit waits for in-flight uploads to settle** (owner decision — FS §4.5 is silent on this
  specific case): the CTA shows a sending state until every `uploading` slot resolves, then submits
  whatever is `uploaded`. A `failed` slot still never blocks submission (FS §4.5) — it is simply
  skipped once resolved.

## 5. Final-submit adoption

`POST /api/request` drops the `referenceImages`/`placementImages` File fields and gains a repeated
`uploadHandles` field. `src/bff/adoptUploads.ts` — `adoptUploadHandles(handles, clientSubmissionId,
studioId)` — decrypts each handle, checks `payload.csid === clientSubmissionId` (**the ownership
check**: not "any file with this id exists", but "this exact session minted this exact handle"),
checks TTL and the studio+session path prefix, enforces per-category (≤3) and total (≤9) caps, and
dedupes by path. Any invalid handle rejects the whole submit (400) — a server-minted handle can only
fail these checks if tampered, replayed cross-session, or expired, so silently dropping it would make
a visitor's images vanish from a request they believed included them; this is not the FS §4.5
per-file-upload-failure case, which concerns upload failures, not a corrupt token.

**Rejected: a `pending_uploads` DB table**, adopted by `WHERE client_submission_id = $1`. It doesn't
by itself satisfy the ownership requirement (an attacker who knows a victim's id can still insert a
row via `/api/upload` and have it adopted) — closing that gap still requires a per-file secret
returned to the client, arriving back at tokens plus a table, plus a new migration/grants and an
orphan-*row* problem on top of the orphan-*object* one. **Rejected: Storage-listing the session's
path prefix at submit** — this is the vulnerable design the token model exists to avoid.

### The regression this design required removing

Both `cleanupRequestFiles()` calls in the old `app/api/request/route.ts` — on the Postgres unique-
violation race and on a generic DB-insert failure — **are removed, not preserved**. Under batch
upload-at-submit, cleanup-on-failure was safe because the files belonged only to the failing
request. Under selection-time upload, files are uploaded *before* submit; on a race, the losing
request's cleanup call would delete the **winning** request's live files, because both point at the
identical storage paths. On a generic DB failure, the visitor's retry needs the same files at the
same paths to succeed. `cleanupRequestFiles` survives only as the primitive for a future orphan-
cleanup job. Regression-tested explicitly in `app/api/request/__tests__/route.test.ts`.

## 6. Orphaned uploads

**Orphaned** = a Storage object with no `request_files` row referencing its path. Now precisely
definable given the handle model: abandoned forms (the dominant source, anticipated by D-Blueprint
5(a)), client-side removes, timeout-after-success retries, expired handles, and any attacker upload
that never gets a matching session to submit it. **No cleanup job is implemented** — already tracked
in PROJECT_BACKLOG.md ("Orphaned Storage Objects") as post-launch/operational and explicitly out of
this task's scope.

**Honest bound (corrected 2026-07-14 — the first version of this line was wrong).** For *legitimate*
traffic, orphan volume is small and self-limiting: the per-session object cap plus the per-file size
ceiling bound what one honest visitor's abandoned form can leave behind, and at ~5–20 requests/week
that is negligible. For *hostile* traffic, orphan volume is **not bounded at all** — see §1: the
per-session cap is caller-resettable (a fresh `clientSubmissionId` per upload) and the in-memory
rate limiter is per-instance. The earlier claim that these controls kept total orphan volume to "a
few hundred MB/year" conflated the two cases and is withdrawn. Closing the hostile case (a
non-caller-resettable control, pre-launch) is what makes the orphan story bounded; until then, the
accepted position is that automated storage growth is unbounded and the mitigation is that the site
is unlaunched.

## Dependencies

**No new dependency.** AES-256-GCM via Node's built-in `node:crypto`; progress/abort via
`XMLHttpRequest`; the client store via React's built-in `useSyncExternalStore`; rate limiting via a
module-level `Map`. One new required env var: `UPLOAD_TOKEN_SECRET` (documented in `.env.example`;
rotating it invalidates in-flight handles, bounded by the ~2h TTL).

---

# Stage 6 Contact Model — decided 2026-07-15 (supersedes the FS §4.2 three-method model)

Owner decision, raised during IMPL Task 03 (request-form rebuild) when the contact block turned out
to exceed FS §4.2 — a product change, escalated to STRAT per Stage 6 Product Documentation Authority
(engineers do not resolve open product questions in implementation). It **changes the Source of
Truth**: FS §4.2 (field 9 + value fields), FS §A.2 (channel notes), FS §A.4 (fallback line), and PRD
D3 were reconciled in the same change (PRD §9 change control — the spec is edited first, then
implementation). Recorded as a first-class product decision.

- **Decision — five contact methods, one chosen per request.** The Contact-method select (FS §4.2
  field 9) offers **Email, Phone (call), WhatsApp, Instagram, Telegram**. Phone and WhatsApp are
  **deliberately separate** methods, not merged: a phone number means "call me", a WhatsApp number
  means "message me" — the artist wants to know which. Exactly **one** method is chosen and its one
  value field is revealed (unchanged from FS's reveal-one-field model — only the method count grows
  from 3 to 5). This supersedes the shipped WhatsApp/Email/Instagram set.
- **Offered method set is per-studio configurable.** The list of methods the select offers is a
  **per-studio configuration**, not hard-coded. For Stage 6 it lives in **code config, in the
  request feature** (`src/features/request/config` — the isomorphic feature config alongside
  `AGE_THRESHOLD` and the option arrays, NOT `src/config` which is server-only and cannot reach the
  client that renders the select). A studio can therefore offer a subset (e.g. no Telegram) without
  a code change to the form itself, only to the config. **No admin UI** for this in Stage 6 — an
  admin-managed method set is a post-release backlog item (PROJECT_BACKLOG.md).
- **Storage — five dedicated nullable columns.** The `requests` table gains five columns
  (`email`, `phone`, `whatsapp`, `instagram`, `telegram`), replacing the shipped three
  (`email` / `phone` / `contact_other`). Since exactly one method is chosen per request, **four of
  the five are NULL in every row** — this is an accepted trade-off, chosen for explicitness and
  type-safety over a compact `contact_method` + `contact_value` pair. **Recorded so a later session
  does not "optimize" it back to two columns unaware the compact form was considered and rejected:**
  the five-column shape makes the admin card render trivially (show the non-null columns) and makes
  each method a first-class, individually-typed field; the compact pair was rejected as less
  explicit even though it avoids a migration per future method. Adding a sixth method later IS a
  migration under this decision — accepted, given how rarely the method set changes.
- **Admin card renders only the filled method(s).** The admin request-detail card shows only the
  contact column(s) that are non-null — empty methods take no space. Method-agnostic by
  construction, so a future method needs no admin-card change.
- **Phone / WhatsApp validation** (both are phone numbers): E.164, Israeli formats with or without
  +972, normalized to E.164 on submit — already owner-fixed, not reopened by this decision.
  Instagram: handle charset, leading `@` stripped. ~~Telegram: treated as a handle/username, same
  `@`-strip and username charset as Instagram~~ — **superseded 2026-07-16, see the validation
  amendment below.**

## Contact-validation amendment — decided 2026-07-16 (research-informed)

Three owner decisions taken on the strength of
`research/done/RESEARCH_2026-07-16_contact-model-validation-and-decomposition.md` (Codex, with an
owner-carried external pass). Recorded because each **changes** what the entry above said or adds a
cost the entry did not anticipate.

- **Telegram is validated by Telegram's rule, not Instagram's — the entry above was factually
  wrong.** Telegram usernames are **5–32 chars, ASCII letters/digits/underscore only, no dots, and
  must not start with a digit** (`account.checkUsername` + client error strings); Instagram allows
  dots and 1–30. Implemented as `^(?![0-9])[A-Za-z0-9_]{5,32}$` after trim + one optional `@`-strip
  — the variant permitting a leading underscore, since no rule prohibiting one was found and the
  stricter letter-first form risks rejecting a real handle. Reusing the Instagram regex was rejected:
  it is a **false-accept** risk (the request persists, the artist cannot reach the visitor — the
  Success echo then reassures with an unusable destination). FS §4.2 field 10e amended first
  (docs-first, PRD §9). **Instagram itself stays `^[A-Za-z0-9._]{1,30}$`** with **no** dot-position
  rules — the research found no authoritative Meta grammar for leading/trailing/consecutive dots, so
  adding them would enforce unverified rules and only risk false rejections.
- **`libphonenumber-js` (max metadata) is adopted as a new dependency**, used **isomorphically** in
  the shared schema: `parsePhoneNumberFromString(raw, "IL")` → require `country === "IL"` and
  `isValid()` → persist `.number` (E.164). Cost accepted: the schema is imported by the client form,
  so the metadata lands in the client bundle. Rejected alternatives: a hand-rolled Israel-only
  normalizer (a "strip punctuation, replace leading 0" transform normalizes garbage into a
  plausible-looking number, accepts unallocated ranges, and mishandles `00972`/foreign input — the
  project would own prefix allocation forever); and library-on-server-only, which creates two
  validation semantics and breaks the client/server parity this task exists to hold. `isValid()`
  over `isPossible()` — fewer unreachable numbers, at the price of a possible false rejection of a
  brand-new range before a metadata update. The Phone method accepts **any valid Israeli number**
  (geographic, mobile, recognized `07`), not mobile-only. **The installed version's real API/import
  path and accept-form behavior must be proven by tests, not assumed** — the research's version and
  bundle-size figures were external and unverified.
- **Existing rows are deleted, not backfilled, and a DB `CHECK` enforces exactly one of five.** The
  old model allowed zero **or several** contacts, so historical rows cannot be assumed to satisfy the
  new invariant, and `contact_other`'s free text does not reliably map to Instagram vs. Telegram. The
  data is test-only (5A.3 classification), so a clean start is simpler and stronger than a guessed
  backfill. The `CHECK` puts the decided "exactly one" invariant below the application layer instead
  of trusting Zod/TypeScript alone. Deletion is destructive and therefore takes its **own explicit
  owner approval at apply time**, separate from the migration approval.

**Implementation shape (from the same research, adopted):** the public/service contract is
`contactMethod` + `contactValue` (which `SuccessPayload` already mirrors), mapped to the five
nullable SQL params at the service/adapter boundary — so zero/multi-method states are unrepresentable
in TypeScript rather than merely discouraged. The server validates the submitted method against the
**configured per-studio offered set**, not just the five-value enum. The Zod resolver hands the form
the *transformed* value, so the raw entered string is preserved alongside the normalized one — FS
§3.4 requires the Success echo to show the value **as entered**, while persistence needs it
normalized.
- **Success contact echo (FS §3.4 item 4) needs no change.** It is already method-agnostic and
  already names Telegram as an example future method — it renders whatever method the submitted
  request carries. Confirmed, not amended.
- **Fallback line (FS §A.4) stays Instagram-specific.** The last-resort "the form is broken, message
  me directly" line still points to Instagram regardless of which method the visitor chose. Reason:
  the fallback exists precisely because the submission channel failed, so it cannot route through the
  method the visitor picked (that method's value was never submitted). Instagram is the primary
  acquisition channel (PRD D1), certain to exist and public. So the fallback is independent of the
  five-method model by design.
- **PRD D3 unchanged.** "The artist replies using the contact information the visitor provided" is
  already method-agnostic; five methods do not conflict with it. Noted, not amended.
- **Migration note.** IMPL Task 03 Phase 1 already recreated `create_request`
  (`20260715124427_stage6_reference_code_format.sql`) with the three contact params. The contact
  model's migration (Task 03 Block C) recreates it **again** with the five contact columns/params —
  the second RPC recreation in this task. The Stage 5A staging gate on `create_request` changes is
  waived for Stage 6 (single prod project, test-only data — owner decision 2026-07-15, same basis as
  the reference-code change).

**Implementation:** IMPL Task 03 Block C (`STAGE_6_TASK_03_request_form_rebuild.md`, Phase 3),
which was frozen pending this decision and now proceeds against it.

---

# Rule for Future Changes

All architectural, product, or behavioral decisions MUST be recorded in this document.

Any decision in this document may be changed only when explicitly updated by the developer.

---

If implementation contradicts this document, implementation must be stopped and clarified.
