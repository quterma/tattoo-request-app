# Task: Stage 6 — Home rebuild (Item 5)

## Status

`ready` · created 2026-07-23 · copy approved by the owner 2026-07-23 (v3) ·
evidence base: `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md`
**Sequence:** run **after** Item 6 (`STAGE_6_TASK_06_process_content.md`) — Home's teasers link into
Process sections and its metadata/`INSTAGRAM_HANDLE` swaps land there.

## Execution

- Executor: `claude` or `codex`. Copy + block structure; the copy is **approved verbatim**.
  If delegated: `Executor: codex`, `Reviewer: claude`.
- Baseline: the commit that introduces this task file (or Item 6's commit, if it landed first).
- Reviewer: `claude` + independent Codex cross-review to consensus.
- Allowed Write Surface: `src/shared/i18n/messages/en.json` (`home` namespace),
  `app/[locale]/(public)/page.tsx`, a Featured Work image component + its placeholder assets if one
  is needed, tests, PROJECT_* reporting docs.
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
2. Restructure `app/[locale]/(public)/page.tsx` into the FS §3.1 block order: Hero → Featured Work →
   How It Works → Good Fit teaser → Price teaser → CTA.
3. Featured Work: 4 placeholder images in a mobile-first grid, natural aspect, no crop-to-square if
   it distorts. Mark placeholders with the grep-able `__asset_TODO` marker so the pre-deploy sweep
   finds them (see TASK_16).
4. Teaser links deep-link into the Process page sections created by Item 6.

## Out of Scope

- Process page content (Item 6).
- Real photography (pre-deploy owner swap — TASK_16).
- Footer changes (TASK_15).
- Any new Home block beyond FS §3.1's list — the research explicitly found none justified.

## Completion obligations

```text
- CO-1 — No false experience claim survives anywhere in the tree: grep for "20+" / "years" and
  confirm no string claims 20+ years of tattooing or calligraphy. Disposition: OPEN.
- CO-2 — Live mobile read-through of /en: block order matches FS §3.1, both teaser links resolve to
  the right Process sections, no orphaned i18n keys, build clean. Disposition: OPEN.
- CO-3 — Featured Work placeholders carry `__asset_TODO` and are listed in the STRAT brief's
  pre-deploy swaps. Disposition: OPEN.
```

## Review Granularity

`single` — copy + block reordering on one page.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Commit only on explicit owner approval.
