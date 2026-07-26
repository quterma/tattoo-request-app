# Task: Stage 6 — placeholder visual assets (favicon, studio photos, Featured Work, OG) (Item 16)

## Status

`done` · created 2026-07-23 · promoted to ready 2026-07-25 (Items 6/5/15/17 all done; this is
the next actionable Stage 6 item) · owner decision 2026-07-23 · Round 1 started 2026-07-25 (plan
approved: favicon + prompt set + Location slot-count fix; photographic assets wired in a later round
once the owner drops the generated files in) · **mid-round pivot 2026-07-25:** owner redirected the
favicon from Claude-drawn to owner-generated-via-prompt, same as the other three asset categories —
see Scope §1/§2. Round 1 now ships prompts only (no visual asset lands in the tree this round) plus
the Location slot-count/marker fix. **Out-of-scope workflow finding filed (2026-07-25, per
AI_TASK_PROTOCOL.md Cross-Session Rules):** the recurring `docs/files-structure.md`-outside-write-
surface pattern (now a 4th sighting) plus a new shape of it (a content file, `en.json`, needing the
same kind of mid-task extension) was recorded in `docs/framework/AI_FRAMEWORK_IDEAS.md` — Workflow
Observations, for a future META session; not fixed here.
**Done 2026-07-26.** Round 2 cross-review reached consensus at round 3 (no dispute, no cap needed —
`reviews/done/REVIEW_2026-07-26_stage6-item16-round2-image-wiring.md`). CO-1 DONE. CO-2 the
mechanism is live-verified (SVG serves correctly); the remaining real-browser-tab light/dark check
is a manual pre-launch verification, already tracked in `PROJECT_PRODUCTION_READINESS.md` alongside
the existing Item 4B mobile-device gap — same treatment as Item 12's CO-5. CO-3 is OPEN BY DESIGN,
a permanent mitigation carried to Item 13, not something any single task closes. `pnpm qg` green
throughout both rounds.
**Round 1 cross-review closed by owner decision, 2026-07-26** (4 rounds, all findings accepted, no
disputes — `reviews/done/REVIEW_2026-07-25_stage6-item16-round1-favicon-pivot-location-slots.md`).
Owner ended the loop past the 3-round cap rather than continue: every round's findings were about
this task's own reporting docs, never about the shipped code (`location/page.tsx`'s grid change was
confirmed unchanged and correct at every pass). `pnpm qg` green throughout.
**Round 2 — all 9 owner-generated images wired, 2026-07-26.** Owner generated all four categories in
ChatGPT from the Round 1 prompt set and dropped them in a local `temp/` folder (not committed —
deleted after use). All 9 files verified against the prompt spec before wiring: correct format
(PNG), correct aspect ratio per category (favicon 1254×1254 square; studio 1672×941 = 16:9;
Featured Work 1122×1402 = 4:5; OG 1731×909 ≈ 1200:630), no readable text/logos/signatures, no
people, consistent palette within each set. Wired:
- **Favicon**: hand-vectorized into `app/icon.svg` from the generated concept (a bold brush-stroke
  "M"), per the Scope §1 commitment — never shipped as raw raster. Old `__meta_TODO` placeholder
  comment removed (resolved, not a pending swap anymore).
- **Studio interior / Featured Work**: the 3 + 4 PNGs recompressed to JPEG (quality 85, via
  `System.Drawing` — no PNG/JPEG tool was otherwise available in this environment) and placed at
  `public/images/studio-{1,2,3}.jpg` / `public/images/featured-{1,2,3,4}.jpg`. Wired into
  `location/page.tsx` and `page.tsx` (Home) via `next/image` with `fill` + `sizes`. **Corrected in
  Round 2 cross-review (finding 1):** a first pass collapsed the explicit per-slot divs into a
  `.map()`, which reduced 7 grep-able markers to 2 generic ones — reverted back to explicit JSX per
  image (matching Item 5's original convention), one `__asset_TODO` comment per slot, each image
  also carrying distinct, descriptive alt text (finding 3) instead of one repeated generic string
  per collection.
- **Favicon and OG markers added (Round 2 cross-review, finding 1):** `app/icon.svg` now carries an
  `__asset_TODO` XML comment; `app/[locale]/layout.tsx`'s existing `metadataBase` comment (which
  mentions the OG image) now also carries one, replacing its stale "generated opengraph-image"
  wording (finding 6) with "static opengraph-image". Total: 9 `__asset_TODO` markers in `app/`
  (4 Home + 3 Location + 1 favicon + 1 OG), matching the count CO-1 claims —
  `grep -rn __asset_TODO app/ src/ public/` returns exactly these 9, nothing more.
