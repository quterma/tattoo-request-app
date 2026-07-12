Purpose
Store ideas, improvements, and potential extensions of the framework, plus raw AI-workflow
observations collected by META sessions (see AI_WORKFLOW_MASTER.md).

Scope
Contains non-final, exploratory concepts that are not yet part of the framework.
Nothing here is executed without an explicit owner decision.

Audience
Framework author, contributors, and AI agents in META sessions.

---

# Idea Format

Each idea should contain:

Title
Description
Motivation
Possible risks or trade-offs

---

# Ideas

## Explicit dependency direction in project structure

Description: PROJECT_STRUCTURE-type documents must define dependency direction explicitly
(which layers may import which).
Motivation: prevents architecture drift; makes violations lint-enforceable.
Risks/trade-offs: none significant; small documentation overhead.
Status: effectively adopted in this project (PROJECT_STRUCTURE.md Dependency Direction table +
`import/no-internal-modules` at error level) — candidate to formalize in the framework master
copy.

## Implementation plans as executable step sequences

Description: implementation plans must be executable step sequences, not descriptive documents.
Motivation: descriptive plans drift from reality and cannot be verified step by step.
Risks/trade-offs: more upfront planning effort per stage.
Status: effectively adopted in this project via the task-file convention (owner decision
2026-07-13): AI_TASK_PROTOCOL.md — one file per task with Goal / Scope / Workflow /
Acceptance Criteria, executed step by step by an IMPL session.

---

# Workflow Observations (META journal)

Raw observations about the AI-assisted workflow (sessions, task files, models, agents, review
pipeline). Recorded by any session; discussed and resolved in META sessions per
AI_WORKFLOW_MASTER.md. Format: date — observation — status (`open` / `resolved: <where fixed>`).

- 2026-07-12 — Strategy work previously lived in ChatGPT with manual context transfer both ways;
  moved into Claude Code sessions with docs-as-interface (AI_TASK_PROTOCOL.md). — resolved:
  AI_TASK_PROTOCOL.md, STAGE_TASK_TEMPLATE.md, CLAUDE.md (Task Files & Session Types).
- 2026-07-12 — Accumulative per-stage task files were considered and rejected (executor context
  bloat, parallel-session write conflicts); one file per task + `tasks/done/` chosen instead. —
  resolved: AI_TASK_PROTOCOL.md (Task Files, Lifecycle).
- 2026-07-12 — STRAT sessions had no standard kickoff prompt (META and IMPL had one); risk of
  chat-only conclusions and skipped Source-of-Truth reads. — resolved: AI_TASK_PROTOCOL.md
  (STRAT Kickoff Prompt).
- 2026-07-12 — Task lifecycle had no transition owners and no state for cancelled/replaced
  tasks (only "never delete"). — resolved: AI_TASK_PROTOCOL.md (Lifecycle: transition owners,
  `superseded`).
- 2026-07-12 — Task-file naming was ambiguous for sub-stages (`STAGE_6_...` vs `STAGE_6A_...`).
  — resolved: AI_TASK_PROTOCOL.md (Task Files: `<stage>` includes the sub-stage).
- 2026-07-12 — Nothing obliged non-META sessions to record workflow observations, and parallel
  sessions had no rule for shared docs (PROJECT_STAGE_LOG.md, PROJECT_DECISIONS.md) as a write
  conflict point. — resolved: AI_TASK_PROTOCOL.md (Cross-Session Rules).
- 2026-07-12 — AI_WORKFLOW_MASTER.md Mandate 4 referenced a "usage-limit strategy" in Session
  Settings Guidance that did not exist there. — resolved: AI_TASK_PROTOCOL.md (Session Settings
  Guidance: Usage limits bullet).
- 2026-07-12 — No rule says where an IMPL session records out-of-scope findings discovered
  mid-task (presumably PROJECT_BACKLOG.md for product/code, this journal for process); the task
  template says "report risks" but the protocol is silent. — resolved: AI_TASK_PROTOCOL.md
  (Cross-Session Rules: out-of-scope findings bullet).
- 2026-07-13 — STRAT continuity gap: nothing told a STRAT session ending with an unfinished
  topic (long context) to leave a pickup point, or told the next STRAT session what to pick up;
  clean topic close was already covered by the kickoff. Related misconception clarified: forking
  inherits the full parent transcript and does not relieve context pressure. — resolved:
  AI_TASK_PROTOCOL.md (STRAT Continuation section; kickoff prompt continuation lines; Session
  Settings Guidance forking bullet).
- 2026-07-13 — The two-case STRAT ending design (continuation note only when a topic is
  unfinished) was unified into a single unconditional per-stage brief
  (`STAGE_<stage>_STRAT_BRIEF.md`, overwritten each session, committed immediately for git
  traceability, carries the next topic) — removes the finished/unfinished branch and the
  owner's per-session topic-writing duty. — resolved: AI_TASK_PROTOCOL.md (STRAT Next-Session
  Brief; STRAT Kickoff Prompt).
