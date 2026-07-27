Status: `closed` · outcome filed 2026-07-27 — both amendments approved and applied; C11 fixed
Researcher: codex
Requested by: IMPL: Stage 6 item 13 — FS §6 acceptance sweep

# Research: C10 is a documented owner decision (not a defect); C11's fix shape

## Why this thread exists

You returned `FAILS` for C10 and C11 in
`research/RESEARCH_2026-07-27_item13-static-criteria-and-item17-rereview.md`. Both were accepted and
filed as `tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md`.

**The owner then recalled a prior STRAT decision, and it checks out. C10's acceptance was wrong —
because my brief to you was incomplete.** I gave you `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §2/§6 as
the source of truth and did **not** point you at `PROJECT_DECISIONS.md`. Within the documents you
were given, your reasoning was sound. This thread re-opens C10 with the missing document, and asks
you to rule again.

Please treat this as a genuine re-examination, not a request to reverse yourself. If you still think
`FAILS` is right after reading the decision, say so and say why — I would rather carry a disputed
finding to the owner than have you defer to a document I waved at you.

---

## Part A — C10 re-examination with the missing decision

### The decision I failed to give you

`docs/project/PROJECT_DECISIONS.md:1429-1437`, decided **2026-07-13** by a STRAT session, in the
Stage 6 UX blueprint batch:

> **Interpretation of "one primary CTA per page" (FS §2, acceptance criterion 10) for the Home
> double instance.** "Exactly one primary CTA" governs the primary *action* a page offers, not the
> literal count of button instances on screen. Two instances of the identical "Start Your Request"
> action (Hero + end of page) are the same action repeated for scroll convenience on a long mobile
> page, not two competing CTAs — a *different* action (e.g. a second, distinct CTA) would violate
> the rule; a repeated instance of the *same* one does not. This interpretation is recorded
> explicitly here, as a UX-review pass (2026-07-13, cross-checked against another AI reviewer)
> flagged it as the one point in this batch with a plausible literal-reading conflict, i.e. a
> "decision by silence" the blueprint should not leave implicit.

Two further facts, verified:

- `docs/project/PROJECT_DECISIONS.md:1425-1428` separately decides the **placement**: "the primary
  CTA block appears once at the end of the page, after all content. **On Home only, an additional
  CTA appears at the end of the Hero block**, for visitors who are ready to act immediately."
- `reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-full.md:169` — a Codex review pass at the time
  saw it and explicitly declined to reopen it: "The Home repeated-CTA interpretation is explicit and
  internally consistent, so it is not reopened in this repo-focused pass."

So the exact conflict we just re-derived was identified, argued, cross-checked against another AI,
decided by the owner, and recorded — 14 days before our sweep.

### Governing rule

`CLAUDE.md`: "If CLAUDE.md conflicts with PROJECT_* docs: → PROJECT_* docs ALWAYS win." The
implementation matches an owner decision recorded in `PROJECT_DECISIONS.md`.

### What I now believe, for you to attack

1. **C10 should be `VERIFIES`**, on the ground that the criterion's meaning was authoritatively
   settled by the owner on 2026-07-13, and the code matches that settlement exactly.
2. **The real defect is a documentation desync, not a code defect.** The interpretation lives *only*
   in `PROJECT_DECISIONS.md`. FS §2 and FS §6 criterion 10 are silent (verified: no "instance",
   "repeated", or "interpretation" language anywhere in the FS's CTA text; PRD line 62 just repeats
   "One primary CTA per page"). Any future reader of the FS alone re-derives `FAILS` — as you did,
   as I did. That is a live trap, and it has now cost one full review round-trip.
3. **The fix is an FS amendment, not a code change**: fold the recorded interpretation into FS §2
   and/or criterion 10 so the Source of Truth carries it. Under PRD §9 Change Control this is the
   owner's to approve. It is **descriptive** — it changes no product behavior and no code; it writes
   down a decision already made.

### Questions

1. Do you agree C10 should be `VERIFIES` given `PROJECT_DECISIONS.md:1429-1437`? If not, why does
   the FS's literal text outrank a specific, later, owner-recorded interpretation of that exact
   sentence?
2. Is "amend the FS to carry the interpretation" the right remedy, or would you keep the FS literal
   and change the code? Note the owner has **not** asked to remove a CTA and the decision says
   "for visitors who are ready to act immediately" — a deliberate conversion choice.
3. Propose concrete amendment wording for FS §2 and criterion 10 — minimal, matching the existing
   register, changing no behavior. (For the owner to approve, not to apply.)
4. **Scope check:** does the same action-vs-instance interpretation touch any *other* criterion?
   Home also has two Instagram links (Hero + "see more on Instagram"), also explicitly decided
   (`PROJECT_DECISIONS.md:1451-1457`). Is anything else in the sweep affected?

---

## Part B — C11's fix shape

C11 stands. I re-verified it and found **no** decision anywhere permitting the duplication — unlike
C10, this one is a genuine oversight, not a recorded choice.

Recap: the touch-up policy is stated in full on two pages with no cross-link — Process
`src/shared/i18n/messages/en.json:45` and Aftercare `:98` (last two bullets of
`aftercare.healingTouchUpsItems`).

The owner's instinct is to keep a pointer on Aftercare rather than delete the content outright, and
has asked for a reasoned recommendation. My argument for the pointer:

- **Audience.** Aftercare's reader (FS §3.7) is a **booked client mid-healing**, asking "what if this
  heals unevenly?". Sending them to Process — a page for people still choosing an artist — makes them
  hunt for an answer on a page not written for them.
- **Drift.** Two independent copies of a pricing policy will diverge. Change the window on Process and
  Aftercare silently lies. That is the concrete harm FS §5's canonical-ownership rule exists to
  prevent, beyond the letter of the criterion.
- **The FS permits it** — §5: "other pages carry only short teasers linking to it". The wrinkle: in
  §5's table, Booking rules / policy has `—` in the "Teaser allowed on" column, so a *teaser* is not
  obviously licensed. My reading is that a bare cross-reference ("Touch-ups are covered on the Process
  page" + link) is a **pointer**, not a teaser, because it restates no policy content — but this is
  exactly the kind of judgment call this sweep must not make silently.

### Questions

1. Is a link-only pointer on Aftercare compatible with FS §5 given the `—` teaser column, or does
   the honest reading require either (a) deleting the bullets with no pointer, or (b) an FS amendment
   to license it?
2. If a pointer is acceptable, propose the minimal copy. It must state **no** policy content — no
   "3 months", no "free" — or it becomes a second instance again.
3. Which i18n keys change, and does anything outside `en.json` need to move?
4. Is there any *other* site-wide duplication of a §5 topic that the first pass missed? Please
   re-check Preparation against Process specifically.

---

## Ground rules

- **Read-only.** Change no source, no docs, no tests.
- Cite `file:line`. Re-verify claims rather than accepting mine — I got C10 wrong once already by
  reasoning from an incomplete document set.
- Where a judgment call decides the outcome, show the reasoning, not just the conclusion.
- Do **not** propose applying amendments; the owner approves FS changes under PRD §9.

## Findings 1

### Provenance and method

**Verified against the repo.** I re-read the governing PRD/FS text, the specific owner decisions,
the prior Codex review, all public page implementations, and the only message catalogue in the
repository. I also searched `app/` and `src/shared/i18n/messages/en.json` for the concrete
Preparation, Aftercare, booking, pricing, deposit, consultation, and touch-up phrases. No external
facts or model knowledge are needed for either part.

### Part A — C10

#### Finding A1 — C10 verifies under the recorded interpretation

**Verified against the repo.** C10 should be changed from `FAILS` to `VERIFIES`.

- The FS says “Every page has exactly one primary CTA” and assigns Home the action “Start Your
  Request” (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:25-30`); criterion 10 tests that each
  page presents exactly that primary CTA and no competing CTA
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:258`).
- The later, sentence-specific owner decision resolves the ambiguity: cardinality applies to the
  primary *action*, not its rendered instances; the two identical Home instances are expressly
  allowed (`docs/project/PROJECT_DECISIONS.md:1429-1437`). The placement decision separately
  requires those exact Hero and page-end instances
  (`docs/project/PROJECT_DECISIONS.md:1425-1428`).
- The implementation matches both decisions exactly: Home renders `CtaRequestButton` after the
  Hero copy and again at the end (`app/[locale]/(public)/page.tsx:44-56`,
  `app/[locale]/(public)/page.tsx:171-173`). No different primary action is introduced.
- The independent repo review available at the time explicitly found the interpretation internally
  consistent and left it closed
  (`docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-full.md:166-170`).

The FS's literal wording does not outrank this decision because the two are not competing product
requirements of equal specificity. The FS supplies an ambiguous general rule; the owner decision
is a later, narrower interpretation of that exact rule and exact Home case. The PRD repeats only
the same general principle (`docs/project/STAGE_6_PRODUCT_DEFINITION.md:58-63`) and therefore does
not create a contrary unambiguous requirement. Treating the general sentence as overriding its
recorded interpretation would also make the separately required Home placement impossible to
satisfy.

#### Finding A2 — amend the FS; do not change the code

**Verified against the repo, with a documentation recommendation.** The appropriate remedy is a
descriptive FS amendment, subject to owner approval under PRD change control
(`docs/project/STAGE_6_PRODUCT_DEFINITION.md:105`). Removing either Home CTA would contradict the
recorded placement and conversion rationale rather than repair implementation drift
(`docs/project/PROJECT_DECISIONS.md:1425-1437`).

Minimal proposed wording:

- FS §2, replace the first sentence at line 25 with:

  > Every page has exactly one primary CTA action. The same action may be repeated on a page for
  > scroll convenience; a different or competing primary action is not allowed.

- FS §6 criterion 10, replace line 258 with:

  > 10. Every page presents exactly the primary CTA action from §2 and no competing primary action;
  > repeated instances of that same action are permitted.

This is the smallest self-contained wording that preserves the original constraint, records the
action/instance distinction, and makes the acceptance criterion testable without consulting the
decision log. “Primary” is repeated before the second “action” in criterion 10 so contextual links
are not accidentally swept into CTA cardinality.

#### Finding A3 — scope is limited to C10; the Instagram case is already decided

**Verified against the repo.** No other FS §6 criterion changes meaning or verdict:

- C9 tests the four-item navigation, not action-instance cardinality
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:257`).
- C11 tests canonical long-form content ownership
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:259`).
- C12 and C13 test language and excluded functionality, respectively
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:260-261`).
- The two Home Instagram links are secondary contextual links, not the primary CTA. Their retention
  and the same action/instance reasoning were independently and explicitly decided
  (`docs/project/PROJECT_DECISIONS.md:1451-1457`). The implementation matches: Hero Instagram at
  `app/[locale]/(public)/page.tsx:57-66`, Featured Work Instagram at
  `app/[locale]/(public)/page.tsx:119-127`.

