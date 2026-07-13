# Task: Stage 6 — Upload-flow architecture

## Status

`ready` · created 2026-07-13 · executor: <IMPL session name> ·
done: <date, commit hash, PROJECT_STAGE_LOG.md entry pointer>

## How to run (session settings)

- Model: Opus (architecture- and security-sensitive — public unauthenticated upload surface;
  Fable only if the design space turns out genuinely contested, per owner's usage-budget
  guidance 2026-07-13)
- Start mode: Plan mode (mandatory — this task is architecture design, not a scoped code change)
- Switch to edit/acceptEdits: only after the plan is explicitly approved
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md.
2. Stage 6 Source of Truth: `STAGE_6_PRODUCT_DEFINITION.md` (PRD), especially D4 (uploads
   optional, review trigger) and §4 (Non-Goals); `STAGE_6_FUNCTIONAL_SPECIFICATION.md`, §4.2
   (fields 5–7), §4.3 (upload constraints — selection-time upload, per-file progress, 10 MB,
   formats), §4.5 (per-file failure isolation, abuse mitigation), §4.6 (reference code).
3. PROJECT_DECISIONS.md — "Stage 6 UX Blueprint Decisions" → Request page section, especially
   **"Upload-flow architecture prerequisite"** (the Codex blocker finding this task exists to
   resolve — read it in full, it names the exact shipped-vs-target gaps) and D-Blueprint 4/5(a)
   (why the vertical stack and required persistence decisions depend on this architecture).
4. `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` — this is Item 1, blocking Item 3 (Request form
   rebuild) and Item 4 (Success page, shares the persistence store).
5. Current shipped code to read before designing anything (do not assume, verify):
   `src/features/request/ui/RequestForm.tsx` (local `File` state, one final `FormData`,
   component-local `clientSubmissionId` via `useState(() => crypto.randomUUID())`),
   `app/api/request/route.ts` (validates complete request, then uploads as a batch),
   `src/services/storage.ts` (`FileType = "reference" | "placement"`, all-or-nothing upload with
   cleanup on any failure), `supabase/migrations/20260622000000_create_requests.sql` (the
   `reference`/`placement` DB constraint), and the admin request-detail file viewer (groups by
   the same two categories — check `src/services/requests.ts` and the admin UI for exactly where
   the two-category assumption is baked in).
6. PROJECT_ARCHITECTURE.md — Service Layer section (service-layer-only access to
   Storage/DB; `services/supabase.ts` is the service-role client).

## Goal

Design (and, once approved, implement) the upload pipeline the Stage 6 blueprint assumes:
selection-time upload with per-file progress/retry/remove, three semantic upload categories
end-to-end, and a client-side handle that survives the required in-session form persistence
(PROJECT_DECISIONS.md D-Blueprint 5(a)) — replacing the current batch-upload-at-submit,
two-category pipeline. This is a redesign of a public, unauthenticated write surface, not a UI
tweak; treat it with the scrutiny PROJECT_ARCHITECTURE.md and PROJECT_DECISIONS.md's existing
Storage/security decisions (Stage 5A/5B) already established for this bucket.

## Scope

1. **Selection-time upload endpoint and authorization/abuse model.** How a file gets from
   "visitor selected it" to "stored object" before the request itself exists — what identifies
   and scopes the upload (see item 2), what prevents abuse of an endpoint with no request to
   attach to yet (rate limiting / signed short-lived tokens / other — FS §4.5 requires the
   overall submit endpoint to have abuse mitigation invisible to legitimate visitors, no
   CAPTCHA; decide whether that extends to this endpoint or a different mechanism is needed
   here specifically).
