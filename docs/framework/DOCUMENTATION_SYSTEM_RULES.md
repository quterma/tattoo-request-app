# DOCUMENTATION_SYSTEM_RULES.md

Purpose  
Define the rules for creating, structuring and maintaining documentation used in AI-assisted development.

Scope  
These rules apply to all documentation inside the `docs/` directory.

Audience  
AI agents and developers working on the project.

---

## Document Roles

Each document type has a strict responsibility:

### PROJECT\_\* (project docs)

Define WHAT to build:

- product
- architecture
- constraints
- decisions

These are the Source of Truth.

---

### CLAUDE.md

Defines HOW AI behaves:

- workflow
- rules
- safety
- execution constraints

Must follow PROJECT\_\* docs.

---

### PROJECT_BACKLOG.md

Stores ideas and future improvements:

- NOT part of current implementation
- NOT executed automatically

---

### FRAMEWORK (docs/framework)

Defines HOW the system works:

- templates
- bootstrap
- meta-rules

Reusable across projects.

---

## Rule

Do NOT mix responsibilities between document types.

---

# Core Principles

1. Minimal and actionable documentation  
   Documentation must be concise and focused on practical use.

2. One document — one scope  
   Each document must have a clearly defined purpose and must not mix unrelated topics.

3. No duplication  
   Information must exist in only one document.  
   Other documents should reference it instead of repeating it.

4. Follow the defined documentation structure

5. Documentation guides development  
   AI agents must follow documented rules instead of making assumptions.

---

# Document Header Requirement

Every document must begin with the following header:

Purpose  
Short description of why the document exists.

Scope  
What topics the document covers and what it does not cover.

Audience  
Who should use this document.

Example:

Purpose  
Describe project architecture.

Scope  
Folder structure, architectural boundaries and module responsibilities.

Audience  
AI agent and developer.

---

# Documentation Layers

Documentation is divided into two layers.

Framework documentation  
General rules for AI-assisted development.  
Reusable across projects.

Project documentation  
Documents describing a specific project implementation.

Directory structure:
docs/framework/
docs/project/

---

# Document Types

Framework documents define global development rules.

Examples:

- AI_DEVELOPMENT_RULES.md
- AI_DEVELOPMENT_WORKFLOW.md
- AI_PROJECT_BOOTSTRAP.md
- AI_FRAMEWORK_IDEAS.md

Project documents describe the specific application.

Examples:

- PROJECT_CONTEXT.md
- PROJECT_ARCHITECTURE.md
- PROJECT_IMPLEMENTATION_PLAN.md
- PROJECT_CONVENTIONS.md
- PROJECT_STAGE_LOG.md
- PROJECT_DECISIONS.md
- PROJECT_STRUCTURE.md
- PROJECT_TESTING_STRATEGY.md

---

# Conflict Resolution and Source of Truth

When sources conflict, the following priority applies:

1 Developer
2 Project architecture
3 Framework rules
4 Project context
5 Codebase
6 Implementation plan

Within framework documentation:

- AI_DEVELOPMENT_RULES.md has priority over AI_DEVELOPMENT_WORKFLOW.md

AI must first attempt to resolve conflicts using this hierarchy.

If the conflict cannot be resolved using this order,
AI must request developer clarification.

---

# Modifying Documentation

Framework documents should be treated as read-only during normal development.

AI may propose edits, but such changes must not be applied without developer approval.

---

# Documentation Discipline

To prevent documentation drift:

- documents must remain concise
- documents must not drift outside their defined scope
- ideas and improvements must be stored in `AI_FRAMEWORK_IDEAS.md`

---

#

Architecture documents must describe system behavior and interactions,
not implementation details or file structure.

---

# Notes for Developers

The framework documentation is maintained as a master copy in a separate repository.

Each project contains a local copy in: docs/framework/

Project-specific documentation lives in: docs/project/

---

## Consistency Rule

All changes must:

- Follow PROJECT_ARCHITECTURE.md
- Update PROJECT_STRUCTURE.md if structure changes
- Update PROJECT_DECISIONS.md if behavior or approach changes

---

# Claude Requirement

Each project MUST include `.claude/CLAUDE.md` created from CLAUDE_TEMPLATE.md.

This file defines runtime AI behavior and is mandatory.
