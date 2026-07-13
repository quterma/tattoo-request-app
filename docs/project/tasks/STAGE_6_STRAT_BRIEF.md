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

Long session, closing here (context grown large across model switches). Completed the full UX
blueprint (all 8 sub-topics, 2 external-AI review batches + 2 Codex repo-aware review rounds, all
consensus), then moved to implementation planning: wrote `docs/project/
STAGE_6_IMPLEMENTATION_PLAN.md` (the durable, item-by-item stage plan — read this first, not just
this brief) and the first task file, `STAGE_6_TASK_01_upload_flow_architecture.md` (status
`ready`, owner-approved).

## Decided

- Full UX blueprint (all 8 sub-topics) + all review rounds: PROJECT_DECISIONS.md — Stage 6 UX
  Blueprint Decisions (header lists every review-thread pointer).
- Implementation sequencing (13 items, dependencies, content/asset blockers, model guidance):
  `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` — this is now the durable plan; this brief will
  stop repeating its contents from here on.
- CLAUDE.md commit rule extended: approval requested after staging, per commit (see PROJECT_STAGE_LOG.md,
  the "Codex repo-aware review round 1" entry, 2026-07-13).

## Open

None blocking. One process question parked for META (not this stage's blocker): whether/how to
extend Codex beyond its current read-only reviewer role for token-heavy, low-judgment work (e.g.
running `pnpm qg` and reporting) — see AI_FRAMEWORK_IDEAS.md, 2026-07-13 entry on Codex
delegation scope. Do not resolve this in a Stage 6 STRAT session; it's a framework/process
decision.

## Task files

- `STAGE_6_TASK_01_upload_flow_architecture.md` — **ready**. Blocks Item 3 (Request form rebuild)
  and Item 4 (Success page) per the implementation plan. Start here.
- No other task files exist yet — per owner instruction, write one (or a small parallelizable
  few) at a time, close to when work on them starts, not all 13 items upfront. See the
  implementation plan's "How to use this document" section for the exact convention.

## Next topic

1. **Run Item 1** (`STAGE_6_TASK_01_upload_flow_architecture.md`) as an IMPL session — Opus,
   Plan mode, per the task file's "How to run".
2. Once Item 1 is `done`, the next STRAT session picks the next unblocked item(s) from
   `STAGE_6_IMPLEMENTATION_PLAN.md` (Item 2 — site-wide shell — is small and unblocks four other
   items; a reasonable next pick, but re-verify against the plan's current state rather than
   assuming this brief is still accurate) and writes its task file(s).
3. Owner note from this session, for the content/asset-blocked items (6 — Process, 7 —
   Location): start producing Process copy (pricing, FAQ, Good Fit text) and Location studio
   photos in parallel — they aren't code-blocked, only content-blocked, so they shouldn't become
   the long pole once their implementation turn comes.
