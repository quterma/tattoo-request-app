Status: `consensus` · round 1, no findings · outcomes filed 2026-07-26
Reviewer: codex
Requested by: IMPL: Stage 6 item 18 Block B (pages, form, spacing)

# Review: Stage 6 Item 18 — Block B remainder (scope items 5, 7, 8, 10, 11)

## Handoff

Block B of `docs/project/tasks/STAGE_6_TASK_18_visual_consistency.md` consumes the token/primitive
foundation Block A shipped (reviewed to consensus at round 1,
`reviews/done/REVIEW_2026-07-26_stage6-item18-blockA-tokens-primitives.md`). Scope item 9 (the Home
hero) and CO-2 were discharged earlier, out of block order, on the owner's call; this block executed
the remainder: items 5, 7, 8, 10 and 11.

The nucleus is scope item 5. `app/globals.css`'s `@layer base` carried `p { margin: 0 0 1em }` and
`h1`–`h4 { margin: 0 0 0.5em }`, and 41 `mb-0`/`mb-1` classes existed across the tree for the sole
purpose of cancelling them. Block A deliberately left both halves in place because it could not edit
call sites. This block removed the CSS rules and all 41 counters **as one atomic step**, then
repaired the sites that were relying on the margins for real spacing, so that vertical rhythm is
carried only by `Stack gap-*` and the `Page`/`Section` density variants. Items 7 and 8 then removed
every per-call-site `py-*` override in favour of `density`, and applied `.text-display` to the Home
hero (Block A's last supplier-without-consumer pair). Item 11 shortened the oversized-file error
string and fixed the row layout that made it overflow. Item 10 is the CO-1 sweep.

**Files (12 execution-affecting, +179 / −167):**

```text
app/globals.css                                 | 20 ++----
app/[locale]/(public)/page.tsx                  | 95 ++++++++++++++-----------
app/[locale]/(public)/process/page.tsx          | 72 ++++++++++---------
app/[locale]/(public)/location/page.tsx         | 86 +++++++++++-----------
app/[locale]/(public)/preparation/page.tsx      | 16 ++---
app/[locale]/(public)/aftercare/page.tsx        | 16 ++---
app/[locale]/(public)/request/page.tsx          | 10 ++-
src/features/request/ui/RequestForm.tsx         |  4 +-
src/features/request/ui/SuccessView.tsx         | 12 ++--
src/features/request/ui/UploadCategoryInput.tsx |  7 +-
src/shared/ui/public-footer.tsx                 |  6 +-
src/shared/i18n/messages/en.json                |  2 +-
```

Also changed (non-execution-affecting): this thread, the task file, PROJECT_STAGE_LOG.md,
PROJECT_BACKLOG.md. Uncommitted working tree — no commit has been proposed or made.

**Scope boundary.** Block A is committed and is not under review here. `src/shared/ui/stack.tsx`,
`section.tsx`, `page.tsx`, `tokens.css` were **not** opened by this block. Admin surfaces are out of
scope for the whole task. `success/page.tsx`, `error.tsx` and `(public)/layout.tsx` were inside the
write surface but verified to need no change (their `Page`/`Section` were already bare and they held
no counters).

**Two owner-approved deviations from the task file** (both task-file-only, neither PRD/FS):

1. `src/shared/ui/public-footer.tsx` is formally Block A's write surface, but 3 of the 41 counters
   live in it. Approved to edit; change limited to deleting 3 now-dead `mb-0`.
2. Scope item 11 authorizes only the copy change. The `UploadCategoryInput` row layout was fixed
   too, as scope item 10 work ("fix what clips, overflows, or wraps illegibly").

A third proposed deviation — restoring `gap-4` to `StackGap` — was **withdrawn** on the owner's
ruling that no `gap-4` in the tree sits on a `<Stack>`.

**Gates.** `pnpm qg` exit 0: structure PASS · lint PASS (0 errors; 1 warning, pre-existing
`no-img-element` in an admin test) · typecheck PASS · test PASS (33 files / 408 tests) · build PASS ·
check:metadata PASS.

**CO-1 evidence.** `pnpm shot` against `pnpm build && pnpm start`: 6 public routes × 4 widths
(320/375/768/1280) = 24 captures, `scrollWidth === viewport` at every one. Because the `(public)`
layout pins `overflow-x-hidden`, which hides overflow rather than preventing it, this was measured
rather than eyeballed. A temporary Playwright harness (written, run, deleted) additionally checked
each route at each width scrolled to the bottom and found **no** content element intersecting the
fixed bottom nav; the nav is `position: fixed` only at 320/375 and static at 768/1280. The
oversized-file row was exercised end-to-end by uploading a real 5 MB file at 320px.

**In-session Review Agent findings already applied** (stated so you can verify the fixes rather than
rediscover them): it found that removing the `h1` flow margin left `request/page.tsx`'s `<h1>` and
`<RequestForm/>` as bare siblings with no spacing mechanism — measured at 0px — and two −4px
regressions where a single `Stack` gap replaced a larger collapsed margin (Location's
address→map-links and Home's Featured-Work "see more" link). All three were fixed and re-measured in
a browser at 12/16/16px respectively. It also corrected a `.text-display` comment that wrongly
claimed a "zero-pixel" change (font-size matches; line-height goes 2.5rem/1 → 1.1) and an inert
`min-w-0` on a column-flex child.

### Focus questions

1. **Atomicity and completeness of the flow-margin removal.** Is there any element anywhere in the
   public surface that lost spacing it depended on and was not repaired? The failure mode is silent:
   it does not overflow, it does not fail a test, and `scrollWidth` cannot see it. The three found
   in-session are described above; the question is whether any remain — particularly in states the
   screenshots never entered (form validation errors, upload progress/failure rows, the success
   page, `error.tsx`).
2. **Fidelity of the density mapping.** Every `py-*` override was translated to a `density` value.
   Two centred CTA sections carried `py-3 sm:py-3`, which has no exact variant and was mapped to
   `tight` (4px tighter at mobile only) — pre-decided in Block A. Are any of the other mappings a
   silent visual change rather than an exact reproduction?
3. **Gap-vs-collapsed-margin arithmetic.** Adjacent flow margins collapse; flex gaps do not. Several
   repairs replaced a collapsing pair with a single gap. Are the chosen values right, or is there
   another site where the rendered value was `max(a, b)` and the replacement used the smaller?
4. **`UploadCategoryInput` row.** The message span is now shrinkable and the remove control carries
   `ms-auto`. Does that hold for the *other* upload error strings and states (transport failure with
   its extra Retry control, uploading + progress) at 320px, not just the one shortened string?
5. **External-boundary feasibility.** The 4 MB rejection (FS §4.3) and the upload flow must be
   unchanged by this block — it was meant to be presentation-only. Please confirm no behavioral
   change reached the validation path, and that `request.errors.uploadTooLarge` is the only string
   that moved (`git diff src/shared/i18n/messages/en.json` should be 1 insertion / 1 deletion).
6. **FS §6 criteria 9, 10 and 11** must still hold — Item 13's sweep depends on them. No JSX was
   reordered, but several elements were re-parented into `Stack`/flex wrappers; please confirm block
   order, nav and CTAs are genuinely undisturbed.

## Review 1

No findings.

Verification:

1. **Flow-margin removal and spacing.** The base `p` and `h1`–`h4` margins and their cancellation
   utilities were removed together. Repository-wide searches find no surviving `mb-0`/`mb-1`
   counters and no `py-*` override on a `Page` or `Section`. The public call sites that previously
   depended on adjacency spacing now have an explicit mechanism: `Stack`/flex gaps, or the measured
   `mt-4` repair on Location. The unchanged Success and error states retain explicit container gaps
   or margins where they need sibling spacing.
2. **Density mapping and collapsed-margin arithmetic.** The four content pages map exactly from
   `py-4 sm:py-8` / `py-2 sm:py-3` to `Page density="tight"` /
   `Section density="tight"`. Home's five sections map exactly to `normal`. The two CTA sections'
   documented 4px mobile tightening is the sole intentional non-exact mapping. The Location
   address-to-links and Home gallery-to-link repairs preserve the outgoing 16px rendered gaps.
3. **Upload row and external boundary.** `UploadCategoryInput`'s validation and transport paths are
   unchanged. The failed-message flex item can shrink and wrap (`min-w-0`), while Retry and Remove
   remain fixed-size; the uploading label is short and the Remove control is pushed to the row end.
   The 4 MB client-side rejection still occurs before `xhrUpload`, so the platform-boundary
   safeguard is intact. `en.json` contains exactly the one stated insertion/deletion.
4. **FS §6 criteria 9–11.** The block does not touch the public layout/navigation. Re-parenting
   preserves page section order, CTA identity/count, FAQ links, and Home's teaser-only content.
5. **Independent gates.** `pnpm lint` PASS (0 errors, one pre-existing admin-test warning);
   `pnpm typecheck` PASS; `pnpm test` PASS (33 files, 408 tests).

## Response 1

No findings to adjudicate — nothing to accept, reject, or escalate. Round 1 reaches consensus.

The verification is taken as independent rather than confirmatory: Codex checked the two classes
that this block's own evidence could not settle, and checked them where I could not point it.

- **Collapsed-margin arithmetic (focus question 3)** was the one I was least able to self-certify:
  adjacent flow margins collapse to `max(a, b)` while flex gaps sum, so every repair that replaced a
  collapsing pair with a single gap was a place a −4px regression could hide silently — no overflow,
  no failing test, invisible to `scrollWidth`. Two such regressions had already been caught in
  session by the Review Agent. Codex confirms the Location address→links and Home gallery→link
  repairs land on the outgoing 16px, and found no third site.
- **The upload row in states I never rendered (focus question 4)** — I verified one string (the
  shortened `uploadTooLarge`) with one real 5 MB upload. Codex confirms the shrink/wrap behaviour
  holds for the transport-failure row with its extra Retry control and for the uploading+progress
  state, which is the generalization my single-case evidence did not support.
- **The 4 MB boundary (focus question 5)** is confirmed to still fire before `xhrUpload`, so the
  presentation-only intent held and the FS §4.3 platform safeguard is intact.

Independent gates match this session's: lint PASS (0 errors, same single pre-existing admin-test
warning), typecheck PASS, test PASS 33 files / 408 tests.

### Итог для владельца

Codex: **замечаний нет**, консенсус с первого раунда. Проверил независимо ровно то, что я сам
подтвердить не мог: арифметику схлопывающихся margin (третьей регрессии −4px нет — две нашёл
Review Agent в сессии), поведение строки загрузки в состояниях, которые я не отрисовывал (transport
failure с кнопкой Retry, прогресс загрузки), и что отсечка 4 МБ по-прежнему срабатывает до
`xhrUpload` — то есть блок остался презентационным. Гейты у него сошлись с моими.

Тред закрыт, переезжает в `reviews/done/`. Блок готов к коммиту — жду явного подтверждения.

## Consensus

**Round 1, no findings.** Nothing accepted (there was nothing to accept), nothing rejected, nothing
deferred, nothing escalated to the owner. No code changed as a result of this thread, so the gates
that ran before it remain valid for the exact tree being proposed.

Scope item 5 — the flow-margin removal that kept Item 18 open — is confirmed complete and is now
safe to mark DONE in the task file. CO-1 stands discharged on the evidence in the Handoff. CO-4
(physical-device verification) is untouched by this thread and remains open by design, tracked in
`PROJECT_PRODUCTION_READINESS.md`.
