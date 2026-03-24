# AI_DEVELOPMENT_WORKFLOW.md

Purpose  
Define the operational workflow AI agents must follow when implementing changes in a project.

Scope  
This document describes the development process AI agents must follow when analyzing tasks, implementing changes, preparing commits, and interacting with the developer.

Audience  
AI agents performing implementation tasks and developers supervising the development process.

---

# Development Cycle

AI development follows a structured cycle:

1 Analyze documentation
2 Propose change (when required)
3 Define change intent
4 Implement change
5 Perform self-check
6 Prepare commit
7 Developer review

This cycle must be followed for all implementation tasks.

---

# Step 1 — Analyze Documentation

Before starting work, AI must read and understand the project documentation.

Required sources:

docs/framework/_  
docs/project/_

The goal is to understand:

- project architecture
- development rules
- project constraints
- implementation plans

If documentation is ambiguous, conflicting, or incomplete, AI must request clarification before proceeding.

AI must not infer missing requirements or product behavior.

---

# Step 2 — Propose Change

For complex or potentially impactful changes, AI must first propose a change.

A proposal should include:

- description of the change
- affected files or modules
- reasoning for the change
- potential risks or trade-offs

Examples of changes that require a proposal:

- architectural modifications
- large refactors
- dependency additions
- structural changes

Simple or localized fixes may proceed directly to implementation.

---

# Step 3 — Define Change Intent

Before implementing changes, AI must define the change intent.

The intent should include:

- Goal
- Scope
- Non-Goals
- Risks

The implementation must stay within this scope.

If additional changes become necessary,
AI must update the intent and request approval.

---

# Step 4 — Implement Change

AI implements the approved or safe change.

During implementation, AI must:

- follow project architecture
- respect framework rules
- avoid unrelated modifications
- maintain code clarity and consistency

Changes should remain focused on the intended task.

---

# Step 5 — Self-Check

Before preparing a commit, AI must verify the change.

Self-check should include:

- compliance with AI development rules
- respect for architectural boundaries
- absence of unnecessary modifications
- consistency with project documentation
- project builds successfully
- no lint or type errors
- tests pass (if tests exist)

If problems are detected, AI must correct them before proceeding.
If correction requires architectural changes or developer decisions,
AI must stop and request clarification.

---

# Step 6 — Prepare Commit

AI prepares a commit for developer review.

Commit preparation includes:

- summary of the change
- list of modified files
- explanation of the reasoning behind the change

Commits should be:

- small and focused
- logically grouped
- clearly described

Large or unrelated changes must not be bundled into a single commit.

---

# Step 7 — Developer Review

The developer reviews the proposed commit.

The review ensures:

- correctness of implementation
- compliance with architecture and rules
- appropriate scope of changes

The commit is finalized only after developer approval.

---

# Handling Uncertainty

AI must stop and request clarification when:

- documentation is unclear or incomplete
- rules appear to conflict
- architectural decisions are required
- large refactors are considered
- project structure may be affected

When uncertainty exists, AI must ask rather than assume.

---

# General Principle

AI should prioritize clarity, safety, and alignment with documentation over speed of implementation.

---

# Architecture Gate

AI is NOT allowed to start implementation if:

- PROJECT_CONTEXT.md is incomplete
- PROJECT_ARCHITECTURE.md is missing or unclear

In such case AI MUST request clarification.
