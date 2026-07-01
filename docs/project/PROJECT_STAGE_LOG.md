Purpose
Track current progress and maintain session continuity.

Scope
Current stage status and historical log entries.
This is the FIRST document AI must read at the start of every session.

Audience
AI agents and developers working on the project.

---

## Current Stage

Stage: Stage 4A — Admin Authentication
Status: In progress

Current focus:

- Stage 4A.1 complete — Stage 4A.2 complete — Stage 4A.3 complete — Stage 4A.4 complete — Stage 4A.5 complete — Stage 4A.6 complete — proceeding to Stage 4A.7

Completed stages:

- Stage 3 — Request Flow ✓
- Stage 3D — Request Identity & Idempotency ✓
- Stage 3D.5.1 — Architecture & Documentation Audit ✓
- Stage 3D.5.2 — Audit Fix Pass ✓
- Stage 3D.5.3 — Supabase CLI Migration Workflow ✓
- Stage 3D.6 — Domain Foundation ✓

Note: Stage 3E (Telegram Notifications + Stabilization) was superseded by the roadmap
restructure on 2026-06-28. Telegram moved to Stage 2 (Post-Launch). Stabilization
responsibilities absorbed into Stage 5 (Production Hardening).

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
- clientName field: required `clientName` added to form, schema (trim, min 2, max 30), BFF parsing, route handler, db.ts; wired to existing `client_name` DB column via RPC; 8 new tests (schema validation, BFF parsing, form FormData, db persistence mapping)

---

## Log Entries (reverse chronological)

### 2026-07-01 — Stage 4A.6 fix — OAuth callback error handling

Status: Completed

Completed:

- `app/auth/callback/route.ts`: missing `code` now redirects to `/${locale}/admin/login?error=oauth` instead of proceeding to `/${locale}/admin`
- `exchangeCodeForSession(code)` result is now checked; on `error`, redirects to `/${locale}/admin/login?error=oauth` instead of unconditionally redirecting to admin
- Previously, a failed or missing code exchange still redirected to `/${locale}/admin`, relying on the protected layout's `unauthenticated` branch to redirect back to login — functionally recoverable but silent (no error surfaced) and slower (extra redirect hop)
- No authorization or business logic added; locale fallback unchanged; admin redirect only reached on confirmed session exchange
- No new tests — same category as the rest of the callback route (Supabase SDK result branching + Next.js redirect, not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS

---

### 2026-07-01 — Stage 4A.6 — Google OAuth

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/login/actions.ts` — `googleLoginAction(locale)` server action added: calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } })` via SSR auth client with writable cookies; redirects the browser to the returned Google consent URL; redirects to `/${locale}/admin/login?error=oauth` on failure
- Chose server-action + `skipBrowserRedirect: true` over a browser Supabase client after explicit evaluation: fully PKCE-correct (code verifier persisted via the same writable `CookieHandler` already used by `loginAction`/`logoutAction`), requires no `NEXT_PUBLIC_` env vars, and introduces no new client-side Supabase client module
- `app/[locale]/(admin)/admin/login/LoginForm.tsx` — added a second, separate `<form>` with a `Google` button wired to `googleAction` (server action passed as prop); no styling beyond existing primitives; kept as a sibling form, not nested, to stay valid HTML
- `app/[locale]/(admin)/admin/login/page.tsx` — binds `googleLoginAction` to locale; reads `?error=oauth` search param and renders an inline error message when present
- `app/auth/callback/route.ts` created: fixed non-locale Route Handler; reads `code` + `locale` query params; exchanges code for session via `supabase.auth.exchangeCodeForSession()` (SSR auth client, writable cookies); redirects to `/${locale}/admin` (`defaultLocale` fallback if `locale` missing/unsupported); no authorization or business logic — admin `(protected)` layout performs the authorization check after redirect, unchanged
- Locale preservation: `redirectTo` passed to `signInWithOAuth` includes `?locale=<locale>`; Google and Supabase preserve this query param through the redirect chain back to `/auth/callback`
- `proxy.ts`: matcher updated to exclude `/auth` (alongside existing `/api`, `/_next`, `/_vercel` exclusions) — without this, the fixed non-locale `/auth/callback` route would have been redirected to `/${defaultLocale}/auth/callback` by the locale-redirect logic, breaking the OAuth round trip. Found and fixed before implementation, per user confirmation.
- No `studio_members` changes; no invite flow; no RBAC; no password reset — out of scope per stage definition. A Google-authenticated user with no `studio_members` row still hits the existing `unauthorized` branch in the protected admin layout (unchanged from Stage 4A.3–4A.5)
- No new tests — both new code paths orchestrate Supabase SDK calls + Next.js redirects, same category as `loginAction`/`logoutAction` (not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `docs/files-structure.md`, `PROJECT_STAGE_LOG.md`: updated

Required manual Supabase/Google dashboard setup (not code, not committed):

1. Google Cloud Console: create an OAuth 2.0 Client ID (Web application). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase Dashboard → Authentication → Providers → Google: enable, paste the Google Client ID and Client Secret.
3. Supabase Dashboard → Authentication → URL Configuration: add the app's `/auth/callback` URL (e.g. `http://localhost:3000/auth/callback` for local dev, plus the production origin) to the Redirect URLs allow-list — `signInWithOAuth`'s `redirectTo` must match an allowed URL or Supabase rejects it.
4. No secrets stored in this repo; Google Client ID/Secret live only in the Supabase dashboard.

Manual verification still required (not yet performed in this session): click Google → complete Google login → return to app → confirm authenticated-but-not-a-`studio_members`-member sees "This account is not authorized." → confirm a `studio_members` member reaches `/admin`.

Concern flagged before Stage 4A.7 (password reset): none blocking. Note that the `?error=oauth` query param on the login page is a plain URL param, not itself a security-sensitive value — no action needed, but worth being aware of when adding the password-reset request/confirm flow, which will introduce its own query-param-carried state (reset token) requiring more care.

---

### 2026-07-01 — Stage 4A.5 fix — Sign out from unauthorized state

Status: Completed

Completed:

- Manual testing found authenticated-but-unauthorized users (no `studio_members` row) had no way to sign out — stuck on "This account is not authorized." with an active session
- `app/[locale]/(admin)/admin/(protected)/layout.tsx`: unauthorized branch now also renders `SignOutButton` (reused as-is) above the message; `boundLogoutAction` moved above both branches so it's available to both
- No changes to `actions.ts` or `SignOutButton.tsx` — fully reused
- No changes to authorization logic or `studio_members`
- No new tests — same rationale as Stage 4A.5 (orchestration only)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STAGE_LOG.md`: updated; `PROJECT_STRUCTURE.md` unchanged (no new files, no responsibility changes)

---

### 2026-07-01 — Stage 4A.5 — Logout

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/(protected)/actions.ts` — `logoutAction(locale)` server action: calls `supabase.auth.signOut()` via SSR auth client with writable cookies, then redirects to `/${locale}/admin/login`
- `app/[locale]/(admin)/admin/(protected)/SignOutButton.tsx` — Client Component; form wired to the locale-bound `logoutAction`
- `app/[locale]/(admin)/admin/(protected)/layout.tsx` — minimal header added (renders only once auth + authorization checks pass): "Admin" label + `SignOutButton`; unauthenticated/unauthorized branches unchanged
- Logout terminates authentication only — no `studio_members` writes, no authorization logic; `getAuthenticatedStudioMember()` remains the sole authorization gate
- No new tests — `logoutAction` orchestrates Supabase SDK + Next.js redirect, same category as `loginAction` (not tested per strategy)
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`, `docs/files-structure.md`: updated

---

### 2026-06-30 — Stage 4A.4 — Email/Password Login Page

Status: Completed

Completed:

- Route group restructured: `app/[locale]/(admin)/admin/layout.tsx` moved to `app/[locale]/(admin)/admin/(protected)/layout.tsx` and `app/[locale]/(admin)/admin/page.tsx` moved to `(protected)/page.tsx`. This is required: the old layout wrapped the login page, causing an infinite redirect loop for unauthenticated users. The `(protected)` route group excludes the login route. URLs are unchanged.
- `app/[locale]/(admin)/admin/login/actions.ts` — `loginAction(locale, prev, formData)` server action: calls `supabase.auth.signInWithPassword()` via SSR auth client with writable cookies; on success redirects to `/${locale}/admin`; on failure returns `{ error: "Invalid email or password." }` (no technical details exposed)
- `app/[locale]/(admin)/admin/login/LoginForm.tsx` — Client Component; uses `useActionState` for server action integration; inline error display; loading state ("Signing in…") while pending
- `app/[locale]/(admin)/admin/login/page.tsx` — Server Component; reads Supabase session on render; authenticated user → redirect to `/${locale}/admin`; unauthenticated → renders LoginForm with locale-bound action
- Authenticated users visiting `/[locale]/admin/login` are redirected to `/[locale]/admin` (server-side, before page renders)
- Logout remains Stage 4A.5; Google OAuth remains Stage 4A.6
- No new tests for login page — orchestrates Supabase SDK + Next.js redirect (not tested per strategy); `loginAction` error branch is a pass-through of an external SDK result
- Bugfix (pre-commit): `getAuthenticatedStudioMember()` now treats `AuthSessionMissingError` from `getUser()` as `unauthenticated` instead of throwing — unauthenticated access to `/[locale]/admin` now correctly redirects to login instead of crashing. New test added for this case. See `src/services/auth.ts`.
- Total tests: 113 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`: updated

---

### 2026-06-30 — Stage 4A.3 — Admin Route Protection

Status: Completed

Completed:

- `app/[locale]/(admin)/admin/layout.tsx` created: server component auth gate
- Calls `getAuthenticatedStudioMember()` with read-only cookie handler (setAll no-op — server component cannot write cookies; middleware handles refresh)
- No session (`unauthenticated`) → `redirect(`/${locale}/admin/login`)`
- Session but no `studio_members` row (`unauthorized`) → renders `<p>This account is not authorized.</p>`
- Session + membership → renders `{children}`
- `app/[locale]/(admin)/admin/login/page.tsx` created: minimal placeholder so redirect target resolves; no form, no auth logic
- `eslint.config.mjs`: `**/services/auth` added to `import/no-internal-modules` allow-list (same pattern as `supabaseAuth`)
- No new tests — layout orchestrates `getAuthenticatedStudioMember` (already tested 6/6) and Next.js framework behavior (not tested per strategy)
- Total tests: 112 — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_STAGE_LOG.md`: updated

---

### 2026-06-30 — Stage 4A.2 — Shared Authorization Function

Status: Completed

Completed:

- `src/services/auth.ts` created: `getAuthenticatedStudioMember(cookies: CookieHandler)` shared authorization gate
- Returns `AuthResult` discriminated union: `{ ok: true, userId, studioId }` | `{ ok: false, reason: "unauthenticated" | "unauthorized" }`
- Expected auth failures are business outcomes (ok: false); infrastructure errors (Supabase auth error, DB error) throw
- Session identity via SSR auth client (`createSupabaseAuthClient`); membership via service-role client (`supabase`) querying `studio_members`
- Not exported through `services/index.ts` barrel — intentionally imported directly by callers (same pattern as `supabaseAuth.ts`)
- `src/services/__tests__/auth.test.ts` created: 6 tests — authenticated + member, authenticated + no member, unauthenticated, auth error throws, DB error throws, error message propagated
- Total tests: 112 (was 106) — all pass
- lint / typecheck / build — all PASS
- `PROJECT_STRUCTURE.md`, `PROJECT_DECISIONS.md`, `PROJECT_STAGE_LOG.md`: updated to reflect `AuthResult` discriminated union (was described as `null`-returning in architecture docs)
- Deferred: Supabase generated Database types — `membership.studio_id as string` cast noted; tracked in PROJECT_BACKLOG.md for Stage 5 or earlier

---

### 2026-06-30 — Stage 4A.1 — Supabase SSR Auth Foundation

Status: Completed

Completed:

- `@supabase/ssr 0.12.0` installed as dependency
- `SUPABASE_PUBLISHABLE_KEY` added to `src/config/index.ts` (`config.supabase.publishableKey`) and `.env.example`
- `src/services/supabaseAuth.ts` created: `createSupabaseAuthClient(cookies)` factory using `@supabase/ssr`; reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` directly from `process.env` (does not import `@/config`) to keep service_role config out of the middleware bundle; accepts `CookieHandler` (getAll/setAll) for use in both middleware and server components; scoped to session identity only
- `proxy.ts` extended: session refresh via `supabase.auth.getUser()` after intl middleware runs; cookie read/write wired to request/response; no auth logic, no redirects; i18n behavior unchanged
- `eslint.config.mjs`: `**/services/supabaseAuth` added to `import/no-internal-modules` allow list (intentionally not exported through barrel)
- `docs/project/PROJECT_STRUCTURE.md`: `supabaseAuth.ts` entry updated from planned to implemented
- Quality gates: lint ✓, typecheck ✓, 106/106 tests ✓, build ✓

Note: `.env.local` requires `SUPABASE_PUBLISHABLE_KEY` set to the publishable key from the Supabase dashboard (Settings → API Keys → Publishable key). A placeholder is present; replace before running any auth flow.

---

### 2026-06-30 — Stage 4A — Admin Authentication (architecture documentation)

Status: Documentation only — implementation not started

Documented:

- Authentication vs Authorization distinction: Supabase session proves identity; `studio_members` row proves access; both required
- Two Supabase clients: service_role client (existing, DB/Storage) + SSR auth client (new in 4A, session identity only)
- `proxy.ts` role clarified: sole Next.js middleware entry point; will be extended with SSR session refresh; must not create parallel `middleware.ts`
- Admin route protection: no session → redirect to login; session without `studio_members` row → unauthorized page; session + row → admin content
- `getAuthenticatedStudioMember()` planned in `src/services/auth.ts`: returns `AuthResult` discriminated union (`{ ok: true, userId, studioId }` | `{ ok: false, reason }`); Stage 4B handlers must call this and scope data by `studioId`
- Login: `app/[locale]/(admin)/admin/login/page.tsx`; email/password; Google OAuth if feasible
- OAuth callback: `app/auth/callback/route.ts` — code exchange and redirect only; no business logic
- Logout: clears session, locale-aware redirect to login
- Password reset: request-link flow + reset page; recovery session must not grant admin access prematurely
- Manual admin activation: developer inserts `studio_members` row; no invite flow, no RBAC
- Stage 5 boundary: application-layer auth enforcement in Stage 4 is an accepted temporary risk; RLS deferred to Stage 5
- Stage 4A implementation sequence (4A.1 → 4A.8) documented in PROJECT_IMPLEMENTATION_PLAN.md

Files updated: PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_STRUCTURE.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_STAGE_LOG.md

No code changes.

---

### 2026-06-30 — Stage 3D.6 — Domain Foundation

Status: Completed

Completed (3D.6.2 — Application Wiring):

- `DEPLOYMENT_STUDIO_ID` added to `.env.example` and `src/config/index.ts` (`config.app.deploymentStudioId`)
- `uploadRequestFiles()` in `src/services/storage.ts`: accepts `studioId` as new second parameter; storage path changed from `{clientSubmissionId}/{type}/{file}` to `{studioId}/{clientSubmissionId}/{type}/{file}`; all existing cleanup/retry behavior unchanged
- `CreateRequestParams` in `src/services/db.ts`: `studioId` field added; `p_studio_id` passed as first argument to `create_request` RPC
- Route handler (`app/api/request/route.ts`): `resolveStudioId()` helper reads `config.app.deploymentStudioId`; `studioId` resolved once and passed to both `uploadRequestFiles` and `createRequest`; resolver is isolated so it can be replaced by slug/domain resolution in Stage 4 without touching the rest of the handler
- Tests updated: `STUDIO_ID` constant added to storage and route fixtures; storage path expectations updated throughout; `p_studio_id` added to db RPC assertion; `@/config` mocked in route.test.ts; two new route assertions added (passes studioId to upload, passes studioId to createRequest)
- Total tests: 106 (was 104) — all pass
- lint / typecheck / build — all PASS

Completed (3D.6.1 — DB Migration):

- `supabase/migrations/20260629154719_domain_foundation.sql` applied to remote
- `studios` table: id (UUID PK, fixed seed `2617c7d8-23bb-4269-ab2e-fd104c3d12b8`), name, created_at; GRANT INSERT/SELECT/UPDATE to service_role
- `studio_id` UUID column added to `requests`; all existing rows backfilled to Masha's studio UUID; NOT NULL enforced; FK constraint added
- `studio_members` table: composite PK (user_id, studio_id), references auth.users + studios; GRANT INSERT/SELECT/DELETE to service_role; starts empty (populated in Stage 4A)
- Old `create_request` RPC (12 params) dropped; new `create_request` (13 params, adds p_studio_id) created; REVOKE from PUBLIC / GRANT EXECUTE to service_role
- Migration list confirmed: all 4 migrations Local = Remote
- Quality gates at audit time: 106 tests PASS, lint PASS, typecheck PASS, build PASS

---

### 2026-06-29 — Stage 3D.6 — Domain Foundation (planning update after architecture review)

Status: Planning updated — implementation pending

Additional decisions recorded:

- Storage path structure changed: `{clientSubmissionId}/{type}/{file}` → `{studioId}/{clientSubmissionId}/{type}/{file}`
  Reason: aligns storage ownership with studio model; makes future Storage RLS policies straightforward.
  Existing stored paths remain valid (DB stores full path); only new uploads use the new structure.
- RLS confirmed NOT included in Stage 3D.6. All three new/updated tables (`studios`, `studio_members`, `requests`) remain without RLS policies until Stage 5. Access goes through service_role only.
- Authentication and authorization model documented: Auth session proves identity; `studio_members` row proves access. Stage 4A must enforce both.
- Staging environment (Supabase + Vercel preview) deferred to Stage 5 as an explicit decision point — not required before 3D.6 or 4A.
- Deferred items confirmed: role column, is_active/soft-delete, invite flow, billing, multi-studio routing.

### 2026-06-28 — Stage 3D.6 — Domain Foundation (initial planning)

Status: Superseded by 2026-06-29 update above

Decisions recorded:

- `studios` and `studio_members` tables defined; schema documented in PROJECT_DECISIONS.md
- `studio_id` FK column will be added to `requests`; backfill strategy for existing rows documented
- `create_request` RPC will be updated to accept `p_studio_id`
- `DEPLOYMENT_STUDIO_ID` env var chosen for single-studio route resolution
- `studio_members` supersedes the earlier `admin_profiles` direction; 4A will use `studio_members` as the access gate
- `getRequestByClientSubmissionId()` confirmed to remain global (no studio filter)
- Stage placed before 4A due to zero-data migration cost
- Stage 3D.6 added to PROJECT_IMPLEMENTATION_PLAN.md with full scope, exit criteria, and deferred items

No code changes.

---

### 2026-06-24 — Stage 3D.5.3 — Supabase CLI Migration Workflow

Status: Completed

Completed:

- Supabase CLI v2.107.0 installed as project devDependency (`pnpm add -D supabase`)
- `pnpm exec supabase` confirmed as the canonical invocation going forward
- `supabase init` run: `supabase/config.toml` and `supabase/.gitignore` created
- Project linked to remote: `supabase link --project-ref vjjvouihcvqmupjojgrs`
- Pre-repair audit: `migration list` confirmed all three migrations had empty Remote column (expected — all were applied manually via SQL Editor; `supabase_migrations.schema_migrations` was empty)
- Migration history repaired (metadata only, no schema changes):
  - `20260622000000` → applied
  - `20260622000001` → applied
  - `20260623000000` → applied
- Post-repair `migration list` confirmed Local = Remote for all three migrations
- Global binary (`C:\Users\danik\AppData\Local\supabase\`) removed; project-local CLI verified working independently
- lint / typecheck / tests (104/104) / build — all PASS

---

### 2026-06-23 — Stage 3D.5 — Architecture & Documentation Audit / Fix Pass

Status: Completed

Audit (3D.5.1):

- Full audit of all PROJECT_* docs, code, migrations, and tests after Stage 3D completion
- Findings: 2 Critical (stale stage log, missing 3D.5 in plan), 3 High (client_name nullable, BUCKET duplicate, stale current focus), several Medium/Low doc gaps
- No code correctness issues found; all quality gates passed; idempotency flow confirmed correct

Fix pass (3D.5.2):

- `PROJECT_STAGE_LOG.md`: removed stale "Next expected step: Stage 3D" block; updated current focus; added completed stages list
- `PROJECT_IMPLEMENTATION_PLAN.md`: added Stage 3D.5 sub-stage under Stage 3D; added Stage 3D.5.3 planned sub-stage
- `PROJECT_CONTEXT.md`: added `clientName` to Request Form scope; corrected status values to match DB CHECK constraint (`new / contacted / booked / completed / rejected`)
- `PROJECT_BACKLOG.md`: removed stale Route-Level Tests backlog item (tests added in Stage 3D.0)
- `PROJECT_STRUCTURE.md`: added `getRequestByClientSubmissionId()` to services/db.ts section
- `src/services/storage.ts`: exported `BUCKET` constant
- `app/api/request/route.ts`: removed local `BUCKET` definition; imports from `@/services`
- `app/api/request/__tests__/route.test.ts`: added `BUCKET` to `@/services` mock
- `supabase/migrations/20260623000000_make_client_name_not_null.sql`: backfills null `client_name` rows with `[unknown]`, then enforces `NOT NULL` constraint; patch SQL applied manually to live Supabase project
- `PROJECT_PRODUCTION_READINESS.md`: added Architecture Audit Checkpoints section; added E2E integration testing section reference; updated migration workflow note
- `PROJECT_BACKLOG.md`: added Migration Workflow and Automated E2E Tests sections

Documentation sync (3D.5.3 prep):

- `PROJECT_IMPLEMENTATION_PLAN.md`: added Stage 3D.5.3 — Supabase CLI Migration Workflow
- `PROJECT_PRODUCTION_READINESS.md`: added Architecture Audit Checkpoints section
- Confirmed all planned future items already documented: Repeat Client Indicator ✓, AI Tattoo Title ✓, performance validation ✓, E2E test coverage ✓, dependency/security review ✓

---

### 2026-06-22 — Stage 3D.0 — Request Identity & Idempotency

Status: Completed

Completed:

- `supabase/migrations/20260622000001_add_client_submission_id_unique.sql` created:
  - `ALTER TABLE requests ADD CONSTRAINT requests_client_submission_id_key UNIQUE (client_submission_id)`
  - Separate migration from Stage 3C.3 — applies cleanly on top of the already-deployed schema
- `getRequestByClientSubmissionId(clientSubmissionId)` added to `src/services/db.ts`:
  - queries `requests` table by `client_submission_id` using `.maybeSingle()`
  - returns existing `reference_code` as string, or `null` if not found
  - throws on Supabase error
  - exported through `src/services/index.ts`
- Route handler (`app/api/request/route.ts`) updated with three-path idempotency flow:
  1. Pre-upload lookup: if `clientSubmissionId` already exists → log `[route] idempotent replay: REQ-XXXX` → return `{ ok: true, referenceCode }` immediately (no upload, no DB insert)
  2. Normal path: lookup returns null → upload files → create request → return `{ ok: true, referenceCode }`
  3. Race-condition fallback: `createRequest` throws with unique constraint message → cleanup uploaded files → re-fetch by `clientSubmissionId` → if found: log `[route] idempotent race recovered: REQ-XXXX` → return `{ ok: true, referenceCode }`; if not found: return 500
- All three paths return identical `{ ok: true, referenceCode }` response shape — client cannot distinguish them
- Race detection: string-matches `"23505"` (Postgres unique violation code) or `"unique constraint"` in error message; all other DB errors remain 500
- `app/api/request/__tests__/route.test.ts` created: 11 route-level tests covering:
  - normal success flow
  - upload order (uploadRequestFiles called before createRequest)
  - replay returns existing referenceCode
  - replay does not call uploadRequestFiles or createRequest
  - response shape identity between normal and replay
  - race: cleanup + fetch existing → success
  - race: cleanup + fetch returns null → 500
  - non-unique DB error → 500 (no race recovery attempted)
  - payload validation failure
  - file validation failure
- `src/services/__tests__/db.test.ts` updated: 4 new tests for `getRequestByClientSubmissionId` (returns code, returns null, throws on error, includes error message); total 10 tests in file
- Total tests: 104 (was 89) — all pass
- lint / typecheck / build — all PASS

Architecture confirmed before implementation:
- Option A (route-level lookup) chosen over Option B (RPC-level upsert) — keeps `create_request` RPC as pure insert; deduplication logic in the orchestration layer where it belongs
- Both replay paths (lookup hit and race recovery) log distinct messages but return identical response
- UNIQUE constraint is the DB safety net; application-level lookup is an optimization to avoid unnecessary uploads on replays

---

### 2026-06-22 — Stage 3C.3.5 — Client Name

Status: Completed

Completed:

- `clientName` field added to `requestFormSchema`: required, `.trim()`, min 2, max 30
- `CLIENT_NAME_REQUIRED`, `CLIENT_NAME_TOO_SHORT`, `CLIENT_NAME_TOO_LONG` added to `VALIDATION_KEYS`
- `MESSAGE_TO_I18N_KEY` in `lib/errors.ts` updated with three new mappings
- `REQUEST_FIELDS.clientName` added to BFF
- `ParsedRequestPayload.clientName: string` added; `parseRequestFormData` reads the field from FormData
- `CreateRequestParams.clientName` updated from `string | undefined` to `string`; `?? null` fallback removed from RPC call
- Route handler wired: `clientName: payload.clientName` replaces the previous `clientName: undefined` placeholder
- `RequestForm.tsx`: `clientName` TextInput added as first form field; `defaultValues` and `FormData.append` updated
- i18n: `clientNameLabel`, `clientNamePlaceholder`, `errors.clientNameRequired`, `errors.clientNameTooShort`, `errors.clientNameTooLong` added to `en.json`
- No DB migration needed — `client_name TEXT` column already exists in `requests` table (added in Stage 3C.3)
- Tests: 8 new + existing fixtures updated — schema (6 new: required, too-short, too-long, trim, boundary 2, boundary 30), BFF parsing (2 new: parses clientName, absent → empty string), FormData assertion added to submission test, db fixture updated (clientName: undefined → "Alex", p_client_name null assertion → string assertion)
- Total tests: 89 (was 81) — all pass
- lint / typecheck / build — all PASS

---

### 2026-06-22 — Stage 3C.3 — Request Persistence

Status: Completed (migration applied, end-to-end verified)

Completed:

- `supabase/migrations/20260622000000_create_requests.sql` created:
  - `request_seq` sequence (global, no yearly reset)
  - `requests` table: id (UUID PK), reference_code (UNIQUE), client_submission_id (UNIQUE), description, placement, size, color, email, phone, contact_other, consent, status (default 'new'), read_at (nullable), created_at
  - `request_files` table: id (UUID PK), request_id (FK → requests, CASCADE), type, storage_path, original_name, mime_type, size, created_at
  - RLS enabled on both tables; no policies (service_role key bypasses RLS)
  - `create_request(...)` RPC function: atomically inserts request + files, generates `reference_code` (`REQ-YYYY-NNNN`), returns `{ id, referenceCode }`
- `src/services/db.ts` created: `createRequest(params)` calls RPC, maps optional fields to null, returns `CreatedRequest`
- `src/services/index.ts` updated: exports `createRequest` and `CreatedRequest`
- `app/api/request/route.ts` updated:
  - calls `uploadRequestFiles` then `createRequest` in sequence
  - on DB failure: cleanup uploaded storage files, log attempt and result, return 500
  - returns `{ ok: true, referenceCode }` (replaces temporary UUID placeholder)
- `src/features/request/ui/RequestForm.tsx` updated: `requestId` → `referenceCode`; reads `response.referenceCode`; renders via `successReferenceCode` i18n key
- `src/shared/i18n/messages/en.json` updated: `successRequestId` → `successReferenceCode` with `{referenceCode}` interpolation
- `src/services/__tests__/db.test.ts` created: 5 tests — correct RPC call, null optional fields, empty files, RPC error throws, error message propagated
- `src/features/request/__tests__/RequestForm.submission.test.tsx` updated: all `requestId` mock values replaced with `referenceCode`
- Total tests: 81 (was 74) — all pass
- lint / typecheck / build — all PASS

Post-implementation fixes during migration runtime debugging:

- `GRANT USAGE, SELECT ON SEQUENCE request_seq TO service_role` — sequence not auto-granted to service_role in Supabase SQL migrations
- `GRANT INSERT, SELECT, UPDATE ON TABLE requests TO service_role` — table permissions not auto-granted either
- `GRANT INSERT, SELECT ON TABLE request_files TO service_role` — same root cause
- Root cause documented: Supabase `service_role` has `BYPASSRLS` but does NOT receive table/sequence permissions automatically when schema is created via SQL (unlike dashboard-created tables); all grants must be explicit in migration
- `UPDATE` on `requests` included proactively for admin panel status/read_at updates (Stage 4B)
- `SECURITY DEFINER` evaluated and rejected in favour of explicit grants — maintains least privilege, respects RLS model

End-to-end verification (manual, real Supabase):

- Migration applied successfully in Supabase SQL Editor
- `requests` and `request_files` tables created with RLS enabled
- `create_request` RPC function verified in Database → Functions
- `request_seq` sequence created and accessible to `service_role`
- Real form submission completed end-to-end
- `referenceCode` generated correctly (`REQ-2026-NNNN` format)
- Request record persisted in `requests` table
- File records persisted in `request_files` table
- Files visible in Supabase Storage under `{clientSubmissionId}/reference/` and `.../placement/`
- Success screen displays `referenceCode`
- Cleanup-on-failure path verified during debugging (storage files deleted on DB error)

---

### 2026-06-21 — Documentation sync before Stage 3C.3

Status: Documentation only

Decisions recorded:

- **Reference Code**: human-facing `referenceCode` field (`REQ-YYYY-NNNN`) — server-generated, stored in DB, shown on success screen and in admin panel. DB UUID remains primary key; `clientSubmissionId` remains technical idempotency/storage identifier. See PROJECT_DECISIONS.md — Reference Code Decision.
- **Client Name**: required `clientName` field added to product scope. Dedicated small stage `3C.3.5` added before admin work. See PROJECT_DECISIONS.md — Client Name Decision.
- **AI Tattoo Title**: recorded as a post-MVP backlog idea only — no architecture work, no DB column reserved. See PROJECT_BACKLOG.md.

Plan updates:

- `3C.3` updated: `referenceCode` generation added to scope; `clientName` column noted in schema task
- `3C.3.5` added: dedicated Client Name field stage
- `3D.0` updated: deduplication returns existing `referenceCode` from DB
- `requestId` terminology clarified throughout plan: `requestId` in historical log entries preserved as-is (refers to the temporary placeholder value); `referenceCode` used for the permanent human-facing identifier going forward

No code changes.

---

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
