# Task: Stage 6 — Visual consistency pass (Item 18)

## Status

`ready` · created 2026-07-26 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

Blocks: Stage 6 Item 13 (FS §6 acceptance sweep — the stage-closing gate).
Source: discharges the mobile-viewport completion obligations of Items 5 and 6.

## Execution

- Executor: `claude` — this consolidates a design-token system and reshapes shared layout
  primitives every page depends on. AI_TASK_PROTOCOL.md lists subjective UI iteration and
  abstraction changes as non-delegable to Codex.
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus, **per block**
  (AI_CROSS_REVIEW.md). The **3-round review cap** applies to each thread.
- Baseline: **the commit that introduced this task file** — do NOT write a hash here. The executor
  derives it (`git log -1 --format=%H -- <this file>`) and stops only if the Allowed Write Surface
  has moved since then, or is dirty.
- Allowed Write Surface:
  - **Block A:** `src/shared/styles/tokens.css`, `app/globals.css`, `src/shared/ui/page.tsx`,
    `.../section.tsx`, `.../container.tsx`, `.../stack.tsx`, `.../app-nav.tsx`,
    `.../public-footer.tsx`, `.../cta-request-button.tsx`, `.../index.ts`, and tests for the above.
  - **Block B:** `app/[locale]/(public)/page.tsx`, `.../process/page.tsx`, `.../location/page.tsx`,
    `.../preparation/page.tsx`, `.../aftercare/page.tsx`, `.../request/page.tsx`,
    `.../success/page.tsx`, `.../error.tsx`, `.../layout.tsx`, `src/features/request/ui/*.tsx`,
    `public/images/hero.jpg` (new), `src/shared/i18n/messages/en.json` (**alt text for the hero
    image only** — no other copy change), and tests for the above.
  - Both blocks: `docs/files-structure.md` (generated) and the `PROJECT_*` reporting docs named
    under Reporting.
- May touch dependencies / migrations / generated files / shared docs: **no dependencies**, no
  migrations. `playwright` is added by `TOOLING_TASK_02` — this task consumes it, never installs it.

## How to run (session settings)

- Model: Sonnet for Block A (mechanical against a written contract); **Opus for Block B** if the
  hero treatment or a mobile-width fix turns out to need judgment rather than application.
- Start mode: Plan mode (mandatory)
- Switch to edit/acceptEdits: only after the plan is explicitly approved

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md (`## Current Stage` only),
   PROJECT_CONTEXT.md, PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md (as needed).
2. Stage Source of Truth: `STAGE_6_PRODUCT_DEFINITION.md` (PRD) and
   `STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS). **Note FS §1 explicitly excludes visual design from
   its scope** ("Not defined here: visual design, styling, component architecture") — so the FS
   authorizes nothing here, and equally forbids nothing. What governs instead is the boundary in
   PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design (2026-07-26)".
   Read it before planning; it is the reason this task is narrow.
   **The FS still binds absolutely on everything it does define**: block order, content, nav, CTAs.
   No copy changes, no block reordering, no CTA changes — see Out of Scope.
3. Task-specific:
   - `docs/project/PROJECT_DECISIONS.md` — "Stage 6 / Stage 7 boundary" (2026-07-26) and "Named
     browser capability for visual verification" (2026-07-26).
   - `docs/project/tasks/done/TOOLING_TASK_02_playwright_screenshots.md` — the `pnpm shot`
     mechanism this task's verification depends on.
   - `docs/project/PROJECT_BACKLOG.md` — "Home mobile-viewport read-through — CO-2 gap" and
     "Oversized-file error copy — length/wording, for the Item 6 visual pass". Both are discharged
     here; read them before planning.

## Goal

Make the public site **internally consistent** — one design-token system instead of two, spacing
rhythm carried by the shared layout primitives instead of re-specified at every call site, one
heading scale, no dead CSS, and no viewport at which a page clips or overflows. The site should
look essentially as it does now, only coherent. This is debt created *inside* Stage 6 by Items
2–16, and Stage 6's exit criterion "visual and interaction quality is consistently high across all
surfaces" cannot verify while it stands.

**This task establishes no new visual identity.** No new palette, no new fonts, no layout
redesign, no art direction. That work is Stage 7 (PROJECT_IMPLEMENTATION_PLAN.md — Stage 7), which
runs against real photography rather than against the AI placeholders currently in the tree.

## Scope

### Block A — the token and primitive foundation (risk nucleus)

**Contract: there is one token system, and the layout primitives carry the spacing rhythm.**
Everything in Block B consumes this; it must be settled and reviewed before pages are touched.

1. **Reconcile the two token systems.** `src/shared/styles/tokens.css` defines raw hex
   (`--color-text-secondary: #6b6b6b`, `--color-border: #e0e0e0`, `--color-link: #2563eb`,
   `--color-bg`, `--color-text-primary`, `--color-focus`) and drives the `@layer base` element
   styles in `app/globals.css`. Independently, `app/globals.css`'s `:root` defines the shadcn oklch
   set (`--foreground`, `--muted-foreground` ≈ `oklch(0.556 0 0)`, `--border` ≈ `oklch(0.922 0 0)`,
   `--primary`, …), which every component consumes through Tailwind utilities
   (`text-muted-foreground`, `border-border`, `bg-foreground`). The result is **two greys, two
   borders, and two link treatments** in one site. Collapse them to one source of truth.
   - Which system survives is the executor's call, argued in the plan. The shadcn/oklch set is the
     one the components actually use and the one Tailwind utilities are generated from, so
     converging on it is the lower-churn direction — but state the reasoning, do not assume it.
   - **Preserve the rendered result** as closely as the reconciliation allows. Where the two
     systems disagree, the visible value changes by definition; name each such change in the plan
     rather than letting it happen silently.
