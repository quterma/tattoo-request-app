# AI_REVIEW_PIPELINE.md

Purpose
Define the subagent-based review pipeline AI must run before proposing a commit.

Scope
Review pipeline steps, agent roles, quality gates, and usage examples.
Does not redefine testing strategy — see PROJECT_TESTING_STRATEGY.md.

Audience
AI agents performing implementation tasks and developers supervising development.

---

# Overview

The Review Pipeline is a mandatory pre-commit step that replaces the simple self-check
when a task involves code changes.

It consists of three stages:

1. Test Agent — determines coverage, writes missing tests, runs test suite
2. Quality Gates — pnpm lint, pnpm typecheck, pnpm build, pnpm test
3. Review Agent — read-only inspection of changed code

Developer approval is still required before the final commit.

---

# When to Run

Run the Review Pipeline when:

- production or source code was modified or created
- a new feature, fix, or refactor was implemented

Skip when:

- only documentation or configuration files changed
- task is exploratory or analysis-only

---

# Agent Roles

## Test Agent

Responsibilities:

- determine required test coverage for changed code (see PROJECT_TESTING_STRATEGY.md)
- write missing tests when required by PROJECT_TESTING_STRATEGY.md
- run the test suite and report results
- do NOT run lint, typecheck, or build — those belong to Quality Gates

Example:

```
Agent({
  description: "Check and run tests",
  prompt: "Review changed files: [list files].
           Determine if tests are required per PROJECT_TESTING_STRATEGY.md.
           Write any missing tests.
           Run pnpm test and report: PASS, FAIL, or NOT CONFIGURED.
           If FAIL: include full error output."
})
```

## Quality Gates

Quality gates verify the full project health after implementation.

Run in order:

```
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

If a command is not configured in package.json — report NOT CONFIGURED, do not skip.

Quality gates may be executed directly by the implementation agent without a dedicated subagent
unless the pipeline requires isolation.

Example:

```
Agent({
  description: "Run quality gates",
  prompt: "Run the following commands in order and report results for each:
           1. pnpm lint
           2. pnpm typecheck
           3. pnpm build
           4. pnpm test
           For each: report PASS, FAIL, or NOT CONFIGURED.
           If FAIL: include full error output.
           Do not fix anything — report only."
})
```

## Review Agent

Responsibilities:

- inspect changed files for correctness
- check alignment with schema, types, architecture, and import rules
- report findings only — must NOT edit files

Must use subagent_type: "Explore" to enforce read-only mode.

Example:

```
Agent({
  description: "Review changed files",
  subagent_type: "Explore",
  prompt: "Review the following changed files: [list files].
           Check:
           1. logic is correct and matches intent
           2. no import boundary violations (see PROJECT_ARCHITECTURE.md)
           3. no unused code or dead branches
           4. types align with schema and interfaces
           Report findings only. Do not edit files."
})
```

---

# Execution Order

1. Run Test Agent (write missing tests, run test suite)
2. Run Quality Gates (lint, typecheck, build, test)
3. Run Review Agent (read-only inspection of changed files)
   — steps 1 and 3 may run in parallel if Test Agent writes no new files
4. Collect results from all stages
5. Fix all reported issues
6. Re-run pipeline if fixes touched production or source code
7. Confirm pipeline status is READY FOR DEVELOPER REVIEW
8. Developer approves → commit

---

# Parallel Execution Example

When Test Agent writes no new files, it may run in parallel with Review Agent:

```
Agent({
  description: "Run tests",
  prompt: "Run pnpm test. Report PASS / FAIL / NOT CONFIGURED.
           On FAIL include full error output. Do not fix anything."
})

Agent({
  description: "Review changed files",
  subagent_type: "Explore",
  prompt: "Review [changed files]. Check logic correctness, import boundaries,
           unused code, and type alignment. Report findings only."
})
```

Both tool calls are sent in a single message to run simultaneously.
Quality Gates (lint, typecheck, build) run separately before or after parallel agents.

---

# Output Requirements

Pipeline results presented to developer must include:

- quality gate results (PASS / FAIL / NOT CONFIGURED per command)
- test results (PASS / FAIL / NOT CONFIGURED)
- review findings (or "No issues found")
- list of files changed
- any issues fixed after pipeline and whether re-run was clean

---

# Pipeline Status

AI must determine and report final pipeline status before proposing a commit:

- **PIPELINE FAILED** — one or more quality gates failed, tests failed, or review found blocking issues
- **PIPELINE PASSED** — all gates pass, tests pass, review has no blocking issues
- **READY FOR DEVELOPER REVIEW** — pipeline passed and AI has no remaining concerns

AI must NOT propose a commit unless pipeline status is **READY FOR DEVELOPER REVIEW**.
