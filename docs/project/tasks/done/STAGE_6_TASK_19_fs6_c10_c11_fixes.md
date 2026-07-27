# Task: Stage 6 — fix the two FS §6 failures found by the Item 13 acceptance sweep (C10, C11)

## Status

`superseded` · created 2026-07-27 · superseded 2026-07-27 — both halves executed inside
`STAGE_6_TASK_13_acceptance_sweep.md` on owner instruction; see its Execution Report

> **SUPERSEDED — do not execute.** This file was cut to carry the two failures out of Item 13's
> sweep, on the rule that a verification pass must not fix what it audits. The owner then directed
> both fixes to be completed in the sweep session itself. Kept for the record: it holds the analysis,
> the rejected shortcuts, and the two owner questions as they stood.
>
> - **C10** — resolved by FS amendment (FS §2 + criterion 10), no code. Criterion reads `VERIFIES`.
> - **C11** — fixed in source: Aftercare's two policy bullets → one "when a touch-up is appropriate"
>   line + a link-only pointer to `/process#touch-ups`; anchor added to Process. Criterion reads
>   `VERIFIES`, live-verified.
> - **Plus an owner-requested addition** no criterion required: a Preparation → Aftercare pointer.

> **RESCOPED 2026-07-27** after `research/RESEARCH_2026-07-27_c10-decision-conflict-and-c11-fix.md`
> reached its findings. `ready` → `draft`: **two owner decisions are required before this executes.**
>
> **C10 is NOT a code fix — do not remove either Home CTA.** `PROJECT_DECISIONS.md:1429-1437`
> (2026-07-13) interprets FS §2's "exactly one primary CTA" as governing the primary **action**, not
> the count of button instances, and `:1425-1428` *mandates* the Hero instance. Removing either would
> implement the opposite of a recorded owner decision. C10 now reads **`VERIFIES`** in Item 13's
> table. What remains is an **FS amendment** so the Source of Truth carries the interpretation.
>
> **C11 stands, and is worse than first assessed** — it violates not just FS §5/§3.7 but the explicit
> boundary at `PROJECT_DECISIONS.md:1731-1736`, drawn on 2026-07-13 *because* "touch-ups are the one
> aftercare topic that naturally drifts toward booking language".
>
> **Status 2026-07-27: the C10 half is DONE** (FS amendment applied, owner-approved — see Q1).
> **Only C11 remains, and it needs one owner answer (Q2).** This file stays `draft` until that lands.

**This task blocks Stage 6 closure.** Item 13's sweep found both defects and, by its own scope rule,
was forbidden from fixing them — a verification pass that fixes what it audits stops being
independent evidence. This is that fix.

## Execution

- Executor: `claude` (IMPL).
- Reviewer: `claude` + mandatory independent Codex cross-review (AI_CROSS_REVIEW.md, 3-round cap) —
  this changes source.
- Baseline: the commit that introduced this task file.
- Allowed Write Surface: `app/[locale]/(public)/page.tsx`,
  `src/shared/i18n/messages/en.json`, `app/[locale]/(public)/aftercare/page.tsx` (only if the C11 fix
  needs a cross-link), this task file, `docs/project/PROJECT_STAGE_LOG.md`,
  `docs/project/tasks/STAGE_6_TASK_13_acceptance_sweep.md` (to flip the two verdicts after the fix is
  verified), `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`, `docs/files-structure.md` (generated).
