Purpose
Define how AI-assisted work is organized into sessions and task files.

Scope
Session types, task-file convention and lifecycle, and session-settings guidance.
Does not define product, architecture, or stage content — those live in project docs.

Audience
AI agents and developers working on the project.

---

# Session Types

| Type | Prefix | Purpose | Ends with |
| --- | --- | --- | --- |
| Strategic | `STRAT:` | discovery, planning, design, decisions | outcomes persisted into docs (task files, PROJECT_DECISIONS.md, PROJECT_STAGE_LOG.md) — never chat-only conclusions |
| Implementation | `IMPL:` | executing exactly one task file | for a source-changing task: in-session Review Pipeline → independent cross-review to **consensus** → reporting (a green pipeline alone does not end it — see Independent Review Is Mandatory); for a docs-only task: Review Pipeline + reporting |
| Meta | `META:` | improving the AI workflow itself, driven by live defects | updates to `docs/framework/*` |
| AI-engineering scout | `AIENG:` | looking **outward** at agentic-engineering practice and selecting what transfers here | a proposal to META (a research thread's `## Outcome`) — it does **not** edit the framework (AI_ENGINEERING_SCOUT.md) |

Name sessions with the prefix plus a short topic (e.g. `IMPL: Stage 6 task 01 — success page`),
so each type is findable by search.

---

# STRAT Kickoff Prompt

Start every new strategic session with:

> This is a STRAT session per docs/framework/AI_TASK_PROTOCOL.md.
> Session settings: highest-reasoning tier model recommended; Plan mode for non-trivial work;
> session title `STRAT: Stage <stage> — <topic>`.
> Run the Pre-task Sync (CLAUDE.md) and read the current stage's Source of Truth
> (for Stage 6: STAGE_6_PRODUCT_DEFINITION.md and STAGE_6_FUNCTIONAL_SPECIFICATION.md).
> Read `docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md` — it is the topic and the session's
> pickup point. **Before acting on its `Next topic`, reconcile the brief against canonical state**:
> the `Status` field of the task files it names, and the stage's open task files in
> `docs/project/tasks/`. The brief lags whenever an IMPL session closes or cuts a task, so treat it
> as a pointer, not as truth.
> If the brief does not exist and this is the stage's first STRAT session, stop
> and ask the owner what the first strategic topic is — do not invent one.
> Expected outcome: \<task files for a stage / a decision on a question / a plan\>.
> Existing code is strategic context too: before presenting options or solutions on any
> sub-topic, search the repository for prior art (existing components, utilities, decisions) —
> never propose from general knowledge what the repo may already implement.
> Confirm understanding in 3–5 lines before proceeding.
> Before the session ends: persist every outcome into docs — task files per
> docs/framework/templates/STAGE_TASK_TEMPLATE.md (status `ready`), PROJECT_DECISIONS.md for decisions,
> PROJECT_STAGE_LOG.md for progress — and unconditionally write/update
> `docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md` with what was done and what's next
> (see STRAT Next-Session Brief below), proposing its commit immediately after writing
> (commits require explicit owner approval — CLAUDE.md).
> No chat-only conclusions. List created/updated files in the final message.

(The META kickoff prompt lives in AI_WORKFLOW_MASTER.md; the `AIENG:` one in
AI_ENGINEERING_SCOUT.md; IMPL sessions are started from a task file per
docs/framework/templates/STAGE_TASK_TEMPLATE.md — How to Use.)

---

# STRAT Next-Session Brief

Every strategic session ends by writing/updating the stage's brief — a single unified
mechanism, with no "topic finished vs unfinished" branch. The brief is both the closing
session's handoff and the next session's topic; the owner writes no ad-hoc summary prompt.

- Location: `docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md` — one fixed name per stage,
  **overwritten** by each closing session (not versioned or appended). History and
  traceability come from `git log -- docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md`, which
  only works if every brief version reaches a commit: the closing session must propose the
  brief's commit immediately after writing it, and it must be committed (with owner approval —
  commits are never made without it, CLAUDE.md) before the next STRAT session starts.
- Written and updated only by that stage's STRAT sessions (no conflict with Cross-Session
  Rules: one active STRAT session per stage). Other sessions never write it — they reconcile
  against canonical task state instead (see below).
- Contents — pointers, not prose (no duplication per DOCUMENTATION_SYSTEM_RULES.md):
  1. **Session summary** — one line
  2. **Decided** — pointers to the PROJECT_DECISIONS.md / PROJECT_STAGE_LOG.md entries this
     session wrote; never restate decisions in the brief
  3. **Open** — undecided questions, if any
  4. **Task files** — which exist as `ready` vs `draft`; an idea concrete enough to file
     becomes a `draft` task file, not brief text
  5. **Next topic** — continuation of the same topic, or a new one picked from
     PROJECT_STAGE_LOG.md / PROJECT_BACKLOG.md, with a one-line reason if relevant
