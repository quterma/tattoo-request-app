# Research: external audit of the AI-orchestration framework (10 questions)

Status: `closed` · outcomes filed 2026-07-15 (see `## Outcome`)
Researcher: codex
Requested by: `META: AI workflow master — review open observations` (2026-07-15)

## Question

The owner described this project's process framework to an external model (Perplexity), without
showing it the repo, and asked for a critique. Perplexity's 10 questions are below. **Your job is
to answer them against the actual repository** — Perplexity answered blind, so its framing may
assume problems we do not have, or miss ones we do. Correct it where the repo contradicts it; agree
where the repo confirms it. An answer that just restates the questions in prettier words is useless.

Baseline: HEAD is `0313943`. The framework lives in `docs/framework/`:

- `AI_TASK_PROTOCOL.md` (608 lines) — session types, task lifecycle, completion obligations,
  the mandatory-review gate, checkpointed review, delegation, cross-session rules
- `AI_CROSS_REVIEW.md` (292) — review threads, research threads, header format
- `AI_REVIEW_PIPELINE.md` (215) — the in-session gate pipeline
- `AI_WORKFLOW_MASTER.md` (55) — the META role
- `AI_DEVELOPMENT_RULES.md` / `AI_DEVELOPMENT_WORKFLOW.md` — older in-session rules
- `templates/STAGE_TASK_TEMPLATE.md` (170) — the task-file skeleton
- `AI_FRAMEWORK_IDEAS.md` (708) — the observation journal; **read the resolved entries dated
  2026-07-13 and 2026-07-14, they record why most rules exist and what was already rejected**
- `.claude/CLAUDE.md` (project root) — the behavior rules a session reads first

Also relevant: `docs/project/` holds the product side (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md,
PROJECT_CONTEXT.md, the Stage 6 PRD/FS). The project is a **production MVP for a single tattoo
artist** — low volume, one primary user, mobile-first. Keep that scale in mind: this is not a
50-engineer org, and a rule that only pays off at scale is overhead here.

### Context you must factor in (the owner is aware; do not re-discover it as if new)

The framework grew very fast — most of it over 2026-07-13/14 — reactively, one observation at a
time. That history is the actual subject of several of Perplexity's questions. Two documents are
already large (`AI_TASK_PROTOCOL.md` 608 lines, the journal 708). The owner's real binding
constraint is **his own attention**, not compute — this is stated repeatedly in the journal and
must anchor every recommendation: a rule that costs owner attention on every task is worse than the
problem it solves.

### A measured fact for Q3 (verify it yourself, but here is the starting count)

Over the last 40 commits (HEAD `0313943`), a rough subject-prefix split gives **16 framework/process
commits + 15 other-docs commits vs. 8 product (`feat`/`fix`) commits** — roughly a 4:1 ratio of
process-and-docs work to product work. The product side over the same window is essentially two
shipped Items (site-wide shell `e833398`, upload-flow architecture `480c721`) plus Stage 6
planning. Re-derive this yourself (`git log --oneline`), refine the classification, and judge:
is this the healthy front-loading of a framework being bootstrapped once, or is the process now the
main activity? Do not soften the answer — the owner asked for it straight.

### The 10 questions (answer each against the repo)

1. Is the three-session split (STRAT / IMPL / META) too complex for a project this size?
2. Are the roles, rights, and responsibility boundaries between session types described clearly
   enough — or are there gaps/overlaps where two session types could both claim or both disown a
   duty?
3. **Is there a real risk the process is being optimized harder than the product?** Be concrete:
   look at the ratio of recent framework/process commits to product commits, and the size of the
   process docs vs. the product surface. This is the question the owner most wants a straight,
   evidence-based answer to — not reassurance.
4. Are tasks cut small enough to be safely executed and reviewed? (Note what already exists: a
   size trigger and checkpointed review were just added — AI_TASK_PROTOCOL.md. Assess whether they
   are sufficient and whether they will actually fire, not whether the topic is covered.)
5. Are there mandatory quality gates before a commit and before handing a task onward? (Verify
   against AI_REVIEW_PIPELINE.md and the mandatory-review gate — do they have holes?)
6. Are these explicitly fixed, and where — (a) commit size, (b) one commit per logical task,
   (c) mandatory review, (d) handling spec deviations, (e) escalating disputed decisions to META?
   For each, cite the doc+section or say plainly it is absent. (One is a known tension: item (b)
   "one commit per logical task" vs. the just-added checkpointed-review rule that a large task
   should land as *several* commits — say which the framework actually holds and whether they
   conflict.)
7. **Is the documentation overloaded, and can any rules be simplified without losing quality?**
   Name specific candidates — concrete sections that could merge, shorten, or move to a template —
   not a general "consider simplifying". This is the highest-value question if answered concretely.
8. Is it well enough described *when* to stop implementing and return to strategy? (There is an
   escalation rule — spec change → STOP → PRD/FS update. Is the trigger for it clear, or does it
   rely on a session noticing?)
