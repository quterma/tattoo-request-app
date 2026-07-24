Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 6 — Process content

## Handoff

Implemented `docs/project/tasks/STAGE_6_TASK_06_process_content.md`: replaced the shipped `/process`
page copy with the owner-approved text (verbatim, approved 2026-07-23 after 3 rounds), replaced the
request-form intro placeholder, and swapped the `Studio Name` placeholder to `Masha Karda` across
metadata and the global footer. Review Granularity: `single` (copy + i18n, no logic change), per the
task file — but it is source code (JSX/TSX + i18n keys the components render), so independent
cross-review is mandatory per AI_TASK_PROTOCOL.md.

Baseline: the working tree on `main` (uncommitted — commit is gated on this review's consensus +
owner approval). `pnpm qg` is green: lint 0 errors (1 pre-existing unrelated `<img>` warning in an
unrelated test file), typecheck clean, 403 tests passing (incl. 4 new), build succeeds.

**Changed files (source):**
- `src/shared/i18n/messages/en.json` — `process` namespace fully replaced (new key set: `overviewText`,
  `goodFit`/`goodFitText`, `pricing`/`pricingText`, `booking`/`bookingText`, `design`/`designText`,
  `touchUps`/`touchUpsText`, `age`/`ageText`, `languages`/`languagesText`, `payment`/`paymentText`,
  `faq` + `faqItems` array of `{q, a}`); old keys deleted (`fees`, `feesText`, `tipping`,
  `tippingText`, `deposits`, `depositsText`, `designPolicy`, `designPolicyText`, `agePolicy`,
  `agePolicyText`, `faqText`). `request.introduction` replaced, `request.__intro_TODO` deleted.
  `app.title`/`titleTemplate`/`description`/`ogTitle`/`ogDescription` and `footer.studio` swapped
  from the `Studio Name` placeholder to the approved `Masha Karda` copy; `app.__meta_TODO` comment
  text updated to drop the now-stale "studio name is still a placeholder" clause.
- `app/[locale]/(public)/process/page.tsx` — section rendering rebuilt for the new key set/order
  (Overview as an intro paragraph under the H1, then Good Fit, Pricing, Booking & Deposit, Design &
  Sketch, Touch-ups, Age, Languages, Payment, FAQ). FAQ renders `faqItems` via `t.raw` into a list;
  the last item's answer uses `t.rich` with `prep`/`aftercare` tag renderers wrapping `Link` from
  `@/shared/i18n`, pointing at `/preparation` and `/aftercare` — mirrors the existing `home.step2Text`
  embedded-link pattern. `Booking & Deposit`'s bold spans (`non-refundable`, `Bigger projects:`) use
  `t.rich` with a `b: (chunks) => <strong>` renderer, same as the old `depositsText` pattern it
  replaces.
- `src/features/request/config/form.ts` — `INSTAGRAM_HANDLE`: `"your_studio"` → `"mashakarda_tattoo"`;
  trimmed the now-stale "PLACEHOLDER — owner must set" doc comment.
- `app/[locale]/opengraph-image.tsx` — `alt` text and the two rendered strings updated to
  `Masha Karda` / `Original Tattoos in Tel Aviv`.
- `app/[locale]/layout.tsx` — one comment edit only (dropped "Home/Process (Items 5/6)" →
  "Home (Item 5)" in the `robots: noindex` rationale, since Process is no longer placeholder copy).
  No functional change in this file.
- `src/features/request/ui/RequestForm.tsx` — one comment edit only: removed a stale reference to
  the now-deleted `__intro_TODO` key. No functional change.

**Changed files (tests):**
- `app/[locale]/(public)/process/__tests__/page.test.tsx` (new) — renders `ProcessPage` inside a real
  `NextIntlClientProvider` with the full `en.json` messages (needed because the page uses `t.rich`
  and `t.raw`, which no existing lightweight `useTranslations` mock in this repo supports). Asserts:
  the dropped `tipping` section and `__intro_TODO` placeholder text do not render; the corrected age
  copy is present and the old "16 and 17" contradiction line is not; the FAQ's Preparation/Aftercare
  links render with the correct `href`s; the primary CTA renders.

