Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 Task 11 — Public 404 + error boundary

## Handoff

Implemented `docs/project/tasks/STAGE_6_TASK_11_public_error_404.md` — replaced the bare
unlocalized public 404 with a localized page offering a way home, and added a public error
boundary so an unhandled render error in a public page shows a graceful, localized page instead
of Next.js's default screen.

**Changed files:**
- `app/not-found.tsx` — the root 404 (previously inline-styled "404 / Page not found", no link
  home) now imports `messages.notFound` directly from `@/shared/i18n/messages/en.json` at module
  scope and renders `title`/`body`/`backHome` as plain values, plus a `next/link` `Link` back to
  `/`. Same no-layout constraint as before (own `<html>/<body>` — a root `not-found.tsx` renders
  outside `app/[locale]/layout.tsx`'s tree).
- `app/[locale]/error.tsx` (new) — the public error boundary: `"use client"`, receives
  `{ error, reset }`, `useTranslations("error")`, renders inside `<Page><Section>` with a
  `reset()` retry button and a `Link` (from `@/shared/i18n`) back to `/`. Manually wrapped with
  `AppNav`/`PublicFooter` from `@/shared/ui` (same structure `(public)/layout.tsx` uses) — see
  "Deviation from task file" below for why this wrap is manual rather than inherited.
- `src/shared/i18n/messages/en.json` — two new top-level namespaces: `notFound`
  (`title`/`body`/`backHome`) and `error` (`title`/`body`/`retry`/`backHome`).
- `app/[locale]/__tests__/error.test.tsx` (new) — 2 tests: retry button calls `reset()`; Home link
  renders with the correct href. Mocks `next-intl` (`useTranslations`) and `@/shared/i18n`
  (`Link`, `usePathname` — the latter needed because the mounted `AppNav` inside the wrapper calls
  it) following the existing project convention (see `src/features/request/__tests__/
  SuccessView.test.tsx` for the same mock shape).
- `docs/files-structure.md`, `docs/project/PROJECT_STAGE_LOG.md`, `docs/project/
  PROJECT_DECISIONS.md`, `docs/project/PROJECT_BACKLOG.md`, `docs/project/
  STAGE_6_IMPLEMENTATION_PLAN.md`, `docs/project/tasks/STAGE_6_TASK_11_public_error_404.md` —
  reporting/doc updates per CLAUDE.md's mandatory pre-results steps and the task's Reporting
  section.

**Deviation from the task file (owner-confirmed mid-plan):** the task recommended a two-tier
404 design (Option A) — a bare root `not-found.tsx` plus a **localized `app/[locale]/
not-found.tsx`** using the public shell, reasoning that a `[locale]`-level `not-found.tsx` "gets
the shell for free" as a sibling of the `(public)` route group. **Live dev-server testing during
planning disproved this**: Next.js only renders a nested `not-found.tsx` when a page *inside* that
segment tree explicitly calls `notFound()` (confirmed via the existing admin precedent —
`app/[locale]/(admin)/admin/(protected)/requests/[id]/not-found.tsx` fires from an explicit
`notFound()` call in the sibling `page.tsx`). For a genuinely unmatched URL — the real
visitor-mistyped-a-path case, no page anywhere matches — Next cannot mount the `[locale]` segment
tree at all and always falls back to the **root** `app/not-found.tsx`, regardless of any
`app/[locale]/not-found.tsx` file's existence. Verified against multiple unmatched paths in dev,
including a nested one (`/en/nonexistent-page`, `/en/request/typo`) — both served the root file.
A `[locale]`-level `not-found.tsx` would therefore have been unreachable dead code (nothing under
`[locale]` calls `notFound()` outside the admin subtree, which already has its own dedicated
file), so it was never committed. **Revised approach:** localize the root `app/not-found.tsx`
directly. This is safe because the project has exactly one locale (`src/shared/i18n/routing.ts` —
`locales: [defaultLocale]`, `localePrefix: "always"`) and `proxy.ts` middleware already redirects
any non-prefixed path to `/en/...` before a request can reach `not-found.tsx` — so there is no
real "which locale" ambiguity for a root file to resolve. The root page therefore imports the
`notFound` namespace from `en.json` at module scope (no `useTranslations`/
`NextIntlClientProvider` needed) and renders plain string values. It still cannot use the public
`AppNav`/`PublicFooter` shell — those are client components depending on `next-intl`'s hooks,
structurally unavailable outside the `[locale]` provider tree — so the root 404 is
correctly-localized but shell-less; this is a known, documented gap (not an oversight), recorded
in `PROJECT_DECISIONS.md` — "Public 404 / error boundary (Item 11)". The user was asked via
AskUserQuestion and chose this option over keeping the (non-functional) two-tier design or
dropping localization entirely.

A second, related discovery: `error.tsx` placed directly under `app/[locale]/` also does **not**
inherit the `(public)` route group's layout (confirmed live the same way) — Next only applies the
layout chain of the segment where the file itself lives, and `(public)` is a sibling group, not
an ancestor. Unlike `not-found.tsx`, `error.tsx` DOES fire correctly for its real trigger (an
unhandled render error in an already-mounted `[locale]` tree), so it was kept and manually wrapped
with `AppNav`/`PublicFooter` to still deliver the full shell experience the task asked for.

**Not added:** a root `global-error.tsx`. The task explicitly allowed deciding against it; the
root layout (`app/[locale]/layout.tsx`) has no logic beyond `NextIntlClientProvider`/font setup,
so an error escaping to root is judged near-zero-probability, and a second boundary for that case
was judged over-engineering for this pass.

**Scope boundary:** per the task's Allowed Write Surface — `app/not-found.tsx`,
`app/[locale]/not-found.tsx` (not created, see above), `app/[locale]/error.tsx` (new),
`src/shared/i18n/messages/en.json`, tests for the above, PROJECT_* reporting docs. No admin files
touched; no `@/shared/ui` component modified (only imported); no new dependency.

**Quality gates:** `pnpm qg` green — structure, lint (0 errors, 1 pre-existing unrelated warning
in `RequestImageViewer.test.tsx`), typecheck, test (377 passed, 30 files), build.

**CO-1 (live verification, done in dev, not automated):** navigated to `/en/nonexistent-page` and
a nested unmatched path `/en/request/typo` — both rendered the localized root 404 (real
`en.json` copy, not placeholder text) with a working Home link, confirmed via `curl` inspecting
the response HTML for the exact strings. Forced a temporary `throw new Error(...)` at the top of
`app/[locale]/(public)/page.tsx` (Home), fetched `/en`, confirmed `app/[locale]/error.tsx`
rendered with the `AppNav`/`PublicFooter` shell present (verified via response HTML containing
`Studio Name`/`Herzl 100` — footer content), the localized error copy, and both the retry button
and Home link markup; then reverted the forced throw and confirmed `/en` returns 200 again and
`git diff --stat` on the page file shows no residual change.

**CO-2:** confirmed — no new dependency, env var, or migration.

**Focus questions:**
1. Is importing `messages` (the full `en.json`) into `app/not-found.tsx` at module scope
   (`import messages from "@/shared/i18n/messages/en.json"`) an acceptable pattern for a
   single-locale project, or does it set a precedent that will break awkwardly if a second locale
   is ever added? Is there a better way to get localized-but-static text into a file that is
   structurally outside `NextIntlClientProvider`?
2. Is the manual `AppNav`/`PublicFooter` wrap in `app/[locale]/error.tsx` (duplicating the
   structure of `app/[locale]/(public)/layout.tsx` rather than importing/reusing that layout
   function directly) the right call, or should it import and reuse `PublicLayout` from
   `app/[locale]/(public)/layout.tsx` instead to avoid drifting if that layout's markup changes
   later?
3. Any concern with the root 404's `next/link`'s `Link` (plain `next/link`, not the locale-aware
   `Link` from `@/shared/i18n`) given the file sits outside the `[locale]` segment entirely — is
   `href="/"` guaranteed to correctly redirect through middleware to `/en/`, or could it ever
   render a broken/unprefixed link in some edge case (e.g. a future second locale, or a
   `localePrefix` config change)?
4. External-boundary check: does anything about Next.js App Router's root-vs-nested
   `not-found.tsx` resolution behavior (as tested live and described above) match or contradict
   documented Next.js behavior — is this a stable, intentional framework contract we can rely on,
   or an implementation detail that could change across Next.js versions?

## Review 1

1. **should-fix — the boundary is locale-wide, not public-only, and therefore changes admin
   error handling.** `app/[locale]/error.tsx:7-37` sits above both `(public)` and `(admin)`.
   The request-specific admin boundaries remain closer for their own pages, but an error from an
   admin login/reset page, the protected admin layout, or another uncovered admin child now falls
   through to this component and renders the public `AppNav`/`PublicFooter`. That is an
   out-of-scope public-shell fallback on the private surface, not merely duplicated markup.
   Importing `PublicLayout` directly from a route file would replace this with a second coupling.
   Put the boundary at `app/[locale]/(public)/error.tsx` instead (and move its test/update the task's
   allowed surface and reporting): Next places a segment's `error.tsx` inside that segment's
   layout, so the existing `(public)/layout.tsx` remains around the fallback automatically, while
   the admin tree is unaffected. This also removes the manual shell copy at
   `app/[locale]/error.tsx:11-36`. See the official
   [Next.js error-boundary hierarchy](https://nextjs.org/docs/app/api-reference/file-conventions/error).

2. **should-fix — `reset()` is not the general retry operation for the installed Next.js
   version.** The project uses Next.js 16.2.10 (`package.json:30`). In that version,
   `reset()` only clears the boundary state and re-renders without re-fetching, while
   `unstable_retry()` refreshes the route data and then resets the boundary; the current
   documentation says to use `unstable_retry()` in most cases. For the task's generic public
   render/server error, `onClick={reset}` (`app/[locale]/error.tsx:7,21`) can immediately replay
   the same failed Server Component payload rather than perform the working retry claimed by the
   acceptance criteria and CO-1. The test at
   `app/[locale]/__tests__/error.test.tsx:28-35` proves only that the injected callback is called,
   not that the selected recovery primitive is sufficient. Accept and invoke
   `unstable_retry`, then update the test and reporting language. See the official
   [Next.js `unstable_retry` / `reset` contract](https://nextjs.org/docs/app/api-reference/file-conventions/error#unstable_retry).

3. **nit — the durable routing rationale overstates the middleware coverage.**
   `PROJECT_DECISIONS.md:2129-2131` says the middleware redirects any non-prefixed path before it
   can reach the root 404, but `proxy.ts:41-42` deliberately excludes `api`, `auth`, framework
   paths, and every path containing a dot. For example, `/unknown.txt` can reach the root fallback
   without first becoming `/en/unknown.txt`. This does not invalidate the implementation:
   Stage 6 has exactly one English locale, and the Home link itself (`/`) is matched and redirected
   correctly. Narrow the claim to matched public routes so the decision remains true if somebody
   later reasons from it. The next-intl guide documents this matcher-dependent non-localized case
   under
   [Catching non-localized requests](https://next-intl.dev/docs/environments/error-files#catching-non-localized-requests).

### Verified without findings

- The root-vs-nested 404 observation is a documented framework contract, not merely a dev-server
  implementation detail. Next.js documents root `app/not-found` as handling global unmatched URLs
  since v13.3.0, and next-intl explicitly says `[locale]/not-found.tsx` is used when an in-tree
  route calls `notFound()`; catching arbitrary unknown localized paths requires an explicit
  catch-all route. The chosen root fallback is therefore stable for the current design. Sources:
  [Next.js `not-found.js`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found),
  [next-intl unknown-route guidance](https://next-intl.dev/docs/environments/error-files#catching-unknown-routes).
- Importing `messages.notFound` from the JSON catalog at module scope in `app/not-found.tsx:1-4`
  is acceptable here: it remains server-rendered, PRD D10 fixes Stage 6 to English only, and the
  decision explicitly requires revisiting the mechanism if another locale is introduced.
- Plain `next/link` with `href="/"` in the root fallback is correct for the current routing:
  `/` is covered by `proxy.ts` and redirects to `/en/`. A future multi-locale design would need a
  real locale source for both copy and navigation, but PRD Future Scope must not shape Stage 6.
- Omitting `global-error.tsx` is within the task's explicit decision boundary. The residual root
  layout/provider failure case is documented rather than silently claimed as covered.

### Checks run

- `pnpm lint` — PASS (0 errors; one pre-existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (30 files, 377 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS (the override accounts for the
  repository's known CRLF-tracked project docs).

## Response 1

1. **accept.** Correct and the more serious of the two — a `[locale]`-level boundary silently
   widened the blast radius to the entire admin subtree, not just the public site, and would have
   put the public brand shell in front of a private-surface failure. Moved the file from
   `app/[locale]/error.tsx` to `app/[locale]/(public)/error.tsx`; it now inherits
   `(public)/layout.tsx`'s `AppNav`/`PublicFooter` automatically (the manual wrap is deleted
   entirely, which also directly answers Focus question 2 — reusing the layout via placement,
   not via importing `PublicLayout` as a function, is the correct Next.js-native mechanism). Moved
   the test alongside it to `app/[locale]/(public)/__tests__/error.test.tsx`. Verified live: forced
   a throw in the Home page — the moved boundary renders with the shell present, and
   `/en/admin/login` still returns 200 untouched (admin's own `error.tsx` files remain closer in
   the tree and continue to govern there).
2. **accept.** Confirmed independently by reading `node_modules/next/dist/client/components/
   catch-error.js` for the installed 16.2.10: `reset()` only does `this.setState({ error: null
   })`; `unstable_retry()` wraps `this.context?.refresh()` (a `router.refresh()` on the
   `AppRouterContext`) followed by `reset()`. So the original implementation's retry button could
   not actually re-fetch a transiently-broken Server Component render — exactly the failure mode a
   "try again" button exists for. Switched `onClick` to `unstable_retry` (destructured from the new
   third prop Next.js passes to `error.tsx` components in this version, per
   `error-boundary.d.ts`'s `ErrorInfo` type) and updated both tests: one now asserts
   `unstable_retry` was called and `reset` was NOT (locks in the correct primitive, not just "some
   callback fired").
3. **accept.** Narrowed the `PROJECT_DECISIONS.md` claim from "any non-prefixed path" to "matched
   public routes", with the `proxy.ts` matcher's actual exclusions (`api`, `auth`, framework paths,
   dotted paths) spelled out inline so a future reader doesn't re-inherit the overstatement. Does
   not change the decision itself — Stage 6 still has exactly one locale regardless of path shape.

All three findings applied; re-ran `pnpm qg` — green (377 tests, including the 2 rewritten error-
boundary tests). Live-reverified in dev after the fixes: `/en/nonexistent-page` and a nested
unmatched path still render the localized root 404; a forced throw on the Home page now renders
`app/[locale]/(public)/error.tsx` with the shell present, `unstable_retry` wired to the retry
button, and a Home link; `/en/admin/login` unaffected; forced throw reverted cleanly (`git diff
--stat` clean on the Home page file afterward).

**Резюме для владельца:** Codex нашёл два реальных бага в первой версии. (1) Error-boundary стоял
на уровне `[locale]`, а не только `(public)` — значит ловил и ошибки админки, показывая на них
публичный shell (nav/footer сайта) вместо админского вида. Перенёс файл в
`app/[locale]/(public)/error.tsx` — теперь Next сам подключает нужный layout по месту, ручной
оборачивание убрано, админка не затронута (проверил живьём). (2) Кнопка "Попробовать снова"
вызывала `reset()`, который в установленной версии Next.js 16 только сбрасывает состояние
компонента, но не перезапрашивает данные — то есть при реальной серверной ошибке кнопка просто
показала бы ту же самую ошибку заново. Заменил на `unstable_retry()` — правильный примитив для
"повторить" в этой версии (сначала `router.refresh()`, потом сброс). Третья находка — уточнение
формулировки в PROJECT_DECISIONS.md про то, какие пути реально перехватывает middleware (не "любой
путь", а только совпавшие публичные роуты) — на решение не влияет, просто точнее. Все три находки
приняты и исправлены, `pnpm qg` зелёный, живая проверка повторена после фиксов.

## Review 2

1. **should-fix — the code fixes are correct, but three current completion records still describe
   the superseded first draft.**
   - `docs/project/PROJECT_BACKLOG.md:107-108` says the boundary is
     `app/[locale]/error.tsx` and manually shell-wrapped.
   - `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md:58` repeats that same path and shell shape.
   - `docs/project/tasks/STAGE_6_TASK_11_public_error_404.md:97-100,121-122` still defines and
     claims live verification of `[locale]/error.tsx` with `reset()`, even though the task's new
     Deviations section correctly records the final implementation.

   These are the current backlog resolution, implementation-plan status, task Scope, and CO-1
   evidence—not preserved Handoff history—so a later reader receives mutually contradictory
   answers about what shipped. Update them to
   `app/[locale]/(public)/error.tsx`, inherited `(public)` shell, and `unstable_retry()`. The task
   may keep the original design in its Deviations/history, but its active Scope and completion
   evidence must describe the reconciled result.

### Verified without further findings

- Finding 1's code fix is correct: `app/[locale]/(public)/error.tsx` is inside the public layout,
  contains no manual `AppNav`/`PublicFooter`, and no locale-wide `app/[locale]/error.tsx` remains.
- Finding 2's code and regression test are correct:
  `app/[locale]/(public)/error.tsx:7-12,24` accepts and invokes `unstable_retry`; its test asserts
  that `unstable_retry` is called and `reset` is not.
- Finding 3 is correctly reconciled in `PROJECT_DECISIONS.md:2130-2136`: the claim is now limited
  to matched public routes and explicitly names the matcher exclusions.
- The post-fix file move is reflected correctly in `docs/files-structure.md`.

### Checks run

- `pnpm lint` — PASS (0 errors; one pre-existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (30 files, 377 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.

## Response 2

1. **accept.** Correct — the code fix (Review 1) was applied but three reporting docs still
   described the superseded first draft. Reconciled all three to the as-built shape
   (`app/[locale]/(public)/error.tsx`, inherited shell, `unstable_retry()`):
   - `PROJECT_BACKLOG.md` — updated the resolved-entry description.
   - `STAGE_6_IMPLEMENTATION_PLAN.md` — updated the Item 11 status row.
   - `STAGE_6_TASK_11_public_error_404.md` — updated CO-1's disposition text (the live-verification
     evidence, which is what Codex flagged as authoritative-but-stale) and added an "As-built"
     pointer next to Scope item 2 so the original task spec stays as historical intent without
     misleading a re-reader about what shipped.
   Re-ran `pnpm qg` after the doc fixes — green (377 tests, no source change in this round).

## Consensus

- Finding (Review 2, doc drift) — **accepted and fixed**: `PROJECT_BACKLOG.md`,
  `STAGE_6_IMPLEMENTATION_PLAN.md`, and `STAGE_6_TASK_11_public_error_404.md` (CO-1 + Scope
  pointer) now all describe `app/[locale]/(public)/error.tsx` with `unstable_retry()`, matching
  the code.
- Review 1's two should-fix findings (locale-wide error boundary leaking into admin; `reset()`
  not re-fetching route data) — **accepted and fixed** in the prior round, re-verified live after
  this round's doc changes (no code touched this round).
- Review 1's one nit (middleware-coverage overstatement in `PROJECT_DECISIONS.md`) — **accepted
  and fixed** in the prior round.
- No disputed items across both rounds. `pnpm qg` green. Ready for commit proposal.

**Резюме для владельца:** Codex во втором раунде поймал документационный дрейф — код после первого
раунда был исправлен верно, но три отчётных документа (PROJECT_BACKLOG.md,
STAGE_6_IMPLEMENTATION_PLAN.md, сам файл задачи — раздел CO-1) всё ещё описывали старую версию
(`app/[locale]/error.tsx` + `reset()`), хотя реально в коде уже `app/[locale]/(public)/error.tsx`
+ `unstable_retry()`. Поправил все три места. Консенсус достигнут, `pnpm qg` зелёный, готово к
предложению коммита.
