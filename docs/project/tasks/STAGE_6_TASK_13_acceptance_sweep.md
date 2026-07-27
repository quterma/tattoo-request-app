# Task: Stage 6 — FS §6 acceptance sweep + mobile QA (Item 13)

## Status

`ready` · created 2026-07-27 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

**This is the stage-closing gate.** Every other Stage 6 item is `done`.

## Execution

- Executor: `claude` — a verification pass whose judgment calls (does a criterion truly verify?
  is a found defect in scope to fix?) decide whether a stage closes. Not delegable.
- Reviewer: `claude` + **mandatory independent Codex cross-review of the verdict itself**
  (AI_CROSS_REVIEW.md, **3-round cap**) — required here **whether or not this task changes source**.
  - This is deliberately stricter than AI_REVIEW_PIPELINE.md's rule, which would let an
    analysis-only task skip review entirely. That rule is calibrated for tasks whose output is a
    report nobody acts on directly. **This task's output is the claim that a stage is complete**, and
    a session that both performs the verification and pronounces on it has exactly the
    self-certification problem the mandatory-review rule exists to prevent — a green self-assessment
    is not evidence. Precedent in this project: Stage 5D was closed only after an independent
    read-only verification pass (`STAGE_5D_READY_TO_CLOSE`), not on its own fix passes' say-so.
  - **What the reviewer is asked to attack** — not "is the report well written", but: is any
    criterion marked `VERIFIES` on evidence that does not actually establish it? Is inherited
    evidence stale enough to be worthless? Is a `NOT VERIFIABLE HERE` really unverifiable, or merely
    inconvenient? Does the closure recommendation follow from the table?
  - If the sweep changes no source, the Review Pipeline's *gate* stages still do not re-arm — run
    `pnpm qg` once to certify the tree the verdict describes, and do not claim a Test Agent pass on
    tests nobody changed.
- Baseline: **the commit that introduced this task file** — do NOT write a hash here.
- Allowed Write Surface: this task file, `docs/project/PROJECT_STAGE_LOG.md`,
  `docs/project/PROJECT_PRODUCTION_READINESS.md`, `docs/project/PROJECT_BACKLOG.md`,
  `docs/project/STAGE_6_IMPLEMENTATION_PLAN.md`, `docs/project/PROJECT_IMPLEMENTATION_PLAN.md`
  (Stage 6 closure only), `docs/files-structure.md` (generated), and any new task file this sweep
  needs to cut. **Source is NOT in surface by default** — see "If a criterion fails".
- May touch dependencies / migrations / generated files / shared docs: **no dependencies**, no
  migrations. A throwaway verification script is permitted (see Method) but must not be committed.

## How to run (session settings)

- Model: Opus — this decides whether a stage closes, and a wrong "verifies true" is expensive to
  discover later.
- Start mode: Plan mode (mandatory)
- Switch to edit/acceptEdits: only after the plan is explicitly approved

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md (`## Current Stage` only),
   PROJECT_CONTEXT.md, PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md (as needed).
2. Stage Source of Truth: **`STAGE_6_FUNCTIONAL_SPECIFICATION.md` §6** — the thirteen criteria this
   task verifies, and `STAGE_6_PRODUCT_DEFINITION.md` (PRD) behind them. Read §6 verbatim before
   planning; do not work from a paraphrase, including this file's.
3. Task-specific:
   - `docs/project/tasks/done/TOOLING_TASK_02_playwright_screenshots.md` — `pnpm shot`, the named
     browser capability (STAGE_6_IMPLEMENTATION_PLAN.md's Item 13 row required one to be named
     before this task was cut).
   - `docs/project/tasks/done/STAGE_6_TASK_18_visual_consistency.md` — CO-1's disposition already
     carries 24 captures at 320/375/768/1280 with `scrollWidth === viewport` at every one, plus the
     finding that the "nav over content" band in fullPage PNGs is a **capture artifact of a fixed
     element**, not a real overlap. Do not re-derive either.
   - `docs/project/tasks/done/STAGE_6_TASK_03_request_form_rebuild.md` — CO-1 records a live
     end-to-end submit (all five contact methods, an upload in each category, real reference codes).
     That evidence is from 2026-07-17 and predates Items 5/6/14/16/18.
   - `docs/project/PROJECT_DECISIONS.md` — "OG image lives at the app root" (2026-07-26): a green
     `pnpm qg` was true on a tree Vercel refused to deploy.
   - `docs/project/PROJECT_BACKLOG.md` — "Re-review Item 17 before release"; folded in here, see
     Scope 4.

## Goal

Establish, with checkable evidence, whether **every one of FS §6's thirteen acceptance criteria
verifies true** for the public website as it stands, and whether the mobile experience holds up —
so Stage 6 can be closed on evidence rather than on the accumulated impression that everything got
done. Produce a per-criterion verdict table with the method and the evidence for each.

The expected outcome is a **report, not a diff**.

## Scope

