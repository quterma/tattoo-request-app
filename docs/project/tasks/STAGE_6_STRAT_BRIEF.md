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

Resolved Item 8's three open questions with the owner, **amended PRD §5 and FS §2** (footer
discovery for Preparation/Aftercare — PRD §9 change control), recorded the decisions, and **cut
Item 8's task file** (`STAGE_6_TASK_08_preparation_aftercare_split.md`, `ready`, `Executor: codex`).
Item 1 was confirmed `ready`; the owner runs it as its own IMPL session in parallel. Owner
instructed this session to commit the whole working tree (this session's docs + a parallel META
session's framework edits) as one commit, then work continues in separate threads.

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | `ready`, **running as its own IMPL session** (Opus, Plan mode; critical path, blocks 3 and 4; owns its review loop to commit) |
| 2 — Site-wide shell | **done**, `e833398` |
| 3 — Request form rebuild | blocked on Item 1 |
| 4 — Success page | blocked on Item 3 |
| 5 — Home rebuild | code-unblocked, no task file. Good Fit + Price-teaser blocks don't exist yet — that copy is the same owner-authored material blocking Item 6. |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing, FAQ, Good Fit) |
| 7 — Location polish | code-unblocked, **asset-blocked** on studio photos |
| 8 — Preparation/Aftercare split | **task ready** (`STAGE_6_TASK_08_preparation_aftercare_split.md`, `Executor: codex`) |
| 9–13 | see `STAGE_6_IMPLEMENTATION_PLAN.md` |

## Decided (this session — 2026-07-14)

Pointers only (full text in the named docs):

- **Preparation/Aftercare in-product discovery** — PROJECT_DECISIONS.md, new section
  "Preparation/Aftercare in-product discovery (2026-07-14)". Two global-footer links; artist-sent
  URL stays primary; `process.aftercareLink` removed; Q2 boundary bullet stays in Preparation
  unchanged; Q3 intro copy fixed. **This amended PRD §5 and FS §2** — those files were edited, not
  just annotated.
- Item 8 status → `task ready`; STAGE_6_IMPLEMENTATION_PLAN.md "Item 8 open questions" rewritten
  as RESOLVED.

## Open

None on Item 8. Standing owner-side blockers remain (Items 5/6/7 — see below).

## Task files

- `STAGE_6_TASK_01_upload_flow_architecture.md` — `ready`, running as its own IMPL session.
- `STAGE_6_TASK_08_preparation_aftercare_split.md` — `ready`, `Executor: codex`, not yet started.
- No others. Nothing in `draft`.

## Next topic

1. **After Item 1 lands, cut Item 3** — with Items 9 (reference-code format) and 10 (abuse
   mitigation) folded in unless there's a reason not to (owner deferred that call to the cutting
   session). Item 3's task file cannot be written honestly before Item 1's architecture decision
   exists — the form consumes the upload plumbing Item 1 designs.
2. **Owner-side long pole, unchanged:** Items 6 (Process copy: pricing/FAQ/Good Fit) and 7
   (Location studio photos) are blocked on the owner, not on code — and Item 6's copy is the same
   material that unblocks Item 5's Good Fit / Price teaser. This is now the stage's dominant long
   pole; producing it is the highest-leverage owner action.
3. **Cross-session hazard, live:** the git index and PROJECT_* docs are shared. This session had
   its `PROJECT_STAGE_LOG.md` edit swept into a parallel META commit (`da6861f`) — content intact,
   wrong commit. Do not run two sessions writing PROJECT_* docs at once; sequence their doc-writing
   (Cross-Session Rules).
4. Re-verify every assumption in this brief against the repo before acting on it.