9. **Is there a clear "good enough for now" bar for the process itself**, so META work terminates
   instead of improving forever? This may be the framework's biggest actual gap — there is no
   stated stopping condition for process work, and this very audit could become an instance of the
   problem. Say what such a bar could be.
10. What are the **minimum** changes that would most reduce the risk of chaos and manual
    coordination *without* adding complexity? Rank them. "Minimum" is the operative word — the
    framework's failure mode is accretion, so a recommendation to add another document or rule
    needs to justify itself hard.

### Required output shape

End with exactly four lists, each item one line, each pointing at a specific doc/section:

- **Works well** — keep as is.
- **Simplify** — specific sections to merge/shorten/cut, with what is lost (if anything).
- **Tighten** — specific gaps to close.
- **Defer until after MVP** — real but not now, with why it can wait.

### Constraints your answer must respect

1. **Read the journal's resolved entries first.** Almost every rule has a recorded reason and a
   list of already-rejected alternatives (a Codex plan pre-check, a generated status file, an
   OPEN_ACTIONS.md, per-session worktrees, a bare "check before committing" rule). Recommending a
   rejected idea without engaging why it was rejected is a non-starter. If you think a rejection
   was wrong, say so and argue it.
2. **Owner attention is the binding constraint.** Rank every "tighten" by what it costs the owner
   when it fires. Prefer rules that cost nothing when they do not fire.
3. **The framework's failure mode is accretion, not omission.** Bias toward "simplify" and
   "defer"; hold "tighten" to a high bar. If your net recommendation adds more than it removes,
   justify that explicitly.
4. **This is a single-user MVP, not a scaling org.** Reject your own suggestions that only pay off
   at team scale.
5. **No decision is yours.** Options with trade-offs; the owner decides. For each recommendation,
   name what it gives up.
6. **Provenance labels are mandatory** (AI_CROSS_REVIEW.md — Research Threads): mark what you
   verified against the repo (file read, command run — e.g. the commit-ratio counts for Q3) vs.
   model reasoning. This audit is almost entirely repo-internal; if any part genuinely needs
   current external facts (how comparable solo/small-team AI workflows are structured), do not
   answer from memory — write a prompt for an external AI, set the thread to `awaiting-external`,
   and hand it to the owner. Use judgment: most of this does not need it.

## Findings 1

### Method and provenance

**Repo-verified.** I verified HEAD as `0313943c5c76127386cb5ef0c3978aca732ea60d`, read the
documents named in the question (including the resolved 2026-07-13/14 journal entries), inspected
the live task files, `package.json`, `.husky/pre-commit`, and re-derived the last-40-commit counts
from `git log -40`. The only working-tree entry reported by `git status --short` was this untracked
research thread. I did not run quality gates: this is a documentation-only investigation with no
source change.

**Model reasoning (repo-grounded, no external factual claim).** The judgments below are inferences
from those repository facts and the owner's stated constraint. No question here requires a current
competitor/platform/library fact, so I did not delegate any part to an external AI.

### Q1 — Is STRAT / IMPL / META too complex for this project?

**Repo-verified.** `AI_TASK_PROTOCOL.md — Session Types` gives each type one distinct object:
STRAT owns discovery/product planning, IMPL executes one task, and META changes the process. The
journal records two concrete failures that the separation corrected: a STRAT session performed an
IMPL post-review fix loop (`AI_FRAMEWORK_IDEAS.md`, 2026-07-13 post-review ownership entry), and an
IMPL session silently substituted behavior during planning (the 2026-07-13 plan-deviation entry).
`AI_TASK_PROTOCOL.md — Post-Review Fix Loop` now routes routine fixes back to the originating IMPL
session and reserves product/architecture decisions for escalation.

**Model reasoning.** Three labels are not the excessive part; they encode useful separation of
decision, execution, and process maintenance. Collapsing STRAT and IMPL would recreate failures
already observed. The excess is that META is defined as a permanently active improvement program:
`AI_WORKFLOW_MASTER.md — Mandate` asks it to track issues “from large … to small (prompt wording,
naming),” while `AI_TASK_PROTOCOL.md — Cross-Session Rules` requires *any* friction to enter the
journal. For this MVP, keep the three labels but make META incident-driven or owner-invoked, not a
continuous optimization stream. What this gives up: some small prompt/naming improvements will wait
until a retrospective.

### Q2 — Are roles, rights, and boundaries clear enough?

**Repo-verified.** The detailed ownership rules are mostly clear: `AI_CROSS_REVIEW.md — Roles`,
`AI_TASK_PROTOCOL.md — Post-Review Fix Loop`, and `AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to
Codex` specify author, reviewer, fix owner, allowed write surface, and final reviewer. Review
disputes go to the owner (`AI_CROSS_REVIEW.md — Turn Structure`); process issues go to META
(`AI_WORKFLOW_MASTER.md — Working Loop`); product behavior goes through the PRD/FS owner-decision
route (`STAGE_6_FUNCTIONAL_SPECIFICATION.md §1`; `PROJECT_DECISIONS.md — Stage 6 Product
Documentation Authority`).

**Repo-verified gaps/overlaps.** Clarity fails at the summary and copied-instruction layers:

