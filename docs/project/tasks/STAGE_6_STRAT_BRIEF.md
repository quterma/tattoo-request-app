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

**All 17 originally-planned Stage 6 items are done.** Item 16 shipped (`fad01c7`), which emptied the
queue entirely. This session did four things: **created Stage 7** and moved visual design out of
Stage 6, **cut Item 18** (visual consistency) and **`TOOLING_TASK_02`** (the browser capability
three prior tasks lacked), and **re-routed seven completion obligations** so `pnpm project:status`
reports **0 errors** instead of 10.

Remaining: `TOOLING_TASK_02` → **Item 18** → **Item 13** (cut it last; it closes the stage).

**Progress since (2026-07-26, same session coordinating):**

- `TOOLING_TASK_02` **done** (`599069f`) — `pnpm shot` proven on 24 real captures, `pnpm qg`
  unchanged, cross-review consensus in 2 rounds. Three pre-approval corrections mattered: a fresh
  browser context per width (a resized page keeps the `next/image` source chosen for the first
  width, so the capture would have lied), a scroll pass before `fullPage` (lazy images and the map
  iframe would have photographed blank), and a production server with `waitUntil: "load"` instead
  of `networkidle` against `pnpm dev`. It also logs `scrollWidth` vs viewport per capture — an
  owner-approved deviation that makes Item 18's overflow criterion objective.
- **Item 18 Block A done** (`43aa0da`, thread closed `e4f867f`) — consensus at round 1. One token
  system (oklch survives; `tokens.css` keeps only non-colour primitives), density variants on
  `Section`/`Page`, typed `Stack` gaps, dead tokens gone. **Block B is open.**
- Two things worth carrying forward from Block A's review, because both corrected a claim that
  looked settled: the `--color-border` deletion was safe for the **opposite** reason the plan gave
  (the hex won the cascade; nothing reads `var(--color-border)` — Tailwind reads `--border`
  directly), and `clamp()` for text size **suppresses 200% zoom** (WCAG SC 1.4.4), so the heading
  scale ships as a rem-breakpoint step instead. Both were caught only by checking the compiled
  bundle rather than reasoning about source order.
- **Home hero wired** (`5a406bd`) — out of Block B's normal order, on the owner's call. The prompt
  that Block A skipped was written, persisted to the task file's `## Prompt Set`, the owner
  generated the image, and it landed at `public/images/hero.jpg` as the **tenth** `__asset_TODO`
  (verified: `grep -rn __asset_TODO app/ src/ public/` → 10).
- **A production deploy failure was found and fixed mid-session** (`ba448a1`, `a6f50cb`, thread
  closed `8efe780`, research closed `bcad384`) — **not Item 18 work**, tracked separately. See below;
  it changes what a green `pnpm qg` means.

## `pnpm qg` is now six steps, and this is why it matters

`app/[locale]/opengraph-image.jpg` — a **static** metadata asset — sat inside the **dynamic
`[locale]` segment**. Next could not resolve the segment for a build-time prerender and omitted the
route from the manifest; Vercel's build adapter then failed (`E777`). **`pnpm build` exited 0
locally**: the failing code lives in the adapter Vercel runs *after* `next build`, which a local
build never invokes. So the gates were green on a tree that could not deploy.

Fix: the JPEG moved to `app/opengraph-image.jpg` and `openGraph.images` is now declared explicitly
in `app/[locale]/layout.tsx` — moving the file alone fixes the build but **emits no `og:image` at
all**, because the `[locale]` layout's `openGraph` object replaces the root's rather than merging.
The explicit descriptor also gained `og:image:height` and `og:image:alt`, which the file convention
never emitted. New gate `pnpm check:metadata` reads build output only (no server, no browser, so the
headless-free rule holds) and was **verified by reintroducing the bug**. Decision:
PROJECT_DECISIONS.md — "OG image lives at the app root with an explicit descriptor".

**Carry this forward:** a green `pnpm qg` is closer to "deployable" than it was, but still is not
it — Vercel's adapter cannot run here. Item 13 should not treat gate-green as deploy-proof.

## The one thing to know before planning anything here

**Stage 6 no longer owns visual design.** The owner challenged the premise of a "visual pass" in
Stage 6; verification found no Stage 7 existed and that Stage 6's scope line had absorbed both
consistency work and visual design. Stage 6 now keeps **consistency only** — one token system, one
rhythm, no dead CSS, no clipping viewport. Palette, fonts, layout language, art direction and admin
polish are **Stage 7**, which runs before launch and after real photography exists.

→ PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design (2026-07-26)"
→ PROJECT_IMPLEMENTATION_PLAN.md — Stage 6 (narrowed), Stage 7 (new)

If a proposed change reads to an observer as "design", it is Stage 7. File it, don't implement it.

## State of the board — verify before trusting this