- Fail-fast: if the kickoff expects a brief and none exists (and the stage is not new), do not
  guess and never invent a topic — stop and ask the owner; a missing brief means either a
  stale kickoff prompt or a prior session that failed its persistence duty.
- When the stage's strategic work is genuinely finished (project end or an explicit owner
  stop), move the brief to `docs/project/tasks/done/` (same never-delete convention as task
  files).

## The brief goes stale — reconcile it, do not build a channel into it

The brief is written by STRAT but **invalidated by IMPL**: the moment a task closes or a new one is
cut, the brief's "Next: run Item N" may be wrong, and only a STRAT session may correct it.

**The rule is on the reader, not on a second writer:** before acting on the brief's `Next topic`,
reconcile it against the canonical sources — the task files' own `Status` fields and the stage's
open task files (`docs/project/tasks/`). Task status is canonical (Session Duties); the brief is a
pointer that can lag. A fresh STRAT session can therefore derive current state itself, with no
owner round-trip and no second writer.

An IMPL→brief "mailbox" section was designed, reviewed and **withdrawn** (2026-07-17,
`reviews/done/REVIEW_2026-07-17_impl-brief-channel.md`, round 2). Recorded so it is not rebuilt:
its common path still spent the owner's attention (while a STRAT session is live the note had to be
routed to that session by hand, and a blocking question must stop and tell the owner anyway), and
its admissible payloads did not even cover the case present in the tree that introduced it (a
non-STRAT session creating a new `draft` task). A mandatory second writer plus a sequencing rule
did not earn that.

Escalation is unchanged and needs no channel: a mid-flight product/spec question **stops and goes
to the owner** (Deviations — the STOP-and-escalate rule); non-blocking findings go to the task
report and PROJECT_BACKLOG.md (Cross-Session Rules).

## Mid-session persistence

Persistence gates the session's END, not every internal step: a live STRAT session may
discuss several sub-topics before writing anything down, and persisting (docs, brief,
task files) does NOT close the session — after a persistence checkpoint the session may
keep going. Recommended checkpoint triggers, besides the session end: a decision worth
protecting, context grown long (summarization risk — "live memory" is not guaranteed),
or scope a parallel session might touch. The only hard duty: nothing valuable remains
chat-only when the session actually ends.

---

# Task Files

- Location: `docs/project/tasks/`
- One file per task: `STAGE_<stage>_TASK_<NN>_<slug>.md` (e.g. `STAGE_6_TASK_01_success_page.md`);
  `<stage>` includes the sub-stage when one exists (e.g. `STAGE_6A_TASK_01_<slug>.md` for
  Stage 6A), so `<NN>` is unique within its `<stage>` prefix
- Created by strategic sessions (or the developer); executed by implementation sessions.
- Skeleton: `docs/framework/templates/STAGE_TASK_TEMPLATE.md`.
- **A task file is the scope boundary for the executing session.** No work outside it; the
  standard Pre-task Sync (CLAUDE.md) still applies.
- Do not accumulate multiple tasks in one file — one file per task keeps the executor's context
  minimal and avoids write conflicts between parallel sessions.

## Session Duties (writing rules)

The first rule below binds IMPL sessions specifically; the two that follow bind **every** session
type — STRAT, IMPL and META alike — because durable docs are written by all of them.

### Deviations must be flagged at plan time (IMPL)

The plan an IMPL session presents for approval must carry a distinct, unmissable
**"Deviations from the task file"** section — one line per deviation: *task file says A, I
propose B, because C*. If there are none, say so explicitly ("no deviations"). Never bury a
substitution in prose, and never make one silently.

This barrier exists because **nothing downstream can catch it**: the Review Pipeline's Review
Agent checks the *diff* against the task file, so a plan that already deviated passes review by
construction — the diff faithfully implements the wrong thing. The plan is the only point where
a deviation is still visible. (Real case, 2026-07-13: an IMPL session silently shipped a CTA
label the FS did not specify, authored a new i18n key for it, and the in-session pipeline
found nothing wrong — an independent Codex review caught it.)

The owner approves plans quickly; a process that only works when every plan is read closely
does not work. The section must be scannable in one glance.

**Each deviation line must also name where A is specified** — the task file only, or a
Source-of-Truth document (PRD/FS, with the section). The classification decides the route:

- A comes from the task file only → the deviation may be approved in-plan (the normal case);
- A is named in the PRD/FS → the deviation may **not** be approved in-plan at all — it is a
  product behavior change, and the existing rule applies: STOP and escalate for a PRD/FS update
  first. Plan approval, even an attentive one, is not a substitute for a spec change.

Citing the source forces the Source-of-Truth lookup that the triggering case skipped, at zero
owner cost. A mandatory Codex pre-check on deviating plans was considered and rejected
(owner decision 2026-07-14): Codex cannot read a chat plan without new persistence machinery,
and a blocking round-trip per deviating plan spends more owner time than reading a one-line
section; the owner may still request an ad-hoc Codex check on any plan.

### Never write unverifiable claims about a conversation into a durable doc

Durable docs (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md, task files) must not assert things
that only happened in chat and that a future session cannot check — "flagged and approved
in-plan", "agreed with the owner", "discussed and accepted". A future reader has no transcript;
such a claim is unfalsifiable and, if wrong, permanently poisons the record. (Same 2026-07-13
case: the session wrote that the label choice had been "flagged and approved in-plan" when the
plan had not flagged it at all.)

Write what is checkable instead: the decision itself and its rationale, a pointer to the doc
section that authorizes it, or — if it genuinely rests on an owner call — record the call as a
decision in PROJECT_DECISIONS.md, where it becomes reviewable, rather than as a claim about a
conversation.

### Verify state claims against the repository before writing them

Every claim about **world state** — what is running, what is done, what is in progress, what was
committed, what exists — must be checked against the repository **at the moment of writing**,
never recalled from memory or inferred from what someone said. These claims are cheap to verify,
which is exactly why writing them unchecked is worse than writing an unverifiable one:

| Claim about… | Check |
| --- | --- |
| a task's state | the task file's `Status` field; `tasks/` vs `tasks/done/` |
| what was committed | `git log` / `git show` |
| what a session did | the diff and the docs it wrote — not its own report |
| what exists in the code | read the file |