2. **Delete verified-dead tokens and utilities.** `--chart-1..5` and `--sidebar-*` in
   `app/globals.css`, and the `.text-small` / `.text-muted` classes in its `@layer base`, have
   **zero references** across `app/` and `src/` (verified 2026-07-26). Re-verify, then remove.
3. **One heading scale.** `@layer base` sizes `h1`–`h4` from fixed `rem` tokens with no responsive
   step, so every page's `<h1>` is 2rem at 320px and at 1280px, while the Home hero opts out
   entirely with `text-4xl sm:text-5xl`. Establish one scale that works at both ends and that the
   hero does not need to escape.
4. **Make the primitives carry the rhythm.** `Section`'s default is `py-6 sm:py-8`, but **30 of
   its 36 call sites override it** (`py-2 sm:py-3`, `py-4 sm:py-6`, `py-3 sm:py-3`); `Page`'s
   `py-8 sm:py-12` is overridden on four of six pages. A default that is overridden 83% of the time
   is not a default. Decide the real rhythm and encode it in the primitives — a small named set of
   options if genuinely needed (`Section` density variants), not an open `className` free-for-all.
5. **Resolve the three stacked spacing mechanisms.** `@layer base` sets `p { margin: 0 0 1em }` and
   `h2 { margin: 0 0 0.5em }`; components then fight both with `mb-0` (24 occurrences) and `mb-1`,
   while `Stack gap-*` adds a third. Pick one mechanism and make the others unnecessary.
   - **STATUS: PARTIALLY DONE — OPEN. Block A chose the mechanism; Block B must perform the
     removal.** Chosen: `Stack gap-*` + the primitives' density variants; the `@layer base` flow
     margins go. They were **deliberately retained** in Block A: it cannot edit call sites, so
     removing them there collapses the 5 bare `<h1>` page titles and every `<p>` with no `mb-*`
     counter — a visible regression on 5 of the 6 public routes, which Block A is forbidden to
     repair. Block B step 1 removes `p { margin: 0 0 1em }` and the four `h1`–`h4` margins
     **atomically with the 41 `mb-0`/`mb-1` counters**, under the CO-1 screenshot gate.
   - The comment above those rules in `app/globals.css` is a pointer for the reader, **not** the
     guarantee. **This scope item is the guarantee, and it stays open until Block B ships the
     removal — the task may not go `done` while it reads PARTIALLY DONE.**
6. **Write the Home hero image prompt** — one short paragraph, in the style Item 16 established
   (`tasks/done/STAGE_6_TASK_16_placeholder_assets.md` — `## Prompt Set`): subject/mood/palette
   together, plus orientation and size (wide, full-bleed, ~1920×1080 or wider). Hand it to the
   owner **at the start of Block A** so generation happens in parallel with the rest of Block A,
   not after it. The image itself is wired in Block B.

