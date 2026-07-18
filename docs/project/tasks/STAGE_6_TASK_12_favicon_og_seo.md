# Task: Stage 6 — Favicon / OG / basic SEO metadata (Item 12)

## Status

`ready` · created 2026-07-19 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Execution

- Executor: `claude` or `codex` — small, local, technically decision-free. **Note the content
  dependency below:** the *mechanism* (metadata API, icon files, OG tags) is buildable now with
  interim copy; the *final* title/description/OG text + a real favicon are owner-supplied. The task
  can ship the mechanism with clearly-flagged interim copy and leave the real strings as a pre-deploy
  swap — OR wait for owner copy. State which in the plan. Delegable per AI_TASK_PROTOCOL.md.
- Baseline: **the commit that introduced this task file** — executor derives it.
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus (touches source).
- Allowed Write Surface: `app/[locale]/layout.tsx` (metadata), `app/layout.tsx` (only if root
  metadata is needed), icon/OG asset files under `app/` (`app/icon.*`, `app/apple-icon.*`,
  `app/opengraph-image.*` per Next's file conventions) or `public/`, `src/shared/i18n/messages/en.json`
  (only if any metadata string is localized), the tests for the above, PROJECT_* reporting docs.
- May touch dependencies / migrations / generated files / shared docs: **no** (no dependency — Next's
  built-in Metadata API + file-based icons; no `next-seo` or similar).

## How to run (session settings)

- Model: Sonnet — or delegate to Codex.
- Start mode: Plan mode (present the plan incl. the interim-vs-wait content call).

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **Outside the FS's public-website scope** — tracked in PROJECT_IMPLEMENTATION_PLAN.md (Stage 6).
   No FS §-level spec; the bar is: a real favicon, a correct page title/description, and Open Graph
   tags so a shared link looks right. English only (PRD D10). No analytics (PRD §4 Non-Goal) — this
   is metadata, not tracking.
3. **Shipped code — read it:**
   - `app/[locale]/layout.tsx` — `export const metadata` currently holds placeholder copy
     ("Tattoo Request App" / "MVP scaffold for tattoo request management"). This is what real
     visitors' tabs and shared links show today — it must become real.
   - `app/layout.tsx` — the root layout (`return children` — minimal).
   - `app/favicon.ico` — the default Next favicon, to be replaced.
   - `src/shared/i18n/messages/en.json` — the `app.title`/`app.description` keys (if metadata should
     read from i18n rather than be hard-coded; Stage 6 is English-only so either is acceptable —
     decide in-plan).

## Content dependency (flag clearly — do not invent final copy silently)

The **real** strings are owner-authored (they are the studio's public identity):

- **Site title / tab title** — e.g. the artist/studio name + a short descriptor. Owner-supplied
  (part of the same content brief that feeds Items 5/6). Interim: a clearly-flagged placeholder.
- **Meta description** — one sentence for search results. Owner-supplied or drafted-then-approved.
- **OG title / description / image** — what a shared link shows on social. The OG **image** is an
  asset (could reuse a studio/featured image once available — ties to the Item 7 photo swap / Home
  Featured Work). Interim: a simple branded placeholder or text-only OG.
- **Favicon** — a real icon (the studio's mark). Owner-supplied asset. Interim: a simple placeholder
  is acceptable pre-deploy but the real one is a pre-deploy swap.

**So Item 12 splits like Item 7:** the *mechanism* (metadata API wiring, icon file conventions, OG
tags) is code and buildable now; the *final copy + real favicon/OG image* are owner assets swapped
before deploy. The plan states which parts ship now vs. which are flagged pre-deploy swaps.

## Goal

Give the site correct, real metadata: a proper page title and description, Open Graph tags for
shareable links, and a real favicon — replacing the "MVP scaffold" placeholders and the default Next
favicon, using Next's built-in Metadata API and file-based icon conventions (no new dependency).

## Scope

1. **Metadata** in `app/[locale]/layout.tsx` (and root if needed): real `title` (consider a
   `title.template` so pages read "<Page> · <Studio>"), `description`, and an `openGraph` block
   (title, description, type, locale, and an image once available). Interim copy is clearly flagged
   with a marker (like the existing `__intro_TODO` convention) so it can't ship to production
   unnoticed.
2. **Favicon / icons** via Next's file conventions (`app/icon.png`/`app/apple-icon.png` or a real
   `favicon.ico`) — replace the default. If only a placeholder icon is available now, use it and flag
   the real-icon swap.
3. **OG image** — wire `opengraph-image` (a static asset or a generated one) with interim content,
   flagged for the real-image swap (may reuse a Featured Work / studio image when those land).
4. Basic SEO hygiene: correct `lang`, a sensible `metadataBase`, no `noindex` left on by accident
   (confirm the site is indexable when it should be — but note it is not launched yet, so an interim
   `noindex` until launch may even be desirable — raise it in the plan).

## Out of Scope

- Analytics, tag managers, structured data beyond basic OG (PRD §4 Non-Goal / not needed for MVP).
- A `next-seo`-style dependency — use Next's built-in Metadata API only.
- Localized metadata beyond English (PRD D10 — English only in Stage 6).
- The request flow / any FS-defined page content.

## Completion obligations

```text
- CO-1 — Live: the browser tab shows the real (or clearly-interim-flagged) title + a real favicon;
  a shared-link preview (or the rendered <head>) shows correct OG tags. Disposition: executor fills.
- CO-2 — Any interim copy / placeholder favicon / placeholder OG image is flagged (a grep-able
  marker) so it is caught before deploy, and the pre-deploy swaps are recorded as owner asset items
  in the plan/brief. Disposition: executor lists what is interim vs final.
- CO-3 — No new dependency, env var, or migration. Disposition: expected None; confirm.
- CO-4 — Indexability decision recorded (index now vs noindex-until-launch). Disposition: state the call.
```

## Review Granularity

`single` — layout metadata + a couple of asset files + maybe one i18n key. Under the size trigger.

## Workflow (enforced)

1. Read Context + shipped metadata; confirm understanding in 3–5 lines; state the interim-vs-wait
   content call and the indexability call.
2. Present the plan (with "Deviations from the task file"); wait for approval.
3. Implement within Scope; `pnpm qg` green.
4. Tests: metadata is largely declarative — a small assertion that the metadata object has the
   expected shape is enough if the repo tests such things; otherwise CO-1 (live head/preview) is the
   proof. Follow PROJECT_TESTING_STRATEGY.md.
5. Independent Codex cross-review to consensus; own the fix loop through consensus and commit.

## Acceptance Criteria

- The page title/description are real (or clearly-flagged interim), not "MVP scaffold".
- A real (or flagged-interim) favicon replaces the default; OG tags render for shared links.
- No new dependency; English-only; indexability decision recorded.
- `pnpm qg` green; CO-1 verified live; interim items flagged and recorded as pre-deploy swaps.

## Reporting

- Update PROJECT_STAGE_LOG.md; STAGE_6_IMPLEMENTATION_PLAN.md Item 12 row; record any pre-deploy
  swaps (final copy, real favicon, real OG image) in the STRAT brief so they aren't lost. Reconcile
  CO. Set `done` (for the mechanism), move to `tasks/done/`, propose the commit after consensus.
