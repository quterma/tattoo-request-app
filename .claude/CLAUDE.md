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

- Re-read docs/project/PROJECT_STAGE_LOG.md
- Re-read docs/project/PROJECT_CONTEXT.md
- Re-read docs/project/PROJECT_ARCHITECTURE.md
- Re-read docs/project/PROJECT_DECISIONS.md (if needed)

Confirm understanding in 3–5 lines before proceeding.

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
- Propose commit only after pipeline status is READY FOR DEVELOPER REVIEW
- Create commit after developer approval

---

## Pre-Commit Checklist (MANDATORY)

Before every commit, verify:

### Review Pipeline (when source code changed)

Run all three stages in order — see AI_REVIEW_PIPELINE.md:

1. Test Agent — determine coverage per PROJECT_TESTING_STRATEGY.md, write missing tests, run pnpm test
2. Quality Gates — run in order: pnpm lint / pnpm typecheck / pnpm build / pnpm test
   Report PASS / FAIL / NOT CONFIGURED for each. Do not skip.
3. Review Agent — subagent_type: "Explore", read-only inspection of changed files

Re-run pipeline if any fix touches source code.
Do NOT propose commit unless pipeline status is READY FOR DEVELOPER REVIEW.

### Architecture

- Follows PROJECT_ARCHITECTURE.md
- No forbidden imports
- No cross-layer violations (see PROJECT_STRUCTURE.md)

### Scope

- Only current TODO implemented

### Structure

- Files in correct layers
- Public API imports only (index.ts) where module exposes one

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
