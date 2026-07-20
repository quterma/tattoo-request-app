# Task: Stage 6 — Favicon / OG / basic SEO metadata (Item 12)

## Status

`in progress` · created 2026-07-19 · implemented 2026-07-20, `pnpm qg` green, CO-1..CO-4 verified ·
awaiting independent Codex cross-review to consensus and owner commit approval ·
done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Deviations from the task file (2026-07-20)

The task's Scope listed a couple of "OR" choices left to implementation; the calls made:

1. **OG image → dynamic `app/[locale]/opengraph-image.tsx` via `next/og` `ImageResponse`**, not a
   static `app/opengraph-image.png`. `next/og` is built into Next (no new dependency — CO-3 holds),
   and a code-generated placeholder is grep-flaggable (`__meta_TODO`) and needs no binary asset. The
   real image (a studio/featured photo) remains the pre-deploy swap — either replace this file with a
   static PNG or edit the generator. **Placed under `[locale]/`, not `app/` root**, because the
   `openGraph` block lives in `[locale]/layout.tsx`'s `generateMetadata`; a root-level
   `opengraph-image` did NOT merge into that block (verified live — `og:image` was absent until the
   file was colocated under `[locale]`, after which the full `og:image` + dimensions + `twitter:image`
   render and `metadataBase` resolves it to an absolute URL, clearing Next's build-time
   `metadataBase` warning).
2. **Favicon → `app/icon.svg`** (Next file convention, takes precedence, simplest interim placeholder
   — a studio-initial mark). The stock `app/favicon.ico` was removed so the placeholder is
   authoritative. Real studio mark is the pre-deploy swap.
3. **No metadata unit test.** `generateMetadata` needs the next-intl request context; mocking it is
   heavier than the value, and CO-1 (live `<head>` inspection) already proves the shape. Consistent
   with how Items 7/11 were verified. Per PROJECT_TESTING_STRATEGY.md (metadata is declarative /
   framework behavior — "verify manually").
4. **`metadataBase` → `VERCEL_PROJECT_PRODUCTION_URL` (revised in Codex cross-review, Review 1
   Finding 1).** The first draft hardcoded `https://example.com`, which is syntactically absolute
   but serves no image — a social crawler following the `og:image` gets nothing, and the app IS in
   fact deployed for controlled verification (PROJECT_DECISIONS.md §C), making the original "site not
   deployed" rationale stale. Fixed to read Vercel's injected `VERCEL_PROJECT_PRODUCTION_URL` system
   variable (stable production domain, documented by Vercel for OG-image URLs; Vercel-provided, not a
   user-declared env var, so CO-3 still holds) with a `http://localhost:3000` fallback for local dev.
   The `__meta_TODO` now flags the real *branded custom domain* swap; the noindex comment's framing
   corrected to "deployed for controlled verification, not publicly launched".
   **Caveat (Review 2 → 3 Finding 1):** `VERCEL_PROJECT_PRODUCTION_URL` is only populated at runtime
   if the Vercel project's **"Enable access to System Environment Variables"** checkbox is ON — a
   dashboard setting that cannot be verified from the repo. If it is OFF, a deployed page would
   silently advertise the `http://localhost:3000` fallback origin and the OG image would be
   unreachable. This is therefore NOT claimed as working on the verification deployment; it is
   tracked as **CO-5** (a checkable pre-deploy obligation) and the task does not go `done` until
   CO-5 is verified live. **No in-code guard** is added: a first attempt warned on
   `process.env.VERCEL && !VERCEL_PROJECT_PRODUCTION_URL`, but Review 3 correctly showed that is
   ineffective — `VERCEL` sits behind the *same* system-variable toggle, so with the checkbox OFF
   both vars are absent together and the target failure takes the no-warning fallback branch. A
   `NODE_ENV`-based signal would work but warn on every local prod build too; owner decision
   2026-07-20: **remove the guard, rely on CO-5** (out-of-band pre-deploy verification).

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
  a shared-link preview (or the rendered <head>) shows correct OG tags. Disposition: VERIFIED (dev
  server, `/en`). Rendered <head> shows `<title>Studio Name</title>`, `<meta name="description">`,
  `<meta name="robots" content="noindex, nofollow">`, `<link rel="icon" ... type="image/svg+xml">`,
  and the full OG set — `og:title`, `og:description`, `og:site_name`, `og:type=website`,
  `og:locale=en_US`, `og:image` (+ `:type`/`:width=1200`/`:height=630`/`:alt`) and `twitter:card`/
  `:title`/`:description`/`:image`. `/en/opengraph-image` returns 200 image/png; `/icon.svg` returns
  200 image/svg+xml. Production build emits no `metadataBase` warning (OG URL absolute).
