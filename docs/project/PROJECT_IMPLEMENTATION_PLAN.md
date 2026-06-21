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
- no persistence, no storage, no Supabase, no Telegram

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

- perform short technical review: Image Proxy feasibility with Next.js + Supabase Storage
- upload files to Supabase Storage (private bucket)
- store each file as a typed record: type, storagePath, originalName, mimeType, size
- return file records for linking to request

Note: file count per field (MAX_FILES_PER_FIELD) is currently enforced by `requestFormSchema` inside `validateRequestPayload`, before `validateFiles` runs. `validateFiles` does not independently cap count — do not decouple validation order without updating both.

Note: MIME type validation in `validateFiles` trusts `file.type` from the multipart header (browser-provided). Magic-byte verification is not implemented. Acceptable for MVP at low volume; revisit if abuse is observed.

### 3C.3 — Request persistence

- define requests table schema
- implement request insert via service layer
- link uploaded file references to request record

Note: the route currently generates a temporary `crypto.randomUUID()` as `requestId` and returns it to the client without storing it. In 3C.3, `requestId` must come from the DB insert result (or the record's primary key). The client success UX already renders `requestId` conditionally and will work once the real value is returned.

### 3C.4 — End-to-end submission

- full flow: form → API → storage → database
- verify request is stored correctly with file references

## Stage 3D — Request Identity & Idempotency

**Production Requirement.**

Goal: prevent duplicate requests from reaching the artist.

### 3D.0 — clientSubmissionId

- generate `clientSubmissionId` (UUID v4) on the client before form submission
- include it in the request payload sent to the API
- store it in the database as a unique constraint on the requests table
- implement server-side deduplication: if `clientSubmissionId` already exists, return existing request info without creating a duplicate
- include the request reference ID in the success response, Telegram notification, and success UX

Note: adding `clientSubmissionId` requires touching `ParsedRequestPayload`, `REQUEST_FIELDS`, `parseRequestFormData` (BFF), `RequestForm.tsx` (client FormData build), and the route handler. Plan all these touch points together at the start of 3D.

Must be complete before public production launch and before broad user testing.

---

## Stage 3E — Notifications and Stabilization

### 3E.1 — Telegram notifications

- trigger Telegram notification after successful request creation
- notification must not block or break submission on failure

### 3E.2 — Stage 3 stabilization

- smoke test full submission flow
- fix any integration issues
- verify exit criteria

Exit Criteria:

- user can submit request successfully
- invalid data is rejected (client + server)
- files are uploaded and linked correctly
- request is stored in database
- success response is shown to user
- no console or server errors

Result:

- users can submit requests end-to-end

---

# Stage 4 — Admin

## Stage 4A — Admin Authentication

Goal: protect admin access before public launch.

**Required before public launch.** See PROJECT_DECISIONS.md — Admin Authentication Requirement.

Tasks:

- login / logout
- protected admin routes
- authenticated admin session

Exit Criteria:

- admin routes are not publicly accessible
- unauthenticated requests are rejected or redirected
- login and logout work correctly

Result:

- admin interface is protected

---

## Stage 4B — Admin Panel

Goal: implement request management.

Tasks:

- request list
- request details page
- status updates
- admin notes
- unread indicator

Exit Criteria:

- admin can view all requests
- admin can open request details
- admin can update status
- admin notes are saved
- UI reflects updated state

Result:

- admin can manage requests

---

# Stage 5 — Notifications

Goal: notify about new requests.

Tasks:

- Telegram integration
- trigger on new request
- optional reminder logic

Exit Criteria:

- notification is sent on new request
- notification contains correct data
- system does not break if notification fails

Result:

- admin receives notifications

---

# Stage 6 — Stabilization

Goal: prepare for real usage.

Tasks:

- bug fixes
- UX improvements
- mobile optimization
- basic testing
- deployment

Exit Criteria:

- no critical bugs
- mobile UX is acceptable
- main flows tested manually
- application deployed
- system usable in real conditions

Result:

- production-ready MVP

---

# Execution Rules

- implement stages sequentially
- do not skip stages
- do not start next stage before completing current
- each stage must satisfy its Exit Criteria
- avoid premature optimization
- keep scope within MVP

---

# Done Criteria

The implementation is complete when:

- all stages are completed
- request flow works end-to-end
- admin panel is functional
- notifications are working
- application is deployed and usable