1. `AI_TASK_PROTOCOL.md — Session Types` says IMPL “Ends with Review Pipeline + reporting,” and
   `Lifecycle` allows `in progress → done` “after Review Pipeline + reporting.” Both omit the later
   mandatory cross-review-to-consensus gate in the same document. The task template is correct;
   the summary/lifecycle are stale.
2. `AI_TASK_PROTOCOL.md — Deviations must be flagged at plan time` classifies the source only as
   “task file” or “PRD/FS.” It does not say how to route a contradiction with
   `PROJECT_ARCHITECTURE.md` or an authoritative `PROJECT_DECISIONS.md` architecture decision,
   although `Post-Review Fix Loop` separately says architecture decisions must escalate.
3. The older `AI_DEVELOPMENT_RULES.md — Permission Levels / Documentation Editing Rules` speaks of
   a generic AI that may update code and project docs, while AGENTS.md and the delegated-task path
   give Codex a narrow per-task write surface. The right answer exists, but only after knowing which
   later document overrides the generic one.
4. Copied instructions have already rotted. `STAGE_6_TASK_08_preparation_aftercare_split.md —
   Workflow` line 125 still says to compare HEAD to literal baseline `da6861f`, contradicting that
   task's corrected `Execution` section and the derived-baseline rule. The draft
   `TOOLING_TASK_01_project_status_command.md — Workflow` tells a Codex executor to run `pnpm qg`
   and open a cross-review thread, contradicting AGENTS.md and `AI_TASK_PROTOCOL.md — Delegating
   IMPL Tasks to Codex` (Codex runs lint/typecheck/test; Claude runs full qg; routine delegated
   tasks use the task-file review verdict, not a duplicate thread).
5. `AI_TASK_PROTOCOL.md — Completion Obligations` says `pnpm project:status` *surfaces* blockers,
   and `AI_CROSS_REVIEW.md — Header format` calls itself machine-read by that command, but
   `package.json` has no `project:status` script and the task is still `draft`. These present-tense
   state claims are false today.

**Model reasoning.** A diligent reader can reconstruct responsibility, but the framework is not
locally clear: summaries, generic legacy rules, templates, and copied task workflows can disagree.
The minimum correction is not a new role matrix. Make `AI_TASK_PROTOCOL.md` summaries agree with
its detailed rules, retire the two generic legacy documents to short pointers, and keep task files
to task-specific instructions rather than copied global workflow. Trade-off: a task is slightly
less self-contained and requires following one canonical protocol link.

### Q3 — Is process being optimized harder than product?

**Repo-verified counts.** The starting count is directionally correct and slightly understates the
implementation bucket. Over the last 40 commits:

| Classification | Count | Basis |
| --- | ---: | --- |
| `docs(framework):` | 16 | exact subject prefix |
| other `docs...` | 15 | product/stage/decision/review documentation, not all pure process overhead |
| execution-affecting | 9 | 8 `feat`/`fix` commits plus `41ce3b6` (supported Node runtime) |

That is 31 documentation/framework commits to 9 execution commits, about **3.4:1**. In the narrower
window from the framework's introduction (`a81d430`) through HEAD there are 28 commits: **16
framework + 10 other docs + 2 product implementation commits** (`e833398`, `480c721`). Commit count
is not effort, and the ten stage-doc commits include legitimate product definition and review
outcomes, so calling all 26 “process waste” would be false. It is still a very strong activity
skew.

**Repo-verified size check.** All Markdown under `docs/framework/` totals **3,571 lines**. The eight
core files named by the question total **2,491 lines** including the 708-line journal, or **1,783
lines** without it. Non-test runtime `.ts/.tsx` under `app/` and `src/` is **5,135 lines**; tests are
another **4,040**; the Stage 6 PRD+FS are **322**. Line counts are not semantic complexity, but the
framework is now about 70% of runtime-source size, and its operational core plus journal is about
half of runtime-source size.

**Repo-verified benefit.** This is not all ceremony. The Item 1 independent review caught two real
blockers missed by the in-session pipeline (undeliverable upload limit and broken expired-handle
idempotent replay), and the completion-obligations analysis exposed a live migration/secret/E2E
handoff failure. Those rules paid for themselves at least once.

**Model reasoning — straight answer.** Yes: the risk has already materialized. The initial
front-loading was defensible, and some controls demonstrably work, but 16 framework commits and a
708-line reactive journal in two days show that process improvement has become a primary product
of the repository. The current framework has crossed the point where every observed imperfection
deserves immediate codification. A freeze/admission bar is now more valuable than another broad
audit pass. What a freeze gives up: non-blocking refinements accumulate until the MVP
retrospective.

### Q4 — Are tasks small enough, and will the checkpoint trigger fire?

**Repo-verified.** The evidence is mixed but small. Item 2 shipped as a reviewable block (10
execution files in commit `e833398`, under the new threshold). Item 1 was not safely sized: the
framework's own measurement is 28 execution-affecting files / 1,763 lines of execution churn, with
60 files total; one late review found design blockers after downstream UI/tests had been built.
The active Item 8 task names six small path families and is mechanically bounded. Items 3–7 are not
yet cut into task files, so the repository does not support a broad claim that future tasks are
consistently small.