### Block B — apply to consumers

**Contract: every public page and the request form consume Block A's foundation, and every page
renders correctly at 320/375/768/1280.**

7. **Apply the foundation to all public pages** — Home, Process, Location, Preparation, Aftercare,
   Request, Success, `error.tsx`, and the `(public)` layout. Remove the per-call-site `py-*`
   overrides and the `mb-0`/`mb-1` corrections that Block A made unnecessary.
8. **Apply it to the request form UI** — `src/features/request/ui/*.tsx` (RequestForm,
   UploadCategoryInput, SuccessView, Button, TextInput, TextareaInput, CheckboxInput, SelectInput).
   This is the site's primary conversion surface and the largest single block of UI; it must not be
   left on the old values.
9. **Fix the Home hero.** It currently renders `bg-muted` + `bg-black/50` with white text and **no
   image** — a grey box with a scrim, built for a background that was never specified. It carries
   **no `__asset_TODO`**, so Item 13's sweep would not have caught it.
   - Wire the owner-generated image (from item 6) at `public/images/hero.jpg` via `next/image`,
     following exactly the pattern Item 16 established in `location/page.tsx` and Home's Featured
     Work grid (`fill` + `sizes` + explicit per-slot `__asset_TODO` comment, distinct alt text).
   - Add its `__asset_TODO` marker — it becomes the **10th**. Update the count in
     `PROJECT_PRODUCTION_READINESS.md`, which currently says nine.
   - Fix the contrast: `text-white/70` over the current scrim does not reach WCAG AA for body text.
     Whether that is solved by scrim opacity, a gradient, or type colour is the executor's call.
10. **Verify every page at four widths** using `pnpm shot` (TOOLING_TASK_02): 320, 375, 768, 1280.
    Fix what clips, overflows, or wraps illegibly. Two known suspects, both to be checked rather
    than assumed broken: Location's map-link row is `grid-cols-3` carrying `break-words
    leading-tight` (defensive wrapping that suggests it was overflowing), and the `(public)` layout
    pins `min-w-[320px] overflow-x-hidden`, which **hides** horizontal overflow rather than
    preventing it — so overflow must be detected by measuring, not by looking for a scrollbar.
11. **Shorten the oversized-file error copy** — PROJECT_BACKLOG.md records that the current message
    ("This image is over 4 MB. Please use a smaller one — a screenshot usually works.") overflows a
    narrow mobile row beside the thumbnail and remove control, and that the owner leans toward
    dropping the "a screenshot usually works" hint. This is the one copy change in scope, it is
    pre-approved by that backlog entry, and it changes **no behavior** (the 4 MB rejection is
    FS §4.3 and stays exactly as it is). Confirm the final wording with the owner in the plan.

## Out of Scope

- **No new visual identity** — no new palette, no font change (the system font stack stays), no
  layout redesign, no art direction, no animation. Stage 7 owns all of it. If the executor believes
  a change is necessary that a reader would call "design", it is out of scope by definition: file
  it for Stage 7 and move on.
- **No content or structure changes.** Copy, block order, navigation, CTAs, headings-as-text and
  page responsibilities are FS-governed and already shipped. The single exception is the
  oversized-file error string in scope item 11.
- **No new components or abstractions** beyond what scope item 4 requires inside the existing
  primitives. In particular, PROJECT_BACKLOG.md's "Extract typography components (SectionTitle,
  SectionText, BulletList)" and "Replace `split("\n")` in i18n with string arrays" are **not** in
  scope — they are architecture changes and stay backlog items.
- **No admin surfaces.** Stage 6's design-system line covers admin too, but this task is the public
  website only; admin consistency belongs to Stage 7 alongside its deferred mobile checks.
- No dependency additions. No `pnpm qg` changes. No real assets — the hero is a generated
  placeholder like the other nine, and is marked as such.

## Workflow (enforced)

1. Read the Context docs; confirm understanding in 3–5 lines.
2. Work on one step at a time.
3. Before implementation: inspect the repository; challenge assumptions; surface ambiguities; ask
   rather than guess (fail-fast per CLAUDE.md).
4. Present a concise implementation plan per block, and wait for explicit approval. Each plan MUST
   carry a distinct **"Deviations from the task file"** section, or an explicit "no deviations".
   Each deviation line names where the original is specified — task file only (approvable in-plan)
   vs PRD/FS (**not** approvable in-plan; STOP and request the spec update).
5. Implement only after approval, within Scope only.
6. After each block: run the Review Pipeline per AI_REVIEW_PIPELINE.md (Test Agent → `pnpm qg` →
   Review Agent).
7. **Open an independent cross-review thread per block** once its pipeline is green. Own each loop
   to consensus; the **3-round cap** applies. A green pipeline is not a licence to propose a commit.
8. Never expand scope. If product behavior needs to change, STOP and request a spec update first.

## Completion obligations

```text
- CO-1 — Rendered verification at 320/375/768/1280 for all six public routes, using the named
  browser capability rather than deferred as a manual gap. This is the obligation Items 5, 6 and 16
  each failed to discharge; it is the reason TOOLING_TASK_02 exists.
  - Required by: Acceptance Criteria 5 and 6; discharges Item 5 CO-2 and Item 6 CO-2.
  - Disposition: completed — <executor records: the command run, the routes and widths captured,
    and what was found and fixed at each width>
