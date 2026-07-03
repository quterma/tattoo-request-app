Purpose  
Describe the project structure and code organization.

Scope  
Folders, layers, and import boundaries.  
No business logic or system behavior.

Audience  
AI agents and developers working with the codebase.

---

# Project Structure

The project follows a feature-oriented structure with shared modules and clear boundaries.

---

# Root Structure

/src  
 /app  
 /features  
 /shared  
 /services  
 /bff  
 /config  
 /types

---

# Folder Responsibilities

### app/

- Next.js App Router
- route groups (public, admin)
- layouts and pages
- route composition only
- api/ — Next.js Route Handlers (BFF endpoints)

#### app/[locale]/(admin)/admin/(protected)/layout.tsx

- Admin layout server component — auth gate for all protected `/[locale]/admin/` routes
- Calls `getAuthenticatedStudioMember()` with the current request cookies
- No session → redirects to `/${locale}/admin/login`
- Session but no `studio_members` row → renders unauthorized message (i18n: `admin.unauthorized`)
- Session + `studio_members` row → renders header (with Sign out) + children
- Login page is intentionally outside this route group to prevent redirect loops
- All UI strings routed through `getTranslations({ locale, namespace: "admin" })`

#### app/[locale]/(admin)/admin/(protected)/page.tsx

- Admin request list page — Server Component, route `/[locale]/admin`
- Independently calls `getAuthenticatedStudioMember()` (re-verifies rather than trusting the
  layout); redirects to `/${locale}/admin/login` on `unauthenticated`
- Calls `listRequestsForStudio(studioId)` only after a successful auth check; does not catch
  DB/service errors — they propagate to `error.tsx`
- Renders `RequestList` (from `@/features/admin/ui`) inside `Page`/`Section` (`@/shared/ui`)
- All UI strings routed through `getTranslations({ locale, namespace: "admin" })`, passed down
  as props (`t`, `locale`) to `RequestList`/`RequestCard`

#### app/[locale]/(admin)/admin/(protected)/loading.tsx

- Route-level loading state — Server Component, data-free
- Renders `RequestListSkeleton` (from `@/features/admin/ui`) inside `Page`/`Section`

#### app/[locale]/(admin)/admin/(protected)/error.tsx

- Route-level error boundary — Client Component (required by Next.js)
- Generic translated message only (`admin.requestListErrorTitle`/`requestListErrorMessage`); no
  DB/internal details exposed
- Includes a reset/retry button wired to the `reset` prop Next.js provides to error boundaries

#### app/[locale]/(admin)/admin/(protected)/actions.ts

- `logoutAction(locale)` — server action
- Calls `supabase.auth.signOut()` via SSR auth client with writable cookies
- Redirects to `/${locale}/admin/login`
- Terminates authentication only; no `studio_members` writes, no authorization logic

#### app/[locale]/(admin)/admin/(protected)/SignOutButton.tsx

- Sign out button — Client Component
- Renders a form wired to the locale-bound `logoutAction`
- `label` (translated `admin.signOut` string) passed as a prop from the Server Component parent — Client Components in this tree do not call `getTranslations` themselves

#### app/[locale]/(admin)/admin/login/page.tsx

- Login page — Server Component
- Checks Supabase session via `getOptionalUser()`: authenticated user → redirect to `/${locale}/admin`
- Renders inline message when `?reset=success` is present (i18n: `admin.resetSuccess`)
- Renders `LoginForm` (Client Component) for unauthenticated users, passing translated label props
- Passes locale-bound `loginAction` to the form
- Link to `/${locale}/admin/forgot-password`
- All UI strings routed through `getTranslations({ locale, namespace: "admin" })`

#### app/[locale]/(admin)/admin/login/LoginForm.tsx

- Login form — Client Component
- Uses `useActionState` to wire the `loginAction` server action
- Displays inline error on invalid credentials
- Label/button text (`emailLabel`, `passwordLabel`, `signInButton`, `signInButtonLoading`, `googleButton`) passed as props from `page.tsx` — translated server-side, not fetched by the Client Component itself

#### app/[locale]/(admin)/admin/login/actions.ts

