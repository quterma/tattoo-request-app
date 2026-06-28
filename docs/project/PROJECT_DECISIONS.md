Purpose  
Record important product and technical decisions that should not be re-evaluated during normal implementation.

Scope  
Stable decisions affecting product scope, architecture, and implementation boundaries.  
Does not contain temporary tasks or progress logs.

Audience  
AI agents and developers working on the project.

---

# Admin Authentication Requirement

Admin authentication is required before the first public release.

The admin interface must not be publicly accessible in production.

Hidden URLs, unlinked routes, or security through obscurity are not considered sufficient protection.

Authentication may be implemented after the request submission flow is completed, but must be completed before public launch.

---

# Quality Gates Policy

After every implementation task and before presenting results, the following must be run automatically:

- lint
- typecheck
- tests
- build

Do not wait for human confirmation before running quality gates.

Human review is required before commits, not before validation.

---

# MVP Quality Standard

This is a production MVP — not a prototype.

MVP means limited scope, not reduced quality.
Every feature included in the first public release must be production-ready for real client usage.

---

# Product Decisions

- The product is a production MVP for a single real tattoo artist.
- The product is not a SaaS platform.
- The main goal is to replace unstructured chat-based intake with a structured request flow.
- Mobile-first usage is the primary target.
- English is the active MVP language.
- RU and HE are reserved for later validation and expansion.

---

# Scope Decisions

- Booking and calendar integration are out of scope for MVP.
- Payments and deposits are out of scope for MVP.
- Instagram and WhatsApp API integration are out of scope for MVP.
- CMS and advanced content editing are out of scope for MVP.
- Multi-artist support is out of scope for MVP.
- Advanced analytics are out of scope for MVP.

---

# UX Decisions

- The request form is the core feature of the product.
- Static public pages are intentionally simple and support the request flow.
- Image uploads are part of the initial request process.
- Files are immutable after submission.
- Public users are anonymous.
- Admin access is private and limited.

---

# Architecture Decisions

- The system uses a single web application with a managed backend.
- No standalone custom backend service is planned for MVP.
- Backend-for-frontend (BFF) may be used via Next.js Route Handlers where needed.
- Supabase (PostgreSQL) is the chosen database, treated as an external managed system.
- Supabase Storage is the chosen file storage. Storage bucket must be private.
- Telegram is the planned notification channel (post-launch, not part of the initial production release).
- Global state management is not used in MVP.
- Feature-oriented frontend structure is used.

---

# Service Layer Decisions

- External systems (database, storage, Telegram) must be accessed through the service layer only.
- Do not introduce provider abstractions, DI containers, factory patterns, or interface hierarchies unless a second real provider is added.
- Keep service layer simple and YAGNI-compliant.

---

# File Access Decisions

- File access mechanism for admin: signed URLs generated server-side in the BFF.
- Image Proxy through BFF was considered and rejected. Technical review completed in Stage 3C.2 planning.
- Reasons: signed URLs are simpler, have no streaming overhead, and Supabase enforces private bucket access without a proxy layer.
- Signed URLs are generated on demand when the admin loads a request. Expiry: ~1 hour.
- Admin access only. Public users never receive signed URLs or storage paths.

---

# File Data Model Decisions

Request files are modeled as a typed collection. Each file record contains:

- type: "reference" | "placement"
- storagePath
- originalName
- mimeType
- size

The current request form has two upload inputs: reference images and placement images.
These map directly to the two type values above.

This is the data-shape direction for persistence. Implementation is part of Stage 3C.3.

---

# Storage Decisions

## Bucket

- Single private Supabase Storage bucket: `request-images`
- Bucket must remain private at all times

## Folder Structure

```
request-images/{clientSubmissionId}/reference/
request-images/{clientSubmissionId}/placement/
```

## Storage Filenames

- Storage filenames do not use original filenames
- Deterministic naming by type and index:
  - `reference-01.jpg`, `reference-02.jpg`, ...
  - `placement-01.jpg`, `placement-02.jpg`, ...
- `originalName` is retained as metadata in the DB record only
- Extension is derived from the file's MIME type at upload time

## Images

- Store original files without modification
- No compression, no resizing
- Admin can view and download full-quality originals

---

# Upload Reliability Decisions

- Per-file retry on transient/network failures
- 2–3 automatic retries with exponential backoff
- No retry for validation failures
- Only failed files are retried — not the entire batch

---

# Failure Handling Decisions

- All-or-nothing submission: either all files and the DB record are created, or nothing persists
- If upload process ultimately fails after retries: delete already-uploaded files, return error to client
- If DB insert fails after successful uploads: delete uploaded files, return error to client
- All cleanup attempts must be logged
- All cleanup failures must be logged explicitly

---

# clientSubmissionId — Storage Foundation