- No dependencies, no migrations.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. Source of Truth: `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §2 (CTAs), §5 (canonical ownership), §6
   (criteria 10 and 11). Read them verbatim.
3. The findings: `research/RESEARCH_2026-07-27_item13-static-criteria-and-item17-rereview.md`,
   Part A — C10 and C11. Both were **independently re-verified** by the Item 13 session against the
   code before being accepted; see that task's Execution Report.

## The two defects

### C10 — an FS desync, not a code defect (criterion now `VERIFIES`)

`app/[locale]/(public)/page.tsx` renders `<CtaRequestButton />` twice — `:55` (hero) and `:172`
(page bottom); Process (`:115`) and Location (`:99`) render one each.

**This is the decided design, not drift.** `PROJECT_DECISIONS.md:1429-1437` (STRAT, 2026-07-13):
"Exactly one primary CTA" governs the primary **action**, not the literal count of button instances;
`:1425-1428` mandates the Hero instance "for visitors who are ready to act immediately". A Codex
review at the time saw the interpretation and declined to reopen it
(`reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-full.md:166-170`).

The re-review's decisive argument: the FS's literal reading is **self-defeating** — it would make the
separately-mandated Hero placement impossible to satisfy. The FS supplies an ambiguous general rule;
the decision is a later, narrower reading of that exact sentence and page.

**The actual defect:** the interpretation lives only in the decision log. FS §2 and criterion 10 are
silent, so every fresh reader re-derives a false failure — this sweep did, twice, at the cost of a
full review round-trip. **Fix = the FS amendment in Q1. No code changes.**

### C11 — the touch-up policy exists twice site-wide (`FAILS`)

FS §5: every topic has exactly one canonical page; **Booking rules / policy → Process, with no teaser
column at all**. FS §6 criterion 11: "Each topic in §5's table has exactly one long-form instance
site-wide."

The same touch-up policy is stated in full on two pages, with no cross-link between them:

- Process — `src/shared/i18n/messages/en.json:45` (`process.touchUpsText`):
  "Free within 3 months of your session. Later than that, they're priced by time, like any other work."
- Aftercare — `src/shared/i18n/messages/en.json:98` (`aftercare.healingTouchUpsItems`, last two
  bullets): "Touch-ups are free within 3 months after your tattoo" / "After 3 months, touch-ups are
  charged depending on what's needed".

This is pricing/booking policy, not healing instruction. Aftercare's own scope per FS §3.7 is
"healing and care only".

**It also violates an explicit decision** — `PROJECT_DECISIONS.md:1731-1736` (2026-07-13):

> **Content boundary for "Healing & touch-ups" recorded explicitly:** this section covers healing
> expectations and when a touch-up is appropriate — nothing else. Any touch-up booking terms or
> pricing belong **exclusively** to Process (Booking Policy)… **This line is drawn now because
> touch-ups are the one aftercare topic that naturally drifts toward booking language.**

The drift was predicted, the line was drawn to prevent it, and the copy crossed it anyway. That is the
clean asymmetry with C10: **C10's implementation matches its decision; C11's contradicts its own.**

A second Codex pass re-checked Preparation against Process and found **no other §5 duplication** —
this is the only one.

### Implementation surface (if the owner picks (b))

- `src/shared/i18n/messages/en.json:98` — remove **only** the last two bullets of
  `aftercare.healingTouchUpsItems`; keep the two healing/safety bullets.
- Add one key, e.g. `aftercare.touchUpsPolicyLink`. Proposed copy, stating **no** policy substance:
  > See the touch-up policy on the Process page.
- Do **not** touch `process.touchUps` / `process.touchUpsText` (`en.json:44-45`) — canonical.
- Render it as a locale-aware link from `app/[locale]/(public)/aftercare/page.tsx:35-39`.
- **Add a stable anchor** to Process's touch-up `Section` (`process/page.tsx:58-65`) — it has none
  today, unlike `id="good-fit"` (`:22`) and `id="pricing"` (`:31`). Without it the link lands on
  `/process` and the reader hunts, defeating the purpose.
- Only `en.json` exists under `messages/` — no second catalogue to sync.
- Inspect existing tests for assertions tied to the four newline-separated bullets before editing.

If the owner picks (a): only the two bullets are removed. The "Healing & Touch-Ups" heading may stay —
the recorded boundary expressly allows Aftercare to explain *when* a touch-up is appropriate, though
the current copy does not yet do that.

## Open Questions — resolve with the owner BEFORE implementing

Both are **FS amendments under PRD §9**, which only the owner approves. Neither changes product
behavior.

### ~~Q1 — approve the FS §2 / criterion 10 amendment? (C10)~~ — **APPROVED AND APPLIED 2026-07-27**

Owner approved; the amendment is in the FS. Applied:

- **FS §2** — the cardinality sentence now reads "exactly one primary CTA **action**… The same action
  may be repeated on a page for scroll convenience", followed by a dated **action-vs-instance
  clarification** paragraph that records the interpretation, the mandated Hero instance, and why it
  was folded in.
- **FS §6 criterion 10** — now "exactly the primary CTA **action** from §2 and no competing primary
  action; repeated instances of that same action are permitted".
- `PROJECT_DECISIONS.md` — the 2026-07-13 bullet marked as folded into the FS, with the round-trip
  cost recorded so the desync class is visible.

Descriptive only: **no behavior changed, no code touched.** C10 reads `VERIFIES` in Item 13's table.
**This half of the task is complete** — nothing here is left to implement.

### Q2 — for C11, delete or point? (choose one)

- **(a) Delete the two policy bullets, no pointer.** Compliant with the FS as written today, needs
  **no amendment**, cheapest. Cost: a booked client mid-healing has no route from the relevant
  Aftercare context to the canonical answer.
- **(b) FS §5 footnote + a link-only pointer.** Better information architecture. Needs a narrow
  amendment on the Booking rules / policy row:
  > Aftercare may link to the canonical touch-up policy on Process without restating any policy
  > terms.

  Preferred over changing the row's `—` to "Aftercare", which could be read as licensing an actual
  teaser and recreate the drift risk.

**Executor's recommendation: (b)** — the Aftercare reader is a booked client mid-healing, and two
independent copies of a pricing policy will diverge. But (a) is fully compliant today and cheaper;
this is a genuine owner call.

**Note the rejected shortcut:** the sweep first argued a pointer "is not a teaser" and so slips past
the `—`. That was overturned on re-review — it uses terminology to bypass the table rather than
resolve its silence. Hence (b) requires an amendment; it cannot be inferred.

## Out of Scope

- Any other FS §6 criterion — the other eleven verify (see Item 13's Execution Report).
- Visual design, spacing, palette — Stage 7.
- The tap-target findings — filed to Stage 7.
- Touching the Item 13 sweep's other conclusions.

## Completion obligations

```text
- CO-1 — After the fix, C10 and C11 were re-verified by the same method the sweep used (grep for
  CtaRequestButton occurrences per public route; a read of both copy locations), and Item 13's
  verdict table was updated from FAILS to VERIFIES with the new evidence.
  - Required by: Stage 6's exit criterion; Item 13 Acceptance Criterion 1.
  - Disposition: <executor records the re-verification>
- CO-2 — The owner's answers to both Open Questions are recorded in this file before implementation.
  - Required by: both fixes change visitor-facing copy.
  - Disposition: <executor records the answers>
```

## Acceptance Criteria

1. Exactly one `CtaRequestButton` renders on Home; Process, Location unchanged at one each.
2. The touch-up policy has exactly one long-form instance site-wide (on Process).
3. `pnpm qg` passes.
4. Item 13's verdict table shows C10 and C11 as `VERIFIES` with post-fix evidence.
5. Cross-review reached consensus.

## Reporting

- Update PROJECT_STAGE_LOG.md and STAGE_6_IMPLEMENTATION_PLAN.md.
- Update `STAGE_6_TASK_13_acceptance_sweep.md`'s verdict table and closure recommendation.
- Set Status `done`, move to `tasks/done/`, propose the commit for owner approval.

## Execution Report (filled by the executor)

<the fix; the re-verification; the updated verdicts>
