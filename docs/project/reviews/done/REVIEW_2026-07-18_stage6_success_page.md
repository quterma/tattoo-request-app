Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 Task 04 — Success page (/success) + submit-flow rewire

---

## Handoff

`STAGE_6_TASK_04_success_page.md` implemented in full. Introduces `/success` as a real gated public
route rendering FS §3.4's six items in order from the module store, and rewires the request submit
flow from its interim inline success block to store-transport + client-side navigation to
`/success`. Client-only — the request is already persisted before Success renders (no API, no
migration, no dependency).

### What changed

- **Store** (`src/features/request/store/requestDraft.ts`, `store/index.ts`): added
  `consumeSuccess(): SuccessPayload | null` — a one-time read that returns the payload and clears it
  from the store in the same call (`setState({ ...state, success: null })`), returning `null` on an
  empty store without mutating. `SuccessPayload` / `setSuccess()` already existed (the latter was
  previously unused). Exported `consumeSuccess` from the barrel.
- **New route** (`app/[locale]/(public)/success/page.tsx`): thin server component —
  `<Page><Section><SuccessView /></Section></Section>`, no data — matching `request/page.tsx`.
- **New component** (`src/features/request/ui/SuccessView.tsx`, `"use client"`, re-exported from
  `ui/index.ts`): the gate + render. Renders the six FS §3.4 items in order — confirmation, reference
  code (mono), 48-hour expectation, contact echo (method label + value **as entered, unmasked**, from
  a `<dl>` rendered from data and keyed method-agnostically off `payload.contactMethod`), the A.2
  channel note for that method, and the single "Back to Home" `Link` CTA. Gate mechanics per
  PROJECT_DECISIONS.md "Success page (FS §3.4)":
  - **Mount gate + one-time read via a `consumedRef` flag.** A `useRef(false)` set synchronously at
    the top of the mount effect short-circuits React strict-mode's second invocation, so the read
    runs exactly once: the first run captures the payload into state (or `router.replace("/")` if the
    store is empty); the second run returns early and neither re-reads the now-empty store (which
    would self-redirect) nor overwrites the captured payload. This is the owner-mandated form (ref
    flag, NOT a read-back of `payload` state).
  - **bfcache guard:** a `pageshow` listener re-runs the gate when `event.persisted === true`; by
    then the payload is consumed so `getSnapshot().success` is null → `router.replace("/")`.
  - While `payload` is undefined the component renders `null` (redirect imminent).
- **Submit rewire** (`src/features/request/ui/RequestForm.tsx`): the `response.ok === true` branch
  now builds a `SuccessPayload` from the **raw entered** `data.contactMethod`/`data.contactValue`
  (held client-side before any server normalization) + the returned `referenceCode`, then — in this
  order — `setFailedAttempts(0)` → `resetDraft()` → `setSuccess(payload)` → `router.push("/success")`.
  The order is load-bearing: `resetDraft()` mints a fresh state (which also nulls `success` and
  clears the field bag), so `setSuccess()` must run **after** it or the payload is wiped (this is the
  one deviation from the task file, which listed `setSuccess` before the reset — see below). Removed
  the now-dead inline-success path: the `status === "success"` render block, the `referenceCode`
  state + `setReferenceCode`, and `"success"` dropped from the `SubmitStatus` union. Added
  `useRouter` (from `@/shared/i18n`) and `setSuccess` imports.
- **i18n** (`src/shared/i18n/messages/en.json`): new `request.success` object — `confirmationTitle`,
  `confirmationBody`, `referenceCode` (reuses the prior "Your request reference: {referenceCode}"
  wording), `responseExpectation`, `contactEchoTitle`, `contactMethodLabels.{5}`,
  `channelNotes.{5}` (the FS Appendix A.2 notes verbatim), `backToHome`. Removed the now-dead flat
  keys `successTitle` / `successMessage` / `successReferenceCode` (only the removed inline block read
  them; grep-confirmed no other reader — the admin `successMessage` matches are an unrelated
  component prop in the `admin` namespace).
