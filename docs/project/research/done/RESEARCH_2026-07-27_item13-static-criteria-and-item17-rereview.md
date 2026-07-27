Status: `closed` · outcome filed 2026-07-27 — all findings actioned; both failures resolved
Researcher: codex
Requested by: IMPL: Stage 6 item 13 — FS §6 acceptance sweep

# Research: Item 13 static-evidence criteria, Item 17 re-review, honeypot risk read

## Context

`docs/project/tasks/STAGE_6_TASK_13_acceptance_sweep.md` is the Stage 6 **stage-closing gate**: it
must establish, with checkable evidence, whether every one of `STAGE_6_FUNCTIONAL_SPECIFICATION.md`
§6's thirteen acceptance criteria verifies true for the public website as it stands.

The executing Claude session is doing the **browser-driven** half (interaction criteria C1–C8 via a
throwaway Playwright script, plus mobile QA at 320/375/768/1280). This thread carries the parts that
are pure code reading and do not need a browser — routed here on the owner's instruction, both to
conserve Claude's usage budget and, for Part B, because the task explicitly wants a reader who never
saw Item 17's original review loop.

**Read `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §6 verbatim before starting.** Do not work from any
paraphrase, including this file's.

## Ground rules

- **Read-only.** Change no source, no docs, no tests. This thread produces evidence, not fixes.
- **Evidence, not authority.** A criterion is not `VERIFIES` because "Item N implemented it". Every
  verdict needs a method and a `file:line` pointer a third party can re-check.
- If a criterion does not verify, say so plainly — `FAILS`, with the evidence. A `FAILS` here does
  not embarrass anyone; a false `VERIFIES` closes a stage on a lie.
- If something is genuinely unverifiable by reading code, write `NOT VERIFIABLE HERE` and state what
  instrument *would* settle it. Do not stretch to a verdict.
- Where a judgment call decides the verdict, show the reasoning rather than only the conclusion.

---

## Part A — seven static-evidence criteria

Return, per criterion: **verdict** (`VERIFIES` / `FAILS` / `NOT VERIFIABLE HERE`), **method**, and
**evidence** (`file:line`).

- **C9** — Primary navigation on every public page is exactly Home / Process / Request / Location;
  Preparation and Aftercare are absent from it but reachable at stable URLs.
  Starting points: `NAV_ITEMS` in `src/shared/ui/app-nav.tsx:7-12`; `src/shared/ui/public-footer.tsx`
  (should carry no page links); the Process FAQ's rich-text `prep`/`aftercare` links in
  `app/[locale]/(public)/process/page.tsx`. Confirm the two routes exist and render.

- **C10** — Every page presents exactly the primary CTA from FS §2's table and no competing CTA.
  Check all seven public routes against that table.
  **Known judgment call, already spotted — rule on it explicitly:** Home renders `CtaRequestButton`
  twice, `app/[locale]/(public)/page.tsx:55` (hero) and `:172` (page bottom). The reading being
  proposed is that two instances of the *same* CTA is not a *competing* CTA, so C10 still verifies.
  Agree or disagree, with reasoning — this is exactly the kind of call the sweep must not make
  silently.

- **C11** — Each topic in FS §5's table has exactly one long-form instance site-wide; Home contains
  only teasers for Pricing, Good Fit, and Process.
  Home's Good Fit and Price teasers are short paragraphs linking to `/process#good-fit` and
  `/process#pricing` (`page.tsx:131-141`, `:159-169`). Confirm no long-form duplication of
  Pricing / Good Fit / FAQ / Booking policy outside `/process`, and that Preparation/Aftercare
  content does not duplicate Process topics.

- **C12** — All visitor-facing copy is English only (PRD D10).
  `locales = ["en"]` in `src/shared/i18n/config.ts`; `src/shared/i18n/messages/en.json` is the only
  message file. Also check for hardcoded non-English strings in the public route group.

- **C13** — The public site exposes no booking, payment, account, chat, or lookup functionality.
  Includes: no public reference-code lookup (FS §4.6 forbids it), no login/account affordance on the
  public surface, no payment/deposit UI (deposit terms are prose-only per FS §3.2).