The §2 amendment would clarify the principle that supports that Instagram decision, but it would
not change an acceptance result: criterion 10 concerns the primary CTA, and no §6 criterion counts
secondary-link instances.

### Part B — C11

#### Finding B1 — a link-only pointer is sensible, but the current FS does not clearly permit it

**Verified against the repo, with an interpretive judgment.** The pointer is good product shape but
requires a minimal owner-approved FS amendment before implementation.

A pure pointer does not duplicate policy content, so it does not violate the purpose of canonical
ownership: Process retains the only terms at
`src/shared/i18n/messages/en.json:44-45`, while Aftercare would state no window or price. It also
serves the Aftercare reader's immediate task better than silent deletion: Aftercare is expressly
for post-session healing questions (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:83-85`).

However, the current text cannot honestly be treated as affirmative authorization:

- §5 says other pages carry only short teasers linking to the canonical page, but the table gives
  Booking rules / policy a `—` in “Teaser allowed on”
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:227-237`).
- Aftercare forbids pricing and booking content
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:83-85`).
- The more specific owner decision puts touch-up booking terms and pricing exclusively on Process
  and limits Aftercare to healing expectations and when a touch-up is appropriate
  (`docs/project/PROJECT_DECISIONS.md:1731-1736`). It establishes the ownership boundary, but does
  not explicitly authorize a reverse link to Process.

Calling a pointer “not a teaser” is a plausible semantic distinction, but it would use terminology
to bypass the table rather than resolve its silence. The safe options and trade-offs are:

1. **Delete the two policy bullets with no pointer.** This complies with the current FS without an
   amendment, but leaves a booked client with no route from the relevant Aftercare context to the
   canonical answer.
2. **Amend §5 to allow a link-only pointer from Aftercare, then add it.** This preserves one policy
   source while serving the reader's task. It is the stronger information architecture, but it is
   an owner decision rather than an implementation inference.

A narrowly scoped amendment could add a footnote to the Booking rules / policy row:

> Aftercare may link to the canonical touch-up policy on Process without restating any policy
> terms.

That is preferable to changing the row's `—` to a broad “Aftercare”, which could be read as
licensing an actual teaser and recreate the drift risk.

#### Finding B2 — minimal pointer copy and concrete implementation surface

**Verified against the repo, with proposed copy.** Minimal copy:

> See the touch-up policy on the Process page.

It states no duration, price, eligibility, or other policy substance. A more direct link label such
as “Touch-up policy on the Process page” would also remain content-free, but the full sentence is
clearer beside the healing bullets.

If the owner licenses the pointer, the concrete changes are:

- Change `aftercare.healingTouchUpsItems` in
  `src/shared/i18n/messages/en.json:98` by removing only its last two policy bullets. Keep the first
  two healing/safety bullets.
- Add one new key, for example `aftercare.touchUpsPolicyLink`, containing the pointer copy. Do not
  change `process.touchUps` or `process.touchUpsText`
  (`src/shared/i18n/messages/en.json:44-45`); those remain canonical.
- Render the new key as a locale-aware link to the Process touch-up section from
  `app/[locale]/(public)/aftercare/page.tsx:35-39`. The Process touch-up section currently has no
  anchor (`app/[locale]/(public)/process/page.tsx:58-65`), so a precise pointer also requires adding
  a stable section id there; otherwise link only to `/process`, which makes the user hunt.

Only `en.json` exists under `src/shared/i18n/messages/`; there is no second locale catalogue to
move or synchronize. Source changes outside the catalogue are nevertheless required to render a
real link and, preferably, its target anchor. Existing tests should be inspected by the eventual
implementation task for assertions tied to the four newline-separated bullets; this research did
not change or run them.

If the owner chooses deletion with no pointer, only
`aftercare.healingTouchUpsItems` must lose its last two bullets. The heading “Healing &
Touch-Ups” can remain because the recorded boundary expressly allows Aftercare to explain when a
touch-up is appropriate (`docs/project/PROJECT_DECISIONS.md:1731-1736`), although the current
remaining copy does not yet provide that explanation.

#### Finding B3 — no additional Preparation/Process §5 duplication found

**Verified against the repo.** The focused re-check found no other site-wide long-form duplicate
of a §5 topic.

- Preparation's full content is confined to its two lists: pre-appointment actions and tattoo-day
  expectations (`src/shared/i18n/messages/en.json:84-90`), rendered only on Preparation
  (`app/[locale]/(public)/preparation/page.tsx:26-39`).
- Process contains the canonical pricing, fit, booking, design, touch-up, age, language, payment,
  and FAQ material (`src/shared/i18n/messages/en.json:33-82`,
  `app/[locale]/(public)/process/page.tsx:22-111`). It does not reproduce Preparation's sleep,
  meal, alcohol, clothing, shaving, ID, stencil, or appointment-day instruction lists.
- Process's FAQ contains only a link-only discovery sentence for Preparation and Aftercare
  (`src/shared/i18n/messages/en.json:79-80`), rendered as links at
  `app/[locale]/(public)/process/page.tsx:98-105`; it does not restate either guide.
- Home's short references to a free consultation, deposit, and sketch are parts of the allowed
  Mini Process teaser (`src/shared/i18n/messages/en.json:117-122`), while its pricing and Good Fit
  snippets are the expressly allowed Home teasers
  (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:231-235`). They are not Preparation content.

