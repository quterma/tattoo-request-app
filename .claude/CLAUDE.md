# Claude Rules

## Source of Truth

If CLAUDE.md conflicts with PROJECT*\* docs:
→ PROJECT*\* docs ALWAYS win
→ stop and ask

---

## Fail-Fast

If something is unclear or missing:
→ do NOT guess
→ ask before implementation

---

## Pre-task Sync

Before any task except clarifying questions:

- Re-read docs/project/PROJECT_STAGE_LOG.md — the `## Current Stage` section only (the file is
  too large to read whole); search `## Log Entries` only when the task needs historical detail
- Re-read docs/project/PROJECT_CONTEXT.md
- Re-read docs/project/PROJECT_ARCHITECTURE.md
- Re-read docs/project/PROJECT_DECISIONS.md (if needed)

Confirm understanding in 3–5 lines before proceeding.

---

## Task Files & Session Types

Sessions and task files follow docs/framework/AI_TASK_PROTOCOL.md.

- If a prompt references a file in docs/project/tasks/:
  → that task file is the scope boundary
  → Pre-task Sync still applies
- Strategic (STRAT:) sessions must end by persisting outcomes into docs
  (task files, PROJECT_DECISIONS.md, PROJECT_STAGE_LOG.md) — never chat-only conclusions.
