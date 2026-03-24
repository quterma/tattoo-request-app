# AI_PROJECT_BOOTSTRAP.md

Purpose  
Describe how a new project using the AI development framework should be initialized.

Scope  
Defines required project documentation, creation order, and initialization flow.

Audience  
AI agents and developers initializing a project.

---

# Claude Setup

Each project MUST include `.claude/CLAUDE.md`

Steps:

1. Copy `docs/framework/templates/CLAUDE_TEMPLATE.md`
2. Place into `.claude/CLAUDE.md`
3. Adjust only if project requires

CLAUDE.md defines runtime AI behavior and is required for consistent development.

---

# Required Project Documents

The following documents must exist before development begins.

PROJECT_CONTEXT.md  
High-level description of the product and constraints.

PROJECT_ARCHITECTURE.md  
Definition of the system architecture and main structural decisions.

PROJECT_IMPLEMENTATION_PLAN.md  
Step-by-step plan describing how the project will be implemented.

PROJECT_STAGE_LOG.md  
Log of completed implementation steps and current project state.

PROJECT_DECISIONS.md  
Tracks important technical and product decisions.

PROJECT_STRUCTURE.md  
Defines project structure and module boundaries.

PROJECT_BACKLOG.md  
Stores ideas and future improvements (not executed automatically).

---

# Document Creation Order

If project documentation does not yet exist, it MUST be created in the following order:

1. PROJECT_CONTEXT.md
2. PROJECT_ARCHITECTURE.md
3. PROJECT_IMPLEMENTATION_PLAN.md
4. PROJECT_STAGE_LOG.md

Optional early:

- PROJECT_DECISIONS.md
- PROJECT_STRUCTURE.md
- PROJECT_BACKLOG.md

This order ensures that implementation decisions follow defined context and architecture.

---

# AI First Contact Procedure

When an AI agent starts working on a project:

1. Verify that framework documentation exists in `docs/framework/`

2. Verify that project documentation exists in `docs/project/`

3. If required project documents are missing, propose creating them before implementation

4. If project documentation is incomplete or unclear, request clarification

5. MUST read ALL framework and project documentation before starting development

AI is NOT allowed to proceed without full context.

This procedure applies at the beginning of every new session.

---

# Project Initialization (Templates)

### Step 0 — Create project

- Initialize repository
- Set up base tooling

---

### Step 1 — Copy templates

Copy from:
docs/framework/templates/

Create:

- docs/project/PROJECT_CONTEXT.md
- docs/project/PROJECT_ARCHITECTURE.md
- docs/project/PROJECT_DECISIONS.md
- docs/project/PROJECT_IMPLEMENTATION_PLAN.md
- docs/project/PROJECT_BACKLOG.md
- docs/project/PROJECT_STRUCTURE.md
- docs/project/PROJECT_STAGE_LOG.md

---

### Step 2 — Setup Claude

- Copy CLAUDE_TEMPLATE.md → .claude/CLAUDE.md

---

### Step 3 — Fill core docs

Must be completed before development:

- PROJECT_CONTEXT.md
- PROJECT_ARCHITECTURE.md

Optional:

- PROJECT_DECISIONS.md

---

### Step 4 — Validate

### Validation Checklist

AI MUST verify:

- PROJECT_CONTEXT.md clearly defines product, users, scope, and success criteria
- PROJECT_ARCHITECTURE.md clearly defines system structure, main components, and constraints
- PROJECT_IMPLEMENTATION_PLAN.md contains stages with clear order and exit criteria
- PROJECT_STAGE_LOG.md exists and shows current state or initial empty state
- PROJECT_DECISIONS.md exists if important constraints or choices are already known
- PROJECT_STRUCTURE.md exists if architecture depends on explicit module/layer boundaries
- PROJECT_BACKLOG.md exists if future ideas or postponed tasks already exist

AI MUST also verify:

- no contradiction between PROJECT\_\* documents
- architecture does not conflict with implementation plan
- scope does not conflict with backlog or decisions
- missing critical information is explicitly requested before implementation

If any validation check fails:

- stop
- explain what is missing or conflicting
- ask for clarification before implementation

---

# Rule

Do NOT start implementation before completing Steps 1–4
