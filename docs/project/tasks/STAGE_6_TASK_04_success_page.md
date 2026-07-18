# Task: Stage 6 — Success page (Item 4)

## Status

`ready` · created 2026-07-18 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

## Execution

- Executor: `claude` (a new gated public route + a change to the request submit flow — the store
  transport, one-time-read semantics, and bfcache gate are concurrency/recovery-sensitive; not a
  mechanical change. Not delegable per AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex.)
- Baseline: **the commit that introduced this task file** — no hash written here (a file cannot name
  the commit that carries it). The executor derives it (`git log -1 --format=%H -- <this file>`) and
  stops only if its Allowed Write Surface has moved/dirtied since — not merely because HEAD advanced.
- Reviewer: `claude` + mandatory independent Codex cross-review to consensus (AI_CROSS_REVIEW.md).
- Allowed Write Surface: `app/[locale]/(public)/success/` (new route), `src/features/request/ui/RequestForm.tsx`
  (submit flow: inline success → store + redirect), `src/features/request/store/` (only if the
  success/clearing wiring needs a helper — the shape already exists), `src/shared/i18n/messages/en.json`
  (`request`/new `success` copy), any new component files under `src/features/request/ui/` for the
  Success view, the tests for the above, and the PROJECT_* reporting docs.
- May touch dependencies / migrations / generated files / shared docs: **no** (no dep, no migration —
  this is client-only; the request is already persisted by the time Success renders).

## How to run (session settings)

- Model: Opus (gating a public route + touching the submit flow on a recovery-sensitive path).
  Sonnet only if the owner judges the plan de-risks it.
- Start mode: Plan mode (mandatory). The plan MUST carry a "Deviations from the task file" section.
- Switch to edit/acceptEdits only after the plan is approved.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md.
2. Stage 6 Source of Truth:
   - **FS §3.4 (Success)** — the six required items **in order**: (1) confirmation, no further action;
     (2) reference code (§4.6); (3) 48-hour expectation (PRD D5); (4) contact echo — every method the
     visitor provided, **displayed as entered** (method name + value, unmasked), a mobile list rendered
     from data, not a sentence; (5) per-method channel note (Appendix A.2); (6) primary CTA "Back to
     Home". Gating: reachable only immediately after a successful submission; opened directly /
     refreshed / reached without a submission → redirect to Home.
   - **FS §2** — Success's single primary CTA is "Back to Home"; no competing CTA.
   - **FS Appendix A.2** — the five channel notes (Email, Phone, WhatsApp, Instagram, Telegram),
     normative copy. Not yet in `en.json` — this task adds them.
   - **PRD D5** (48-hour promise), **D3** (reply via the provided channel).
   - PROJECT_DECISIONS.md — **"Success page (FS §3.4) — decided 2026-07-13, batch 2"**: the full
     access/data mechanics — module-store transport with a **clean URL** (no query/path data),
     mount gate (empty store → redirect Home), **one-time read** (payload cleared after render;
     robust to React strict-mode double-invoke), **bfcache guard** (`pageshow` + `event.persisted`
     re-runs the gate), and **form-state clearing on successful submit** (both the success payload,
     after display, and the D-Blueprint 5(a) field bag).
3. **Shipped code to read before designing (verify, don't assume):**
   - `src/features/request/store/requestDraft.ts` — `SuccessPayload = { referenceCode,
     contactMethod, contactValue }` (single method — the field model provides exactly one),
     `setSuccess()` (**defined but currently unused**), `getSnapshot()`, `resetDraft()` (mints a
     fresh state, so it also clears `success` — mind the ordering vs. one-time read), `useRequestDraft`.
   - `src/features/request/ui/RequestForm.tsx` — the submit success branch (~line 242): currently
     `setReferenceCode()` + `status="success"` (inline block, ~line 312) + `resetDraft()`. The
     contact echo never reaches a payload today. **This task rewires it:** build a `SuccessPayload`
     from `data.contactMethod`/`data.contactValue` (the **raw entered** values the client holds at
     submit — confirmed available at ~lines 228–229, before any server normalization) + the returned
     `referenceCode`, call `setSuccess()`, then navigate to `/success`. Clear the field bag on
     success (already done for slots by `resetDraft`; confirm the field bag is cleared too).
   - The existing public routes under `app/[locale]/(public)/` and their `layout.tsx` (nav + footer
     shell already mounted). `src/shared/i18n` `Link`/`useRouter` for client-side navigation.

## Goal

Introduce `/success` as a real gated route that renders FS §3.4's six items in order from the
module store, and switch the request submit flow from its interim inline success block to
store-transport + client-side navigation to `/success` — with the gate, one-time read, bfcache
guard, and form-state clearing the blueprint requires.

## Scope

1. **New route `app/[locale]/(public)/success/page.tsx`** rendering FS §3.4's six items in order
   from `SuccessPayload`: confirmation; reference code; 48-hour expectation (PRD D5); contact echo
   (method name + value **as entered**); the A.2 channel note for that method; "Back to Home" CTA
   (the single primary CTA, FS §2). The contact echo is rendered **method-agnostically** from the
   payload so a future method needs no change here (FS §3.4 item 4).
2. **Gate + transport (blueprint "Success page").** On mount, read the store; empty → immediate
   client-side redirect to Home. Clean URL (no query/path data). **bfcache guard:** listen for
   `pageshow`, and on `event.persisted === true` re-run the gate.
3. **One-time read.** After Success renders the payload, clear it; the mechanism must be robust to
   React strict-mode double-invocation (a naive read-then-clear that redirects itself is the trap
   the blueprint calls out). Any revisit finds the store empty → redirect.
4. **Rewire submit success in `RequestForm.tsx`:** replace the inline success block with
   `setSuccess({ referenceCode, contactMethod, contactValue })` (raw entered values) + navigate to
   `/success`. Ensure the field bag (D-Blueprint 5(a)) is cleared on success so returning to Request
   in the same session shows an empty form. Remove the now-dead inline-success code path and its
   local `referenceCode`/`status==="success"` machinery.
5. **A.2 copy into `en.json`** — the five channel notes (Email/Phone/WhatsApp/Instagram/Telegram),
   plus the Success page's own strings (confirmation line, 48-hour line, "Back to Home", contact-echo
   labels). Reuse `successReferenceCode` if suitable; do not duplicate copy.

