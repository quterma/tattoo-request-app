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

Short session. Cut the task file for **Item 2 — site-wide shell**
(`STAGE_6_TASK_02_site_wide_shell.md`, status `ready`), in parallel with Item 1, which is running
as its own IMPL session (the two items touch disjoint files). One product-level boundary call was
made and recorded (the Item 2/6 route-rename boundary — see Decided).

## Decided

- **Item 2/6 boundary (owner, this session).** Item 2 renames `policies` → `process` **and carries
  the shipped copy over unchanged**; Item 6 later replaces that copy with the FS §3.2 canonical
  content. Rejected: leaving the rename in Item 6 (the new nav would point at a 404 for as long as
  Item 6 stays content-blocked) and shipping a stub `/process` (would take the site's only
  pricing/FAQ content offline meanwhile). Also decided: **no redirect** from the old `/policies`
  URL — the site is not publicly launched, so there is nothing to preserve. Full rationale:
  `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` — "Item 2/6 boundary" note.
- Item 2 additionally pulls forward Location's missing primary CTA (FS §2's table requires one;
  Item 7 is asset-blocked, and the site-wide CTA pattern should not ship half-applied).
- Everything else from the prior session stands: the full UX blueprint (PROJECT_DECISIONS.md —
  Stage 6 UX Blueprint Decisions) and the 13-item plan (`STAGE_6_IMPLEMENTATION_PLAN.md` — the
  durable plan; read it, not just this brief).

## Open

None blocking. Still parked for META (not this stage's blocker): whether/how to extend Codex
beyond its read-only reviewer role — see AI_FRAMEWORK_IDEAS.md, 2026-07-13 entry on Codex
delegation scope. Do not resolve it in a Stage 6 STRAT session.

## Task files

- `STAGE_6_TASK_01_upload_flow_architecture.md` — **ready**; its IMPL session was kicked off
  separately and is running in parallel. Blocks Items 3 and 4.
- `STAGE_6_TASK_02_site_wide_shell.md` — **ready** (written this session). Blocks Items 5/6/7/8.
  Independent of Item 1.
- No other task files yet — per owner instruction, write them close to when work starts, not all
  13 upfront (see the plan's "How to use this document").

## Next topic

1. When Item 1 or Item 2 lands, cut the next unblocked task file(s): after **Item 1** → Item 3
   (Request form rebuild — consider folding Items 9 and 10 into it; same submit endpoint, the plan
   already leaves this to the STRAT session's discretion). After **Item 2** → Items 5 (Home
   rebuild) and 8 (Preparation/Aftercare split) are both unblocked and independent of each other.
2. Re-verify each item's assumptions against the repo before writing its task file — Items 1 and 2
   are changing shipped code right now, so the plan's item descriptions may already be stale.
3. Owner note, unchanged: Items 6 (Process copy — pricing, FAQ, Good Fit) and 7 (Location studio
   photos) are content/asset-blocked, not code-blocked — produce that material in parallel so it
   isn't the long pole when their turn comes. Item 2 buys time here (the Process route ships with
   the old copy rather than a 404 or a stub) but does not remove the blocker.
