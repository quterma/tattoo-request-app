# Task: Stage 6 — placeholder visual assets (favicon, studio photos, Featured Work, OG) (Item 16)

## Status

`draft` · created 2026-07-23 · owner decision 2026-07-23
**Sequence:** after Items 6 and 5 — the OG image and metadata copy depend on the final positioning
text, and Featured Work slots are created by Item 5.

## Execution

- Executor: `claude` (the favicon is drawn, not generated — see below) with owner-run image
  generation for the photographic assets.
- Reviewer: `claude`; Codex cross-review only if it ends up touching non-trivial source (likely not
  — this is assets + a marker sweep).
- Allowed Write Surface: `app/icon.svg`, `app/[locale]/opengraph-image.tsx`, `public/` (new
  placeholder images), the components that reference them, PROJECT_* reporting docs.
- May touch dependencies / migrations: **no**.

## Context

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **Owner intent (2026-07-23):** the studio is under renovation, so real photos are weeks away.
   Ship a **complete-looking site** in the meantime — good enough to judge the design and maybe spark
   inspiration — with every placeholder clearly marked so nothing fake reaches a public launch.
   Quality matters here; these are not grey boxes.
3. **Owner accepted the fake-work risk explicitly** ("это всё для теста"). The mitigation is the
   marker + pre-deploy sweep below, not avoidance.

## Scope

### 1. Favicon — drawn, not generated
Generative models fail at 16×16: the format needs one shape, readable in a single colour. Draw
`app/icon.svg` directly as a minimal vector mark in the artist's idiom (candidates: an `MK`
monogram; a single calligraphic brush stroke; a simple ink-mark motif). Produce 2–3 options, let the
owner pick. Must read at 16×16, work on light and dark tabs, and use no gradients or fine detail.

### 2. Generated placeholders (owner runs the generation)
Write the prompts + specs; the owner generates in ChatGPT/Midjourney and drops the files in. Deliver
a prompt per asset covering subject, mood, palette, aspect ratio and pixel size:
- **Studio interior — 2–3 images** for the Location page (replacing the current placeholder squares).
  Calm, warm, minimal tattoo studio; consistent light and palette across the set.
- **Featured Work — 4 images** for Home (Item 5 creates the slots). Ink/brush/calligraphy-adjacent
  artwork in her stylistic family.
- **OG image — 1** (1200×630) replacing the text-only `opengraph-image.tsx` render, consistent with
  the final metadata copy from Item 6.

### 3. Marker + tracking (the safety net)
Every placeholder asset carries the grep-able **`__asset_TODO`** marker in the referencing code or an
adjacent comment, so `grep -rn __asset_TODO app/ src/ public/` lists every swap point. Add the list
to STAGE_6_STRAT_BRIEF.md → "Pre-deploy swaps to track", and make it a checked item of the Item 13
acceptance sweep.

## Out of Scope

- Real photography and the artist's real portfolio (owner, pre-deploy).
- Visual redesign of any page.
- Brand identity work beyond the favicon mark.

## Completion obligations

```text
- CO-1 — Every generated/placeholder asset carries `__asset_TODO` and appears in the STRAT brief's
  pre-deploy swap list. Disposition: OPEN.
- CO-2 — Favicon renders correctly at 16×16 in a real browser tab, light and dark. Disposition: OPEN.
- CO-3 — RISK, owner-accepted: generated "tattoo-like" artwork must not survive to public launch —
  it would present non-existent work as the artist's. Item 13's sweep must fail if any
  `__asset_TODO` remains at launch. Disposition: OPEN — carried into Item 13.
```

## Review Granularity

`single`.

## Workflow (enforced)

Per CLAUDE.md: `pnpm qg` before results; commit only on explicit owner approval.