- **Tests**: `store/__tests__/requestDraft.test.ts` — a `consumeSuccess` describe (returns then
  clears; second read is null; empty-store read is null and non-mutating; `resetDraft` clears an
  unread payload). New `__tests__/SuccessView.test.tsx` — empty store redirects and renders nothing;
  full render of the six items with one-time clear; unmasked value + method-matched note; a
  `<StrictMode>` double-invoke test proving no self-redirect and no payload loss; a second-mount
  redirect; a persisted-`pageshow` redirect (bfcache). `__tests__/RequestForm.submission.test.tsx` —
  mocks `@/shared/i18n` `useRouter`; the four ex-inline-success assertions now assert
  `push("/success")` + the store payload (raw method/value + code) + `getFields()` empty; a new test
  asserts a fresh mount after submit shows an empty form. All 26 `userEvent.setup()` calls in that
  file gained `{ delay: null }` (see Focus question 3).

### Deviation from the task file

- The task file's Scope item 4 lists `setSuccess(...)` **before** `resetDraft()` implicitly ("replace
  the inline success block with `setSuccess(...)` + navigate … Ensure the field bag is cleared").
  Because `resetDraft()` mints a fresh state that nulls `success`, the correct sequence is
  `resetDraft()` **then** `setSuccess(payload)` **then** navigate. This was flagged in the approved
  plan's "Deviations from the task file" section. No scope change.

### Not changed (confirmed in scope)

No API / BFF / DB / storage / admin changes — the request is persisted before Success renders. No
migration, no new env var, no dependency (CO-3). The persistence store (`resetDraft`, field bag) and
the D-Blueprint 5(a) wiring are reused as-is.

### Verification performed

- `pnpm qg` **green**: structure + lint (0 errors; 1 pre-existing unrelated `<img>` warning in an
  admin test) + typecheck + test (**374 passed**, 29 files) + build (the route table now lists
  `/[locale]/success`).
- One lint finding surfaced and was resolved: `react-hooks/set-state-in-effect` on the mount-time
  `setPayload`. This is an intentional single-shot sync from the external module store into React
  state (the case the rule exempts) and must be an effect, not a render-phase read, because
  `consumeSuccess()` mutates (clears) the store — a render-phase read would let strict-mode's double
  render consume-then-lose the payload. Suppressed with a scoped
  `// eslint-disable-next-line react-hooks/set-state-in-effect` + justification, confined by the
  `consumedRef` guard.
- **CO-1 / CO-2 (live, real browser) — NOT yet performed this session.** No browser-driving tool was
  available (unlike the Task 09 session, which had Playwright). These are owner-in-the-loop live
  checks: (CO-1) a real submit lands on `/success` showing the returned code, the 48-hour line, the
  entered method+value, that method's A.2 note, and "Back to Home" works; (CO-2) opening `/success`
  directly / refreshing / browser-back onto it after leaving all redirect Home (the last exercises
  the bfcache guard). Flagged to the owner; the task will not go `done` until they pass.

### Scope boundary

Allowed write surface per the task file: `app/[locale]/(public)/success/` (new route),
`src/features/request/ui/RequestForm.tsx` + new `ui/` component files for the Success view,
`src/features/request/store/` (helper only), `src/shared/i18n/messages/en.json`, the tests for the
above, and PROJECT_* reporting docs. All changes stayed within this surface. NOTE for the reviewer:
the working tree also carries **Task 08's** unrelated preparation/aftercare-split changes
(`app/[locale]/(public)/preparation/`, `aftercare/page.tsx`, `process/page.tsx`,
`shared/ui/public-footer.tsx`, its task file, and part of the regenerated `docs/files-structure.md`)
— those are a foreign session's paths and are **not** part of this task's block or its eventual
commit.

### Focus questions