- `loginAction(locale, prev, formData)` — server action
- Calls `supabase.auth.signInWithPassword()` via SSR auth client with writable cookies
- On success: redirects to `/${locale}/admin`
- On failure: returns `{ error: t("loginInvalidCredentials") }` via `getTranslations({ locale, namespace: "admin" })` (no technical details exposed)
- `googleLoginAction(locale)` — server action
- Calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } })` via SSR auth client with writable cookies (PKCE code verifier persisted to cookies)
- Origin derived via `getRequestOrigin(headers)` (see `services/supabaseAuth.ts`)
- `redirectTo` points at `app/auth/callback/route.ts` with `?locale=` appended so locale survives the round trip through Google and Supabase
- On success: redirects the browser to the returned Google consent URL
- On failure: redirects to `/${locale}/admin/login?error=oauth`

#### app/auth/callback/route.ts

- Fixed non-locale OAuth callback route
- Reads `code` and `locale` query params; exchanges the code for a session via `supabase.auth.exchangeCodeForSession()` (SSR auth client, writable cookies)
- Redirects to `/${locale}/admin` (falls back to `defaultLocale` if `locale` param is missing/unsupported)
- No authorization logic; no business logic — admin layout performs the authorization check after redirect

#### app/[locale]/(admin)/admin/forgot-password/page.tsx

- Reset-link request page — Server Component, outside `(protected)`
- Renders inline expired/invalid-link message when `?error=reset` is present
- Renders `ForgotPasswordForm` (Client Component) with locale-bound `forgotPasswordAction` and translated label props
- Link back to login
- All UI strings routed through `getTranslations({ locale, namespace: "admin" })`

#### app/[locale]/(admin)/admin/forgot-password/ForgotPasswordForm.tsx

- Reset-link request form — Client Component
- Uses `useActionState` to wire `forgotPasswordAction`
- On `{ sent: true }`, replaces the form with a generic "if this email exists…" message (i18n: `admin.resetLinkSentMessage`) — same message shown regardless of whether the email matched an account
- Label/button/message text passed as props from `page.tsx`

#### app/[locale]/(admin)/admin/forgot-password/actions.ts

- `forgotPasswordAction(locale, prev, formData)` — server action
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })` via SSR auth client with writable cookies
- Origin derived via `getRequestOrigin(headers)` (see `services/supabaseAuth.ts`)
- `redirectTo` points at `app/auth/reset-callback/route.ts` with `?locale=` appended
- Always returns `{ sent: true }` regardless of the Supabase result — never reveals whether the email exists

#### app/auth/reset-callback/route.ts

- Fixed non-locale password-recovery callback route — separate from `app/auth/callback/route.ts` (OAuth-only)
- Reads `code` and `locale` query params; exchanges the code via `supabase.auth.exchangeCodeForSession()` (SSR auth client, writable cookies)
- Missing code or exchange error → redirects to `/${locale}/admin/forgot-password?error=reset`
- On success → redirects to `/${locale}/admin/reset-password`
- No authorization logic; no business logic

#### app/[locale]/(admin)/admin/reset-password/page.tsx

- New-password page — Server Component, outside `(protected)`
- Checks for an active Supabase session via `getOptionalUser()` (read-only cookie handler); no session → renders expired-link message (i18n: `admin.resetPasswordExpiredMessage`) with a link to `forgot-password`
- Session present → renders `ResetPasswordForm` (Client Component) with locale-bound `resetPasswordAction` and translated label props
- All UI strings routed through `getTranslations({ locale, namespace: "admin" })`

#### app/[locale]/(admin)/admin/reset-password/ResetPasswordForm.tsx

