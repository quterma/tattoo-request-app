# Task: Stage 7A — visual concept (Item 1)

## Status

`ready` · created 2026-07-28 · **the next action is the owner's, not a session's** — the mockups do
not exist yet and nothing here is executable until they do. Its constraint list and deliverable set
reached consensus in `reviews/done/REVIEW_2026-07-28_stage7-concept-generation-constraints.md`
(2 rounds, 6 findings, all accepted).

## Execution

- Executor: `claude` — the session that receives the owner's mockups and records the chosen concept.
  Generation itself is owner-carried, the same shape as Stage 6 Item 16, whose Round 1 shipped
  prompts only and whose images the owner produced in ChatGPT.
- Reviewer: `claude`
- Baseline: the commit that introduced this task file.
- Allowed Write Surface: this file, plus `docs/project/STAGE_7_VISUAL_SPECIFICATION.md` **only if**
  the follow-up task that owns it has not been cut yet. No source files. No `public/`.
- May touch dependencies / migrations / generated files / shared docs: **no**.

## How to run (session settings)

- Model: Opus — this is the input to a stage-wide specification.
- Start mode: Plan mode.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. Stage Source of Truth: **none exists yet for Stage 7** — producing it is what this task feeds.
   Product behavior remains governed by `STAGE_6_FUNCTIONAL_SPECIFICATION.md`, which Stage 7 does
   not change.
3. Task-specific: `PROJECT_IMPLEMENTATION_PLAN.md` — Stage 7 (the `[7A]` items and the two
   load-bearing a11y constraints); `PROJECT_DECISIONS.md` — "Stage 7A visual direction and the
   theming boundary" and "Surviving token system"; `tasks/done/STAGE_6_TASK_13_acceptance_sweep.md`
   — Mobile QA (the measured tap-target heights);
   `reviews/done/REVIEW_2026-07-28_stage7-concept-generation-constraints.md`.

## Goal

Turn owner-generated mockups into a **recorded visual concept** for Stage 7A — a direction concrete
enough that the visual specification's token values can be derived from it rather than invented.

## Scope

1. **The constraint list below is final** and goes into the owner's generation prompts verbatim in
   substance. It is not re-litigated; changing it requires re-opening the closed review thread.
2. **The deliverable set below is final** — five screens plus one interaction-state sheet.
3. Receive the owner's mockups, check them against the list, and name every constraint the returned
   set fails to evidence.
4. Record the chosen concept: the named typefaces, the colour roles legible in the mockups, the
   proposed heading sizes / block spacing / corner radius / border width, and the interactive target
   treatment.

### The constraint list (final)

```
 1. Mobile-first. All mockups at 375px viewport width, except screen 5 below.
 2. Body text is never set in neon. Body copy is near-white on near-black.
 3. Glow (text-shadow / box-shadow) is permitted only on accents, borders and the
    focus ring. Glow contributes nothing to measured contrast, so it may never be
    the reason a text or a control is legible.
 4. The error state owns its signal, and no decorative accent may be confusable
    with it: if an accent sits near red or orange, errors must be distinguished
    by more than hue alone. This governs ACCENT hues only — neutral surfaces
    (backgrounds, cards, borders) may be warm or cool.
 5. The focus ring must be visible against every background it appears on. It is
    the site's only focus indicator.
 6. The page set, the navigation, and the block order within each page do not
    change.
 7. This list of what may be proposed is NOT exhaustive. It expressly includes,
    as single site-wide values shared by every future theme: heading sizes,
    spacing between blocks, corner radius, border width, and interactive target
    size. These stay fixed: the height of the navigation bar, and the composition
    of each page.
 8. Every interactive control is at least 44 x 44 CSS px. Exception, per WCAG 2.2
    SC 2.5.8: links inline in a sentence are exempt and must NOT be enlarged —
    enlarging them breaks the paragraph. Four controls are undersized today and
    must visibly meet the floor: navigation links (28px high), map links (36px),
    Instagram icon links (16x16), and the selects on /request (39px). The
    navigation bar stays 56px tall; the link box grows inside it.
 9. Images are placeholders for real photography of tattoos and of the studio.
    Draw them as photographic slots at fixed aspect ratios that an ordinary photo
    can fill — not as composed illustration or synthetic scenes. The design must
    still read correctly when the image is a plain photograph.
10. Use realistic text lengths: headlines wrapping to 2-3 lines, body paragraphs
    of 3-6 lines. Short placeholder text hides wrapping problems.
11. Name the typefaces. Each set states the exact font family it proposes for
    display and for body (or an explicit system fallback), uses the same family
    and role assignment across all deliverables, and renders ordinary UI copy
    rather than logo-like invented lettering.
```

