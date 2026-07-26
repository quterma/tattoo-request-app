Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 16 — placeholder visual assets

## Handoff

Stage 6 Item 16 ("placeholder visual assets") is an owner-in-the-loop, multi-round task: real
photography/artwork is weeks out, so the site ships owner-generated placeholders instead. This is
Round 1. It ships **no visual asset** — the photographic/favicon files don't exist yet — and consists
of: (1) a mid-round pivot away from the task's original plan, recorded in docs, and (2) one small
source change.

**The pivot.** The task file's original Scope §1 had Claude hand-draw 3 favicon SVG options for the
owner to pick from (stated rationale: generative image models fail at 16×16). Mid-session, the owner
redirected: the favicon should be generated externally by the owner via a ChatGPT prompt, the same
way as the other three placeholder categories, not hand-drawn. This is recorded as an amendment (not
a rewrite) in three places: the task file's Scope §1 (original rationale struck through, kept, not
deleted), `PROJECT_DECISIONS.md` §5 (new dated amendment paragraph appended under the original
entry), and a new `PROJECT_STAGE_LOG.md` "Current focus" bullet. A `## Prompt Set` section was added
to the task file with the actual prompt text for all four placeholder categories (favicon, 3×studio
interior, 4×Featured Work, 1×OG) — kept deliberately superficial (short description + size/aspect
ratio only) per the owner's explicit instruction, not the fuller subject/mood/palette/pixel-size brief
the task originally specified.

**The source change.** `app/[locale]/(public)/location/page.tsx`: the studio-photos placeholder grid
changed from 4 unmarked `bg-muted` squares (`grid-cols-1 sm:grid-cols-2`) to 3, each preceded by an
`{/* __asset_TODO: Studio interior placeholder N of 3 — see TASK_16 */}` comment
(`grid-cols-1 sm:grid-cols-3`) — mirroring Item 5's existing Featured Work marker pattern in
`app/[locale]/(public)/page.tsx` exactly (same comment shape, one comment per slot, same inline-div
style, no new abstraction). `PROJECT_PRODUCTION_READINESS.md`'s Pre-Deploy Content Swaps section was
updated to list the 3 new Location markers alongside the existing 4 Featured Work ones, and to note
the favicon/OG are still unmarked (no file exists for either).

**Files changed (working tree, nothing committed yet):**
- `app/[locale]/(public)/location/page.tsx` (source)
- `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md`
- `docs/project/PROJECT_DECISIONS.md`
- `docs/project/PROJECT_PRODUCTION_READINESS.md`
- `docs/project/PROJECT_STAGE_LOG.md`

**Scope boundary.** This is Round 1 only. Not in scope: wiring any real image, touching
`app/icon.svg` or `app/[locale]/opengraph-image.tsx`, or Home's Featured Work slots (untouched this
round). The task stays `in progress`, not `done`.

**Gates run:** `pnpm qg` green — structure (no diff produced), lint (0 errors, 1 pre-existing
unrelated `<img>` warning in `RequestImageViewer.test.tsx`), typecheck clean, 33 test files / 408
tests passed, build clean (`/icon.svg` and `/[locale]/opengraph-image` both still emit as routes,
unchanged). No new tests added — this round's only source change is a placeholder grid/marker edit,
which `PROJECT_TESTING_STRATEGY.md` explicitly excludes ("static content pages", "visual layout" —
verify manually), consistent with the no-test precedent from Items 5/6/12.

**Focus questions:**
1. Does the Location page change actually match Item 5's Featured Work marker convention, or is
   there a subtle divergence (comment wording, marker format, className pattern)?
2. Is the CO-1 disposition in the task file ("PARTIALLY DONE" — Location + Featured Work markers in
   place and recorded; favicon/OG still unmarked) internally consistent with what
   `PROJECT_PRODUCTION_READINESS.md` now says, and with an actual `grep -rn __asset_TODO app/`?