Do not read item rows from here. **`STAGE_6_IMPLEMENTATION_PLAN.md` is the durable board** and was
reconciled against git this session (Items 14/16/17 were stale there — `task ready`/`draft` for work
that had shipped). Run `pnpm project:status` for live task state.

- **Done:** Items 1–12, 14, 15, 16, 17 — every task file in `tasks/done/`. Plus
  `TOOLING_TASK_02` (`599069f`).
- **Open:** `tasks/STAGE_6_TASK_18_visual_consistency.md` — `in progress`. Block A committed; the
  hero (scope item 9) shipped out of order. **Block B's remainder is the next executable work:**
  scope item **5** (flow-margin removal + the 41 `mb-*` counters — **must be step 1**, and the
  reason the task cannot close), **7** (call-site migration to the density variants), **8**
  (request-form UI), **10** (the CO-1 sweep at four widths), **11** (oversized-file copy).
  Do not re-plan Block A or the hero.
- **Not cut yet:** Item 13 — deliberately last, see below.

## Decided (2026-07-26 — this session)

Both recorded in PROJECT_DECISIONS.md; not restated here.

- **"Stage 6 / Stage 7 boundary — consistency vs visual design"** — the scope split above, plus the
  two Stage 6 exit criteria that moved to Stage 7 because they were un-closeable as written.
- **"Named browser capability for visual verification"** — `playwright` + `pnpm shot` at
  320/375/768/1280. `pnpm qg` does not change; this is not automated e2e; it is not a physical
  device.

## Open

- **Nothing is blocked.** Both open tasks are `ready` and executable now.
- Owner pre-release debts are **not** listed here any more — they live in
  **PROJECT_PRODUCTION_READINESS.md → "Owner Pre-Release Actions"**, which is their canonical home
  as of this session. A brief is overwritten every session and the protocol rejects it as a work
  item; two obligations (Items 7 and 10) had been parked here anyway, including the pointer for the
  still-open launch blocker.

## Task files

- Open: `STAGE_6_TASK_18_visual_consistency.md` (`in progress` — Block B remains).
  `TOOLING_TASK_02_playwright_screenshots.md` is `done`, in `tasks/done/`.
- Item 13 has no task file — **cut it after Item 18 lands, not before.** Its sweep must fail while
  any `__asset_TODO` remains, and Item 18 deliberately adds a tenth (the Home hero), so a file cut
  now would encode a marker count that is already wrong.
- Non-Stage-6: `META_TASK_01_framework_consolidation.md` (`draft`, framework dedup).

## Open research threads (report these — anti-rot duty, AI_CROSS_REVIEW.md)

**None open.** `pnpm project:status` reports 0 research and 0 review threads.

## Next topic

**Coordinate the remaining three, one at a time.** Never two sessions on the same files — Item 18's
two blocks overlap each other and Item 13 reads the whole public surface (standing hazard: `df70cae`,
and Item 8's `en.json` swept into `94ef19b`).

1. ~~`TOOLING_TASK_02`~~ — **done** (`599069f`).
2. ~~Item 18, Block A~~ — **done** (`43aa0da`). ~~Hero~~ — **done** (`5a406bd`). **Block B's
   remainder** is next: scope items 5, 7, 8, 10, 11 (list above). Step 1 is the flow-margin removal
   Block A deliberately deferred — it must be atomic with the 41 `mb-*` counters, because removing
   the base rules alone collapses spacing on 5 of 6 public routes ("broken", not "transitional").
   One owner approval, one cross-review thread, **3-round cap**. No owner asset action pending.
3. **Item 13** — cut the task file, then run it. When cutting, fold in the two things already filed
   as natural companions: the **Item 17 pre-release re-review** (its cross-review exited at 9 rounds
   by owner decision, not on a clean round — PROJECT_BACKLOG.md) and confirmation that the
   `__asset_TODO` sweep fails as designed while the ten placeholders remain.

### Pre-deploy swaps to track

**Moved out of this brief 2026-07-26.** The canonical list, the combined marker grep, and the owner
checklist all live in **PROJECT_PRODUCTION_READINESS.md** ("Pre-Deploy Content Swaps" and "Owner
Pre-Release Actions"). This section previously duplicated them and had gone stale — it still taught
a superseded grep and referenced `INSTAGRAM_HANDLE`, a constant Item 17 deleted (PROJECT_BACKLOG.md
recorded this as a live defect). It is now a pointer, per the brief-vs-durable-doc preference
recorded in AI_FRAMEWORK_IDEAS.md (2026-07-24).

## Standing hazard (recurring — worth watching)

The shared git index and shared PROJECT_* docs have caused commit misattributions this stage
(`da6861f`; Item 8's `en.json` into `94ef19b`). It recurs whenever two sessions are live on
overlapping files. **Do not run two sessions writing the same file at once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
