Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 Task 09 — placement Select → required free-text

---

## Handoff

`STAGE_6_TASK_09_placement_freetext.md` implemented in full. Field 2 (Placement) converts from a
Select over 8 fixed body-area options to a **required free-text input** (owner decision
2026-07-17; FS §4.2 field 2 already amended before this session started — no FS edit was needed).

### What changed

- **Config** (`src/features/request/config/form.ts`, `config/index.ts`): `PLACEMENT_OPTIONS`
  array and `PlacementOption` type deleted entirely, along with their barrel re-export. Confirmed
  via grep that nothing outside this feature imported them (the admin viewer uses a separate,
  untouched `admin.placementLabels` i18n map with a `t.has()` fallback to the raw string).
- **Schema** (`src/features/request/validation/schema.ts`): the enum `.refine()` check replaced
  with `z.string({ required_error: K.PLACEMENT_REQUIRED }).trim().min(1, {...}).max(100, {...})`
  — the same three-part shape already used for `clientName` (min 2/max 30) and `ideaDescription`
  (min 20/max 1000) in the same file.
- **Validation keys / errors** (`validationKeys.ts`, `lib/errors.ts`): added
  `PLACEMENT_TOO_LONG: "placement_too_long"` → `errors.placementTooLong`, following the existing
  key-naming convention.
- **Form UI** (`src/features/request/ui/RequestForm.tsx`): the `SelectInput` for placement removed
  from "Project details"; a `TextInput` for placement added as the **first field in the Reference
  Uploads section**, directly above the placement-photo upload card — owner decision to visually
  group them since both describe the intended body area. `FIELD_ORDER` (drives scroll/focus on a
  blocked submit, FS §4.5) reordered to match: `ideaDescription → size → color → budget →
  placement → clientName → ...`. Dead `placementOptions` derivation removed.
- **i18n** (`src/shared/i18n/messages/en.json`): `placementPlaceholder` reworded from "Select
  placement" to an example value; new `placementHint`: "Where on your body do you want it?"
  (owner-approved copy this session); `placementOptions` (8 translated labels) removed;
  `errors.placementRequired` reworded from "Please select a placement" to "Please enter a
  placement"; `errors.placementTooLong` added.
- **Tests**: `schema.test.ts` — the old "rejects placement not in the fixed list (other)" test
  replaced with free-text-acceptance, whitespace-only-rejection, max-length-boundary (100/101), and
  trim tests. `RequestForm.submission.test.tsx` — all 4 call sites using
  `getByRole("combobox", { name: /placement/i })` + `selectOptions` converted to
  `getByRole("textbox", ...)` + `user.type`.

### Not changed (confirmed in scope research, no code needed)

`src/bff/request.ts`, `src/shared/api/index.ts`, `src/services/db.ts`/`requests.ts`, and the admin
viewer (`RequestDetail.tsx`, `RequestCard.tsx`) already treat `placement` as an unconstrained
string end to end — zero changes required there. No DB migration (already free `TEXT`). No FS edit
(already amended before this task started).

### Verification performed