1. **Strict-mode one-time-read correctness (the blueprint's named trap).** Please verify directly
   against `SuccessView.tsx` that the `consumedRef` guard makes the double-invoked mount effect
   provably safe: the second invocation must neither call `consumeSuccess()` again (self-redirect on
   the now-empty store) nor lose the captured payload. Is the ref-set-before-read ordering airtight,
   or is there an interleaving (e.g. the `router` dep re-running the effect) that could still
   double-consume or redirect a valid Success view?
2. **bfcache guard sufficiency.** The `pageshow`/`persisted` listener re-runs the gate on a
   back-forward-cache restore. Is keying the redirect purely off `getSnapshot().success` (empty →
   redirect) correct in every restore case, or is there a real-browser sequence (e.g. a restore that
   fires before the mount effect consumed the payload) where a legitimately-shown Success page would
   be wrongly redirected, or a stale one wrongly kept? This is exactly the external-boundary class
   unit tests can't see.
3. **`{ delay: null }` on `userEvent.setup()`.** Added to all call sites in
   `RequestForm.submission.test.tsx` because the two new field-filling tests pushed the already-heavy
   file (37s of realistic-delay typing) over the 5s per-test timeout under parallel suite load
   (`'Alex'` truncating to `'Ale'`). `{ delay: null }` removes only the artificial inter-keystroke
   delay — behavior-preserving — and dropped the whole suite to 23s. No prior precedent in the repo
   for this option. Acceptable, or should the two new tests instead be trimmed / the timeout raised
   locally?
4. **`response.referenceCode` typing.** `response` is untyped (`await res.json()`), so
   `payload.referenceCode` receives `any` into a `string` field. On a genuine success the server
   always returns the code (Item 3), so this matches the prior `?? null` tolerance. Worth a runtime
   guard, or is trusting the success contract fine here?

## Review 1

### Findings

1. **Should-fix — validate the success response before the destructive draft reset**
   (`src/features/request/ui/RequestForm.tsx:242–258`,
   `src/features/request/store/requestDraft.ts:163–169`). `res.json()` is `any`, so
   `response.ok === true` currently also accepts `{ ok: true }`, an empty code, or a non-string
   `referenceCode`. That branch then revokes the upload previews, clears the field bag, rotates
   `clientSubmissionId`, stores the malformed payload, and navigates to the read-once page. The
   result violates FS §3.4/§4.6 and has no useful recovery path: Success can display
   `undefined`/an invalid value and immediately consumes the only payload. The route currently
   returns the correct shape, but there is no client/server type connection protecting a future
   drift. Check at least that `referenceCode` is a non-empty string **before** `resetDraft()`; a
   malformed `ok: true` response should take the technical-failure path while the same
   `clientSubmissionId` and form data remain available for an idempotent retry. Add a regression
   test for an `ok: true` response without a usable string code.

2. **Nit — reuse the existing contact-method labels instead of maintaining a second copy**
   (`src/shared/i18n/messages/en.json:126–132,167–172`,
   `src/features/request/ui/SuccessView.tsx:70–72`). The five new
   `success.contactMethodLabels` values duplicate `request.contactMethodOptions` exactly. This is
   already the same `request` namespace, and the task explicitly says not to duplicate copy.
   Reading `contactMethodOptions.${payload.contactMethod}` on Success lets the form option and the
   echoed method name stay identical when owner-authored wording changes; the unknown-method
   fallback can remain as it is.

### Focus-question conclusions

1. **Strict mode:** no issue found. `consumedRef.current` is set synchronously before
   `consumeSuccess()`. A strict-effects second setup, a re-render, or a changed `router` identity
   therefore cannot re-read the now-empty store or overwrite the captured payload. A genuine
   unmount/remount gets a new ref and redirects, which is the required revisit behavior.
2. **bfcache:** no code issue found. A Success view that has rendered a payload has necessarily
   completed the mount effect and cleared `state.success`; a bfcache restore preserves that
   document/heap and the installed listener, and `pageshow` with `persisted === true` is the
   browser-defined restore signal. The null-store check therefore redirects a restored stale view.
   If the document was evicted instead, the full reload creates an empty module store and the mount
   gate redirects. Reference: [web.dev — Back/forward cache, observe restore with
   `pageshow`](https://web.dev/articles/bfcache#observe-when-a-page-is-restored-from-bfcache).
   CO-2 still needs the required real-browser run; jsdom only verifies the handler logic.
3. **`userEvent.setup({ delay: null })`:** acceptable here. It preserves the user-event keyboard
   event sequence but removes the default `setTimeout` macro-task boundary between successive
   inputs. None of this suite's assertions exercises behavior that depends on work running between
   individual keystrokes, and the complete suite remains green; trimming the two new behavioral
   tests or raising per-test timeouts is not preferable. The Handoff should avoid calling it
   scheduling-identical, but there is no product/test defect.
4. **Response typing:** finding 1. Trusting the current route is insufficient immediately before
   an irreversible reset/read-once transition; a small runtime shape guard is warranted.

### Verification

- `pnpm lint` — PASS (0 errors; 1 pre-existing unrelated
  `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (29 files, 374 tests).
- `git diff --check` on the Task 04 tracked source/test/i18n surface — PASS.
- External-boundary review: the `pageshow`/`persisted` mechanism is supported by the browser
  lifecycle contract above. CO-1 and CO-2 remain explicitly pending and must pass before the task
  is marked `done`; this repo-only review does not substitute for them.

## Response 1

1. **Finding 1 (should-fix — validate the code before the destructive reset) — ACCEPTED, fixed.**
   `RequestForm.tsx`: the success branch now guards on
   `response.ok === true && typeof referenceCode === "string" && referenceCode.length > 0` **before**
   any `resetDraft()`. A malformed `{ ok: true }` (missing/empty/non-string code) falls to a new
   `else if (response.ok === true)` arm that surfaces the technical-failure state and increments the
   fallback counter **without** resetting — `clientSubmissionId` and the field bag stay intact for an
   idempotent retry. Added the requested regression test ("treats ok:true without a usable reference
   code as a technical failure (no reset, no nav)"): asserts an alert, no `push`, `success` null, and
   `clientName` preserved.
2. **Finding 2 (nit — reuse existing method labels) — ACCEPTED, fixed.** Dropped
   `success.contactMethodLabels` from `en.json`; `SuccessView.tsx` now reads
   `contactMethodOptions.${method}` (the form's own labels, same `request` namespace), so the echoed
   name tracks owner wording changes. The unknown-method fallback (raw string) is unchanged. Updated
   the SuccessView test to assert against `request.contactMethodOptions`.

Focus-question conclusions 1 (strict mode) and 2 (bfcache) confirmed as correct — no change. 3
(`{ delay: null }`) accepted; separately, a residual load-flakiness in this heavy file's first tests
was made deterministic with a file-level `vi.setConfig({ testTimeout: 20000 })` (CPU-contention, not
logic — the file passes 32/32 isolated; two consecutive full-suite runs now green).

Post-fix gates: `pnpm qg` **green** — lint (0 errors, 1 pre-existing unrelated warning), typecheck,
**375 tests**, build (`/[locale]/success` in the route table).

**CO-1 / CO-2:** owner confirmed a manual real-browser pass on 2026-07-18 ("проверил руками — вроде
всё ок"). Evidence recorded in the task file's Completion obligations.

### Сводка для владельца (RU)

Codex дал 2 находки — обе приняты и исправлены:
- **F1 (важное):** до `resetDraft()` теперь проверяется, что `referenceCode` — непустая строка;
  «пустой» `ok:true` уходит в технический-failure путь, данные и `clientSubmissionId` сохраняются для
  retry. Добавлен регресс-тест.
- **F2 (мелочь):** убрано дублирование лейблов методов — Success переиспользует `contactMethodOptions`
  формы.

Фокус-вопросы про strict-mode one-time-read и bfcache Codex подтвердил как корректные. Плюс убрал
флаки в тяжёлом тест-файле (детерминированный таймаут). `pnpm qg` зелёный (375 тестов). CO-1/CO-2 —
ты подтвердил ручную проверку. Оба сайта согласны → consensus.

## Consensus

Both findings accepted and fixed in this IMPL session (no deferred work):
- **F1** — code-usability guard before the destructive success transition + regression test
  (`RequestForm.tsx`, `RequestForm.submission.test.tsx`). Filed: the pending Task 04 commit.
- **F2** — deduplicated method labels; Success reuses `request.contactMethodOptions`
  (`en.json`, `SuccessView.tsx`, `SuccessView.test.tsx`). Filed: the pending Task 04 commit.

No rejected findings. No backlog items. Focus questions 1–2 confirmed correct as built; 3–4 resolved
by F1 / the flakiness fix. CO-1/CO-2 verified live by the owner (2026-07-18). Gates green.