1. **Verify each of FS §6's thirteen criteria** and record, per criterion: the verdict
   (`VERIFIES` / `FAILS` / `NOT VERIFIABLE HERE`), the method used, and the evidence. A criterion
   with no evidence is not `VERIFIES` — write `NOT VERIFIABLE HERE` and say what would be needed.
   Reuse existing evidence where it genuinely covers the current tree; re-verify where it does not
   (see Method).
2. **Mobile QA** at 320/375/768/1280 across all six public routes. Item 18's CO-1 captures are the
   starting point, not the finish: they proved no horizontal overflow, which is narrower than "the
   mobile experience is sound". Check tap-target sizes, the fixed bottom nav's interaction with page
   bottoms, form usability at 320, and the upload card rows.
3. **Run the placeholder sweep and report it** — `grep -rn "__meta_TODO\|__intro_TODO\|__asset_TODO"
   app/ src/ public/`. It returns **10 `__asset_TODO` + the `__meta_TODO` set** today and is
   **expected to fail**. See "The placeholder gate does not block stage closure" below — this is the
   one thing about this task most likely to be misread.
4. **Re-review Item 17** (`src/config/` split, `c7ba5e2`). Its cross-review ran 9 rounds and was
   ended by owner decision, not by a clean round; rounds 4–9 produced no production-code finding at
   all. A fresh read of the committed diff, by a session that never saw that loop, is the agreed
   close-out. Source: PROJECT_BACKLOG.md — "Re-review Item 17 before release".
5. **Produce the closure recommendation**: `STAGE 6 READY TO CLOSE` or a named list of what blocks
   it. This task does not itself close the stage — it produces the evidence and the recommendation;
   the owner closes.

## The placeholder gate does not block stage closure

**Decided 2026-07-27 by STRAT, and stated here because the prior framing would deadlock the stage.**

Earlier documents say "Item 13's sweep must fail while any `__asset_TODO` remains". That is correct
as a **launch** protection and wrong as a **stage-closure** condition, and the two were conflated:

- **None of FS §6's thirteen criteria mentions images, assets, or placeholders.** They are about
  form validation, upload behavior, the success page, navigation, CTAs, canonical content
  ownership, English-only copy, and the absence of booking/payment/account surfaces. The stage's
  exit criterion is "every FS §6 acceptance criterion verifies true" — placeholders do not touch it.
- Treating it as a closure condition creates a **circular dependency**: real photography is weeks
  out; Stage 7 (visual design) runs *after* Stage 6 closes and *against* real photography; so
  requiring real assets to close Stage 6 means Stage 6 waits for the input of the stage that
  follows it.
- The protection it was actually written for is Item 16's accepted risk — AI-generated
  "tattoo-like" artwork must never reach public launch, where it would present non-existent work as
  the artist's. That is a **launch** gate and it already lives where launch gates live:
  PROJECT_PRODUCTION_READINESS.md — Owner Pre-Release Actions.

So: **run the sweep, report the count, expect it to fail, and record it as a launch blocker — not
as a Stage 6 blocker.** Verifying that the sweep *does* fail while placeholders exist is itself
worth doing: it is the gate's own self-test, and a sweep that passed today would mean the mechanism
is broken.

## Out of Scope

- **Fixing anything non-trivial.** See "If a criterion fails" — this is a verification pass, and a
  sweep that quietly turns into a fix pass stops being independent evidence.
- Visual design, palette, typography, art direction — Stage 7.
- Physical-device testing. Headless Chromium is not an iPhone; that gap is real, named, and belongs
  to PROJECT_PRODUCTION_READINESS.md. Do not claim it as done, and do not treat its absence as a
  Stage 6 blocker.
- The owner pre-release debts (Vercel Pro, alert/WAF/spend caps, system-env + live OG, real assets,
  domain, `robots` flip, artist copy pass). **Verify their status and report it** — that is this
  task's job per PROJECT_PRODUCTION_READINESS.md — but do not attempt to perform them.
- Admin surfaces. FS §6 is the public website.
- Adding an e2e test suite. PROJECT_BACKLOG.md — "Automated E2E / Integration Tests" owns that, and
  it is a pre-release item, not this one.

## Method

- **Reuse evidence only where it covers the current tree.** Item 3's live end-to-end submit
  (2026-07-17) predates Items 5, 6, 14, 16 and 18 — cite it as history, but do not treat a
  2026-07-17 submit as proof about today's code. Where a criterion depends on the request flow,
  say plainly whether it was re-verified now or inherited.
- **A throwaway Playwright script is permitted** for criteria that need interaction rather than a
  screenshot (focus behavior, inline errors, the contact-method switch). Precedent: Item 18 Block B
  used exactly this for the nav-overlap check and removed it afterwards. Constraints: no test
  runner, no CI, nothing added to `pnpm qg`, and **the script is not committed** — its output is the
  evidence, recorded in this file.
