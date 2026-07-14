# Research: unexecuted follow-ups, and the size of a reviewable block

Status: `closed` · outcomes filed 2026-07-14 (see `## Outcome`)
Researcher: codex
Requested by: `META: AI workflow master — review open observations` (2026-07-14)

## Question

Two observations filed by the IMPL session that built Stage 6 Item 1 (upload-flow architecture),
both raised by the owner. They are in one thread because they are **the same disease seen twice**:
a durable doc recorded the right thing, and nothing in the process obliged anyone to act on it.
A fix for either that ignores the other will be a partial fix.

Baseline: HEAD is `97253ec`. Read the two `open` entries at the end of
`docs/framework/AI_FRAMEWORK_IDEAS.md` (Workflow Observations) — they are the raw filings and
contain detail not repeated here. Also read `AI_TASK_PROTOCOL.md`, `AI_CROSS_REVIEW.md`,
`AI_REVIEW_PIPELINE.md`, `docs/framework/templates/STAGE_TASK_TEMPLATE.md`, and the completed
review `docs/project/reviews/done/REVIEW_2026-07-14_stage6-item1-upload-flow.md`.

**Out of scope for you: do not fix, apply, or design the migration/env/verification work itself.**
That is product/implementation work owned by another session and is already being handled. This
thread is strictly about the *process* that let it hang.

---

### Q1 — Nothing converts "this must still be done" into work that gets done

Item 1 shipped with green gates and a clean independent review, and left three mandatory actions
undone: an **unapplied DB migration** (the code writes three new category values; the live DB still
had the two-value CHECK constraint, so any request with an image would fail on insert — unit tests
mock the DB and cannot see this), a **new required env var** (`UPLOAD_TOKEN_SECRET`, without which
the production build fails at module load), and a **required live end-to-end verification** that
PROJECT_DECISIONS.md's own "Database Stage Completion Criteria" demands ("unit tests are
insufficient to verify database-related stages").

All three **were recorded** in the durable docs. All three would still have been missed: they
surfaced only because the owner asked "did you record the migration and the token?". The session
had recorded them; it had not made them **actionable**. Had he not asked, the next IMPL session
would have built on a database its predecessor had silently broken.

The gap looks structural, not like a lapse: a green `pnpm qg` certifies the **tree**, not the
**deployed system**; the task template's Reporting section says "update the Stage Log", not "file
what you did not do as work"; and no rule tells a STRAT session to read the previous item's
leftovers before planning the next one.

**What we want from you:**

1. Should the task file carry an explicit **"Deferred actions / not done by this session"**
   section whose entries a session is *required* to convert into tracked work (a task file, a plan
   item, a flagged backlog entry) rather than narrate in a journal?
2. Should there be a standing **STRAT duty** — before planning the next item, read the previous
   item's deferred actions and triage them — so the handoff does not depend on the owner noticing?
3. Is there a case for a **machine-checkable marker** (a `⛔ BLOCKER` convention, an
   `OPEN_ACTIONS.md`) so an unapplied migration cannot hide mid-paragraph in a long log entry?
   Note the constraint this must respect: this project has an accepted rule that a task's `Status`
   field is canonical and narrative docs must not restate state (AI_TASK_PROTOCOL.md — Session
   Duties), and a rejected idea of a *generated* status file (it rots the moment generation is not
   the last action — see `research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`).
   A new hand-maintained "open actions" doc would be the same trap; say so if that is your read.
4. Generalize: this project keeps hitting **"the durable doc says the right thing, but nothing acts
   on it"**. Is the fix per-case, or is there one rule — *anything a session did not do but which
   must be done becomes a tracked work item, not a sentence in a journal* — that subsumes the class?
   If one rule, name precisely what makes an item qualify, because "everything worth doing" is a
   rule that will be ignored.

Relevant already-built machinery you should reuse rather than reinvent: `pnpm project:status` is
**already commissioned** as a `draft` task (`docs/project/tasks/TOOLING_TASK_01_project_status_command.md`)
— a read-only command that derives open work and integrity warnings from canonical files and
writes nothing. If your answer to (3) is "a marker that the command can check", say exactly what
field it should read, and treat extending that task as the natural home rather than proposing a
parallel mechanism.

### Q2 — One task became one 60-file commit, and one review at the end

Item 1 landed as a single commit: 60 files, +3,496 / −938 — 28 production files, 18 test files, 10
docs, 4 config/migration/env. It is not padding: the task genuinely was a pipeline redesign. The
owner's point is blunt and correct: **nobody can review that volume well.**

