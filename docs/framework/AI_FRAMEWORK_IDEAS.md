Purpose
Store ideas, improvements, and potential extensions of the framework, plus raw AI-workflow
observations collected by META sessions (see AI_WORKFLOW_MASTER.md).

Scope
Contains non-final, exploratory concepts that are not yet part of the framework.
Nothing here is executed without an explicit owner decision.

Audience
Framework author, contributors, and AI agents in META sessions.

---

# Idea Format

Each idea should contain:

Title
Description
Motivation
Possible risks or trade-offs

---

# Ideas

## Explicit dependency direction in project structure

Description: PROJECT_STRUCTURE-type documents must define dependency direction explicitly
(which layers may import which).
Motivation: prevents architecture drift; makes violations lint-enforceable.
Risks/trade-offs: none significant; small documentation overhead.
Status: effectively adopted in this project (PROJECT_STRUCTURE.md Dependency Direction table +
`import/no-internal-modules` at error level) — candidate to formalize in the framework master
copy.

## Implementation plans as executable step sequences

Description: implementation plans must be executable step sequences, not descriptive documents.
Motivation: descriptive plans drift from reality and cannot be verified step by step.
Risks/trade-offs: more upfront planning effort per stage.
Status: open.

---

# Workflow Observations (META journal)

Raw observations about the AI-assisted workflow (sessions, task files, models, agents, review
pipeline). Recorded by any session; discussed and resolved in META sessions per
AI_WORKFLOW_MASTER.md. Format: date — observation — status (`open` / `resolved: <where fixed>`).

- 2026-07-12 — Strategy work previously lived in ChatGPT with manual context transfer both ways;
  moved into Claude Code sessions with docs-as-interface (AI_TASK_PROTOCOL.md). — resolved:
  AI_TASK_PROTOCOL.md, STAGE_TASK_TEMPLATE.md, CLAUDE.md (Task Files & Session Types).
- 2026-07-12 — Accumulative per-stage task files were considered and rejected (executor context
  bloat, parallel-session write conflicts); one file per task + `tasks/done/` chosen instead. —
  resolved: AI_TASK_PROTOCOL.md (Task Files, Lifecycle).
- 2026-07-12 — STRAT sessions had no standard kickoff prompt (META and IMPL had one); risk of
  chat-only conclusions and skipped Source-of-Truth reads. — resolved: AI_TASK_PROTOCOL.md
  (STRAT Kickoff Prompt).
- 2026-07-12 — Task lifecycle had no transition owners and no state for cancelled/replaced
  tasks (only "never delete"). — resolved: AI_TASK_PROTOCOL.md (Lifecycle: transition owners,
  `superseded`).
- 2026-07-12 — Task-file naming was ambiguous for sub-stages (`STAGE_6_...` vs `STAGE_6A_...`).
  — resolved: AI_TASK_PROTOCOL.md (Task Files: `<stage>` includes the sub-stage).
- 2026-07-12 — Nothing obliged non-META sessions to record workflow observations, and parallel
  sessions had no rule for shared docs (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md) as a write
  conflict point. — resolved: AI_TASK_PROTOCOL.md (Cross-Session Rules).
- 2026-07-12 — AI_WORKFLOW_MASTER.md Mandate 4 referenced a "usage-limit strategy" in Session
  Settings Guidance that did not exist there. — resolved: AI_TASK_PROTOCOL.md (Session Settings
  Guidance: Usage limits bullet).
- 2026-07-12 — No rule says where an IMPL session records out-of-scope findings discovered
  mid-task (presumably PROJECT_BACKLOG.md for product/code, this journal for process); the task
  template says "report risks" but the protocol is silent. — open.
- 2026-07-12 — DOCUMENTATION_SYSTEM_RULES.md is stale relative to the newer framework docs: its
  framework-doc examples and conflict-priority list predate AI_TASK_PROTOCOL.md /
  AI_WORKFLOW_MASTER.md, and its scope overlap with AI_DEVELOPMENT_WORKFLOW.md (in-session
  development cycle vs session organization) is not cross-referenced. Master copy lives in a
  separate repository — fix belongs there, local copy follows. — open.
