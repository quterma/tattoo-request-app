# Task: Stage 6 — Home rebuild (Item 5)

## Status

`done` · created 2026-07-23 · copy approved by the owner 2026-07-23 (v3) · code implemented
2026-07-24 · **Codex cross-review reached consensus after 9 rounds**
(`reviews/done/REVIEW_2026-07-24_stage6-item5-home-rebuild.md`) · **committed `a4cbf31`** ·
evidence base: `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md`

**CO-2 (mobile-viewport read-through) stays open by design** — no headless browser was available;
routed to PROJECT_BACKLOG.md ("Home mobile-viewport read-through — CO-2 gap") and discharged in the
visual pass / Item 13, alongside Item 6's identical gap. It does not gate this task's code.
**Sequence:** run **after** Item 6 (`STAGE_6_TASK_06_process_content.md`) — Home's teasers link into
Process sections and its metadata/`INSTAGRAM_HANDLE` swaps land there.

**Both flagged write-surface deviations resolved by STRAT ruling (2026-07-24).**

1. **CO-3 / STRAT-brief conflict** — resolved by rewording CO-3 (see Completion obligations below):
   it now only requires the code-side `__asset_TODO` marker, which this task can and did discharge.
   The STRAT-brief half was done by the STRAT session itself, directly, as its own STRAT-only edit —
   not by this task. CLOSED.
2. **`docs/files-structure.md` write-surface conflict** — resolved by explicitly extending the
   Allowed Write Surface to include it (see Execution below), with the precedent
   (`STAGE_6_TASK_02_site_wide_shell.md`) and rationale (`pnpm structure`/`pnpm qg` are
   unconditionally mandatory and regenerate this file wholesale) now recorded there. The STRAT
   session also closed the pre-existing `b158b5d` staleness itself by running `pnpm structure` —
   this task's own final `pnpm qg` run reflects the caught-up tree (`STAGE_6_TASK_06...` now listed
   under `tasks/done/`) plus this task's own addition (the review-thread file). Full `pnpm qg` is
   green: structure, lint, typecheck, 399 tests, build.

CO-2 (live mobile read-through) remains honestly **PARTIALLY CLOSED** by owner instruction — no
headless-browser tool is available in this session, so the real mobile-viewport check is deferred to
the stage's visual pass (same as Item 6's CO-2 gap), not closed on a technicality.

## Execution

- Executor: `claude` or `codex`. Copy + block structure; the copy is **approved verbatim**.
  If delegated: `Executor: codex`, `Reviewer: claude`.