- **`og:image:alt` restored (Round 2 cross-review, finding 2):** the deleted dynamic generator
  exported an `alt` string; Next's static-file OG convention reads it from an adjacent
  `app/[locale]/opengraph-image.alt.txt` sidecar instead — added, live-verified
  (`og:image:alt` renders correctly).
- **OG image**: resized/cropped to exactly 1200×630 and re-encoded as JPEG (quality 82, ~120 KB) via
  `System.Drawing`; replaces `app/[locale]/opengraph-image.tsx` (deleted) with a static
  `app/[locale]/opengraph-image.jpg`, following the same Next.js file convention already used for
  `app/icon.svg` (Item 12 precedent). `__meta_TODO` resolved the same way as the favicon.
- **Live-verified** (`pnpm build && pnpm start` + `curl`, not source inspection alone): `/icon.svg`
  → 200 `image/svg+xml`; `/en/opengraph-image.jpg` → 200 `image/jpeg`; `og:image` meta tags show
  `1200`×`630` (auto-detected by Next from the file); all 3 `studio-*.jpg` and 4 `featured-*.jpg`
  paths appear in the rendered `/en/location` and `/en` HTML and return 200.
- **Out-of-scope micro-fix, owner-requested in the same session**: `home.priceTeaserLink` word order
  corrected from "Full pricing & process →" to "Full process & pricing →" to match the destination
  page's actual title ("Process & Pricing") — a pre-existing approved-copy inconsistency the owner
  spotted, not part of Item 16's scope, fixed directly on explicit request rather than filed
  separately given its size (one string).
- **Seven new `en.json` alt-text keys** (`home.featuredWorkAlt1..4`, `location.studioPhotoAlt1..3`)
  added for accessibility, per-image and descriptive (Round 2 cross-review finding 3 — a shared
  generic string per collection was not an equivalent text alternative and one was factually wrong,
  describing illustrations as "tattoo artwork"). Write surface extended and owner-approved — see
  Execution above.
- **Write surface extended 2026-07-26, owner approved (Round 2 cross-review, finding 4):**
  `src/shared/i18n/messages/en.json` (the 7 new alt-text keys above, in addition to the already-
  approved `app.__meta_TODO` string), `app/[locale]/layout.tsx` (scoped to the one `metadataBase`
  comment line, to fix stale wording and add the OG `__asset_TODO` marker), and a new file
  `app/[locale]/opengraph-image.alt.txt` (the `og:image:alt` sidecar Next.js requires for static OG
  images — finding 2).
- **Flagged, not fixed (Round 2 cross-review, finding 6):** `STAGE_6_IMPLEMENTATION_PLAN.md`'s
  Item 16 row still describes the superseded "favicon drawn as SVG" plan and status `draft` — stale,
  but that file is STRAT-owned and outside this task's Allowed Write Surface (same treatment as
  `STAGE_6_STRAT_BRIEF.md` in prior tasks). Left for a future STRAT session to reconcile.
- **Filed, not decided**: whether desktop needs different/additional image treatment than the
  mobile-first placeholders shipped here is an open product question, out of this task's scope —
  see `PROJECT_BACKLOG.md`.
**Sequence:** after Items 6/5/17 (all done) — the OG image and metadata copy depend on the final
positioning text, and Featured Work slots are created by Item 5.

**Owner-run generation is a loop, not one shot (owner confirmation 2026-07-25):** every
placeholder asset — studio interiors, Featured Work, OG, **and, since the 2026-07-25 mid-round
pivot, the favicon too** — is generated by the **owner in ChatGPT** from prompts this IMPL writes.
The IMPL hands the owner a prompt set, the owner generates and drops the files in, and the IMPL
wires + marks them; expect **more than one round** (a prompt may need refining after the owner sees
a result). The favicon's original plan (Claude draws it in SVG, §1) no longer applies — see the
pivot.

## Execution

- Executor: `claude` — writes the prompt set for all four placeholder categories, including the
  favicon (2026-07-25 pivot: no longer Claude-drawn), and wires the owner-generated files in once
  they arrive. Owner runs the actual generation in ChatGPT for all four.
- Reviewer: `claude` + **mandatory independent Codex cross-review for any block that touches source
  code — no triviality exception** (AI_TASK_PROTOCOL.md — Independent Review Is Mandatory;
  CLAUDE.md). Corrected 2026-07-25, Review 3 finding 1: the earlier "only if non-trivial" wording was
  never a real exception (Round 1 ran the mandatory review regardless, per its own plan) and could
  have let a later round skip the gate by following this file. Applies to Round 1 (already run) and
  to every later wiring round that touches referencing components.