**Repo-verified.** `AI_TASK_PROTOCOL.md — A Large Task Is Reviewed in Checkpoints` addresses the
right failure: review granularity, not an arbitrary one-task/one-commit rule. The trigger (16 files
or 500 execution churn) is explicitly a trial calibrated on one positive and 19 negative recent
runtime-touching commits. It fires at plan time and is rechecked before final review. That is a
reasonable experiment, not yet validated policy.

**Repo-verified firing gaps.** The protocol also fires when a plan has four independently testable
seams (`The size trigger`, plan-time bullet), but `STAGE_TASK_TEMPLATE.md — Review Granularity`
mentions only 16 files / 500 lines. The template's `Reporting` section does not explicitly require
recording the actual final file/churn measurement. Because plans are chat state rather than
persisted structured data, the early check still depends on the IMPL session estimating and
noticing it; only the final diff is objectively measurable.

**Model reasoning.** Do not add another threshold. Synchronize the existing trigger into the
template and add one final-review checkbox/measurement line. This costs no extra owner round-trip
and makes the trial capable of producing evidence. Recalibrate only after several firings or
near-misses, as the protocol already says. What is given up: nothing except a few seconds of diff
measurement; a premature numeric retune is deferred.

### Q5 — Are mandatory gates present before commit and handoff?

**Repo-verified.** Yes, procedurally. `.claude/CLAUDE.md — Pre-Commit Checklist`,
`AI_REVIEW_PIPELINE.md — Execution Order / Pipeline Status`, and
`STAGE_TASK_TEMPLATE.md — Workflow` require tests, lint, typecheck, build, a read-only in-session
review, fixes/re-runs, and independent consensus before a source commit is proposed.
`package.json` defines `pnpm qg` as structure → lint → typecheck → test → build. For delegated
Codex tasks, `AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex` requires Codex's own
lint/typecheck/test loop before `awaiting-claude-review`, then an unfamiliar-patch review and a
mandatory full `pnpm qg` by Claude before `done`. That is a strong handoff gate.

**Repo-verified holes/limits.** Enforcement is documentary, not complete at the Git boundary:
`.husky/pre-commit` runs only lint + typecheck, and there is no required remote CI; the latter is an
explicit deferred decision with a pre-launch/second-contributor trigger (`PROJECT_DECISIONS.md —
CI/CD — Explicit Decision and Trigger`). Also, the summary/lifecycle omission identified in Q2 can
allow a literal reader to mark a normal task done after the in-session pipeline but before
consensus. Finally, the docs repeat two quality-gate orderings: `AI_REVIEW_PIPELINE.md — Quality
Gates` says build then test, while `pnpm qg` runs test then build. Coverage is the same, but repeated
command lists invite drift.

**Model reasoning.** For the current single-owner MVP, local procedural enforcement plus explicit
owner commit approval is “good enough” if the lifecycle wording is fixed; remote CI should remain
on its existing pre-launch trigger. Make `pnpm qg` the one canonical Claude-side command rather
than restating its internals in several framework files. What this gives up: individual documents
no longer show the full command sequence inline.

### Q6 — Where are the five requested controls fixed?

**Repo-verified.** Exact mapping:

| Control | Repository answer | Audit conclusion |
| --- | --- | --- |
| (a) commit size | `AI_DEVELOPMENT_RULES.md — Commit Rules` and `AI_DEVELOPMENT_WORKFLOW.md — Step 6` say small/focused/logically grouped; `AI_TASK_PROTOCOL.md — A Large Task Is Reviewed in Checkpoints` has a numeric **review** trigger | No universal numeric commit-size rule. Large tasks are expected to produce checkpoint commits, but the number governs review admission, not commit size. |
| (b) one commit per logical task | Absent as a mandatory rule; `AI_TASK_PROTOCOL.md — A Large Task... — The rule` explicitly allows one task to land as a small number of checkpointed blocks/commits | The framework actually holds **one task per IMPL session, potentially several checkpoint commits**. There is no real conflict once (b) is recognized as absent; add one clarifying sentence rather than imposing one-task/one-commit. |
| (c) mandatory review | `AI_TASK_PROTOCOL.md — Independent Review Is Mandatory`; `AI_REVIEW_PIPELINE.md — Execution Order` step 8 and `Pipeline Status`; delegated path in `AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex` | Fixed for source blocks. Routine delegated work uses Claude's independent task-file review rather than a duplicate cross-review thread. |
| (d) spec deviations | `AI_TASK_PROTOCOL.md — Deviations must be flagged at plan time`; `STAGE_TASK_TEMPLATE.md — Workflow` steps 4/8; `STAGE_6_FUNCTIONAL_SPECIFICATION.md §1` | Fixed for task-vs-PRD/FS deviations; incomplete for conflicts sourced in PROJECT_ARCHITECTURE/PROJECT_DECISIONS and missing an explicit resume condition. |
| (e) disputed decisions to META | No generic rule; `AI_CROSS_REVIEW.md — Turn Structure` routes disputed findings to owner, `AI_WORKFLOW_MASTER.md — Role` excludes product/architecture, and `AI_TASK_PROTOCOL.md — Cross-Session Rules` routes only process friction to META | Correctly absent as a universal escalation. Product/review disputes should not be sent to META; only process-rule disputes belong there. |

