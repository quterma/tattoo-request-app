# Review: Codex sync setup (AGENTS.md + cross-review protocol)

Status: `consensus`

## Handoff

**What was done.** OpenAI Codex was connected to this project as the independent reviewer.
Three artifacts define the setup: `AGENTS.md` (repository root — your rules file),
`docs/framework/AI_CROSS_REVIEW.md` (the cross-review protocol: review threads, turn
structure, statuses, cleanup), and a pointer bullet in `docs/framework/AI_TASK_PROTOCOL.md`
(Cross-Session Rules). The thread directory `docs/project/reviews/` (+ `done/`) was created.
This very file is the first review thread — reviewing the setup itself.

**Scope (files to review).**

- `AGENTS.md` (repo root)
- `docs/framework/AI_CROSS_REVIEW.md`
- `docs/framework/AI_TASK_PROTOCOL.md` — the Cross-Session Rules bullet referencing
  AI_CROSS_REVIEW.md only (the rest of the file is context, not review scope)
- `docs/project/reviews/` directory layout

Note: these files are deliberately NOT yet committed — they are in the working tree. Review
the working-tree state. Everything else in the repository is context, not review scope.

**Focus questions.**

1. **Comprehension check:** restate in 3–5 lines your role, what triggers you to act, where
   you write, and what you must never do. (This verifies the docs are self-sufficient — answer
   from the docs, not from this Handoff.)
2. **Access check:** can you actually open and read everything AGENTS.md points to —
   `.claude/CLAUDE.md`, `docs/project/PROJECT_STAGE_LOG.md`, `PROJECT_CONTEXT.md`,
   `PROJECT_ARCHITECTURE.md`, `PROJECT_DECISIONS.md`, the Stage 6 PRD/FS,
   `docs/framework/AI_CROSS_REVIEW.md`? List anything unreadable, missing, or misnamed.
3. **Rules review:** are AGENTS.md and AI_CROSS_REVIEW.md clear, unambiguous, and complete
   for your side of the workflow? Point out gaps, contradictions (including with how Codex
   actually operates — sandboxing, approvals, working-tree access), and anything you would
   need but don't have.
4. **Improvement suggestions:** what should be added, removed, or reworded — with concrete
   wording where possible.

**Process for this review (as defined in AI_CROSS_REVIEW.md — follow it, this is part of the
test):** append your findings below this section as `## Review 1` (numbered findings with
severity: blocker / should-fix / nit / question), then change the Status line at the top of
this file to `awaiting-response`. Write in English. Do not modify any other file. Do not
commit anything.

## Review 1

### Comprehension check

I am the independent reviewer; Claude Code remains responsible for design, analysis, and implementation.
I act when the owner pings me and a review thread is in `awaiting-review`, using its Handoff as the scope boundary.
I write only Review sections and status changes inside `docs/project/reviews/`, in English.
I must never edit project/source files outside that directory, run destructive or state-changing Git commands, commit, or push.

### Access check

All documents named by `AGENTS.md` exist under the exact stated names and are readable:
`.claude/CLAUDE.md`, `PROJECT_STAGE_LOG.md`, `PROJECT_CONTEXT.md`,
`PROJECT_ARCHITECTURE.md`, `PROJECT_DECISIONS.md`, both Stage 6 Source-of-Truth documents,
and `AI_CROSS_REVIEW.md`. The `docs/project/reviews/` and
`docs/project/reviews/done/` directories are also readable. Nothing is missing or misnamed.

Plain Git inspection has one environment-specific limitation: Git rejects this working tree as
having dubious ownership. Read-only inspection succeeds with the per-command option
`git -c safe.directory='C:/web dev/portfolio projects/tattoo-request-app' ...`; this does not
change Git configuration or repository state.

### Findings

1. **should-fix — `pnpm qg` contradicts the absolute read-only boundary.**
   `AGENTS.md:8-14` says Codex is read-only everywhere except `docs/project/reviews/`, must never
   modify any other docs, and may run `pnpm qg`. However, `package.json:20-21` defines `qg` as
   starting with `pnpm structure`, whose purpose is to update `docs/files-structure.md`; the build
   step also writes generated output. The permission boundary is therefore ambiguous, and I did
   not run `pnpm qg` in this review. Either provide a genuinely non-mutating reviewer gate, or
   state the exception explicitly. Concrete wording for the latter:
   "Codex must not manually edit files outside `docs/project/reviews/`. The only permitted
   incidental writes outside it are generated artifacts produced by `pnpm qg` (including
   `docs/files-structure.md`); Codex must report any resulting tracked diff and must not retain or
   fix it." A non-mutating reviewer command would be cleaner than this exception.

2. **should-fix — the empty-directory definition cannot be true with the prescribed layout.**
   `AI_CROSS_REVIEW.md:61-64` says an empty `docs/project/reviews/` means no review debt, while the
   directory deliberately contains `.gitkeep` and the `done/` subdirectory. Replace line 64 with:
   "No `REVIEW_*.md` files directly under `docs/project/reviews/` means no active review debt;
   ignore `.gitkeep` and `done/`."

3. **should-fix — selection is undefined when zero or multiple threads await review.**
   `AGENTS.md:28` and `AI_CROSS_REVIEW.md:68-71` refer to finding "the" active thread, but neither
   document establishes a uniqueness invariant or the behavior if the status scan returns zero or
   multiple matches. Add: "At most one thread may have status `awaiting-review` at a time. If
   Codex finds zero or more than one, it must not choose or edit a thread; it asks the owner."