(Real case, 2026-07-13: a STRAT session was told an IMPL kickoff "exists", inferred that the
session was *running*, and wrote "Item 1 runs in parallel" into STAGE_6_STRAT_BRIEF.md,
PROJECT_STAGE_LOG.md and a Codex review handoff. Item 1 had never started. Nothing caught it —
not the gates, not the Codex review (it reviews the diff, not the log's claims about the world),
not the plan approvals — only a direct owner question did. Corrected in `818f914`.)

This applies to **relayed reports too**: another session's "the pipeline passed" or "the review
found nothing" is that session's claim, not an observed fact. If you are going to write it into a
durable doc or a review handoff, either verify it yourself or attribute it plainly ("the IMPL
session reported X") — never launder a report into a fact.

Corollary: the task file's `Status` field is the source of truth for task state. Narrative docs
may point at it; they must not restate it as prose that can silently drift (in the case above,
the task file was correct — the narrative docs were the ones that lied).

### Name the basis of a claim the repo does not own

The two rules above cover claims about a *conversation* and about the *repository*. A third class
escaped both, and cost a full task: a claim about **a system nobody here owns** — a platform's
limits, a browser's capabilities, a third-party library's behavior or size, a service's pricing.
Such a claim cannot be checked by reading the repo, and being confident about it proves nothing.

**When you write an execution-critical claim of this class into a durable doc — a PRD/FS
requirement, a decision, a task file — name what it rests on, in one line, right there.** Exactly
one of:

1. **Owner policy** — a product choice, not a feasibility claim ("we want 10 MB uploads"). Note
   that this does not make it deliverable; the delivery path is a *separate* claim needing its own
   basis.
2. **Repo evidence** — existing code, config, a test, or a command that proves it here.
3. **External evidence** — a dated primary source, or a probe that actually crossed the real
   boundary.
4. **No adequate basis** → it is an **open question, not a settled requirement**: open a research
   thread (AI_CROSS_REVIEW.md — Research Threads) and do not mark the task `ready` or the spec
   settled until it is answered.

The trigger is the **class of claim, not your confidence** — "ask if you're unsure" is a dead rule,
because the failure mode is precisely a session that felt sure. It fires rarely, costs one line
when it fires, and adds no owner round-trip.

(Real case, 2026-07-14: FS §4.3 specified a 10 MB per-file upload limit. A payload that size cannot
cross a Vercel Function's 4.5 MB request-body ceiling — so the requirement was undeliverable from
the moment it was written. STRAT wrote it, IMPL implemented against it, unit tests exercised the
handler *below* the platform boundary and could not see it, and the in-session pipeline passed. It
surfaced only in the independent Codex review, after the spec, the architecture, the code and the
tests had all been built on it. Note what does **not** save you here: the number entered the world
in a **docs-only change**, which skips the Review Pipeline entirely — the mandatory code review is
a backstop, not a substitute for this rule.)

## Lifecycle

`draft → ready → in progress → done` — tracked in the file's Status header. A delegated task
(see Delegating IMPL Tasks to Codex below) inserts `awaiting-claude-review` between
`in progress` and `done`.

Transition owners:

- `draft → ready` — the developer (approval that the task may be executed as written)
- `ready → in progress` — the executing implementation session, at start
- `in progress → done` — the executing implementation session. For a **source-changing** task,
  only after the in-session Review Pipeline **and** the mandatory independent cross-review has
  reached consensus (Independent Review Is Mandatory), accepted fixes are applied and gates
  re-run, completion obligations are reconciled (Completion Obligations), and reporting is done.
  For a docs-only/analysis-only task, after the Review Pipeline + reporting.
- for a delegated task: `in progress → awaiting-claude-review` — Codex, after implementing,
  self-reviewing, running its allowed gates, and writing an execution report in the task file;
  `awaiting-claude-review → done` — a Claude Code session only, after its own independent
  review pass (never the executor's self-report alone)

When done: record the outcome in the file (date + PROJECT_STAGE_LOG.md entry pointer), set
status `done`, and move the file to `docs/project/tasks/done/`. Never delete task files. Do not
record the commit hash in the task file — the file is part of the very commit that would carry
that hash, so it cannot contain it; git history already provides the commit provenance.

A task that is cancelled or replaced gets status `superseded` (with a one-line reason and a
pointer to its replacement, if any) and also moves to `docs/project/tasks/done/`.

## Completion Obligations (a task may not close over an unfinished duty)

A green `pnpm qg` certifies the **tree**, not the **deployed system**. A task can therefore pass
every gate, pass an independent review, and still leave the running system broken — which is
exactly what happened (Stage 6 Item 1, 2026-07-14: the code wrote three new DB category values
while the live database still carried the old two-value constraint, so any request with an image
would have failed on insert; a new required secret was introduced without which the production
build does not start; and a live end-to-end verification that PROJECT_DECISIONS.md's own Database
Stage Completion Criteria demand had not been run). **All three were written into the durable
docs — and all three would still have been missed**, because a sentence in a journal obliges
nobody. They surfaced only because the owner happened to ask.

### What qualifies

A **completion obligation** is an action for which all three hold:

1. **Its necessity has a named basis** — a task acceptance criterion or workflow step, a PRD/FS or
   PROJECT_DECISIONS requirement, an accepted review finding, or a contract the diff itself
   introduces (a new required secret, a migration the committed code depends on).
2. **Until it is performed, some named claim cannot honestly be made** — that the changed behavior
   works in its target environment, that a dependent task can be verified, that the stage meets its
   completion criteria, or that a launch/deploy gate is clear.
3. **The session has no checkable evidence that it was performed.**

All three must hold. This is deliberately narrower than "everything worth doing": optional
improvements, polish, and speculative risks do not invalidate a named readiness claim and remain
ordinary PROJECT_BACKLOG.md candidates. Applied to the case above, all three Item 1 actions qualify
on objective grounds — no judgment about how the session "felt" is involved.

### The rule

**A task may not transition to `done` while a completion obligation exists only as prose.** Each
one must carry either:

- **completion evidence** — something checkable (a command that was run, a migration listed as
  applied, a verification with an observable result); or
- **a pointer to a canonical work item** — a task file (usually) or a flagged PROJECT_BACKLOG.md
  entry (only when the work is genuinely not executable yet) — **created before the source task
  closes**.

A sentence in PROJECT_STAGE_LOG.md, a line in a STRAT brief, or a chat-plan item **is not a work
item**. This generalizes the rule AI_CROSS_REVIEW.md already applies to deferred review findings
(Deferred execution) — the same routing, now applied to every unfinished duty, not just to review
findings.

Record them in the task file's `## Completion obligations` section (STAGE_TASK_TEMPLATE.md), and
write an explicit `None` when there are none — silence must not be ambiguous.

Before closing, reconcile the section against four objective sources rather than trying to recall
what was left undone (the failure mode here is a session that *did* record its leftovers and still
left them inert — so the check must not depend on the session noticing anything):

- migration / schema / policy files changed;
- a required environment variable or external configuration was introduced;
- a task or Source-of-Truth acceptance criterion requires manual or real-boundary verification;
- an accepted review finding was postponed.

The mandatory independent review checks this manifest against the diff and the acceptance criteria
— at no extra review turn, since that review now always happens.

### Blocking work is named on the follow-up task, not in a journal

A follow-up task created this way may carry two optional fields:

```text
Blocks: <task path | stage verification | deploy | public launch>
Source: <the completed task's completion-obligation entry>
```

`Status` already says whether that work is open; `Blocks` says only what it holds up — this is a
dependency, not duplicated state. **A hand-maintained `OPEN_ACTIONS.md`, or a `⛔ BLOCKER` marker
parsed out of Stage Log prose, are both rejected**: the first is the stale-dashboard design this
project already refused (see `research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`),
and the second makes a journal emphasis into a source of truth. Once built, `pnpm project:status`
(`tasks/TOOLING_TASK_01_project_status_command.md`, still `draft`) is intended to surface `Blocks`
and warn when a closed task's obligation has no resolvable target.

### STRAT's duty is to check canonical work, not to re-read journals

Before creating or promoting a task to `ready`, a STRAT session inspects **open canonical work that
names that task or stage as blocked** and keeps the dependent task `draft`, or names the
prerequisite in its Context, until the blocker closes. It does **not** re-read the previous item's
prose looking for leftovers — that is another memory ritual, the very failure being fixed here. The
dependent task points at the prerequisite's path; it never restates its live status.

## Independent Review Is Mandatory (when to open a thread)

**Every IMPL block that changed source code gets an independent cross-review thread
(AI_CROSS_REVIEW.md) before its commit is proposed — exactly like `pnpm qg`, and for the same
reason: it is a gate, not a judgment call.** Skip it only for a block that skips the Review
Pipeline too (documentation-only or analysis-only — AI_REVIEW_PIPELINE.md, When to Run).

Consequences, stated plainly because the previous wording left them to be inferred:

- **A green in-session Review Pipeline is necessary but NOT sufficient.**
  `READY FOR DEVELOPER REVIEW` (AI_REVIEW_PIPELINE.md) means the gates pass — it does **not**
  license proposing a commit on a code block. That right arrives only at **consensus** on the
  review thread.
- The IMPL session opens the thread itself, right after its pipeline goes green, and stays open
  through the loop below. It does not wait to be told, and does not end at a green pipeline.
- The in-session Review Agent is Claude reviewing Claude inside the context that produced the
  diff; the cross-review is a second, repo-aware reader that never saw the reasoning. The two
  are not substitutes (AI_CROSS_REVIEW.md — Scope).

Why the default is "always" rather than a risk threshold (owner decision 2026-07-14): Codex costs
the owner nothing today and parallel IMPL work is rare, so the one-active-thread queue is not yet
a bottleneck — and a threshold ("security-sensitive or architecturally novel") is a judgment made
by a session at the end of its own work, which is exactly where this check already failed once
(2026-07-14: a public unauthenticated upload endpoint went green in-session and headed straight
for a commit; the owner caught it). **Revisit if the premise changes** — if Codex becomes costly
or parallel IMPL sessions make the single review slot a bottleneck, replace the blanket rule with
a risk-class trigger (public/security surface, new architecture or abstraction,
migrations/RLS/secrets, concurrency/idempotency — the same list that makes a task non-delegable)
rather than dropping the gate.

## A Large Task Is Reviewed in Checkpoints, Not All at Once

One review at the end of a big task reaches the reviewer too late to matter. (Stage 6 Item 1,
2026-07-14: one commit, 60 files, +3,496 / −938 — 28 of them production files. The independent
review found two **blockers**, and both were *design* defects in the architectural core: an
undeliverable size limit, and a broken idempotent-replay path. By then the client store, the UI and
18 test files had already been built on top of them.)

**Splitting the commits would not have fixed this** — the reviewer would still have received 28
production files in one go, because the *review* was still one review, at the end. Commit
granularity and review granularity are different decisions, and only the second one addresses late
feedback. Note also what several commits actually cost here: **every commit needs its own owner
approval** (CLAUDE.md — a blanket "commit" never carries over) and **every source block needs its
own review to consensus**. Four seams therefore mean up to four approvals and four threads — "just
commit more often" is not free, and is not the fix.

### The rule (owner decision 2026-07-14)

**A task over the size trigger below is built and reviewed as a small number of checkpointed
blocks**: implement a bounded block → gates green → independent review to consensus → owner
approves that commit → build the next block on a now-known contract. Prefer **two substantial
blocks** over mechanically turning every possible seam into its own thread; each checkpoint costs
the owner a ping and an approval, and that is the budget being spent.

The first block should be the **risk nucleus** — the part later work depends on, drawn from the risk
classes the protocol already names (public/security boundary, new architecture or abstraction,
migration/RLS/secrets, concurrency/idempotency/recovery). Its Handoff must state plainly **what the
reviewer can assert now and what remains unasserted until integration** — a half-built pipeline
cannot be reviewed for end-to-end behavior, and pretending otherwise wastes the turn.

### What makes a legitimate seam

A green tree is necessary but not sufficient. A block is a legitimate seam only if all hold:

1. **One contract** — a short, independently assertable purpose ("handle mint/read + adoption
   invariants"), not "the next N files".
2. **Complete evidence travels together** — production code, its tests, and any migration/config
   implications are in the same block. "Code now, tests later" is never a seam.
3. **Stable boundary** — later blocks consume a named interface; they do not have to repair a
   knowingly temporary API or a red intermediate state.
4. **Green and externally honest** — the gates pass, and the block is either deployable against the
   current external world or explicitly held by a recorded completion obligation (see above).
5. **Reviewable in isolation** — see the Handoff requirement above.

A split by directory, by "code then tests", or at an arbitrary file count fails this test.

### The size trigger

Measured on this repository (2026-07-14): across the 20 most recent runtime-touching commits, Item 1
was **28 execution-affecting files / 1,763 lines of churn**, while every other commit topped out at
**14 files / 366 churn**. The trigger is set between them:

> **16 execution-affecting files, or 500 lines of execution-affecting churn** (additions +
> deletions). Count runtime source, migrations, and gate-affecting config. Exclude tests, docs,
> generated files, and lockfiles from the *trigger* — they are still reviewed, they just do not
> decide whether the task is oversized.

- **At plan time** — if the expected surface crosses the trigger, or the plan already contains four
  independently testable seams, the plan carries a **Review Granularity** section: the proposed
  blocks, the risk nucleus, and whether the task stays one task or goes back to STRAT to be split.
  This is inside the existing plan-approval turn — no new owner round-trip.
- **Before the final review** — measure the actual surface. If it crossed the trigger and the work
  was never split, the task must record why no legitimate seam existed. A session may not silently
  declare its own oversized block exempt at the end.

**This number is a trial rule, not a constant.** It is fitted to a 20-commit sample containing
exactly one positive case; it must be recalibrated after a few firings or near-misses, and a META
session that sees it misfiring should say so rather than defend it.

### Who decides

- **STRAT, at task-cutting time** — owns the task's boundary, dependency order, and whether an
  obvious large-and-risky nucleus needs a checkpoint. If no legitimate green seam exists, STRAT
  splits the task rather than ordering arbitrary commits.
- **IMPL, at plan time** — owns the actual file-aware seams after inspecting the repo, and names
  each block's contract. Collapsing a checkpoint the task file asked for is a **deviation** and must
  be surfaced under the existing deviation rule, never done silently.

## Post-Review Fix Loop

When an independent review (Codex or external) is run on a completed block, **the IMPL session
that built the block owns the entire loop**: it writes the handoff, processes the findings,
writes the `## Response`, applies the accepted fixes, re-runs the gates, proposes the commit,
and closes the thread at consensus. It therefore **stays open until its thread reaches
consensus** — an IMPL session does not end at "READY FOR DEVELOPER REVIEW" if a review of its
block is pending.

Rationale: the IMPL session already holds the diff, the context, and the reasoning. Any handoff
to another session means re-deriving all three. A review that finds nothing is closed by the
same session, with no ceremony.

**STRAT does not participate in the fix loop.** A strategic session that picks up an IMPL
session's leftover review — processing findings, editing code, running gates — is doing IMPL
work in a strategic session: it erases the separation of duties and burns an expensive,
decision-carrying context on mechanical edits. ("The fixes are small and deterministic" is not
a justification — that reasoning dissolves every boundary.)

**The escape hatch already exists and is the only route back to STRAT:** if a finding requires a
product/architecture decision rather than a fix, the existing rule applies — STOP, do not decide
it in the IMPL session, escalate for a PRD/FS/decision update. That covers the rare judgment
case without routing every routine finding through a strategic session.

**No final STRAT sign-off.** By consensus the block has already passed: owner plan approval →
implementation → in-session Review Pipeline → independent review → fixes → gates re-run. A
strategic session arriving last holds no instrument that was not already applied — it can only
read a report and say "ok", which is a ritual that decays into a rubber stamp and dulls the
checks that do work. The owner's real control points are the **plan approval** (before the
work, when changing course is cheap) and the **commit approval** (after, with the diff in hand).
The IMPL session reports its outcome into the task file and PROJECT_STAGE_LOG.md; the next
STRAT session reads that when it plans — no extra ping, no ceremony.

## Delegating IMPL Tasks to Codex

Codex may execute a task file directly (not just review one) when the task is
**deterministic, local, reversible, and decision-free**: the desired behavior is already
settled in the authoritative docs, the affected surface is small and named, acceptance is
objectively checkable, and no product/architecture/visual-taste decision is required.
Examples: a localized bug fix with a clear repro and contract; a component/route whose
behavior is already fully specified; tests for an already-clear contract; pure utilities;
mechanical renames/migrations within an established pattern with an explicit file set;
objective accessibility fixes; doc sync from an already-decided source. Not delegable:
unresolved product/UX/visual decisions, architecture changes or new abstractions, dependency
additions, migrations/RLS/secrets/deployment/CI/CD, concurrency/idempotency/recovery-sensitive
work, subjective UI iteration, or anything touching files another session may be editing.

Requirements:

- The task file must be `ready` (never `draft`) and self-sufficient — Codex has no
  conversational history, only what's written: exact outcome and authoritative spec sections;
  numbered in-scope deliverables and named out-of-scope neighbors; objective acceptance
  criteria including failure behavior; expected tests/manual verification (or an explicit
  reason neither applies); an **Allowed Write Surface** (the explicit list of paths Codex may
  write — nothing outside it, ever); whether deps/migrations/generated files/shared docs may be
  touched (default: no); and `Executor: codex` / `Reviewer: claude` stated in the task file.
- **Baseline and ownership must be recorded and checked, not assumed.** At startup, before
  planning, Codex reports the working tree's actual state and **stops if any path in its Allowed
  Write Surface is already dirty** — unless the task explicitly names and assigns that
  pre-existing diff to this task. Rationale: without this, a formally valid task can run against
  someone else's uncommitted work, and Claude cannot later separate Codex's changes from the
  pre-existing ones in the final diff. "Don't delegate tasks touching files another session may
  be editing" is a design guideline; this is the check that enforces it.

  **The baseline is the commit that introduced the task file — never a hash written into it.**
  A task file cannot name the commit that carries it (the hash does not exist while the file is
  being written), so an author who fills in a hash necessarily writes a *stale* one, and the
  "stop if HEAD differs" check then fires forever: the task is undelegatable by construction. This
  is the same self-reference the Lifecycle section already forbids at the other end (a task file
  may not record the hash of the commit that completes it). Codex derives the baseline itself with
  `git log -1 --format=%H -- <task file>` and, rather than demanding `HEAD == baseline`, checks
  what actually matters: **has anything in the Allowed Write Surface changed since that commit**
  (`git diff --stat <baseline>..HEAD -- <surface paths>`, plus the dirty-tree check above)?
  Unrelated commits on top of the baseline are normal and must not block the task. If the surface
  *has* moved, Codex stops and asks — the task was written against a different world.
  (Real case, 2026-07-14: `STAGE_6_TASK_08` recorded `Baseline commit: da6861f` but was introduced
  by `4dd7593`, so `HEAD == da6861f` was never true; the task would have halted a Codex session at
  its first startup check. Found by Codex while researching an unrelated question — no human or AI
  pass over that file had noticed.)
- Codex stops and asks rather than improvising when repo evidence conflicts with the task, an
  acceptance criterion admits materially different behaviors, a required decision/asset is
  missing, or the diff would need to expand beyond the declared boundary.
- **Owner authorization for delegation itself is still required per task** (approving that
  this specific `ready` task goes to Codex, not Claude) — this is not blanket automation. In
  practice this authorization IS the owner sending the standard kickoff
  `Execute docs/project/tasks/<file>` in a fresh Codex session, provided the named file is
  `ready` and states `Executor: codex` — no separate "delegate this to Codex" step is needed.
  This does not skip the plan-approval turn below (same safeguard as an IMPL session): Codex
  still syncs, validates eligibility/write surface, inspects the repo, presents a concise plan,
  and waits for explicit approval before editing.
- **Codex owns its own gate loop.** Before setting `awaiting-claude-review`, Codex must run
  `pnpm lint` / `pnpm typecheck` / `pnpm test` (the same non-mutating gates AGENTS.md allows
  it elsewhere) and iterate — fix, re-run — until all three pass, or stop and report exactly
  which check it could not resolve and why. A report of "FAIL, unresolved" is acceptable; a
  handoff with a *fixable* failure Codex didn't attempt to fix is not — the whole point of
  delegating is that Claude should not spend its budget triaging errors Codex could have
  cleared itself. This does NOT replace Claude's own gate run below; it exists so that run is
  normally a fast confirmation instead of a debugging session.
- Claude's review treats the diff as an unfamiliar contributor's patch, not a continuation of
  its own reasoning: re-derive what the patch must do from the task + docs before reading
  Codex's report; inspect the complete diff including untracked files, confirm every changed
  path was authorized; check behavior, failure paths, types, dependency direction, and
  security/data boundaries, not just whether tests pass; check tests against
  PROJECT_TESTING_STRATEGY.md for real contract coverage, not tests fitted to the
  implementation; **always re-run the full `pnpm qg` itself regardless of Codex's reported
  result — this is the mandatory final gate and is never skipped or trusted secondhand, even
  when Codex already reported a clean pass**; treat any fix made during review as a new diff
  needing its own pipeline pass. Only after a clean pass does Claude update shared docs, move
  the task to `done`, and propose a commit — commits remain Claude Code's job with owner
  approval, per CLAUDE.md.
- The execution report and Claude's review verdict live in the task file itself — no separate
  cross-review thread for routine delegated tasks (would duplicate the same facts). High-risk
  or disputed delegated work may still use the formal `docs/project/reviews/` protocol
  deliberately.

---

# Cross-Session Rules

- Any session (STRAT / IMPL / META) that hits workflow friction records it as a one-line entry
  in AI_FRAMEWORK_IDEAS.md — Workflow Observations (cheap note, no discussion). Recording is
  always cheap and always allowed. **Acting on it splits two ways** (AI_WORKFLOW_MASTER.md — What
  to fix now vs. defer): a live orchestration defect / desync / anything threatening
  product-security-data is fixed **now**; pure polish waits for the post-MVP retrospective with the
  entry left `open`. Notice everything; fix live defects immediately; defer only tidiness.
- Shared documents (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md) must have at most one writing
  session at a time — do not run sessions in parallel if more than one will update the same
  shared doc. Task files are conflict-free by design (one file per task); STRAT briefs are
  stage-scoped and written only by the stage's single active STRAT session.
- **The git index is shared across all sessions and is not a private workspace.** Do not leave it
  dirty across an owner round-trip: propose the commit from the working tree, wait for approval,
  then stage and commit in one step with explicit paths (CLAUDE.md — Workflow). Never
  `git add -A`/`git add .`; never commit while another session's file sits staged; re-check
  `git diff --cached --stat` before every commit, because `git add` silently pulls in rename
  pairs. A parallel session's commit will otherwise carry away whatever you left staged — this
  has already happened (`df70cae`), and it is silent by construction: neither session can see the
  other's staging.
- Out-of-scope findings discovered mid-task stay out of the diff. Routing depends on who found
  them: a **Claude session** records product/code findings in PROJECT_BACKLOG.md and
  process/workflow findings in the observations journal (AI_FRAMEWORK_IDEAS.md), and mentions
  them in the task report. A **delegated Codex executor** may not write those shared docs (they
  are outside its Allowed Write Surface) — it records such findings in its execution report
  only, and Claude transfers the accepted ones to the owning doc during its mandatory review
  pass. Neither ever fixes them in-scope.
- Independent cross-review with Codex follows docs/framework/AI_CROSS_REVIEW.md: Claude Code
  authors and responds, Codex reviews read-only via status-driven review threads in
  `docs/project/reviews/`. ("External reviewer" is a distinct role in that document — an AI
  with no repo access, reviewing via owner-carried copy-paste; do not conflate the two.)

---

# Session Settings Guidance

- **Model:** highest-reasoning tier (Fable/Opus) for strategic, meta, audit, and independent-review
  sessions; standard coding tier (Sonnet) for well-scoped implementation tasks; light tier (Haiku)
  for trivial chores. The task file's "How to run" block may override per task.
- **Reasoning effort / thinking:** default for routine implementation; extended for
  architecture-sensitive planning and audits.
- **Usage limits:** spend the high-reasoning tier only where it changes outcomes (strategy,
  audits, independent reviews); route routine implementation and chores to the cheaper tiers;
  prefer starting a fresh session over pushing a long one into summarization — a summarized
  context wastes limits on re-establishing state.
- **Permission mode:** start non-trivial work in Plan mode; switch to normal/acceptEdits only
  after the plan is approved. Trivial, fully-specified chores may start in normal mode.
- **New session instead of continuing when:** starting a new task; the current session's context
  has grown long (summarization risk); or an independent review is needed — independent reviews
  must run in a fresh session without access to the prior session's conclusions.
- **Forking is not a continuation mechanism:** a fork inherits the full parent transcript, so it
  carries the same context weight and does not relieve context pressure. Fork to branch an idea
  from shared context; to continue work that outgrew its session, start a fresh session with
  context from docs (for strategic work — see STRAT Next-Session Brief).
