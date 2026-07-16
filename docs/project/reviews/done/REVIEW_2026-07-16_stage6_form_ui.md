Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 3 — request form rebuild (Block B′, non-contact form UI)

---

## Handoff

Block B′ of task `STAGE_6_TASK_03_request_form_rebuild.md` — the **non-contact form UI**, built on
the Block A′ contract (committed `4721dcd`) and Block R reference code (`5de9329`). Third of four
blocks; Block C (five-method contact model) is last. The contact block in the form is **unchanged
here** — B′ rebuilds everything around it.

### What was done

- **RequestForm.tsx rebuilt** to FS §4.1 block order: Introduction → Idea → Project Details →
  Reference Uploads → Contact (unchanged) → Eligibility & Privacy → Submit. Sections are visually
  separated with headings (a single continuous scroll, D-Blueprint 1 — no wizard/accordion).
  - **Introduction** (FS §4.1): placeholder copy in `en.json` (`introduction`) with an
    `__intro_TODO` marker — owner-authored copy is pending (FS §5: not in Appendix A → owner's, not
    invented). Owner chose "placeholder + TODO now" (2026-07-16).
  - **Motivation cards** (FS §4.4 / Appendix A.1): each `UploadCategoryInput` now takes a `benefit`
    prop rendered visually primary above the control; the three sentences are the **verbatim A.1
    copy**.
  - **Eligibility & Privacy**: eligibility checkbox renders the interpolated age threshold
    (`t("eligibilityLabel", { ageThreshold: AGE_THRESHOLD })`); the A.3 privacy statement (verbatim)
    sits adjacent to Submit.
  - **Validation UX** (FS §4.5 / D-Blueprint 5(c)): `handleSubmit(onSubmit, onInvalid)` — on a
    blocked submit the FIRST invalid field in DOM order is smooth-scrolled into view (RHF focuses
    it); `scrollToFirstError` is guarded (`?.scrollIntoView?.`) for jsdom/non-DOM. The server-side
    field-error path scrolls too, using the server's field set (not the stale RHF `errors` closure).
  - **Submit states** (FS §4.5): CTA disabled while submitting or while any upload is in flight; the
    label distinguishes "Sending…" from "Waiting for images…" (the inherited nit — a disabled button
    is never silent about why).
- **In-session persistence (D-Blueprint 5(a))** — `requestDraft.ts` gains a `fields: DraftFields`
  (`Record<string,string>`) bag with `getFields`/`setFields`, cleared by `resetDraft()` on success.
  RequestForm hydrates `defaultValues` from `getFields()` on mount and mirrors watched values into
  the store via an effect keyed on `JSON.stringify(watched)` (so it writes on real value changes,
  not every render — no loop against the store it feeds). **eligibility is intentionally NOT
  persisted** (a confirmation should be a deliberate act each session).
- **Upload-card UX fixes (FS §4.3 amended 2026-07-14)** — `UploadCategoryInput.tsx`:
  - The file name is no longer rendered (the thumbnail is the identifier).
  - Retry shows **only for a transport failure**. `UploadSlot` gains
    `failureKind: "transport" | "validation"`, derived from `UploadError.retryable` (which already
    encodes 429/5xx/network = transport vs. 400 = validation) and set to `validation` for the
    client-side over-size pre-check. `invalidateUploadedSlots` marks its slots `transport` (a dead
    handle is recoverable by re-upload). Remove is always available.

### Runtime verification (done — evidence)

Drove the Next.js dev server and fetched the server-rendered `/en/request`:
- Block order verified by ascending byte offsets: intro → Your idea → Describe your idea → Project
  details → Placement → Reference images → (A.1 card) → How to reach you → "I confirm I am 18…" →
  privacy → Send Request.
- All three A.1 benefit sentences render; privacy (A.3) renders; eligibility shows the interpolated
  "18 or older" (the `{ageThreshold}` literal appears only in the client i18n message catalog blob,
  not the rendered label); 3 upload categories with file inputs; placement 8-option Select; color 2
  options; size "Not sure".

### Scope boundary

- Contact block unchanged (Block C owns the five-method model). Placement stays a Select (the
  Select→free-text change is the separate `TASK_09`, deferred after B′/C). No schema/BFF/DB change
  in B′ (all contract work was A′). No admin change. No new env var.