### The deliverable set (final)

| # | Screen | Width | Why it is here |
| --- | --- | --- | --- |
| 1 | Home hero | 375 | image, headline, one CTA |
| 2 | A content page | 375 | headings, paragraphs, lists, an FAQ — reading comfort |
| 3 | **`/request` in its error state** | 375 | selects, three upload fields, **seven inline errors at once** — the surface where a direction actually fails |
| 4 | Admin request list | 375 | private tool; readability outranks effect |
| 5 | Admin request list | desktop | current one-column layout |
| 6 | Interaction-state sheet | — | the focus ring on a public surface, on a form control, and on an admin card |

Screen 3 will not be produced unless it is asked for explicitly. Screen 6 exists because constraint
5 is otherwise unfalsifiable: a static generator renders default states, so no other screen carries
evidence for it.

## Out of Scope

- **Token values.** Deriving the palette, the type scale and the contrast table is the visual
  specification's job, in the task that follows this one.
- The Stage 7A item cut — it comes after the specification, not before.
- The **two-column admin card grid** (`PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`): screen 5 shows
  the current one-column layout, and the candidate keeps its own authorization.
- Anything tagged `[7B]`, and everything in Stage 8.
- Source code. This task changes no behavior and touches no component.

## Workflow (enforced)

Standard workflow per `docs/framework/templates/STAGE_TASK_TEMPLATE.md`, with one deviation
inherent to the task: **generation is owner-carried**. The executing session does not generate
mockups; it receives them, measures them against the constraint list, and records the outcome.

## Completion obligations

```text
- CO-1 — The visual specification must derive its token values from the recorded concept, not
  invent them.
  - Required by: the reason this task exists — PROJECT_IMPLEMENTATION_PLAN.md:1057-1062 requires a
    recorded design direction before any 7A item can be cut.
  - Disposition: tracked in — the follow-up task cut when this one closes; it may not be set `ready`
    before the concept is recorded here.

- CO-2 — A contrast measurement tool must exist before any theme is declared to pass.
  - Required by: the admission rule the specification will carry (a measured contrast table). No
    such script exists in `scripts/` today, and a rule whose evidence cannot be produced is the same
    class of hole that left Stage 6 with three undischargeable "manual browser check" obligations.
  - Disposition: tracked in — the specification task; it is that task's own obligation to either
    deliver the tool or record why the table can be produced without it.

- CO-3 — The two-column admin card grid remains undecided.
  - Required by: PROJECT_IMPLEMENTATION_PLAN.md:1017-1018, a recorded 7A item this task's screen 5
    deliberately does not resolve.
  - Disposition: tracked in — PROJECT_IMPLEMENTATION_PLAN.md, Stage 7 `[7A]`, where it already sits.
```

## Review Granularity

`single` — no source changes, no churn.

## Acceptance Criteria

1. A mockup set exists covering all six deliverables.
2. Every returned set names its display and body typefaces explicitly (constraint 11).
3. The four undersized controls visibly meet 44 × 44 in the returned set, and the navigation bar is
   still 56px tall (constraint 8).
4. Screen 6 shows the focus ring on all three background classes (constraint 5).
5. The chosen concept is recorded in this file with enough specificity that the specification's
   token values follow from it — a later reader can point at the mockup for each value.
6. Any constraint the returned set fails to evidence is named explicitly rather than assumed
   satisfied.

## Reporting

Per the template. This task changes no source, so no quality gates are armed and no cross-review is
mandatory on that ground.

## Execution Report (filled by the executor)

<pending — the mockups do not exist yet>