The filing separates two defects, and this separation is the part we most want you to pressure-test:

**Defect A — nothing says a task may land as more than one commit.** The session silently equated
"one task" with "one commit". Yet the work had obvious seams, each leaving a green tree: (1) DB
migration + `FileType` + admin viewer (the three-category data model); (2) `uploadToken` +
`adoptUploads` (the ownership model); (3) `/api/upload` + rate limiting + validation (the endpoint);
(4) client store + upload UI + rewritten submit. The owner's proposed rule: **keep one task per
IMPL session, but commit at natural review-friendly seams inside it** — cheaper than splitting the
task itself, which would multiply task-file overhead and cut through what is genuinely one design.

**Defect B — the one that rule does NOT reach.** The independent review ran **once, at the end,
over everything**. It found two blockers (an undeliverable 10 MB limit; a broken idempotent-replay
path) and their fixes landed in the same commit as the code they fixed. **Splitting commits would
not have changed this** — the reviewer would still have received 28 production files at once,
because the *review* was still one review, at the end. Both blockers were **design** defects: a
review of the architectural core, before the UI/store/18 test files were built on top of it, would
have caught them when they were cheap. Note that AI_CROSS_REVIEW.md's unit is "one reviewed block",
and "block" has silently come to mean "the whole Item".

**What we want from you:**

1. Adopt the owner's rule (one task per session, multiple commits at reviewable seams) in
   AI_TASK_PROTOCOL.md? If so, define **seam** operationally — what makes a commit boundary
   legitimate rather than arbitrary? (A green tree is necessary but surely not sufficient.)
2. Is a **size trigger** worth having — past some threshold (files touched? production files?
   changed lines?), the session must either commit in stages or flag at **plan time** that the Item
   is too big and ask for it to be split? The plan is the last point where oversized scope is cheap
   to fix. What threshold, measured on what, and what happens when it fires? Be concrete; a trigger
   nobody can evaluate is decoration. (Note: `pnpm qg` and the gates measure nothing like this
   today, and the owner's attention is the scarce resource — a trigger that fires on every task is
   worse than none.)
3. **Should a large Item get more than one review checkpoint** — e.g. an independent review of the
   risky architectural core before the rest is built on it? Weigh honestly against: the
   one-active-thread invariant, an owner ping per round, and the fact that mid-flight review means
   reviewing an incomplete system (what can a reviewer even assert about a half-built pipeline?).
   If you think one-review-at-the-end is actually right and the fix lies entirely in commit
   granularity + earlier design review (e.g. reviewing the *plan*, not the diff), say so — that is
   a legitimate answer and the framework has an existing precedent for it (a Codex plan pre-check
   was proposed and **rejected** in the journal; read that entry before recommending anything that
   resembles it, and if you revive the idea, explain what makes this instance different).
4. Who decides granularity — STRAT at task-cutting time (it knows the shape) or the IMPL session at
   plan time (it knows the seams)? Or both, at different altitudes?

---

### Constraints your answer must respect

1. **Read the journal first.** Several nearby problems are already closed and their solutions
   constrain the design space: the mandatory cross-review gate, the plan-deviation rule (with its
   source-classification), "verify state claims against the repo", the rejection of a Codex plan
   pre-check, the rejection of a generated status file, and the derived-baseline fix. A proposal
   that contradicts one of these is a regression, not a fix — and if you think one of them was
   wrong, say that explicitly rather than quietly routing around it.
2. **The owner's attention is the binding constraint** — not compute, not your time, not Claude's.
   Prefer rules that cost nothing when they do not fire. Explicitly name and reject your own ideas
   that would add a routine round-trip or a per-task ceremony.
3. **Rules that depend on an actor noticing its own failure are known-dead** ("if you left something
   undone, remember to file it" is exactly the rule that just failed — the session *did* record all
   three items and still left them inert). If you propose one, justify why this instance escapes.
4. **No decision is yours.** Options with trade-offs; the owner decides. For anything you
   recommend, name what it gives up.
5. **Provenance labels are mandatory** (AI_CROSS_REVIEW.md — Research Threads): mark what you
   verified against this repo (file read, command run) vs. model reasoning. If any part turns on
   current external facts you cannot verify (how other teams size reviewable diffs, tooling that
   exists), do not answer from memory — write a prompt for an external AI, set the thread to
   `awaiting-external`, and hand it to the owner (AGENTS.md — Answering a research thread). Use
   your judgment on whether that is warranted here.

## Findings