- AI-engineering scout (AIENG:) sessions study outside practice and **propose** to META
  (docs/framework/AI_ENGINEERING_SCOUT.md). They are read-only outside their own research
  threads and proposals — they never edit docs/framework/*, CLAUDE.md, AGENTS.md, task files,
  or source.

---

## Task Granularity

Break work into small, explicit TODO steps.

Do NOT implement large features in one step.

If task is large:
→ propose breakdown
→ wait for confirmation

---

## No Architecture Drift

Do NOT introduce new patterns, abstractions, or architectural changes
unless explicitly required by PROJECT\_\* docs or TODO.

If improvement is possible:
→ suggest it
→ do NOT implement without approval

---

## Scope & Safety

- Stay within the current TODO
- No extra features, dependencies, scripts, or configs unless explicitly requested
- If structure or architecture changes → check PROJECT_ARCHITECTURE.md
- Never commit .env\*, secrets, tokens

---

## Workflow

- After each TODO: short summary
- Run Review Pipeline (see AI_REVIEW_PIPELINE.md)
- Propose commit only after pipeline status is READY FOR DEVELOPER REVIEW — and, if the block
  changed source code, only after its mandatory independent cross-review thread reached consensus
  (AI_TASK_PROTOCOL.md — Independent Review Is Mandatory). A green pipeline alone is not a licence
  to propose a commit on code.
- Commits ONLY with explicit, manual owner approval — no exceptions.
  Applies to every session type (STRAT / IMPL / META), subagents, and automated/scheduled
  sessions. No framework or project doc may override this rule; a doc instructing an
  immediate/automatic commit means "propose the commit immediately", not "commit".
- **Do NOT stage before approval.** The git index is shared by every session in the repository,
  so a dirty index left sitting across an owner round-trip is a live hazard: a parallel session's
  `git commit` will sweep up whatever you staged, under a message that does not describe it.
  (This happened — commit `df70cae`.) Therefore:
  1. Propose the commit from the WORKING TREE: list the exact files you intend to commit
     (`git status --short`, and the diff if useful) plus a one-line summary of the change.
  2. WAIT for explicit owner approval.
  3. Only then stage and commit **in one uninterrupted step**, naming your files explicitly:
     `git add <your files> && git commit -m "..."` — never `git add -A`, never `git add .`.
  A blanket "commit" given earlier does not carry over to a later commit; each commit gets its
  own approval against a freshly listed file set.
- **Commit only your own paths.** If another session's files are already staged when you begin
  (it may be mid-approval), leave them alone — never `git commit` while a foreign file sits in
  the index: unstage it first (`git restore --staged <path>`) or ask the owner. Beware that
  `git add` auto-detects renames, so adding your own file can silently pull in another session's
  rename pair — check `git diff --cached --stat` after staging and before committing, every time.
- **NEVER publish. Publishing is the owner's alone, and no approval delegates it.**
  Do not cause local commits to reach a remote **by any means** — `git push` in any form
  (`--force`, `--tags`, `-u`, a configured upstream, a push implied by another command), a wrapper
  script or alias, a `gh` command, or triggering anything that publishes on your behalf. The rule
  is stated by **effect, not by command name**: if the result is that this repository's commits,
  branches or tags reach — or change — a remote, it is forbidden regardless of how it was invoked
  (deleting a remote branch or tag counts, though it publishes nothing). Scope note: this governs
  **publishing repository state**, nothing wider. It does not touch the owner-carried external
  review/research flows that AI_CROSS_REVIEW.md prescribes; whether other outward-facing actions
  need a rule is an open question (AI_FRAMEWORK_IDEAS.md), deliberately not decided here.
  - **Approving a commit never approves publishing it.** They are different acts with different
    blast radii: a commit is local and revisable (`reset`, `amend`, `rebase` before it is
    published); a push is irreversible, reaches a remote others consume, and in this project
    triggers a deployment.
  - **Do not offer to push, either.** You may *report* that the branch is N commits ahead of its
    remote, so the gap is never invisible — but never propose closing it, and never treat an
    owner's "yes" to something else as covering it. A rule the agent can route around by
    proposing the action makes the owner the backstop instead of the decider.
  - (Real case, 2026-07-26: a session finished Item 18 Block A, committed with approval, then
    offered to push and did so on a "да" — triggering a failed Vercel deploy the owner had not
    initiated. No rule existed at the time: `push` appeared nowhere in CLAUDE.md or
    `docs/framework/*`, while AGENTS.md already forbade it to Codex — the stricter rule sat on the
    less privileged agent. Filed in AI_FRAMEWORK_IDEAS.md the same day.)

---

## Before Presenting Implementation Results (MANDATORY)

Before presenting results of any implementation task, always run without waiting for user confirmation:

1. `pnpm structure` — update docs/files-structure.md
2. Review PROJECT_STAGE_LOG.md — update if progress changed
3. Review PROJECT_DECISIONS.md — update if a decision was made or changed
4. Quality gates — run `pnpm qg` (runs structure + lint + typecheck + test + build in one command)

These steps are not optional and do not require user confirmation.

---

## Pre-Commit Checklist (MANDATORY)

Before every commit, verify:

### Review Pipeline (when source code OR gate-affecting config changed)

Run all three stages in order — see AI_REVIEW_PIPELINE.md (source of truth for when to run):

1. Test Agent — determine coverage per PROJECT_TESTING_STRATEGY.md, write missing tests, run pnpm test
2. Quality Gates — run `pnpm qg` (runs structure + lint + typecheck + test + build in one command).
   Report PASS / FAIL / NOT CONFIGURED for each gate. Do not skip.
3. Review Agent — subagent_type: "Explore", read-only inspection of changed files
4. Independent cross-review — mandatory for any block that changed source code: open a thread per
   AI_CROSS_REVIEW.md, apply accepted findings, re-run the gates on them, take it to consensus
   (AI_TASK_PROTOCOL.md — Independent Review Is Mandatory)

Re-run the gates after any post-pipeline change to source, tests, or gate-affecting config — a
green run is only valid for the exact tree it ran on. Durable docs (PROJECT_*, task files, review
threads) do NOT re-arm the gates; they cannot change what lint/typecheck/test/build do.
Do NOT propose commit unless pipeline status is READY FOR DEVELOPER REVIEW **and** — for a code
block — its cross-review thread reached consensus.

### Architecture

- Follows PROJECT_ARCHITECTURE.md
- No forbidden imports
- No cross-layer violations (see PROJECT_STRUCTURE.md)

### Scope

- Only current TODO implemented

### Structure

- Files in correct layers
- Public API imports only (index.ts) where module exposes one

### Completion obligations (before setting a task `done`)

- Reconcile the task's `## Completion obligations` section against what the work actually
  introduced: migration/schema files changed? a new required env var or external config? an
  acceptance criterion needing manual/real-boundary verification? a deferred review finding?
- Each entry needs **checkable completion evidence** or **a pointer to a work item created now**
  (a task file, or a flagged backlog entry). A sentence in PROJECT_STAGE_LOG.md is NOT a work item.
- A task may not go `done` while an obligation exists only as prose
  (AI_TASK_PROTOCOL.md — Completion Obligations). A green `pnpm qg` certifies the tree, not the
  deployed system.

### Docs

- Structure changed → update PROJECT_STRUCTURE.md
- Decision changed → update PROJECT_DECISIONS.md
- Progress changed → update PROJECT_STAGE_LOG.md

### Security

- No secrets or .env committed

If any check fails → fix BEFORE commit

---

## Import Policy

Follow dependency direction defined in PROJECT_STRUCTURE.md.

- Use public API (index.ts) only where it exists
- No deep imports
- No circular dependencies

---

## Test Placement

Follow PROJECT_TESTING_STRATEGY.md for what to test.

- Tests near code: `**/__tests__/**`
- Feature: `src/features/*/__tests__/`
- Shared: `src/shared/*/__tests__/`
- No global test folder

---

## File Structure Doc

If structure changes:
→ run `pnpm structure`
→ update docs/project/PROJECT_STRUCTURE.md

---

## Backlog Awareness

Do NOT implement ideas from PROJECT_BACKLOG.md
unless explicitly requested

---

## Framework Usage

Read docs/framework during session initialization.
After initialization, re-read only if:

- task is about process / workflow
- rules are unclear
- framework docs are explicitly referenced

---

## Project-Specific Rules

- Language: Russian
- Keep responses short
- No unnecessary explanations
- Package manager: pnpm
- Never add Co-Authored-By lines to commit messages