## Out of Scope

- **Item 10** (abuse mitigation) — unrelated.
- **Any change to the persistence/adoption path or the API** — the request is already persisted
  before Success renders; this task is client-only.
- **Re-opening FS §3.4 content or order** — fixed by the FS; render it, don't redesign it.
- **Visual/styling design** beyond a clean, mobile-first, accessible default — the Stage 6 visual
  pass owns polish. (Do render a coherent, readable page — "no styling" is not the goal; "no
  bespoke visual design decisions" is.)
- **Admin side** — untouched.

## Completion obligations

```text
- CO-1 — Live end-to-end: a real submit navigates to /success showing the code, the 48-hour line,
  the entered contact method+value, and that method's A.2 note; Back to Home works.
  - Required by: FS §3.4 + §6.5 acceptance. Not covered by unit tests alone (the gate/bfcache/redirect
    behave differently in a real browser). Disposition: executor fills with checkable evidence
    (a submitted request's code shown on /success, the echo matching what was entered).
- CO-2 — Gate verified in a real browser: opening /success directly, refreshing it, and browser-back
  onto it after leaving all redirect to Home (the last one exercises the bfcache guard).
  - Required by: FS §3.4 gating sentence + §6.5. Disposition: executor fills (what was tried, what
    redirected).
- CO-3 — No migration, no new env var, no dependency.
  - Disposition: expected None; confirm at close (client-only task).
```

## Review Granularity

Expected to be **single** (one block, one review at the end): the surface is one new route + one
localized change to the submit flow + store wiring + copy — likely under the size trigger (16
execution-affecting files / 500 churn). Measure the actual surface before the final review and
record it here; if it unexpectedly crosses the trigger (e.g. the submit-flow rewire ripples wider
than expected), split into a store/flow block and a page block, contract-first — but do not
manufacture two blocks if the change stays small.

## Workflow (enforced)

1. Read Context + shipped code; confirm understanding in 3–5 lines.
2. Present the plan (with "Deviations from the task file"); wait for explicit approval.
3. Implement within Scope; `pnpm qg` green.
4. Test coverage per PROJECT_TESTING_STRATEGY.md: the gate (empty store → redirect), one-time read
   (second mount redirects), and the submit-flow rewire (success sets the payload + navigates, and
   clears the field bag). bfcache is browser behavior — cover what unit tests can and verify the rest
   live (CO-2).
5. Independent Codex cross-review to consensus (AI_CROSS_REVIEW.md); this IMPL session owns the fix
   loop through consensus and commit (AI_TASK_PROTOCOL.md — Post-Review Fix Loop).
6. If anything requires a PRD/FS change, STOP and escalate (Stage 6 Product Documentation Authority).
   Nothing in this task should — FS §3.4 and the blueprint fully specify it.

## Acceptance Criteria

- `/success` renders FS §3.4's six items in order from the store; the contact echo shows the method
  and the value **as entered**; the A.2 note matches the method (FS §6.5).
- Opening `/success` directly, refreshing, or reaching it without a submission redirects to Home;
  browser-back onto it after leaving redirects too (bfcache guard) (FS §6.5).
- The reference code shown is the one returned by the submit (FS §6.5).
- Success presents exactly one primary CTA, "Back to Home", and no competing CTA (FS §2, §6.10).
- A successful submit clears both the success payload (after one display) and the field bag; a
  second visit to `/success` redirects; returning to Request shows an empty form.
- `pnpm qg` green; CO-1/CO-2 verified live.

## Reporting

- Update PROJECT_STAGE_LOG.md (progress); PROJECT_DECISIONS.md only if a decision is refined
  (not expected — blueprint is complete).
- Reconcile `## Completion obligations` before closing.
- Update `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md` Item 4 row; set Status `done` (date +
  stage-log pointer, no commit hash); move this file to `docs/project/tasks/done/`; propose the
  commit for owner approval after the cross-review reached consensus.