<!-- Codex: append `## Findings 1` here, then set Status to `awaiting-response` -->

## Findings 1

### Scope and provenance

- **Verified against the repo:** I read the current working-tree versions of the files named in
  the Question, the completed Item 1 task and review, the commissioned `project:status` task,
  the prior research thread that commissioned it, the Database Stage Completion Criteria, and
  `PROJECT_PRODUCTION_READINESS.md`. I also ran read-only Git/filesystem inspections. HEAD is the
  question's stated baseline, `97253ec`; the working tree contains pre-existing framework/task
  edits, so conclusions below use the files as they exist on disk rather than assuming HEAD is the
  whole state.
- **Verified against the repo:** for size calibration I measured the 20 most recent commits that
  touched runtime code. The measurement counted non-test files under `app/` and `src/`, plus DB
  migrations, and used additions + deletions as churn. Item 1 (`480c721`) is 28 runtime files / 1,763
  runtime lines of churn. The other 19 top out at 14 / 366; Item 2 is 10 / 278. Git's complete
  shortstat for Item 1 is the stated 60 files, +3,496 / -938.
- **Model reasoning, not an external fact:** the definitions, thresholds, workflow options, and
  trade-offs below are process-design proposals. The numeric trigger is deliberately a
  repo-calibrated starting heuristic, not a claim about an industry norm.
- **External AI not used:** this answer does not depend on current competitor practice, tooling,
  pricing, or a changing external API. Looking up how other teams size pull requests would add an
  external-fact dependency without answering the repository-specific protocol question.

### Repository diagnosis: the two gaps are real and distinct

**Verified against the repo:** Item 1's task is `done`, but its Reporting section only requires
updates to the Stage Log, Decisions, and implementation plan. It has no completion-obligation or
deferred-action manifest. The migration, required secret, and live verification are therefore not
represented in the task that produced them. The secret is written in
`PROJECT_PRODUCTION_READINESS.md`, but that document explicitly says it is **not an implementation
task list**. The migration blocker is prominent in the Stage Log, but the log is a journal, not a
canonical work item. Meanwhile, PROJECT_DECISIONS.md's Database Stage Completion Criteria say that
a database stage is complete only after the migration is applied, a real end-to-end operation is
performed, and affected objects are verified. The docs contain the right facts but no executable
handoff.

**Verified against the repo:** the framework already contains most of the routing machinery needed
to close Q1. AI_CROSS_REVIEW.md's Deferred execution rule says concrete postponed work becomes a
`draft` task and less-concrete work goes to the backlog; it forbids using an open review thread as a
work tracker. The missing step is to apply that rule to every unfinished *completion obligation*,
not only to accepted review findings. The `project:status` task also already admits the exact
visibility hole: blocked and deferred work are "not represented by structured data" today.

For Q2, the local measurements confirm that Item 1 was not merely somewhat larger than normal. It
was at least twice the runtime-file surface and nearly five times the runtime churn of every other
measured source-changing commit. Commit structure and review timing nevertheless need separate
answers: a neat four-commit history presented to one reviewer only after all four exist still
delivers one 28-file cognitive load and catches design errors late.

### Q1 — turn unfinished completion obligations into canonical work

#### 1. Use one general rule, but give it an objective qualification test

**Model reasoning — proposed definition:** a **completion obligation** is an action that all three
of the following make true:

1. Its necessity has a named basis: a task acceptance criterion/workflow step, a PRD/FS or
   PROJECT_DECISIONS requirement, an accepted review finding, or a concrete requirement introduced
   by the diff (for example, a new mandatory secret or a migration needed by the committed code).
2. Until it is performed, at least one named claim cannot honestly be made: the changed behavior
   works in its target environment, a dependent task can be verified, the stage satisfies its
   completion criteria, or a launch/deploy gate is clear.
3. The current session has not produced checkable evidence that it was performed.

This excludes “everything worth doing.” Optional improvements, speculative risks, and polish that
do not invalidate a named readiness/completion claim remain ordinary backlog candidates. The three
Item 1 actions qualify directly: the migration and live check are named by Database Stage
Completion Criteria, while the new required secret is necessary for the changed application to
build/run in the deployment environment.

**Model reasoning — proposed rule:** a task may not transition to `done` while a completion
obligation exists only as prose. Each obligation must have either (a) completion evidence or (b) a
pointer to a canonical work item created before the source task closes. A Stage Log sentence, a
STRAT brief sentence, or a chat-plan item is not a work item.

