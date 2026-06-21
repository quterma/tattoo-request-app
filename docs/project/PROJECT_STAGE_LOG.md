Purpose
Track current progress and maintain session continuity.

Scope
Current stage status and historical log entries.
This is the FIRST document AI must read at the start of every session.

Audience
AI agents and developers working on the project.

---

## Current Stage

Stage: Stage 3 — Request Flow
Status: In Progress

Current focus:

- Stage 3C.3 — Database Persistence (next)

Architecture decisions confirmed for Stage 3C.2:

- Private Supabase Storage bucket: `request-images`
- Folder structure: `request-images/{clientSubmissionId}/{type}/`
- Storage filenames: deterministic (`reference-01.jpg`, `placement-01.jpg`, ...) — not original filenames
- Image access: signed URLs generated server-side; Image Proxy rejected
- Images: originals stored without compression or resizing
- `clientSubmissionId` introduced in 3C.2.1 for storage use; full idempotency remains Stage 3D
- Upload reliability: per-file retry, 2–3 attempts, backoff, transient failures only
- Failure handling: all-or-nothing; cleanup + logging on upload failure and DB failure

Completed in Stage 3:

- form config (SIZE_OPTIONS, COLOR_OPTIONS, PLACEMENT_OPTIONS, MAX_FILES_PER_FIELD)
- zod validation schema with all fields and cross-field contact rule (migrated to zod/v3 for @hookform/resolvers compat)
- RequestFormData and RequestFormInput types inferred from schema
- i18n namespace `request` added to en.json (labels, placeholders, hints, errors, options)
- request page route wired (`app/[locale]/(public)/request/page.tsx`)
- local form primitives: TextInput, TextareaInput, SelectInput, CheckboxInput, Button, FileUploadInput
- RequestForm fully implemented with RHF + zodResolver, all fields, mock submit
- error handling redesigned: schema uses stable custom message keys; lib/errors.ts has flat MESSAGE_TO_I18N_KEY map + getFieldError/getContactGroupError helpers; RequestForm uses local err() shorthand — no type aliases or nested maps in form file
- final cleanup: lib/ layer added to feature, all component ids explicit, buttonText i18n-controlled, eslint allow-list updated for features/*/lib/**
- select UX fixed: defaultValues for placement/size/color set to "" + z.preprocess in schema so placeholder is shown initially and "" is treated as missing value
- upload trigger text updated to i18n key with maxFiles interpolation ("Choose up to {maxFiles} images.")
- deferred file-upload UX documented in PROJECT_BACKLOG.md
- server validation: validateRequestPayload() in BFF reuses requestFormSchema; POST /api/request returns 400 + structured errors or 500 on exception; consent "true" → boolean true conversion in parseRequestFormData
- server validation UX: VALIDATION_ERROR fieldErrors mapped to RHF setError(); status reset to "idle" after field errors; empty fieldErrors falls back to generic error; 3 new tests added
- file transport validation: validateFiles() in BFF checks MIME type (jpeg/png/webp/heic/heif) and size (≤10 MB per file); integrated into route after validateRequestPayload; errors flow through existing fieldErrors contract; upload format hints added to FileUploadInput fields; 9 new tests
- pre-3C fixes: consent type made honest (true | undefined), success response gated on response.ok === true, contact field labels cleaned up
- Supabase foundation: @supabase/supabase-js installed; config layer (src/config/index.ts) reads SUPABASE_URL + SUPABASE_SECRET_KEY with fail-fast validation; server-side Supabase client in src/services/supabase.ts exported through src/services/index.ts; .env.example created

Next expected step:

- Stage 3C.2 — File Storage

---

## Log Entries (reverse chronological)

### 2026-06-21 — Stage 3C.2.2 — Storage Integration

Status: Completed

Completed:

- `src/services/storage.ts` created: `uploadRequestFiles(files, clientSubmissionId)` — uploads reference and placement images to `request-images/{clientSubmissionId}/{type}/` with deterministic filenames (`reference-01.jpg`, `placement-01.jpg`, ...)
- Per-file retry: up to 3 attempts, exponential backoff (200ms base), transient errors only (`isTransientError()` checks network/timeout/5xx keywords)
- Cleanup on failure: tracks uploaded paths, calls `supabase.storage.remove()` on partial failure — logs attempt and result, does not rethrow cleanup errors
- `UploadedFile` and `FileType` types exported through `src/services/index.ts`
- Route handler (`app/api/request/route.ts`) updated: `uploadRequestFiles` called after `validateFiles`; temporary success response unchanged
- 8 tests in `src/services/__tests__/storage.test.ts`: upload success, empty files, retry success, retry exhaustion, non-transient no-retry, partial cleanup, cleanup failure logging, no cleanup when nothing uploaded
- Total tests: 74 (was 66) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-21 — Stage 3C.2.1 — Storage Foundation

Status: Completed

Completed:

- `clientSubmissionId` field added to `REQUEST_FIELDS` constant
- `ParsedRequestPayload` interface updated: `clientSubmissionId: string` added
- `UUID_REGEX` and `ClientSubmissionIdError` added to `src/bff/request.ts`; `parseRequestFormData` validates presence and UUID v4 format — throws `ClientSubmissionIdError` on failure
- `ClientSubmissionIdError` exported through `src/bff/index.ts`
- Route handler updated: catches `ClientSubmissionIdError` and returns 400 with structured `VALIDATION_ERROR` (not 500)
- `RequestForm.tsx`: `clientSubmissionId` generated once via `useState(() => crypto.randomUUID())`, appended to FormData on every submit
- Tests updated: `clientSubmissionId` added to all `validPayload` fixtures; 5 new tests added (parses id, missing → throws, invalid → throws, UUID v1 rejected, UUID v4 accepted, FormData includes valid UUID)
- Total tests: 66 (was 61) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-21 — Stage 3C.2 — Architecture Review (documentation only)

Status: Documentation sync completed

Decisions recorded:

- Image Proxy rejected; signed URLs chosen for admin image access (technical review completed)
- Single private bucket `request-images` confirmed
- Folder structure: `request-images/{clientSubmissionId}/{type}/`
- Storage filenames: deterministic by type and index; originalName as DB metadata only
- `clientSubmissionId` moved forward from Stage 3D into Stage 3C.2.1 (storage use only)
- Upload reliability: per-file retry, 2–3 attempts, exponential backoff, transient failures only
- Failure handling: all-or-nothing; cleanup + logging on upload failure and DB failure
- Stage 3C.2 split into 3C.2.1 (Storage Foundation) and 3C.2.2 (Storage Integration)
- PROJECT_DECISIONS.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_STAGE_LOG.md updated

No code changes.

---

### 2026-06-21 — Stage 3C.1 — Supabase Foundation

Status: Completed

Completed:

- `@supabase/supabase-js 2.108.2` added as dependency
- `.env.example` created with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
- `src/config/index.ts` populated: `requireEnv()` helper, `config.supabase.url` + `config.supabase.secretKey` — throws at module load if env vars missing
- `src/services/supabase.ts` created: server-side Supabase client with `persistSession: false`
- `src/services/index.ts` updated: exports `supabase` through public API
- `docs/project/PROJECT_DECISIONS.md` updated: MVP Quality Standard, Admin Authentication Requirement, Quality Gates Policy
- `docs/files-structure.md` updated
- Connection verification: manual — `pnpm dev` startup throws immediately if env vars are missing; first real DB query in Stage 3C.3 will confirm network connectivity
- lint / typecheck / tests (61/61) / build — all PASS

---

### 2026-06-20 — Stage 3B Pre-3C Fixes

Status: Completed

Completed:

- `ParsedRequestPayload.consent` typed as `true | undefined`; unsafe `(undefined as unknown as true)` cast removed from `parseRequestFormData`
- `RequestForm.tsx`: success branch now gates on `response.ok === true`; `requestId` stored as `response.requestId ?? null` and rendered conditionally — decouples success state from requestId presence
- `en.json`: removed "(optional)" from Email, Phone, Other contact labels — redundant with existing contact section hint
- Contact validation timing: confirmed implementation bug — `z.literal(true)` returns `INVALID` (aborted) when consent is missing, which causes `ZodObject` to abort entirely, skipping `superRefine`. Result: contact group error and any server-side file error never appear on first submit when consent is also missing. Fix: replaced `z.literal(true)` with `z.custom<true>(v => v === true, { message: K.CONSENT_REQUIRED, fatal: false })` — non-fatal custom validation marks dirty instead of aborting, so `superRefine` always runs. All 54 tests pass.

---

### 2026-06-20 — Stage 3B.5 — File Transport Validation

Status: Completed

Completed:

- `validateFiles()` added to `src/bff/validateFiles.ts`: checks MIME type and file size per field, returns `FileValidationResult`
- allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`
- max file size: 10 MB per file; first failing file per field stops further checks on that field
- `ValidationErrorResult` reused — errors surface through existing `fieldErrors` contract
- `src/bff/index.ts` updated: exports `validateFiles` and `FileValidationResult`
- `app/api/request/route.ts` updated: sequential flow — `validateRequestPayload` first, then `validateFiles`
- `file_type_invalid` and `file_too_large` keys added to `MESSAGE_TO_I18N_KEY` and `en.json`
- upload format hint (`uploadFormatsHint`) added to `en.json`; both `FileUploadInput` fields in `RequestForm` show combined hint
- 9 new tests in `src/bff/__tests__/validateFiles.test.ts`; all 54 tests pass; lint, typecheck, build — PASS

---

### 2026-06-20 — Stage 3B.4 — Server Validation UX

Status: Completed

Completed:

- `setError` extracted from `useForm` in `RequestForm.tsx`
- `onSubmit` updated: when API returns `ok: false` with `code === "VALIDATION_ERROR"`, maps `fieldErrors` entries to `setError(field, { message })` using first error per field
- `status` reset to `"idle"` after field errors are set — form stays interactive for retry
- Empty `fieldErrors` with `VALIDATION_ERROR` falls back to generic `"error"` status
- Non-validation errors keep existing generic error behavior unchanged
- 3 new tests: fieldErrors mapped to field UI, empty fieldErrors → generic error banner, retry after validation error
- all 45 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Stage 3B.3 — Server validation

Status: Completed

Completed:

- `validateRequestPayload()` added to `src/bff/request.ts`: reuses `requestFormSchema.safeParse()`, returns typed `ValidationResult`
- `parseRequestFormData()` updated: consent `"true"` string converted to boolean `true`
- `ParsedRequestPayload` updated: `consent: true` (boolean literal)
- `POST /api/request` route handler updated: validates payload, returns 400 + structured error or 500 on exception
- Error contract: `{ ok: false, error: { code: "VALIDATION_ERROR", fieldErrors, formErrors } }` for validation failures
- `src/bff/index.ts` updated: exports `validateRequestPayload` and new types
- `eslint.config.mjs`: added `features/*/validation` to allow-list for BFF import
- `PROJECT_STRUCTURE.md`: dependency rule updated — `bff → features/*/validation` explicitly allowed
- 10 new tests in `src/bff/__tests__/validateRequestPayload.test.ts`; 2 existing tests updated in `request.test.ts`
- all 42 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Documentation — Stage 3B.4 Server Validation UX added to plan

Status: Documentation only

Notes:

- Added Stage 3B.4 — Server Validation UX to PROJECT_IMPLEMENTATION_PLAN.md immediately after Stage 3B.3.
- Scope: consume server `fieldErrors` response, map to RHF `setError()`, display per-field server errors, preserve existing client-side UX.
- Former Stage 3B.4 (File transport) renumbered to Stage 3B.5.
- No code changes.

---

### 2026-06-06 — Stage 3B.2 — Success / Error UX

Status: Completed

Completed:

- local submit state machine: idle → submitting → success | error
- success: form replaced with inline success block showing requestId from API response
- error (API failure or network error): inline alert banner, form remains visible for retry
- loading: button disabled, text switches to "Sending…" key
- 5 new i18n keys added to `request` namespace: submitButtonLoading, successTitle, successMessage, successRequestId, errorMessage
- 4 new tests added: success state, error (API), error (network), retry flow
- all 30 tests pass; lint, typecheck, build — PASS

---

### 2026-06-06 — Documentation — Request Identity & Idempotency decision recorded

Status: Documentation only

Notes:

- Production requirement identified during Stage 3 review: without a deduplication mechanism, users can accidentally submit duplicate requests (refresh, network retry, repeated taps).
- Decision recorded in PROJECT_DECISIONS.md: introduce `clientSubmissionId` (UUID), generated on the client before submission, stored in the database with a unique constraint.
- Server behavior defined: idempotent — if `clientSubmissionId` already exists, return existing request info without creating a duplicate.
- UX goal added: user and artist both receive the same request reference ID; Telegram notifications include it.
- Stage 3D added to PROJECT_IMPLEMENTATION_PLAN.md as the dedicated implementation stage for this story.
- Former Stage 3D (Notifications and Stabilization) renamed to Stage 3E; sub-stage labels updated accordingly.
- Not assigned to Stage 3B.2.

---

### 2026-06-06 — Stage 3B.1 — Payload contract + API route + first end-to-end submit

Status: Completed

Completed:

- FormData contract defined: text fields + repeated file keys (referenceImages, placementImages), optional fields omitted when empty, consent as string "true"
- src/bff/request.ts: ParsedRequestPayload interface + parseRequestFormData()
- src/bff/index.ts: exports parseRequestFormData and ParsedRequestPayload as public API
- app/api/request/route.ts: POST handler, parses FormData via BFF, returns { ok: true, requestId: uuid }
- RequestForm.tsx: onSubmit replaced with real fetch to /api/request, console.log on response

---

### 2026-06-06 — Stage 3 — Planning sync (round 2)

Status: Planning completed

Notes:

- File data model direction confirmed: typed file collection (type, storagePath, originalName, mimeType, size)
- Two upload inputs on current form confirmed: reference images and placement images — map to type values
- Mobile upload requirement clarified: native file input for MVP (gallery/camera/files); no advanced upload UI needed now
- Image Proxy technical review scheduled for start of Stage 3C.2
- .env.example / env var documentation scheduled for Stage 3C.1
- Stale backlog item removed: "real upload flow to storage" (now Stage 3C task, not backlog)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_BACKLOG.md updated

---

### 2026-06-06 — Stage 3 — Planning sync

Status: Planning completed

Notes:

- Stage 3A (form UI) confirmed complete via codebase audit
- Backend slice (API, storage, database) not yet started — confirmed
- Stage 3 execution plan approved: sub-stages 3B → 3C → 3D defined in PROJECT_IMPLEMENTATION_PLAN.md
- Storage direction approved: Supabase Storage, private bucket
- Service layer rule documented: no provider abstractions, YAGNI-compliant
- File access decision documented: Image Proxy through BFF (pending short technical review before implementation)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md updated to reflect all decisions

---

### 2026-04-08 — Stage 2 — Public Pages

Status: Completed

Completed:

- Home sections (hero, gallery placeholder, how it works, about)
- Policies page with full content
- Aftercare page with full content
- Location page
- CTA links verified — all lead to /request
- Navigation links verified across all public pages

### 2026-03-24 — Stage 2 — Public Pages (partial)

Status: Superseded

Completed at that point:

- Home sections (Gallery, How It Works, About)
- Policies page
- Location page

---

### Stage 1 — App Shell & Navigation

Status: Completed

Completed:

- Layout and navigation implemented
- Route groups created (public, admin)
- Base pages added (home, policies, location)
- Responsive navigation (mobile + desktop)