- Baseline: the commit that introduces this task file (or Item 6's commit, if it landed first).
- Reviewer: `claude` + independent Codex cross-review to consensus.
- Allowed Write Surface: `src/shared/i18n/messages/en.json` (`home` namespace),
  `app/[locale]/(public)/page.tsx`, a Featured Work image component + its placeholder assets if one
  is needed, tests, PROJECT_* reporting docs, **and `docs/files-structure.md`** (see below).
- **`docs/files-structure.md` is in surface, by necessity** (added 2026-07-24, STRAT ruling): CLAUDE.md
  makes `pnpm structure` / `pnpm qg` mandatory before presenting results, and `pnpm structure`
  regenerates that file wholesale — so excluding it would make a mandatory gate unrunnable. Precedent:
  `tasks/done/STAGE_6_TASK_02_site_wide_shell.md` listed the same regeneration explicitly. Commit
  whatever the generator produces; do **not** hand-edit it. Note it may also absorb unrelated drift
  from earlier commits — that is the generator's normal behavior, not this task's change.
- **`STAGE_6_STRAT_BRIEF.md` is NOT in surface** — it is STRAT-only
  (`STAGE_TASK_TEMPLATE.md`: "Do not edit … it is STRAT-only. Closing this task makes the brief lag,
  and that is fine"). See CO-3.
- May touch dependencies / migrations: **no**.

## Context

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **Copy approved and final for this pass** — do not re-word. Rationale per phrase:
   `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md` (Findings 1 §§2–4).
3. Governing spec — **FS §3.1**: Home must contain Hero (name, one-line specialization, city),
   Featured Work (4–8 owner-curated images), Mini Process (4–5 one-line steps), Good Fit teaser,
   Price teaser, primary CTA. Must **not** contain long policies, prep/aftercare content, detailed
   FAQ, or long-form duplicates of Process. PRD D5 (48h), D8 (price teaser on Home, canonical on
   Process).
4. **Owner decision 2026-07-23: Featured Work ships with 4 images** (the FS-allowed minimum).
   Reason: visitors arrive from Instagram where the portfolio already lives — the block confirms
   "right artist", it is not a gallery. Real images are a pre-deploy owner swap; ship placeholders
   (see TASK_16).

## Approved copy

### Hero
> # Masha Karda
> ### Original tattoos inspired by Japanese painting and contemporary art — Tel Aviv
> 20+ years of painting behind every design. Each piece is drawn from scratch — made once, for you.
>
> [ Start Your Request ]

**Factual guard — do not restore the old line.** The shipped `aboutLine1` says "20+ years in
painting, calligraphy, and tattoo art" — **that is false and must be deleted**: 20+ years applies to
painting only; tattooing is ~6 years. The approved Hero line above claims painting experience only.
Do not state a tattooing year-count anywhere.

### Featured Work
Section heading + 4 images. Existing `seeMoreOnInstagram` link ("See more on Instagram" →
`@mashakarda_tattoo`) is kept below the grid.

### How It Works (Mini Process — 5 steps)
> **1. Send a request** — your idea, placement, and references, in one short form.
> **2. I reply within 48 hours** — every request gets a personal answer; if it's a match, we settle
> the details.
> **3. Want to meet first?** — free consultation, in person, no deposit. If not — skip ahead.
> **4. Book your date** — a deposit locks it in, and your sketch arrives the day before the session.
> **5. Tattoo day** — last small tweaks in person, and we bring the piece to life.

(Step order is deliberate and was corrected during review: reply → optional consultation → booking →
sketch → session. Step 3 is explicitly skippable — a consultation happens in fewer than half of
projects.)

### Good Fit teaser
> For people who want an original, medium-to-large tattoo shaped by my art and vision.
> [See if we're a match →]  *(links to Process → Good Fit)*

### Price teaser
> Tattooing is ₪1,000 per hour with a ₪2,000 minimum — placement and complexity decide how much time
> a piece needs.
> [Full pricing & process →]  *(links to Process → Pricing)*

### Instagram
Existing block retained: "Follow me on Instagram — @mashakarda_tattoo".

Plus the shared primary CTA at page end (Item 2 component).

## Scope

1. Rewrite the `home` namespace in `en.json` to the approved copy; **delete `aboutLine1`/`aboutLine2`
   in their current form** (About is folded into the Hero per the blueprint — PROJECT_DECISIONS.md,
   Home page).
2. Restructure `app/[locale]/(public)/page.tsx` into the **blueprint block order**:
   **Hero → Featured Work → Good Fit teaser → How It Works (Mini Process) → Price teaser → CTA.**

   **Corrected 2026-07-24 during plan review.** An earlier draft of this line listed How It Works
   before the Good Fit teaser. That was a drafting slip, **not** a decision — the authoritative order
   is PROJECT_DECISIONS.md → "Home page (FS §3.1)" → Block order, and its rationale is load-bearing:
   the cheapest visual/positioning filters ("do I like the work / am I a fit") come **before** the
   detailed content (process mechanics, price), so a visitor who is not a fit disengages before
   investing attention in details that no longer matter. Putting How It Works ahead of Good Fit
   inverts that funnel. **Do not amend PROJECT_DECISIONS.md to match the task file — the decision
   wins and the task file was fixed instead.**
3. Featured Work: 4 placeholder images in a mobile-first grid, natural aspect, no crop-to-square if
   it distorts. Mark placeholders with the grep-able `__asset_TODO` marker so the pre-deploy sweep
   finds them (see TASK_16).
4. Teaser links deep-link into the Process page sections created by Item 6 (`/process#good-fit`,
   `/process#pricing` — the anchors exist).
5. **Featured Work heading = `Featured Work`** (approved 2026-07-24; the copy block specified the
   block but not the literal heading string).
6. **The Hero's Instagram link stays, unchanged.** PROJECT_DECISIONS.md records an explicit owner
   decision (2026-07-13) to keep **both** Instagram instances — Hero and the one under Featured Work
   ("see more on Instagram") — as the same action in two placements, not competing CTAs. Do not
   remove either.
7. **Steps carry no inline links.** Only the Good Fit and Price teasers deep-link into Process; do
   not carry over the old `step2Text` rich-text/link pattern.

## Out of Scope

- Process page content (Item 6).
- Real photography (pre-deploy owner swap — TASK_16).
- Footer changes (TASK_15).
- Any new Home block beyond FS §3.1's list — the research explicitly found none justified.

## Completion obligations

```text
- CO-1 — No false experience claim survives anywhere in the tree: grep for "20+" / "years" and
  confirm no string claims 20+ years of tattooing or calligraphy.
  Disposition: CLOSED (2026-07-24). Evidence: `grep -rn "20+\|years" src/shared/i18n/messages/en.json`
  returns exactly one match — "20+ years of painting behind every design…" (painting-scoped). No
  tattooing/calligraphy year-count string exists anywhere in `src/` or `app/`. Confirmed twice
  (own check + independent Codex cross-review round 1 "Copy and factual guard" disposition).

- CO-2 — Live mobile read-through of /en: block order matches FS §3.1, both teaser links resolve to
  the right Process sections, no orphaned i18n keys, build clean.
  Disposition: PARTIALLY CLOSED — owner-accepted deferral (2026-07-24), routed to a canonical work
  item per Codex cross-review round 7 (a STRAT-brief mention alone is not a work item). What IS
  evidenced: block order confirmed via rendered HTML heading order (`curl` against a local dev
  server) and independently by Codex against PROJECT_DECISIONS.md; both teaser links
  (`/process#good-fit`, `/process#pricing`) confirmed resolving to real anchors in
  `process/page.tsx`; no orphaned i18n keys (checked both directions: every `t()` call in
  `page.tsx` has a matching `en.json` key and vice versa); `pnpm qg` build is clean. What is NOT
  yet evidenced: an actual rendered **mobile-viewport** read-through in a browser — no
  headless-browser tool (chromium-cli/Playwright) was available in this environment, same
  limitation Item 6 recorded. **Routed to
  `PROJECT_BACKLOG.md#home-mobile-viewport-read-through-co-2-gap-stage-6-item-5-2026-07-24`** —
  a natural fit for Item 13's FS §6 acceptance sweep or the visual pass, not worth its own task
  file. (Anchor added 2026-07-26 by STRAT: the original pointer named the file with no anchor, so
  it resolved to nothing checkable — the precise defect PROJECT_BACKLOG.md's own
  "Unresolved completion obligations" entry recorded against this task.)
  **Re-routed 2026-07-26 by STRAT to an executable work item.** The backlog pointer above named a
  document but no anchor, so it resolved to nothing checkable and left this obligation formally
  unresolved. The visual pass it anticipated now exists as a cut task, and the capability the
  original check lacked now has one too: `TOOLING_TASK_02` adds `playwright` + `pnpm shot`, and
  Item 18's CO-1 requires all six public routes captured at 320/375/768/1280. Home is covered
  there, so this is no longer a deferral with no owner.
  tracked in: docs/project/tasks/STAGE_6_TASK_18_visual_consistency.md

- CO-3 — Featured Work placeholders carry the `__asset_TODO` marker, discoverable via
  `grep -rn __asset_TODO app/ src/`.
  **Rewritten 2026-07-24 by STRAT ruling** — the original wording also required listing them in
  `STAGE_6_STRAT_BRIEF.md`, an obligation the executor structurally *cannot* discharge: the brief is
  STRAT-only and outside every task's write surface (`STAGE_TASK_TEMPLATE.md`). That was a drafting
  error in this task file, not an IMPL failure; the Codex cross-review was right to flag it and this
  session was right to revert the attempted edit. **The brief half is now done by the STRAT session
  that issued this ruling** — the Featured Work 4-placeholder entry is in the brief's pre-deploy
  swaps list — so nothing about it is pending on IMPL.
  Disposition: CLOSED (2026-07-24). Evidence: all 4 Featured Work placeholders in `page.tsx` carry
  `__asset_TODO` (`grep -rn __asset_TODO app/` → 4 matches).
```

## Review Granularity

`single` — copy + block reordering on one page.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Commit only on explicit owner approval.
