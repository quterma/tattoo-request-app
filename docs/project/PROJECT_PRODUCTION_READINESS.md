Purpose
Document pre-release production readiness checkpoints.

Scope
Security reviews, dependency checks, and release validation steps.
Not an implementation task list — these are verification checkpoints before public launch.

Audience
AI agents and developers preparing the project for production release.

---

**Stage 5C closure note (2026-07-08):** Stage 5C (real-infrastructure/manual end-to-end
verification) is closed — see PROJECT_STAGE_LOG.md, 2026-07-08 closure entry. **This closes no
checklist item on this page.** Every item below remains exactly as open/closed as stated in its
own section; Stage 5C only confirmed that the deployed application's core flows work end-to-end
against real Vercel/Supabase infrastructure, not that any production-environment, security-review,
or launch checkpoint here is satisfied.

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
- **`UPLOAD_TOKEN_SECRET` — NEW, required, added by Stage 6 Item 1 (2026-07-14). OWNER ACTION:
  must be set in Vercel before the next deploy or the build fails** (`requireEnv` throws at module
  load — deliberately fails loudly, not silently). Generate a fresh value for production (do not
  reuse the local dev value): `openssl rand -base64 32` → 32 random bytes, base64. It encrypts the
  opaque upload handles handed to public visitors (AES-256-GCM, `src/services/uploadToken.ts`).
  Rotating it invalidates all in-flight handles — a visitor mid-form must re-add their images;
  blast radius is bounded by the ~2 h handle TTL, so rotation is safe, just briefly disruptive.

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

**Phased pre-launch decision reinforced 2026-07-08** (see PROJECT_DECISIONS.md — Stage 5C
Deployment Workflow and Environment Decisions, Section C): the current single-Supabase-project /
single-Vercel-deployment setup continues to be used for controlled test data only during this
verification phase — not claimed as production. Before real users / public launch: separate
Supabase staging and production projects, separate Vercel environment values per environment,
separate Auth Site URL/Redirect URLs/OAuth config per environment, and a defined migration
promotion process from staging to production. None of this has been created yet.

**Decided 2026-07-08** (see PROJECT_DECISIONS.md, Stage 5C Deployment Workflow and Environment
Decisions, Section D): the current controlled-test project/deployment is designated to become the
future **staging** environment — not yet converted, still test data, not production. A separate,
new, clean **production** Supabase project and Vercel production configuration must be created
before accepting real client requests. Separate Supabase projects for staging and production is
the approved model; **one-project/multiple-schema separation is not an approved option**, since
Supabase Auth/Storage/Realtime are project-wide, not schema-scoped. Pending, not yet decided: the
stable staging URL mechanism, exact Supabase/Vercel plan capabilities and pricing, a written
migration promotion checklist, and staging seed-data approach.

> **Note — Stage 6 Item 10 is independent of the Pro decision (corrected 2026-07-22).** An earlier
> version of this note claimed the Vercel Pro decision "resolved a fork" in Item 10's abuse control
> (`if Pro → Vercel KV, else → Upstash`). **That was wrong on the facts** and is withdrawn: the Item 10
> research established that **Vercel KV no longer exists** (migrated to Upstash, Dec 2024) and Pro
> **neither bundles nor gates** the limiter. Item 10 was decided independently as **Option B — a
> durable per-IP Upstash quota** (PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation" §2;
> research `research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md`). **Pro is still
> likely needed** — but only for the Hobby commercial-use restriction (terms), which is genuinely part
> of the plan/pricing decision above; it is not a limiter dependency. Marketplace-vs-native Upstash is
> a provisioning detail, not a Pro question.

## Production Environment Setup

Before public launch:

- production domain configured and pointed at the Vercel deployment
- production env vars set in Vercel (not committed) — see `.env.example` for the required list
- Google OAuth: production redirect URI added in Google Cloud Console and Supabase Dashboard (in addition to the dev URI already configured in Stage 4A.6) — see PROJECT_DECISIONS.md, Admin Authentication Architecture
- Auth Dashboard verification (Stage 5B task): redirect URLs for `/auth/callback` and
  `/auth/reset-callback` — **partially done, 2026-07-08**: Site URL and Redirect URLs now include
  the deployed Vercel origin alongside localhost, verified live (see PROJECT_STAGE_LOG.md,
  2026-07-08 entry). Custom SMTP configuration status, rate limits, and enabling "Leaked Password
  Protection" (flagged by `supabase db advisors` during Stage 5A.2) remain **not done** — see
  PROJECT_DECISIONS.md, Stage 5A Security / Data-Boundary Decisions