**Model reasoning.** The tension raised in the question is mostly a terminology problem: “logical
task” and “reviewable/committable block” are different units. Keeping one task file while using two
risk-based checkpoint commits is coherent and cheaper than multiplying task files. What is given
up is the aesthetically simple one-task/one-commit history, which is not worth late review on a
large block.

### Q7 — Is documentation overloaded, and what can be simplified?

**Repo-verified.** Yes. Concrete consolidation candidates:

| Candidate | Concrete change | What is lost |
| --- | --- | --- |
| `AI_DEVELOPMENT_RULES.md` + `AI_DEVELOPMENT_WORKFLOW.md` | Replace most implementation-cycle, permission, scope, ask, and commit sections with a short compatibility/index page pointing to CLAUDE.md, `AI_TASK_PROTOCOL.md`, and `AI_REVIEW_PIPELINE.md`; retain only genuinely generic rules not owned elsewhere | Standalone readability of the two older generic documents |
| `AI_TASK_PROTOCOL.md` | Keep operative rules, tables, triggers, and ownership; remove embedded incident narratives and rejected-option essays from Session Duties, Completion Obligations, Mandatory Review, Large Task, Post-Review Fix Loop, and derived baseline; point to the dated journal entries | Rationale is one click away instead of inline; a reader must follow a pointer when challenging a rule |
| `AI_FRAMEWORK_IDEAS.md — Workflow Observations` | Keep open observations plus compact resolved summaries (problem, decision, owning section, rejected alternative in one sentence); rely on git history/review threads for the full incident transcript | Less convenient forensic history in the active file |
| `.claude/CLAUDE.md — Before Presenting Implementation Results / Pre-Commit Checklist` | Keep project-specific hard rules and explicit commit/index safety; replace duplicated pipeline/task lifecycle details with canonical section links | CLAUDE.md is no longer a full standalone copy of the pipeline |
| `AI_CROSS_REVIEW.md — Header format / Research Threads / Owner Effort` | Remove dated anecdotes already in the journal, compress status mechanics into the existing tables, and remove the final Owner Effort restatement where the status table already defines the turn | Less narrative explanation for first-time readers |
| `STAGE_TASK_TEMPLATE.md — Workflow / Reporting` | Copy only task-specific deviations/additions into generated tasks; reference the standard workflow instead of cloning it line-for-line; keep required metadata, scope, acceptance, obligations, and review granularity in the task | Executors must read the canonical protocol; tasks become less self-contained |

**Model reasoning.** The strongest simplification is deleting duplication, not splitting documents
again. The two live task contradictions in Q2 show that self-contained copied workflow is already
costing correctness. A sensible target is a net deletion of several hundred lines while leaving
every enforceable rule in one canonical location. Do not create another framework index/status
document to explain the simplification.

### Q8 — Is the stop-and-return-to-strategy trigger clear?

**Repo-verified.** The trigger is stated repeatedly and clearly for product behavior:
`STAGE_6_FUNCTIONAL_SPECIFICATION.md §1` says unanswered product questions escalate;
`AI_TASK_PROTOCOL.md — Deviations` says PRD/FS contradiction → STOP; `Post-Review Fix Loop` says a
finding needing a product/architecture decision is the only route back to STRAT; and
`STAGE_TASK_TEMPLATE.md — Workflow` step 8 repeats the stop rule. Plan-time source citation and
independent review are two backstops, but neither can mechanically understand every semantic
deviation.

**Model reasoning.** The trigger is clear; detection necessarily relies on the session noticing a
semantic conflict. The actual gaps are narrower: authoritative architecture/decision sources are
not included in the plan-deviation classifier, and no section says when implementation may resume.
One sentence can close both: a contradiction with any authoritative product/architecture source
stops work; resume only after the owning doc and task file are updated and the plan is re-approved.
Owner cost occurs only when a real decision is required—the cost already inherent in changing the
spec. What this gives up: an IMPL session cannot use quick plan approval to bypass a durable
architecture decision.

### Q9 — Is there a “good enough for now” bar for the process?

**Repo-verified.** No. `AI_WORKFLOW_MASTER.md — Mandate / Working Loop` has an intake loop but no
admission threshold, WIP limit, freeze, exit condition, or MVP retrospective trigger.
`AI_TASK_PROTOCOL.md — Cross-Session Rules` says *any* friction is journaled. The 708-line journal
and the commit ratio are the resulting evidence. The only revisit conditions are local to
individual rules (for example, reconsider blanket review if Codex becomes costly); there is no
stop condition for META as a whole.

