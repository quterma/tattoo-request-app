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

**All 17 originally-planned Stage 6 items are done.** Item 16 shipped (`fad01c7`), which emptied the
queue entirely. This session did four things: **created Stage 7** and moved visual design out of
Stage 6, **cut Item 18** (visual consistency) and **`TOOLING_TASK_02`** (the browser capability
three prior tasks lacked), and **re-routed seven completion obligations** so `pnpm project:status`
reports **0 errors** instead of 10.

Remaining: `TOOLING_TASK_02` → **Item 18** → **Item 13** (cut it last; it closes the stage).

## The one thing to know before planning anything here

**Stage 6 no longer owns visual design.** The owner challenged the premise of a "visual pass" in
Stage 6; verification found no Stage 7 existed and that Stage 6's scope line had absorbed both
consistency work and visual design. Stage 6 now keeps **consistency only** — one token system, one
rhythm, no dead CSS, no clipping viewport. Palette, fonts, layout language, art direction and admin
polish are **Stage 7**, which runs before launch and after real photography exists.

→ PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design (2026-07-26)"
→ PROJECT_IMPLEMENTATION_PLAN.md — Stage 6 (narrowed), Stage 7 (new)

If a proposed change reads to an observer as "design", it is Stage 7. File it, don't implement it.

## State of the board — verify before trusting this

Do not read item rows from here. **`STAGE_6_IMPLEMENTATION_PLAN.md` is the durable board** and was
reconciled against git this session (Items 14/16/17 were stale there — `task ready`/`draft` for work
that had shipped). Run `pnpm project:status` for live task state.

- **Done:** Items 1–12, 14, 15, 16, 17 — every task file in `tasks/done/`.
- **Open, `ready`, in execution order:**
  1. `tasks/TOOLING_TASK_02_playwright_screenshots.md`
  2. `tasks/STAGE_6_TASK_18_visual_consistency.md` (two checkpointed blocks)
- **Not cut yet:** Item 13 — deliberately last, see below.

## Decided (2026-07-26 — this session)

Both recorded in PROJECT_DECISIONS.md; not restated here.

- **"Stage 6 / Stage 7 boundary — consistency vs visual design"** — the scope split above, plus the
  two Stage 6 exit criteria that moved to Stage 7 because they were un-closeable as written.
- **"Named browser capability for visual verification"** — `playwright` + `pnpm shot` at
  320/375/768/1280. `pnpm qg` does not change; this is not automated e2e; it is not a physical
  device.

## Open

- **Nothing is blocked.** Both open tasks are `ready` and executable now.
- Owner pre-release debts are **not** listed here any more — they live in
  **PROJECT_PRODUCTION_READINESS.md → "Owner Pre-Release Actions"**, which is their canonical home
  as of this session. A brief is overwritten every session and the protocol rejects it as a work
  item; two obligations (Items 7 and 10) had been parked here anyway, including the pointer for the
  still-open launch blocker.

## Task files

- Open and `ready`: `TOOLING_TASK_02_playwright_screenshots.md`,
  `STAGE_6_TASK_18_visual_consistency.md`.
- Item 13 has no task file — **cut it after Item 18 lands, not before.** Its sweep must fail while
  any `__asset_TODO` remains, and Item 18 deliberately adds a tenth (the Home hero), so a file cut
  now would encode a marker count that is already wrong.
- Non-Stage-6: `META_TASK_01_framework_consolidation.md` (`draft`, framework dedup).

## Open research threads (report these — anti-rot duty, AI_CROSS_REVIEW.md)

**None open.** `pnpm project:status` reports 0 research and 0 review threads.

## Next topic

**Coordinate the remaining three, one at a time.** Never two sessions on the same files — Item 18's
two blocks overlap each other and Item 13 reads the whole public surface (standing hazard: `df70cae`,
and Item 8's `en.json` swept into `94ef19b`).

1. **`TOOLING_TASK_02`** — small, Sonnet. First, because the other two cannot verify themselves
   without it.
2. **Item 18, Block A** (tokens + primitives — the risk nucleus), then **Block B** (pages + form +
   hero). Two owner approvals, two cross-review threads; the **3-round review cap** applies to each.
   Block A's handoff must say the site is expected to look *transitional* at that checkpoint.
   **Owner action inside this task:** Block A's first deliverable is a ChatGPT prompt for the Home
   hero background image — generate it while Block A runs, so Block B can wire it without waiting.
3. **Item 13** — cut the task file, then run it. When cutting, fold in the two things already filed
   as natural companions: the **Item 17 pre-release re-review** (its cross-review exited at 9 rounds
   by owner decision, not on a clean round — PROJECT_BACKLOG.md) and confirmation that the
   `__asset_TODO` sweep fails as designed while the ten placeholders remain.

### Pre-deploy swaps to track

**Moved out of this brief 2026-07-26.** The canonical list, the combined marker grep, and the owner
checklist all live in **PROJECT_PRODUCTION_READINESS.md** ("Pre-Deploy Content Swaps" and "Owner
Pre-Release Actions"). This section previously duplicated them and had gone stale — it still taught
a superseded grep and referenced `INSTAGRAM_HANDLE`, a constant Item 17 deleted (PROJECT_BACKLOG.md
recorded this as a live defect). It is now a pointer, per the brief-vs-durable-doc preference
recorded in AI_FRAMEWORK_IDEAS.md (2026-07-24).

## Standing hazard (recurring — worth watching)

The shared git index and shared PROJECT_* docs have caused commit misattributions this stage
(`da6861f`; Item 8's `en.json` into `94ef19b`). It recurs whenever two sessions are live on
overlapping files. **Do not run two sessions writing the same file at once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