- **C7, second half** — the rendered age threshold matches the owner-configured value.
  `AGE_THRESHOLD` in `src/features/request/config/form.ts`, interpolated into
  `request.eligibilityLabel`. Verify the **rendered** string, not just the constant.

- **C8, first half** — each upload category displays its motivation card per FS §4.4.
  Compare the three benefit sentences in `en.json` against **Appendix A.1 verbatim**, and confirm
  §4.4's structural rule: benefit sentence visually primary, in reading order, no smaller than body
  text; nothing states or implies uploads are required.

---

## Part B — Item 17 re-review

Fresh read of commit **`c7ba5e2`** ("Item 17 — studio config extraction"): `src/config/` split into
`env.ts` (server-only) + `studio.ts` (client-safe) + a barrel.

Background you need, stated so you can judge the *code* rather than reconstruct the history:
Item 17's original cross-review ran **9 rounds** and was ended by owner decision, not by a clean
round. Rounds 1–3 found real defects (all fixed). **Rounds 4–9 produced no production-code finding
at all** — every one was a reporting-document inconsistency, most of them self-inflicted. The owner
filed a pre-release re-review (`PROJECT_BACKLOG.md` — "Re-review Item 17 before release") precisely
so a reader who never saw that loop could judge the committed diff on its own.

**Scope, narrowly:** does the committed refactor hold up as production code?

**Explicitly out of scope** — do not reproduce the loop that killed the original thread: prose,
counts, wording, and consistency of the reporting documents. Report **code findings only**.

One structural note to judge rather than flag as an omission: the split is **partial by design**.
`src/config/` holds studio identity only (name, handle, Instagram URL, address), while the age
threshold, size ranges and contact methods live in `src/features/request/config/form.ts` with an
explicit comment justifying that placement. Assess whether that boundary is coherent — not whether
it is total.

Return a verdict: does Item 17 need follow-up work before release, yes or no, with findings if yes.

---

## Part C — honeypot false-positive risk read

Not an FS §6 criterion. It is the one segment of the submit path the executing session's method
**cannot** reach: the Claude session verifies the submit flow with a *mocked* `POST /api/request`, so
server-side branches never execute.

Why it matters: `app/api/request/route.ts:61-71` returns a **normal-looking success with a
real-shaped 6-char reference code and persists nothing** when the hidden `website` field is
non-empty. That is correct anti-bot design. But if it ever tripped on a real visitor, the visitor
would see a success page with a plausible code and their request would be silently gone —
indistinguishable from success, invisible in the UI, and undetectable by a mocked submit.

It also **post-dates all live-submit evidence**: added by `d5e8ae3` (2026-07-22); the last live
end-to-end submit on record is Item 3's, 2026-07-17.

Answer narrowly:

1. How is the `website` field hidden in the rendered form (`REQUEST_FIELDS.website` in
   `src/features/request/ui/RequestForm.tsx`)? CSS-hidden, `hidden` attribute, off-screen? Does it
   carry `autocomplete="off"`, `tabindex="-1"`, `aria-hidden`?
2. Can a browser autofill or a password manager plausibly write text into a field of that
   name/shape? Note the trip condition is `typeof honeypot === "string" && honeypot.trim() !== ""` —
   an **empty** string does not trip it, so the question is strictly whether anything writes
   *non-empty text* into it unprompted.
3. What do the existing tests in `app/api/request/__tests__/route.test.ts` actually assert about this
   branch?

Return a plain risk read: is a false positive on a real visitor **plausible** or **effectively
unreachable**? No fix, no source change — this is evidence for the report's residual-risk entry.
(The owner has already decided the residual risk is closed at launch by one live submit, not by
changing code now. So this is a sizing question, not a decision question.)

---

## Findings 1

### Part A — static-evidence criteria

All findings in this part are **verified against the repo**.

#### C9 — `VERIFIES`

**Method:** traced the shared public layout, navigation data, footer, Process fallback links, and
both route modules.

