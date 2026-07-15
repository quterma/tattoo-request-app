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

Closed out Item 1's tail and cut Item 3. Specifically: applied and verified Item 1's DB migration
live (the "committed but NOT LIVE" blocker is gone), set `UPLOAD_TOKEN_SECRET` in Vercel, ran the
live end-to-end check; then, from the owner's observations during that check, amended FS §4.3
(drop the file-name label; Retry only on transport failure), amended FS §4.2 (Budget added as an
optional field 12 — owner wants it), and **cut Item 3's task file** (`STAGE_6_TASK_03_request_form_
rebuild.md`, `ready`) with Item 9 folded in and review seams mandated. Item 10 explicitly NOT
folded in.

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | **done + LIVE** (`480c721`; migration applied & verified 2026-07-14) |
| 2 — Site-wide shell | **done**, `e833398` |
| 3 — Request form rebuild | **task ready** (`STAGE_6_TASK_03_request_form_rebuild.md`) — Item 9 folded in. Next IMPL to run. |
| 4 — Success page | blocked on Item 3 (shares the persistence store) |
| 5 — Home rebuild | code-unblocked, no task file. Good Fit + Price-teaser copy doesn't exist — owner-authored, same material as Item 6. |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing, FAQ, Good Fit) |
| 7 — Location polish | code-unblocked, **asset-blocked** on studio photos |
| 8 — Preparation/Aftercare split | **task ready** (`STAGE_6_TASK_08_preparation_aftercare_split.md`, `Executor: codex`) — not yet run |
| 9 — Reference-code format | **folded into Item 3** |
| 10 — Abuse mitigation | **not started, grew into a PRE-LAUNCH BLOCKER** after the Item 1 review (`/api/upload` durable quota — new paid dependency). Separate item, do NOT fold into Item 3. |
| 11 — 404/error boundary · 12 — favicon/OG/SEO | not started; the only items cuttable now without owner content |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate |

## Decided (this session — 2026-07-14)

Pointers only (full text in the named docs):

- **Item 1 is live** — PROJECT_STAGE_LOG.md, "Item 1 is now LIVE" (migration verified, env set,
  e2e passed).
- **FS §4.3 amended** — file name not shown in the upload UI (thumbnail is the identifier); Retry
  only on a transport failure, remove-only on a validation rejection. (From the Item 1 live check.)
- **FS §4.2 amended** — Budget added as optional field 12 (owner wants it; the shipped form already
  had it). Backlog's budget prohibition marked resolved.
- **Item 9 folded into Item 3**; **Item 10 kept separate** (pre-launch blocker, new paid dep).
- Item 3 task file cut with mandated review seams (contract → store → reference-code → UI), because
  Item 1's single end-of-task review missed two blockers.

## Open

- None blocking Item 3. Standing owner-side blockers remain (Items 5/6/7 need owner copy/photos).
- Item 10's mechanism choice (Upstash/Vercel KV vs server-issued capability vs platform) is an
  open architecture decision for whenever Item 10 is cut — it carries a new paid dependency, so it
  is an owner call, not an IMPL default.

## Task files

- `STAGE_6_TASK_03_request_form_rebuild.md` — `ready`, `Executor: claude`. Next IMPL to run.
- `STAGE_6_TASK_08_preparation_aftercare_split.md` — `ready`, `Executor: codex`, not yet run.
- Item 1 and Item 2 task files in `tasks/done/`. Nothing in `draft`.

## Next topic

1. **Run Item 3** (`Execute docs/project/tasks/STAGE_6_TASK_03_request_form_rebuild.md`; Opus, Plan
   mode). It is a real rebuild, not a tweak — the shipped form is Item 1's plumbing on the OLD
   Stages 0–5 field model (wrong contact model, wrong options, no eligibility/intro, etc.). It owns
   its review loop to consensus and commit, with the mandated seams.
2. **After Item 3 lands, cut Item 4** (Success page) — it consumes Item 3's persistence store.
3. **Owner-side long pole, unchanged:** Items 6 (Process copy) and 7 (Location photos) are blocked
   on the owner; Item 6's copy also unblocks Item 5. Producing this is the highest-leverage owner
   action and is now the stage's dominant long pole.
4. **Item 8** can run in Codex any time (independent of Item 3) — but sequence its Claude review
   phase so it does not write PROJECT_* docs at the same moment as another session (shared-doc
   hazard, live this stage).
5. Re-verify every assumption in this brief against the repo before acting on it.