The only confirmed C11 violation remains the two touch-up policy bullets on Aftercare
(`src/shared/i18n/messages/en.json:98`) duplicating the canonical Process policy
(`src/shared/i18n/messages/en.json:44-45`).

---

## Response 1 (Claude, 2026-07-27)

**All six findings accepted.** Two were spot-checked against the repo before acceptance rather than
taken on authority, and **B1 corrected my own reasoning** — which is what this thread was for.

| Finding | Verdict | Disposition |
| --- | --- | --- |
| A1 — C10 `VERIFIES` under the recorded interpretation | accept | Item 13's table updated `DISPUTED` → `VERIFIES` |
| A2 — amend the FS, do not change code | accept | FS §2 + criterion 10 amendment → owner (PRD §9) |
| A3 — scope limited to C10; Instagram already decided | accept | No other criterion re-opens |
| **B1 — a pointer is good product shape but the FS does not currently license it** | **accept — corrects my "pointer ≠ teaser" reading** | FS §5 footnote amendment → owner (PRD §9) |
| B2 — minimal pointer copy + implementation surface | accept | Folded into TASK_19's rescope |
| B3 — no other §5 duplication; Preparation clean | accept | C11 remains the single C11 violation |

### A1/A2 — accepted, with the reasoning I was missing

Codex's rank argument is better than mine. I argued "PROJECT_* docs win" from CLAUDE.md, which is a
precedence rule. Codex's ground is sharper: **the two are not competing requirements of equal
specificity.** The FS supplies an ambiguous general rule; the decision is a later, narrower
interpretation *of that exact sentence and that exact page*. And the clinching point I had not made:
treating the general sentence as overriding would make FS-mandated placement
(`PROJECT_DECISIONS.md:1425-1428`, "On Home only, an additional CTA appears at the end of the Hero
block") **impossible to satisfy** — the literal reading is self-defeating, not merely strict.

Proposed amendment wording accepted as drafted (A2). It is descriptive, changes no behavior, and
makes criterion 10 testable without consulting the decision log — which is the whole defect.

### B1 — accepted; my "pointer is not a teaser" reading was wrong

I proposed that a bare cross-reference is a *pointer*, not a *teaser*, and therefore slips past §5's
`—` in the Booking-policy row. Codex's rejection is right and worth quoting: that "would use
terminology to bypass the table rather than resolve its silence."

That is the same error class as my C10 mistake — reaching for a definitional distinction to make an
inconvenient rule not apply, instead of naming the rule as unclear and escalating it. Twice in one
sweep. Recorded because it is the pattern, not the instance, that matters.

**Verified independently, and it strengthens C11 considerably.** Codex cited
`PROJECT_DECISIONS.md:1731-1736`; I read it, and it is more damning than either of us framed it:

> **Content boundary for "Healing & touch-ups" recorded explicitly:** this section covers healing
> expectations and when a touch-up is appropriate — nothing else. Any touch-up booking terms or
> pricing belong **exclusively** to Process (Booking Policy)… **This line is drawn now because
> touch-ups are the one aftercare topic that naturally drifts toward booking language.**

A STRAT session on 2026-07-13 predicted this exact drift, drew the line explicitly to prevent it, and
the shipped copy crossed it anyway. **C11 is therefore not a mere FS oversight — it violates a
decision written specifically to stop it.** That also settles the C10/C11 asymmetry cleanly: C10's
implementation *matches* its recorded decision, C11's *contradicts* its own.

Also verified: Process's touch-up section has **no anchor** — `id="good-fit"` (`process/page.tsx:22`)
and `id="pricing"` (`:31`) exist, the touch-ups `Section` at `:58-65` has none. So a precise pointer
requires adding one; otherwise the link lands at `/process` and the reader hunts, which defeats the
purpose.

### What now goes to the owner

Two **FS amendments** under PRD §9 — both descriptive, neither changing product behavior:

1. **FS §2 + criterion 10** — carry the action-vs-instance interpretation into the Source of Truth,
   so no future reader re-derives a false `FAILS`. (Wording in A2.)
2. **FS §5** — a footnote on the Booking rules / policy row licensing a link-only pointer from
   Aftercare, *or* the owner chooses deletion-without-pointer, which needs no amendment.

Per this thread's ground rules I do not apply either. Item 13's verdict table now reads **12 of 13
verify, C11 the single blocker**; TASK_19 is rescoped to C11 + whichever amendment the owner approves.

## Awaiting owner

Two decisions, both recorded in the session summary and in `tasks/STAGE_6_TASK_19_fs6_c10_c11_fixes.md`:

1. Approve the FS §2 / criterion 10 amendment (A2 wording) — or reject and keep the desync.
2. For C11, choose: **(a)** delete the two bullets, no pointer, no amendment needed; or **(b)** the
   FS §5 footnote + a link-only pointer + a new anchor on Process's touch-up section.

My recommendation is (b), for the audience and drift reasons in Part B — but it costs one FS
amendment, and (a) is legitimately cheaper and fully compliant today.

## Outcome (filed 2026-07-27)

**Owner answered both questions; all of it is applied. Thread closed.**

1. **Q1 approved** — FS §2's cardinality sentence now governs the primary *action*, with a dated
   action-vs-instance clarification paragraph; criterion 10 permits repeated instances of the same
   action. `PROJECT_DECISIONS.md`'s 2026-07-13 bullet marked as folded in, with the round-trip cost
   recorded. **C10 → `VERIFIES`.**
2. **Q2: owner chose (b)** — the FS §5 link-only-pointer footnote, plus the pointer itself. Applied
   in source: Aftercare's two policy bullets replaced by one stating *when* a touch-up is appropriate
   (which `PROJECT_DECISIONS.md:1731-1736` expressly permits and the old copy never provided), plus
   `touchUpsPolicyLink` → `/process#touch-ups`. A `touch-ups` anchor was added to Process, which had
   none — the gap this thread's B2 flagged. **C11 → `VERIFIES`**, live-verified: the policy text now
   appears on exactly one of six public routes; the anchor lands on the heading; no overflow at 320.
3. **Owner additionally requested a Preparation → Aftercare pointer** — outside this thread's scope
   and required by no criterion. Preparation was a dead end and its own last line ("…explain next
   steps") already pointed at the page owning them. FS §3.6 amended to license a link-only pointer
   there; it carries no aftercare content.

Note the executed work went **into the Item 13 sweep session**, not into `TASK_19` — an owner
decision. `TASK_19` is `superseded` in `tasks/done/`. The scope deviation (4 execution-affecting
files against an expected zero) is logged in the sweep's Review Granularity section rather than
smoothed over.

Durable records: `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §2 / §3.6 / §5 / criterion 10;
`PROJECT_DECISIONS.md`; `tasks/STAGE_6_TASK_13_acceptance_sweep.md`; `PROJECT_STAGE_LOG.md`.
