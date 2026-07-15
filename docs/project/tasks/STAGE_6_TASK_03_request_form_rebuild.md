# Task: Stage 6 — Request form rebuild (Item 3, with Item 9 folded in)

## Status

`ready` · created 2026-07-14 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Execution

- Executor: `claude` (form field-model rebuild across UI + schema + BFF + reference-code
  generation on a public write surface — not delegable per AI_TASK_PROTOCOL.md, Delegating IMPL
  Tasks to Codex: contract-changing, security-adjacent, and touches files Item 1 just shipped)
- Baseline: **the commit that introduced this task file** — no hash written here (a file cannot
  name the commit that carries it). The executor derives it (`git log -1 --format=%H -- <this file>`)
  and cares only that its write surface has not moved/dirtied since.
- Reviewer: `claude` — plus a mandatory independent Codex cross-review at consensus
  (AI_CROSS_REVIEW.md). This task crosses the size trigger, so it is reviewed in **checkpointed
  blocks**, not once at the end — see "Review Granularity" below (AI_TASK_PROTOCOL.md — A Large Task
  Is Reviewed in Checkpoints; the Item 1 review missed two blockers because it ran once, at the end).

## How to run (session settings)

- Model: Opus (large, contract-changing, public unauthenticated surface). Sonnet only if the owner
  judges the plan de-risks it enough.
- Start mode: Plan mode (mandatory). The plan MUST carry a distinct "Deviations from the task file"
  section (AI_TASK_PROTOCOL.md — IMPL Session Duties).
- Switch to edit/acceptEdits only after the plan is explicitly approved.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md.
2. Stage 6 Source of Truth:
   - **FS §4 in full** — §4.1 (block order), **§4.2 (the field table — THIS is the target the
     form must match; the shipped form does NOT)**, §4.3 (upload constraints, as amended
     2026-07-14: 4 MB, no file name in UI), §4.4 (upload motivation cards + Appendix A.1 copy),
     §4.5 (states & failure behavior), §4.6 (reference code — Item 9, folded in here), §4.7
     (privacy statement + Appendix A.3).
   - **PRD** D3 (reply channel), D4 (uploads optional), D5 (48-hour promise, for the Introduction),
     D6 (eligibility: 18+ and for-self).
   - PROJECT_DECISIONS.md — **"Stage 6 UX Blueprint Decisions" → Request page**: D-Blueprint 1
     (single continuous scroll, not a wizard), D-Blueprint 4 (uploads = vertical stack, field order
     5→6→7), **D-Blueprint 5(a) (required in-session persistence — with its guarantee boundary)**,
     5(b) (clean history), 5(c) (validation = local smooth-scroll, no state change).
   - PROJECT_DECISIONS.md — **"Stage 6 Upload-Flow Architecture"** (Item 1's decision record — the
     plumbing this form consumes: the module store, opaque handles, adopt-at-submit).
3. **Shipped code to read before designing anything (verify, do not assume):**
   - `src/features/request/ui/RequestForm.tsx` — the current form. It is Item 1's plumbing wired
     into the OLD Stages 0–5 field model. It does NOT match FS §4.2 (see "The gap" below).
   - `src/features/request/store/requestDraft.ts` — the module store. Holds `slots` (uploaded
     files) + `success`, **but not entered text-field values yet** — its own comment says entered
     values come "in Item 3". Persistence of text fields across navigation is THIS task's job.
   - `src/features/request/ui/UploadCategoryInput.tsx` — per-file upload/retry/remove UI. Shows the
     file name (line ~124) and offers Retry on ANY failure incl. validation (lines ~130–143). Both
     are fixed here (see scope 6).
   - `src/features/request/validation/schema.ts` + `validationKeys.ts` — the Zod schema. Contact =
     "at least one of email/phone/contactOther" (old model); has `budget`; options incomplete vs FS.
   - `src/features/request/config/form.ts` — options (`SIZE_OPTIONS`, `COLOR_OPTIONS`,
     `PLACEMENT_OPTIONS`) — incomplete/mismatched vs FS §4.2 (no "Not sure", color set wrong,
     placement "other" has no required free-text).
   - `src/bff/request.ts` — server-side parse/validate of the submit payload; `src/bff/index.ts`.
   - `app/api/request/route.ts` — the submit endpoint; where the reference code is generated
     (Item 9). Check the current code format (`REQ-YYYY-NNNN`) — it must change to FS §4.6.
   - `src/features/request/lib/errors.ts`, `en.json` `request` namespace — messages.
