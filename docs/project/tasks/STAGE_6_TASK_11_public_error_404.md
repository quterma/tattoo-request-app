# Task: Stage 6 — Public 404 + error boundary (Item 11)

## Status

`ready` · created 2026-07-19 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Execution

- Executor: `claude` or `codex` — small, local, decision-free once the 404-localization approach is
  chosen in-plan (see "Open micro-decision"). Delegable per AI_TASK_PROTOCOL.md. If delegated:
  `Executor: codex`, `Reviewer: claude`.
- Baseline: **the commit that introduced this task file** — executor derives it; stops only if its
  Allowed Write Surface moved/dirtied.
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus (touches source).
- Allowed Write Surface: `app/not-found.tsx`, `app/[locale]/not-found.tsx` (new, if chosen),
  `app/[locale]/error.tsx` **or** `app/global-error.tsx` (new — the public error boundary),
  `src/shared/i18n/messages/en.json` (404/error copy), any small shared UI the pages reuse
  (`@/shared/ui` — read-only import, don't modify), the tests for the above, PROJECT_* reporting docs.
- May touch dependencies / migrations / generated files / shared docs: **no**.

## How to run (session settings)

- Model: Sonnet (small, fully specified) — or delegate to Codex.
- Start mode: Plan mode (present the plan incl. "Deviations from the task file" and the
  404-localization choice).

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **This is outside the FS's public-website scope** (FS does not define error/404 pages) — it is a
   Stage 6 polish item tracked in PROJECT_BACKLOG.md ("Public error & 404 UX", Stage 5D finding) and
   PROJECT_IMPLEMENTATION_PLAN.md (Stage 6, "outside the FS's public-website scope"). So there is no
   FS §-level spec to match; the bar is: **localized, on-brand, gives the visitor a way home, and
   catches render errors instead of Next's default screen.** No PRD/FS change is involved.
3. **Shipped code — read it:**
   - `app/not-found.tsx` — the current root 404: a bare, **unlocalized** "404 / Page not found",
     inline styles, its own `<html>`/`<body>` (required — a root not-found renders outside any
     layout), **no link home**.
   - `app/[locale]/layout.tsx` — the locale layout + `NextIntlClientProvider` (this is where
     next-intl messages are available; the root `not-found.tsx` is OUTSIDE it, which is the crux of
     the localization decision below).
   - `app/[locale]/(public)/layout.tsx` — the public shell (nav + footer). A localized 404/error
     rendered under `[locale]` gets this shell for free.
   - Existing `error.tsx` under admin (there is one) — mirror its shape for the public one.
   - `src/shared/ui` — `Page`, `Section`, `Link` (from `@/shared/i18n`) for a coherent page.

## Open micro-decision (resolve in the plan)

**How to localize the 404.** next-intl messages live inside `[locale]`; the root `app/not-found.tsx`
renders outside it, so it cannot use `useTranslations`. Two clean options — pick one in the plan:

- **(A, recommended) Two-tier:** keep a minimal, unlocalized root `app/not-found.tsx` (it only ever
  shows for paths with no valid locale prefix — a genuinely unusual case) but make it not-bare (a
  clean page with a link to `/`); AND add a **localized `app/[locale]/not-found.tsx`** that uses the
  public shell + `useTranslations`, which is what real visitors hitting a bad in-locale URL will see.
- **(B) Single localized:** rely on `[locale]/not-found.tsx` only and accept the root one stays
  bare. Simpler, but a locale-less 404 stays ugly.

Recommend A. State the choice as the "Deviation/decision" line in the plan.

## Goal

Replace the bare public 404 with a localized, on-brand not-found that offers a way home, and add a
public error boundary so an unhandled render error shows a graceful, localized page instead of
Next.js's default white screen.

## Scope

1. **Localized 404** per the chosen option: a clean page with a short "page not found" message and a
   primary link back to Home (`/`). Localized copy in `en.json` (`notFound.title`, `notFound.body`,
   `notFound.backHome`). If option A, also de-bare the root `not-found.tsx` (still unlocalized, but a
   real page with a home link, matching the visual idiom).
2. **Public error boundary** — `app/[locale]/error.tsx` (a client component, per Next's contract:
   `"use client"`, receives `error` + `reset`) rendering a localized "something went wrong" page with
   a retry (`reset()`) and a link Home. Copy in `en.json` (`error.title`, `error.body`, `error.retry`,
   `error.backHome`). Decide in-plan whether a root `global-error.tsx` is also needed (it catches
   errors in the root layout itself — a belt-and-braces addition; small, worth it, but state the call).
3. Reuse the existing `@/shared/ui` primitives and the public shell so both pages look like the site,
   not like a system page. No new shared components.

## Out of Scope

- Any FS-defined page or the request flow.
- Admin-side error handling (already exists).
- Visual design system changes — reuse what's there; this is not the visual pass.
- Analytics/error-reporting integration (PRD §4 Non-Goal).

## Completion obligations

```text
- CO-1 — Live: navigating to a non-existent in-locale URL shows the localized 404 with a working
  Home link; a thrown render error in a public page shows the error boundary with working retry +
  Home (force one in dev to verify). Disposition: executor fills with what was observed.
- CO-2 — No new dependency, env var, or migration. Disposition: expected None; confirm.
```

## Review Granularity

`single` — a handful of small route files + copy, well under the size trigger.

## Workflow (enforced)

1. Read Context + shipped files; confirm understanding in 3–5 lines; state the 404-localization choice.
2. Present the plan (with "Deviations from the task file"); wait for approval.
3. Implement within Scope; `pnpm qg` green.
4. Tests: these are largely presentational; per PROJECT_TESTING_STRATEGY.md keep it light. The error
   boundary's reset behavior is the one bit worth a small test if feasible; the 404 is proven by CO-1.
5. Independent Codex cross-review to consensus; own the fix loop through consensus and commit.

## Acceptance Criteria

- A bad in-locale URL renders a localized, on-brand 404 with a link Home (not the bare current one).
- An unhandled public render error renders a localized error page with retry + Home, not Next's
  default screen.
- `pnpm qg` green; CO-1 verified live; no new dependency.

## Reporting

- Update PROJECT_STAGE_LOG.md; PROJECT_BACKLOG.md (mark the "Public error & 404 UX" entry resolved);
  STAGE_6_IMPLEMENTATION_PLAN.md Item 11 row. Reconcile CO. Set `done`, move to `tasks/done/`,
  propose the commit after consensus.