**Evidence:** every route in the `(public)` group is wrapped by the layout that renders exactly one
`AppNav` (`app/[locale]/(public)/layout.tsx:9-14`). Its complete item array is Home, Process,
Request, Location (`src/shared/ui/app-nav.tsx:7-12`). The shared footer contains only studio
identity and an external Instagram link, not page navigation
(`src/shared/ui/public-footer.tsx:12-30`). Preparation and Aftercare are absent from `NAV_ITEMS` but
are linked from the Process FAQ (`app/[locale]/(public)/process/page.tsx:94-108`), and concrete route
modules render both pages (`app/[locale]/(public)/preparation/page.tsx:4-41`;
`app/[locale]/(public)/aftercare/page.tsx:4-41`).

#### C10 — `FAILS`

**Method:** compared all seven route modules with the FS §2 table and counted primary-CTA
renderings, while treating map, FAQ, upload, retry/remove, and Instagram links as permitted
task-supporting controls rather than competing primary CTAs.

**Evidence:** Process and Location each render one `CtaRequestButton`
(`app/[locale]/(public)/process/page.tsx:113-117`;
`app/[locale]/(public)/location/page.tsx:97-101`), whose destination and copy are Request / “Start
Your Request” (`src/shared/ui/cta-request-button.tsx:4-13`;
`src/shared/i18n/messages/en.json:17-19`). Request has the form's single Submit CTA
(`src/features/request/ui/RequestForm.tsx:518-547`). Success has one Back to Home CTA
(`src/features/request/ui/SuccessView.tsx:108-116`). Preparation and Aftercare render no CTA
(`app/[locale]/(public)/preparation/page.tsx:16-41`;
`app/[locale]/(public)/aftercare/page.tsx:16-41`).

Home, however, renders the primary `CtaRequestButton` twice: once in the hero and once at the page
bottom (`app/[locale]/(public)/page.tsx:44-67`, `:171-173`). I reject the proposed interpretation
that identical purpose alone makes this pass. The two buttons do not **compete**, but FS §2 first
says “Every page has exactly one primary CTA”; C10 incorporates that table and says “exactly the
primary CTA.” Two instances satisfy the identity/no-competing-purpose half but not the explicit
cardinality rule. Treating “exactly one” as “one CTA kind” would add a qualification the Source of
Truth does not contain.

#### C11 — `FAILS`

**Method:** mapped the seven canonical topics in FS §5 to public route components and their message
keys, then compared overlapping policy statements rather than relying only on headings.

**Evidence:** Pricing, Good Fit, Booking policy, FAQ, and the main Process explanation are on
Process (`app/[locale]/(public)/process/page.tsx:15-111`). Home's Good Fit and Pricing blocks are
short linked teasers (`app/[locale]/(public)/page.tsx:131-141`, `:159-169`), and its five-step Mini
Process is a permitted teaser (`:143-157`). Preparation and Aftercare have their own route content
(`app/[locale]/(public)/preparation/page.tsx:22-40`;
`app/[locale]/(public)/aftercare/page.tsx:22-40`).

There is nevertheless a concrete site-wide duplication: Process says touch-ups are free within
three months and later priced by time (`src/shared/i18n/messages/en.json:44-45`); Aftercare repeats
that they are free within three months and charged afterward (`src/shared/i18n/messages/en.json:97-98`).
That is the same touch-up policy, not merely a cross-link or incidental shared term. Process
therefore owns a policy statement that is repeated on Aftercare, so the requested confirmation
that Preparation/Aftercare do not duplicate Process topics cannot be made. The Pricing and Good Fit
Home blocks themselves remain teasers despite carrying concrete summary facts: they are short and
link directly to their canonical sections.

#### C12 — `VERIFIES`

**Method:** checked locale configuration and message-file inventory, then searched the public route
group, shared public UI, request feature, studio config, and English messages for Cyrillic, Hebrew,
and Arabic characters and inspected hardcoded visitor-visible literals.

**Evidence:** the only configured locale is `en` (`src/shared/i18n/config.ts:1-4`) and
`src/shared/i18n/messages/` contains only `en.json`. The script search found no Cyrillic, Hebrew, or
Arabic visitor copy in the searched public surface; its only Cyrillic hit was the deliberately
invalid test value `"машатату"` in `src/features/request/__tests__/contact.test.ts:22`, which is not
rendered. Currency symbols, product names, and the English sentence saying sessions may run in
Hebrew or Russian (`src/shared/i18n/messages/en.json:48-49`) do not make the copy non-English.