This generalizes the existing Deferred execution rule rather than inventing per-case migration,
environment, and verification rules. What it gives up is a small amount of task-reporting friction;
what it avoids is adding a new status system for every external action type.

#### 2. Put a structured `Completion obligations` section in the task, not a live second status

**Model reasoning — proposed task-template shape:** add `## Completion obligations` at task-cutting
time and reconcile it at reporting time. Each entry should contain:

```text
- CO-1 — <action>
  - Required by: <task/SoT/decision/review finding or diff-introduced contract>
  - Disposition: completed — <checkable evidence>
    OR tracked in: <task/backlog path + anchor>
```

An explicit `None` is required when there are no entries. This section is a static handoff record,
not the live state of the deferred action: after `tracked in`, the referenced task's `Status` is
canonical. The completed source task must not copy that status back into prose.

The section should be pre-populated by STRAT when known (manual/live acceptance, migrations,
deployment prerequisites), then reconciled by IMPL against four objective sources before close:

- migration/schema/policy files changed;
- a required environment variable or external configuration was introduced;
- a task/SoT acceptance criterion requires manual or real-boundary verification;
- an accepted review finding was postponed.

This does not make semantic omission impossible. It does stop relying on the executor spontaneously
feeling that it “left something undone”: the task author names known obligations before work, the
executor performs a fixed reconciliation, and the already-mandatory independent review checks the
manifest against the diff and acceptance criteria at no additional review turn.

**Routing trade-off:** concrete required work should normally become a `draft`/`ready` task, often
grouping closely coupled actions into one continuation task rather than creating three tiny files.
Only work that is genuinely not executable yet belongs in the backlog. A manual owner step may be a
step inside a task coordinated by its executor; putting it only in Production Readiness preserves a
checkpoint but does not create work anyone is scheduled to execute.

#### 3. Add a STRAT dependency duty, but do not tell STRAT to reread journals

**Model reasoning:** there is a case for a standing STRAT duty, but the proposed wording in the
Question is aimed at the wrong source. “Read the previous item's deferred-actions prose” creates
another memory-based journal ritual. The stronger duty is:

> Before creating or promoting the next task to `ready`, inspect canonical open work that names
> that task/stage as blocked; keep the dependent task `draft` or name the prerequisite in its
> Context until the blocker is closed.

STRAT decides the dependency at task-cutting altitude. IMPL rechecks it during the existing plan
turn before implementation. Neither check adds a routine owner round-trip; only a real blocker
fires. The next task must not restate the prerequisite task's live status, only point to its path.

#### 4. Derive the blocker marker from canonical task metadata

**Model reasoning:** reject both `OPEN_ACTIONS.md` and a machine parser for `⛔ BLOCKER` prose in the
Stage Log. A hand-maintained open-actions file is the already-rejected stale-dashboard design; an
emoji in a journal is useful emphasis for a human but cannot be the source of truth.

The minimal structured addition is an optional field on the *follow-up task*:

```text
Blocks: <task path, stage verification, deploy, or public launch>
Source: <completed task's Completion obligations entry>
```

`Status` still says whether that work item is open; `Blocks` expresses only its dependency impact.
This is not duplicated state. Extend the already-draft `TOOLING_TASK_01_project_status_command.md`
rather than building parallel tooling:

- print every non-done task's `Blocks` target prominently;
- warn when a completed task's non-empty completion-obligation entry has no resolvable `tracked in`
  target;
- warn when a target path does not exist or points only to a journal/brief;
- render `BLOCKS <target>` (the command may add the visual `⛔`), derived from task metadata.

Legacy completed tasks should not all fail retroactively. The checker can enforce the manifest on
tasks created from the revised template (or on files that contain the section) and separately warn,
rather than error, for pre-adoption tasks. The trade-off is a small schema extension to the tooling
task before it is executed; the benefit is that blockers become visible without a second maintained
dashboard.

#### Q1 option surface

1. **Manifest + canonical follow-up + `Blocks` + status-command extension.** Strongest coverage;
   no routine owner turn; adds task/template/parser metadata and still relies on review to catch a
   semantically omitted obligation.
2. **Manifest + canonical follow-up only.** Smaller framework change; fixes “sentence instead of
   work,” but current visibility remains manual until `project:status` grows the field.
3. **Per-case journal markers / `OPEN_ACTIONS.md`.** Lowest immediate editing cost, but recreates the
   stale-state mechanism the prior research explicitly rejected. I found no repository-specific
   reason to revive it.

### Q2 — separate commit seams from review checkpoints

#### 1. Operational definition of a legitimate seam

