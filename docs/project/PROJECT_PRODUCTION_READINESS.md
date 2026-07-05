Purpose
Document pre-release production readiness checkpoints.

Scope
Security reviews, dependency checks, and release validation steps.
Not an implementation task list — these are verification checkpoints before public launch.

Audience
AI agents and developers preparing the project for production release.

---

# Dependency Security

## Before Release

- Run `pnpm audit` and review findings before public launch
- Resolve or document any high/critical severity issues

## Ongoing

- Review dependencies when adding major packages
- Prefer packages with active maintenance and known security posture

---

# Security Review Checklist

Complete before public launch:

## Email Delivery (Password Reset / Auth Emails)

- Supabase's built-in email provider is limited and best-effort — not intended for production volume
- Current Supabase limits observed during Stage 4A.7 manual testing: built-in email provider ~2 emails/hour; password reset endpoint ~60-second per-user cooldown
- Repeated password-reset requests during testing stopped arriving after a few attempts — consistent with these limits, not a bug
- Before public launch: configure custom SMTP in Supabase Dashboard → Authentication → Email (the built-in provider's rate limit cannot be raised without custom SMTP; only custom-SMTP-relevant limits are configurable under Authentication → Rate Limits)
- Verify email deliverability (SPF/DKIM) once custom SMTP is configured

## Environment Variables and Secrets

- All required env vars documented in `.env.example`
- No secrets committed to the repository
- `.env*` files confirmed in `.gitignore`
- `SUPABASE_SECRET_KEY` is `service_role` key — never exposed to client

## Supabase RLS Review

**Verified live 2026-07-05 (Stage 5A.2, read-only) — see PROJECT_DECISIONS.md, Stage 5A Security
/ Data-Boundary Decisions, for the full decision record:**

- RLS confirmed enabled on all four application tables (`requests`, `request_files`, `studios`,
  `studio_members`)
- **Zero RLS policies exist on any table — confirmed intentional (deny-all-by-omission), not an
  oversight.** All access goes through `service_role`, which bypasses RLS; no policy is planned
  until a real non-service-role access path is introduced (see PROJECT_DECISIONS.md)
- Confirmed live: no `anon`/`authenticated` grants for `SELECT`/`INSERT`/`UPDATE`/`DELETE` exist on
  any table — no accidental public policy or grant found
- `studio_members` self-read policy considered and explicitly deferred (see PROJECT_DECISIONS.md)

## Storage Permissions Review

**Verified live 2026-07-05 (Stage 5A.2, read-only):**

- `request-images` bucket confirmed private (`public: false`)
- No public bucket policies; RLS enabled with zero policies on `storage.objects`, same
  intentional deny-all-by-omission posture as the table RLS above
- **Bucket-level MIME-type/file-size limits configured 2026-07-05 (Stage 5B.2):**
  `file_size_limit = 10485760` (10 MB), `allowed_mime_types` = `image/jpeg`, `image/png`,
  `image/webp`, `image/heic`, `image/heif` — matching the existing app-layer `validateFiles`
  allow-list exactly. Applied via the Supabase Storage API (`updateBucket()`), verified live by
  re-reading the bucket config, plus a real smoke-test submission confirming upload and signed-URL
  access still work. See PROJECT_STAGE_LOG.md (2026-07-05 entry) for the full record.
- Signed URLs used for admin access only — never returned to public users
- Storage path-prefix RLS policies considered and explicitly deferred (see PROJECT_DECISIONS.md)
- Legacy (pre-`{studioId}/` prefix) storage paths were identified and cleaned up in Stage 5A.3/5A.4
  — 0 legacy-format `request_files` rows remain as of 2026-07-05

## Environment Separation

Before public launch, decide on and set up environment separation:

- staging Supabase project (separate from production — separate DB, storage, auth)
- Vercel preview / staging environment pointed at staging Supabase
- production Supabase project protected; no test data or preview deployments pointing at it

Not required before Stage 3D.6 or Stage 4A. **Decided in Stage 5A (2026-07-05, see
PROJECT_DECISIONS.md): not a hard blocker for the minimal Stage 5B hardening pass** (search_path
fix, bucket Dashboard limits, Auth Dashboard verification — all small, reversible, verifiable live
changes). Staging **is required** before any future work introducing real authenticated-role RLS
policies, browser-side Supabase access, multi-studio behavior, or a `create_request` signature/
behavior change. Only one Supabase project exists today (confirmed live in 5A.2).

## Production Environment Setup

Before public launch:

- production domain configured and pointed at the Vercel deployment
- production env vars set in Vercel (not committed) — see `.env.example` for the required list
- Google OAuth: production redirect URI added in Google Cloud Console and Supabase Dashboard (in addition to the dev URI already configured in Stage 4A.6) — see PROJECT_DECISIONS.md, Admin Authentication Architecture
- Auth Dashboard verification (Stage 5B task, not yet done as of 2026-07-05): redirect URLs for
  `/auth/callback` and `/auth/reset-callback`, custom SMTP configuration status, rate limits, and
  enabling "Leaked Password Protection" (flagged by `supabase db advisors` during Stage 5A.2) — see
  PROJECT_DECISIONS.md, Stage 5A Security / Data-Boundary Decisions
- Supabase automatic backups confirmed enabled on the production project (managed by Supabase; verify retention window in the dashboard) — **not yet done; full backup posture (DB dump, Storage backup, PITR) is explicitly deferred until real/valuable data exists or pre-launch, per Stage 5A (see PROJECT_DECISIONS.md). Do not treat this as complete.**
- basic monitoring/logging confirmed reachable (Vercel deployment logs / Supabase logs) — no new logging service required for MVP
- manual smoke test of full submission and admin flow performed against the deployed production environment (not just local)

## Upload Security Review

- File size limit enforced server-side (10 MB per file)
- MIME type validated server-side against allow-list
- Magic-byte verification not implemented (documented in PROJECT_BACKLOG.md — acceptable for MVP at low volume)
- File count per field enforced by schema validation before upload

## API Validation Boundary Review

- All public API inputs validated server-side in BFF before use
- `clientSubmissionId` validated as UUID v4 server-side
- No raw user input passed to storage paths or DB queries without validation

---

# CI/CD

Goal: a practical, minimal deploy pipeline — not an over-engineered one.

- GitHub connected to Vercel; every PR gets a Vercel preview deployment
- `main` auto-deploys to production on merge (Vercel's default Git integration — no custom pipeline needed at this scale)
- lint, typecheck, tests, and build (`pnpm qg`) must pass locally before merge, per the Pre-Commit Checklist in `.claude/CLAUDE.md`
- no dedicated GitHub Actions workflow required for MVP unless `pnpm qg` needs to run as a required PR check — revisit only if manual discipline proves insufficient
- staging environment (separate Supabase project + Vercel preview/staging) is a prerequisite decision — see Environment Separation above

---

# Performance Validation

## Observation

End-to-end request submission currently takes roughly 1–2 seconds in local development with two small images and the full flow: validation → storage upload → DB persistence → response.

This is not considered a bug and no optimization work is requested.

## Before Release

Measure submission latency on the deployed environment (Vercel + Supabase):

- 2 small images
- several large images
- maximum supported upload set (3 reference + 3 placement)

Determine an acceptable UX target for production.

Only optimize if production measurements indicate a real user experience problem.

This is a release-readiness verification item, not a backlog task and not a performance issue.

---

# Integration / End-to-End Test Coverage

## Context

Unit and service-layer tests cover individual functions in isolation. Route-level tests
(added in Stage 3D) cover the handler logic against mocked services. However, the
idempotency replay and race-condition paths are hard to exercise through the UI manually
and are not covered by any test that touches a real database or storage layer.

## Suggested coverage before production release

- normal request submit: form → API → storage → DB → referenceCode returned
- replay with same `clientSubmissionId`: same `referenceCode` returned, no second DB row
- replay: `uploadRequestFiles` not called a second time
- UNIQUE constraint race fallback: second upload cleaned up, existing `referenceCode` returned
- DB/storage consistency: `request_files` rows correctly linked to `requests` row after insert
- failed DB insert: uploaded storage files deleted (cleanup path)

## When to address

Not required before Stage 4A or 4B.
Address in Stage 5 (Production Hardening) before public launch — Stage 3D.5 audit confirmed this remains an open gap.

Implementation options:
- Vitest integration tests with a real Supabase test project (separate from production)
- Playwright / end-to-end tests against a local or preview deployment
- Manual test protocol documented and executed before launch (minimum viable option for MVP)

---

# Architecture & Documentation Audit Checkpoints

Architecture and documentation audits should be conducted after major milestones to catch
consistency gaps, stale references, and pre-launch risks before they compound.

## Planned audit checkpoints

- After Stage 4A — Admin Authentication
- After Stage 4B — Admin Dashboard
- Stage 5D — Full Application Maturity Audit + Targeted Fix Pass (final pre-Stage-6 audit — see
  below)
- After major post-launch integrations (Telegram notifications, calendar, payments)

## Stage 5D — Final Pre-Stage-6 / Post-Hardening Maturity Audit

Canonical detailed scope, method, finding classification, deliverables, and exit criteria live in
`PROJECT_IMPLEMENTATION_PLAN.md` — Stage 5D. This section only fixes the readiness-protocol
framing; do not duplicate the full scope here.

- **Timing:** after Stage 5A (security/data-boundary planning), 5B (hardening implementation),
  and 5C (real-infrastructure and end-to-end verification) — i.e. after the production
  architecture is actually complete — and before Stage 6 begins.
- **Coverage:** the full application, not only files changed during Stage 5.
- **Method:** primary repo-aware audit, plus an independent second-opinion audit where available
  (e.g. a different agent/tool); if the second opinion cannot be run, that limitation must be
  recorded explicitly rather than treated as satisfied.
- Findings must be evidence-based (verified against actual code) and classified — see
  PROJECT_IMPLEMENTATION_PLAN.md, Stage 5D, Finding classification.
- No speculative refactor may start from an audit finding without a separately approved, bounded
  implementation plan.
- All "must fix before Stage 6" findings must be closed, verified, and covered by quality gates
  before Stage 6 begins.
- Deferred/accepted risks must be explicitly recorded (PROJECT_BACKLOG.md, with rationale and a
  pointer to the audit report / Stage 5D closure entry) — not silently dropped.

## Deferred from Stage 4B — pre-release manual QA item

Physical mobile-device verification of the 4B.5.1 admin image viewer (iPhone Safari, Android
Chrome — pinch zoom, pan after zoom, double tap, swipe, close button, backdrop tap,
portrait/landscape) was never performed during Stage 4B (no device/deployment access) and does
not block Stage 4B closure. Must be verified manually before public launch — see
PROJECT_BACKLOG.md (Admin image viewer entry) and PROJECT_IMPLEMENTATION_PLAN.md (Stage 6) for
the full item, including the gated low-resolution-zoom-cap follow-up.

## Audit protocol

Each audit follows the same pattern as Stage 3D.5.1:

1. Audit first — read-only review, report findings by severity (Critical / High / Medium / Low)
2. Developer approves fix scope — not everything found must be fixed immediately
3. Fix pass — separate stage, with quality gates before commit

**Audits are checkpoints, not automatic refactor permission.**
Finding something during an audit does not authorize refactoring it. Each fix requires explicit approval.

---

# AI Review (Optional)

Before major releases or significant feature additions:

- Optional: CodeRabbit review of the release diff
- Optional: AI-assisted review of changed files for correctness and security issues

These are optional checkpoints, not required gates.
