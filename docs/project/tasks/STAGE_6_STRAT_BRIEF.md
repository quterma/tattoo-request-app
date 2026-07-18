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

Items 4 and 8 landed `done`; this session then **cut Item 7 (map half)** and prepared the handoff.
It also produced an owner-facing **content brief** (artifact, Russian) telling the artist exactly
what copy to write — that copy is the stage's dominant blocker now. Item 7 turned out much smaller
than its plan row: the studio-photo placeholders already ship and stay (pre-deploy swap), the
address is real, so the only code gap is the map embed.

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | **done + LIVE** (`480c721`) |
| 2 — Site-wide shell | **done** (`e833398`) |
| 3 — Request form rebuild | **done + LIVE** (2026-07-17) |
| 4 — Success page | **done** (`94ef19b`, 2026-07-18) |
| 5 — Home rebuild | code-unblocked, no task file. **Content-blocked** — Good Fit + price-teaser + one-line intro are owner copy (same material as Item 6). |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing/FAQ/Good Fit). Artist copy requested via the content brief. |
| 7 — Location | **map half: task ready** (`STAGE_6_TASK_07_location_map_embed.md`); **photo half: pre-deploy swap** (placeholders stay). |
| 8 — Preparation/Aftercare split | **done** (`5714233`, Codex + Claude-review, 2026-07-18). Its en.json split sits in `94ef19b` (shared-index misattribution — documented, no rewrite). |
| 9 — Reference-code format | **done + LIVE** (folded into Item 3) |
| 10 — Abuse mitigation | not started, **PRE-LAUNCH BLOCKER** (`/api/upload` durable quota — new paid dependency; **mechanism is an open owner decision**). |
| 11 — 404/error boundary · 12 — favicon/OG/SEO | not started; small, independent, **cuttable now** (no content needed). |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate. |
| 14 — Placement → free-text | **done** (`552c8af`) |

## Decided (this session — 2026-07-18/19)

- **Item 7 split** (owner): studio photos stay as placeholder squares → real photos are a
  pre-deploy asset swap, not a code blocker; the address is real (Herzl 100); map provider fixed to
  a **keyless Google Maps iframe**. So Item 7's code work = the map embed only (`STAGE_6_TASK_07`).
- **Content brief produced** for the artist (artifact) — most Process copy already exists (Stages 0–5)
  and only needs confirming; the genuinely-new pieces are Good Fit, the one-line home intro, the form
  Introduction, and the Instagram handle. That copy unblocks Items 6 and 5.

## Open

- **Item 10's mechanism** — Upstash/Vercel KV vs a server-issued upload capability vs platform
  protection. Owner call, new **paid dependency**. Pre-launch blocker. Needs a STRAT session to lay
  out the options and get the owner's pick before it can be cut.
- **Owner content (the dominant long pole):** the Process/Home copy per the content brief, plus the
  `en.json` placeholders `__intro_TODO` and `INSTAGRAM_HANDLE`. Nothing in code blocks 5/6 — only this.
- **Studio photos** — real images for Item 7's photo half (pre-deploy swap).

## Task files

- `STAGE_6_TASK_07_location_map_embed.md` — `ready` (Executor: claude **or codex** — small, decision-free).
- Items 1/2/3/4/8/9/14 in `tasks/done/`. Nothing in `draft`.
- Non-Stage-6, unrelated: `META_TASK_01_framework_consolidation.md`, `TOOLING_TASK_01_project_status_command.md`.

## Next topic

Cuttable **now, without owner content** (a fresh STRAT session should take these — this session
stopped to avoid cutting them on a half-spent context):
1. **Cut Items 11 and 12** — 404/error boundary and favicon/OG/SEO. Small, independent, no content.
2. **Item 7 (map)** can run in IMPL/Codex any time — it's `ready`.
3. **Item 10** — hold a STRAT topic to lay out the durable-quota mechanism options for the owner
   (paid dependency); it can't be cut until the owner picks a mechanism.

Waiting on the owner (the real critical path):
4. **Process/Home copy** (content brief) → unblocks Items 6 then 5. This is the stage's long pole.
5. **Studio photos** → Item 7 photo swap.

After 5/6/7/10/11/12 land: **Item 13** (FS §6 acceptance sweep + manual mobile QA) closes the stage.

## Standing hazard (recurring — worth watching)

The shared git index / shared PROJECT_* docs have now caused **two** commit misattributions this
stage (`da6861f`, and Item 8's en.json into `94ef19b`). Both were content-safe and documented, but
it recurs whenever two sessions are live on overlapping files. An `open` META note is filed
(AI_FRAMEWORK_IDEAS.md) alongside the earlier one about `PROJECT_STAGE_LOG.md` outgrowing a single
read. Not urgent; deferred while limit goes to development. Until then: **do not run two sessions
writing the same file at once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
