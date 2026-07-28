Purpose
STRAT Next-Session Brief for Stage 7 — the pickup point for the next STRAT session on this stage.
See docs/framework/AI_TASK_PROTOCOL.md — STRAT Next-Session Brief for the convention this file
follows (overwritten each session, committed immediately, pointers not prose).

Scope
Stage 7 strategic work only. Phase 7A (the visual system) is live; `[7B]` items wait for the
owner's photoshoot and are what actually closes the stage.

Audience
AI agents and the developer, at the start of the next STRAT: Stage 7 session.

---

## Session summary

**First STRAT session of Stage 7 (2026-07-28).** It decided the visual direction, the theming
boundary and the tap-target floor; took the generation constraint list through an independent
cross-review to consensus; and cut `STAGE_7_TASK_01_visual_concept.md`. **It deliberately did not
write the specification** — see the next section.

## The one thing to know before planning anything here

**The order is concept → specification → item cut, and it is not negotiable by convenience.**
Stage 7 has no source-of-truth document, and `PROJECT_IMPLEMENTATION_PLAN.md:1057-1062` requires one
before any item is cut. That document is written **after** the owner's mockups exist, so its token
values are *derived from a chosen concept* rather than invented ahead of one.

A session that arrives here and starts drafting a palette, a type scale or a token set has skipped
the step this stage exists to protect. If the mockups are not in yet, the answer is that the next
action is the owner's — not a session's.

## Decided (2026-07-28 — this session)

Recorded in PROJECT_DECISIONS.md — "Stage 7A visual direction and the theming boundary". Not
restated here.

- Direction: **cyberpunk, neon on dark**, public site and admin.
- **One theme ships**; the architecture admits a second without touching layout, switched by a
  build-time config constant, by the artist rather than the visitor.
- The theming boundary as a **property**: a theme varies how a surface looks, never where anything
  sits. Heading sizes, block spacing, corner radius, border width and target size are single
  site-wide values Stage 7A may retune **once**.
- **Tap-target floor: 44 × 44**, inline-in-prose exempt.

## Open

- **A UI handle for theme switching** — deliberately undecided.
- **The two-column admin card grid** (`PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`) — a recorded 7A
  item; TASK_01's screen 5 shows the current one-column layout and does not resolve it.
- **A contrast measurement tool does not exist** (`scripts/` has none). The specification will carry
  an admission rule requiring a *measured* contrast table, and a rule whose evidence cannot be
  produced is the hole that left Stage 6 with three undischargeable obligations. TASK_01 CO-2.

## Task files

- **`STAGE_7_TASK_01_visual_concept.md` — `ready`.** The only Stage 7 task. Its constraint list and
  six deliverables are consensus-reviewed; **the next action is the owner's**, and no session should
  pick it up before mockups exist.
- Not cut yet, and cut in this order: the **visual specification** task (after the concept is
  recorded), then the **7A item cut** (after the specification). Neither has anything to stand on
  today.
- Non-Stage-7: `META_TASK_01_framework_consolidation.md` (`draft`).

## Open research threads (report these — anti-rot duty, AI_CROSS_REVIEW.md)

**None open.** `pnpm project:status` reported 0 review and 0 research threads before this session's
thread was opened; that thread reached consensus and moved to `reviews/done/`. No deferred accepted
findings — all six were applied in-thread.

## Next topic

**Wait for the owner's mockups, then run `STAGE_7_TASK_01_visual_concept.md`.**

After it closes, in order:

1. Cut the **visual specification** task. It owns: the token table and the *measured* contrast
   table, the type scale, the spacing rhythm, the tap-target floor at 44, the theme architecture
   (`:root[data-theme="…"]` — specificity 0,2,0, so it wins without depending on source order, which
   is the lesson of the `--color-border` episode), and what counts as a violation with the
   instrument that checks each rule. It also owns CO-2 above.
2. Then cut the **7A items**. Candidates already visible, none of them planned yet: the theme
   architecture refactor (render-identical), the tap-target floor raise (**a floor raise, not a
   restyle**), `app/not-found.tsx` (a third styling system by construction — its own `<html>` outside
   the `[locale]` tree, no stylesheet, inline values; under a themed site it stays unthemed),
   a11y beyond Item 18, admin polish incl. show/hide password, and the artist's copy pass.

**Do not start these before the specification exists.** That is the whole shape of this stage.

## Standing hazard (recurring — worth watching)

The shared git index and shared PROJECT_* docs have caused commit misattributions
(`df70cae`; Item 8's `en.json` into `94ef19b`). **Do not run two sessions writing the same file at
once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
