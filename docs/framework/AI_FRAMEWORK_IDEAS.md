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