- 2026-07-13 — The brief's "commit immediately after writing" requirement conflicted with the
  commits-only-with-approval principle, and no doc stated that principle universally (incl.
  automated sessions and subagents). — resolved: CLAUDE.md (Workflow: universal manual-approval
  commit rule, no doc may override); AI_TASK_PROTOCOL.md rephrased to "propose the commit
  immediately".
- 2026-07-13 — A tool-less agent's "changes applied" reports were relayed as done, but the
  agent had no write access and the file was untouched; caught only by re-reading the file on
  disk. Lesson: after any reported framework-doc change, verify on disk (read back) before
  treating it as landed. — resolved: re-applied for real in the same pass, with read-back
  confirmation.
- 2026-07-12 — DOCUMENTATION_SYSTEM_RULES.md is stale relative to the newer framework docs: its
  framework-doc examples and conflict-priority list predate AI_TASK_PROTOCOL.md /
  AI_WORKFLOW_MASTER.md, and its scope overlap with AI_DEVELOPMENT_WORKFLOW.md (in-session
  development cycle vs session organization) is not cross-referenced. Master copy lives in a
  separate repository — fix belongs there, local copy follows. — resolved:
  DOCUMENTATION_SYSTEM_RULES.md updated in place (framework-doc list extended with
  AI_TASK_PROTOCOL.md / AI_WORKFLOW_MASTER.md; scope split with AI_DEVELOPMENT_WORKFLOW.md
  cross-referenced; "separate master repository" note corrected — owner decision 2026-07-13:
  no separate framework repo exists yet, docs/framework/ in this repo IS the source of truth).
- 2026-07-13 — Owner question during a Stage 6 STRAT session: does breaking work into sub-topics
  (e.g. an 8-item page-by-page breakdown for a UX blueprint) require writing that breakdown into
  docs (brief/task files) as its own step before discussing the first sub-topic, even when the
  session stays open and can keep going? Owner's view: persisting a plan mid-session is a hedge
  against losing memory or against parallel sessions touching the same scope, not a mandatory
  gate — while the session is live and continuous, discussion can proceed and persistence can
  happen once, at natural checkpoints (e.g. end of session, per the STRAT Next-Session Brief),
  rather than being forced before every sub-topic. Also: persisting/documenting progress should
  not be conflated with closing a session — a session with live memory that isn't actually
  finished should be able to keep going after a persistence step. Current AI_TASK_PROTOCOL.md
  text ("Strategic... sessions must end by persisting outcomes into docs") is arguably already
  consistent with this (persistence gates the *end*, not each internal step) but doesn't say so
  explicitly, which caused the ambiguity in-session. — resolved: AI_TASK_PROTOCOL.md
  (STRAT Next-Session Brief — Mid-session persistence subsection; owner's reading confirmed,
  with an added checkpoint trigger for long-context/summarization risk).
- 2026-07-13 — Same Stage 6 STRAT session: when proposing mobile-navigation options (top bar vs
  hamburger vs bottom tab-bar) for the UX blueprint's navigation sub-topic, the agent proposed
  generic patterns from general knowledge instead of first checking whether the project already
  had an implementation — it did not exist. A working bottom-tab-bar (mobile) / top-sticky-bar
  (`sm:` and up) component already existed at `src/shared/ui/app-nav.tsx`, unrelated to any doc
  the Pre-task Sync or STRAT Kickoff Prompt names (PROJECT_STAGE_LOG.md, PROJECT_CONTEXT.md,
  PROJECT_ARCHITECTURE.md, PROJECT_DECISIONS.md, PRD, FS — none of them mention or point at this
  file). Owner's view: checking existing repo code/decisions before proposing a solution should
  be a default agent behavior, not something that only happens when a kickoff prompt happens to
  name the right doc. Agent's read on the cause: the STRAT Kickoff Prompt's Context list is
  doc-only (Pre-task Sync + PRD/FS), with no step for searching the actual source tree for
  prior art on the specific sub-topic being discussed — so a topic whose implementation exists
  in code but isn't cross-referenced from those docs is invisible until someone thinks to grep
  for it. CLAUDE.md's "Doing tasks" section already says to search for existing
  functions/utilities/patterns before proposing new code, but that framing reads as
  implementation-session guidance and wasn't naturally applied to a STRAT/UX-design discussion
  proposing layout patterns rather than writing code. Possible angles for META to weigh: extend
  the STRAT Context step (or CLAUDE.md's reuse-search rule) to explicitly cover STRAT/design
  discussions, not just implementation; and/or require a quick source-tree check for prior art
  before presenting options on any sub-topic with plausible existing coverage. — resolved:
  AI_TASK_PROTOCOL.md (STRAT Kickoff Prompt: prior-art line — search the repository before
  presenting options on any sub-topic; existing code is strategic context). The `app-nav.tsx`
  existence was verified before fixing.