- CO-2 — The Home hero image is a generated placeholder that must not survive to public launch, and
  must be discoverable by Item 13's sweep.
  - Required by: a contract the diff introduces (a new placeholder asset); PROJECT_DECISIONS.md §5
    (Item 16 — placeholder assets, owner-accepted risk), which binds every generated placeholder.
  - Disposition: completed — <executor records: the `__asset_TODO` marker's location, and the
    updated total in PROJECT_PRODUCTION_READINESS.md (nine → ten)>
- CO-3 — Any visible value that changed because the two token systems disagreed (greys, borders,
  link colour, heading sizes) is a deliberate, named change, not an accident.
  - Required by: Scope item 1; Acceptance Criterion 2.
  - Disposition: completed — <executor records: the list of changed rendered values, and that each
    was named in the approved Block A plan>
- CO-4 — Physical-device verification remains outstanding and is NOT discharged here. Headless
  Chromium at a 375px viewport is not an iPhone: it does not verify touch targets, real iOS/Android
  tab chrome, or the Item 4B admin image-viewer gestures.
  - Required by: Stage 6 exit criterion "mobile experience is polished"; the pre-existing Item 4B
    deferral.
  - Disposition: tracked in: docs/project/PROJECT_PRODUCTION_READINESS.md
```

## Review Granularity

**Two blocks** — the expected surface is ~26 execution-affecting files (2 CSS + 8 shared UI + 9
public pages/layouts + 8 form UI), crossing the 16-file trigger (AI_TASK_PROTOCOL.md — A Large Task
Is Reviewed in Checkpoints).

- **Block A is the risk nucleus**: the token system and the primitives are the contract every page
  consumes. Reviewing it after the pages were already rebuilt on it would reach the reviewer too
  late to matter — the exact failure that motivated the checkpoint rule.
- **Block A's handoff must state plainly what the reviewer can and cannot assert**: it changes the
  foundation while its consumers still carry their old per-site overrides, so the site is expected
  to look *transitional* at that checkpoint. End-to-end visual coherence is not assertable until
  Block B.
- Block B consumes a named, already-reviewed contract and does not repair Block A.

Before each block's final review, record the **actual** measured surface here (execution-affecting
files + churn).

**Block A — measured 2026-07-26 (`git diff --stat`): 6 execution-affecting files, +141 / −58.**

```text
app/globals.css               | 75 +++++++++--------------
src/shared/styles/tokens.css  | 46 ++++++++-----
src/shared/ui/index.ts        |  4 +++
src/shared/ui/page.tsx        | 26 ++++++--
src/shared/ui/section.tsx     | 33 +++++++++--
src/shared/ui/stack.tsx       | 15 ++++--
```

Well under the 16-file checkpoint trigger, as the split intended. Four files inside the Block A
write surface were verified to need **no** change and were left untouched — `container.tsx`,
`app-nav.tsx`, `public-footer.tsx`, `cta-request-button.tsx`: they consume only oklch utilities and
`--nav-height`, all of which survive unchanged. Non-execution-affecting files also changed:
`docs/files-structure.md` (generated by `pnpm structure`), PROJECT_DECISIONS.md,
PROJECT_BACKLOG.md, and this task file.

## Acceptance Criteria

1. Exactly one design-token system defines colour, type scale, and spacing. No component reads a
   token that another system also defines under a different name and a different value.
2. Every rendered value that changed versus the pre-task tree is listed in the task file, and each
   was named in the approved plan for its block (CO-3).
3. `--chart-*`, `--sidebar-*`, `.text-small` and `.text-muted` are gone, and `grep -rn` confirms no
   reference to them remains anywhere in `app/` or `src/`.
4. `Section` and `Page` are used without an ad-hoc `py-*` override at their call sites; any
   remaining override is a named variant the primitive exposes, not an arbitrary value.
5. `pnpm shot` captures all six public routes at 320/375/768/1280, and at no width does any page
   clip content, overflow horizontally, or overlap the fixed bottom navigation.
6. Home's hero renders the generated image, its text meets WCAG AA contrast for body copy, and the
   block carries an `__asset_TODO` marker.
7. `grep -rn __asset_TODO app/ src/ public/` returns exactly **10** matches, and
   `PROJECT_PRODUCTION_READINESS.md` lists all ten.
8. No copy string changed except the oversized-file error message (scope item 11).
9. Page structure, block order, navigation and CTAs are unchanged — the FS §6 criteria that Item 13
   will verify are not disturbed. FS §6 criteria 9, 10 and 11 in particular must still hold.
10. `pnpm qg` passes on each block.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress) and PROJECT_DECISIONS.md (if a decision was made — the
  choice of surviving token system qualifies and should be recorded).
- Update `PROJECT_PRODUCTION_READINESS.md`: the `__asset_TODO` count nine → ten including the hero.
- Update `PROJECT_STRUCTURE.md` if the shared-UI surface changed shape.
- **Reconcile `## Completion obligations` before closing.**
- Do **not** edit `STAGE_6_STRAT_BRIEF.md` — it is STRAT-only. Closing this task makes the brief
  lag; the next STRAT session reconciles it.
