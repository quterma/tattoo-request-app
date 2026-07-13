Purpose
Reusable template for starting every implementation stage / sub-stage task
(e.g. Stage 6A.1, Stage 6A.2, Stage 7B). This is NOT a project specification — reusable across
projects, like the rest of docs/framework/.

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
   and prompt: `Execute docs/project/tasks/<file>`. This same kickoff line, sent in a fresh
   Codex session instead, is how a task with `Executor: codex` is delegated — see
   docs/framework/AI_TASK_PROTOCOL.md, Delegating IMPL Tasks to Codex.

---

# Task: Stage <stage> — <short title>

## Status

`draft | ready | in progress | awaiting-claude-review | done | superseded` · created <date> ·
done: <date · PROJECT_STAGE_LOG.md entry pointer>

(`awaiting-claude-review` applies only to a task delegated to Codex. `superseded` needs a
one-line reason + pointer to the replacement. Do not record a commit hash here — a file cannot
contain the hash of the commit that first records it; git history is the commit provenance.)

## Execution

- Executor: `claude | codex` — who implements this task
- Reviewer: `claude` — Claude Code always reviews; for a Codex-executed task this is the
  mandatory independent review pass (AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex)
- Baseline commit: <hash the work starts from — the executor stops if HEAD differs>
- Allowed Write Surface: <explicit list of paths the executor may write; nothing outside it.
  Required for `Executor: codex`; recommended for any task>
- May touch dependencies / migrations / generated files / shared docs: <no by default>

## How to run (session settings)

- Model: <Sonnet by default; Fable/Opus if the task is architecture- or security-sensitive>
- Start mode: Plan mode (mandatory unless the task is trivial and fully specified)
- Switch to edit/acceptEdits: only after the plan is explicitly approved
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md: PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
   PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md (as needed).
2. Stage Source of Truth: <the project's authoritative product/spec doc(s) for this stage, if
   any — e.g. this project's Stage 6 uses STAGE_6_PRODUCT_DEFINITION.md (PRD) and
   STAGE_6_FUNCTIONAL_SPECIFICATION.md (FS)>. Product behavior must follow them.
3. Task-specific docs/files: <list the exact spec sections, source files, prior log entries>

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
4. Present a concise implementation plan and wait for explicit approval. The plan MUST contain a
   distinct **"Deviations from the task file"** section — one line per deviation ("task file
   says A, I propose B, because C"), or an explicit "no deviations". Never substitute silently:
   the Review Pipeline compares the *diff* to the task file, so a deviation baked into the plan
   is invisible to every later check (AI_TASK_PROTOCOL.md — Session Duties).
5. Implement only after approval, within Scope only.
6. After implementation: run the Review Pipeline per AI_REVIEW_PIPELINE.md (Test Agent →
   Quality Gates `pnpm qg` → Review Agent); self-review for architecture conformance,
   regressions, and documentation updates; report remaining risks explicitly.
7. If an independent review (Codex / external) is run on this block, the IMPL session owns that
   loop end to end — it writes the handoff, processes the findings, applies accepted fixes,
   re-runs the gates, and closes the thread; it stays open until consensus rather than ending at
   "READY FOR DEVELOPER REVIEW" (AI_TASK_PROTOCOL.md — Post-Review Fix Loop).
8. Never expand scope. If product behavior needs to change, STOP and request a spec update
   first (see this project's PROJECT_DECISIONS.md for the applicable authority rule, e.g.
   Stage 6 Product Documentation Authority).

## Acceptance Criteria

<verifiable statements; reference the relevant spec section's acceptance criteria if the
project's Source of Truth defines one>

## Reporting

**If `Executor: claude`:**

- Update PROJECT_STAGE_LOG.md (progress) and PROJECT_DECISIONS.md (if a decision was made).
- Set Status to `done` (date + stage-log pointer, no commit hash); move this file to
  `docs/project/tasks/done/`; propose the commit for owner approval.

**If `Executor: codex`:** Codex does NOT do any of the above. It appends an Execution Report to
this file (what changed, final `pnpm lint`/`typecheck`/`test` results, anything unresolved, any
out-of-scope findings noticed) and sets Status to `awaiting-claude-review`. Claude Code then
runs its independent review pass — including a mandatory full `pnpm qg` — and only after a
clean pass does the Claude-side reporting above, filing any accepted out-of-scope findings into
PROJECT_BACKLOG.md / AI_FRAMEWORK_IDEAS.md itself.

## Execution Report (filled by the executor)

<what changed; gate results; unresolved items; out-of-scope findings — see Reporting above>

## Claude Review Verdict (delegated tasks only)

<Claude's independent verdict after reviewing the diff and re-running `pnpm qg`>
