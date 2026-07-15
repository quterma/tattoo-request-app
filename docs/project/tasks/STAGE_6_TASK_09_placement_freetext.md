# Task: Stage 6 — Placement field: Select → required free-text input

## Status

`draft` · created 2026-07-15 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

Owner product change (2026-07-15), raised during Task 03 Block A′. Deferred to run **after** Task 03
Blocks B′ and C land (owner decision 2026-07-15) — it is a distinct product change, kept out of the
current form rebuild so it gets its own contract + review rather than swelling B′.

## Execution

- Executor: `claude` (FS amendment + schema/BFF contract change on the public write surface + form
  UI — a product change touching validation and the persisted contract; not delegable).
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus (AI_CROSS_REVIEW.md).
- Baseline: the commit that introduces this file (executor derives it).
- Allowed Write Surface: `src/features/request/config/form.ts`, `.../validation/schema.ts`,
  `.../validation/validationKeys.ts`, `.../lib/errors.ts`, `.../ui/RequestForm.tsx`,
  `src/bff/request.ts`, `src/shared/api/index.ts`, `src/shared/i18n/messages/en.json`,
  `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS §4.2 field 2 amendment), the tests for the
  above, and the PROJECT_* reporting docs. **No admin migration** expected (placement is already a
  free `TEXT` column; the admin viewer already renders it via a `placementLabels` fallback).

## Product change (owner 2026-07-15)

Field 2 (Placement) stops being a Select over fixed body-area options and becomes a **required
free-text input**: the visitor types where on the body they want the tattoo. A hint guides them
(e.g. "Where on your body do you want it?" — **owner-authored copy, or Codex-proposed then
owner-approved**). Rationale (owner): a free description captures intent a fixed list can't ("inner
left forearm, wrapping toward the elbow"), and the required Placement text still guarantees the
artist always knows the intended area in words (PRD D4), which is the whole point of the field.

**Grouping (owner):** place the Placement text input near / grouped with the **optional
placement-photo upload** (Reference Uploads field 7) — they describe the same thing (the intended
body area), so co-locating them helps the visitor fill both and may share connecting copy. Exact
grouping/layout is a B′-adjacent UI decision; this task owns the field's contract + its input, and
coordinates the grouping with whatever B′ shipped.

## Open micro-decisions (resolve in the plan; escalate only the copy)

- **Hint copy** — owner-authored (or Codex-proposed → owner-approved). Not invented silently.
- **Max length** — propose ~100 chars (a body-area phrase, not a paragraph), trimmed, min 1 after
  trim (required). Confirm in the plan.
- **Does `PLACEMENT_OPTIONS` disappear entirely?** Likely yes (no Select). Confirm nothing else
  imports it (admin `placementLabels` is a separate i18n map, not this array).

## Scope

1. **FS §4.2 field 2 amendment first** (docs-first, PRD §9 change control): Type Select →
   Text, Validation → required free-text (trimmed, max ~100), drop the "concrete body areas /
   no Other" note (obsolete once it's free-text). Record the owner decision.
2. **Contract**: `schema.ts` placement → required trimmed string (1–~100); remove the
   `PLACEMENT_OPTIONS` enum refine; `validationKeys.ts` (placement message stays or is reworded);
   `config/form.ts` (remove `PLACEMENT_OPTIONS`/`PlacementOption` if unused); `REQUEST_FIELDS`
   unchanged (still `placement`); BFF `parseRequestFormData` unchanged in shape.
3. **UI**: `RequestForm.tsx` Placement Select → `TextInput` with the hint; group near the
   placement-photo upload per the owner note; inline validation.
4. **i18n**: replace `placementPlaceholder`/`placementOptions` with the input label + hint; keep the
   admin `placementLabels` map as-is (it now just passes through free text via the fallback).
5. **Tests**: schema (required, trim, max, whitespace-only rejected), BFF parse unchanged, form
   (renders an input not a Select; required).

## Out of scope

- Admin-side changes (placement already renders as free text via the fallback).
- Anything in Task 03 Blocks B′/C.

## Acceptance criteria

- Placement is a required free-text input; empty/whitespace-only blocks submit with an inline
  message; a typed area persists and renders in the admin viewer verbatim.
- FS §4.2 field 2 reflects the free-text model; `pnpm qg` green; Codex cross-review to consensus.

## Reporting

- Update PROJECT_STAGE_LOG.md, FS §4.2, and this file's status; move to `tasks/done/` at close.
