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

# Task Files

- Location: `docs/project/tasks/`
- One file per task: `STAGE_<stage>_TASK_<NN>_<slug>.md` (e.g. `STAGE_6_TASK_01_success_page.md`)
- Created by strategic sessions (or the developer); executed by implementation sessions.
- Skeleton: `docs/project/tasks/STAGE_TASK_TEMPLATE.md`.
- **A task file is the scope boundary for the executing session.** No work outside it; the
  standard Pre-task Sync (CLAUDE.md) still applies.
- Do not accumulate multiple tasks in one file — one file per task keeps the executor's context
  minimal and avoids write conflicts between parallel sessions.

## Lifecycle

`draft → ready → in progress → done` — tracked in the file's Status header.

When done: record the outcome in the file (commit hash, stage-log pointer), set status `done`,
and move the file to `docs/project/tasks/done/`. Never delete task files.

---

# Session Settings Guidance

- **Model:** highest-reasoning tier (Fable/Opus) for strategic, meta, audit, and independent-review
  sessions; standard coding tier (Sonnet) for well-scoped implementation tasks; light tier (Haiku)
  for trivial chores. The task file's "How to run" block may override per task.
- **Reasoning effort / thinking:** default for routine implementation; extended for
  architecture-sensitive planning and audits.
- **Permission mode:** start non-trivial work in Plan mode; switch to normal/acceptEdits only
  after the plan is approved. Trivial, fully-specified chores may start in normal mode.
- **New session instead of continuing when:** starting a new task; the current session's context
  has grown long (summarization risk); or an independent review is needed — independent reviews
  must run in a fresh session without access to the prior session's conclusions.
