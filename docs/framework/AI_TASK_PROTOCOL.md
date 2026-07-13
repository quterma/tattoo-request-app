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
| Implementation | `IMPL:` | executing exactly one task file | Review Pipeline + reporting per the task file |
| Meta | `META:` | improving the AI workflow itself | updates to `docs/framework/*` |

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
> pickup point. If the brief does not exist and this is the stage's first STRAT session, stop
> and ask the owner what the first strategic topic is — do not invent one.
> Expected outcome: \<task files for a stage / a decision on a question / a plan\>.
> Existing code is strategic context too: before presenting options or solutions on any
> sub-topic, search the repository for prior art (existing components, utilities, decisions) —
> never propose from general knowledge what the repo may already implement.
> Confirm understanding in 3–5 lines before proceeding.
> Before the session ends: persist every outcome into docs — task files per
> STAGE_TASK_TEMPLATE.md (status `ready`), PROJECT_DECISIONS.md for decisions,
> PROJECT_STAGE_LOG.md for progress — and unconditionally write/update
> `docs/project/tasks/STAGE_<stage>_STRAT_BRIEF.md` with what was done and what's next
> (see STRAT Next-Session Brief below), proposing its commit immediately after writing
> (commits require explicit owner approval — CLAUDE.md).
> No chat-only conclusions. List created/updated files in the final message.

(The META kickoff prompt lives in AI_WORKFLOW_MASTER.md; IMPL sessions are started from a task
file per STAGE_TASK_TEMPLATE.md — How to Use.)

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
  Rules: one active STRAT session per stage).
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
- Skeleton: `docs/project/tasks/STAGE_TASK_TEMPLATE.md`.
- **A task file is the scope boundary for the executing session.** No work outside it; the
  standard Pre-task Sync (CLAUDE.md) still applies.
- Do not accumulate multiple tasks in one file — one file per task keeps the executor's context
  minimal and avoids write conflicts between parallel sessions.

## Lifecycle

`draft → ready → in progress → done` — tracked in the file's Status header.

Transition owners:

- `draft → ready` — the developer (approval that the task may be executed as written)
- `ready → in progress` — the executing implementation session, at start
- `in progress → done` — the executing implementation session, after Review Pipeline + reporting

When done: record the outcome in the file (commit hash, stage-log pointer), set status `done`,
and move the file to `docs/project/tasks/done/`. Never delete task files.

A task that is cancelled or replaced gets status `superseded` (with a one-line reason and a
pointer to its replacement, if any) and also moves to `docs/project/tasks/done/`.

---

# Cross-Session Rules

- Any session (STRAT / IMPL / META) that hits workflow friction records it as a one-line entry
  in AI_FRAMEWORK_IDEAS.md — Workflow Observations (cheap note, no discussion); META sessions
  discuss and resolve them per AI_WORKFLOW_MASTER.md.
- Shared documents (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md) must have at most one writing
  session at a time — do not run sessions in parallel if more than one will update the same
  shared doc. Task files are conflict-free by design (one file per task); STRAT briefs are
  stage-scoped and written only by the stage's single active STRAT session.
- Out-of-scope findings discovered mid-task stay out of the diff: record product/code findings
  in PROJECT_BACKLOG.md, process/workflow findings in the observations journal
  (AI_FRAMEWORK_IDEAS.md), and mention them in the task report — never fix them in-scope.
- Independent cross-review with the external reviewer (Codex) follows
  docs/framework/AI_CROSS_REVIEW.md: Claude Code authors and responds, Codex reviews
  read-only via status-driven review threads in `docs/project/reviews/`.

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
