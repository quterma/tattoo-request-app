Purpose
STRAT Next-Session Brief for Stage 6 — the pickup point for the next STRAT session on this
stage. See docs/framework/AI_TASK_PROTOCOL.md — STRAT Next-Session Brief for the convention
this file follows (overwritten each session, committed immediately, pointers not prose).

Scope
Stage 6 strategic work only. Not a product document — see STAGE_6_PRODUCT_DEFINITION.md /
STAGE_6_FUNCTIONAL_SPECIFICATION.md for that.

Audience
AI agents and the developer, at the start of the next STRAT: Stage 6 session.

---

## Session summary

Mid-session checkpoint (session not closed — persisted per owner request while continuing).
First Stage 6 product/UX STRAT session: worked the full UX blueprint page-by-page. All 8
sub-topics decided and externally reviewed to consensus: batch 1 (nav/CTA, Home, Process,
Request) — 4 corrections applied via ad-hoc exchange; batch 2 (Success, Location, Preparation,
Aftercare) — 3 findings + 1 acceptance note, all accepted, applied via the formal cross-review
protocol (thread: `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md`).

## Decided

- All 8 UX-blueprint sub-topics: PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions (one
  subsection per topic). PROJECT_STAGE_LOG.md, 2026-07-13 entries: "navigation/CTA, Home,
  Process, Request format decided"; "first external review round, 4 corrections applied";
  "Success, Location, Preparation, Aftercare decided (batch 2, all 8 sub-topics now complete)".
- Owner's consensus principle (source of truth = consensus across AI + docs + owner, not any
  single party) recorded in PROJECT_DECISIONS.md's blueprint section header — applies to all
  sub-topics, including batch 2.
- Confirmed in-session: the PRD §5 Preparation/Aftercare distribution model (direct URL sent by
  the artist, no in-product discovery) stands as an accepted, recorded risk — reconfirmed by the
  owner when the trade-off was restated during the Preparation/Aftercare discussion, not
  reopened.

## Open

None blocking — no unresolved product question; all 8 sub-topics have a decision. Two earlier
process observations from this session (mid-session persistence expectations; prior-art check
before proposing UX patterns) were already resolved by a parallel META session — see
AI_TASK_PROTOCOL.md (STRAT Next-Session Brief mid-session-persistence subsection; STRAT Kickoff
Prompt prior-art line).

## Task files

None created yet. All blueprint decisions are recorded directly in PROJECT_DECISIONS.md and both
batches are consensus-reviewed — the blueprint is ready to be cut into implementation task files
(per the template at `docs/framework/templates/STAGE_TASK_TEMPLATE.md`), status `draft`, for
developer approval. **Acceptance-check note for the task files (from the batch-2 review):** the
implementation batch must verify site-wide that no inbound links to the superseded `policies`
route remain — the shipped Home hero and Mini Process copy both link to it today.

## Next topic

1. **Close the Codex whole-blueprint review thread**
   (`docs/project/reviews/REVIEW_2026-07-13_stage6-ux-blueprint-full.md`, at `awaiting-review`
   for the verification round on the applied round-1 fixes; 5/5 findings accepted, corrections
   already folded into PROJECT_DECISIONS.md).
2. **Create the Stage 6 UX-blueprint implementation task files** (one per page/topic, per
   AI_TASK_PROTOCOL.md's Task Files convention), status `draft`, referencing the reviewed
   blueprint sections in PROJECT_DECISIONS.md and the relevant FS §§. Constraints from the
   reviews: the **upload-flow architecture task is a prerequisite** — no Request-page task may
   be marked `ready` before it (PROJECT_DECISIONS.md — Upload-flow architecture prerequisite);
   include the policies inbound-link acceptance check; Location tasks must cover the real map
   embed and studio photos (shipped ones are placeholders), not just the CTA.
