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

Cut the task file for **Item 2 — site-wide shell**, then (against the protocol as it stood at the
time) also carried Item 2's whole post-review fix loop: Codex handoff, review processing, code
fixes, `pnpm qg`, commit. **Item 2 is done and committed (`e833398`).** That boundary violation is
now fixed at the framework level — see "Protocol changes you inherit" below; do not repeat it.

## State of the board — verify before trusting this

**Item 1 has NOT started.** Its task file (`STAGE_6_TASK_01_upload_flow_architecture.md`) is
`ready` and sitting in `docs/project/tasks/`. Earlier versions of this brief and of
PROJECT_STAGE_LOG.md claimed its IMPL session "runs in parallel" — that was never true; a STRAT
session took an owner's remark about a prepared kickoff to mean the session was live, and
propagated the assumption into the durable docs. Corrected 2026-07-13. **Confirm state from
`docs/project/tasks/` and `git log`, not from prose.**

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | `ready`, **not started** — the critical path (blocks 3 and 4) |
| 2 — Site-wide shell | **done**, `e833398` |
| 3 — Request form rebuild | blocked on Item 1 |
| 4 — Success page | blocked on Item 3 |
| 5 — Home rebuild | unblocked (Item 2 landed), no task file |
| 6 — Process content | unblocked in code, **content-blocked** on owner copy |
| 7 — Location polish | unblocked in code, **asset-blocked** on studio photos |
| 8 — Preparation/Aftercare split | unblocked (Item 2 landed), no task file |
| 9–13 | see `STAGE_6_IMPLEMENTATION_PLAN.md` |

## Decided (this session)

- **Item 2/6 boundary:** Item 2 renamed `policies` → `process` and carried the shipped copy over
  unchanged; Item 6 replaces that copy with FS §3.2 content. No redirect from the old URL (site
  not publicly launched). Rationale: `STAGE_6_IMPLEMENTATION_PLAN.md` — "Item 2/6 boundary".
- **CTA copy follows FS §2 ("Start Your Request").** The IMPL session had shipped "Request a
  Tattoo" and logged a non-existent approval for it; the Codex review caught both. The
  `CtaRequestButton` now owns its label via a single `cta.requestButton` key — the per-page
  `label` prop was the mechanism that let three call sites diverge. Thread:
  `reviews/done/REVIEW_2026-07-13_stage6-item2-shell.md`.

## Protocol changes you inherit (committed `df70cae` — read before running any IMPL)

1. **Plan-deviation barrier** (AI_TASK_PROTOCOL.md — IMPL Session Duties): every IMPL plan must
   carry a distinct "Deviations from the task file" section, or state "no deviations". A deviation
   baked into the plan is invisible downstream — the Review Agent compares the *diff* to the task
   file, so it faithfully validates the wrong thing.
2. **Durable docs may not assert unverifiable claims about a conversation** ("flagged and approved
   in-plan"). A future session has no transcript.
3. **Post-Review Fix Loop** (AI_TASK_PROTOCOL.md): **the IMPL session that built a block owns the
   whole loop** — Codex handoff, `## Response`, fixes, gates, commit, consensus — and stays open
   until its review thread reaches consensus, rather than ending at "READY FOR DEVELOPER REVIEW".
   **STRAT does not participate.** No final STRAT sign-off exists, deliberately.

## Next topic

1. **Run Item 1.** It is the critical path and everything downstream waits on it. Task file is
   `ready`; nothing needs cutting first.
   - Session: `IMPL: Stage 6 — upload flow architecture`
   - Model: Opus · Plan mode (mandatory — this is architecture design on a public,
     unauthenticated write surface)
   - Prompt: `Execute docs/project/tasks/STAGE_6_TASK_01_upload_flow_architecture.md`
   - That session owns its own review loop through to consensus and commit. This STRAT session
     does not follow it.
2. **While Item 1 runs**, the cuttable work is **Item 8** (Preparation/Aftercare split — fully
   unblocked, copy already exists in `en.json`) and **Item 5** (Home rebuild — unblocked, but its
   Good Fit / About-fold copy is the same owner-authored material that blocks Item 6). Cutting
   either is optional; waiting for Item 1 and then cutting **Item 3** (with Items 9 and 10 folded
   in — same submit endpoint, the plan leaves this to STRAT's discretion) is the cheaper path if
   token budget is the binding constraint.
3. **Owner's own critical path, unchanged:** Items 6 and 7 are blocked on *you*, not on code —
   Process copy (pricing, FAQ, Good Fit) and Location studio photos. They are the likeliest long
   pole at the end of the stage.
4. Re-verify every assumption in this brief against the repo before acting on it. This session
   demonstrated exactly how a plausible-sounding brief can carry a fabrication forward.