- Set Status to `done` (date + stage-log pointer, no commit hash); move this file to
  `docs/project/tasks/done/`; propose each block's commit for owner approval separately, only after
  that block's cross-review thread reached consensus.

## Execution Report (filled by the executor)

### Block A — 2026-07-26 — implementation complete, awaiting cross-review

Baseline verified: `b3e9df6` (the commit introducing this file); write surface unmoved since then,
tree clean at `599069f`.

**What changed**

- `tokens.css` — six `--color-*` tokens and `--font-size-small` deleted; `--font-family-base` renamed
  `--font-stack-base` (out of Tailwind's reserved namespace); `h1`/`h2` gained a responsive step via
  `@media (min-width: 40rem)`; `--font-size-display` added; `--nav-height` preserved verbatim
  (consumed from a Block B file).
- `globals.css` — `--chart-1..5` + 8 `--sidebar-*` deleted from both `:root` and `@theme inline`
  (13 + 13 declarations); `--link`/`--focus` added; `@layer base` `body` now reads
  `--foreground`/`--background`/`--font-stack-base`; `.text-small` and `.text-muted` deleted;
  `.text-display` added; flow margins retained with a handoff comment (scope item 5).
- `section.tsx` / `page.tsx` — `density` prop over a `const` map, defaults equal to today's render
  (`loose` / `normal`); `className` kept last in `cn()` so Block B's un-migrated overrides still win.
- `stack.tsx` — `gap` narrowed from `string` to a 5-value union; default `gap-4` → `gap-1.5`.
- `index.ts` — three `export type` additions; no new value exports.

**Gate results — all PASS** (re-run after each post-review source fix): `structure` PASS ·
`lint` PASS (0 errors; 1 warning, pre-existing `no-img-element` in admin, untouched by this block) ·
`typecheck` PASS · `test` PASS (33 files / 408 tests) · `build` PASS.

**Test Agent:** no new tests written. `PROJECT_TESTING_STRATEGY.md` — *What Should Not Be Tested* —
names *visual layout*, *simple presentational components* and *styling details*; a
`toHaveClass("py-2")` assertion would test the implementation and be rewritten by Block B. The
existing 408 tests were **actually run**, not assumed: they render components whose primitives
changed, and all pass. The real new guardrail is `typecheck` — the `density`/`gap` unions make an
invalid variant a build failure, which the previous `gap?: string` could not catch.

**Verified against the compiled CSS, not against source order.** The plan's original claim — that
`@theme inline` shadows tokens.css's `--color-border: #e0e0e0` — was **wrong**, and the owner's
insistence on build evidence caught it: in the bundle the hex actually wins the cascade (byte 22665
vs 4206). It was inert anyway, because `.border-border` compiles to `border-color:var(--border)` and
`var(--color-border)` appears zero times in the output. Conclusion unchanged, mechanism corrected —
recorded in PROJECT_DECISIONS.md. Post-change bundle confirms: zero occurrences of `chart-`,
`sidebar`, `text-small`, `color-text-primary`, `color-link`, `color-focus`, `font-family-base`;
`--link:#2563eb` exact; the `@media (min-width:40rem)` step and `.text-display` present; **zero
`clamp(` occurrences**. Bundle shrank 27212 → 26295 bytes.

**Review Agent** (read-only, `Explore`) raised 4 findings. Two accepted as **comment defects**: the
`Stack` comment claimed "every call site compiles unchanged" while `gap-4` had silently been dropped
from the union, and the `.text-display` comment overstated fidelity. Both comments rewritten; values
unchanged at that point. Two findings rejected with reasons: the heading-scale change is CO-3 rows
2–4, named and approved in advance; `docs/files-structure.md` is generated by the mandatory
`pnpm structure` gate and is explicitly inside this task's write surface.

**Independent cross-review — consensus, round 1** (`reviews/REVIEW_2026-07-26_stage6-item18-blockA-tokens-primitives.md`).
Codex raised **one** finding, from a class neither the screenshots nor the tests could see: the
first-draft `clamp()` scale, having a `vw` term, **suppressed browser zoom** — at 200% the layout
viewport halves in CSS pixels, so headings reached only 182.2% (h1) / 186.7% (h2) / 190.0%
(display) of their unzoomed physical size, short of WCAG 2.2 SC 1.4.4's 200%. The baseline's flat
`2rem` had no such defect, so the draft introduced it. Reproduced independently before accepting.
Satisfying MDN's `max >= 2 * min` guidance inside `clamp()` would have demanded a 56px h1 — a
redesign, out of scope — so the fix is a **breakpoint step** (`@media (min-width: 40rem)`, Tailwind
v4's own `sm` in its own rem units) with no viewport term at all: scaling is now exactly 200%.
Identical to the clamp at all four captured widths; larger (36/24px) between 640–1024px; and
`.text-display` now reproduces the hero's outgoing `text-4xl sm:text-5xl` **exactly at every width**,
retiring the "up to 2.4px short" caveat. Gates and `pnpm shot` re-run after the fix. No rejected
findings, no deferred items, nothing escalated.

**Rendered verification (transitional sanity, NOT CO-1).** `pnpm shot` against a production build,
6 public routes × 4 widths = 24 captures. **`scrollWidth === viewport` at every single width — no
horizontal overflow anywhere.** Spot-inspected Home/Process/Location at 320px and Aftercare at
1280px: spacing intact, nothing collapsed or clipped, Location's `grid-cols-3` map links fit at
320px, blue links visually confirmed. This is the *transitional* check the block split calls for;
CO-1 proper belongs to Block B, after the hero and the call-site migration.

**Unresolved / carried forward**

- **Scope item 5 stays OPEN** (PARTIALLY DONE) — flow-margin removal is Block B step 1. The task
  cannot go `done` while it reads that way.
- `.text-display`, the `tight`/`normal` density variants and `--font-size-display` have **no call
  site by design** — supplier-in-A / consumer-in-B pairs, not dead code. If Block B does not happen,
  they become dead and must be removed.
- **Out-of-scope findings filed to PROJECT_BACKLOG.md:** Geist is downloaded on every visit and never
  rendered (a real bandwidth cost, unfixable inside Item 18 — needs `layout.tsx`); and
  `app/not-found.tsx`'s inline styles, filed explicitly as **forced by construction, not drift**, so
  Stage 7 verifies the values rather than "fixing" them and breaking the Item 11 decision.
- CO-2, CO-3 (final), CO-1 remain Block B's to discharge. CO-4 (physical device) is not discharged
  here by design.