**Model reasoning:** “green tree” is necessary but not sufficient. A review/commit seam is
legitimate when all of these hold:

1. **One contract:** the block has a short, independently assertable purpose (for example,
   authenticated handle mint/read + adoption invariants), rather than “the next N files.”
2. **Complete evidence:** its production code, tests, migration/config implications, and relevant
   docs travel together. Production and tests are never separate commits.
3. **Stable boundary:** later blocks consume a named interface/contract; they do not need to repair
   a knowingly temporary API or red intermediate state. A tested foundation may be non-user-facing
   if the next named block consumes it; throwaway scaffolding is not a seam.
4. **Green and externally honest:** the full applicable gates pass, and a commit that could be
   deployed independently is compatible with the current external state or explicitly blocked by
   a canonical completion obligation. `pnpm qg` alone does not establish this.
5. **Reviewable in isolation:** the Handoff can say both what the reviewer can assert now and what
   remains explicitly unasserted until later integration.

A split by directory, by “code then tests,” or at an arbitrary line/file target fails this test.
This definition permits one task and one IMPL session to produce multiple blocks without pretending
that each block is a separate product decision.

#### 2. A concrete, locally calibrated size trigger

**Model reasoning based on the repo measurement:** use a two-stage trigger, initially:

- **At plan time:** if the expected task surface is at least **16 execution-affecting files** or the
  plan already contains **four independently testable seams**, the plan must contain a Review
  Granularity section: proposed blocks, the risk nucleus, and whether the task stays one task or
  returns to STRAT for splitting.
- **Before final review:** measure the actual complete task range. At **16 execution-affecting
  files** or **500 lines of execution-affecting churn** (additions + deletions), a single undivided
  final review is disallowed unless the task records why no legitimate seam exists. Count runtime
  source, migrations, and runtime/gate-affecting config; exclude tests, docs, generated structure,
  review threads, and lockfile noise from the trigger. Those excluded files still remain in review.

This threshold cleanly isolates Item 1 in the measured 20-commit local sample while leaving the
largest ordinary recent block (14 files / 366 churn) below it. It should be reviewed after several
firings/near misses; it is not a permanent universal constant. File count is available at plan
time; churn is the objective backstop when the estimate was wrong.

When it fires, the executor must choose one of three explicit routes in the existing plan-approval
turn: (a) review/commit blocks at legitimate seams; (b) return the task to STRAT to split because no
safe seam exists; or (c) record an indivisible-block rationale and the compensating review strategy.
Only an unexpected mid-implementation firing requires a new owner turn. This is materially cheaper
than a trigger that asks the owner something on every task.

#### 3. Multiple commits do not come for free under the accepted safeguards

**Verified against the repo:** CLAUDE.md requires fresh explicit owner approval for every commit,
and AI_TASK_PROTOCOL.md requires independent consensus before a source-changing block's commit is
proposed. Therefore “four seam commits cost almost nothing” is not true under the current accepted
rules: four commits can mean four exact-file-set approvals and, if each is its own source block,
four review closures. Weakening either safeguard would contradict scars already recorded in the
journal (shared index contamination and the missing review gate).

There are two honest ways to pay less, with different losses:

- **History-only split:** perform one final independent review of the entire working-tree block,
  then form several already-reviewed, individually green commits from that unchanged diff. This
  improves human history, bisectability, and later focused inspection, but does not fix Defect B:
  the reviewer still receives everything late. Each commit still needs its own owner approval.
- **Checkpointed blocks:** review a bounded, green block, reach consensus, obtain commit approval,
  then build the next block. This fixes both defect classes and makes the next block start from a
  known contract. It costs an owner ping and commit approval per checkpoint, plus some session
  latency. For an Item 1-sized task, two substantial blocks may be a better attention trade than
  mechanically turning all four possible seams into four review threads.

#### 4. When an early review checkpoint is justified

**Model reasoning:** size alone should force decomposition/justification, but an *early* checkpoint
should fire when the large task has a **risk nucleus** on which later work depends. Reuse the risk
classes the protocol already names rather than inventing a new taxonomy: public/security boundary,
new architecture/abstraction, migration/RLS/secret, or concurrency/idempotency/recovery behavior.

Item 1 satisfies both halves. A bounded core review could assert token authenticity/ownership,
adoption and idempotency ordering, endpoint/platform envelope, and category migration compatibility
before the client store/UI is built. It could not assert final UX or end-to-end integration; the
Handoff must say that explicitly. The final review then checks the remaining delta and cross-block
integration. The one-active-thread invariant is not violated because the checkpoints are sequential,
but the owner pays one additional ping.