4. `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` — this is Item 1's downstream. Item 4 (Success)
   depends on this task's store/persistence; do not build Item 4 here, but do not close off its
   `SuccessPayload` path (already stubbed in the store).

## The gap (why this task is large — read carefully)

Item 1 shipped the upload PLUMBING correctly but deliberately left the form's FIELD MODEL as the
old Stages 0–5 form (its own code comment says so). The shipped form diverges from FS §4.2 in
several places, and closing every one of them is this task:

1. **Contact model is wrong — and now expanded (see Block C).** Shipped: three always-visible fields
   (email, phone, contactOther), valid if *any* one is filled. The target is the **five-method model
   decided 2026-07-15** (PROJECT_DECISIONS.md — "Stage 6 Contact Model"; FS §4.2 field 9 amended):
   a Contact-method Select offering **Email / Phone (call) / WhatsApp / Instagram / Telegram** (set
   per-studio configurable) that reveals **exactly one** value field (10a–e), each with its own
   validation, one in the DOM at a time. **Owner-chosen UI: the select, then the single value field
   appears below it** (not side-by-side, not a morphing control). Storage: five nullable columns
   (migration). **This whole field is Block C, frozen until the contact decision existed — which it
   now does; Block C is unblocked.**
2. **Introduction block missing.** FS §4.1 requires a 2–3 sentence intro (what the form is, that it
   replaces a long DM, the 48-hour promise — PRD D5). Not present.
3. **Eligibility is wrong.** Shipped: a generic `consent` checkbox. FS §4.2 field 11 + PRD D6: a
   single eligibility confirmation covering **18+ (owner-configurable threshold, rendered from the
   value) AND request-is-for-self**. Privacy statement (FS §4.7 / Appendix A.3) sits by Submit.
4. **Block order is wrong.** Shipped order interleaves uploads between placement and size. FS §4.1:
   Introduction → Idea → Project Details (placement, size, color, + optional budget) → Reference
   Uploads → Contact → Eligibility & Privacy → Submit.
5. **Options don't match FS §4.2.** Color must be Black only / Black & grey / Color / Not sure
   (shipped: black/color/mixed). Size needs a "Not sure" option. Placement "Other" must reveal a
   **required** free-text (max 100 chars). Idea min length is 20 chars per FS §4.2 (shipped: 10).
6. **Upload-card UX fixes (from the Item 1 live check, FS §4.3 amended 2026-07-14):** remove the
   file-name label (the thumbnail is the identifier); show **Retry only on a transport failure**,
   never on a validation rejection (over-size / wrong-format → remove only).
7. **Motivation cards missing.** FS §4.4: each of the three upload categories is a scannable
   motivation card — category title + one benefit sentence (Appendix A.1, normative copy) — with
   the benefit sentence visually primary. Item 1's code has a `// added in Item 3` marker for this.
8. **Text-field persistence missing.** D-Blueprint 5(a): entered values (not just uploaded files)
   survive a client-side navigation away from Request and back. The store holds slots but not field
   values — extend it, and clear it on successful submit (already done for slots via `resetDraft`).

## Goal

Bring the Request form into full FS §4 compliance — correct field model (§4.2), block order
(§4.1), states/failure behavior (§4.5), motivation cards (§4.4), privacy statement (§4.7), the
required in-session persistence of D-Blueprint 5(a), and the FS §4.6 reference-code format (Item 9)
— on top of Item 1's already-shipped upload plumbing, which is consumed, not rebuilt.

## Scope