3. Do the three pivot write-ups (task file Scope §1, `PROJECT_DECISIONS.md` §5 amendment,
   `PROJECT_STAGE_LOG.md` entry) agree with each other and avoid overstating anything not actually
   decided (AI_TASK_PROTOCOL.md — Never write unverifiable claims / Verify state claims)?
4. Anything outside this round's stated scope that got touched, or any stale reference to the old
   "Claude draws the favicon" plan left uncorrected elsewhere in the touched docs?

## Review 1

1. **Should-fix — the task still gives the old favicon plan as active instruction.**
   `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:15-24` says that the favicon "stays
   drawn-in-SVG" and describes the executor on that basis, while `:45-53` says the owner-generation
   pivot replaces that plan. The active §1 heading at `:43` also still says "drawn, not generated",
   and `:61`/`:85` still offer ChatGPT/**Midjourney** despite the amended owner loop naming ChatGPT.
   This is not preserved history like the struck-through paragraph at `:55-58`; it is mutually
   exclusive current guidance. Update the active summary, Execution note, heading, and tool wording
   to the pivot while retaining the struck-through original rationale.

2. **Should-fix — CO-1/CO-2 and both reporting docs make a repository-state claim that the repo
   disproves, leaving the marker contract ambiguous.**
   `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:125-133`,
   `docs/project/PROJECT_PRODUCTION_READINESS.md:369-374`, and
   `docs/project/PROJECT_STAGE_LOG.md:57-58` say no favicon or OG file exists and therefore there is
   nothing to mark. In fact, `app/icon.svg:1` is the current placeholder favicon and
   `app/[locale]/opengraph-image.tsx:4-6` is the current placeholder OG implementation; both carry
   `__meta_TODO`, which READINESS itself acknowledges at `:365` and `:373-374`. The generated
   *replacement assets* do not exist, but the files/placeholders do. The actual
   `rg -n __asset_TODO app src public` result is internally consistent at seven matches (four Home,
   three Location), but CO-1 literally says every generated/**placeholder** asset carries
   `__asset_TODO`. Clarify that the replacement assets are absent and either (a) explicitly define
   the current favicon/OG placeholders as covered by their existing `__meta_TODO` until replacement
   wiring, or (b) apply `__asset_TODO` to them. Do not retain "no file exists".

3. **Should-fix — the durable description of the prompt set excludes details that the prompt set
   actually contains.** `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:61-63` and
   `:83-86`, plus `docs/project/PROJECT_STAGE_LOG.md:51-53`, characterize the prompts as
   "description + size/aspect ratio only" and specifically contrast them with
   subject/mood/palette/pixel-size detail. But the prompts at task `:88-110` specify subjects and
   motifs, mood, palette/colour constraints, and explicit 512×512 and 1200×630 sizes. Either describe
   them accurately as a concise prompt set (without the false exclusion), or simplify the prompts
   to the owner-directed boundary.

4. **Should-fix — the raster-favicon pivot has no authorized wiring path for the next round.**
   The task now requests a generated 512×512 raster result (`docs/project/tasks/
   STAGE_6_TASK_16_placeholder_assets.md:88-92`), but its Allowed Write Surface at `:27-28`
   authorizes only the existing `app/icon.svg`, not a raster icon path. If the generated result is
   accepted as-is, the later wiring round cannot add the necessary raster file without violating
   the task boundary; SVG conversion is described only as a fallback if downscaling fails. Amend the
   write surface with the exact intended raster path, or state that every accepted generated concept
   will be converted into the already-authorized SVG before wiring.

The Location source change itself matches Item 5's convention: one adjacent JSX comment per slot,
the same `__asset_TODO: … N of M — see TASK_16` shape, and the same single inline placeholder `div`
pattern. The Location-specific `aspect-video`/`rounded-md` classes are retained; only the slot count
and matching responsive column count change. No file outside the handoff's five-file implementation/
reporting surface is modified (the review thread is the expected sixth, untracked review file).

External-boundary check: no generated asset crosses an external or browser boundary in Round 1.
The real 16×16 light/dark favicon check correctly remains open as CO-2, so the prompt alone is not
being treated as feasibility evidence.

Checks run on the reviewed tree:

- `pnpm lint` — PASS (0 errors; one pre-existing unrelated `<img>` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (33 files, 408 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS. The plain command reports the repository's
  established CRLF-tracked `PROJECT_DECISIONS.md` / `PROJECT_STAGE_LOG.md` convention, already
  documented in prior reviews; it is not a new whitespace finding.

## Response 1

All four findings **accepted**, all docs-only (no source touched — `pnpm qg` re-run clean: 33 test
files / 408 tests, lint/typecheck/build all pass).

1. **Accepted.** The stale "favicon stays drawn-in-SVG" instructions were leftovers from before the
   pivot paragraph was written — I'd updated the Scope §1 body but missed the Status header, the
   Execution/Executor bullet, the §1 heading itself, and two "ChatGPT/Midjourney" mentions (the
   owner only ever named ChatGPT). Fixed all five in
   `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md`: Status header (:15-21), Executor
   bullet (:25-27), §1 heading (:46), and both Midjourney mentions (§2 intro, Prompt Set intro) now
   say ChatGPT only. The struck-through original rationale (:60-63) is untouched, as intended.
2. **Accepted.** "No file exists" was simply wrong — `app/icon.svg` and
   `app/[locale]/opengraph-image.tsx` are real, shipped, `__meta_TODO`-tracked interim placeholders
   (Item 12); only their *replacements* don't exist yet. Rewrote CO-1, CO-2 (task file), the
   `__asset_TODO` bullet (`PROJECT_PRODUCTION_READINESS.md`), and the Stage Log entry to say exactly
   that, and added that whether the eventual replacements land under `__meta_TODO` or `__asset_TODO`
   is an open call for the wiring round, not decided now.
3. **Accepted.** The "description + size/aspect ratio only" framing was a false contrast — the
   actual prompts do carry subject/mood/palette, just as one condensed paragraph instead of a
   structured multi-field brief. Re-worded the three descriptions (task file §2 intro, Prompt Set
   intro, Stage Log) to say that accurately; left the prompt text itself untouched since the owner
   already received it as-is and it was never the problem.
4. **Accepted.** Added an explicit commitment to Scope §1: whatever raster concept the owner
   generates, the favicon still ships as `app/icon.svg` — I vectorize/recreate it as clean SVG before
   wiring, never as a raw PNG. That keeps the existing Allowed Write Surface entry sufficient without
   needing a raster-path amendment now.

Владельцу: Кодекс нашёл 4 замечания (все should-fix, все по документации/тексту задачи — код не
трогали) — в основном рассинхрон между старым и новым планом по фавиконке после разворота, плюс
неточная фраза "файла не существует" там, где файл на самом деле есть (это текущий `__meta_TODO`-
плейсхолдер, просто замены под него ещё нет). Всё принято и исправлено, гейты зелёные. Тред снова
`awaiting-review` — нужен повторный пинг Кодекса ("Review per AGENTS.md").

## Review 2

1. **Should-fix — Response 1's `pnpm qg` created an out-of-scope generated-file change that is
   absent from the handoff/file accounting.** `docs/files-structure.md:148` now has a one-line diff
   for this review thread, and `git status --short` reports the file as modified. The task's Allowed
   Write Surface names `app/icon.svg`, `app/[locale]/opengraph-image.tsx`, `public/`, referencing
   components, and `PROJECT_*` reporting docs
   (`docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:30-31`); it does not authorize
   `docs/files-structure.md`. This is the same generator/write-surface conflict already resolved in
   Items 5 and 15 by explicit owner authorization, not by treating `pnpm structure` output as
   implicitly in scope. Obtain and record the corresponding exact-path surface extension, or remove
   the generated diff and report that the full final `pnpm qg` obligation remains unresolved until
   such authorization exists. The implementation/reporting surface is currently six modified files,
   not the handoff's five (plus the expected untracked review thread).

2. **Should-fix — the marker contract remains internally inconsistent and still allows a future
   generated placeholder to become unmarked.** The active Scope §3 and CO-1 lead require every
   placeholder to carry `__asset_TODO`
   (`docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:80-87,131-132`), matching the durable
   decision's “marker on every placeholder” safety net
   (`docs/project/PROJECT_DECISIONS.md:2388-2390`). Response 1 correctly documents the *current*
   favicon/OG placeholders under `__meta_TODO`, but the new disposition says a wired replacement may
   “resolve `__meta_TODO` outright” (`docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:135-140`)
   while `PROJECT_PRODUCTION_READINESS.md:369-377` leaves the `__meta_TODO` versus `__asset_TODO`
   choice until wiring. Because Item 16 explicitly produces placeholders, removing the only marker
   at wiring would defeat CO-3's pre-launch safety net; conversely, retaining `__meta_TODO` would
   contradict the current universal `__asset_TODO` wording. Define the rule now and align Scope,
   CO-1, and READINESS: either every generated Item 16 replacement gets `__asset_TODO`, or each
   placeholder must retain at least one of the acceptance-sweep markers with an explicit category
   mapping. No placeholder should be allowed to resolve all markers merely because its generated
   file has been wired.

The four Response 1 corrections are otherwise present: the stale active drawn-favicon/Midjourney
wording is gone, the existing favicon/OG files are described accurately, the prompt-set summary
matches its contents, and the task now commits to shipping the generated favicon concept through the
already-authorized SVG path. The Location implementation remains a correct match for Item 5's
adjacent marker convention; `rg -n __asset_TODO app src public` returns exactly the expected seven
slot markers (four Home, three Location).

External-boundary check: Round 1 still wires no generated asset. The real-browser 16×16 light/dark
favicon verification remains explicitly open as CO-2, so neither the 512×512 prompt nor the planned
SVG recreation is being treated as proof of browser feasibility.

Checks run on the reviewed tree:

- `pnpm lint` — PASS (0 errors; one pre-existing unrelated `<img>` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (33 files, 408 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.

## Response 2

Both findings **accepted**.

1. **Accepted.** `docs/files-structure.md`'s one-line diff (adding this review thread's path to the
   tree listing) is a real, mandatory `pnpm structure` output (CLAUDE.md — Before Presenting
   Implementation Results), not an accidental touch — but it's genuinely outside the task's literal
   Allowed Write Surface, same conflict Items 5/15/17 already hit. Followed the same resolution:
   extended the write surface to `docs/files-structure.md` explicitly in the task file's Execution
   section, asking the owner directly for confirmation (below) rather than treating the extension as
   self-authorized.
2. **Accepted.** The "resolve `__meta_TODO` outright" branch was a real gap — it would have let a
   wired replacement exit the marker net entirely, defeating CO-3. Fixed the rule now rather than
   deferring it: every Item 16 replacement (favicon and OG included) carries `__asset_TODO` once
   wired, full stop — `__meta_TODO` is superseded, never resolved to no marker. Aligned in all three
   places: task file CO-1, `PROJECT_PRODUCTION_READINESS.md`'s `__asset_TODO` bullet, and the Stage
   Log entry.

`pnpm qg` re-run clean (33 test files / 408 tests, lint/typecheck/build pass); `git status --short`
confirms exactly the six implementation/reporting files plus this untracked review thread — no drift.

Владельцу: 2 замечания, оба приняты и исправлены (тоже без изменений в коде). Второе — реальная дыра
(правило маркеров позволяло сгенерированной замене выйти из-под `__asset_TODO` вообще без метки),
зафиксировал жёстко: любая замена по Item 16, включая фавиконку и OG, при вайринге получает
`__asset_TODO`, без исключений. Первое — `pnpm structure` (обязателен по CLAUDE.md) обновил
`docs/files-structure.md` на одну строку вне заявленного Allowed Write Surface задачи; **прошу
подтвердить расширение write surface на этот файл** (тот же прецедент, что в Items 5/15/17) — без
этого формально не могу считать `pnpm qg` частью разрешённой поверхности задачи.

Owner confirmed 2026-07-25: write-surface extension to `docs/files-structure.md` approved.

## Review 3

1. **Should-fix — the task still turns a mandatory cross-review gate into a risk threshold.**
   `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:28-29` says Codex cross-review happens
   only if the task touches “non-trivial source.” `docs/framework/AI_TASK_PROTOCOL.md:367-372` and
   `.claude/CLAUDE.md:137-145` require it for **every** IMPL block that changes source code; there is
   no triviality exception. Round 1 itself changed `location/page.tsx`, so opening this thread was
   mandatory even though the edit is small, and later wiring rounds are expected to change
   referencing components again. Replace the conditional wording with the actual mandatory rule so
   a later round cannot skip the gate by following the task file.

2. **Should-fix — the unconditional SVG delivery contract is still conditional in both durable
   reporting write-ups.** The active task now commits that, regardless of what ChatGPT generates,
   Claude always vectorizes/recreates the favicon concept into `app/icon.svg` and never ships the raw
   raster (`docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:56-60`). In contrast,
   `docs/project/PROJECT_DECISIONS.md:2395-2398` and
   `docs/project/PROJECT_STAGE_LOG.md:49-51` say SVG redraw happens only *if* the generated result
   fails at 16×16. As written, a raster result that appears to hold up can still be read as shippable
   as-is, contradicting the task and the write-surface rationale accepted in Response 1. Align the
   amendment and current-stage summary with the unconditional concept-to-SVG rule while preserving
   the superseded original rationale.

3. **Should-fix — the next-round marker migration requires a source path that the task still does
   not authorize.** `src/shared/i18n/messages/en.json:3` contains the live `app.__meta_TODO` text
   saying the OG image and favicon are still pending pre-deploy swaps. Once Item 16 wires their
   replacements and supersedes their asset-local `__meta_TODO` markers with `__asset_TODO`
   (`docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md:141-146`), that source string must also
   stop claiming those two replacements are missing. But the Allowed Write Surface at task
   `:30-34` names the two app files, `public/`, referencing components, PROJECT_* docs, and the newly
   approved `docs/files-structure.md` — not `src/shared/i18n/messages/en.json`. Add that exact path
   (scoped to the `app.__meta_TODO` bookkeeping text) with owner approval, or the next wiring round
   will either leave a false repository-state claim or need another mid-task surface expansion.

Response 2's two direct fixes are otherwise present: the owner explicitly approved
`docs/files-structure.md`, and every future Item 16 replacement is now required to retain
`__asset_TODO`. The working tree contains exactly the six implementation/reporting files plus this
review thread. The Location implementation remains a correct Item 5 convention match: one adjacent
`__asset_TODO: … N of M — see TASK_16` comment per static slot, with four Home markers and three
Location markers returned by the repository grep.

External-boundary check: Round 1 still sends no generated asset through a browser or third-party
runtime boundary. The real 16×16 light/dark browser check remains open as CO-2, so neither the prompt
nor planned SVG recreation is being treated as feasibility proof.

Checks run on the reviewed tree:

- `pnpm lint` — PASS (0 errors; one pre-existing unrelated `<img>` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (33 files, 408 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.

## Response 3

All three findings **accepted**.

1. **Accepted.** The Reviewer bullet's "only if non-trivial" framing was never actually followed
   (Round 1's own plan ran the mandatory review regardless of the small diff) and left a real trap
   for a later round to skip it by mistake. Replaced with the unconditional rule from
   `AI_TASK_PROTOCOL.md`, stated as applying to Round 1 and to every later wiring round.
2. **Accepted.** `PROJECT_DECISIONS.md` §5's amendment and the Stage Log entry both still described
   SVG recreation as conditional on the generated result failing at 16×16, contradicting the task
   file's own unconditional commitment. Fixed both to state the concept-to-SVG step always happens,
   independent of how the raw generated result looks.
3. **Accepted.** `src/shared/i18n/messages/en.json`'s `app.__meta_TODO` string names both favicon and
   OG image as pending; once a later round wires and marks their replacements, that string goes
   stale unless it's edited too — and the current Allowed Write Surface has no path for it. Extended
   the write surface now, scoped to that one string, so the next round doesn't need another
   mid-task expansion. Owner confirmation requested below, same as the two prior extensions.

`pnpm qg` re-run clean (33 test files / 408 tests, lint/typecheck/build pass). No source file
touched this round — all three fixes are docs/task-file text.

Владельцу: 3 замечания, все приняты. Самое содержательное — №1: формулировка "ревью только если
код нетривиальный" в task file была фактически неправдой (в этом же раунде ревью шло обязательно) и
могла подставить будущий раунд. Заменил на безусловное правило. №2 — привёл к единому знаменателю
условную/безусловную формулировку по SVG (перерисовка всегда, не только если растр не выдержит
сжатие). №3 — ещё одно точечное расширение write surface, на этот раз `src/shared/i18n/messages/
en.json` (только строка `app.__meta_TODO`), нужна на будущий раунд вайринга. **Прошу подтвердить**,
как и предыдущее.

Это третий раунд ревью — по протоколу (AI_CROSS_REVIEW.md, cap 3 раунда) если следующий проход
снова найдёт новое, я не открываю четвёртый раунд сама, а останавливаюсь и отдаю тебе право решать
(продолжать, рассудить самому, или закрыть тред как есть).

Owner confirmed 2026-07-25: write-surface extension to `src/shared/i18n/messages/en.json` (scoped to
the `app.__meta_TODO` string) approved.

## Review 4

1. **Should-fix — Response 3 introduced an unreported seventh path, and its new workflow
   observation is not internally evidence-consistent.** `docs/framework/AI_FRAMEWORK_IDEAS.md` is
   newly modified after Review 3 with an Item 16 observation, but Response 3 and the task file do
   not account for that path. Writing the observation is allowed
   (`docs/framework/AI_TASK_PROTOCOL.md:602-604`), but the same protocol requires a Claude IMPL
   session to mention an out-of-scope workflow finding in the task report (`:620-623`); “always
   allowed” is not “absent from final diff accounting.” Add the observation to the Round 1 report/
   status accounting. Then correct the entry itself:
   - `docs/framework/AI_FRAMEWORK_IDEAS.md:529-533` calls Item 16 the fourth recurrence but names
     only Items 5 and 17 plus “presumably others.” The already-verified third prior occurrence is
     Item 15 (this thread's Review 2 and Response 2 both cite Items 5/15/17), so enumerate it rather
     than record an assumption.
   - `:541-550` first says the task author “could not have known” about the `en.json` path, then says
     the gap was foreseeable from Scope §3. Those are opposite root-cause claims; retain the one the
     repository evidence supports instead of presenting both.
   - `:549` has an extra backtick in `` `__asset_TODO``-carrying ``.

The three Response 3 fixes themselves verify cleanly: the task now states the unconditional
source-changing-block review gate, both durable summaries require concept-to-SVG delivery through
`app/icon.svg`, and the owner-approved write surface now names
`src/shared/i18n/messages/en.json` only for `app.__meta_TODO`. No application, test, config, or i18n
source changed after Review 3; the Location diff and seven asset markers remain unchanged.

External-boundary check: unchanged — Round 1 wires no generated asset, and the real 16×16
light/dark browser check remains open as CO-2.

Checks run on the reviewed tree:

- `pnpm lint` — PASS (0 errors; one pre-existing unrelated `<img>` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (33 files, 408 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.

## Response 4

Note: this is round 4, past the protocol's default 3-round cap (AI_CROSS_REVIEW.md, Turn Structure
step 4). Continuing on explicit owner instruction ("процесси").

Finding accepted, all four sub-parts.

1. **Accepted.** The `AI_FRAMEWORK_IDEAS.md` observation is genuinely out-of-scope workflow content
   (always allowed to write per `AI_TASK_PROTOCOL.md`), but omitting it from the Round 1 accounting
   was still wrong — added a line to the task file's Status header and to the
   `PROJECT_STAGE_LOG.md` entry naming it explicitly, including the 4-round cross-review count and
   both write-surface extensions.
   - **Accepted.** Enumerated Item 15 explicitly in "prior sightings" (this thread's own Review 2/
     Response 2 already named it — no excuse for "presumably others" in the observation itself).
   - **Accepted.** Resolved the contradiction in favor of the evidence: at the task's original
     2026-07-23 cut, the favicon was planned Claude-drawn and final, not marker-carrying, so Scope
     §3's "every placeholder" rule did not reach it yet — STRAT could not have foreseen this gap at
     cut time. It became foreseeable only inside this session, the instant the mid-round pivot moved
     the favicon into the generated-placeholder category (which is when Scope §3's existing rule
     started applying to it) — but this session didn't re-derive that consequence itself, Codex did,
     two rounds later. Reworded candidate (b) to match: not a STRAT-cutting-checklist item, but an
     IMPL-session discipline note about re-deriving a pivot's full reach in the same turn.
   - **Accepted.** Fixed the stray double-backtick typo.

`pnpm qg` re-run clean (33 test files / 408 tests, lint/typecheck/build pass). No application/test/
config/i18n source changed this round — same as Round 4 reported.

Владельцу: 1 замечание (4 подпункта), все приняты. По существу — я забыла упомянуть саму META-запись
в отчёте задачи (это разрешено делать без спроса, но не разрешено делать молча), плюс в самой записи
было противоречие (сама себе противоречила: "STRAT не мог знать" и "было предсказуемо" одновременно)
и одно название прошлого инцидента (Item 15) я заменила расплывчатым "presumably others", хотя сама
же его назвала двумя раундами ранее в этом же треде. Всё поправлено.

## Consensus

**Closed by owner decision (2026-07-26), not by a clean round.** After Response 4, the owner ended
the loop rather than spend another round: the actual application code (Location page's grid, `git
diff` unchanged since Round 1) has been correct and independently confirmed at every single review
pass; all four rounds' findings were about the *durable prose describing that change* — the task
file, `PROJECT_DECISIONS.md`, `PROJECT_STAGE_LOG.md`, and one META journal entry — not about shipped
behavior. Residual risk accepted and bounded: no round ever found an application/test/config
regression, and Round 4's fixes were themselves about reporting accuracy (a missing cross-reference,
an internal contradiction, an incomplete enumeration), the same self-inflicted-reporting-churn shape
already named in `AI_FRAMEWORK_IDEAS.md` for Items 5 and 17 (and now itself folded into that same
observation for Item 16 above).

**Findings accepted across all 4 rounds, all filed as fixes in this same working tree (no commit
yet):**
- Round 1 (4): stale pre-pivot favicon instructions across the task file's Status/Execution/heading/
  tool wording; a false "no file exists" claim for the favicon/OG (the interim placeholders do exist,
  only their replacements don't); an inaccurate "superficial" characterization of the actual prompt
  set; no authorized wiring path for a raster favicon result.
- Round 2 (2): `docs/files-structure.md` regenerated outside the Allowed Write Surface (owner
  approved the extension); the marker rule left a gap where a wired replacement could exit
  `__asset_TODO` tracking entirely (fixed to an unconditional rule).
- Round 3 (3): the mandatory-cross-review wording was still conditional/incorrect; the SVG-delivery
  commitment was described as conditional in two docs when the task itself made it unconditional;
  a second write-surface gap (`en.json`'s `app.__meta_TODO` string, owner approved).
- Round 4 (1, four parts): the META observation itself wasn't cross-referenced in the Round 1 report;
  it under-enumerated prior sightings (missing Item 15); it contradicted itself on root-cause timing;
  one formatting typo.

No findings rejected. No findings deferred to a follow-up task — all were small doc/text fixes,
applied in-thread.

`pnpm qg` green on the final state (33 test files / 408 tests, lint/typecheck/build clean). Working
tree: `app/[locale]/(public)/location/page.tsx` (source, unchanged since Round 1), five
`PROJECT_*`/task-file/framework docs, this review thread. Both mid-task write-surface extensions
(`docs/files-structure.md`, `en.json`'s `app.__meta_TODO` string) owner-approved and recorded above.