- The success view is still the inline block (Item 4 builds the real `/success` route; the store's
  `SuccessPayload` path stays open).

### Quality gates (in-session, green)

- `pnpm qg` PASS: structure + lint (0 errors; 1 pre-existing `no-img-element` warning in an admin
  test) + typecheck + test (294 passed, +11: persistence, retry transport-vs-validation, no
  file-name) + build.

### Focus questions

1. **Persistence effect loop-safety:** is keying the mirror effect on `JSON.stringify(watched)`
   (with `watched` omitted from deps behind an eslint-disable) a sound way to avoid a
   write-per-render loop against a store this component also subscribes to via `useRequestDraft`? Any
   render-loop or stale-value path you can construct?
2. **Retry gating correctness:** does `failureKind` correctly split every failure? Cases:
   client over-size pre-check (validation), server 400 (validation, `retryable:false`), 429/5xx/
   network (transport), dead-handle `invalidateUploadedSlots` (transport), a non-UploadError throw
   (defaulted transport). Any failure that ends up with the wrong affordance?
3. **scrollToFirstError:** DOM-order list `FIELD_ORDER` vs. the actual rendered order — do they
   match after the rebuild, and is the server-error scroll path (using the server field set, not the
   RHF `errors` snapshot) correct?
4. **eligibility-not-persisted:** is deliberately excluding the eligibility checkbox from the
   persisted bag the right call, and does hydrating `defaultValues` from `getFields()` interact
   cleanly with RHF (no uncontrolled→controlled warnings, no stale default after `resetDraft`)?
5. Anything here that will make Block C (the contact rebuild, which replaces the contact section and
   adds its persisted fields to the same bag) harder.

## Review 1

### Findings

1. **Blocker — the required technical-failure recovery is still missing from the form UI.**
   FS §4.5 requires a submission network/server failure to tell the visitor that nothing was lost
   and, after at least two consecutive failed submit attempts, additionally show the exact
   Instagram fallback line from Appendix A.4
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:166`; task scope/acceptance:
   `STAGE_6_TASK_03_request_form_rebuild.md:136-139,289-290`). `RequestForm` still has only the
   four-state `SubmitStatus`, maps every technical failure directly to `"error"`, and renders the
   unchanged generic “Something went wrong. Please try again.” message
   (`src/features/request/ui/RequestForm.tsx:34,207-213,404-407`;
   `src/shared/i18n/messages/en.json:137`). There is no consecutive-failure counter, no
   first-vs-second-attempt behavior, no A.4 copy/handle, and no explicit “your details are still
   here” assurance. Block C is scoped to the contact model, so no remaining checkpoint currently
   owns this requirement. Implement it here or explicitly reassign it before B′ reaches consensus;
   add regression tests proving the fallback is absent after failure 1 and present after failure 2.

2. **Blocker — excluding eligibility contradicts the required in-session persistence guarantee.**
   D-Blueprint 5(a) says that returning from Process to Request in the same live session restores
   **all entered values** and uploaded files (`PROJECT_DECISIONS.md:1544-1554`), and the task repeats
   “Entered values and uploaded files survive” as an acceptance criterion
   (`STAGE_6_TASK_03_request_form_rebuild.md:287-288`). The implementation deliberately omits
   `eligibility` from `PERSISTED_FIELDS`, always hydrates it as `undefined`, and adds a test that
   requires it to become unchecked after an unmount/remount
   (`src/features/request/ui/RequestForm.tsx:36-49,89-94`;
   `src/features/request/__tests__/RequestForm.submission.test.tsx:442-452`). Client-side
   navigation is not a new session: the visitor already made the deliberate confirmation in the
   exact session covered by the guarantee. Persist the checkbox too, or obtain an owner-level
   blueprint/task change; the current rationale cannot override the recorded decision.

3. **Should-fix — server-returned field validation errors are scrolled to, but never focused.**
   The client-resolver path can rely on RHF's `shouldFocusError`, but the server path calls
   `setError(field, { message })` without `{ shouldFocus: true }` and then only calls
   `scrollToFirstError(fields)` (`src/features/request/ui/RequestForm.tsx:191-204`). RHF's
   programmatic `setError` focuses only when the explicit option is supplied, so this path violates
   FS §4.5's “scrolled into view **and focused**” requirement
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:164`). Determine the first field using `FIELD_ORDER`,
   focus that one after setting the errors, and add a server-error focus/scroll regression test.

