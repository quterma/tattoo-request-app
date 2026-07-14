# Task: Stage 6 — Preparation / Aftercare split + footer discovery

## Status

`ready` · created 2026-07-14 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Execution

- Executor: `codex` — deterministic, local, decision-free: two new routes carved from one
  existing page along already-decided section boundaries, plus two footer links. No product,
  architecture, or visual-taste decision remains (all resolved in PROJECT_DECISIONS.md —
  Preparation/Aftercare in-product discovery, 2026-07-14). Delegable per AI_TASK_PROTOCOL.md.
- Reviewer: `claude` — mandatory independent review pass + full `pnpm qg`.
- Baseline commit: `da6861f` — the executor stops if HEAD differs, or if any path in the Allowed
  Write Surface is already dirty, unless this task explicitly assigns that diff here (it does not).
- Allowed Write Surface (nothing outside it):
  - `app/[locale]/(public)/aftercare/page.tsx` (rewritten to the Aftercare-only page)
  - `app/[locale]/(public)/preparation/page.tsx` (new)
  - `src/shared/ui/public-footer.tsx`
  - `src/shared/i18n/messages/en.json`
  - `app/[locale]/(public)/process/page.tsx` (remove the one `aftercareLink` secondary link only)
  - test files under `app/[locale]/(public)/**/__tests__/` or the co-located pattern, if any are
    added (see Testing)
- May touch dependencies / migrations / generated files / shared docs: **no.** (Do not edit
  PROJECT_* docs — Claude does that in the review pass. Do not run `pnpm structure`/`qg` mutations
  beyond the allowed gates below.)

## How to run (session settings)

