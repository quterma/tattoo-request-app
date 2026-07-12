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
> Run the Pre-task Sync (CLAUDE.md) and read the current stage's Source of Truth
> (for Stage 6: STAGE_6_PRODUCT_DEFINITION.md and STAGE_6_FUNCTIONAL_SPECIFICATION.md).
> If `docs/project/tasks/STAGE_<stage>_STRAT_CONTINUATION.md` exists, read it too.
> Topic: \<topic — or simply: continue from the STRAT continuation note\>.
> Expected outcome: \<task files for a stage / a decision on a question / a plan\>.
> Confirm understanding in 3–5 lines before proceeding.
> Before the session ends: persist every outcome into docs — task files per
> STAGE_TASK_TEMPLATE.md (status `ready`), PROJECT_DECISIONS.md for decisions,
> PROJECT_STAGE_LOG.md for progress. If the topic is not finished when the session ends,
> also write/update the stage's STRAT continuation note (see STRAT Continuation below).
> No chat-only conclusions. List created/updated files in the final message.

(The META kickoff prompt lives in AI_WORKFLOW_MASTER.md; IMPL sessions are started from a task
file per STAGE_TASK_TEMPLATE.md — How to Use.)

---

# STRAT Continuation (unfinished topic)

Two distinct ways a strategic session ends:

- **Topic finished** — the standard kickoff persistence step is enough; the next STRAT session
  picks a new Topic from PROJECT_STAGE_LOG.md / task files. No extra artifact.
- **Topic NOT finished** (context grown long, natural stopping point) — the closing session
  must leave a pickup point: the stage's **STRAT continuation note**.

Continuation note convention:

- Location: `docs/project/tasks/STAGE_<stage>_STRAT_CONTINUATION.md` — at most one per stage;
  written and updated only by that stage's STRAT sessions (no conflict with Cross-Session
  Rules: one active STRAT session per stage).
- Contents — pointers, not prose (no duplication per DOCUMENTATION_SYSTEM_RULES.md):
  1. **Decided** — pointers to the PROJECT_DECISIONS.md / PROJECT_STAGE_LOG.md entries this
     session wrote; never restate decisions in the note
  2. **Open** — the explicit list of questions still undecided or not yet discussed
  3. **Task files** — which exist as `ready` vs `draft`; an idea concrete enough to file
     becomes a `draft` task file, not note text
  4. **Suggested next step** — optional, one line
- The next STRAT session starts with the standard kickoff; its Topic is simply "continue from
  the STRAT continuation note" — the owner writes no ad-hoc summary prompt.
- If the Topic says to continue from the note but no note exists, do not guess (fail-fast per
  CLAUDE.md): stop and ask the owner — a missing note means either a stale kickoff prompt or a
  prior session that failed its persistence duty, and the owner must say which.
- When the stage's strategic work is finished, the session that finishes it moves the note to
  `docs/project/tasks/done/` (same never-delete convention as task files).

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
  shared doc. Task files are conflict-free by design (one file per task).

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
  context from docs (for unfinished strategic topics — see STRAT Continuation).