- Supabase automatic backups confirmed enabled on the production project (managed by Supabase; verify retention window in the dashboard) — **not yet done; full backup posture (DB dump, Storage backup, PITR) is explicitly deferred until real/valuable data exists or pre-launch, per Stage 5A (see PROJECT_DECISIONS.md). Do not treat this as complete.**
- basic monitoring/logging confirmed reachable (Vercel deployment logs / Supabase logs) — no new logging service required for MVP
- manual smoke test of full submission and admin flow performed against the deployed production environment (not just local)

## Upload Security Review

**Rewritten 2026-07-14** — Stage 6 Item 1 replaced the batch-upload-at-submit pipeline with
selection-time upload (`POST /api/upload`, public and unauthenticated). See PROJECT_DECISIONS.md —
"Stage 6 Upload-Flow Architecture".

- File size limit enforced **both client- and server-side (4 MB per file** — amended from 10 MB;
  bounded by Vercel's 4.5 MB Function request-body ceiling, not by preference). Per file, not per
  submission.
- MIME type validated server-side against an allow-list
- **Magic-byte verification implemented** — the first bytes of every upload are checked against the
  file's *own* declared type, so a mislabeled non-image is rejected (closes the former backlog item)
- File count enforced server-side at adoption (≤3 per category, ≤9 total), not only by client schema
- Uploaded files are bound to their session by an **encrypted, server-minted handle** (AES-256-GCM);
  final submit adopts only handles minted for the submitting `clientSubmissionId`, so one visitor
  cannot attach another's upload. Storage paths never reach the client.
- 🟡 **PARTLY CLOSED — automated storage growth: the code control is IMPLEMENTED and LIVE-VERIFIED
  (2026-07-22/23); the operational debt (CO-4) is still open.** The old hole (caller-resettable
  per-session cap + in-memory, per-instance rate limiter) is closed by **Option B — a durable per-IP
  Upstash quota**, 60/IP/24h, fail-closed: commits `d5e8ae3`, `9da4433`;
  `tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md` (`status: done`).
  **Verified against production 2026-07-23** (`reviews/done/REVIEW_2026-07-23_stage6-item10-co2-live-verification.md`):
  429 with a 24h `Retry-After` on breach; a limiter-down condition returns **503 with no Storage
  write**; the counter survives a redeploy (durable, not per-instance); an independent real IP is
  unaffected; forged `x-forwarded-for` / `x-vercel-forwarded-for` cannot mint a fresh bucket.
  **Still required before launch (CO-4, owner actions — see STAGE_6_STRAT_BRIEF.md → "Owner pre-deploy
  actions"):** the alert on the 429/503 signal with a tested recipient, the WAF deny drill on
  POST /api/upload, and Vercel + Supabase spend safeguards — all bundled with the **Vercel Pro
  decision** below, since alerts and WAF are Pro-gated (owner decision 2026-07-23).
  **Residual by design:** Option B bounds one source, not the number of sources; a distributed caller
  is not bounded (Option C — global circuit-breaker — deferred behind triggers in PROJECT_DECISIONS.md).
  Exposure remains storage cost, not data: bucket private, 4 MB cap, real-images-only.
- ⚠️ **No cleanup job for orphaned Storage objects** (uploads never submitted). Pre-existing,
  post-launch/operational — but selection-time upload structurally increases their volume. Tracked
  in PROJECT_BACKLOG.md.

## API Validation Boundary Review

- All public API inputs validated server-side in BFF before use
- `clientSubmissionId` validated as UUID v4 server-side
- No raw user input passed to storage paths or DB queries without validation

---

# CI/CD

Goal: a practical, minimal deploy pipeline — not an over-engineered one.

- GitHub connected to Vercel; every PR gets a Vercel preview deployment
- Vercel's default Git integration auto-deploys on merge to `main` — this is a deploy mechanism,
  not a claim that `main` is the production branch today. See PROJECT_DECISIONS.md — Stage 5C
  Deployment Workflow and Environment Decisions, Section A: the current deployment reached via this
  mechanism is used for controlled verification/test data, not public production; `main` becomes
  the production branch only once a real production environment and release policy exist,
  including the environment separation below.
- lint, typecheck, tests, and build (`pnpm qg`) must pass locally before merge, per the Pre-Commit Checklist in `.claude/CLAUDE.md`
- no dedicated GitHub Actions workflow required for MVP unless `pnpm qg` needs to run as a required PR check — revisit only if manual discipline proves insufficient
- staging environment (separate Supabase project + Vercel preview/staging) is a prerequisite decision — see Environment Separation above

**Reinforced 2026-07-08** (see PROJECT_DECISIONS.md — Stage 5C Deployment Workflow and
Environment Decisions, Section B): a required remote CI check (e.g. GitHub Actions running
`pnpm qg`) is confirmed **not currently implemented** — the MVP baseline remains local `pnpm qg` +
Husky pre-commit + Vercel's Git deploy. Add a required remote CI workflow before public launch, or
whenever collaboration/PR volume makes local-only gates insufficient — whichever comes first. This
is a decision with a defined trigger, not a claim that CI is already in place.

The first Vercel deployment (2026-07-08) was made directly from `main` rather than via a
Preview-branch review flow — see PROJECT_DECISIONS.md, Section A, for the intended feature-branch
+ Preview-deployment workflow this should move toward, and its implication for Supabase Redirect
URL allowlisting when testing auth against Preview URLs.

**Target release flow, decided 2026-07-08** (see PROJECT_DECISIONS.md, Section D): feature branch
/ PR → Preview deployment for ordinary review → stable staging deployment → manual smoke/QA →
production deployment only after staging verification → production smoke verification after
release. Exact branch names, the Vercel stable-alias mechanism, and any Redirect URL wildcard
syntax remain undecided until verified during implementation. When a remote CI check is added, it
runs the smallest possible `pnpm qg` job; Vercel's Git integration remains solely responsible for
deployment, and migration promotion stays manual (staging first, verify, then production) — no CI,
scripts, or migration automation is added now.

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
  below) — ✓ completed/closed 2026-07-10
- After major post-launch integrations (Telegram notifications, calendar, payments)

## Stage 5D — Final Pre-Stage-6 / Post-Hardening Maturity Audit

**✓ Completed/closed 2026-07-10** — primary audit + fix passes (commits `9bc8e6f`, `043bcb7`) +
independent closure verification (`STAGE_5D_READY_TO_CLOSE`); see PROJECT_STAGE_LOG.md, 2026-07-10
Stage 5D closure entry. This closes the audit checkpoint only — every other pre-launch requirement
in this document (production environment setup, custom SMTP, backups/PITR, monitoring, CI,
staging/production split, performance validation, manual QA) remains separately open and is not
affected by Stage 5D closure.

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

# Pre-Deploy Content Swaps

Placeholder content markers left in the codebase during Stage 6, each flagging a pending pre-deploy
owner swap. Three independent markers exist for different categories of placeholder; find every
pending swap in one step with the combined grep:

```
grep -rn "__meta_TODO\|__intro_TODO\|__asset_TODO" app/ src/ public/
```

- `__meta_TODO` — interim metadata (site domain, OG image, favicon, `robots` noindex→index flip).
  Title/description/site name are final (Stage 6 Item 6) and do not carry this marker.
- `__intro_TODO` — placeholder request-form introduction copy. (Discharged — no matches remain as
  of Stage 6 Item 6; kept here in case a future placeholder reuses the convention.)
- `__asset_TODO` — placeholder visual assets (currently: 4 Home Featured Work images, Item 5/16).

The Item 13 stage-closing acceptance sweep must fail while any of the three markers remain.
Renaming the three markers into one shared prefix was considered and rejected (Stage 6 Item 17) —
they are embedded across many done tasks/reviews and the combined grep already gives one-step
discovery without that churn.

---

# AI Review (Optional)

Before major releases or significant feature additions:

- Optional: CodeRabbit review of the release diff
- Optional: AI-assisted review of changed files for correctness and security issues

These are optional checkpoints, not required gates.