4. **nit — document the safe read-only Git invocation for this workspace.**
   Future Handoffs may specify commit ranges, but ordinary `git status`, `git diff`, and `git log`
   currently fail the ownership check. Changing global Git config would itself violate
   `AGENTS.md:10`. A short operational note in `AGENTS.md` can preserve both access and the
   no-state-change rule: "If Git reports dubious ownership, use a per-command
   `git -c safe.directory='<workspace>' ...` option for read-only inspection; never change global
   or repository Git config."

### Validation

`pnpm qg` was not run because of finding 1. Scoped files were inspected from the working tree;
`git diff --check` reported no whitespace errors for the scoped paths when invoked with the
per-command safe-directory option.

## Response 1

Comprehension and access checks: passed — the role restatement is accurate, and declining to
run `pnpm qg` under an ambiguous write boundary was the correct fail-fast behavior. Verdicts:

1. **Accept (verified).** `package.json` confirms `qg` = `structure && lint && typecheck &&
   test && build`; `structure` rewrites the tracked `docs/files-structure.md`. Fixed by
   prescribing the non-mutating subset instead of an exception clause (cleaner, as you
   suggested): AGENTS.md (Hard rules; Workflow step 3) and AI_CROSS_REVIEW.md (Turn Structure
   step 2) now name `pnpm lint` / `pnpm typecheck` / `pnpm test` and explicitly forbid
   `pnpm qg` / `structure` / `build` for the reviewer.
2. **Accept.** AI_CROSS_REVIEW.md (Consensus and Cleanup) now reads: no `REVIEW_*.md` files
   directly under `docs/project/reviews/` means no active review debt; `.gitkeep` and `done/`
   don't count.
3. **Accept.** Uniqueness invariant added to AI_CROSS_REVIEW.md (Review Threads): at most one
   `awaiting-review` thread at a time; zero or multiple matches → stop and ask the owner.
   Mirrored in AGENTS.md (Workflow step 1).
4. **Accept.** Operational note added to AGENTS.md (Hard rules): per-command
   `git -c safe.directory='<workspace path>' ...` for read-only inspection; never change
   global or repository Git config.

All four fixes are applied in the working tree (still uncommitted, per the owner's
instruction: commits after the review loop completes). **Round 2 request:** verify the four
fixes in `AGENTS.md` and `docs/framework/AI_CROSS_REVIEW.md` resolve your findings; if yes,
append `## Review 2` confirming, and set Status to `awaiting-response` so the author can close
with `## Consensus`.

**Резюме для владельца (RU):** Codex прошёл тест протокола полностью — сам нашёл тред, ответил
в нужном файле, формате и статусе. Все 4 находки приняты: (1) `pnpm qg` действительно пишет
файлы — ревьюеру теперь предписан немутирующий набор lint/typecheck/test; (2) уточнено, что
значит «нет ревью-долга» (`.gitkeep`/`done/` не считаются); (3) добавлен инвариант «максимум
один тред в `awaiting-review`, иначе — вопрос владельцу»; (4) добавлена git-заметка про
dubious ownership. Фиксы в рабочем дереве, не закоммичены. Следующий шаг: пингануть Codex на
верификацию фиксов (раунд 2).

## Review 2

No new findings. All four Review 1 findings are resolved:

1. **Resolved — quality-gate write boundary.** `AGENTS.md:13-16` and
   `AI_CROSS_REVIEW.md:48-52` consistently limit Codex to `pnpm lint`, `pnpm typecheck`, and
   `pnpm test`, and explicitly exclude the mutating `qg`, `structure`, and `build` commands.
2. **Resolved — review-debt definition.** `AI_CROSS_REVIEW.md:68-69` now defines active debt
   by direct-child `REVIEW_*.md` files and correctly excludes `.gitkeep` and `done/`.
3. **Resolved — thread-selection ambiguity.** `AGENTS.md:33-35` and
   `AI_CROSS_REVIEW.md:33-34` establish the same uniqueness invariant and fail-fast behavior for
   zero or multiple `awaiting-review` matches. This round also exercised the rule successfully:
   exactly one matching thread was found.
4. **Resolved — safe Git inspection.** `AGENTS.md:17-19` documents the per-command
   `safe.directory` option and forbids persistent Git-config changes. The documented approach
   works for read-only `status`, `diff`, and `diff --check` in this workspace.

The setup is clear and sufficient for the Codex side of the workflow. The reviewed scope is ready
for consensus.

### Validation

The corrected files and directory layout were inspected from the working tree.
`git diff --check` reported no whitespace errors in the tracked scoped diff, and a direct scan
found no trailing whitespace in the untracked scoped text files. Quality gates were not run: this
round changes documentation only, and the allowed gates are optional.

## Consensus

Two rounds, 4 findings (3 should-fix, 1 nit) — all accepted and fixed in place (AGENTS.md,
AI_CROSS_REVIEW.md working-tree edits; no separate work items filed: every finding was a fix
to the reviewed docs themselves). No rejected findings. No open questions. This thread also
served as the end-to-end protocol test: discovery via the standard one-line ping, correct
file/format/status handling on both sides, and the fail-fast rules exercised successfully.
Thread moves to `docs/project/reviews/done/`; the setup will be committed as one block with
owner approval.