- Allowed Write Surface: `app/icon.svg`, `app/[locale]/opengraph-image.tsx`, `public/` (new
  placeholder images), the components that reference them, PROJECT_* reporting docs. **Extended
  2026-07-25 (Round 1, Review 2 finding 1) to `docs/files-structure.md`**, generated output of the
  mandatory `pnpm structure` (CLAUDE.md) that picked up the new review-thread file — same precedent
  as Items 5/15/17, owner asked and approved. **Extended again 2026-07-25 (Review 3 finding 3) to
  `src/shared/i18n/messages/en.json`, scoped to the `app.__meta_TODO` bookkeeping string only** — a
  later wiring round will need to drop "favicon"/"OG image" from that string once their replacements
  are wired and marked `__asset_TODO`, and the string would otherwise have no authorized path; owner
  asked directly, same precedent. **Extended again 2026-07-26 (Round 2, Review 1 finding 4), owner
  approved:** `src/shared/i18n/messages/en.json` further (7 alt-text keys:
  `home.featuredWorkAlt1..4`, `location.studioPhotoAlt1..3`), `app/[locale]/layout.tsx` (scoped to
  the one `metadataBase` comment line), and the new file `app/[locale]/opengraph-image.alt.txt`.
  **Extended again 2026-07-26 (Round 2, Review 2 finding 1), owner approved:**
  `app/[locale]/opengraph-image.jpg` explicitly — the static OG file itself is not literally covered
  by the `.tsx`-named entry above or by `public/` (it lives outside `public/`, colocated with
  `layout.tsx` per Next's OG file convention).
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

### 1. Favicon — originally drawn, now owner-generated (superseded 2026-07-25)

**Superseded by owner instruction, 2026-07-25 (Round 1, mid-session).** The original plan below
(Claude hand-draws 3 SVG options, owner picks) is replaced: the owner wants every image in this
task — favicon included — handed off as one uniform external-generation prompt (short description +
size/aspect ratio), generated in ChatGPT by the owner like the other three categories. Risk flagged
back to the owner and accepted: a generated raster mark carries real risk of not surviving downscale
to 16×16 (the exact reason the original plan avoided generation). **Regardless of what the owner
generates, the favicon still ships as `app/icon.svg`** — Claude vectorizes/recreates the generated
concept as a clean SVG mark before wiring it (never ships a raw raster PNG as the favicon), so the
existing Allowed Write Surface entry (`app/icon.svg`) stays sufficient; no raster icon path or write-
surface amendment is needed. The favicon prompt now lives in §2 below alongside the other three.
Original rationale kept for the record, not because it still governs:

~~Generative models fail at 16×16: the format needs one shape, readable in a single colour. Draw
`app/icon.svg` directly as a minimal vector mark in the artist's idiom (candidates: an `MK`
monogram; a single calligraphic brush stroke; a simple ink-mark motif). Produce 2–3 options, let the
owner pick. Must read at 16×16, work on light and dark tabs, and use no gradients or fine detail.~~

### 2. Generated placeholders (owner runs the generation)
Write the prompts + specs; the owner generates in ChatGPT and drops the files in. Per the 2026-07-25
pivot above, prompts are kept concise per owner instruction — one short paragraph per asset covering
subject/mood/palette together, plus orientation and size, rather than a longer structured multi-field
brief:
- **Favicon — 1** (added by the 2026-07-25 pivot). Square, self-contained mark.
- **Studio interior — 2–3 images** for the Location page (replacing the current placeholder squares).
  Calm, warm, minimal tattoo studio; consistent light and palette across the set.
- **Featured Work — 4 images** for Home (Item 5 creates the slots). Ink/brush/calligraphy-adjacent
  artwork in her stylistic family.
- **OG image — 1** (1200×630) replacing the text-only `opengraph-image.tsx` render, consistent with
  the final metadata copy from Item 6.

The actual prompt text handed to the owner lives in `## Prompt Set` below.

### 3. Marker + tracking (the safety net)
Every placeholder asset carries the grep-able **`__asset_TODO`** marker in the referencing code or an
adjacent comment, so `grep -rn __asset_TODO app/ src/ public/` lists every swap point. Record the list
in **`PROJECT_PRODUCTION_READINESS.md`** (durable pre-release doc; in this task's write surface as a
`PROJECT_*` reporting doc — Item 17 established this as the home for pre-deploy-swap tracking) and
make it a checked item of the Item 13 acceptance sweep. **Do NOT write it into
`STAGE_6_STRAT_BRIEF.md`** — the brief is STRAT-only and overwritten each STRAT session; it may carry
a one-line pointer to the READINESS doc, written by a STRAT session, not this task.

