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

Note: MIME type validation in `validateFiles` trusts `file.type` from the multipart header (browser-provided). Magic-byte verification is not implemented. Acceptable for MVP at low volume; revisit if abuse is observed.

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
- include `clientName` in Telegram notification (Stage 3E)

This is a small dedicated stage. Implement before Stage 4 (Admin Panel) so admin requests always carry a name.

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

### 3D.5.3 — Supabase CLI Migration Workflow

Goal: establish a reliable migration workflow so future schema changes are applied via CLI rather than manual SQL Editor patches.

Tasks:

- install and verify Supabase CLI
- link existing Supabase project (`supabase link`)
- inspect remote migration state (`supabase migration list`)
- sync/repair migration history if local and remote are out of sync
- document the verified workflow for future agents: how to write, apply, and verify migrations
- decide how agents should verify DB state safely without requiring live DB access during implementation

Exit Criteria:

- Supabase CLI linked and working against the project
- `supabase migration list` reflects the three applied migrations (3C.3, 3D.0, 3D.5.2)
- future migration workflow documented in PROJECT_DECISIONS.md or PROJECT_PRODUCTION_READINESS.md

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