- Model: Sonnet (well-scoped, mechanical).
- Start mode: Plan mode (mandatory) — present the plan, incl. the "Deviations from the task file"
  section, and wait for explicit approval before editing.
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance, Delegating IMPL Tasks to Codex.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md.
2. Stage Source of Truth: `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §2 (nav + footer discovery),
   §3.6 (Preparation), §3.7 (Aftercare), §5 (canonical ownership); `STAGE_6_PRODUCT_DEFINITION.md`
   §5 (distribution + footer fallback), D9 (nav item set fixed).
3. The governing decisions — read in full: PROJECT_DECISIONS.md — **"Preparation/Aftercare
   in-product discovery" (2026-07-14)** (Q1/Q2/Q3 resolutions, the exact intro copy, the
   `process.aftercareLink` removal), and the "Preparation page (FS §3.6)" / "Aftercare page
   (FS §3.7)" blueprint entries (block order, no CTA, no cross-link, content boundaries).
4. Current shipped code to read (do not assume — verify):
   - `app/[locale]/(public)/aftercare/page.tsx` — the combined page (four sections; `bullets()`
     helper splits each i18n string on `\n`).
   - `src/shared/ui/public-footer.tsx` — the footer to extend (studio / address / Instagram /
     copyright; imports `Container`, `InstagramIcon`; internal links must use `Link` from
     `@/shared/i18n`, not a raw `<a>` — the Instagram link is external and stays an `<a>`).
   - `app/[locale]/(public)/process/page.tsx` — the `aftercareLink` secondary link to remove
     (currently lines ~82–87, the `<Link href="/aftercare">`).
   - `src/shared/i18n/messages/en.json` — the `aftercare` namespace and `footer` namespace.
   - `src/shared/ui/app-nav.tsx` — confirm the nav item set is NOT touched (D9: exactly
     Home/Process/Request/Location).

## Goal

Split the shipped combined `aftercare` route into two FS-compliant content pages —
**Preparation** (`/preparation`) and **Aftercare** (`/aftercare`) — carrying the existing copy
over along the section boundaries already decided, adding the one new intro line each; and add
**two footer links** (Preparation, Aftercare) as in-product fallback discovery, removing the now-
redundant Process→aftercare secondary link. No visual redesign, no nav change, no new content
beyond the two owner-supplied intro lines.

## Scope

1. **New `/preparation` page** (`app/[locale]/(public)/preparation/page.tsx`), a new
   `useTranslations("preparation")` server-ish page mirroring the shipped aftercare page's
   structure (`Page`/`Section`/`Stack`, the same `bullets()` `\n`-split helper). Blocks in order
   (PROJECT_DECISIONS.md — Preparation blueprint):
   - Intro (`preparation.intro`, one short paragraph, not a bulleted list).
   - "Before Your Appointment" — `preparation.beforeAppointment` + `preparation.beforeAppointmentItems`.
   - "What Happens on Tattoo Day" — `preparation.tattooDay` + `preparation.tattooDayItems`
     (the `tattooDayItems` copy carries over **verbatim**, including the final "After the tattoo…"
     bullet — Q2 decision: it stays here, unchanged).
   - Page title: `preparation.title`.
   - **No primary CTA** (FS §2 content-page rule).
2. **Rewrite `/aftercare`** to the Aftercare-only page, blocks in order:
   - Intro (`aftercare.intro`).
   - "Aftercare Instructions" — `aftercare.aftercareInstructions` + `aftercare.aftercareInstructionsItems`.
   - "Healing & Touch-Ups" — `aftercare.healingTouchUps` + `aftercare.healingTouchUpsItems`.
   - Page title: `aftercare.title` (update its value — see i18n below; the shipped
     "Tattoo Day & Aftercare" now describes only the Preparation+Aftercare pair, not this page).
   - **No primary CTA.**
3. **i18n (`en.json`)** — restructure the `aftercare` namespace into `preparation` + `aftercare`:
   - New `preparation` namespace: `title` ("Before Your Appointment" — or an owner-adjustable
     equivalent; meaning = the prep page), `intro` (exact copy below), `beforeAppointment`,
     `beforeAppointmentItems`, `tattooDay`, `tattooDayItems` — the four latter values moved
     **verbatim** from the current `aftercare` namespace.
   - `aftercare` namespace after the split: `title` (change to "Aftercare" or equivalent — no
     longer "Tattoo Day & Aftercare"), `intro` (exact copy below), `aftercareInstructions`,
     `aftercareInstructionsItems`, `healingTouchUps`, `healingTouchUpsItems` (values unchanged).
   - `preparation.intro` = **"For clients with an upcoming appointment — here's how to prepare and
     what to expect on the day."**
   - `aftercare.intro` = **"Your tattoo is done — here's how to care for it while it heals."**
   - Remove `process.aftercareLink`.
   - Add `footer.preparation` = "Preparation", `footer.aftercare` = "Aftercare" (labels
     owner-adjustable).
4. **Footer links** (`public-footer.tsx`): add two internal links — Preparation (`/preparation`)
   and Aftercare (`/aftercare`) — using `Link` from `@/shared/i18n` (locale-aware), placed as an
   unobtrusive row (not competing with studio/address/Instagram). They are fallback discovery, not
   primary nav — keep them visually secondary (same muted style as the rest of the footer).
5. **Remove the Process→aftercare secondary link** in `process/page.tsx` (the `<Link
   href="/aftercare">` block using `process.aftercareLink`). The CtaRequestButton on Process stays.

## Out of Scope

- The nav bar (`app-nav.tsx`) — must stay exactly Home/Process/Request/Location (PRD D9).
- Any Process **content** rewrite (that is Item 6) — only the one `aftercareLink` line is removed.
- Any redirect from the old combined route (there is none to preserve; not launched).
- Visual/styling redesign of the footer or either page beyond adding the links/intro.
- Rewriting the boundary bullet (Q2: it stays verbatim in Preparation).
- No cross-link between Preparation and Aftercare (blueprint: none).

## Workflow (enforced)

1. Read Context; confirm understanding in 3–5 lines; report working-tree state vs baseline
   `da6861f` and stop if it differs or any Allowed-Write-Surface path is dirty.
2. Present a concise plan with a distinct **"Deviations from the task file"** section (or
   "no deviations"). Wait for explicit approval.
3. Implement within the Allowed Write Surface only.
4. Run `pnpm lint` / `pnpm typecheck` / `pnpm test` and iterate until green (Codex gate loop);
   append an Execution Report; set Status `awaiting-claude-review`. Do NOT commit, do NOT edit
   PROJECT_* docs, do NOT run `pnpm structure`.
5. If any repo evidence conflicts with this task, or an acceptance criterion admits materially
   different behavior — STOP and ask (do not improvise).

## Acceptance Criteria

- `/preparation` and `/aftercare` are two distinct routes, each rendering its intro + its two
  sections in the specified order, each with **no primary CTA**.
- Preparation contains Before-Appointment + Tattoo-Day (incl. the final "After the tattoo…"
  bullet verbatim); Aftercare contains Aftercare-Instructions + Healing-&-Touch-Ups. No content is
  duplicated across the two pages, and none is lost from the shipped combined page.
- The global footer shows Preparation and Aftercare links on every public page, locale-aware,
  visually secondary; the nav bar is unchanged (still four items).
- The Process page no longer renders a link to `/aftercare`; `process.aftercareLink` is gone from
  `en.json`.
- FS §6 criterion 9 still holds: nav is exactly Home/Process/Request/Location and both pages are
  reachable at stable URLs (now also via footer — footer is not primary nav).
- `pnpm qg` passes (Claude's mandatory final gate); any tests referencing the old combined route
  or `aftercareLink` are updated, not silently broken.

## Reporting

**Executor (codex):** append the Execution Report below (what changed, final lint/typecheck/test
results, anything unresolved, any out-of-scope findings noticed); set Status
`awaiting-claude-review`. Do not touch shared docs or commit.

**Reviewer (claude):** independent review of the full diff as an unfamiliar patch; re-run full
`pnpm qg`; then update PROJECT_STAGE_LOG.md (progress) and STAGE_6_IMPLEMENTATION_PLAN.md (Item 8
status → done); set this file's Status `done` (date + stage-log pointer, no commit hash); move it
to `docs/project/tasks/done/`; propose the commit for owner approval.

## Execution Report (filled by the executor)

<what changed; gate results; unresolved items; out-of-scope findings>

## Claude Review Verdict (delegated tasks only)

<Claude's independent verdict after reviewing the diff and re-running `pnpm qg`>