## Prompt Set (handed to the owner, 2026-07-25, Round 1)

Copy-paste into ChatGPT. Kept concise per owner instruction — one short paragraph per asset
(subject/mood/palette together) plus orientation and size, not a longer structured brief.

**1. Favicon (×1)**
> A minimal, single-shape ink/brush mark or monogram for a tattoo artist's website favicon. Bold,
> high-contrast, one color on a plain dark background chip — no gradients, no fine detail, nothing
> that disappears at very small size.
> Square, 512×512 (largest square your tool offers).

**2. Studio interior (×3)**
> A calm, warm, minimal tattoo studio interior. Consistent lighting and palette across all 3 —
> e.g. (1) a tattoo station/chair with equipment, (2) a consultation/design corner, (3) a detail or
> entrance shot. No people, no readable signage or text.
> Landscape, roughly 16:9.

**3. Featured Work (×4)**
> Ink/brush artwork pieces in a Japanese-painting-influenced, contemporary style — not photos of
> tattoos on skin, but standalone illustration/painting pieces (e.g. a botanical/floral brush piece,
> a wave/water motif, a small calligraphic symbol, a linework animal or figure). Consistent black-ink
> linework and palette across all 4. No text or signatures rendered in the image.
> Portrait, roughly 4:5.

**4. OG (share-card) image (×1)**
> One strong ink/art piece or a studio detail shot — moody, branded, generous negative space. No
> text or logos baked into the image (the title reads from separate page metadata).
> Landscape, roughly 1200×630 — generate the closest landscape preset your tool offers; exact pixel
> fit happens on our side.

Send the files back however's easiest; no naming/path convention needed from your side — wiring them
in is this task's next round.

## Out of Scope

- Real photography and the artist's real portfolio (owner, pre-deploy).
- Visual redesign of any page.
- Brand identity work beyond the favicon mark.

## Completion obligations

```text
- CO-1 — Every generated/placeholder asset carries `__asset_TODO` and is listed in
  `PROJECT_PRODUCTION_READINESS.md` (NOT the STRAT brief — see Scope §3). Disposition: DONE
  (Round 2, 2026-07-26). All 9 wired assets carry a discoverable `__asset_TODO` marker per the
  Round 1 rule (every Item 16 replacement, favicon and OG included, no exceptions): one comment per
  slot for 4 Home Featured Work + 3 Location studio interior (explicit per-image JSX, not a `.map()`
  — Round 2 cross-review finding 1 caught a first pass that collapsed these into 2 generic
  comments), one XML comment in `app/icon.svg` for the favicon, and one comment in
  `app/[locale]/layout.tsx` for the OG image (the marker can't live inside the binary
  `opengraph-image.jpg` itself). `grep -rn __asset_TODO app/ src/ public/` returns exactly these 9.
  `PROJECT_PRODUCTION_READINESS.md` updated to reflect all nine as wired, generated placeholders.
- CO-2 — Favicon renders correctly at 16×16 in a real browser tab, light and dark. Disposition:
  PARTIALLY DONE (Round 2). `app/icon.svg` now holds the hand-vectorized mark and was live-verified
  to serve as `image/svg+xml` at `/icon.svg`. The **real-browser-tab** check (light and dark tab
  chrome specifically) is still not done — no headless-browser tool exists in this environment (same
  gap recorded for Items 5/6's mobile read-through); the closest available check was the same
  actual-pixel-size Artifact preview technique used for the drawn-option comparison in Round 1,
  applied to the final vectorized mark, plus the owner's own visual sign-off on the vector draft
  before it was applied. A real physical/browser check before public launch remains a manual gap —
  tracked in `PROJECT_PRODUCTION_READINESS.md` alongside the existing Item 4B mobile-device gap.
- CO-3 — RISK, owner-accepted: generated "tattoo-like" artwork must not survive to public launch —
  it would present non-existent work as the artist's. Item 13's sweep must fail if any
  `__asset_TODO` remains at launch. Disposition: OPEN BY DESIGN — carried into Item 13 regardless of
  this task's completion; this is the permanent mitigation, not a to-do this task resolves.
```

## Review Granularity

`single`.

## Workflow (enforced)

Per CLAUDE.md: `pnpm qg` before results; commit only on explicit owner approval.