1. **Field model → FS §4.2 exactly.** Rebuild the field set: Introduction block; Idea (min 20);
   Project Details (Placement — concrete body areas only, **no "Other"/free-text per the 2026-07-15
   FS amendment**; Size incl. "Not sure"; Color = Black only / Black & grey / Color / Not sure;
   **Budget — optional free text, kept per the 2026-07-14 FS amendment**); Reference Uploads (three
   motivation cards, §4.4/A.1, consuming Item 1's `UploadCategoryInput`); **Contact — the five-method
   model (Block C), see item below and PROJECT_DECISIONS.md — "Stage 6 Contact Model"**; Name;
   Eligibility (18+/for-self, §4.2 field 11 + PRD D6); Privacy statement by Submit (A.3).
2. **Block order → FS §4.1**, single continuous scroll (D-Blueprint 1) — no wizard, no accordion.
3. **Schema + BFF parity.** Update `validation/schema.ts`, `validationKeys.ts`, and the server-side
   parse/validate in `src/bff/` to the new field model. The client and server validate the same
   contract. Remove the old "at least one contact" superRefine; add the method-driven single-field
   validation. Keep `uploadHandles` handling from Item 1 intact.
4. **In-session persistence (D-Blueprint 5(a)).** Extend the module store so entered text-field
   values survive client-side navigation away and back, within the guarantee boundary (no reload/
   eviction guarantee). Clear on successful submit alongside the existing slot reset.
5. **Reference code → FS §4.6 (Item 9, folded in).** Replace the `REQ-YYYY-NNNN` generator with a
   6-character uppercase-alphanumeric code excluding O/0/I/1, unique per request, generated
   server-side on successful persistence, stored with the request, returned to the client for
   Success. No public lookup. Existing DB codes are test-only — no data migration (owner-confirmed
   2026-07-14).
6. **Upload-card UX fixes (§4.3 amended).** In `UploadCategoryInput.tsx`: drop the file-name label;
   split failure states so Retry shows only for transport failures, remove-only for validation
   rejections.
7. **States & failure behavior → FS §4.5.** Submitting (CTA disabled with progress, double-submit
   prevented); validation failure (block submit, smooth-scroll to first invalid field + inline
   messages, no toast-only — D-Blueprint 5(c)); network/server failure (preserve everything, retry,
   Instagram fallback only after ≥2 consecutive failed submits — A.4); per-file failure isolation.

## Out of Scope

- **Item 4 (Success page)** — do not build it. Only keep the store's `SuccessPayload` path open so
  Item 4 can consume it. (The current form shows an inline success block; leaving that until Item 4
  is fine, or wiring the store's success payload — but not building the `/success` route here.)
- **Item 10 (abuse mitigation, durable).** The submit endpoint's honeypot/rate-limit hardening and
  the `/api/upload` durable-quota work grew into a pre-launch blocker after the Item 1 review and
  stays a separate item (new paid dependency). Do NOT fold it in. The existing in-memory
  `src/bff/rateLimit.ts` stays as-is.
- **Client-side image compression** — research item in PROJECT_BACKLOG.md; not built here.
- **Any visual/styling design** (colors, typography, spacing, imagery) — Stage 6 visual pass. The
  oversized-file error copy length is a backlog note for that pass, not this task.
- **Admin-side changes** beyond what already shipped with Item 1.

## Completion obligations

A green `pnpm qg` certifies the tree, not the deployed system (AI_TASK_PROTOCOL.md — Completion
Obligations). Reconcile these before setting the task `done`; each needs checkable evidence or a
pointer to a work item that exists by close.

```text
- CO-1 — Live end-to-end verification against the running database
  - Required by: Acceptance Criteria (last bullet) + FS §6 — a request submitted through the
    rebuilt form, exercising each contact method and an upload in each category, persists and
    renders correctly in the admin viewer, with a well-formed FS §4.6 reference code.
  - Disposition: <the executor fills this — completed with checkable evidence (what was submitted,
    what the admin viewer showed, an example code), OR tracked in a named work item>. This is NOT
    covered by unit tests (they mock the DB — the same gap that let Item 1 pass gates while the live
    DB was broken). The DB is live as of 2026-07-14, so this is runnable, not blocked.
- CO-2 — DB migrations apply-and-verify (REVISED 2026-07-15; the original "no migration expected"
  is void — this task adds TWO migrations that recreate `create_request`)
  - Why revised: the reference-code format (Item 9) lives in the `create_request` RPC, and the
    contact model (Block C, per "Stage 6 Contact Model" decision) adds five contact columns — both
    are DB changes the original CO-2 did not anticipate. The staging gate on `create_request` is
    waived for these two migrations (PROJECT_DECISIONS.md — "Staging Environment", scoped exception
    2026-07-15). Required by: Migration Workflow Decisions (apply via CLI, Local/Remote parity) +
    AI_TASK_PROTOCOL.md (independent review reconciles migrations against completion obligations).
  - Migration 1 — `20260715124427_stage6_reference_code_format.sql` (reference-code format).
  - Migration 2 — Block C contact-model migration (five contact columns; created in Phase 3).
  - Disposition (fill per migration at its apply time, with checkable evidence):
    - `pnpm exec supabase db push` succeeded; `pnpm exec supabase migration list` shows Local =
      Remote for the new timestamp.
    - Affected-object verification: `create_request` still has its 13-param signature (M1) /
      updated signature (M2), `{ id, referenceCode }` return, `service_role` EXECUTE grant, and
      `search_path = public, pg_temp` (`proconfig`) after replacement.
    - Live end-to-end (shared with CO-1): a real submit returns a well-formed FS §4.6 code and the
      chosen contact method persists + renders in the admin viewer.
- CO-3 — No new required env var / secret expected
  - Required by: contract check. Item 1 introduced `UPLOAD_TOKEN_SECRET`; Item 3 introduces none.
  - Disposition: expected `None`; confirm at close.
```

## Review Granularity (mandatory — this task crosses the size trigger)

This task will cross the size trigger in AI_TASK_PROTOCOL.md — "A Large Task Is Reviewed in
Checkpoints" (16 execution-affecting files or 500 lines of execution-affecting churn): it rewrites
the form, schema, BFF parse/validate, config options, store, and reference-code generator. It is
therefore built and reviewed as **checkpointed blocks**, not one review at the end — Item 1's single
end-of-task review missed two design blockers precisely because it ran once, over everything
(PROJECT_STAGE_LOG.md, 2026-07-14).

Per the protocol's guidance (prefer a small number of substantial blocks over turning every seam
into its own thread — each checkpoint costs the owner an approval and a review thread), use **two
blocks**:

- **Block A — the contract (risk nucleus).** The new field model as a stable, named interface the UI
  will consume: `validation/schema.ts` + `validationKeys.ts` + `config/form.ts` options + the
  server-side parse/validate in `src/bff/` + the FS §4.6 reference-code generator on the submit
  endpoint — **with their tests in the same block** (code-then-tests is never a seam). This is the
  risk nucleus (public write surface, changed contract, the reference-code invariant). Its Handoff
  must state what the reviewer can assert now (the contract and its validation, the code format and
  uniqueness) and what remains unasserted until Block B integrates it (the on-screen form behavior).
  Reviewed to consensus and committed **before** Block B is built, so the UI is built on a
  known-good contract.
- **Block B — the form UI** consuming Block A's contract: block order, the contact select→single
  field, motivation cards (A.1), eligibility + privacy, the D-Blueprint 5(a) text-field persistence
  in the store, and the upload-card UX fixes (file name, retry). Reviewed to consensus.

The store's text-field persistence sits in Block B (it is UI-state plumbing the form owns); if the
IMPL session finds it belongs with the contract instead, that is a legitimate call to make in the
plan — state it in the plan's Deviations/Review-Granularity section. The IMPL session decides commit
granularity **within** each block; STRAT fixes the review checkpoints.

**Re-cut by the approved IMPL plan (2026-07-15), and endorsed here.** The contact block turned out to
be a product change (five-method model) that had to be escalated to STRAT mid-flight, so the blocks
were re-cut into: **Block R** (reference code — DB/RPC, risk nucleus #1), **Block A′** (non-contact
contract), **Block B′** (non-contact form UI + store persistence + upload-card fixes), and **Block C**
(the contact block — its own contract + UI + five-column migration + admin-card rendering). Block C
was frozen pending the contact decision; that decision now exists (PROJECT_DECISIONS.md — "Stage 6
Contact Model"), so **Block C is unblocked** and is built against it as the final block, with its own
review to consensus. This four-block re-cut is the "legitimate call in the plan" this section
explicitly allows — the two-block default assumed contact was in-scope for Block A, which it no
longer is.

**Final measurement (executor fills before the final review):** record the actual
execution-affecting surface (files + churn) of each block here. If a block unexpectedly did not
cross the trigger, a single review for it is fine; if the whole task somehow stayed under the
trigger and was reviewed once, state why. A session may not silently exempt its own oversized block.

## Workflow (enforced)

1. Read Context + shipped code; confirm understanding in 3–5 lines. The plan carries a **Review
   Granularity** section (AI_TASK_PROTOCOL.md — this task crosses the size trigger): the two blocks,
   the risk nucleus (Block A), and whether it stays one task.
2. Present the plan (with the "Deviations from the task file" section) and wait for explicit
   approval. Do not code before approval.
3. Build **Block A (contract) first**: implement → `pnpm qg` green → independent Codex review to
   consensus → owner approves that commit → then build Block B on the now-known contract. The IMPL
   session owns commit granularity within each block.
4. Test coverage per PROJECT_TESTING_STRATEGY.md: the new contract (schema + BFF) needs real
   contract tests, not tests fitted to the implementation, in Block A. Reference-code
   format/uniqueness tested. Tests travel in the same block as the code they cover.
5. Each block's independent Codex cross-review runs to consensus (AI_CROSS_REVIEW.md); this IMPL
   session owns the whole fix loop through consensus and commit (AI_TASK_PROTOCOL.md — Post-Review
   Fix Loop). Block A's Handoff states what is assertable now vs. only after Block B integrates it.
6. If anything requires a PRD/FS change, STOP and escalate (Stage 6 Product Documentation
   Authority) — do not decide it in the IMPL session. (Budget and the §4.3 upload amendments are
   ALREADY decided and in the FS — they are not open questions.)

## Acceptance Criteria

Verifiable against FS §6 (the relevant criteria for this item):
- A request cannot be submitted with any required field (§4.2) missing or invalid; can be submitted
  with zero uploads and no warning (FS §6.1, §6.2).
- Invalid submit smooth-scrolls to and focuses the first invalid field; every invalid field shows
  an inline message; no toast-only/summary-only errors (FS §6.3, D-Blueprint 5(c)).
- Selecting each contact method shows exactly one matching value field, validated per §4.2 (FS §6.6).
- Submit is impossible without the eligibility checkbox; the rendered age threshold matches the
  owner-configured value (FS §6.7).
- Each upload category shows its motivation card (§4.4); the file name is NOT shown; Retry appears
  only on a transport failure; per-file failures never block submit (FS §6.8, §4.3 amended).
- Entered values and uploaded files survive a client-side navigation away from Request and back;
  both are cleared after a successful submit (D-Blueprint 5(a)).
- Network failure during submit preserves all data + uploads and offers retry; Instagram fallback
  appears only after ≥2 consecutive failed attempts (FS §6.4).
- The reference code is 6 chars, uppercase alphanumeric excluding O/0/I/1, unique, server-generated
  on persistence (FS §4.6).
- `pnpm qg` passes; existing request-submission tests updated (not silently broken) by the
  field-model change. **Live end-to-end check after merge** (the DB is live now): submit a real
  request exercising each contact method and an upload in each category; confirm persistence + admin
  rendering + a well-formed reference code.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress) and PROJECT_DECISIONS.md if any decision is made or refined.
- Update `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`'s Item 3 and Item 9 status rows.
- Set Status to `done` (date + stage-log pointer, no commit hash); move this file to
  `docs/project/tasks/done/`; propose the commit for owner approval.