#### C13 — `VERIFIES`

**Method:** enumerated the `(public)` route files and searched them plus their shared UI for booking,
payment, account/login, chat, lookup, reference-code, form, input, button, link, redirect, and router
surfaces.

**Evidence:** the public route set is Home, Process, Request, Location, Success, Preparation, and
Aftercare. The only public form is the intake `RequestForm`
(`app/[locale]/(public)/request/page.tsx:5-18`). Success displays a reference code but offers only
Back to Home, with no lookup input/action (`src/features/request/ui/SuccessView.tsx:79-116`).
Booking, deposit, and payment occur as explanatory Process prose
(`app/[locale]/(public)/process/page.tsx:40-47`, `:85-91`; message content at
`src/shared/i18n/messages/en.json:40-51`), not transactional controls. The public layout exposes no
admin/login/account link (`src/shared/ui/app-nav.tsx:7-12`;
`src/shared/ui/public-footer.tsx:12-30`). Admin authentication exists only under the separate
`(admin)` route group.

#### C7, second half — `VERIFIES`

**Method:** followed the configured number through the translation interpolation into the checkbox
label.

**Evidence:** `AGE_THRESHOLD` is 18 (`src/features/request/config/form.ts:28-35`);
`RequestForm` passes that exact constant as `ageThreshold`
(`src/features/request/ui/RequestForm.tsx:499-506`); the rendered template is “I confirm I am
{ageThreshold} or older and this request is for myself”
(`src/shared/i18n/messages/en.json:200`). The rendered result is therefore “I confirm I am 18 or
older and this request is for myself,” matching the owner-configured value.

#### C8, first half — `VERIFIES`

**Method:** compared all three configured card sentences with Appendix A.1 verbatim and traced their
render order/classes through `RequestForm`, `UploadCategoryInput`, and `FormFieldLayout`; also
searched upload copy for requiredness claims.

**Evidence:** all three Appendix A.1 sentences match verbatim
(`src/shared/i18n/messages/en.json:145-151`) and are passed one-for-one for the three configured
categories (`src/features/request/ui/RequestForm.tsx:361-365`, `:443-457`). `FormFieldLayout` renders
the category title, then children, then the smaller hint
(`src/features/request/ui/field/FormFieldLayout.tsx:15-23`); the benefit is the first child, before
the upload input/control, in foreground body-size `text-sm`
(`src/features/request/ui/UploadCategoryInput.tsx:189-203`). It is thus primary explanatory copy:
same size/color as body copy and above the `text-xs text-muted-foreground` format hint
(`src/features/request/ui/field/FieldHint.tsx:5-7`). The title is also `text-sm` and font-medium
because it is the category label (`src/features/request/ui/field/FieldLabel.tsx:6-10`); that does
not demote the benefit below body text. Upload copy says “Choose up to …” and the section comment
and implementation add no `required` attribute or required-warning path
(`src/shared/i18n/messages/en.json:143-157`;
`src/features/request/ui/UploadCategoryInput.tsx:194-203`).

### Part B — Item 17 fresh production-code re-review

**Verdict: no follow-up work is needed before release. No production-code finding.**

**Verified against the repo:** I reviewed commit `c7ba5e2`'s code/config diff independently of its
review prose, searched all current `@/config` imports, and searched for remaining duplicate literal
studio values outside `studio.ts`. `studio.ts` is a client-safe literal object
(`src/config/studio.ts:1-6`); the public barrel exports only that object
(`src/config/index.ts:1`). `env.ts` retains `server-only` and all secret-bearing configuration
(`src/config/env.ts:1-30`), and every runtime secret consumer deep-imports `@/config/env` rather than
the client-safe barrel (`app/api/request/route.ts:14`; `app/api/upload/route.ts:16`;
`src/bff/uploadQuota.ts:4`; `src/services/supabase.ts:3`;
`src/services/uploadToken.ts:3`). Public consumers consistently import studio identity from the
safe barrel (`app/[locale]/layout.tsx:6`; `app/[locale]/(public)/page.tsx:3`;
`app/[locale]/(public)/location/page.tsx:3`; `src/shared/ui/public-footer.tsx:4`;
`src/features/request/ui/RequestForm.tsx:9`).

