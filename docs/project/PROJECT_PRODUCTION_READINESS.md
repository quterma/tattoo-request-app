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

## Environment Variables and Secrets

- All required env vars documented in `.env.example`
- No secrets committed to the repository
- `.env*` files confirmed in `.gitignore`
- `SUPABASE_SECRET_KEY` is `service_role` key — never exposed to client

## Supabase RLS Review

- RLS enabled on all application tables (`requests`, `request_files`)
- No public policies exist — all access through BFF with `service_role`
- Verify no accidental `anon` role grants were introduced

## Storage Permissions Review

- `request-images` bucket confirmed private
- No public bucket policies
- Signed URLs used for admin access only — never returned to public users
- Verify storage policies in Supabase Dashboard before launch

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

Not required before Stage 4A.
Address before production release — Stage 3D.5 audit confirmed this remains an open gap.

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
- After Stage 4B — Admin Panel
- Before production release (final pre-launch audit)
- After major integrations (Telegram notifications, any future scheduler or payment work)

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
