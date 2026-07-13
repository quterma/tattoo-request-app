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
- 2026-07-13 — A second review request created while another thread was `awaiting-review` had
  no protocol-defined state: the creating STRAT session improvised a `queued` status with an
  in-file workaround note, and Codex (correctly) could not see the thread. — resolved:
  AI_CROSS_REVIEW.md (`queued` status formalized; promotion duty on whoever closes the active
  thread; queue-size reporting to the owner; one thread per ping) + AGENTS.md (queued threads
  are parked; exactly one review per owner ping).
- 2026-07-13 — A review whose findings were accepted but whose *execution* was postponed had no
  home: leaving the thread open would block the single review slot and hide the work from the
  places the owner actually looks, while closing it risked losing the accepted work. Also, threads
  carried no record of which session opened them, so a later reader could not tell who to return
  to. — resolved: AI_CROSS_REVIEW.md — `Requested by:` header field; "Deferred execution" section
  (consensus settles the *review*, not the work — deferred work is filed as a `draft` task file or
  a PROJECT_BACKLOG.md entry pointing back at the thread, and the thread closes so the slot frees);
  queue promotion may be owner-prioritized rather than strictly oldest-first (work blocking an
  active session outranks analysis that can wait); anti-rot — any session reporting the queue also
  reports open deferred items.
- 2026-07-13 — Full adversarial audit of the process framework by Codex (thread:
  `reviews/done/REVIEW_2026-07-13_framework-process-audit.md`) found 8 findings, incl. 2
  blockers, all accepted and fixed. Root cause across most of them: the framework grew
  reactively over two days — each change locally correct, but hard rules, the task template,
  and cross-doc references did not keep up, so several accepted decisions were never actually
  filed anywhere enforceable. Fixed: (1) Codex's executor role had no source-code write
  authority at all — the AGENTS.md hard rule allowed only the task file itself, contradicting
  the delegation protocol; now an explicit per-task Allowed Write Surface. (2) Commit approval
  was not bound to the staged set — the git index is shared, so a parallel session could stage
  into an approved-but-not-yet-run commit; now approval is void if the staged set changed, with
  a mandatory pre-commit re-check. (3) The task template could not represent the real lifecycle
  (no `awaiting-claude-review`/`superseded`/Executor/Write Surface) and demanded a
  self-referential commit hash; rewritten with execution metadata and Claude/Codex reporting
  branches. (4) Delegation lost its accepted baseline/ownership precondition; restored as a
  startup check. (5) The review queue's "active" invariant counted only `awaiting-review`
  (allowing two live dialogues) and had no recovery actor for an orphaned queue; both fixed.
  (6) "Config-only changes skip the pipeline" let gate-defining config (eslint/tsconfig/deps)
  through unvalidated, and post-pipeline fixes required no re-run; both closed. (7) Universal
  observation/backlog write duties conflicted with a delegated Codex task's bounded write
  surface; routing now differs by executor. (8) "External reviewer" was used for Codex,
  colliding with the distinct `Reviewer: external` role. — resolved: AGENTS.md, CLAUDE.md,
  AI_TASK_PROTOCOL.md, AI_CROSS_REVIEW.md, AI_REVIEW_PIPELINE.md, AI_DEVELOPMENT_WORKFLOW.md,
  AI_DEVELOPMENT_RULES.md, templates/STAGE_TASK_TEMPLATE.md.
- 2026-07-13 — Owner request for META to weigh, raised in a Stage 6 STRAT session (Claude Code
  usage was burning through the session's token/usage budget fast, partly attributed to running
  Fable for extended stretches): **should Codex take on some token-heavy, low-judgment work**,
  beyond its current strictly-read-only reviewer role (AGENTS.md), to reduce Claude Code's load
  — with Claude Code retaining control/review? Two candidates discussed in-session, not decided:
  (a) **running `pnpm qg` (lint/typecheck/test/build) and reporting PASS/FAIL + output** —
  argued as safe because it's deterministic/mechanical (no judgment call, nothing to get wrong
  quality-wise) and already fits Codex's read-only constraint (running gates changes nothing on
  disk); the expensive part today is Claude Code executing the run and parsing/carrying long
  log output in its own context, which delegating would genuinely offload; (b) **writing missing
  tests** — flagged as a real judgment call (what to cover), so it would need Claude Code/owner
  review of the diff either way, AND it requires Codex to gain write access to `src/` (currently
  AGENTS.md restricts Codex to `docs/project/reviews/` only) — a role-scope change, not just a
  workflow choice. Owner's ask: think about whether/how to extend Codex's role for genuine
  usage-budget relief without a quality regression — which tasks are safe to hand off
  mechanically vs. which still need a judgment-capable reviewer in the loop, and whether (b)'s
  write-access expansion is worth it or better left alone. — resolved: (a) rejected as a
  separate mechanism — Codex running `pnpm qg` and reporting PASS/FAIL was already superseded
  by the stronger rule adopted for (b); (b) is not actually a role-scope question — writing
  tests is a normal case of the already-approved "Delegating IMPL Tasks to Codex" mechanism
  when the specific test task meets its eligibility bar (deterministic/local/reversible/
  decision-free), no separate write-access grant needed beyond what delegation already gives.
  The real budget win identified: Claude's expensive step is triaging raw lint/typecheck/test
  failures, not running the gates — so AI_TASK_PROTOCOL.md (Delegating IMPL Tasks to Codex)
  and AGENTS.md (Executing a delegated task) now require Codex to iterate its own
  lint/typecheck/test loop to a clean pass (or a precisely reported unresolved failure) before
  handing back, while Claude's final full `pnpm qg` re-run stays mandatory and unconditional —
  quality control is unchanged, only the debugging labor shifts.