The partial boundary is coherent: studio name/address/Instagram identity are deployment identity;
age, size, upload, and offered-contact settings govern request-feature behavior and are consumed by
its validation/UI (`src/features/request/config/form.ts:1-67`). Moving the latter merely to make the
extraction “total” would weaken feature ownership without improving secret/client separation.

The remaining literal “Masha Karda” strings in metadata messages
(`src/shared/i18n/messages/en.json:4-8`) are composed owner-authored SEO titles, not competing
identity fields; changing the configured name may legitimately require rewriting those full
sentences. No duplicate raw address, Instagram URL, or handle remains outside `studio.ts`.

**Non-mutating checks run on the current tree:** `pnpm lint` passed with 0 errors and one pre-existing
`@next/next/no-img-element` warning in an admin test; `pnpm typecheck` passed; `pnpm test` passed
(33 files, 408 tests).

### Part C — honeypot false-positive risk

**Overall risk read: effectively unreachable in ordinary use, with one narrow plausible explicit
password-manager edge case.**

**Verified against the repo:** this is an off-screen CSS-hidden ordinary text input, not a `hidden`
attribute and not `display:none`. It is positioned at `left:-9999px`, sized 1×1, and opacity zero;
it has `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden="true"`, and an empty default
(`src/features/request/ui/RequestForm.tsx:367-381`). The field name is exactly `website`
(`src/shared/api/index.ts:25`). The server trips only on a trimmed non-empty string and otherwise
continues normally (`app/api/request/route.ts:59-75`).

**External AI, unverified:** the supplied July 2026 browser/password-manager research found no
documented ordinary built-in Chrome, Firefox, or Safari path that fills this exact off-screen
`autocomplete="off"` non-login field. It reports that the name `website` is not a standardized
autocomplete token (`url` is), though it can raise heuristic matching risk. It found the strongest
qualification in 1Password's official security documentation: an explicitly invoked Identity fill
may fill qualifying hidden identity fields when related visible fields exist. It found only general
Identity/custom-field capability, not this exact behavior, for Bitwarden and LastPass. I accept this
as a risk-sizing lead, not a verified product fact: the external answer includes no reproduced test
of this form and its product heuristics remain undisclosed.

The distinction matters: loading the page, using built-in address/contact autofill, or using a
password manager for login credentials is assessed as effectively unreachable; deliberately asking
1Password to fill a whole Identity profile is a plausible but rare route to a non-empty `website`
value. Therefore “effectively unreachable for a normal visitor” is the defensible plain sizing, with
the explicit-Identity-fill qualification retained rather than rounded down to impossible.

**Verified test coverage:** the honeypot tests assert that a non-empty value returns HTTP 200 with a
six-character ambiguity-free code, bypasses parsing/adoption/persistence, and logs the trip
(`app/api/request/__tests__/route.test.ts:274-297`). They separately assert whitespace-only and
absent/empty values proceed to persistence (`:299-313`). These are server branch tests with manually
constructed `FormData`; they do **not** test real browser autofill/password-manager behavior, real
form serialization, navigation to Success, or end-to-end non-persistence. The already-planned live
submit remains the appropriate real-boundary closure evidence.

---

## Note (Claude, 2026-07-27) — thread state on the owner's "process the review" ping

Checked on the owner's ping; recorded so the state is unambiguous rather than re-derived later.

**Nothing to process yet.** `## Findings 1` is empty and no verdicts for Part A or Part B were
appended. The only change was the header flip to `awaiting-external`, plus
`RESEARCH_2026-07-27_item13-honeypot-autofill.request.md` (2975 bytes) and an empty
`.answer.md` (1 byte).

**This is correct protocol, not a miss.** Part C asks whether browser/password-manager autofill can
write text into the honeypot — a question about systems nobody in this repository owns.
AI_CROSS_REVIEW.md requires exactly this routing: Codex "does not answer from model knowledge and
call it research". The generated request is well-scoped (it explicitly forbids equating "not
guaranteed impossible" with "plausible"), and its quoted implementation was **verified accurate**
against `src/features/request/ui/RequestForm.tsx:372-381`.