2. **Client-side opaque file handle + `clientSubmissionId` lifecycle.** `clientSubmissionId` is
   currently regenerated every `RequestForm` mount; it needs a lifecycle compatible with
   D-Blueprint 5(a)'s required in-session persistence (survives client-side navigation away and
   back) so uploads made before a navigation remain attached to the same in-progress request.
   Decide where this lives (the module-level persistence store D-Blueprint 5(a) already
   requires, most likely) and what the client holds as a reference to an uploaded-but-not-yet-
   submitted file (opaque handle, not raw storage path — mirror the existing signed-URL,
   never-expose-storage-path discipline from PROJECT_ARCHITECTURE.md's Admin Dashboard Flow).
3. **Three-category representation across DB, Storage, and the admin viewer.** FS §4.2 fields
   5–7 (artist work / external inspiration / placement photo) vs the shipped two categories
   (`reference` | `placement`). Decide the new category set's exact values, the DB constraint
   migration (`supabase/migrations/`, new migration file per existing CLI workflow —
   PROJECT_DECISIONS.md's Supabase CLI Migration Workflow section), the `FileType` type update,
   and what changes in the admin request-detail viewer to keep grouping/labeling correct.
4. **Per-file progress/retry/remove semantics** (FS §4.3/§4.5) — client-visible states for a
   single file (uploading, uploaded, failed) independent of the other files and of form
   submission; a failed upload must never block submission (FS §4.5).
5. **Final-submit adoption.** How `POST /api/request` (or its replacement) verifies and
   atomically adopts exactly this submission's previously-uploaded files (ownership check tied
   to `clientSubmissionId`, not just "any file with this ID exists") — replacing the current
   "upload everything at submit time" batch step.
6. **Cleanup/idempotency for unadopted uploads.** Files uploaded but never submitted (abandoned
   forms) become orphaned Storage objects — PROJECT_BACKLOG.md already tracks orphaned-object
   cleanup as a post-launch/operational item; this task defines what state makes an upload
   "orphaned" and whether/how idempotency is guaranteed if a submit is retried after a partial
   failure, but does not have to implement a cleanup job (confirm with PROJECT_BACKLOG.md's
   existing entry before deciding whether one is in scope here).

Deliverable: a written architecture decision (added to PROJECT_DECISIONS.md, per Workflow step 4
below) covering all six points, then its implementation.

## Out of Scope

- Rebuilding `RequestForm.tsx`'s field set, layout, or the single-scroll format itself — that is
  Item 3 (`STAGE_6_TASK_..._request_form_rebuild`, not yet created). This task only builds the
  upload plumbing Item 3 will consume; do not redesign unrelated form fields or validation.
- The Success page and its persistence-store gate (Item 4) — only the parts of the persistence
  store this task's `clientSubmissionId`/file-handle lifecycle needs to share with it.
- Reference-code generation (Item 9) and general submit-endpoint abuse mitigation beyond what
  overlaps with the selection-time upload endpoint (Item 10) — coordinate but do not implement
  those items' full scope here.
- Any visual/styling change.
- Admin dashboard features beyond the minimum viewer changes needed for the new category set.

## Workflow (enforced)

1. Read the Context docs and the shipped code listed above; confirm understanding in 3–5 lines
   before proceeding.
2. Work through Scope items 1–6 as a design pass first — do not start coding before a plan
   exists.
3. Before implementation: inspect the repository thoroughly (do not assume the summaries above
   are complete or current — verify); challenge assumptions; surface ambiguities; if the FS's
   upload-on-selection model turns out to need a product-level trade-off not already covered by
   PROJECT_DECISIONS.md, STOP and escalate rather than deciding it unilaterally (fail-fast per
   CLAUDE.md).
4. Present the architecture plan (all six Scope points, with the chosen approach and why) and
   wait for explicit developer approval before writing code.
5. Record the approved architecture as a new entry in PROJECT_DECISIONS.md before or alongside
   implementation (this is a first-class architectural decision, not an implementation detail).
6. Implement only after the plan is approved, within Scope only.
7. After implementation: run the Review Pipeline per AI_REVIEW_PIPELINE.md (Test Agent → Quality
   Gates `pnpm qg` → Review Agent); self-review for architecture conformance (PROJECT_ARCHITECTURE.md
   service-layer rules), regressions to the existing two-category flow during migration, and
   documentation updates; report remaining risks explicitly (this is a security-sensitive public
   surface — be explicit about what abuse scenarios were and weren't covered).
8. Never expand scope. If anything requires a PRD/FS change, STOP and request it first
   (PROJECT_DECISIONS.md — Stage 6 Product Documentation Authority).

## Acceptance Criteria

- A visitor can select a file in any of the three FS §4.2 upload categories and it uploads
  immediately, independent of form submission, with visible per-file progress.
- A failed individual file upload can be retried or removed without affecting other files or
  blocking form submission (FS §4.5).
- Files uploaded before a client-side navigation away from Request and back are still correctly
  attached when the visitor eventually submits (compatible with D-Blueprint 5(a)).
- `POST /api/request`'s final submit only persists files that were actually uploaded as part of
  this `clientSubmissionId`'s session — an attacker cannot attach another session's uploaded
  file by guessing/reusing an id or handle.
- The DB/Storage/admin-viewer representation supports exactly the three FS §4.2 categories with
  no code path still assuming only two.
- `pnpm qg` passes; existing request-submission tests are updated, not silently broken, by the
  category-set migration.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress) and PROJECT_DECISIONS.md (the architecture decision
  itself, per Workflow step 5).
- Update `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`'s Item 1 status row.
- Set Status to `done` with commit hash; move this file to `docs/project/tasks/done/`.