**Model reasoning — options for the owner.** Option A is an **incident admission bar** in the
existing `AI_WORKFLOW_MASTER.md`: change the framework before MVP only when a repo-verified event
(1) caused or could directly cause wrong product/security/data/commit contents, (2) blocks a live
task/handoff, (3) repeats after an existing rule, or (4) removes an owner action without adding a
steady-state owner action. If none applies, stop META and defer to the Stage 6/MVP retrospective.
This costs nothing when it does not fire and gives up minor proactive refinements. Option B is a
**cadence/budget bar** (for example, batch META only after several product commits); it is easier to
count but can delay a serious first-occurrence defect and invites gaming the ratio. Either option
belongs as a short subsection in `AI_WORKFLOW_MASTER.md`, not a new document. The current audit
should terminate after the owner chooses or rejects the minimum changes below; it should not spawn
another general audit.

### Q10 — Minimum changes, ranked

**Rank 1 — add a stop/admission bar, and narrow friction intake.** Amend
`AI_WORKFLOW_MASTER.md — Mandate / Working Loop` and the first bullet of
`AI_TASK_PROTOCOL.md — Cross-Session Rules`; no new document/status/round-trip. This directly
attacks the demonstrated failure mode. Trade-off: low-impact issues wait.

**Rank 2 — make one canonical path and delete copies.** Retire most of
`AI_DEVELOPMENT_RULES.md`/`AI_DEVELOPMENT_WORKFLOW.md`, trim historical rationale from
`AI_TASK_PROTOCOL.md`, and compact resolved journal entries. This is more editing than Rank 1 but
adds no mechanism and reduces future reading/contradiction cost. Trade-off: less standalone
narrative context.

**Rank 3 — close only the proven synchronization holes.** Fix IMPL end/lifecycle to require
consensus, broaden deviation sources to authoritative architecture/decision docs, add the
four-seam + final-measurement check to `STAGE_TASK_TEMPLATE.md — Review Granularity / Reporting`,
and correct the two live task-workflow contradictions named in Q2. These are zero-round-trip checks
inside existing turns. Trade-off: a few extra seconds of plan/final-diff bookkeeping.

**Rank 4 — choose deliberately on the already-decided status command, without expanding it.** The
owner already decided “build the command,” but `TOOLING_TASK_01_project_status_command.md` remains
draft while canonical prose speaks as if it exists. Either promote/execute a minimal read-only
version (active artifacts + current integrity checks) or change the framework to future tense and
defer it; do not add a generated status file. Implementing it adds one script/test surface but
removes repeated manual directory scans; deferring preserves product focus but leaves that manual
coordination cost.

## Response 1

Verdict: findings accepted almost entirely. This is the most useful research turn of the three,
because it turns an outside model's blind critique into repo-verified fact — and the central
answer is uncomfortable, which is exactly why it is worth having. Nothing here is mine to decide.

### I re-verified the sharpest claims before relaying them

Every "live contradiction" Codex named checks out against the repo — I confirmed each:

- **`pnpm project:status` does not exist** (`package.json` has no such script; the task is
  `draft`), yet `AI_TASK_PROTOCOL.md:321` and `AI_CROSS_REVIEW.md:56` speak of it in the present
  tense ("surfaces blockers", "read by … that command"). Present-tense claims about a thing that
  isn't built — the exact class the framework's own "verify state claims" rule forbids. **This one
  I caused**, writing those references while filing the command as future work.
- **`STAGE_6_TASK_08` Workflow line 125** still says to compare HEAD to literal `da6861f` and stop
  if it differs — contradicting the corrected Execution section (line 19) of the *same file* and
  the derived-baseline rule I wrote yesterday. I fixed the header and missed the copy of the rule
  buried in Workflow.
- **Lifecycle (lines 18, 234)** says a task reaches `done` "after Review Pipeline + reporting",
  omitting the mandatory consensus gate I added in the same document. A literal reader can close a
  task before the independent review. Also mine.

So the audit's most valuable output is not the abstract critique — it is that **my own three
commits this week left desynchronized tails**, and an independent repo-aware pass found them where
neither the gates nor an owner read would. That is the mechanism working.

### The straight answer to Q3, undiluted

Codex refined the count and did not soften it: **~3.4:1 documentation/framework to execution
commits** over the last 40; in the framework's own lifetime (`a81d430`→HEAD, 28 commits) it is
**16 framework + 10 other-docs + 2 product-implementation**. The framework is now ~70% of runtime-
source size; its operative core plus journal is ~half. Some of it demonstrably paid off (the review
caught two real blockers; completion-obligations exposed the live migration/secret gap). But the
honest reading stands: **process improvement has become a primary product of this repository**, and
the initial front-loading has tipped into "every observed imperfection gets codified immediately".

This vindicates the worry the owner brought from Perplexity, and it points at Q9 as the real fix,
not another audit.

### The one gap I'd call the most important: no stop condition (Q9)

