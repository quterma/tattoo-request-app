# Task: Stage 6 — Location: real map embed (Item 7)

## Status

`done` · created 2026-07-19 · done: 2026-07-19 · PROJECT_STAGE_LOG.md — "Stage 6 Item 7 (map half)
— done, 2026-07-19" entry

## Execution

- Executor: `claude` or `codex` — this is small, local, and decision-free now that the owner has
  fixed the provider (Google Maps iframe) and confirmed the address is real. Delegable per
  AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex (deterministic, small named surface, no
  product decision left). If delegated: `Executor: codex`, `Reviewer: claude`.
- Baseline: **the commit that introduced this task file** — no hash here; the executor derives it
  (`git log -1 --format=%H -- <this file>`) and stops only if its Allowed Write Surface moved/dirtied.
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus (AI_CROSS_REVIEW.md) —
  it touches source (a public page), so the review gate applies even though the change is small.
- Allowed Write Surface: `app/[locale]/(public)/location/page.tsx`, `src/shared/i18n/messages/en.json`
  (only if a new key is needed, e.g. an iframe `title`), the tests for the above, and the PROJECT_*
  reporting docs. Nothing else.
- May touch dependencies / migrations / generated files / shared docs: **no**.

## How to run (session settings)

- Model: Sonnet (small, fully specified) — or delegate to Codex.
- Start mode: Plan mode (present the plan, incl. the "Deviations from the task file" section).
- Switch to edit/acceptEdits only after the plan is approved.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. Stage 6 Source of Truth: **FS §3.5** (Location: address, map, studio photos, transport/parking,
   entrance instructions if non-obvious; no marketing content) and PROJECT_DECISIONS.md —
   **"Location page (FS §3.5) — decided 2026-07-13, batch 2"** (block order kept as shipped; the map
   and the studio photos were the two placeholder gaps; transport/parking already satisfied in "How
   to find us").
3. **Shipped code — read it, most of the page already exists:**
   `app/[locale]/(public)/location/page.tsx`. It ALREADY has: the title, the address, the three
   map-provider links (Google/Apple/Waze), a **map placeholder** (`<div class="aspect-video ...
   bg-muted" />`, ~line 41), the "How to find us" block with the transport/parking sentence, **four
   studio-photo placeholders** (~lines 53–57), and the CTA. **The only gap this task closes is the
   map placeholder → a real embed.**

## The state of Item 7 (read — it is much smaller than the plan row suggests)

Item 7 as originally scoped was "real map embed + real studio photos". Two owner decisions
(2026-07-18/19) shrink it to just the map:

- **Studio photos stay as placeholder squares** for now (owner decision) — real photos are a
  pre-deploy swap, a few days out. The four `bg-muted` placeholders already shipped are the desired
  interim state; **do not touch them** and do not treat missing photos as a blocker.
- **The address is real** (Herzl 100, Tel Aviv — owner-confirmed), so the map can be built against
  it now, no swap needed.
- **Provider is fixed: Google Maps iframe embed** (owner decision) — a keyless `https://maps.google.com/maps?q=<address>&output=embed` iframe, no API key, no new dependency.

So this task = **replace the one map placeholder div with a real Google Maps iframe**, nothing else.

## Goal

Replace the Location page's empty map placeholder with a real, embedded Google Maps view of the
studio address, satisfying FS §3.5's "map" must-contain item — leaving the rest of the page
(address, provider links, how-to-find-us, photo placeholders, CTA) exactly as shipped.

## Scope

1. **Map embed** in `location/page.tsx`: replace the `aspect-video ... bg-muted` map placeholder
   (~line 41) with a Google Maps iframe pointing at the studio address
   (`https://maps.google.com/maps?q=Herzl%20100,%20Tel%20Aviv,%20Israel&output=embed`). Keep the
   same `aspect-video w-full rounded-md` framing so layout/spacing is unchanged. The iframe needs a
   `title` (accessibility — a named frame), `loading="lazy"`, and no marketing chrome. Reuse the
   address constant already at the top of the file rather than hard-coding a second copy.
2. **i18n** only if the iframe `title` should be localized (it should — add one `location.mapTitle`
   key, e.g. "Map to the studio"). No other copy changes.

## Out of Scope

- **Studio photos** — the four placeholders stay; real photos are a separate pre-deploy swap, not
  this task. Do not add image files or change the photo grid.
- **Address / provider links / how-to-find-us / CTA** — all already correct; do not touch.
- **Reordering blocks** — the order is the blueprint-decided one; keep it.
- **Any visual redesign, map styling beyond the existing framing, or a paid Maps API / key.**
- **A Content-Security-Policy change** — if the app has a CSP that would block the Google Maps
  iframe (`frame-src`), that is a real consideration: check whether one exists, and if a `frame-src`
  entry is needed, STOP and flag it (it is a security-config change, not a page tweak) rather than
  silently widening CSP. If no CSP constrains frames, proceed.

## Completion obligations

```text
- CO-1 — The embedded map renders the correct location in a real browser (not just "the iframe tag
  is present"): load /location, confirm the map shows Herzl 100, Tel Aviv, and the page layout is
  unchanged (photos still placeholders, spacing intact).
  - Required by: FS §3.5 "map" must-contain + §6. Disposition: DONE — owner verified live at
    /en/location on 2026-07-19: map renders, shows Herzl 100, Tel Aviv; rest of page unchanged.
- CO-2 — No CSP/frame-src regression: if the app sets a CSP, confirm the iframe is allowed (or flag
  the needed frame-src as a separate security-config decision, per Out of Scope).
  - Disposition: DONE — no CSP exists anywhere in the app (no `headers()` in next.config.ts, no
    `Content-Security-Policy` string in the repo); nothing to widen, no regression possible.
- CO-3 — Studio-photo placeholders are a known pre-deploy swap, not part of this task.
  - Disposition: tracked — real studio photos remain an owner asset item. This task does not close
    the photo half; it closes the map half.
  - **Re-routed 2026-07-26 by STRAT.** The original disposition pointed at this stage's
    next-session handoff document, which AI_TASK_PROTOCOL.md — Completion Obligations explicitly
    rejects as a work item: that file is overwritten by every strategic session, so an obligation
    parked there survives only until the next one. The canonical home for a pre-deploy asset swap
    is the readiness document, whose "Pre-Deploy Content Swaps" section now also carries the three
    Location studio-interior placeholders Item 16 wired into this page (each marked
    `__asset_TODO`), which are the direct successors of the bare placeholder squares this task left
    behind. Item 13's sweep fails while any of them remain.
  - tracked in: docs/project/PROJECT_PRODUCTION_READINESS.md
- CO-4 — Codex cross-review flagged the keyless embed URL
  (`maps.google.com/maps?q=...&output=embed`) as undocumented by Google (only the paid, API-keyed
  Embed API is officially documented). Owner decision 2026-07-19: **accept the risk as-is**; the
  three provider links (Google/Apple/Waze) remain a working fallback if the endpoint ever breaks.
  No follow-up task filed. See `docs/project/reviews/done/REVIEW_2026-07-19_location-map-embed.md`.
```

## Review Granularity

`single` — one block, one review. The surface is one file (a div → iframe) plus maybe one i18n key;
far under the size trigger. Record the actual measured surface before the review if you like, but no
split is expected.

## Workflow (enforced)

1. Read Context + the shipped page; confirm understanding in 3–5 lines.
2. Present the plan (with "Deviations from the task file"); wait for approval.
3. Implement within Scope; `pnpm qg` green.
4. Tests: a static presentational page — per PROJECT_TESTING_STRATEGY.md this needs little/no unit
   test (mirror how the shipped Location/other content pages are tested — likely none). If the
   existing page has a test, keep it green. The real proof is CO-1 (live render).
5. Independent Codex cross-review to consensus (AI_CROSS_REVIEW.md); the session owns the fix loop
   through consensus and commit.
6. If the CSP question (Out of Scope) turns into a needed security-config change, STOP and escalate
   — do not widen CSP silently.

## Acceptance Criteria

- The Location page shows a real embedded map of the studio address; FS §3.5's "map" item is
  satisfied (FS §6, the Location acceptance).
- The address, provider links, how-to-find-us (with transport/parking), photo placeholders, and the
  single "Start Your Request" CTA are all unchanged.
- `pnpm qg` green; CO-1 verified live; no silent CSP widening.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress). PROJECT_DECISIONS.md only if a decision is refined (not
  expected).
- Reconcile `## Completion obligations`; note that the studio-photo swap remains open (Item 7 is
  "map done; photos pending pre-deploy").
- Update `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` Item 7 row; set Status `done` for the map
  half (or keep Item 7 open with the photo swap flagged — the plan row should make the split
  explicit). Move this file to `tasks/done/` when the map work is complete and reviewed. Propose the
  commit for owner approval after consensus.
