# Task: Stage 6 — Site-wide shell (navigation, footer, CTA pattern, `policies` → `process` route)

## Status

`done` · created 2026-07-13 · done: 2026-07-13 · see PROJECT_STAGE_LOG.md entry "Stage 6 Item 2 — site-wide shell — completed 2026-07-13"

## Execution

- Executor: `claude` (owner may re-assign to `codex` if the task is judged to meet the
  delegation eligibility bar — it would then also need an explicit Allowed Write Surface and a
  baseline commit recorded here, per AI_TASK_PROTOCOL.md)
- Reviewer: `claude`

## How to run (session settings)

- Model: Sonnet (well-scoped, no architecture fork — the design decisions are already made in the
  blueprint; this task executes them)
- Start mode: Plan mode (mandatory — the route rename touches several files and one product-level
  boundary call was made in the STRAT session; the plan must show it was understood, not
  re-litigated)
- Switch to edit/acceptEdits: only after the plan is explicitly approved
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md.
2. Stage 6 Source of Truth: `STAGE_6_PRODUCT_DEFINITION.md` (PRD) — D9 (navigation is exactly
   Home / Process / Request / Location), D1 (Instagram is the primary acquisition channel), §2
   (product thesis: replace unstructured contact with a structured request);
   `STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS) — §2 (navigation + the per-page primary-CTA table +
   the secondary-link rule), §5 (canonical ownership: Pricing / Good Fit / Booking / FAQ /
   Process explanation are canonical on **Process**), §6 acceptance criteria 9, 10, 11.
3. PROJECT_DECISIONS.md — "Stage 6 UX Blueprint Decisions" → **"Navigation and CTA placement
   (site-wide)"** section in full. It fixes: the existing `app-nav.tsx` pattern is retained (only
   the item set changes); the CTA-at-end-of-page pattern (plus the Hero CTA on Home only); the
   footer loses `mailto:`/`tel:`; Home's second Instagram instance stays; and the
   action-vs-instance interpretation of FS §2's "exactly one primary CTA".
4. `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` — this is **Item 2**. It unblocks Items 5 (Home),
   6 (Process content), 7 (Location polish), 8 (Preparation/Aftercare split). It runs in parallel
   with Item 1 (upload-flow architecture) — the two do not touch the same files.
5. Current shipped code to read before changing anything (verify, do not assume):
   `src/shared/ui/app-nav.tsx`, `src/shared/ui/public-footer.tsx`, `src/shared/ui/index.ts`,
   `app/[locale]/(public)/layout.tsx`, `app/[locale]/(public)/policies/page.tsx`,
   `app/[locale]/(public)/page.tsx` (Home — two inbound `/policies` links),
   `app/[locale]/(public)/aftercare/page.tsx` (two "Back to Policies" links),
   `app/[locale]/(public)/location/page.tsx`, `src/shared/i18n/messages/en.json`
   (`nav`, `footer`, `policies`, `home`, `aftercare` namespaces).

## Goal

Bring the site-wide shell — primary navigation, global footer, and the primary-CTA pattern — to
the Stage 6 blueprint, and complete the `policies` → `process` route rename **with its content
carried over unchanged**, so no page is left broken or content-less while Item 6 (the real Process
content) waits on owner-authored copy. After this task, every remaining Stage 6 page task (Items
5–8) can be built against a shell that already matches FS §2/PRD D9.

## Scope

1. **Navigation item set** (`src/shared/ui/app-nav.tsx`). `NAV_ITEMS` becomes exactly
   Home / Process / Request / Location, in that order (PRD D9). Only the item set changes — the
   bottom-tab-bar-on-mobile / top-sticky-from-`sm:` pattern, the active-state logic, and the
   component's structure stay as shipped (blueprint: "Navigation pattern unchanged"). Update the
   `nav` i18n namespace (`policies` key → `process`).

2. **`policies` → `process` route rename, content carried over as-is.** Owner decision (STRAT,
   2026-07-13): the route is renamed and the shipped copy moves with it unchanged; the real FS
   §3.2 content rewrite (block order, Good Fit, Design Process, canonical FAQ) is Item 6 and is
   **not** part of this task.
   - `git mv app/[locale]/(public)/policies app/[locale]/(public)/process` (preserve history);
     rename the component accordingly.
   - Rename the `policies` i18n namespace to `process` in `en.json` — **string values unchanged**.
     Do not rewrite, reorder, add, or delete any copy. (The existing keys `title`, `fees`,
     `tipping`, `deposits`, `designPolicy`, `touchUps`, `agePolicy`, `faq`, `ctaButton`,
     `aftercareLink` carry over verbatim.)
   - The page keeps its existing primary CTA ("Request a Tattoo" → `/request`), which already
     satisfies FS §2's table for Process.
   - The page's existing `aftercareLink` secondary link (→ `/aftercare`) is **kept as shipped** in
     this task — whether it survives is an Item 8 (Preparation/Aftercare split) question, not a
     shell question. Do not remove it here.

3. **Inbound `/policies` link sweep** (the plan folds the "policies inbound-link check" into this
   item). After the rename, no route, page, component, or i18n string may still reference
   `/policies`. Known call sites, all of which must be handled:
   - `app/[locale]/(public)/page.tsx` — Home hero secondary link (`home.policiesLink`) → point at
     `/process`; rename the i18n key to `processLink` and its value to match the Process page's
     title. Keep it as a link (Home's full rebuild is Item 5 — do not restructure Home here).
   - `app/[locale]/(public)/page.tsx` — the Mini Process `t.rich("step2Text", { policies: ... })`
     rich-text link → point at `/process`; rename the rich-tag and the `<policies>` markup inside
     the `home.step2Text` string to `process`.
   - `app/[locale]/(public)/aftercare/page.tsx` — the two "Back to Policies" links (top and
     bottom) are **removed**, per PROJECT_DECISIONS.md — Aftercare page ("the shipped page's
     'back to policies' links are removed"). Remove the now-unused `aftercare.backToPolicies` key.
     This is the only part of the Aftercare page this task touches; its Preparation/Aftercare
     split is Item 8.
   - Grep the whole repository for `policies` afterwards and confirm every remaining hit is either
     a documentation/history mention or an unrelated word ("RLS policies", "storage policies") —
     no live route reference remains.

4. **Global footer** (`src/shared/ui/public-footer.tsx`). Remove the `mailto:` (email) and `tel:`
   (phone) links, per the owner's 2026-07-13 decision recorded in PROJECT_DECISIONS.md —
   Navigation and CTA placement. The Stage 6 footer is: studio name + address + Instagram +
   copyright. Remove the now-unused `footer.email`, `footer.phone`, and `footer.phoneHref` i18n
   keys (verify with a grep that nothing else consumes them before deleting).

5. **Primary-CTA pattern as a shared component.** Extract the CTA block that Home and Process
   currently duplicate inline (`<Link href="/request" className="inline-block rounded-md
   bg-foreground …">`) into one shared UI component (e.g. `src/shared/ui/cta-*.tsx`, exported from
   `src/shared/ui/index.ts` — follow the existing `shared/ui` conventions exactly; do not
   introduce a new abstraction layer or a variants library). Use it on the pages this task already
   touches (Process, and Home's existing end-of-page CTA instance). Its label and target come from
   FS §2's table (Home / Process / Location → "Start Your Request" → `/request`) — but **do not
   restyle it** or change the shipped visual treatment; this is an extraction, not a redesign.
   Copy wording may keep the shipped "Request a Tattoo" if changing it would collide with Item 5/6
   copy work — flag the choice in the plan rather than deciding silently.

6. **Location gets its missing primary CTA** (FS §2's table lists Location with a primary CTA; the
   shipped page has none). Append the shared CTA component from Scope 5 at the end of
   `app/[locale]/(public)/location/page.tsx`. This is the one Item 7 line pulled forward into this
   task, deliberately: leaving the site-wide CTA pattern half-applied until the asset-blocked
   Location task runs would leave FS §6 criterion 10 failing for no reason. **Nothing else on
   Location is touched** — the placeholder map and photo `<div>`s stay exactly as they are (Item 7).

## Out of Scope

- **Any content rewrite.** Not the Process page's real FS §3.2 content (Item 6), not Home's block
  order / About fold / Featured Work (Item 5), not the Location map or studio photos (Item 7), not
  the Preparation/Aftercare split (Item 8). Copy moves verbatim or not at all.
- **Any visual/styling redesign.** No new colors, spacing scales, typography, or component
  libraries. The CTA extraction (Scope 5) must render the same as today.
- The Request form and the Success page (Items 1/3/4) — do not touch `RequestForm.tsx`,
  `app/api/request/`, or anything under `src/features/request/`.
- Admin-side navigation, layout, or auth (`app/[locale]/(admin)/**`) — this task is public-surface
  only.
- Adding a `/preparation` route (Item 8), a Success route (Item 4), or a redirect from the old
  `/policies` URL (see Open questions below — the STRAT decision is *no redirect*, the site is not
  yet public).

## Workflow (enforced)

1. Read the Context docs and the shipped files listed above; confirm understanding in 3–5 lines.
2. Grep for every inbound `/policies` reference **before** the `git mv`, so the sweep in Scope 3 is
   driven by the repo, not by this file's (possibly stale) list.
3. Present a concise implementation plan and wait for explicit developer approval. Call out
   explicitly: the CTA label choice (Scope 5) and anything the grep found that this task file does
   not already name.
4. Implement only after approval, within Scope only. One step at a time.
5. If any step would require changing product behavior beyond the blueprint (new nav item, a
   different footer content set, a CTA on Preparation/Aftercare, etc.), STOP and escalate —
   PROJECT_DECISIONS.md, Stage 6 Product Documentation Authority. Never resolve it in-task.
6. After implementation: run the Review Pipeline per AI_REVIEW_PIPELINE.md (Test Agent → Quality
   Gates `pnpm qg` → Review Agent). Note: the shell components have no tests today; the Test Agent
   determines coverage per PROJECT_TESTING_STRATEGY.md — do not add a test framework or a
   component-testing pattern this project does not already have just to cover a nav item list.
7. Manually verify in the browser before reporting done: every public page renders, the nav shows
   exactly four items with correct active states, `/process` shows the carried-over content, no
   page 404s, the footer has no email/phone link, and Home / Process / Location each end with the
   primary CTA.

## Acceptance Criteria

Verifiable, and mapped to FS §6 where applicable:

1. Primary navigation on every public page is exactly Home / Process / Request / Location, in that
   order (FS §6.9). Preparation/Aftercare content pages remain reachable by direct URL and absent
   from the nav.
2. `/[locale]/process` renders the content that `/[locale]/policies` rendered before this task,
   unchanged; `/[locale]/policies` no longer exists as a route.
3. A repository-wide grep for `/policies` returns no live route reference (only docs/history and
   unrelated "policies" words such as RLS/storage policies).
4. The global footer contains studio name, address, Instagram, and copyright — and no `mailto:` or
   `tel:` link. The `footer.email` / `footer.phone` / `footer.phoneHref` keys are gone from
   `en.json`.
5. Home, Process, and Location each present the primary CTA at the end of the page, rendered from
   one shared component; Home additionally keeps its Hero CTA instance (blueprint: same action,
   two instances — not a competing CTA, FS §6.10).
6. Home's Instagram links (Hero and Featured Work) are both still present and working (blueprint
   decision — do not "clean them up").
