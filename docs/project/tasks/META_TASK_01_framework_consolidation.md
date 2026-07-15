# Task: META — one-time framework consolidation (delete duplication)

## Status

`draft` · created 2026-07-15 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

Source: `docs/project/research/done/RESEARCH_2026-07-15_external-framework-audit.md` — the
**Simplify** list (owner decision 2026-07-15: do this once, as the closing act of the current META
arc, not as an ongoing refactor stream).

## Execution

- Executor: `claude` — this is judgment-heavy editing of prose whose meaning must be preserved
  exactly; not delegable (it is not mechanical, and a wrong cut silently drops an enforceable rule).
- Reviewer: `claude` + an independent Codex cross-review (this touches the framework's core; the
  risk is a rule quietly lost in a "simplification", which is exactly what a second repo-aware
  reader catches).
- Baseline: the commit that introduced this task file — derive it with
  `git log -1 --format=%H -- docs/project/tasks/META_TASK_01_framework_consolidation.md`.

## How to run (session settings)

- Model: Opus/Fable (this is high-stakes editing of the rules themselves)
- Start mode: Plan mode — present exactly what will be cut/merged/moved before touching anything
- **Fresh session**, not a tail of a long one: the failure mode here is fatigue-editing the rulebook.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. The audit thread named under Source — its **Simplify** list is the scope, and its **Works well**
   list names what must NOT be weakened.
3. `AI_WORKFLOW_MASTER.md — Admission Bar` — the consolidation is explicitly *permitted* by the bar
   (it reduces accretion), but it must not become a stream: one pass, one review, done.

## Goal

A net deletion of duplication across the framework docs, leaving **every enforceable rule in
exactly one canonical location** and pointers (not copies) everywhere else. Not a rewrite; not new
rules; not new documents. The framework should be smaller and say the same things.

## Scope (the audit's Simplify list — each is a candidate, verify before cutting)

1. **`AI_DEVELOPMENT_RULES.md` + `AI_DEVELOPMENT_WORKFLOW.md`** — reduce to short pointer/index pages
   plus only the genuinely generic rules not owned elsewhere. **Read both in full first** — this is
   the older layer, unedited during the 2026-07-13/14 build-out; treat it as unfamiliar. Anything
   unique (not already in CLAUDE.md / AI_TASK_PROTOCOL.md / AI_REVIEW_PIPELINE.md) is preserved, not
   dropped.
2. **`AI_TASK_PROTOCOL.md` — Session Duties through Delegation** — remove the inline dated incident
   narratives and rejected-option essays (they are preserved in AI_FRAMEWORK_IDEAS.md); keep every
   operative rule, table, trigger, and ownership statement, and replace each removed narrative with
   a one-line pointer to the journal entry.
3. **`AI_FRAMEWORK_IDEAS.md — Workflow Observations`** — compact each *resolved* entry to
   problem + decision + owning section + rejected-alternative-in-one-line; the full transcript
   stays in git history and the review/research threads. Do NOT touch `open` entries.
4. **`.claude/CLAUDE.md`** — keep project-specific hard rules and the commit/index safety verbatim;
   replace duplicated pipeline/lifecycle detail with links to the canonical sections.
5. **`AI_CROSS_REVIEW.md`** — remove dated anecdotes already in the journal; compress turn mechanics
   into the existing status tables; drop the Owner Effort restatement where the status table already
   defines the turn.
6. **`STAGE_TASK_TEMPLATE.md — Workflow / Reporting** — reference the canonical workflow instead of
   cloning it; keep only task-specific metadata/scope/acceptance/obligations/review-granularity.
   (This is what caused the two live task contradictions the audit found.)

## Out of Scope

- **Any change to what a rule means.** This is deletion of duplication and narrative, not
  re-decision. If a cut would change behavior, it is not in scope — stop and escalate.
- New rules, new triggers, new documents, new status values.
- The `Tighten` and `Defer` items from the audit — those are separate decisions, some already
  applied in the same commit as this task's Source thread.
- `open` journal entries.

## Workflow (enforced)

1. Read the Context and **both old-layer docs in full**; confirm understanding in 3–5 lines.
2. Present a plan that lists, per file, exactly what is cut / merged / moved and where each removed
   rule now lives — with a **"Deviations from the task file"** section. Wait for approval.
3. For every rule removed from one place, confirm it still exists in exactly one canonical place
   before deleting the copy. A rule that exists in zero places after the edit is a regression.
4. Implement; run `pnpm structure`; the changes are docs-only so the gates are not re-armed, but run
   the independent cross-review (this is core-framework editing).
5. Report: net line delta per file, and a checklist that every `Works well` rule still stands.

## Acceptance Criteria

- Net line count across `docs/framework/` decreases materially, with no enforceable rule lost:
  every rule removed from a doc is shown to survive in exactly one canonical location.
- No document asserts a rule that contradicts another (the class the audit's Q2 found).
- The `Works well` list from the audit is intact — none of those rules weakened.
- Task files generated from the revised template no longer clone global workflow prose.

## Reporting

Per STAGE_TASK_TEMPLATE.md — Reporting (`Executor: claude` branch), plus completion-obligation
reconciliation.
