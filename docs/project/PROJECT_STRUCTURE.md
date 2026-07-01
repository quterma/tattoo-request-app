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
- Session but no `studio_members` row → renders unauthorized message
- Session + `studio_members` row → renders header (with Sign out) + children
- Login page is intentionally outside this route group to prevent redirect loops

#### app/[locale]/(admin)/admin/(protected)/actions.ts

- `logoutAction(locale)` — server action
- Calls `supabase.auth.signOut()` via SSR auth client with writable cookies
- Redirects to `/${locale}/admin/login`
- Terminates authentication only; no `studio_members` writes, no authorization logic

#### app/[locale]/(admin)/admin/(protected)/SignOutButton.tsx

- Sign out button — Client Component
- Renders a form wired to the locale-bound `logoutAction`

#### app/[locale]/(admin)/admin/login/page.tsx

- Login page — Server Component
- Checks Supabase session on load: authenticated user → redirect to `/${locale}/admin`
- Renders `LoginForm` (Client Component) for unauthenticated users
- Passes locale-bound `loginAction` to the form

#### app/[locale]/(admin)/admin/login/LoginForm.tsx

- Login form — Client Component
- Uses `useActionState` to wire the `loginAction` server action
- Displays inline error on invalid credentials
- Shows "Signing in…" loading state while pending

#### app/[locale]/(admin)/admin/login/actions.ts

- `loginAction(locale, prev, formData)` — server action
- Calls `supabase.auth.signInWithPassword()` via SSR auth client with writable cookies
- On success: redirects to `/${locale}/admin`
- On failure: returns `{ error: "Invalid email or password." }` (no technical details exposed)
- `googleLoginAction(locale)` — server action
- Calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } })` via SSR auth client with writable cookies (PKCE code verifier persisted to cookies)
- `redirectTo` points at `app/auth/callback/route.ts` with `?locale=` appended so locale survives the round trip through Google and Supabase
- On success: redirects the browser to the returned Google consent URL
- On failure: redirects to `/${locale}/admin/login?error=oauth`

#### app/auth/callback/route.ts

- Fixed non-locale OAuth callback route
- Reads `code` and `locale` query params; exchanges the code for a session via `supabase.auth.exchangeCodeForSession()` (SSR auth client, writable cookies)
- Redirects to `/${locale}/admin` (falls back to `defaultLocale` if `locale` param is missing/unsupported)
- No authorization logic; no business logic — admin layout performs the authorization check after redirect

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

---

### shared/

- reusable UI components
- hooks
- utilities
- i18n
- styles
- test helpers

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

#### services/auth.ts

- `getAuthenticatedStudioMember(cookies)` — verifies Supabase Auth session + `studio_members` row
- Returns `AuthResult`: `{ ok: true, userId, studioId }` | `{ ok: false, reason: "unauthenticated" | "unauthorized" }`
- Expected auth failures are business outcomes (ok: false); infrastructure errors throw
- Must be called by all Stage 4B route handlers before any data access

#### services/storage.ts

- `uploadRequestFiles(files, clientSubmissionId)` — uploads reference and placement images to Supabase Storage; per-file retry, cleanup on failure
- `UploadedFile`, `FileType` — exported types

#### services/db.ts

- `createRequest(params)` — calls `create_request` RPC; atomically inserts request + files, returns `{ id, referenceCode }`
- `getRequestByClientSubmissionId(clientSubmissionId)` — looks up existing request by `clientSubmissionId`; returns `referenceCode` string or `null`
- `CreatedRequest` — exported type

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