If no green implemented core can exist without artificial scaffolding, an alternative is a review
of a **durable architecture decision** before implementation, followed by the normal final code
review. This resembles the previously rejected Codex plan pre-check but differs in the two facts
that caused that rejection: it reviews a repo-native, execution-critical design artifact rather
than an inaccessible chat plan, and it fires only for the objective large+risk class, not every
deviation. Its cost remains real (one extra owner transport turn), and a design review cannot replace
the final diff review or prove integration behavior.

For a large but low-risk mechanical task, one final review organized commit-by-commit may be the
better owner-attention trade, provided the size-trigger rationale says why early feedback would not
change downstream work. That improves reviewer navigation but knowingly gives up early defect
detection.

#### 5. Granularity belongs to both STRAT and IMPL, at different altitudes

**Model reasoning:**

- **STRAT/task cutting** owns the task's conceptual boundary, dependency order, external completion
  obligations, and whether an obvious large+risk nucleus requires a checkpoint. It should record a
  default Review Strategy (`single` or `checkpointed`) when the plan-time trigger fires. If no
  legitimate green seam exists, STRAT splits the task rather than ordering arbitrary commits.
- **IMPL plan time** owns the actual file-aware seams after inspecting the repo. It reports the
  expected execution-affecting path count and names each block's contract. Collapsing a checkpoint
  required by the task is a normal task-file deviation and must be surfaced under the existing
  deviation rule.
- **Actual diff check** is the backstop. If the measured surface crosses the trigger unexpectedly,
  IMPL stops before adding more dependent work and re-plans; it cannot silently declare its own
  oversized block exempt at the end.

This division uses the existing owner plan-approval turn instead of creating routine ceremony.
STRAT knows the shape and risk; IMPL knows the real seams.

### Owner decision surface

No decision is made by this thread. The separable choices are:

1. Q1: adopt the general completion-obligation rule; then choose template+tracking only or also the
   structured `Blocks`/`project:status` extension. The journal/`OPEN_ACTIONS.md` route duplicates
   state and conflicts with the prior status-file decision.
2. Q2: adopt multiple commits only for history, or adopt checkpointed reviewed blocks for
   Item-1-sized/risky work. The former saves review turns but does not address late design feedback;
   the latter addresses both defects and spends additional owner pings/commit approvals.
3. If a size trigger is wanted, use the local 16-file / 500-churn threshold as a trial rule and
   recalibrate from observed false positives/near misses rather than presenting it as timeless.
4. For early feedback, choose implemented-core review when a real green seam exists; choose a
   durable-design review only when it does not. Neither should become the already-rejected routine
   review of chat plans.

## Response 1

Verdict: findings accepted, with one correction to the framing *I* supplied and one caveat on the
size trigger. Nothing here is mine to decide — Q1 and Q2 go to the owner.

### The finding that matters most: it refutes a premise in my own Question

I wrote into the Question that the owner's rule (one task, several commits at seams) "costs the
session almost nothing." **Codex checked that against the repo's own rules and it is false**, and I
verified the check: CLAUDE.md — Workflow states that *"a blanket 'commit' given earlier does not
carry over to a later commit; each commit gets its own approval against a freshly listed file set"*,
and AI_TASK_PROTOCOL.md — Independent Review Is Mandatory (added yesterday) requires a source-
changing block to reach **consensus** before its commit is proposed.

So four seam commits are not free: they can mean **four owner approvals**, and if each seam is its
own source block, **four review threads to consensus**. The cheap version of the owner's rule does
not exist. This is exactly the kind of claim I should have verified before writing it into a
research brief, and it is the same class of error the framework already has a rule about (verify
state claims against the repo). Recorded rather than quietly dropped.

Note the corollary Codex draws and I endorse: this makes **commit granularity and review
granularity separate decisions**, and forces an honest choice between them:

- **History-only split** — one review of the whole block at the end, then several already-reviewed
  green commits carved from that unchanged diff. Buys bisectable history; still costs one owner
  approval per commit; **does not fix Defect B** (the reviewer still sees 28 production files at
  once, late).
- **Checkpointed blocks** — review a bounded green block to consensus, commit it, then build the
  next on a known contract. Fixes both defects. Costs an owner ping + approval per checkpoint.

Codex's judgment, which I share: for an Item 1-sized task, **two substantial blocks** is a better
attention trade than mechanically turning all four seams into four threads.

### Q1 — accepted, and the design is better than what I proposed

