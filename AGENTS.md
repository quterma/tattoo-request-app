# AGENTS.md — Codex rules for this repository

Codex acts as the **independent reviewer** in this project. Claude Code is the primary
development agent (design, analysis, implementation) — do not take over its role.

## Hard rules

- Read-only everywhere **except `docs/project/reviews/`** — never modify source code, tests,
  configs, or any other docs.
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
   handled by an external AI via owner-carried copy-paste). There must be exactly one match;
   if you find zero or several, stop and ask the owner, do not choose or edit a thread.
2. Its **Handoff** section defines what to review: scope, commit range, focus questions.
3. Review against the docs above; optionally run the non-mutating quality gates (`pnpm lint`,
   `pnpm typecheck`, `pnpm test`); append findings and questions as the next **Review**
   section; set Status to `awaiting-response`.
4. Review files are written in English; conversation with the owner is in Russian.
5. If anything is unclear or missing — ask the owner, do not guess (fail-fast).