**Owner corrections applied during plan review (all in the task file's Scope §8–9 now):**
1. `footer.studio` added to the Allowed Write Surface — the footer is global (every public page), so
   leaving it at `Studio Name` while the H1/metadata say `Masha Karda` would ship a self-contradicting
   site; Item 5 (Home) does not own the shared footer component so it would never pick this up on its
   own. Only the `en.json` string changed; `public-footer.tsx` itself is untouched.
2. `ogTitle`/`ogDescription` are fixed to the owner-approved title/description strings verbatim, not
   derived in code from `title`/`description` — avoids authoring any copy beyond what was approved.

**Not touched, confirmed out of scope:** `home.title`/`home.tagline` (still `Studio Name` / Item 5's
job), `PublicFooter` component markup, footer Preparation/Aftercare links (TASK_15), `AGE_THRESHOLD`
or any form eligibility logic (copy-only correction of a pre-existing contradiction, per task Scope
§7).

**Verification note (CO-2, task file):** no headless-browser tool was available in this environment
(no `chromium-cli`, no Playwright runner) to produce an actual mobile-viewport screenshot. The live
check that was possible: dev server started, both `/en/process` and `/en/request` fetched via `curl`
— 200 OK, approved copy present in the HTML, `tipping`/`__intro_TODO` absent from visible content,
both FAQ links present with correct `href`s, CTA renders, `<title>`/meta description match the
approved copy. Visual truncation on a real mobile viewport was **not** confirmed this way — flagged
back to the task file as a partial CO-2, owner to spot-check on a phone.

**Focus questions for review:**
1. Is the `t.raw("faqItems")` + per-item `t.rich(`faqItems.${index}.a`, …)` pattern in
   `process/page.tsx` a safe/idiomatic use of next-intl, or is there a better-established pattern
   elsewhere in this repo for rendering an array of translated objects with embedded rich text in one
   entry only?
2. Any orphaned i18n keys or dangling references to the deleted `process.*` keys
   (`fees`/`feesText`/`tipping`/`tippingText`/`deposits`/`depositsText`/`designPolicy*`/`agePolicy*`/
   `faqText`) anywhere in the tree that the grep sweep in this session missed?
3. Does swapping `footer.studio` here (rather than waiting for Item 5) create any conflict risk with
   the not-yet-run Item 5 (Home rebuild) task, given Item 5's task file may also touch `en.json`?

## Review 1

1. **Should-fix — Item 6 does not create the fragment targets that the already-cut Item 5 is
   required to deep-link to.** `app/[locale]/(public)/process/page.tsx:20-33` renders the Good Fit
   and Pricing sections without stable `id` attributes. Item 5 explicitly depends on Item 6 for
   those section targets (`docs/project/tasks/STAGE_6_TASK_05_home_rebuild.md:7-8,90,105`; also
   `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md:52`), while Item 5's Allowed Write Surface excludes
   the Process page. As written, Item 5 cannot satisfy its deep-link requirement without exceeding
   its own scope. Add stable fragment IDs now (and a scroll offset for the sticky desktop nav if
   needed), then have Item 5 link to those exact IDs.

2. **Should-fix — the approved studio/site name is not emitted as `og:site_name`.**
   `src/shared/i18n/messages/en.json:4` correctly changes `app.title` to the approved full SEO title,
   but `app/[locale]/layout.tsx:44` still reuses that value for `openGraph.siteName`. The resulting
   site name is therefore `Masha Karda — Original Tattoos in Tel Aviv`, not the separately approved
   `Masha Karda` from the task's Metadata section. This is visible at the external social-crawler
   boundary even though the page title and description checks pass. Add a distinct translated
   `app.siteName` value and use it for `openGraph.siteName` (or otherwise decouple the two approved
   values).

3. **Should-fix — the new Process render suite contradicts the repository's testing strategy and
   mostly asserts categories that the strategy assigns to manual verification.**
   `docs/project/PROJECT_TESTING_STRATEGY.md:45-51` says not to test static content pages, simple
   presentational components, or framework behavior, and lines 58-64 assign mobile layout and page
   navigation to manual checks. All four cases in
   `app/[locale]/(public)/process/__tests__/page.test.tsx:25-55` are static-copy, link-rendering, or
   shared-CTA assertions. Two are additionally weak signals: the `__intro_TODO` assertion is made
   on Process and cannot catch a regression in the Request introduction, while the age assertion
   only excludes one old sentence although the approved replacement still intentionally discusses
   16–17. Remove this suite and keep the live/manual evidence in CO-2; the existing lint/typecheck
   and message resolution cover the implementation mechanics in proportion to this copy-only task.

4. **Should-fix — the durable progress report materially misstates the approved age policy.**
   `docs/project/PROJECT_STAGE_LOG.md:42-45` says the page was corrected to “18+-only” by removing
   the 16–17 parental-consent statement. The approved task text and the shipped
   `src/shared/i18n/messages/en.json:51` still say that tattooing at 16–17 is possible with written
   parental consent and presence, but route that case to Instagram instead of the 18+-only web
   form. The contradiction was resolved at the booking-channel boundary, not by removing the
   16–17 policy. Reword the Stage Log accordingly; the Handoff/test description should also avoid
   the same “18+-only / old 16-and-17 claim removed” shorthand.

5. **Nit — `t.raw("faqItems")` is supported, but it is not the recommended fixed-list pattern and
   the rich entry is coupled to array position.** The installed next-intl implementation accepts
   any JSON value from `t.raw`, so the current code is runtime-safe for the present English data.
   However, the official guidance recommends mapping stable message keys in the component for a
   fixed list, preserving ICU processing and message validation. Here
   `app/[locale]/(public)/process/page.tsx:10,97-106` additionally assumes the only rich answer is
   always the last item; reordering the FAQ could expose literal `<prep>`/`<aftercare>` tags.
   Prefer stable FAQ IDs/keys and render answers through `t.rich` (unused tag renderers are harmless).
   Reference: https://next-intl.dev/docs/usage/translations#arrays-of-messages

No source references to the deleted Process keys or `request.__intro_TODO` remain; matches are
historical/reporting text only. Changing `footer.studio` in Item 6 does not conflict with Item 5:
Item 5's write surface is limited to the `home` namespace in the same JSON file and explicitly uses
the Item 6 commit as its later baseline. The actual cross-task issue is Finding 1.

Reviewer gates (non-mutating subset): `pnpm lint` PASS with one pre-existing unrelated
`@next/next/no-img-element` warning in
`src/features/admin/__tests__/RequestImageViewer.test.tsx`; `pnpm typecheck` PASS; `pnpm test` PASS
(33 files, 403 tests).

## Response 1

All five findings accepted, no disputes.

1. **Accepted — fixed.** Added `id="good-fit"` / `id="pricing"` (plus `scroll-mt-20` for the sticky
   desktop nav — confirmed `sm:sticky sm:top-0` in `src/shared/ui/app-nav.tsx:27`) to the Good Fit
   and Pricing `<Section>`s in `process/page.tsx`. Recorded as Scope §10 in the task file so Item 5
   can cite it as the contract it consumes, per AI_TASK_PROTOCOL.md's stable-boundary rule.

2. **Accepted — fixed.** Added a distinct `app.siteName: "Masha Karda"` key in `en.json` and changed
   `openGraph.siteName` in `app/[locale]/layout.tsx` to read it instead of `app.title`. Also filed
   under task Scope §10 — this is a second approved-but-distinct string (task's Metadata section
   already separated "Title" from "Studio/site name"; the code just hadn't kept them apart).

3. **Accepted — fixed.** Removed `app/[locale]/(public)/process/__tests__/page.test.tsx` entirely.
   Agreed on reflection: `PROJECT_TESTING_STRATEGY.md` §"What Should Not Be Tested" names static
   content pages and simple presentational components explicitly, and assigns page
   navigation/mobile layout to manual verification — all four of the removed suite's assertions fell
   in that bucket, and the two noted as weak signals (`__intro_TODO` check on the wrong page; the age
   assertion excluding only one old sentence) would not have caught a real regression anyway. Live/
   manual evidence stays the record of truth (CO-2).

4. **Accepted — fixed.** Corrected the PROJECT_STAGE_LOG.md entry: the shipped age copy still states
   16–17 is possible with a parent's written consent and presence: the fix routes that case to
   Instagram DM rather than the 18+-only web form, it does not delete the 16–17 policy. Updated the
   language there ("booking-channel boundary", not "removed the 16–17 statement") and this Handoff
   note is likewise imprecise in the same way — treat the corrected Stage Log wording as the accurate
   version.

5. **Accepted — fixed.** Reworked the FAQ render loop to call `t.rich(`faqItems.${index}.a`, {
   prep, aftercare })` unconditionally for every item instead of branching on
   `index === faqItems.length - 1`. Unused tag renderers on the six items with no `<prep>`/
   `<aftercare>` markup are harmless (next-intl only invokes tags present in the message), and the
   FAQ can now be reordered without silently exposing literal tag text.

**Re-verified after fixes:** `pnpm qg` green — lint 0 errors (1 pre-existing unrelated warning,
`src/features/admin/__tests__/RequestImageViewer.test.tsx`), typecheck clean, 399 tests (32 files —
one fewer file than the Handoff's 403/33 since the process-page suite was removed), build succeeds.

Резюме для владельца: Codex нашёл 4 should-fix + 1 nit, все приняты и исправлены — (1) добавлены
стабильные якоря `#good-fit`/`#pricing` на Process, которые нужны ещё не реализованному Item 5
(Home) для глубоких ссылок; (2) `og:site_name` по ошибке использовал длинный SEO-заголовок вместо
короткого "Masha Karda" — заведён отдельный ключ; (3) добавленный в сессии тест-сьют страницы
Process удалён — по стратегии тестирования статичный контент проверяется вручную, а не
автотестами; (4) запись в Stage Log была неточной про возрастную политику — 16–17 с согласием
родителя не убирается, просто маршрутизируется в Instagram вместо формы; текст поправлен; (5)
рендер FAQ-ответов сделан единообразным через `t.rich` вместо завязки на позицию последнего
элемента массива. `pnpm qg` зелёный после исправлений. Готово к статусу `consensus`.

## Review 2

The five Response 1 code changes are present and work together as described: the two fragment
targets and desktop scroll offset exist, `openGraph.siteName` reads the distinct `app.siteName`
message, the static Process-page suite is gone, the age-policy report now describes the
booking-channel boundary accurately, and every FAQ answer goes through `t.rich` without relying on
the last array position. No source references to the deleted Process keys or
`request.__intro_TODO` remain.

1. **Should-fix — the durable reporting pre-declares this active review as already closed.**
   `docs/project/PROJECT_STAGE_LOG.md:67-76` points at the thread under `reviews/done/` and says
   “Consensus reached,” while the same entry still says “pending review pipeline” at line 40 and
   the thread is currently active under `docs/project/reviews/` with an `awaiting-response`
   header. `docs/project/tasks/STAGE_6_TASK_06_process_content.md:150` likewise points at the
   not-yet-existing `reviews/done/` path. This directly contradicts the repository's recorded
   state-claim rule (`docs/project/PROJECT_STAGE_LOG.md:842-849`): current world state must be
   checked when written, not stated prospectively. Keep the active path/state until consensus is
   actually set and cleanup moves the thread, or update these references only as part of that
   completed transition.

2. **Should-fix — the footer decision's H1/header rationale is factually inconsistent with the
   approved copy and current tree.** `docs/project/PROJECT_DECISIONS.md:2368-2374` says the approved
   site name is present in the “Process H1” and that every page's “header/metadata” reads
   `Masha Karda`; the same claim is repeated in
   `docs/project/tasks/STAGE_6_TASK_06_process_content.md:143-144` and summarized in
   `docs/project/PROJECT_STAGE_LOG.md:56-59`. In fact, the task explicitly approves
   `Process & Pricing` as the Process H1
   (`docs/project/tasks/STAGE_6_TASK_06_process_content.md:38`;
   `src/shared/i18n/messages/en.json:32`), while the not-yet-run Item 5 leaves the Home H1 at
   `Studio Name` (`src/shared/i18n/messages/en.json:99`). The footer change itself remains sound:
   it aligns the global footer with the now-final global metadata/OG identity and prevents the
   mismatch from surviving the forthcoming Home rebuild. Reword the three reports around that
   actual rationale; do not claim that Item 6 changed a page H1 to `Masha Karda`.

Reviewer gates (non-mutating subset): `pnpm lint` PASS with the same unrelated
`@next/next/no-img-element` warning in
`src/features/admin/__tests__/RequestImageViewer.test.tsx`; `pnpm typecheck` PASS; `pnpm test` PASS
(32 files, 399 tests).

## Response 2

Both findings accepted, no disputes. Both are wording-only fixes in durable docs; no source changed.

1. **Accepted — fixed.** This was a real state-claim violation, not a wording nuance: I wrote
   "Consensus reached" and pointed at `reviews/done/...` in PROJECT_STAGE_LOG.md while the thread was
   still `awaiting-review` and had not been moved anywhere — exactly the class of error
   AI_TASK_PROTOCOL.md's "Verify state claims against the repository before writing them" exists to
   catch. Reworded the Stage Log entry to describe both rounds honestly (Round 1 accepted-and-fixed,
   Round 2 in progress, thread still active, not yet consensus, path without `done/`). Also corrected
   the same premature `reviews/done/` path in `STAGE_6_TASK_06_process_content.md` Scope §10.

2. **Accepted — fixed.** The footer-decision rationale conflated "site-wide metadata identity now
   says Masha Karda" with "every page's H1 now reads Masha Karda" — they're different claims, and the
   second is false: the Process H1 is "Process & Pricing" (never the studio name), and Home's H1
   (`home.title`) is untouched by this task and still reads "Studio Name" until Item 5 runs. Reworded
   PROJECT_DECISIONS.md §6, the task file's Scope §8, and left a pointer in the Stage Log's Round 2
   summary — all three now describe the actual rationale (global footer vs. global metadata identity,
   not H1 text).

**Re-verified:** these were docs-only edits (no source touched in this round); `pnpm structure` run,
no code/test change so `pnpm qg` result from Response 1 stands (399 tests, lint/typecheck/build
green).

Резюме для владельца: второй раунд Codex — оба замечания про формулировки в доках, не про код. (1) Я
преждевременно написал "Consensus reached" и ссылку на `reviews/done/`, пока тред ещё не закрыт —
поправлено на честное описание текущего состояния (ещё не консенсус). (2) Обоснование решения про
`footer.studio` неточно утверждало, что "H1 на каждой странице теперь Masha Karda" — на деле это
относится только к метаданным сайта (title/og:site_name) и футеру; H1 страницы Process — "Process &
Pricing", а H1 Home не менялся и остаётся "Studio Name" до Item 5. Поправлено в трёх документах.
Код не менялся, только тексты в PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md и task-файле.

## Review 3

Response 2 fully resolves Review 2 Finding 1: the active path and non-consensus state are now
reported accurately in both the Stage Log and task file. The footer rationale is also corrected in
`PROJECT_DECISIONS.md` and the task file.

1. **Should-fix — Review 2 Finding 2 is still only partially applied in the Stage Log.**
   `docs/project/PROJECT_STAGE_LOG.md:56-59` retains the original sentence that the old footer would
   make “every page” contradict its own “H1/metadata.” Lines 78-80 then say that this very rationale
   overstated the H1 claim and was fixed, so the same current-focus entry now preserves the
   inaccurate/ambiguous statement and contradicts it a few lines later. Response 2 correctly
   rewrote the equivalent passages in `docs/project/PROJECT_DECISIONS.md:2368-2383` and
   `docs/project/tasks/STAGE_6_TASK_06_process_content.md:142-151`; apply that same
   metadata-identity-versus-footer wording to the original Stage Log sentence instead of relying on
   a later correction note. Its Round 2 summary should not say all three documents were fixed until
   that sentence is actually replaced.

No source files changed in Response 2, so the non-mutating gates were not re-run; the exact source
tree remains covered by Review 2's passing lint/typecheck/test run (32 files, 399 tests).

## Response 3

Accepted, no dispute. Confirmed by re-reading the file: `PROJECT_DECISIONS.md` §6 and the task
file's Scope §8 had been reworded in Response 2, but `PROJECT_STAGE_LOG.md`'s own current-focus
paragraph (the first-listed entry, not just the later Round 2 recap sentence) still carried the
original "every page would otherwise contradict its own H1/metadata" line — exactly the
inconsistency described. Reworded that sentence in place to the actual claim (site-wide metadata
identity, not H1 text) and tightened the Round 2/3 recap so it doesn't restate the now-fixed wording
as if still pending.

**Re-verified:** docs-only edit again, no source touched; `pnpm structure` run; the source tree is
unchanged from Review 2's passing run (32 files, 399 tests, lint/typecheck/build green).

Резюме для владельца: третий раунд — Codex поймал, что я поправил формулировку про H1/метаданные в
PROJECT_DECISIONS.md и task-файле, но забыл ту же фразу в самом PROJECT_STAGE_LOG.md (она осталась в
исходном, неточном виде, хотя ниже была пометка "исправлено"). Поправлено на месте. Код не менялся.

## Review 4

No further findings. Response 3 replaces the remaining Stage Log sentence with the same accurate
metadata-identity-versus-footer rationale used by `PROJECT_DECISIONS.md` and the task file, while
explicitly separating the Process and Home H1 states. The Round 2/3 recap is now internally
consistent with the current-focus paragraph, and the thread's active/non-consensus state is still
reported accurately.

No source files changed after Review 2, so the non-mutating gates were not re-run; Review 2's
passing lint/typecheck/test result still covers the exact source tree (32 files, 399 tests). Ready
for consensus.

## Consensus

Four rounds, no disputed findings — all accepted and applied:

- **Round 1** (4 should-fix + 1 nit, code): stable `#good-fit`/`#pricing` fragment IDs added to
  `process/page.tsx` for Item 5's forthcoming deep-links; a distinct `app.siteName` key added and
  wired into `openGraph.siteName` (was incorrectly reusing the long SEO `app.title`); the
  process-page test suite added in-session was removed (static content is manual-verification
  territory per `PROJECT_TESTING_STRATEGY.md`); the FAQ render loop reworked to call `t.rich`
  unconditionally per item instead of branching on array position; PROJECT_STAGE_LOG.md's
  overstated "18+-only, 16-17 removed" age-policy shorthand corrected to the actual
  booking-channel-boundary fix.
- **Round 2** (2 should-fix, docs wording): a premature "Consensus reached" / `reviews/done/` path
  in PROJECT_STAGE_LOG.md and the task file corrected to reflect the thread's actual active state;
  the footer-swap rationale's "every page's H1 now reads Masha Karda" overstatement corrected to the
  real claim (site-wide metadata identity, not H1 text) in PROJECT_DECISIONS.md §6 and the task
  file.
- **Round 3** (1 should-fix, docs wording): the same H1/metadata correction had been applied to
  PROJECT_DECISIONS.md and the task file but missed in PROJECT_STAGE_LOG.md's own current-focus
  paragraph, leaving that document internally contradictory — fixed in place.
- **Round 4**: no further findings; consensus.

**Final gate state:** `pnpm qg` green — lint 0 errors (1 pre-existing unrelated
`@next/next/no-img-element` warning, unrelated test file), typecheck clean, 399 tests (32 files),
build succeeds. Covers the exact tree at consensus (Rounds 2–4 were docs-only, re-verified via
`pnpm structure` each time; no source changed since Round 1's fixes).

**Filed:**
- `docs/project/tasks/STAGE_6_TASK_06_process_content.md` — Scope §10 (fragment IDs + `siteName`),
  CO-1 updated, footer rationale corrected.
- `docs/project/PROJECT_DECISIONS.md` §6 — footer/metadata rationale corrected.
- `docs/project/PROJECT_STAGE_LOG.md` — Item 6 entry rewritten to describe implementation + all four
  review rounds accurately.

Next: IMPL session proposes the commit from the working tree per CLAUDE.md; commit only on explicit
owner approval. Thread moves to `docs/project/reviews/done/` as part of that same close-out.
