# Task: Tooling — `pnpm project:status` (read-only process status view)

(Not Stage 6 product work: this is process tooling, independent of the public-website stage. It
does not appear in STAGE_6_IMPLEMENTATION_PLAN.md and blocks nothing there.)

## Status

`draft` · created 2026-07-14 · done: <date · PROJECT_STAGE_LOG.md entry pointer>

Source: `docs/project/research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`
(Q2 — owner decision 2026-07-14: build the command).

## Execution

- Executor: `codex` — deterministic, local, decision-free: a read-only script over files whose
  format is already fixed, with an objective expected output. Delegable per AI_TASK_PROTOCOL.md.
- Reviewer: `claude` — mandatory independent review pass + full `pnpm qg`.
- Baseline: the commit that introduced this task file — derive it with
  `git log -1 --format=%H -- docs/project/tasks/TOOLING_TASK_01_project_status_command.md`. Stop
  only if a path in the Allowed Write Surface is dirty or has moved since then.
- Allowed Write Surface (nothing outside it):
  - `scripts/project-status.mjs` (new)
  - `package.json` (add exactly one script entry: `project:status`)
  - `scripts/__tests__/project-status.test.ts` (new — or the co-located pattern the repo already
    uses for script tests, if one exists; verify before choosing)
- May touch dependencies / migrations / generated files / shared docs: **no**. The script must be
  dependency-free (Node 20 built-ins only — the repo already does this in
  `scripts/update-structure.mjs`; read it first and follow its conventions).

## How to run (session settings)

- Model: Sonnet (well-scoped, mechanical)
- Start mode: Plan mode
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. `docs/framework/AI_TASK_PROTOCOL.md` — Task Files (lifecycle, statuses, `Executor`/`Reviewer`/
   Baseline/Allowed Write Surface fields); Delegating IMPL Tasks to Codex (the baseline rule this
   command must check).
3. `docs/framework/AI_CROSS_REVIEW.md` — review thread statuses and the one-active-thread rule;
   research thread statuses; the `.request.md`/`.answer.md` transport buffers.
4. `scripts/update-structure.mjs` — the existing dependency-free script pattern (invocation, style,
   how it is wired into `package.json`).
5. The research thread named under Status above — it contains the reasoning and the rejected
   alternatives; do not re-litigate them.

## Goal

A read-only command that prints what is currently open and what is internally inconsistent, derived
entirely from the canonical files on disk. It replaces reading directories by eye. It **writes
nothing** — stdout is the whole product.

## Scope

1. **Tasks** — every file in `docs/project/tasks/` and `tasks/done/`: name, `Status`, `Executor`,
   `Reviewer`, and location.
2. **Review threads** — every file directly under `docs/project/reviews/` (not `done/`): name,
   `Status`, `Reviewer`, `Requested by:`.
3. **Research threads** — same, for `docs/project/research/`.
4. **Integrity warnings** — the point of the command, not a bonus. At minimum:
   - a task whose `Status` is missing, unknown, or duplicated;
   - an illegal status/location combination (`done` still in `tasks/`; a non-`done` file in
     `tasks/done/`);
   - **more than one active review thread** (active = any status other than `queued`, still outside
     `done/`) — the protocol's one-active-thread invariant;
   - a `queued` review thread while no thread is active (an orphaned queue);
   - a research thread in `awaiting-external` whose `.request.md` or `.answer.md` buffer is missing;
   - **a task carrying a literal `Baseline commit: <hash>`** — the convention forbids it (a file
     cannot name the commit that carries it; see AI_TASK_PROTOCOL.md). This exact defect was live
     in `STAGE_6_TASK_08` and is what motivated the command.
5. **Git overlay only** — mark artifacts that are modified/untracked relative to HEAD, so a
   held working-tree change is not mistaken for committed state. The filesystem is the source; git
   is an annotation on it. (Do not build the view from `git log`: this repo routinely holds
   uncommitted work across sessions.)
6. **Honest gaps** — for categories that are not structured data today (blocked work and
   deferred-accepted findings live in prose), print `not represented by structured data` rather
   than scraping prose and presenting the result as complete.

## Out of Scope

- Writing, generating, or persisting any status file. Explicitly rejected in the research thread:
  a generated status document is stale the moment generation is not the last action, and this
  project already has a scar from docs that confidently lied about world state. stdout only.
- Normalizing the task/backlog schema (adding a `blocked` status, uniform backlog fields). That is
  the research thread's Q2 Option B — a separate decision the owner has not made.
- Any change to the review/research protocols themselves.
- CI wiring.

## Workflow (enforced)

1. Read the Context docs; confirm understanding in 3–5 lines.
2. Read `scripts/update-structure.mjs` before designing anything — match its conventions.
3. Present a plan (incl. the exact output shape) and wait for explicit approval. The plan must
   carry a **"Deviations from the task file"** section (or "no deviations").
4. Implement within Scope only.
5. Run the Review Pipeline (`pnpm qg`), then open the mandatory independent cross-review thread.

## Acceptance Criteria

- `pnpm project:status` prints tasks, review threads, and research threads with their statuses,
  and writes nothing (verify: `git status` is unchanged after a run).
- It flags every integrity warning in Scope 4. Specifically, it must flag a literal
  `Baseline commit:` hash if one is reintroduced.
- Exit code: non-zero on malformed/contradictory metadata; **zero when work is merely open** (open
  work is not an error).
- It fails loudly on unparseable metadata rather than silently omitting the artifact.
- Categories with no structured representation print the honest placeholder, not a guess.
- `pnpm qg` passes.

## Reporting

Per STAGE_TASK_TEMPLATE.md — Reporting (`Executor: codex` branch).
