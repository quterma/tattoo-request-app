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

#### app/auth/callback/route.ts (planned — Stage 4A)

- Fixed non-locale OAuth callback route
- Exchanges Supabase auth code for a session; redirects to admin
- No authorization logic; no business logic

#### proxy.ts (project middleware entry point)

- Located at the project root as the Next.js middleware file
- **This is the only Next.js middleware file.** Do not create a parallel `middleware.ts`.
- Currently handles next-intl locale routing
- Stage 4A will extend it with Supabase SSR session cookie refresh
- Admin redirects added here must be locale-aware

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

#### services/supabaseAuth.ts (planned — Stage 4A)

- SSR/cookie-session Supabase client using `@supabase/ssr`
- Used only to verify session identity (session checks, cookie refresh)
- Must not be used to query `requests`, `request_files`, or admin data

#### services/auth.ts (planned — Stage 4A)

- `getAuthenticatedStudioMember()` — verifies Supabase Auth session + `studio_members` row
- Returns `{ userId, studioId }` or `null`
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
