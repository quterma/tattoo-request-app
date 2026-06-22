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

# AI Review (Optional)

Before major releases or significant feature additions:

- Optional: CodeRabbit review of the release diff
- Optional: AI-assisted review of changed files for correctness and security issues

These are optional checkpoints, not required gates.