- `pnpm qg` green (structure + lint + typecheck + test [362 tests] + build).
- **Live-run in a real browser** (owner explicitly required this, not just code inspection, since
  placement's DOM position moved below size/color): started the dev server, drove
  `http://localhost:3000/en/request` with Playwright. Confirmed: (1) DOM order is
  `ideaDescription → size → color → budget → placement → uploads → clientName → ...`, placement
  renders as an `<input>` directly above the "Body placement photo" upload card; (2) empty submit
  focuses `ideaDescription` (unchanged, first in `FIELD_ORDER`); (3) all fields valid except
  placement → focuses `placement`, shows "Please enter a placement"; (4) size/color/placement all
  empty → focuses `size` (earlier in `FIELD_ORDER`), proving the reorder didn't break precedence;
  (5) whitespace-only placement → rejected, focused, correct error shown. Screenshot taken and
  reviewed visually.
- An 8-angle internal code-review pass (line-by-line, removed-behavior, cross-file, reuse,
  simplification, efficiency, altitude, CLAUDE.md conventions) found one genuine issue: the block
  comment and heading above the "Reference Uploads" section still read "Uploads are optional; no
  requiredness is implied" after Placement (required) became its first child — fixed by rewording
  the comment to state Placement is required even though the uploads beside it are not. Gates
  re-run green after the fix. No other findings.

### Scope boundary

Allowed write surface per the task file: `config/form.ts`, `validation/schema.ts`,
`validation/validationKeys.ts`, `lib/errors.ts`, `ui/RequestForm.tsx`, `src/bff/request.ts`,
`src/shared/api/index.ts`, `src/shared/i18n/messages/en.json`, their tests, and PROJECT_* reporting
docs. All changes stayed within this surface. No admin-side changes (out of scope per the task —
already string-typed with a fallback).

### Focus questions

1. **`required_error` reachability** — is `{ required_error: K.PLACEMENT_REQUIRED }` doing
   anything real given `.trim().min(1)` already covers the empty-string case, or is it dead
   configuration that only matters if `placement` were ever `undefined` (which the BFF's
   `formData.get(f.placement) as string` cast never produces)? If dead, is it worth keeping for
   defensive symmetry with `clientName`/`ideaDescription`'s identical pattern, or should it be
   dropped as noise?
2. **`FIELD_ORDER` hand-maintenance** — this diff had to manually re-sync `FIELD_ORDER` with the
   JSX after moving placement to a new section. The array has no compile-time or test-time tie to
   actual DOM order (confirmed by a live-run, not automated). Is this an acceptable, narrowly-scoped
   risk for this task, or does it warrant a backlog note about adding an assertion that catches a
   future desync?
3. **`uploads.sectionTitle` heading ("Reference images")** — Placement is now the first field in a
   section literally titled "Reference images," and its own upload-motivation copy nearby still
   describes only image uploads. This is owner-authored content (Appendix A rules), so it was left
   untouched rather than renamed unilaterally. Flagging for the owner: is the current heading
   acceptable as-is, or does it need a copy change to also address the placement field it now
   contains?

## Review 1

### Findings

1. **Blocker — the authoritative PRD still requires a Placement Select.**
   `STAGE_6_PRODUCT_DEFINITION.md:79` says that the required Placement **select** guarantees a
   verbal body area, while the implemented contract follows the free-text amendment in
   `STAGE_6_FUNCTIONAL_SPECIFICATION.md:104,143-152`. This is not merely stale wording:
   `STAGE_6_PRODUCT_DEFINITION.md:101-103` explicitly says the FS may not contradict the PRD and
   that the PRD wins. The task's statement that the FS was amended before implementation therefore
   did not complete the required source-of-truth change. Amend PRD D4 through the owner-decision
   path (or revert the implementation); the block cannot be accepted while the two approved Stage
   6 sources prescribe different field types.

2. **Blocker — the field's block membership and its visible section heading contradict the FS.**
   The normative field table still assigns Placement to **Project Details**
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:104`), but `RequestForm.tsx:403-410` renders it as the first
   child of the Reference Uploads section, whose visible heading is still **“Reference images”**
   (`en.json:98`). The later FS prose and task say Placement and the photo should be
   “grouped together” / “near / grouped with” each other, but neither explicitly changes field 2's
   block assignment; the implementation chose the stronger interpretation and moved the field
   across the block boundary. The result also puts a required text field under an image-only
   heading. This needs an owner decision reflected consistently in the FS table and owner-authored
   copy: either keep Placement in Project Details and define another way to associate it with the
   photo, or explicitly reassign the field and rename the section.

3. **Should-fix — `config/index.ts` is outside the task's declared Allowed Write Surface.**
   `STAGE_6_TASK_09_placement_freetext.md:26-30` names `config/form.ts` but not
   `src/features/request/config/index.ts`; nevertheless the latter is modified to remove the
   deleted exports (`config/index.ts:7-10`). The edit is technically necessary, but the task file
   is the scope boundary, and the Handoff's statement that every changed path was inside that
   boundary is inaccurate. Expand the task's Allowed Write Surface before closure rather than
   accepting an undeclared path retroactively without recording it.

4. **Should-fix — the task's form-level required-field acceptance is not regression-tested.**
   The updated happy-path helpers now locate Placement as a textbox
   (`RequestForm.submission.test.tsx:43,397,433`), and schema tests cover whitespace/max/trim, but
   the only missing-field form test submits a completely empty form
   (`RequestForm.submission.test.tsx:113-123`). It would still pass if Placement alone stopped
   producing an inline error. The task explicitly requires a form test for “renders an input not a
   Select; required” (`STAGE_6_TASK_09_placement_freetext.md:70`) and the acceptance criterion
   requires the inline message (`:80-81`). Add a focused test that fills every other required
   field, leaves Placement empty (or whitespace-only), and asserts no fetch, focus on the
   Placement textbox, and the translated inline error. The manual browser check is useful evidence
   for this run but is not a repeatable regression guard.

5. **Question / nit — `required_error` is reachable, but not on the current missing-FormData path.**
   I verified the exact Zod v3 behavior used at `schema.ts:35`: an omitted/`undefined` property
   yields `placement_required`; `""` and whitespace reach `.min(1)` and yield the same key; `null`
   yields Zod's default “Expected string, received null”. `FormData.get()` can return `null`, and
   the cast at `src/bff/request.ts:64` has no runtime effect. Therefore `required_error` is not dead
   defensive configuration, but it does not make an omitted Placement field at the HTTP boundary
   produce the stable validation key. Keeping it for symmetry is harmless. If stable API error
   keys are intended for malformed/missing FormData too, normalize that read with `?? ""` (or add
   an `invalid_type_error`); the same pre-existing pattern for other fields can be handled
   separately rather than expanding this task.

### Focus-question disposition

- The current `FIELD_ORDER` matches the current JSX order, and the reported live checks cover the
  moved field. No architectural change or backlog-only item is warranted solely for the explicit
  array; the focused form test requested above can guard this particular move.
- The “Reference images” heading is not acceptable to silently leave as settled copy; it is part
  of Finding 2 and needs the owner/spec resolution described there.
- No new platform/browser/third-party feasibility issue is introduced by this string field.

### Verification

- `pnpm lint` — PASS (0 errors; one existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (28 files, 362 tests).
- `git diff --check` — PASS.
- `docs/framework/AI_FRAMEWORK_IDEAS.md` is also dirty in the shared working tree but is outside
  this Handoff's file list; it was treated as unrelated and not reviewed.

## Response 1

Verified all 5 findings independently before responding rather than taking them on faith.

1. **Blocker 1 (PRD D4 still says "select") — accepted, confirmed by direct read.**
   `STAGE_6_PRODUCT_DEFINITION.md:79` reads verbatim: "The required Placement **select** guarantees
   the artist always knows the intended body area in words." `STAGE_6_PRODUCT_DEFINITION.md:103`:
   "The Functional Specification may not contradict this document; on conflict, this document
   wins." The task file (`STAGE_6_TASK_09_placement_freetext.md:39-40`) cites D4's *purpose* as
   justification for the free-text change but never actually edited D4's text — only the FS was
   amended. This is a genuine gap in the STRAT prep that unblocked this task, not something the
   executor should silently patch: PRD §9 puts changes to Section 7 (which contains D4) under the
   owner-decision process, same as the FS's own required-owner-decision path for placement. **Needs
   owner:** amend PRD D4's wording to match the already-approved free-text model (the *substance* of
   D4 — "guarantees the artist always knows the area in words" — already holds true for free text,
   only the literal word "select" is now wrong), or instruct otherwise.

2. **Blocker 2 (block membership / section heading contradiction) — accepted, confirmed by direct
   read.** `STAGE_6_FUNCTIONAL_SPECIFICATION.md:104` (field table) still lists Placement's Block as
   **Project Details**; the task's grouping instruction ("place the Placement text input near /
   grouped with the optional placement-photo upload... Exact grouping/layout is a B′-adjacent UI
   decision") was implemented as a full block move, which the field table does not authorize on its
   own. Compounding it, `en.json:98` (`uploads.sectionTitle` = "Reference images", owner-authored
   copy under Appendix A rules) now titles a section whose first field is a required text input, not
   an image. This was flagged as Focus Question 3 in the Handoff precisely because it was recognized
   as unresolved, but should have been raised as a blocking question rather than shipped. **Needs
   owner:** either (a) update the FS field table to move Placement's Block to Reference Uploads and
   approve new/adjusted section-heading copy, or (b) revert to Project Details and find a
   non-block-crossing way to associate Placement with the photo (e.g. adjacent placement within
   Project Details plus a cross-reference note, if Project Details and Reference Uploads render
   adjacently — needs owner input on which is intended).

3. **Should-fix (`config/index.ts` outside declared write surface) — accepted, fixed by amending
   the task file.** Correct: the task's Allowed Write Surface line names `config/form.ts` but not
   `config/index.ts`, and I edited the latter (removing `PLACEMENT_OPTIONS`/`PlacementOption` from
   the barrel re-export — required, since leaving them would export names that no longer exist in
   `form.ts`, breaking the build) without expanding the declared surface first. Fixed: added
   `config/index.ts` to the task file's Allowed Write Surface with a one-line note explaining why
   (barrel re-export of the same removed names).

4. **Should-fix (missing isolated-placement-failure regression test) — accepted, fixed.** Correct:
   the only missing-required-field form test submits a fully empty form and does not isolate
   Placement, so a regression that silently stopped validating Placement alone would not be caught.
   Added a new test in `RequestForm.submission.test.tsx` — fills every other required field via
   `fillRequiredFields`, leaves Placement empty, asserts `mockFetch` is not called, the Placement
   textbox receives focus, and the translated inline error ("Please enter a placement") renders.
   `pnpm test` re-run green (363 tests, +1).

5. **Question/nit (`required_error` reachability on `null` from `FormData.get()`) — acknowledged,
   no action taken this task.** Confirmed independently: `formData.get(f.placement)` can return
   `null` if the field is entirely absent from the submitted FormData, and the `as string` cast at
   `src/bff/request.ts` performs no runtime coercion, so a `null` would reach zod and produce Zod's
   untranslated default message instead of `placement_required`. This is a **pre-existing pattern
   shared identically by every other required string field** in the same schema (`clientName`,
   `ideaDescription`, `contactMethod`, etc. all have the same cast-without-coercion shape) — not
   something this task introduced or narrowed. Per the reviewer's own suggestion, fixing it properly
   (e.g. `?? ""` at the BFF read, or an `invalid_type_error` on every affected field) is a
   cross-field concern broader than this task's placement-only scope, and is recorded as a
   PROJECT_BACKLOG.md item rather than patched here.

**Blockers 1 and 2 require an owner decision before this thread can reach consensus** — both touch
documents (PRD D4, FS field-table block assignment, owner-authored section copy) that are outside
what an executor may amend unilaterally per CLAUDE.md's owner-decision rules. Findings 3, 4, and 5
are fixed/dispositioned; gates re-run green (363 tests). Status set to `awaiting-review` so Codex
can confirm findings 3–5 are resolved; the two blockers are called out explicitly for the owner
below (disputed/undecidable items go to the owner per AI_CROSS_REVIEW.md), and this thread cannot
reach `consensus` until the owner rules on them.

### Итог для владельца (RU)

Codex прислал 5 находок. **Две — блокеры, нужно ваше решение, дальше сам не пойду:**

1. **PRD (D4) до сих пор буквально требует Select** ("The required Placement **select**
   guarantees..."), а PRD §9 прямо говорит: FS не может противоречить PRD, и при конфликте
   побеждает PRD. STRAT-сессия, разблокировавшая эту задачу, обновила только FS, а D4 — нет. По
   смыслу D4 уже верен и для free-text (артист всё равно узнаёт зону словами), но буквально там
   написано "select". Нужно: либо вы утверждаете правку D4 (замена "select" на формулировку без
   привязки к типу поля), либо откатываем реализацию.
2. **Placement переехал из блока "Project Details" в "Reference Uploads"**, а FS-таблица полей
   всё ещё числит его в Project Details — команда "группировать рядом с фото" не давала явного
   разрешения на переезд между блоками. Плюс заголовок секции "Reference images" (ваш авторский
   текст) теперь title'ит обязательное текстовое поле, а не только фото. Нужно решение: либо
   обновляем FS-таблицу + меняете заголовок секции, либо возвращаем Placement в Project Details и
   ищем другой способ визуальной связи с фото.

Остальные три — уже исправил:
3. `config/index.ts` не был в списке разрешённых файлов задачи — добавил его туда с пояснением
   (без правки барреля код бы не собрался, т.к. форма/схема ссылаются на него).
4. Не было теста именно на пустой/whitespace-only Placement при прочих валидных полях — добавил.
5. Мелкий момент про `required_error` при `null` от `FormData.get()` — подтвердил, что это
   существующий паттерн у всех обязательных строковых полей, не специфичный для этой задачи;
   занёс в бэклог, не трогал здесь.

Гейты зелёные (363 теста). Жду вашего решения по блокерам 1 и 2, затем допрошу консенсус с Codex.

## Response 2

Owner ruled on both blockers.

1. **Blocker 1 (PRD D4) — owner approved amending D4.** `STAGE_6_PRODUCT_DEFINITION.md` D4 amended:
   "The required Placement select guarantees..." → "The required Placement field guarantees...",
   with a dated amendment paragraph immediately below D4 explaining the change is wording-only (the
   substance — the artist always gets the area in words — is unchanged) and pointing to this review
   thread as the record of why. §9's PRD-wins-on-conflict rule is now satisfied: PRD and FS agree.

2. **Blocker 2 (block membership / heading) — owner approved keeping Placement in Reference
   Uploads, with the FS table and section heading both updated to match.**
   - `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §4.2 field table: field 2's Block column changed from
     "Project Details" to "Reference Uploads (amended 2026-07-18 — see below)".
   - Added an amendment paragraph after the existing 2026-07-17 placement paragraph explaining the
     block reassignment is a correction (the 2026-07-17 amendment already said the two fields "are
     grouped together in the form"; the field table just hadn't been updated to match what was
     implemented) and pointing to this review thread.
   - Added a second amendment paragraph recording the section-heading copy change.
   - `en.json` `request.uploads.sectionTitle`: "Reference images" → **"Reference images & placement"**
     (owner-approved copy, proposed this round). `RequestForm.tsx`'s block comment above the section
     updated to reference the FS's now-current Block assignment instead of describing the grouping as
     solely a UI choice.
   - Verified live in the browser: the section heading renders as "Reference images & placement"
     above the Placement input and the three upload cards.

`pnpm qg` re-run green (363 tests, unchanged — this round touched only docs, i18n copy, and one
comment, no schema/logic). Status set back to `awaiting-review` for Codex to confirm the two
blockers are resolved and findings 3–5 remain fixed.

### Итог для владельца (RU)

Оба ваших решения внесены:

1. **D4 амендирован** — "select" → "field", с пояснительным абзацем, что суть (артист получает зону
   словами) не менялась, менялась только формулировка. PRD и FS теперь согласованы.
2. **Placement остаётся в Reference Uploads** — FS-таблица обновлена (Block = Reference Uploads),
   добавлен поясняющий абзац; заголовок секции сменён на **"Reference images & placement"**
   (проверил вживую в браузере — рендерится корректно); комментарий в коде обновлён.

Гейты зелёные (363 теста, без изменений — правки только в докам/копирайте/одном комментарии).
Отправляю Codex на подтверждение — статус снова `awaiting-review`.

## Review 2

### Findings

1. **Should-fix — `PROJECT_STRUCTURE.md` still documents the deleted placement-option contract as
   current.** The present-tense label-ownership note at
   `docs/project/PROJECT_STRUCTURE.md:330-335` says `admin.placementLabels` is keyed by value strings
   owned by `features/request/config`, specifically
   `PLACEMENT_OPTIONS`/`SIZE_OPTIONS`/`COLOR_OPTIONS`. This task deletes `PLACEMENT_OPTIONS`; the
   admin map now serves only as a legacy label map for old fixed-option rows and falls back to the
   raw free-text placement for new rows. The implementation and Handoff already rely on that
   distinction, but the current structure document states the opposite. Update the note to describe
   the legacy-placement/fallback behavior while retaining the cross-feature import boundary.
   Historical `PROJECT_STAGE_LOG.md` references to `PLACEMENT_OPTIONS` are dated records and do not
   need rewriting.

### Previous-finding disposition

- **Finding 1 resolved.** PRD D4 now says “required Placement field,” and its dated owner amendment
  records why the stale type-specific wording changed. PRD and FS no longer conflict.
- **Finding 2 resolved.** FS §4.2 now assigns Placement to Reference Uploads, the dated owner
  amendment records the block reassignment, and `request.uploads.sectionTitle` visibly reads
  “Reference images & placement.” The current JSX and `FIELD_ORDER` match that approved structure.
- **Finding 3 resolved.** The task now explicitly includes `config/index.ts` in its Allowed Write
  Surface and records that the addition is retroactive and review-driven.
- **Finding 4 resolved.** The new form test isolates an empty Placement with every other required
  field valid and asserts all three required behaviors: no fetch, translated inline error, and focus
  on the Placement textbox.
- **Finding 5 remains appropriately dispositioned.** No placement-only patch was made; the shared
  absent-FormData/null behavior is recorded in `PROJECT_BACKLOG.md` as a cross-field concern.

### Verification

- `pnpm lint` — PASS (0 errors; one existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (28 files, 363 tests).
- `git diff --check` — PASS.
- No new external platform/browser/third-party boundary is introduced by this round.
- `docs/framework/AI_FRAMEWORK_IDEAS.md` remains an unrelated dirty path and was not reviewed.

## Response 3

1. **Should-fix (`PROJECT_STRUCTURE.md` label-ownership note stale) — accepted, confirmed by direct
   read, fixed.** `PROJECT_STRUCTURE.md:332-336` indeed still named `PLACEMENT_OPTIONS` as the
   value-string owner for `admin.placementLabels`, which is now deleted. Fixed: split the note —
   `sizeLabels`/`colorLabels` keep the original "presentation text keyed by config" description;
   `placementLabels` is now documented as a **legacy fallback map only**, explaining that new
   requests store free text that won't match any key, the `t.has()` guard in
   `RequestDetail`/`RequestCard` falls back to the raw value, and the map is retained solely so
   pre-2026-07-18 rows with an old fixed-option value still render translated. `pnpm qg` re-run
   green (structure + lint + typecheck + test [363, unchanged] + build) — this was a docs-only
   change.

All 6 findings across 2 review rounds are now resolved: 2 blockers (owner-decided, PRD/FS amended),
3 should-fix (config/index.ts scope, missing test, stale structure doc — all fixed), 1
question/nit (dispositioned to PROJECT_BACKLOG.md as a cross-field concern outside this task's
scope). No further changes pending on this side.

### Итог для владельца (RU)

Второй раунд ревью — Codex подтвердил оба блокера закрытыми и нашёл одну новую мелкую находку:
`PROJECT_STRUCTURE.md` всё ещё описывал `admin.placementLabels` как привязанный к удалённому
`PLACEMENT_OPTIONS`. Исправил: пометил `placementLabels` как legacy-fallback только для старых
записей (до 18.07), с объяснением через `t.has()`. Гейты зелёные. Все 6 находок за оба раунда
закрыты — жду финального подтверждения от Codex (Review 3) для консенсуса.

## Review 3

### Findings

1. **Should-fix — the owner-approved PRD edit is still outside the task's declared Allowed Write
   Surface.** The task names `STAGE_6_FUNCTIONAL_SPECIFICATION.md` and `PROJECT_*` reporting docs
   at `STAGE_6_TASK_09_placement_freetext.md:26-33`, but it does not name
   `STAGE_6_PRODUCT_DEFINITION.md` (which is not a `PROJECT_*` file). This round correctly amends
   PRD D4 at `STAGE_6_PRODUCT_DEFINITION.md:79-81` after the owner resolved Review 1 Finding 1, but
   the owner decision resolves the product authority question, not the task-file scope record.
   Add the PRD path to the task's Allowed Write Surface with a retroactive review/owner-resolution
   note, as was already done for `config/index.ts`, so the final task record accurately covers the
   complete diff.

### Previous-finding disposition

- **Findings 1–2 remain resolved.** PRD D4 and FS §4.2 agree on the required free-text field; the
  FS field table assigns Placement to Reference Uploads; the approved heading is rendered from
  `request.uploads.sectionTitle`; current JSX and `FIELD_ORDER` follow the same order.
- **Findings 3–4 remain resolved.** `config/index.ts` is declared in scope, and the focused form
  test isolates an empty Placement while asserting no fetch, the translated inline error, and
  focus on the Placement textbox.
- **Finding 5 remains appropriately deferred** as the shared absent-FormData/null item in
  `PROJECT_BACKLOG.md`.
- **Finding 6 remains resolved.** `PROJECT_STRUCTURE.md` now accurately describes
  `admin.placementLabels` as a legacy map; direct inspection confirms both `RequestCard` and
  `RequestDetail` use `t.has()` and fall back to the raw stored placement.

### Verification

- `pnpm lint` — PASS (0 errors; one existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (28 files, 363 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS. The plain command reports CRLF as
  trailing whitespace only on the newly edited lines of `PROJECT_STRUCTURE.md`; `git ls-files
  --eol` confirms that file is canonically tracked and checked out as CRLF (`i/crlf w/crlf`), so
  this is not added space/tab content.
- No external platform/browser/third-party feasibility boundary is changed by this response.
- `docs/framework/AI_FRAMEWORK_IDEAS.md` remains an unrelated dirty path and was not reviewed.

## Response 4

1. **Should-fix (PRD path outside declared Allowed Write Surface) — accepted, confirmed by direct
   read, fixed.** Correct, and it is the same class as Review 1 Finding 3 (`config/index.ts`): the
   owner's decision to amend PRD D4 resolved the *product-authority* question, but did not update
   the task file's *scope record*, and `STAGE_6_PRODUCT_DEFINITION.md` is not a `PROJECT_*` file so
   it was not covered by the reporting-docs clause. Fixed: added
   `docs/project/STAGE_6_PRODUCT_DEFINITION.md` to the task's Allowed Write Surface with a
   retroactive note explaining the FS could not be reconciled without it (PRD §9 — PRD wins on
   conflict). Also folded the 2026-07-18 FS block-reassignment / section-heading amendments into the
   existing FS write-surface entry, which had only named the FS §4.2 field-2 amendment. This is a
   task-file (durable doc) edit only — it does not touch source, tests, or gate-affecting config, so
   it does not re-arm the quality gates; the last green `pnpm qg` (363 tests) still certifies the
   tree.

All findings across three review rounds are resolved. No changes pending on this side; from my side
this is ready for consensus.

### Итог для владельца (RU)

Review 3 — Codex подтвердил все прежние находки (1–6) закрытыми и нашёл одну новую мелкую того же
класса, что была с `config/index.ts`: PRD-файл (`STAGE_6_PRODUCT_DEFINITION.md`), который я
амендил по твоему решению, не был в списке разрешённых файлов задачи (и он не `PROJECT_*`).
Добавил его ретроактивно с пояснением. Правка только в task-файле — гейты не трогались, последний
зелёный прогон (363 теста) в силе. Все находки за 3 раунда закрыты — с моей стороны готово к
консенсусу, жду финального «ок» от Codex.

## Review 4

### Findings

1. **Should-fix — the authoritative FS still calls the deleted placement options
   owner-configurable configuration.** `STAGE_6_FUNCTIONAL_SPECIFICATION.md:183` lists
   “placement options” among the document's owner-configurable values that live in constants or
   config files. That is now stale and contradicts both the same document's statement that
   `PLACEMENT_OPTIONS` ceases to exist (`:150`) and the implemented free-text contract. Remove
   “placement options” from that sentence (leaving the still-current age threshold and size
   ranges). This is the last live non-historical Select-contract reference found by a repo-wide
   grep; the task's historical descriptions of what it replaces should remain.

### Previous-finding disposition

- **Review 3 Finding 1 is resolved.** The task's Allowed Write Surface now explicitly names
  `STAGE_6_PRODUCT_DEFINITION.md` and records the retroactive, owner-resolved reason for the PRD D4
  amendment. Its FS entry also covers the block-reassignment and section-heading amendments.
- **All earlier findings remain resolved/dispositioned.** PRD D4 and FS §4.2 agree; Placement is
  assigned to Reference Uploads under the approved heading; `config/index.ts` is declared;
  the isolated required-field form test remains present; the shared absent-FormData/null concern
  remains filed in `PROJECT_BACKLOG.md`; and `PROJECT_STRUCTURE.md` accurately documents the
  legacy admin-label fallback.

### Verification

- `pnpm lint` — PASS (0 errors; one existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (28 files, 363 tests).
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.
- Repo-wide grep found no live `PLACEMENT_OPTIONS`/`PlacementOption`/`placementOptions` code
  reference.
- No external platform/browser/third-party feasibility boundary is changed by this response.
- `docs/framework/AI_FRAMEWORK_IDEAS.md` remains an unrelated dirty path and was not reviewed.

## Response 5

1. **Should-fix (FS §183 still lists "placement options" as owner-configurable) — accepted,
   confirmed by direct read, fixed.** Correct: `STAGE_6_FUNCTIONAL_SPECIFICATION.md:183` still
   named "placement options" among the owner-configurable implementation values, directly
   contradicting the same document's `:150` statement that `PLACEMENT_OPTIONS` ceases to exist.
   Fixed: removed "placement options" from that sentence (age threshold and size ranges remain,
   both still current), with a short parenthetical pointing to the placement amendment above so a
   later reader sees *why* it was dropped rather than assuming an omission. FS-only edit; gates not
   re-armed, last green `pnpm qg` (363 tests) still certifies the tree.

All findings across four review rounds are resolved. From my side this is ready for consensus.

### Итог для владельца (RU)

Review 4 — Codex подтвердил всё прежнее закрытым и нашёл последнюю мелкую: FS §183 всё ещё
перечисляла "placement options" среди owner-configurable значений, что противоречит FS:150
(`PLACEMENT_OPTIONS` удалён). Убрал (age threshold и size ranges остались), с пояснением-ссылкой на
амендмент выше. Правка только в FS — гейты не трогались. Все находки за 4 раунда закрыты, готово к
консенсусу.

## Review 5

### Findings

No new findings.

### Previous-finding disposition

- **Review 4 Finding 1 is resolved.** `STAGE_6_FUNCTIONAL_SPECIFICATION.md:183` now lists only the
  still-current owner-configurable age threshold and size ranges. Its parenthetical accurately
  records that Placement stopped being an option list and that `PLACEMENT_OPTIONS` no longer
  exists.
- **All findings from Reviews 1–3 remain resolved/dispositioned.** The PRD, FS, task scope,
  implementation, focused form regression test, backlog deferral, and legacy admin-label
  documentation remain mutually consistent.

This thread is ready for consensus.

### Verification

- Targeted repo-wide grep found no live stale Select contract. Remaining
  `PLACEMENT_OPTIONS`/`placementOptions`/“Placement Select” references are historical task wording
  or explicit documentation that the old contract was removed.
- `git -c core.whitespace=cr-at-eol diff --check` — PASS.
- This response changed only the authoritative FS. Per `AI_REVIEW_PIPELINE.md`, durable-doc edits
  do not re-arm quality gates; the independent Review 4 results remain current: lint PASS
  (0 errors, one existing warning), typecheck PASS, test PASS (28 files, 363 tests).
- No external platform/browser/third-party feasibility boundary is changed.
- `docs/framework/AI_FRAMEWORK_IDEAS.md` remains an unrelated dirty path and was not reviewed.

## Consensus

Reached over five review rounds. All findings resolved or dispositioned:

**Blockers (owner-decided):**
- **Finding 1 (PRD D4 said "select") — resolved.** Owner approved a wording-only amendment;
  `STAGE_6_PRODUCT_DEFINITION.md` D4 now says "required Placement field" with a dated amendment
  paragraph. PRD and FS agree; PRD §9 satisfied.
- **Finding 2 (block membership + section heading) — resolved.** Owner kept Placement in Reference
  Uploads; FS §4.2 field table reassigned field 2's Block to Reference Uploads (dated amendment),
  and `request.uploads.sectionTitle` copy changed to "Reference images & placement"
  (owner-approved). Verified live in the browser.

**Should-fix (all fixed):**
- **Finding 3 (`config/index.ts` undeclared) — fixed.** Added to the task's Allowed Write Surface
  with a retroactive note.
- **Finding 4 (no isolated-placement-failure form test) — fixed.** Added a test in
  `RequestForm.submission.test.tsx` asserting no fetch, focus on the Placement textbox, and the
  translated inline error when only Placement is empty (363 tests total).
- **Finding 6 (`PROJECT_STRUCTURE.md` stale `placementLabels`/`PLACEMENT_OPTIONS` note) — fixed.**
  Rewritten to describe `admin.placementLabels` as a legacy fallback map.
- **R3 Finding 1 (PRD path undeclared in task scope) — fixed.** Added
  `STAGE_6_PRODUCT_DEFINITION.md` to the task's Allowed Write Surface with a retroactive note.
- **R4 Finding 1 (FS §183 stale "placement options") — fixed.** Removed from the owner-configurable
  list with a pointer to the placement amendment.

**Dispositioned, not a code change:**
- **Finding 5 (`required_error` unreachable on `null` from `FormData.get()`) — deferred to
  `PROJECT_BACKLOG.md`.** A pre-existing pattern shared by every required string field, not
  introduced by this task; a proper fix is cross-field and out of this task's placement-only scope.

No rejected findings. No deferred *execution* work beyond the backlog item above. Both sides
independently confirmed (grep) that no live stale Select-contract reference remains in code or
authoritative docs; remaining references are historical records or explicit "this was removed"
documentation.

Gates green on the code tree (`pnpm qg`, 363 tests); the doc-only rounds after did not re-arm them.
Thread closed; moves to `reviews/done/`.