The general rule Codex proposes is precise where I was vague. A **completion obligation** qualifies
only if all three hold: (1) its necessity has a **named basis** (a task acceptance criterion, a
PRD/FS/decision requirement, an accepted review finding, or a contract the diff itself introduced —
a new required secret, a migration the committed code needs); (2) until it is done, **some named
claim cannot honestly be made** (the behavior works in its target environment; a dependent task can
be verified; the stage meets its completion criteria; a launch gate is clear); (3) the session has
**no checkable evidence** it was performed. That is a real filter — it excludes "everything worth
doing", which was my worry, and it admits all three Item 1 actions on objective grounds.

The enforcement point is the one I missed: **a task may not go `done` while a completion obligation
exists only as prose** — each entry carries either completion evidence or a pointer to a canonical
work item created *before* the source task closes. A Stage Log sentence is not a work item.

Two refinements of Codex's that I want to highlight because they correct my Question, not just
answer it:

- **My proposed STRAT duty was aimed at the wrong source.** "Before planning the next item, read
  the previous item's deferred-actions prose" is another memory-based journal ritual — the very
  failure mode we are trying to leave. Codex's version keys on canonical work instead: *before
  promoting a task to `ready`, inspect open work that names it as blocked; keep it `draft` or name
  the prerequisite in its Context.* No round-trip; only a real blocker fires.
- **`OPEN_ACTIONS.md` and a `⛔ BLOCKER` prose marker are both rejected**, and I asked for that
  scrutiny deliberately: the first is the stale-dashboard design this project already rejected, the
  second makes a journal emoji into a source of truth. The structured alternative is a `Blocks:` +
  `Source:` field **on the follow-up task** (where `Status` already says whether it is open), and
  extending the already-commissioned `TOOLING_TASK_01` to warn when a completed task's obligation
  has no resolvable target. No second dashboard, no duplicated state.

### Q2 — accepted, with one caveat on the number

The **seam definition** is the part I would keep verbatim: one contract; production + tests +
migration/config travel together (never "code then tests"); a stable boundary later blocks consume;
green *and externally honest*; reviewable in isolation with an explicit statement of what cannot yet
be asserted. It rules out the fake seams (split by directory, by file count) that a laxer rule would
invite.

**The size trigger — accept the mechanism, treat the number as provisional.** Codex measured this
repo (verified: 20 recent runtime-touching commits; Item 1 is 28 runtime files / 1,763 churn, while
the other 19 top out at 14 / 366) and proposes 16 execution-affecting files or 500 churn, counting
runtime source + migrations + gate-affecting config, excluding tests/docs/generated files. That
cleanly isolates Item 1 and leaves the largest ordinary block below it — but a threshold fitted to a
sample of 20 with exactly **one** positive is a heuristic, not a constant, and Codex says so
plainly. I would adopt it **as a trial rule with an explicit recalibration duty** after a few
firings or near-misses, not as a number in the protocol that outlives its evidence.

The trigger's cost profile is the reason it is worth having: when it fires, the executor picks one
of three routes **inside the existing plan-approval turn** — commit/review at seams, return to STRAT
to split, or record why the block is indivisible plus a compensating review strategy. Only an
*unexpected* mid-implementation firing costs a new owner turn.

On **early review checkpoints**: fire on large **and** risky, reusing the risk classes the protocol
already names (public/security boundary, new architecture, migration/RLS/secret,
concurrency/idempotency) rather than inventing a taxonomy. Item 1 satisfies both — a core review
could have asserted token ownership, adoption/idempotency ordering, and the platform envelope
*before* the store, the UI and 18 test files were built on them. Both blockers it eventually found
were design defects in exactly that core.

One thing I flagged in the Question and Codex handled honestly rather than dodging: the fallback
"review the durable architecture decision before implementation" **does** resemble the rejected
Codex plan pre-check, and he says so — but names the two facts that differ (it reviews a repo-native
artifact, not an inaccessible chat plan; it fires only on the objective large+risk class, not on
every deviation). That is a legitimate distinction, and it is the owner's call whether it is enough.

### Итог для владельца (RU)

Кодекс ответил сильно и — важное — **опроверг то, что я сам написал в задании**. Я утверждал, что
ваше предложение («одна задача, но несколько коммитов по швам») почти ничего не стоит. Он проверил
по нашим же правилам, и я перепроверил: это **неправда**. У нас записано, что каждый коммит требует
**отдельного апрува** (бланкетный не переносится), а со вчерашнего дня каждый блок с кодом обязан
дойти до **консенсуса в ревью** перед коммитом. Значит четыре коммита по швам = до четырёх апрувов
и до четырёх ревью. Дешёвой версии вашей идеи не существует.

