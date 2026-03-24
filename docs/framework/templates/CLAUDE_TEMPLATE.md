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

Before any non-trivial task:

- Re-read docs/project/PROJECT_STAGE_LOG.md
- Re-read docs/project/PROJECT_CONTEXT.md
- Re-read docs/project/PROJECT_ARCHITECTURE.md
- Re-read docs/project/PROJECT_DECISIONS.md (if needed)

Confirm understanding in 3–5 lines.

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
- Propose commit
- Create commit

---

## Pre-Commit Checklist (MANDATORY)

Before every commit, verify:

### Architecture

- Follows PROJECT_ARCHITECTURE.md
- No forbidden imports
- No cross-layer violations

### Scope

- Only current TODO implemented

### Code

- Required project checks pass
- Tests follow PROJECT_TESTING_STRATEGY.md (if applicable)
- No unnecessary dependencies

### Structure

- Files in correct layers
- Only public API imports if project uses public API pattern

### Docs

- Structure changed → update PROJECT_STRUCTURE.md
- Decision changed → update PROJECT_DECISIONS.md
- Progress changed → update PROJECT_STAGE_LOG.md

### Security

- No secrets or .env committed

If any check fails → fix BEFORE commit

---

## Backlog Awareness

Do NOT implement ideas from PROJECT_BACKLOG.md  
unless explicitly requested

## Backlog Priority Handling

If backlog items are used:

- P0 → allowed only if explicitly requested
- P1/P2 → never implement without approval

---

## Framework Usage

Read docs/framework during session initialization.  
After initialization, re-read framework docs only if:

- task is about process / workflow
- rules are unclear
- framework docs are explicitly referenced

---

## Framework Rules (DO NOT MODIFY UNLESS PROJECT REQUIRES)

### Safety

- Ask before non-trivial structural change
- Ask before new dependency
- Ask before large refactor

### Test Placement

- Tests should live near code unless project docs say otherwise

---

## Project-Specific Rules (FILL HERE IF NEEDED)

Replace or extend this section only for project-specific stack and conventions.

Examples:

- Default language (e.g. Russian / English)
- Response style (short / detailed)
- Package manager rules
- Import policy
- Test file naming
- Lint/typecheck/build commands
- File structure update command
- Stack-specific constraints