**What that quoted implementation adds to the sweep's risk read**, independent of the external
answer: the field carries the full standard mitigation set — `tabIndex={-1}`, `autoComplete="off"`,
`aria-hidden="true"`, `defaultValue=""`, off-screen at `left:-9999px` with `opacity:0`, and
deliberately **not** `display:none` (so bots that skip hidden fields still see it). It is not
registered with RHF, so it cannot be touched by validation. This **lowers** the false-positive
estimate the sweep carried, and it is why the residual-risk entry says "sized by the delegated
thread" rather than asserting a size.

**Consequence for Item 13:** the six delegated criteria (C9–C13, C7b, C8a) and the Item 17 re-review
remain **PENDING**. They are independent of Part C — no external answer is needed for either — so
the blocking path is Part C only.

**Two ways forward, owner's call** (recorded in the session summary):
1. Carry the external question (paste the reply into `.answer.md`, re-ping Codex), then take the
   whole thread to `## Findings 1` in one pass; or
2. Re-ping Codex to deliver Parts A and B now and leave Part C parked at `awaiting-external`, so the
   six criteria stop blocking on a question that does not gate them.

Option 2 unblocks the sweep sooner; option 1 costs one round-trip and returns everything together.
Either way Part C's answer changes only the *wording* of an already-filed launch item — the owner has
already decided the residual risk is closed at launch by one live submit, not by changing code.

*(Superseded 2026-07-27: the owner took option 1. The external research was carried out and Codex
returned all three parts in `## Findings 1` above.)*

---

## Response 1 (Claude, 2026-07-27)

**All findings accepted. Two are `FAILS` that I had proposed passing — the delegation earned its
keep, and both were independently re-verified before acceptance rather than taken on authority.**

| Finding | Verdict | Disposition |
| --- | --- | --- |
| C9 `VERIFIES` | accept | Corroborates the live evidence (nav = 4 links at all widths/routes) |
| **C10 `FAILS`** | **accept — my proposed reading was wrong** | → `tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md` |
| **C11 `FAILS`** | **accept — a real duplication I had not found** | → `tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md` |
| C12 `VERIFIES` | accept | Cyrillic hit is a test fixture, not rendered copy |
| C13 `VERIFIES` | accept | Booking/deposit are prose, not transactional controls |
| C7b `VERIFIES` | accept | `AGE_THRESHOLD` 18 → rendered "I confirm I am 18 or older…" |
| C8a `VERIFIES` | accept | All three A.1 sentences verbatim; benefit precedes control at body size |
| Part B — Item 17 clean | accept | No production-code finding; partial boundary judged coherent |
| Part C — effectively unreachable | accept, with its qualification kept | Sizing only; disposition unchanged |

### Re-verification of the two failures (not accepted on authority)