- `clientSubmissionId` is introduced in Stage 3C.2 as the storage folder identifier
- Generated client-side (UUID v4) before form submission
- Sent with the request payload; used to name the storage folder
- Full idempotency logic (deduplication, unique constraint, server-side check) remains in Stage 3D
- Storage folder structure must remain compatible with future resumable-upload support

---

# Upload UX Decisions

- File input must support mobile users selecting images from phone gallery, files, or camera where the browser and OS support it.
- Native file input behavior is used for MVP. No drag-and-drop, thumbnails, or advanced upload UI required.

---

# Development Decisions

- The project must remain simple and avoid over-engineering.
- AI agents must follow framework and project documentation.
- Large refactors require approval.
- New dependencies require approval.
- Testing remains minimal and focused on regression-prone logic.
- Manual verification is acceptable for layout and static content.

---

# Reference Code Decision

Every submitted request is assigned a human-readable reference code.

- Format: `REQ-YYYY-NNNN` (e.g., `REQ-2026-0001`)
- Generated server-side on request creation
- Stored in the database alongside the DB primary key (UUID)
- Shown to the client on the success screen after submission
- Shown in the admin panel for request management
- Used in communication between the artist and client

## Identifier Roles

| Identifier | Type | Purpose |
|---|---|---|
| DB UUID (`id`) | UUID | Primary key, internal DB reference |
| `clientSubmissionId` | UUID v4 | Technical idempotency identifier, storage folder path |
| `referenceCode` | `REQ-YYYY-NNNN` | Human-facing identifier, shown to client and admin |

`referenceCode` is the identifier used in all human-facing contexts. DB UUID and `clientSubmissionId` are internal and never shown to users.

---

# Client Name Decision

A required `clientName` field is introduced to the request form.

- Purpose: enables the artist to address clients by name in communication and admin workflow
- Required field — no anonymous submissions
- Single field (not first/last name split)
- Validation: required, trim, min 2, max 30 characters
- Stored with the request record in the database (`client_name TEXT` column)
- Shown in the admin panel alongside request details
- Implemented in Stage 3C.3.5 (dedicated stage before admin panel work)

---

# Request Identity & Idempotency Decisions

**Production Requirement — not Nice-to-Have.**

## Problem

Without authentication, users may accidentally submit the same request multiple times due to:

- page refresh
- network issues
- repeated submit attempts
- browser or app interruptions

Duplicate requests reaching the artist are unacceptable for production.

## Decision

Introduce a client-generated submission identifier: `clientSubmissionId` (UUID).

- generated on the client before submission
- sent with every request attempt
- stored with the request record in the database

## Server Behavior

When a request arrives:

- if `clientSubmissionId` is new → create the request
- if `clientSubmissionId` already exists → do not create a duplicate; return existing request information

Goal: idempotent request creation.

## User Experience

After successful submission:

- user receives the `referenceCode` (e.g., `REQ-2026-0001`) on the success screen
- future support and communication use `referenceCode` as the shared identifier
- when Telegram notifications are implemented (post-launch), the artist will receive the same `referenceCode` in the notification

## Implementation

Implemented in Stage 3D.0 (completed). Applied before public production launch as required.

---

# Database Stage Completion Criteria

Unit tests, typecheck, and build are insufficient to verify database-related stages.

Stages involving migrations, RLS, RPC functions, permissions, or storage policies are only considered complete when:

- migration applied to the real Supabase project
- at least one successful end-to-end operation performed against real infrastructure
- affected database objects verified (tables, functions, permissions, storage, policies)

Reason: runtime permission issues (e.g. sequence grants, table grants) are invisible to unit tests and are only discovered during real Supabase execution. This was observed during Stage 3C.3 debugging.

---

# Migration Workflow Decisions

## CLI

Supabase CLI is installed as a project devDependency (`supabase` npm package).

- Canonical invocation: `pnpm exec supabase <command>`
- Never use a globally installed binary — version must be pinned and reproducible via `pnpm install`
- CLI version is managed in `package.json` devDependencies

## Applying migrations

All future schema changes must be applied via CLI, not the Supabase SQL Editor:

1. Create migration file: `pnpm exec supabase migration new <name>`
2. Write SQL in the generated file under `supabase/migrations/`
3. Apply to remote: `pnpm exec supabase db push`
4. Verify: `pnpm exec supabase migration list` — Local and Remote columns must match

## Verifying migration state

After any migration operation, confirm with:

```
pnpm exec supabase migration list
```

Local and Remote columns must show identical timestamps for all rows.

## Historical context

Migrations for Stages 3C.3, 3D.0, and 3D.5.2 were applied manually via SQL Editor before the CLI was introduced. Migration history was repaired in Stage 3D.5.3 using `supabase migration repair --status applied <timestamp>`. Repair is metadata-only — it records that a migration is already applied without re-executing its SQL.

---

# Rule for Future Changes

All architectural, product, or behavioral decisions MUST be recorded in this document.

Any decision in this document may be changed only when explicitly updated by the developer.

---

If implementation contradicts this document, implementation must be stopped and clarified.
