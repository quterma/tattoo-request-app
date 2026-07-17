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

Item 3 (request form rebuild) landed `done + LIVE` — the board is updated to match. This session
also resolved a product reversal: **Placement goes back to a required free-text input** (it had been
narrowed to a fixed Select two days earlier, and Block A′ shipped that). FS §4.2 field 2 amended
accordingly (docs-first, PRD §9), the 2026-07-15 amendment marked superseded in place, and
`STAGE_6_TASK_09_placement_freetext.md` promoted `draft`→`ready` — it is now the next IMPL to run.

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | **done + LIVE** (`480c721`; migration applied & verified 2026-07-14) |
| 2 — Site-wide shell | **done**, `e833398` |
| 3 — Request form rebuild | **done + LIVE** (2026-07-17) — 4 checkpointed blocks; both migrations live; CO-1 e2e passed (5 contact methods + an upload per category). Task in `tasks/done/`. |
| 4 — Success page | **unblocked** (Item 3 done), no task file. `SuccessPayload` is `{method, value}`-shaped and left open. |
| 5 — Home rebuild | code-unblocked, no task file. Good Fit + Price-teaser copy doesn't exist — owner-authored, same material as Item 6. |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing, FAQ, Good Fit) |
| 7 — Location polish | code-unblocked, **asset-blocked** on studio photos |
| 8 — Preparation/Aftercare split | **task ready** (`STAGE_6_TASK_08_preparation_aftercare_split.md`, `Executor: codex`) — cut 2026-07-14, **still not run** |
| 9 — Reference-code format | **done + LIVE** (folded into Item 3, Block R) |
| 10 — Abuse mitigation | not started, **PRE-LAUNCH BLOCKER** (`/api/upload` durable quota — new paid dependency). Mechanism choice is an open owner decision. |
| 11 — 404/error boundary · 12 — favicon/OG/SEO | not started; small, independent |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate (now also depends on Item 14) |
| 14 — Placement → free-text | **task ready** (`STAGE_6_TASK_09_placement_freetext.md`, promoted 2026-07-17). **Next IMPL to run.** |

## Decided (this session — 2026-07-17)

- **Placement → required free-text** (owner). Reverses the 2026-07-15 "Select, concrete areas only"
  decision that Block A′ shipped. FS §4.2 field 2 amended; the superseded amendment is kept in place
  as the record of what was shipped in between. Rationale: a typed area ("inner left forearm,
  wrapping toward the elbow") captures intent no fixed list can, and a *required* text still
  satisfies PRD D4's guarantee. `PLACEMENT_OPTIONS` disappears; no migration (column is already free
  `TEXT`, admin renders it verbatim).
- Task 09 scope item 1 ("amend the FS first") is **already done by STRAT** — the executor implements
  against the amended spec, it does not re-amend.

## Open

- **Item 10's mechanism** (Upstash/Vercel KV vs server-issued capability vs platform protection) —
  an owner call, carries a new paid dependency. Pre-launch blocker, not started.
- **Owner-authored placeholders live in `en.json`** (flagged by Item 3): the Introduction copy
  (`__intro_TODO`) and `INSTAGRAM_HANDLE`. Real copy needed before launch.

## Task files

- `STAGE_6_TASK_09_placement_freetext.md` — `ready`, `Executor: claude`. **Next.**
- `STAGE_6_TASK_08_preparation_aftercare_split.md` — `ready`, `Executor: codex`, still not run.
- Items 1/2/3 task files in `tasks/done/`. Nothing in `draft`.
- Non-Stage-6, unrelated: `META_TASK_01_framework_consolidation.md`, `TOOLING_TASK_01_project_status_command.md`.

## Next topic

1. **Run Item 14** (`Execute docs/project/tasks/STAGE_6_TASK_09_placement_freetext.md`) — small,
   contract + UI, FS already amended. It reverses Block A′'s Select: that is intended, not a
   regression to "fix back".
2. **Item 8 can run any time** in Codex — independent of everything else; it has been `ready` since
   2026-07-14 and is the cheapest unstarted item on the board.
3. **Cut Item 4** (Success page) — unblocked by Item 3. Note for whoever cuts it: the echo must show
   the **raw entered** value, not the normalized one (FS §3.4); Item 3 deliberately kept the store's
   `SuccessPayload` path open for this.
4. **Owner-side long pole, unchanged and now dominant:** Items 6 (Process copy) and 7 (Location
   photos), plus the `en.json` placeholders above. Item 6's copy also unblocks Item 5. Nothing in the
   code blocks these — only owner-authored material does.
5. Re-verify every assumption in this brief against the repo before acting on it.