- **A live submit writes real rows** to the production database (the service-role key has no DELETE
  grant on `requests`, per Item 3's CO-1). If the sweep performs one, say so, record the reference
  codes, and note the rows remain as test data.
- **`pnpm qg` green is not deploy-proof.** The 2026-07-26 OG incident proved a local build can exit
  0 on a tree Vercel's post-build adapter rejects. `pnpm check:metadata` closes that specific hole,
  not the class. If a criterion's truth depends on the deployed site rather than the repo, say which.

## If a criterion fails

Do not silently absorb it.

1. **Trivial and inside this task's surface** — nothing here is source, so in practice this means a
   documentation correction. Fix it and record it.
2. **A real defect** — record it, cut a task file for it (this task's surface allows that), and
   report `STAGE 6 NOT READY TO CLOSE` naming the blocker. **Do not fix source in this task**: the
   sweep's value is that it is independent of the work it audits, and a session that both finds and
   fixes a defect has lost that independence for the rest of the sweep.
3. **A spec disagreement** — if the code is defensible and the FS looks wrong, STOP and escalate for
   a PRD/FS amendment (PRD §9 Change Control). Do not resolve it in the sweep.

## Completion obligations

```text
- CO-1 — A per-criterion verdict table for all thirteen FS §6 criteria, each with a named method and
  checkable evidence, exists in this file.
  - Required by: this task's Goal; Stage 6's exit criterion in PROJECT_IMPLEMENTATION_PLAN.md.
  - Disposition: completed — <executor records the table location and how many criteria carry
    freshly-produced evidence vs inherited evidence>
- CO-2 — The placeholder sweep was run and its result recorded as a LAUNCH blocker, not a stage
  blocker; the count matches PROJECT_PRODUCTION_READINESS.md's inventory.
  - Required by: Item 16 CO-3 (owner-accepted risk); the scoping decision in this file.
  - Disposition: completed — <executor records the command, the counts, and confirmation that the
    readiness document's inventory agrees>
- CO-3 — Item 17's re-review was performed by a reader with no exposure to its original 9-round
  loop, and its verdict recorded.
  - Required by: PROJECT_BACKLOG.md — "Re-review Item 17 before release".
  - Disposition: completed — <executor records the verdict and where it is written>
- CO-4 — Physical-device verification is NOT discharged here and remains a pre-launch owner item.
  - Required by: Stage 7's exit criterion "mobile experience is polished"; the Stage 4B.5.1 deferral.
  - Disposition: tracked in: docs/project/PROJECT_PRODUCTION_READINESS.md
- CO-5 — If a live submit was performed, the resulting database rows are recorded as test data that
  cannot be deleted by the application.
  - Required by: a contract the verification introduces; Item 3 CO-1's precedent.
  - Disposition: <completed with reference codes, OR "not applicable — no live submit performed">
```

## Review Granularity

`single`. Expected execution-affecting surface: **zero** — this is a verification pass producing a
report. If it ends up changing source, it has exceeded its scope; stop and re-plan rather than
growing the block. Record the actual measured surface here before closing.

## Acceptance Criteria

1. All thirteen FS §6 criteria carry a verdict, a method, and evidence. No criterion is marked
   `VERIFIES` on the strength of "it was implemented in Item N".
2. Criteria whose evidence is inherited from an earlier task are labelled as inherited, with the
   date and the task named, so a reader can judge staleness themselves.
3. Mobile QA covers all six public routes at all four widths and goes beyond overflow: tap targets,
   bottom-nav interaction, form usability at 320.
4. The placeholder sweep is run, its counts agree with PROJECT_PRODUCTION_READINESS.md, and it is
   reported as a launch blocker with the stage-closure reasoning stated.
5. Item 17's re-review verdict is recorded.
6. The owner pre-release debts are enumerated with their current status.
7. A closure recommendation is stated plainly: `STAGE 6 READY TO CLOSE`, or the named blockers.
8. `pnpm qg` passes (it certifies the tree this verdict describes, even though this task changes
   no source).
9. **The verdict reached consensus on an independent cross-review thread** (see Execution). The
   recommendation may not be presented to the owner as final before that — a stage-closure claim
   carrying only its own author's sign-off is not evidence, and this is the one task where that
   distinction decides something irreversible.

## Reporting

- Update PROJECT_STAGE_LOG.md with the sweep's outcome and the closure recommendation.
- Update `STAGE_6_IMPLEMENTATION_PLAN.md`'s Item 13 row.
- If the recommendation is `STAGE 6 READY TO CLOSE`, update `PROJECT_IMPLEMENTATION_PLAN.md`'s
  Stage 6 section to record the closure — but **the owner closes the stage**, not this task. Present
  the recommendation and wait.
- Update `PROJECT_PRODUCTION_READINESS.md` if the debt statuses moved.
- **Reconcile `## Completion obligations` before closing.**
- Do **not** edit `STAGE_6_STRAT_BRIEF.md` — it is STRAT-only.
- Set Status to `done` (date + stage-log pointer, no commit hash); move this file to
  `docs/project/tasks/done/`; propose the commit for owner approval.

## Execution Report (filled by the executor)

<the verdict table; the mobile QA findings; the sweep counts; Item 17's re-review verdict; the debt
status list; the closure recommendation>
