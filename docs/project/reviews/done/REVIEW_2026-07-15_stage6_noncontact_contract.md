Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 3 — request form rebuild (Block A′, non-contact contract)

---

## Handoff

Block A′ of task `STAGE_6_TASK_03_request_form_rebuild.md` — the **non-contact field contract**
(schema + BFF + config + option sets + validation keys + FormData field names), with its tests.
Second of the re-cut blocks (R done + committed `5de9329`; A′ here; B′ form UI next; C contact
block last, against the "Stage 6 Contact Model" decision). The contact fields are **deliberately
untouched** in this block — they change in Block C.

### What was done (all per FS §4.2 as it now stands, incl. the 2026-07-15 amendments)

- **Options (`src/features/request/config/form.ts`)**:
  - `SIZE_OPTIONS` gains `"not-sure"` (FS §4.2 field 3).
  - `COLOR_OPTIONS` → `["black-only", "black-and-grey", "color", "not-sure"]` (FS §4.2 field 4;
    replaces the old `black/color/mixed`).
  - `PLACEMENT_OPTIONS` → concrete body areas only; **`"other"` removed** (FS §4.2 field 2 amended
    2026-07-15 — no "Other", no free-text anywhere).
  - New `AGE_THRESHOLD = 18` (FS §4.2 field 11 / PRD D6) — owner-configurable, in the **isomorphic**
    feature config (NOT `src/config`, which is `server-only` and can't reach the client). Exported
    via the config barrel.
- **Schema (`validation/schema.ts`)**: `ideaDescription` min 20 / max 1000 (was 10 / 2000, aligned
  to FS §4.2 field 1). `consent` → **`eligibility`** (literal `true`, message
  `eligibility_required`). placement/size/color validate against the updated arrays automatically
  (they already `.refine` against the imported option lists — removing "other" / changing color
  values flows through, no line change). **Contact fields + the at-least-one-contact superRefine
  are unchanged** (Block C owns them).
- **Validation keys (`validation/validationKeys.ts`)**: `CONSENT_REQUIRED` → `ELIGIBILITY_REQUIRED`
  (`eligibility_required`); pruned dead legacy keys `REFERENCE_IMAGES_*` / `PLACEMENT_IMAGES_*`
  (unused since the two-category model was replaced in Item 1).
- **FormData contract (`src/shared/api/index.ts` REQUEST_FIELDS)**: `consent` → `eligibility`.
- **BFF (`src/bff/request.ts`)**: `ParsedRequestPayload` + `parseRequestFormData` rename
  `consent` → `eligibility`.
- **Route (`app/api/request/route.ts`)**: maps `data.eligibility` → the existing `consent` DB
  column via `createRequest` (same boolean semantics, **no migration** — the eligibility
  confirmation reuses the `consent` column; only the *contact* columns change, in Block C).
- **Error mapping / i18n (`lib/errors.ts`, `messages/en.json`)**: `consentRequired` →
  `eligibilityRequired`; `eligibilityLabel` copy carries `{ageThreshold}`; idea hint/messages to
  20/1000; new size/color option labels; `placementOptions.other` removed. Dead
  `referenceImages*`/`placementImages*` i18n keys did not exist (nothing to remove there).
- **Tests (same block)**: `schema.test.ts` (new idea bounds 20/1000, color set incl. not-sure, size
  not-sure, placement "other" now rejected, consent→eligibility), `validateRequestPayload.test.ts`,
  `bff/request.test.ts`, `route.test.ts`, `db.test.ts`, and the `RequestForm.submission.test.tsx`
  matchers that depend on the renamed field / new copy.

### `RequestForm.tsx` note (why it's touched but not rebuilt here)

The form still had `consent` wired; leaving it would break the type/build. So A′ does the **minimal**
`consent`→`eligibility` rename in the form (defaultValues, the FormData append, the checkbox field)
to keep gates green. The **actual form rebuild** — Introduction block, block order, motivation
cards (A.1), eligibility copy with the rendered `AGE_THRESHOLD`, privacy statement, scroll-to-first-
error, store text-field persistence, upload-card UX fixes — is Block B′, not this block.

### Scope boundary

- No contact-field change (Block C). No DB migration (eligibility reuses the `consent` column). No
  new env var. No admin-side change.
- **Known, deliberate deferral (flagging so it's seen as considered, not missed):** the admin
  request-detail viewer renders `colorLabels`/`sizeLabels`/`placementLabels` from the *admin* i18n
  namespace via `t.has(key) ? label : rawValue`. New option values (`black-only`, `not-sure`, …)
  have no admin label yet, so a newly-submitted request renders the **raw value** there
  (readable: "black-only", "not-sure"). Adding admin labels touches the admin namespace, which this
  task walls off ("no admin changes"); it belongs to Block C or the Stage 6 visual pass. No admin
  row breaks — the fallback is graceful. Is this the right call, or should the ~5 admin label lines
  be added now?

### Quality gates (in-session, green)

- `pnpm qg` PASS: structure + lint (0 errors, 1 pre-existing `no-img-element` warning in an admin
  test) + typecheck + test (278 passed, +4 new schema tests) + build.

### Focus questions

1. **Contract completeness vs FS §4.2 (non-contact only):** does the schema now match FS §4.2 for
   idea (20/1000), placement (no "other"), size (+not-sure), color (the four values), eligibility
   (required `true`)? Anything off?
2. **eligibility→`consent` column reuse:** is persisting the eligibility confirmation into the
   existing `consent` boolean column sound (same semantics: "the visitor affirmed the gate"), and
   does keeping the DB column name `consent` while the wire/field name is `eligibility` create any
   trap for Block C or the admin viewer?
3. **Dead-key pruning:** were `REFERENCE_IMAGES_*` / `PLACEMENT_IMAGES_*` truly unused everywhere
   (grep), i.e. safe to remove?
4. **The admin raw-value deferral above** — accept as deferred, or pull the admin labels in now?
5. Anything that will make Block B′ (form rebuild) or Block C (contact) harder because of a choice
   made here.

## Review 1

### Findings

1. **Blocker — Idea description is not trimmed before its length checks or persistence.**
   FS §4.2 requires the value to be “Min 20 chars, max 1,000, trimmed”
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:103`), but the schema applies `.min(20)` / `.max(1000)`
   directly to the raw string (`src/features/request/validation/schema.ts:12-15`). Consequently a
   string of 20 spaces is accepted as a required idea, leading/trailing whitespace is persisted,
   and a valid 1,000-character idea surrounded by spaces is rejected. Add `.trim()` before both
   bounds and add boundary tests that prove validation uses — and the parsed result returns — the
   trimmed value.

2. **Blocker — the configured age threshold is currently rendered as the literal placeholder
   `{ageThreshold}`.** `AGE_THRESHOLD` is exported as 18
   (`src/features/request/config/form.ts:27-33`) and the message now requires the interpolation
   value (`src/shared/i18n/messages/en.json:117`), but `RequestForm` calls
   `t("eligibilityLabel")` without values (`src/features/request/ui/RequestForm.tsx:311-314`). The
   installed `next-intl` runtime returns the untranslated placeholder in this case; the test mock
   does the same, while its loose `/i confirm i am/i` query does not detect it. Passing
   `{ageThreshold: AGE_THRESHOLD}` is a minimal compatibility fix, not the deferred Block B′
   rebuild. Assert the actual visible “18 or older” copy so FS §6.7 is guarded.

3. **Should-fix — the eligibility-to-legacy-column compatibility mapping has no route-level
   regression assertion.** The implementation correctly maps `data.eligibility` to
   `createRequest({consent: ...})` (`app/api/request/route.ts:87-90`), but the changed route test
   only asserts `studioId` and `files` (`app/api/request/__tests__/route.test.ts:124-128`). It would
   stay green if this new bridge were later omitted or wired to the wrong value. Extend that
   expectation (or add a focused test) to require `consent: true`; this is the only seam where the
   new wire contract intentionally changes names before the unchanged RPC/DB contract.

4. **Should-fix (may be deferred to Block C) — DB-column reuse is sound, but the admin semantic
   label is now stale.** Reusing the boolean `consent` column and `p_consent` RPC parameter is safe:
   the persisted fact is still that the visitor affirmed the required gate, and the explicit route
   mapping isolates the legacy storage name. However, the admin detail currently renders that fact
   as “Consent given” (`src/features/admin/ui/RequestDetail.tsx:165`,
   `src/shared/i18n/messages/en.json:235-236`), although the visitor now affirmed eligibility, not
   policy consent. Block C already owns admin-card rendering, so the A′ scope need not expand now;
   Block C should rename the admin presentation to eligibility and add the missing new option
   labels at the same time. The raw-value fallback for the new size/color values is safe for this
   checkpoint, but “Block C” is the appropriate concrete deferral, not an unspecified later visual
   pass.

### Focus-question results

- Apart from Finding 1, the non-contact option/validation contract matches FS §4.2: placement has
  no `other`, size includes `not-sure`, color is the specified four-value set, and eligibility is
  required as literal `true`.
- Repository-wide grep found no remaining execution/test references to
  `REFERENCE_IMAGES_*`, `PLACEMENT_IMAGES_*`, `reference_images_*`, or `placement_images_*`; the
  dead-key pruning is safe.
- No new external-system boundary is introduced in A′. The existing RPC accepts the mapped boolean,
  so eligibility-to-`consent` reuse requires no migration and does not conflict with Block C's
  contact-column migration as long as that migration preserves the mapping.

### Verification

- `pnpm lint` — PASS (0 errors; 1 pre-existing `no-img-element` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (27 files, 278 tests).
- `git diff --check` — PASS.

## Response 1

All four findings **accepted and fixed**. Gates re-run green after the fixes (283 tests, +5;
`pnpm qg` PASS). Also folded in an owner product change that landed between the handoff and this
review (color set — see below).

1. **Blocker 1 (idea not trimmed) — accepted, fixed.** Added `.trim()` before `.min(20)`/`.max(1000)`
   in `schema.ts`. Added boundary tests: whitespace-only → `idea_too_short`; a valid idea wrapped in
   spaces returns the **trimmed** value; a 1000-char idea wrapped in whitespace is accepted (trim
   before max). Matches FS §4.2 "trimmed".
2. **Blocker 2 (`{ageThreshold}` rendered literally) — accepted, fixed.** `RequestForm` now calls
   `t("eligibilityLabel", { ageThreshold: AGE_THRESHOLD })` (imported from config). The test matcher
   is tightened to `/i confirm i am 18 or older/i`, which both exercises the interpolation and would
   now fail on the literal-placeholder regression. Guards FS §6.7.
3. **Should-fix 3 (no route assertion for the eligibility→consent bridge) — accepted, fixed.** Added
   a focused route test: `createRequest` is called with `consent: true` (regression guard on the one
   seam that renames the wire field before the unchanged RPC/DB column).
4. **Should-fix 4 (admin "Consent given" stale + missing new option labels) — accepted, deferred to
   Block C with a concrete pin.** You're right it's not a vague "later visual pass": added an explicit
   line to the task file's Block C scope — Block C renames the admin eligibility presentation and
   adds the new `sizeOptions`/`colorOptions` admin labels, since it already owns admin-card
   rendering. A′ stays out of the admin namespace.

**Owner product change folded in (not a review finding).** Between handoff and review the owner
narrowed FS §4.2 field 4: **color is now two options only — Black & grey / Color** (dropped "Black
only" and "Not sure"). Applied: `COLOR_OPTIONS = ["black-and-grey", "color"]`, i18n trimmed to two,
FS §4.2 field 4 amended (docs-first), tests updated (accepts the two; rejects `black-only`/`not-sure`).
`black-only` removed everywhere.

**Separately (NOT in A′):** the owner also asked to replace the **placement Select with a required
free-text input** (grouped near the optional placement-photo upload). That is another FS §4.2 field-2
product change with a UX-design dimension — routed to its own task/decision, not folded into A′ (see
the Russian note; a `draft` task file is being cut).

### Итог для владельца (RU)

Codex дал 2 блокера + 2 should-fix — все приняты и исправлены, гейты зелёные (283 теста):
1. Idea теперь `.trim()` перед проверками длины (FS требует trimmed) — иначе 20 пробелов проходили.
2. Возраст `{ageThreshold}` рендерился как литерал — форма теперь передаёт `18`, тест это ловит.
3. Добавлен тест: eligibility → колонка `consent` (страховка от поломки моста).
4. Админский лейбл "Consent given" и лейблы новых опций — прицельно отложены в Block C (он и так трогает админ-карточку).

Плюс применил твоё изменение цвета: **2 опции — Black & grey / Color** (`black-only`/`not-sure` убраны, FS §4.2 обновлён).

Consensus достигнут. Дальше: предложу коммит A′.

## Consensus

- **Finding 1 (blocker, idea trim)** — accepted; fixed in `schema.ts` + boundary tests.
- **Finding 2 (blocker, ageThreshold placeholder)** — accepted; fixed in `RequestForm.tsx` + tightened test.
- **Finding 3 (should-fix, route mapping assertion)** — accepted; route test added.
- **Finding 4 (should-fix, admin label/option labels)** — accepted, **deferred to Block C** with a
  concrete pin in the task file (admin namespace, walled off from A′).
- Plus: owner color-set narrowing (2 options) applied with a docs-first FS §4.2 amendment.
- No rejected findings. Placement→free-text (separate owner product change) routed to its own task,
  not this block.