4. **Should-fix — the required idea-description counter was not implemented.** FS §4.2 requires
   “counter shown near limit” for the 1,000-character idea field
   (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:103`). The rebuilt UI still passes only the static
   “Minimum 20 characters” hint into `TextareaInput`
   (`src/features/request/ui/RequestForm.tsx:281-287`;
   `src/shared/i18n/messages/en.json:83`) and never watches/renders the current character count.
   Add the near-limit counter behavior and a focused UI test for its threshold/boundary.

5. **Should-fix — submit is still disabled before the visitor can initiate the documented
   wait-for-uploads flow.** The owner decision says the CTA accepts the click, shows a sending
   state while in-flight uploads settle, and then submits the uploaded slots
   (`PROJECT_DECISIONS.md:1938-1941`). The stage log explicitly assigned the existing mismatch to
   Item 3 (`PROJECT_STAGE_LOG.md:118-121`). B′ changes the disabled button's label to “Waiting for
   images…”, but still uses `disabled={isSubmitting || hasUploadingSlot}`, so the click is never
   accepted and no pending submit exists (`src/features/request/ui/RequestForm.tsx:125,254-258,410`).
   Implement the recorded click-to-wait behavior; changing only the disabled label does not resolve
   the deferred Item 1 finding.

6. **Should-fix (Block C pin) — the current DOM is not yet in final FS field order because Name is
   inside the Idea block.** FS §4.2 assigns Name to Contact, after uploads, while the current form
   renders `clientName` before the idea description and `FIELD_ORDER` starts with it
   (`src/features/request/ui/RequestForm.tsx:55-64,271-287`). This is understandable at the B′
   checkpoint because Contact is intentionally unchanged, but the Handoff's claim that the form
   already matches the FS block order is not true yet. Block C must move Name into Contact and
   update `FIELD_ORDER` (as well as its persisted-field list) so final validation focus follows the
   final DOM order.

### Focus-question results

- **Persistence loop-safety:** no infinite-render or stale-closure path found for the current
  string-only field list. `watchedKey` changes only with serialized values, and the effect closes
  over the matching `watched` render. It does cause one additional store-driven render per real
  field change, but not a loop.
- **Retry gating:** the expected application paths are split correctly: client oversize and server
  400 are validation/remove-only; 429, 5xx, and XHR network failure are transport/retry; expired
  handles are recoverable by re-upload and therefore expose Retry. No new external boundary is
  introduced by this block; the existing 4 MB/Vercel boundary remains unchanged.
- **Scroll order:** `FIELD_ORDER` matches the current rendered controls, subject to Finding 6, but
  the server-error focus half is missing (Finding 3).
- **RHF hydration/reset:** supplying persisted values through `defaultValues` avoids an
  uncontrolled-to-controlled transition, and `resetDraft()` clears the field bag on success. The
  unsupported part is the deliberate eligibility exclusion (Finding 2).
- **Block C:** it must replace the old contact keys in `PERSISTED_FIELDS`, move `clientName` into
  Contact, and update `FIELD_ORDER`; the generic string bag itself does not obstruct that work.

### Verification

- `pnpm lint` — PASS (0 errors; 1 pre-existing `no-img-element` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (27 files, 294 tests).
- `git diff --check` — PASS.

## Response 1

All six findings **accepted and fixed**. Two blockers were genuine scope gaps (I under-built §4.5
failure behavior and wrongly excluded eligibility from persistence). Gates re-run green (301 tests,
+7) and the form was re-driven in the browser to confirm the new DOM order.

1. **Blocker 1 (network/server failure recovery + A.4 fallback missing) — accepted, fixed.** Added a
   consecutive-failure counter (`failedAttempts`). A technical failure now shows
   `errorDetailsPreserved` ("…your details are still here…"); after ≥2 consecutive failures it
   additionally shows the **verbatim A.4** `errorInstagramFallback` with an owner-configurable
   `INSTAGRAM_HANDLE` (isomorphic config, placeholder + TODO like the intro/age threshold). A
   validation rejection resets the counter (not a technical failure); success resets it. Tests:
   fallback absent after 1, present after 2, reset after success, and never surfaced by a validation
   rejection.
2. **Blocker 2 (eligibility not persisted) — accepted, fixed.** `eligibility` is now in
   `PERSISTED_FIELDS`, stored as `"true"`/`""` and re-hydrated (`saved.eligibility === "true"`). The
   "not restored" test was flipped to "restored". You were right — client-side navigation is the same
   session the guarantee covers, and I could not override the recorded D-Blueprint 5(a) decision in
   IMPL.
3. **Should-fix 3 (server-error scrolled but not focused) — accepted, fixed.** The server path now
   computes the first field via `FIELD_ORDER`, calls `setFocus(first)` and scrolls it. Test asserts
   the earlier-in-DOM field (idea) takes focus when both idea and email are flagged.
4. **Should-fix 4 (idea counter missing) — accepted, fixed.** The idea field watches its length and
   shows `{count}/{max}` once within the near-limit threshold (≥900 of 1000); a static hint below
   that. Test: no counter when short, "950/1000" near the limit. Also added `maxLength={1000}`.
5. **Should-fix 5 (submit not click-to-wait) — accepted, fixed.** The CTA is now disabled only while
   `isSubmitting`, not while uploading — the click is accepted, `onSubmit` `await`s `waitForUploads()`
   (resolves when no slot is `uploading`, via a store subscription), then builds the payload from a
   fresh `getSnapshot()`. Test: with a slot mid-upload, the click yields no POST until the slot flips
   to `uploaded`, and the resulting FormData carries its handle.
6. **Should-fix 6 (Name in Idea block, not Contact) — accepted, fixed.** Moved `clientName` into the
   Contact section (FS §4.2 field 8) and reordered `FIELD_ORDER` accordingly. Re-verified in the
   running app: DOM order is now idea → project details → uploads → **Name (Contact)** → contact
   fields → eligibility → Submit. The Handoff's "matches FS block order" claim is now actually true;
   Block C no longer inherits this move.

### Focus-question confirmations (yours, retained)

Your analysis matched: persistence has no loop/stale path; retry-gating splits all failure classes
correctly; RHF hydration avoids uncontrolled→controlled. Those areas were unchanged by the fixes.

### Итог для владельца (RU)

Codex дал 2 блокера + 4 should-fix — все приняты и исправлены, гейты зелёные (301 тест), форму
перепроверил в браузере:
1. **Сбой отправки**: теперь «ваши данные на месте» + после 2 неудач подряд — Instagram-fallback
   (A.4 дословно, хэндл в конфиге-заглушке).
2. **Eligibility** теперь переживает навигацию (я ошибочно исключил — правило требует «все значения»).
3. Серверные ошибки теперь **фокусируют** первое поле, не только скроллят.
4. **Счётчик символов** идеи у лимита (950/1000).
5. **Кнопка Submit**: клик принимается во время загрузки, ждёт догрузки, потом шлёт (файлы не теряются).
6. **Имя** переехало в блок Контактов (по FS §4.2), порядок DOM теперь верный.

Consensus достигнут. Дальше: предложу коммит B′.

## Consensus

- **Finding 1 (blocker, A.4 failure recovery)** — accepted; failure counter + details-preserved +
  A.4 fallback + `INSTAGRAM_HANDLE` config, with tests.
- **Finding 2 (blocker, eligibility persistence)** — accepted; eligibility persisted + re-hydrated.
- **Finding 3 (should-fix, server-error focus)** — accepted; `setFocus` on first server field.
- **Finding 4 (should-fix, idea counter)** — accepted; near-limit counter + maxLength.
- **Finding 5 (should-fix, click-to-wait submit)** — accepted; `waitForUploads()`, CTA enabled while
  uploading.
- **Finding 6 (should-fix, Name → Contact)** — accepted; moved + `FIELD_ORDER` updated + re-verified.
- No rejected findings. No deferred work. `INSTAGRAM_HANDLE` and the intro copy are owner-authored
  placeholders (flagged), to be set in the Stage 6 content pass — not review debt.