The framework has no "good enough for now" bar for *itself*. `AI_WORKFLOW_MASTER.md` has an intake
loop but no exit; `Cross-Session Rules` sends **any** friction to the journal. That is precisely
why it grew 708 journal lines and 16 framework commits in two days — and this audit is itself at
risk of being another instance. Codex's Option A (an **incident admission bar**: change the
framework before MVP only when a repo-verified event caused/could cause wrong
product/security/data/commit contents, blocks a live task, repeats after an existing rule, or
removes an owner action without adding one) costs nothing when it doesn't fire and directly attacks
the demonstrated failure mode. I'd take it over the cadence/budget variant (Option B), which
invites gaming the ratio.

### What I'd flag about the recommendations themselves

The bias is correctly toward simplify/defer, and the "tighten" list is almost entirely
**zero-round-trip synchronization fixes** (make stale summaries match rules already in force) — not
new mechanism. That is the right shape given the accretion problem. Two cautions:

- The **Simplify** list is large (potentially several hundred deleted lines) and is itself process
  work — the very activity Q3 says to throttle. It should be done **once, deliberately, as the
  closing act of this META arc**, not become an ongoing refactoring stream. Otherwise we simplify
  the docs about not over-working the docs, forever.
- "Retire `AI_DEVELOPMENT_RULES.md`/`AI_DEVELOPMENT_WORKFLOW.md` to pointers" is sound but touches
  the older layer I have not been editing this week; it deserves its own careful pass, not a
  rushed merge into a synchronization commit.

### Итог для владельца (RU)

Это самый полезный из трёх ресёрчей, и вывод неприятный — поэтому и ценный. Codex не гладит: да,
**процесс оптимизируется сильнее продукта**, и это уже произошло, а не «риск». Соотношение — ~3.4:1
коммитов про доки/процесс к коммитам про продукт; фреймворк дорос до ~70% размера рантайм-кода. Да,
часть правил окупилась (ревью поймало два реальных блокера, обязательства вскрыли живую дыру с
миграцией). Но режим работы сейчас — «каждую замеченную шероховатость немедленно кодифицируем».

И он нашёл конкретное, что я сам же вчера недосинхронизировал (я перепроверил — всё правда):
команда `project:status` ещё не существует, а три места в доках говорят о ней как о готовой;
в задаче 08 в одном месте починил baseline, в другом (Workflow) осталась старая версия; и summary
жизненного цикла задачи не упоминает обязательный консенсус, который я же добавил. То есть аудит
поймал хвосты моих собственных правок — механизм сработал.

Главная дыра, по мне: **у самого процесса нет критерия «достаточно».** Отсюда и 708 строк журнала
за два дня. Лечится не новым аудитом, а стоп-планкой (менять фреймворк до MVP только если событие
реально грозит продукту/безопасности/данным, блокирует задачу, повторяется или убирает вашу ручную
работу — иначе в бэклог до ретро). Стоит ноль, когда не срабатывает.

Ниже — четыре списка Codex (работает / упростить / ужесточить / отложить) без изменений; они
конкретны и ссылаются на секции. Дальше спрошу вас, что из этого запускаем.

### Works well

- `AI_TASK_PROTOCOL.md — Post-Review Fix Loop` — keep originating-IMPL ownership and no final STRAT rubber stamp; it resolves an observed boundary failure without recurring owner work.
- `AI_TASK_PROTOCOL.md — Independent Review Is Mandatory` + `AI_REVIEW_PIPELINE.md — Pipeline Status` — keep the distinction between in-session gates and independent consensus; it caught real blockers.
- `AI_TASK_PROTOCOL.md — Completion Obligations` — keep the objective three-part qualification and canonical-work disposition; it closes a real deployed-system handoff gap.
- `AI_TASK_PROTOCOL.md — A Large Task Is Reviewed in Checkpoints` — keep as a trial rule and gather firings before changing the numeric threshold.
- `AI_CROSS_REVIEW.md — Review Threads / Turn Structure` — keep status-driven ownership, one review slot, and owner-only dispute decisions; the transport cost is explicit and bounded.

### Simplify

- `AI_DEVELOPMENT_RULES.md` + `AI_DEVELOPMENT_WORKFLOW.md` — reduce to short pointers plus unique generic rules; loss: standalone onboarding, gain: one canonical implementation path.
- `AI_TASK_PROTOCOL.md — Session Duties through Delegation` — remove dated incident narratives/rejected-option essays already preserved in `AI_FRAMEWORK_IDEAS.md`; loss: inline rationale, gain: much shorter operative protocol.
- `AI_FRAMEWORK_IDEAS.md — Workflow Observations` — compact resolved entries to decision + owning section + rejected alternative; loss: active-file forensic detail, retained in git/thread history.
- `.claude/CLAUDE.md — Before Presenting Implementation Results / Pre-Commit Checklist` — retain project-specific hard rules and link the canonical pipeline instead of restating it; loss: single-file completeness.
- `STAGE_TASK_TEMPLATE.md — Workflow / Reporting` — stop copying global workflow into every task and record only task-specific additions; loss: some self-containment, gain: no stale cloned rules.
- `AI_CROSS_REVIEW.md — Header format / Research Threads / Owner Effort` — remove anecdotes and duplicate turn explanations while retaining status tables and required fields; loss: narrative context only.

### Tighten

