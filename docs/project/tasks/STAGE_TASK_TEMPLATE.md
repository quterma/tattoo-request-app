Purpose
Reusable template for starting every implementation stage / sub-stage task in this repository
(e.g. Stage 6A.1, Stage 6A.2, Stage 7B). This is NOT a project specification.

Scope
The standard task-file skeleton and the workflow it enforces. Session/task conventions live in
docs/framework/AI_TASK_PROTOCOL.md; behavior rules live in CLAUDE.md and docs/framework/*.

Audience
AI agents and developers.

---

# How to Use

1. Copy this file to `docs/project/tasks/STAGE_<stage>_TASK_<NN>_<slug>.md`.
2. Fill every section below; replace all `<angle-bracket>` placeholders; delete this "How to Use"
   section and the header above it.
3. Start a new session named `IMPL: Stage <stage> — <slug>` with the settings from "How to run",
   and prompt: `Execute docs/project/tasks/<file>`.

---

# Task: Stage <stage> — <short title>

## Status

`draft | ready | in progress | done` · created <date> · executor: <session name> ·
done: <date, commit hash, PROJECT_STAGE_LOG.md entry pointer>

## How to run (session settings)

- Model: <Sonnet by default; Fable/Opus if the task is architecture- or security-sensitive>
- Start mode: Plan mode (mandatory unless the task is trivial and fully specified)
- Switch to edit/acceptEdits: only after the plan is explicitly approved
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md (as needed).
2. Stage Source of Truth: for Stage 6 — STAGE_6_PRODUCT_DEFINITION.md (PRD) and
   STAGE_6_FUNCTIONAL_SPECIFICATION.md (FS). Product behavior must follow them.
3. Task-specific docs/files: <list the exact FS/PRD sections, source files, prior log entries>

## Goal

<one short paragraph — the outcome, not the steps>

## Scope

<explicit, numbered list of what this task delivers>

## Out of Scope

<explicit list — anything adjacent that must NOT be touched>

## Workflow (enforced)

1. Read the Context docs; identify the current stage and its boundaries; briefly list the
   upcoming steps of this task; confirm understanding in 3–5 lines.
2. Work on one step at a time.
3. Before any implementation: inspect the repository and existing architecture; challenge
   assumptions where appropriate; surface ambiguities; ask questions when anything is unclear
   (fail-fast per CLAUDE.md). Never modify code immediately.
4. Present a concise implementation plan and wait for explicit approval.
5. Implement only after approval, within Scope only.
6. After implementation: run the Review Pipeline per AI_REVIEW_PIPELINE.md (Test Agent →
   Quality Gates `pnpm qg` → Review Agent); self-review for architecture conformance,
   regressions, and documentation updates; report remaining risks explicitly.
7. Never expand scope. If product behavior needs to change, STOP and request a PRD/FS update
   first (PROJECT_DECISIONS.md — Stage 6 Product Documentation Authority).

## Acceptance Criteria

<verifiable statements; for Stage 6 public-site work, reference the relevant FS §6 criteria>

## Reporting

- Update PROJECT_STAGE_LOG.md (progress) and PROJECT_DECISIONS.md (if a decision was made).
- Set Status to `done` with commit hash; move this file to `docs/project/tasks/done/`.