- CO-2 — Any interim copy / placeholder favicon / placeholder OG image is flagged (a grep-able
  marker) so it is caught before deploy, and the pre-deploy swaps are recorded as owner asset items
  in the plan/brief. Disposition: DONE. Marker `__meta_TODO` present at all six interim points —
  `grep -rn __meta_TODO app/ src/` lists them (en.json `app.__meta_TODO`; `[locale]/layout.tsx`
  domain + noindex; `[locale]/opengraph-image.tsx`; `app/icon.svg`). Interim: studio name in
  title/OG (still the `"Studio Name"` placeholder), description, OG image, favicon, the real branded
  custom domain for `metadataBase` (current origin comes from `VERCEL_PROJECT_PRODUCTION_URL` when
  Vercel's system-var access is enabled — see CO-5), and the `robots` noindex→index flip at launch.
  Final = owner assets/copy + real custom domain + index-on. Recorded in
  STAGE_6_STRAT_BRIEF.md — "Pre-deploy swaps to track".
- CO-3 — No new dependency, env var, or migration. Disposition: CONFIRMED — `next/og` is built into
  Next (no `package.json`/lockfile change); no migration. `metadataBase` reads Vercel's injected
  `VERCEL_PROJECT_PRODUCTION_URL` system variable (Vercel-provided, not a user-declared env var; no
  `.env.example`/config entry added), with a localhost fallback for local dev.
- CO-4 — Indexability decision recorded (index now vs noindex-until-launch). Disposition:
  **noindex-until-public-launch** — `robots: { index: false, follow: false }` in `generateMetadata`,
  flagged `__meta_TODO` for the launch flip. The app IS deployed for controlled verification
  (PROJECT_DECISIONS.md §C — deployed, not publicly launched), but Home/Process (Items 5/6) content
  is placeholder, so it must not be indexed yet. Owner-confirmed via AskUserQuestion.
- CO-5 (added Review 2 Finding 1) — **`metadataBase` origin on the real deployment.** The
  `VERCEL_PROJECT_PRODUCTION_URL` mechanism only yields a public HTTPS OG origin if the Vercel
  project's **"Enable access to System Environment Variables"** checkbox is ON; otherwise a deployed
  page falls back to `http://localhost:3000` and the OG image is unreachable. This is a Vercel
  dashboard setting, not verifiable from the repo. Disposition: **OPEN pre-deploy obligation** —
  before public launch (and ideally at the next verification deploy of this tree), confirm the
  checkbox is enabled AND that the deployed `/en` renders an `og:image` on a public `https://`
  origin whose image route returns 200. Until then the task ships the code but this boundary is NOT
  claimed as verified. Owner action item; recorded here + in STAGE_6_STRAT_BRIEF.md pre-deploy swaps.
  **No in-code guard** — a runtime signal cannot reliably distinguish the disabled-checkbox state
  (`VERCEL` and `VERCEL_PROJECT_PRODUCTION_URL` share the same toggle; Review 3), so this is an
  out-of-band pre-deploy check only (owner decision 2026-07-20: remove the guard, rely on CO-5).
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
  CO. Propose the commit after consensus.
- **Lifecycle correction (Review 4 Finding 1):** the original instruction here — "set `done` for the
  mechanism, move to `tasks/done/` after consensus" — contradicts CO-5 and is superseded. After
  review consensus the mechanism may be **committed**, but the task **stays `in progress` at its
  current path** (not `tasks/done/`) because CO-5 (the Vercel system-var checkbox + live public
  OG-origin check) is an open completion obligation. Only verified CO-5 evidence permits the `done`
  transition and the move to `tasks/done/`. A green `pnpm qg` certifies the tree, not the deployed
  system (AI_TASK_PROTOCOL.md — Completion Obligations).