- `AI_WORKFLOW_MASTER.md — Mandate / Working Loop` + `AI_TASK_PROTOCOL.md — Cross-Session Rules` — add one incident admission/stop bar so META freezes when no qualifying defect exists.
- `AI_TASK_PROTOCOL.md — Session Types / Lifecycle` — state that a source-changing IMPL task ends and reaches `done` only after independent consensus, fixes, gate re-run, and reporting.
- `AI_TASK_PROTOCOL.md — Deviations must be flagged at plan time` + `STAGE_TASK_TEMPLATE.md — Workflow` — include authoritative `PROJECT_ARCHITECTURE.md`/`PROJECT_DECISIONS.md` sources and an explicit resume-after-doc-update-and-reapproval condition.
- `STAGE_TASK_TEMPLATE.md — Review Granularity / Reporting` — include the protocol's four-seam trigger and require the actual final file/churn measurement before the final review.
- `STAGE_6_TASK_08_preparation_aftercare_split.md — Workflow` — replace stale literal `da6861f` logic with the derived-baseline rule already present in its Execution section.
- `TOOLING_TASK_01_project_status_command.md — Workflow` — align the Codex gate/review handoff with AGENTS.md and `AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex` before the task can become ready.
- `AI_TASK_PROTOCOL.md — Completion Obligations` + `AI_CROSS_REVIEW.md — Header format` — use future tense for `pnpm project:status` until the draft task is actually implemented.

### Defer until after MVP

- `PROJECT_DECISIONS.md — CI/CD — Explicit Decision and Trigger` — keep remote full-gate enforcement on the existing pre-launch/second-contributor trigger; local owner-approved flow is adequate for now.
- `AI_TASK_PROTOCOL.md — Independent Review Is Mandatory` — defer replacing blanket review with a risk threshold until Codex cost or queue contention actually changes.
- `AI_TASK_PROTOCOL.md — A Large Task Is Reviewed in Checkpoints` — defer automated sizing, more metrics, or threshold retuning until several real firings provide evidence.
- `AI_TASK_PROTOCOL.md — Cross-Session Rules` / `AI_FRAMEWORK_IDEAS.md` 2026-07-13 shared-index entry — defer per-session worktrees unless parallel-edit collisions recur; the no-stage-before-approval rule already removed the known exposure window.
- `AI_DEVELOPMENT_WORKFLOW.md — Step 6` — defer any universal one-task/one-commit rule indefinitely; checkpointed large tasks legitimately need multiple commits and the extra approvals are not free.

## Outcome

Owner decisions, 2026-07-15. The audit's central answer (Q3: yes, process is being optimized
harder than product — already materialized, not a risk) is accepted, and the response is structured
so that fixing it does not *itself* become more process churn.

| Area | Decision | Filed |
| --- | --- | --- |
| **Q9 — stop condition** | **Adopt the event-based Admission Bar.** The framework changes before MVP only when a repo-verified event caused/could-cause wrong product/security/data/commit contents, blocks a live task, repeats after an existing rule, or removes a recurring owner action. Otherwise the observation waits for the post-MVP retrospective. A META session that finds nothing over the bar ends without editing a doc. (Cadence/budget variant rejected — invites gaming the ratio.) | `AI_WORKFLOW_MASTER.md` — new **Admission Bar** section; `AI_TASK_PROTOCOL.md` — Cross-Session Rules intake bullet narrowed |
| **Live contradictions** | **Fixed now** (synchronization, explicitly outside the bar). Lifecycle/Session-Types now say a source task reaches `done` only after consensus; TASK_08 Workflow uses the derived baseline; `pnpm project:status` is future-tense until built; the template's Review-Granularity trigger includes the four-seam case and requires a final measurement. | `AI_TASK_PROTOCOL.md`, `AI_CROSS_REVIEW.md`, `STAGE_TASK_TEMPLATE.md`, `STAGE_6_TASK_08_...md` (this commit) |
| **Q7 — consolidation** | **Do it once, as a scoped task, not now inline.** The Simplify list is real but is itself process work touching the older unedited layer; rushing it at the tail of a long session is the exact risk being managed. Filed as a `draft` task for a fresh Opus session with its own cross-review. | `docs/project/tasks/META_TASK_01_framework_consolidation.md` (`draft`) |
| **Remaining Tighten items** | Two applied above; the rest folded into the consolidation task's scope or left as pointers. `TOOLING_TASK_01` Codex-handoff alignment noted for when that task leaves `draft`. | — |
| **Defer list** | Accepted as-is — CI/CD trigger, risk-threshold review, checkpoint auto-sizing, per-session worktrees, one-commit-per-task. No action. | (no change — deferred) |

**The audit's most concrete win, recorded plainly:** an independent repo-aware pass found three
live desynchronizations left by *this week's own framework commits* (a not-yet-built command
described in the present tense, a half-corrected baseline in TASK_08, a lifecycle summary omitting
the consensus gate). None was caught by the gates or by owner reads. That is the cross-review/
research mechanism doing exactly what it exists for — and it is also evidence for the Admission Bar,
since the desyncs are a direct cost of codifying too fast.