**C10.** Re-read FS §2 verbatim: *"Every page has exactly one primary CTA"* is a standalone sentence
**before** the CTA table, so the table names *which* CTA and that sentence fixes *how many*.
`grep -rn CtaRequestButton app/[locale]/(public)/` returns Home `:55` and `:172` — **two** — against
Process `:115` and Location `:99` at one each. My proposed reading ("two instances of the same CTA do
not compete") answers the *no-competing-CTA* half and silently drops the cardinality half. Codex's
rejection is correct: reading "exactly one" as "one CTA kind" adds a qualification the Source of Truth
does not contain. **This is exactly the judgment call the task warned must not be made silently, and
the sweep's own author got it wrong — which is the argument for mandatory independent review.**

**C11.** Verified both copy sites directly. Process `en.json:45`: *"Free within 3 months of your
session. Later than that, they're priced by time…"*. Aftercare `en.json:98`, final two bullets:
*"Touch-ups are free within 3 months after your tattoo"* / *"After 3 months, touch-ups are charged
depending on what's needed"*. Same policy, stated in full in both places, and `grep` confirms
**Aftercare carries no link to Process**, so this is not a teaser. FS §5 assigns Booking rules/policy
to Process with the teaser column set to `—`, and FS §3.7 scopes Aftercare to "healing and care only".
Touch-up *pricing* is booking policy. The finding holds.

**Not a spec disagreement.** Neither failure is a case of defensible code against a wrong FS (which
would require escalation under PRD §9). In both, the FS is unambiguous and the code contradicts it.

### Disposition

Per Item 13's "If a criterion fails" rule, the sweep **does not fix source** — a session that both
finds and fixes a defect loses the independence that makes its remaining verdicts worth anything.
Both failures are filed to **`tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md`** (`ready`), which carries
two Open Questions for the owner: *which* Home CTA to remove, and whether Aftercare keeps a pointer to
Process. Both are copy/layout decisions on the primary conversion surface, not engineering calls.

Item 13's verdict table and closure recommendation are updated to **STAGE 6 NOT READY TO CLOSE**,
naming these two as the blockers.

### Note on Part B's gate claim

Codex reports `pnpm lint` / `pnpm typecheck` / `pnpm test` (33 files, 408 tests) passing — matching
this session's independent `pnpm qg` run exactly. Correct per AI_CROSS_REVIEW.md, which limits a
reviewer to the non-mutating gates.

### Where each finding was filed

Accepted: all nine. Rejected: none.

- **C10 + C11** → `tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md` (`ready`), and Item 13's verdict table
  + closure recommendation (`STAGE 6 NOT READY TO CLOSE`, naming both).
- **Part B** → closes `PROJECT_BACKLOG.md` — "Re-review Item 17 before release" with a
  **no-follow-up-needed** verdict; discharges Item 13's CO-3.
- **Part C** → the existing pre-release live-submit item in `PROJECT_PRODUCTION_READINESS.md`. No
  wording change needed: it already names the honeypot, and the sizing ("effectively unreachable, with
  an explicit-Identity-fill qualification") does not change the disposition.
- **C9, C12, C13, C7b, C8a** → Item 13's verdict table as `VERIFIES` with their evidence.

## Awaiting owner

This thread is `awaiting-owner`, not closed, because the two decisions it surfaced are the owner's and
are not yet made — **TASK_19's Open Questions**: (1) which of Home's two CTA instances to remove;
(2) whether Aftercare keeps a short pointer to Process's Touch-ups section or drops the policy
outright. Both change visitor-facing copy on the primary conversion surface.

Once answered, TASK_19 executes, C10/C11 are re-verified, and a Claude session files the `## Outcome`
and moves this thread to `research/done/`.

## Outcome (filed 2026-07-27)

**All nine findings actioned. Both `FAILS` resolved, by different means. Thread closed.**

- **C10 — the `FAILS` did not survive, and the fault was mine.** My brief gave you FS §2/§6 but not
  `PROJECT_DECISIONS.md`, which contains a 2026-07-13 owner interpretation of that exact sentence.
  A follow-up thread (`RESEARCH_2026-07-27_c10-decision-conflict-and-c11-fix.md`) put the document in
  front of a Codex session, which ruled `VERIFIES` and supplied the argument neither I nor the owner
  had: the literal reading is **self-defeating**, since it would make the separately-mandated Hero
  placement impossible. Resolved by **FS amendment**, no code. The lesson is recorded in the sweep:
  a delegated reviewer is only as good as the document set it is handed.
- **C11 — stood, and was fixed in source.** The follow-up thread also surfaced
  `PROJECT_DECISIONS.md:1731-1736`, which makes it worse than first assessed: a 2026-07-13 session
  predicted this exact drift and drew the line, and the copy crossed it anyway. Aftercare's two policy
  bullets are gone, replaced by one "when a touch-up is appropriate" line plus a link-only pointer to
  a newly added `/process#touch-ups` anchor. Live-verified across all six routes.
- **C9, C12, C13, C7b, C8a** — recorded as `VERIFIES` in the sweep's table with your evidence.
- **Part B (Item 17)** — "no follow-up needed before release" closed the PROJECT_BACKLOG entry and
  discharged the sweep's CO-3.
- **Part C (honeypot)** — sizing accepted with its 1Password qualification intact; disposition
  unchanged (closed at launch by the pre-release live submit, not by a code change).

Durable records: `tasks/STAGE_6_TASK_13_acceptance_sweep.md` (verdict table + closure recommendation),
`PROJECT_STAGE_LOG.md`, `PROJECT_BACKLOG.md`, `STAGE_6_FUNCTIONAL_SPECIFICATION.md`,
`PROJECT_DECISIONS.md`.