- New-password form — Client Component
- Password + confirm password fields; `minLength={6}` HTML attribute (matches Supabase's default minimum); no client-side validation library
- Uses `useActionState` to wire `resetPasswordAction`; displays inline error on failure
- Label/button text passed as props from `page.tsx`

#### app/[locale]/(admin)/admin/reset-password/actions.ts

- `resetPasswordAction(locale, prev, formData)` — server action
- Validates both fields present and matching before calling Supabase (generic error message via `getTranslations({ locale, namespace: "admin" })`, no technical details)
- Calls `supabase.auth.updateUser({ password })` via SSR auth client with writable cookies
- On success: immediately calls `supabase.auth.signOut()`, then redirects to `/${locale}/admin/login?reset=success`
- On failure: returns a generic translated error; no technical details exposed

#### proxy.ts (project middleware entry point)

- Located at the project root as the Next.js middleware file
- **This is the only Next.js middleware file.** Do not create a parallel `middleware.ts`.
- Currently handles next-intl locale routing
- Extended in Stage 4A with Supabase SSR session cookie refresh
- Admin redirects added here must be locale-aware
- Matcher excludes `/auth` (in addition to `/api`, `/_next`, `/_vercel`) so the fixed non-locale `/auth/callback` route is not redirected into a locale-prefixed path

---

### features/

- feature-specific logic and components
- isolated by domain (e.g. request, admin)
- feature UI, logic, and local state

Current features:

#### features/request/

- config/ — form constants (field options, file limits)
- lib/ — error helpers (MESSAGE_TO_I18N_KEY, getFieldError, getContactGroupError)
- types/ — RequestFormData type inferred from zod schema
- validation/ — zod schema with all form fields, cross-field rules, and VALIDATION_KEYS constants
- ui/ — RequestForm (RHF + zodResolver, submit state machine, server error mapping) and form primitives

#### features/admin/

Stage 4B (reduced scope) — see PROJECT_DECISIONS.md, Stage 4B Admin Dashboard Architecture.

- types/ — `AdminRequestListItem`, `RequestStatus` (owned by `services/db.ts`), `AdminRequestDetail`, `AdminRequestFile` (owned by `services/requests.ts`) — all re-exported from `@/services`; `features/admin/types` is the feature-facing import point, not the owner of any of these
- config/ — `REQUEST_STATUS_OPTIONS` re-exported from `@/services`, same reasoning as types/
- ui/ — admin request list components (Stage 4B.4); detail/status-update UI still planned
- No top-level `features/admin/index.ts` — matches the existing `features/request/` pattern, which also has no top-level public API file; each subfolder (`types/`, `config/`, `ui/`) is its own import point

#### features/admin/ui/

- `RequestCard` — receives a single `AdminRequestListItem` plus `locale` and a server-obtained
  `t` (`getTranslations` return value) as props; the whole card is one semantic `Link` (from
  `@/shared/i18n`, locale-aware) to `/admin/requests/[id]` (DB UUID) — not a clickable div; shows
  referenceCode + status first, client name prominent, placement/size/color compact, created date
  secondary; status/placement/size/color are looked up via `t.has(...)` against
  `admin.statuses.*`/`admin.placementLabels.*`/`admin.sizeLabels.*`/`admin.colorLabels.*`, falling
  back to the raw stored value if a label is missing; created date formatted via
  `Intl.DateTimeFormat(locale, {...})`, not string slicing
- `RequestList` — maps `AdminRequestListItem[]` to `RequestCard`s inside a `<ul>`; renders
  `EmptyState` when the list is empty; receives `locale`/`t` and passes them through to each card
- `RequestListSkeleton` — data-free placeholder list (5 skeleton cards), `aria-hidden="true"`;
  used by both `RequestList`'s loading equivalent and the route's `loading.tsx`
- `EmptyState` — generic message-only empty state; local to `features/admin/ui` since no
  suitable shared equivalent exists in `src/shared/ui`
- Barrel: `features/admin/ui/index.ts` exports all four
- **Label ownership note:** `admin.placementLabels`/`sizeLabels`/`colorLabels` are presentation
  text only, keyed by the value strings already owned by `features/request/config`
  (`PLACEMENT_OPTIONS`/`SIZE_OPTIONS`/`COLOR_OPTIONS`); `features/admin` does not import
  `features/request` (forbidden — features must not depend on other features directly) and does
  not read the `request` i18n namespace either, to avoid a silent cross-feature coupling

---

### shared/

- reusable UI components
- hooks
- utilities
- i18n
- styles
- test helpers

`shared/i18n/messages/en.json` namespaces include `admin` — all admin/auth UI strings (login, forgot-password, reset-password, protected-layout header/unauthorized message). Server Components use `getTranslations({ locale, namespace: "admin" })` from `next-intl/server`; Server Actions call it the same way, keyed by the `locale` param already passed to every action; Client Components receive translated strings as props from their Server Component parent rather than calling `useTranslations` themselves.

---

### services/

- external service clients
- server-side only

Current modules:

#### services/supabase.ts

- `supabase` — server-side Supabase client (service role, no session persistence)
- Used for all DB and Storage operations
- Must never be exposed to the client

#### services/supabaseAuth.ts

- `createSupabaseAuthClient(cookies)` — factory that creates an SSR Supabase client using `@supabase/ssr`
- Accepts a `CookieHandler` (getAll/setAll) so it can be used from both middleware and server components
- Used only to verify session identity (session checks, cookie refresh)
- Must not be used to query `requests`, `request_files`, or admin data
- `getRequestOrigin(headers)` — derives the request origin (`protocol://host`) for use in `redirectTo` URLs (Google OAuth, password reset); prefers `x-forwarded-host`/`x-forwarded-proto` (reverse-proxy-set, not client-controlled in production) over the raw `Host` header; shared by `googleLoginAction` and `forgotPasswordAction` to avoid duplicated origin-derivation logic

#### services/auth.ts

- `getOptionalUser(cookies)` — returns the current Supabase Auth user, or `null` if there is no session; `AuthSessionMissingError` is treated as "no user" (returns `null`), any other error is an infrastructure failure and is rethrown; used directly by `login/page.tsx` and `reset-password/page.tsx` for session-presence checks, and internally by `getAuthenticatedStudioMember`
- `getAuthenticatedStudioMember(cookies)` — verifies Supabase Auth session (via `getOptionalUser`) + `studio_members` row
- Returns `AuthResult`: `{ ok: true, userId, studioId }` | `{ ok: false, reason: "unauthenticated" | "unauthorized" }`
- Expected auth failures are business outcomes (ok: false); infrastructure errors throw
- Must be called by all Stage 4B route handlers before any data access

#### services/storage.ts

- `uploadRequestFiles(files, clientSubmissionId)` — uploads reference and placement images to Supabase Storage; per-file retry, cleanup on failure
- `UploadedFile`, `FileType` — exported types
- `createSignedRequestFileUrl(storagePath)` — generates a signed URL for a private `request-images` file via the service_role client; explicit 3600-second (~1 hour) expiry; throws on Supabase signing error. Internal-only — not re-exported from `src/services/index.ts`; the only caller is `services/requests.ts`, which is responsible for ensuring `storagePath` came from an already studio-scoped query before calling this

#### services/db.ts

- `createRequest(params)` — calls `create_request` RPC; atomically inserts request + files, returns `{ id, referenceCode }`
- `getRequestByClientSubmissionId(clientSubmissionId)` — looks up existing request by `clientSubmissionId`; returns `referenceCode` string or `null`
- `CreatedRequest` — exported type
- `REQUEST_STATUS_OPTIONS` — readonly tuple of allowed `requests.status` values (`"new" | "active" | "booked" | "completed" | "rejected"`), source of truth for the `RequestStatus` type; mirrors the DB `CHECK` constraint on `requests.status`. See PROJECT_DECISIONS.md — Request Status Semantics for what each value means and why `in_progress` was rejected.
- `RequestStatus` — exported type, derived from `REQUEST_STATUS_OPTIONS`
- `AdminRequestListItem` — exported DTO type for the admin request list (`id`, `referenceCode`, `clientName`, `placement`, `size`, `color`, `status`, `createdAt`); intentionally excludes `studioId`, raw DB row fields not needed by the list UI, file data, and any Stage 4C fields (notes, unread, metrics)
- `listRequestsForStudio(studioId)` — queries `requests` filtered by `studio_id = studioId`, ordered by `created_at` descending, selecting only the columns needed for the list DTO; maps each row through an internal `mapRequestListRow()` (snake_case → camelCase, narrows `status` to `RequestStatus`, throws on an unrecognized status value); throws on Supabase error
- `getRequestForStudio(studioId, requestId)` — queries a single `requests` row filtered by both `id = requestId` and `studio_id = studioId`, with a nested `request_files(...)` relationship select; returns `null` for both a missing request and a request belonging to a different studio — the two cases are indistinguishable at this layer by design (the `.eq("studio_id", ...)` filter simply excludes cross-studio rows from matching at all, there is no separate branch to distinguish them); maps the row (and nested files) through an internal `mapRequestDetailRow()`; throws on Supabase error. Does not query by `referenceCode`
- `RequestDetailDbRecord`, `RequestFileDbRecord` — **internal-only** types, not `export`ed even from `db.ts` itself (module-private); `RequestDetailDbRecord.files[].storagePath` is a raw Storage path and must never cross the service-layer boundary. `services/requests.ts` consumes `getRequestForStudio()`'s return type by inference only and is its only caller
- **Layering note:** `AdminRequestListItem`, `RequestStatus`, and `REQUEST_STATUS_OPTIONS` are defined here, not in `src/features/admin/types`/`config`, because `services` must not import from `features` (see Dependency Direction below) while `db.ts` owns the query and the row→DTO mapping. `src/features/admin/types` and `src/features/admin/config` re-export these from `@/services` for feature-facing consumption — see those entries below.

#### services/requests.ts

- Thin server-only orchestration module — composes `db.ts` (data) + `storage.ts` (signed URLs) into the final safe admin-facing DTO. This is the one exception to "no `services/admin.ts`" (see PROJECT_DECISIONS.md — Stage 4B Admin Dashboard Architecture): it exists specifically because this operation spans two external providers (DB + Storage) and must hide internal Storage data (`storagePath`) from anything crossing out of `src/services/`. It is not a feature-oriented service split — `db.ts`/`storage.ts` still own their respective external systems
- `getAdminRequestDetail(studioId, requestId)` — calls `getRequestForStudio(studioId, requestId)`; returns `null` immediately if that returns `null` (no signing attempted); otherwise signs each file via `createSignedRequestFileUrl()` through `Promise.all`, where each file's signing has its own internal try/catch so one file's failure cannot reject the whole detail result
- On a per-file signing failure: returns `{ status: "unavailable", id, originalName, type }` for that file (no `signedUrl`), logs `console.warn("[requests] file signing failed", { fileId, reason })` where `reason` is one of `"not_found" | "permission_denied" | "unknown"` (classified from the error message) — the raw `storagePath` and the raw Supabase error message are never logged
- `AdminRequestDetail`, `AdminRequestFile`, `AdminRequestFileFailureReason` — exported public types; `AdminRequestDetail` has no `storagePath` anywhere in its shape; `AdminRequestFile` is a discriminated union (`"available"` | `"unavailable"`) on `status`
- DB errors from `getRequestForStudio()` propagate uncaught — only per-file Storage signing failures are absorbed

---

### bff/

- backend-for-frontend layer
- request handling
- server-side logic
- Route Handlers and orchestration

Current modules:

#### bff/request.ts

- `ParsedRequestPayload` interface
- `parseRequestFormData()` — parses multipart/form-data from POST /api/request
- `validateRequestPayload()` — reuses requestFormSchema, returns typed ValidationResult

#### bff/validateFiles.ts

- `validateFiles()` — checks MIME type and size per file field, returns FileValidationResult

---

### config/

- environment configuration
- constants
- feature flags (if needed)

Current modules:

#### config/index.ts

- `config` — typed config object; reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY` from env; throws at load time if any required var is missing

---

### types/

- shared TypeScript types
- enums and DTO-like structures shared across layers

---

# Import Rules

- use aliases (e.g. @/\* → src/\*)
- avoid deep imports
- import through public module interfaces (`index.ts`) when such public API exists

---

# Dependency Direction

Allowed:

- app → features, shared, config, types
- features → shared, services, config, types
- bff → services, config, types, features/*/validation
- services → config, types
- shared → config, types
- config → none
- types → none

Restricted:

- shared must not depend on services or features
- features must not depend on other features directly
- services must not depend on features or shared UI
- bff must not import from UI layers (ui/, components)
- UI must not depend on BFF
- no circular dependencies allowed

---

# Layer Mapping

The folder structure maps directly to architectural layers:

### Presentation Layer

- app/
- features/
- shared/ui

### Application Layer

- bff/
- services/

### Data Layer

- external systems (database, storage, Supabase)

This mapping must be respected when implementing features.

UI code must not access the data layer directly.

---

# Structure Principles

- keep modules isolated
- prefer composition over coupling
- avoid cross-layer dependencies
- maintain clear boundaries
- do not create new top-level folders without approval

---

# Update Rule

Update this document when files or folders are added, removed, moved, or when layer responsibilities change.
