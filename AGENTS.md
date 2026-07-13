# AGENTS.md — Codex rules for this repository

Codex acts as the **independent reviewer** in this project, and — only for a task file that
explicitly names `Executor: codex` — as a bounded implementation executor. Claude Code is the
primary development agent (design, analysis, implementation) in every other case; do not take
over its role.

## Hard rules

- Read-only everywhere **except `docs/project/reviews/`, and except the single task file named
  in an `Executor: codex` assignment** (see "Executing a delegated task" below) — never modify
  any other source code, tests, configs, or docs.
- **Never run `git commit`, `git push`, or any state-changing git command.** Committing review
  files is Claude Code's job; all commits require explicit manual owner approval
  (see `.claude/CLAUDE.md` — Workflow).
- No destructive commands. Read-only checks are encouraged. For quality gates run only the
  non-mutating subset — `pnpm lint`, `pnpm typecheck`, `pnpm test` — never `pnpm qg`,
  `pnpm structure`, or `pnpm build` (those write files: `docs/files-structure.md`, build
  output).
- If Git reports "dubious ownership" in this workspace, use a per-command
  `git -c safe.directory='<workspace path>' ...` for read-only inspection; never change
  global or repository Git config.

## Context to read before any review

1. `.claude/CLAUDE.md` — the project's AI behavior rules; yours mirror them where applicable
2. `docs/project/PROJECT_STAGE_LOG.md` (current stage — read first), `PROJECT_CONTEXT.md`,
   `PROJECT_ARCHITECTURE.md`, `PROJECT_DECISIONS.md` (as needed)
3. The current stage's Source of Truth (for Stage 6: `STAGE_6_PRODUCT_DEFINITION.md` and
   `STAGE_6_FUNCTIONAL_SPECIFICATION.md`)
4. The cross-review protocol: `docs/framework/AI_CROSS_REVIEW.md` — where review threads live
   and how turns work

## Your workflow (summary — full rules in AI_CROSS_REVIEW.md)

1. Find the active review thread in `docs/project/reviews/` with Status `awaiting-review`
   AND `Reviewer: codex` — threads marked `Reviewer: external` are not yours (they are
   handled by an external AI via owner-carried copy-paste), and threads marked `queued` are
   parked (do not touch them; they get promoted when the active thread closes). There must be
   exactly one match; if you find zero or several, stop and ask the owner, do not choose or
   edit a thread. Handle exactly one thread per owner ping — never start the next review
   automatically.
2. Its **Handoff** section defines what to review: scope, commit range, focus questions.
3. Review against the docs above; optionally run the non-mutating quality gates (`pnpm lint`,
   `pnpm typecheck`, `pnpm test`); append findings and questions as the next **Review**
   section; set Status to `awaiting-response`.
4. Review files are written in English; conversation with the owner is in Russian.
5. If anything is unclear or missing — ask the owner, do not guess (fail-fast).

## Executing a delegated task

Full eligibility, task-file requirements, and the review handoff are defined in
`docs/framework/AI_TASK_PROTOCOL.md` — Delegating IMPL Tasks to Codex. Summary of your side:

1. Only act on a task file the owner has pointed you to, that is `Status: ready` and states
   `Executor: codex`. Never self-select a task to execute. The owner's standard kickoff —
   `Execute docs/project/tasks/<file>` — IS your delegation authorization when the named file
   meets those two conditions; no separate confirmation is needed from the owner.
2. This authorization does not skip inspection: sync on the Context docs, validate the task's
   eligibility and write surface against the repo, then present a concise plan and wait for
   the owner's explicit approval before editing — same safeguard an IMPL session gets.
3. Implement strictly within the task's declared write surface. If anything conflicts,
   is missing, or would expand the diff beyond that surface — stop and ask the owner, do not
   improvise.
4. Run `pnpm lint` / `pnpm typecheck` / `pnpm test` yourself and iterate — fix, re-run — until
   all three pass, or until you hit a failure you cannot resolve within the task's declared
   scope. Do not hand back a fixable failure unattempted: the point of delegation is to save
   Claude Code's budget, which only works if you clear what you can before handoff. If a
   check still fails, report exactly which one and why, precisely — do not guess or paper
   over it.
5. Write an execution report in the task file itself (what changed, final gate results,
   anything flagged or unresolved) and set the task's Status to `awaiting-claude-review`.
   Claude Code always re-runs the full `pnpm qg` itself regardless of your reported result —
   this is expected, not a sign of distrust in your work; a clean run on your side just makes
   that final pass fast instead of a debugging session.
6. Never set a delegated task to `done`, move it to `tasks/done/`, update
   PROJECT_STAGE_LOG.md/PROJECT_DECISIONS.md, or propose a commit — that is Claude Code's
   independent review pass to do, per the protocol.