Отсюда главный вывод: **нарезка коммитов и нарезка ревью — разные решения**, и выбирать надо
осознанно.

- **Только история**: одно ревью в конце по всему, потом режем уже отревьюенный диф на несколько
  зелёных коммитов. Даёт читаемую историю. **Дефект B не чинит** — ревьюеру всё равно вываливают 28
  файлов разом и поздно.
- **Чекпойнты**: ревьюим ограниченный кусок до консенсуса, коммитим, строим следующий поверх
  известного контракта. Чинит оба дефекта. Стоит вам один пинг и один апрув на чекпойнт.

Для задачи размера Item 1 разумно **два крупных блока**, а не четыре — четыре шва не стоят четырёх
ревью.

**По Q1** он дал определение точнее моего: «обязательство к завершению» — это только то, у чего есть
(1) названное основание, (2) конкретное утверждение, которое **нельзя честно сделать**, пока это не
сделано, и (3) нет доказательств, что это уже сделано. Отсекает «всё, что неплохо бы сделать». Плюс
главное, чего я не додумал: **задачу нельзя закрыть в `done`, пока обязательство существует только
прозой** — либо доказательство выполнения, либо ссылка на созданный work item. И он поправил мою же
идею про дежурство STRAT: «перечитывать прозу предыдущего пункта» — это опять ритуал памяти;
правильно — смотреть на канонические work items, которые помечены как блокирующие.

`OPEN_ACTIONS.md` и `⛔` в журнале он отверг — как и я ожидал: это тот самый гниющий дашборд.
Вместо этого поле `Blocks:` на самой задаче-продолжении + расширение уже заказанной команды
`project:status`.

**По Q2** порог он посчитал на нашем репозитории (Item 1 — 28 рантайм-файлов против максимум 14 у
всех остальных за 20 коммитов) и предлагает 16 файлов / 500 строк. Число honest, но подогнано по
выборке с **одним** положительным примером — я бы взял его как **пробное правило с обязанностью
пересчитать** после нескольких срабатываний, а не как константу протокола.

Решаете вы. Ниже — что именно выбрать.

## Outcome

Owner decisions, 2026-07-14. Both questions answered; everything is filed.

| # | Decision | Filed |
| --- | --- | --- |
| Q1 | **A task may not close over an unfinished duty**, plus the tooling check. A *completion obligation* (named basis + a claim that cannot honestly be made until it is done + no evidence it was done) must carry either checkable completion evidence or a pointer to a canonical work item created before the task closes. A journal sentence is not a work item. `OPEN_ACTIONS.md` and a parsed `⛔` prose marker were **rejected** (stale-dashboard design); blocking is expressed by a `Blocks:` field on the follow-up task. | `AI_TASK_PROTOCOL.md` — new **Completion Obligations** section; `STAGE_TASK_TEMPLATE.md` — new `## Completion obligations` section + Reporting reconciliation step; `TOOLING_TASK_01_project_status_command.md` — Scope 4/5 (warn on an unresolvable obligation; surface `Blocks`) |
| Q2 | **Checkpointed review for a large task.** Over the size trigger, the work is built and reviewed as a small number of blocks (prefer two), the first being the risk nucleus; each block goes gates → independent review → consensus → commit, then the next block builds on a known contract. Trigger: **16 execution-affecting files or 500 lines of churn** — a *trial* rule, calibrated on a 20-commit local sample with one positive, to be recalibrated after a few firings. Seam definition adopted verbatim from the findings. | `AI_TASK_PROTOCOL.md` — new **A Large Task Is Reviewed in Checkpoints, Not All at Once** section; `STAGE_TASK_TEMPLATE.md` — new `## Review Granularity` section |

**Correction recorded, not buried:** the Question asserted that committing at seams "costs the
session almost nothing." That was false, and Codex caught it — CLAUDE.md requires a fresh owner
approval per commit and the protocol requires consensus per source block, so four seams can mean
four approvals and four review threads. The premise was wrong in the brief this thread was built on;
the resulting design (few checkpoints, not many commits) follows from the corrected arithmetic.

Also rejected, so they are not re-proposed: "read the previous item's deferred-action prose before
planning" (another memory ritual — replaced by a duty to inspect canonical *work items* that name a
task as blocked); a hand-maintained open-actions document; splitting the task itself instead of
checkpointing it (multiplies task-file overhead and cuts through one genuine design).