7. `pnpm qg` passes: structure / lint / typecheck / test / build. No test regressions.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress entry).
- Update PROJECT_DECISIONS.md only if a *new* decision was made (the shell decisions already
  exist; the route-rename-with-content-carryover call from the 2026-07-13 STRAT session is
  recorded in this task file and in the STAGE_6_IMPLEMENTATION_PLAN.md Item 2 row — no new
  PROJECT_DECISIONS.md entry is expected unless something genuinely new is decided).
- Update `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`'s Item 2 status row (and Item 6's note, if
  the carried-over content changes what Item 6 must do).
- Run `pnpm structure` (updates `docs/files-structure.md` — the route rename changes it).
- Set Status to `done` (date + PROJECT_STAGE_LOG.md entry pointer — no commit hash, see
  AI_TASK_PROTOCOL.md — Lifecycle); move this file to `docs/project/tasks/done/`.

## Open questions (resolved at STRAT time — recorded so the IMPL session does not re-litigate)

- **Old `/policies` URL: no redirect.** The site is not yet publicly launched (see
  PROJECT_PRODUCTION_READINESS.md — production environment setup is still open), so there are no
  external inbound links or search-index entries to preserve. A `next.config` redirect would be
  permanent debt for a URL nobody has. If the owner has already shared `/policies` links from
  Instagram, this decision must be revisited — flag it in the plan.
- **Why the route rename lives in Item 2 and not Item 6.** Item 6 is content-blocked on
  owner-authored copy (pricing, FAQ, Good Fit). Leaving the rename there would mean the nav points
  at a 404 for as long as the copy takes. Carrying the shipped content over unchanged keeps the
  site coherent at every commit, and costs Item 6 nothing — it rewrites the page's content at a
  route that already exists.
