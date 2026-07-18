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

**Compaction note (2026-07-15):** resolved entries below are one-to-three-line summaries — problem,
decision, owning doc, key rejected alternative. The full incident narratives live in git history
and in the linked review/research threads (`docs/project/reviews/done/`, `docs/project/research/done/`).
Compacted because the journal is read into every session (Pre-task Sync + META kickoff) and its
token weight is a live cost. `open` entries are never compacted. Keep new entries at this density.

- 2026-07-17 — `PROJECT_STAGE_LOG.md` has grown past the point where a session can read it whole
  (~3,940 lines / >256 KB; the Read tool refuses it, and two sessions in a row — a STRAT and the
  Item 14 IMPL — fell back to reading only the tail). It is a Pre-task Sync doc read at the start of
  **every** session, so its size is a live per-session token cost, and "read only recent entries"
  is an undocumented workaround each session reinvents. Note the same journal already compacted
  itself on 2026-07-15 for exactly this reason (729→237 lines); the stage log has no such discipline
  and is ~16× larger. Options for META: a documented "read the tail + grep for specifics" rule (like
  the PROJECT_DECISIONS.md targeted-read rule already filed), and/or splitting closed stages
  (0–5) into an archive file the way PROJECT_IMPLEMENTATION_PLAN.md's history was flagged. Not
  urgent (sessions cope), but recurring. — open: META to decide compaction/archive/targeted-read.
- 2026-07-15 — A STRAT session and an IMPL session, both live for Task 03, **co-authored the same
  durable docs** (`PROJECT_DECISIONS.md`: STRAT wrote "Stage 6 Contact Model", IMPL added a
  staging-waiver exception; `STAGE_6_TASK_03_*.md`: STRAT unblocked Block C + removed placement-Other,
  IMPL rewrote CO-2 from the review). The owner wanted the reference-code (IMPL) and contact-decision
  (STRAT) work in **separate commits**, but neither shared file can be split by file — the two
  sessions' hunks sit in one file — and intra-file hunk staging (`git add -p`) is **interactive and
  blocked** in this harness. The existing shared-index rule (2026-07-13, `df70cae`) governs *staging
  discipline* (don't stage before approval; name explicit paths) but assumes each file belongs to one
  session; it has no answer for a **co-authored file that must land in two thematically-separate
  commits**. Owner chose a single combined commit this instance (safer than risking a bad split) and
  asked to file this for META. — open: META to decide the protocol — (a) a non-interactive intra-file
  split mechanism (e.g. `git apply --cached` of a hand-built hunk patch) sanctioned for this harness,
  or (b) a rule that co-authored durable docs collapse into one commit with a composite message, or
  (c) a sequencing rule that keeps two live sessions out of the same doc region. CLAUDE.md (Workflow —
  shared-index/staging), AI_TASK_PROTOCOL.md (Cross-Session Rules).
- 2026-07-17 — **The stage board goes stale the moment an IMPL task finishes, and no rule closes the
  gap.** Task 03 closed (`done`, moved to `tasks/done/`, STAGE_LOG entry, Items 3/9 → done+LIVE in
  STAGE_6_IMPLEMENTATION_PLAN.md), but `STAGE_6_STRAT_BRIEF.md` — the *single* file a fresh STRAT
  session reads as its pickup point — still said "Item 3 — task ready … **Next: Run Item 3**". The
  brief may be written **only by that stage's STRAT sessions** (AI_TASK_PROTOCOL — STRAT
  Next-Session Brief), so the IMPL session that produced the change is forbidden from correcting the
  one document that routes the next session; the owner has to carry the delta by hand. This is the
  **completion** direction of the already-open 2026-07-15 escalation entry below (that one is the
  mid-flight direction) — same root: the brief is STRAT-owned but IMPL is what invalidates it. It is
  currently backstopped only by the brief's own "re-verify every assumption against the repo" line,
  i.e. by the next session distrusting its own entry point. Also unresolved by that backstop: a
  `draft` task whose stated precondition has since been met (`TASK_09` — "deferred until Blocks B′/C
  land"; they landed) has nothing that flips it to `ready`, since promotion is STRAT's call. — open:
  META — does the brief get an IMPL-appendable section, a generated board (`pnpm project:status`,
  `TOOLING_TASK_01`), or an explicit "IMPL states the delta, STRAT reconciles" duty? Second sighting
  in three days. AI_TASK_PROTOCOL.md (STRAT Next-Session Brief), CLAUDE.md.
- 2026-07-17 — **An IMPL session cannot see its own context budget, and guessed it wrong in the
  direction that costs work.** Near the end of Task 03 the session told the owner it had "~10%"
  left and recommended handing the remaining live-migration + CO-1 verification to a fresh session;
  the owner's UI showed **33%**, and the work then completed comfortably in-session (migration
  applied+verified, CO-1 e2e across five contact methods and three upload categories, reporting).
  The number was a **guess presented as a measurement** — the same failure class the framework
  already legislates against (AI_TASK_PROTOCOL — "Name the basis of a claim the repo does not own"),
  but applied to the session's own state, which no existing rule covers. Cost of the error is
  asymmetric and real: a needless handoff re-reads the whole task context and risks dropping nuance
  precisely at the live-DB step. **Do not fix this as "cut tasks smaller"** — Task 03 was already
  correctly cut into four reviewed blocks, and the blocks were not the problem. Owner's framing,
  worth preserving: a mid-task **IMPL-decided relay** may be the right primitive (STRAT cannot
  predict exhaustion at planning time, so only the running IMPL session can call it), and some
  phases (mechanical test-fixture updates, doc sweeps) might belong to subagents on cheaper models
  — but any such rule needs a *trustworthy* budget signal first, or it will fire on guesses like
  this one. — open: META — (a) is there a reliable in-session budget signal, and if not, what should
  a session be allowed to *say* about its remaining capacity? (b) if a relay primitive is added,
  what is the handoff artifact (the task file + review threads carried this one fine)?
  AI_TASK_PROTOCOL.md (Session Duties, Session Settings Guidance).
- 2026-07-15 — An IMPL session mid-flight hit a product question it must escalate to STRAT (Task 03
  contact model exceeds FS §4.2) and its plan proposed to carry the escalation by **overwriting
  `STAGE_6_STRAT_BRIEF.md`** (next topic = the amendment) + pinging the owner to run a new STRAT.
  But the brief is a *single* file and the STRAT pickup point: it already pointed at the in-flight
  task, and a live STRAT session (this one, which cut Task 03) was the intended handler — so the
  overwrite would (a) clobber the current brief mid-stage, desyncing the board, and (b) spawn a
  second STRAT stream the owner did not want (parallel-session/limit cost). The brief works as a
  between-STRAT baton but has no defined channel for an **IMPL→STRAT escalation while a STRAT
  session is already open**. Owner routed this instance straight to the open STRAT session by hand
  (copy-paste of the plan's contact question) and had IMPL record its request somewhere other than
  the brief. — open: META to design the IMPL→STRAT escalation channel (where does a mid-flight
  product question land so it neither overwrites the brief nor forces a new STRAT when one is live?).
  STAGE_TASK_TEMPLATE.md, CLAUDE.md (Task Files & Session Types).
- 2026-07-12 — Accumulative per-stage task files rejected (executor context bloat, parallel-write
  conflicts); one file per task + `tasks/done/` chosen. — resolved: AI_TASK_PROTOCOL.md (Task
  Files, Lifecycle).
- 2026-07-12 — STRAT sessions had no standard kickoff (risk of chat-only conclusions, skipped
  Source-of-Truth reads). — resolved: AI_TASK_PROTOCOL.md (STRAT Kickoff Prompt).
- 2026-07-12 — Task lifecycle had no transition owners and no state for cancelled/replaced tasks.
  — resolved: AI_TASK_PROTOCOL.md (Lifecycle: transition owners, `superseded`).
- 2026-07-12 — Task-file naming ambiguous for sub-stages (`STAGE_6_` vs `STAGE_6A_`). — resolved:
  AI_TASK_PROTOCOL.md (Task Files: `<stage>` includes the sub-stage).
- 2026-07-12 — Nothing obliged non-META sessions to record observations; parallel sessions had no
  shared-doc write-conflict rule. — resolved: AI_TASK_PROTOCOL.md (Cross-Session Rules).
- 2026-07-12 — AI_WORKFLOW_MASTER.md Mandate 4 referenced a usage-limit strategy that did not
  exist. — resolved: AI_TASK_PROTOCOL.md (Session Settings Guidance).
- 2026-07-12 — No rule for where an IMPL session records out-of-scope findings. — resolved:
  AI_TASK_PROTOCOL.md (Cross-Session Rules: out-of-scope findings — product/code → PROJECT_BACKLOG,
  process → this journal).
- 2026-07-12 — DOCUMENTATION_SYSTEM_RULES.md stale vs newer framework docs; scope overlap with
  AI_DEVELOPMENT_WORKFLOW.md uncrossreferenced. — resolved: DOCUMENTATION_SYSTEM_RULES.md updated
  in place; owner decision — no separate framework repo yet, `docs/framework/` IS the source of
  truth.
- 2026-07-13 — STRAT continuity gap: no pickup point for an unfinished topic. Also clarified:
  forking inherits the full parent transcript and does not relieve context pressure. — resolved:
  AI_TASK_PROTOCOL.md (STRAT Continuation; forking bullet).
- 2026-07-13 — Two-case STRAT ending unified into a single per-stage brief
  (`STAGE_<stage>_STRAT_BRIEF.md`, overwritten each session, committed for traceability). —
  resolved: AI_TASK_PROTOCOL.md (STRAT Next-Session Brief).
- 2026-07-13 — "Commit immediately after writing the brief" conflicted with commits-only-with-
  approval, and that principle was not stated universally. — resolved: CLAUDE.md (Workflow:
  universal manual-approval commit rule, no doc may override); protocol rephrased to "propose".
- 2026-07-13 — A tool-less agent reported "changes applied" but had no write access; caught by
  re-reading the file. Lesson: after any reported framework-doc change, read it back on disk. —
  resolved: re-applied with read-back confirmation.
- 2026-07-13 — Owner Q: does breaking work into sub-topics require persisting the breakdown before
  discussing the first, even mid-session? Owner's view: persistence gates the session END, not
  each step; a live session may proceed and persist at checkpoints. — resolved: AI_TASK_PROTOCOL.md
  (Mid-session persistence).
- 2026-07-13 — Agent proposed generic mobile-nav patterns from general knowledge without checking
  that a working `app-nav.tsx` already existed. — resolved: AI_TASK_PROTOCOL.md (STRAT Kickoff:
  search the repo for prior art before presenting options; existing code is strategic context).
- 2026-07-13 — A second review request while one was `awaiting-review` had no protocol state; a
  session improvised a `queued` status. — resolved: AI_CROSS_REVIEW.md (`queued` formalized;
  promotion duty; one review per ping) + AGENTS.md.
- 2026-07-13 — A review whose findings were accepted but execution postponed had no home; threads
  carried no record of who opened them. — resolved: AI_CROSS_REVIEW.md (`Requested by:` field;
  Deferred execution — consensus settles the review, deferred work becomes a `draft` task or
  backlog entry pointing back; queue promotion may be owner-prioritized; anti-rot reporting).
- 2026-07-13 — Full adversarial Codex audit of the framework: 8 findings (2 blockers), all fixed.
  Root cause: the framework grew reactively and hard rules/template/cross-refs lagged. Fixes:
  Codex per-task Allowed Write Surface; commit approval bound to the staged set; task template
  rewritten with real lifecycle; delegation baseline check restored; review-queue invariant +
  recovery actor; gate-defining config no longer skips the pipeline; observation/backlog routing
  differs by executor; `Reviewer: external` vs Codex disambiguated. — resolved: AGENTS.md,
  CLAUDE.md, AI_TASK_PROTOCOL.md, AI_CROSS_REVIEW.md, AI_REVIEW_PIPELINE.md, AI_DEVELOPMENT_*.md,
  STAGE_TASK_TEMPLATE.md. Thread: `reviews/done/REVIEW_2026-07-13_framework-process-audit.md`.
- 2026-07-13 — Parallel sessions share one git index; one session's commit silently swept up
  another's staged files (commit `df70cae`). — resolved: CLAUDE.md (Workflow) + AI_TASK_PROTOCOL.md
  (Cross-Session Rules). Exposure window **removed, not guarded**: do not stage before approval;
  propose from the working tree, then `git add <explicit paths> && git commit` in one step; never
  `git add -A`/`.`; re-check `git diff --cached --stat` before committing. Per-session worktrees
  considered and rejected (infrastructure cost the owner does not want yet); a bare "check before
  committing" rule rejected as insufficient (it existed, fired twice, still failed — silent by
  construction).
- 2026-07-13 — A STRAT session wrote an unverified world-state claim ("Item 1 runs in parallel")
  into durable docs; it survived three commits (corrected `818f914`). Distinct from the
  conversation-claim rule: this is observable, verifiable state written from memory. — resolved:
  AI_TASK_PROTOCOL.md — Session Duties, "Verify state claims against the repository before writing
  them" (lookup table per claim type; task `Status` is the source of truth, narrative docs point at
  it, never restate; a relayed report is a claim, not a fact — verify or attribute).
- 2026-07-13 — An IMPL session silently substituted a CTA label (shipped off-spec copy, authored a
  new i18n key) and wrote "flagged and approved in-plan" when the plan flagged nothing; caught only
  by the independent Codex review, not the in-session pipeline (which compares the diff to the task
  file, so a deviation baked into the plan is invisible). — resolved: AI_TASK_PROTOCOL.md — IMPL
  Session Duties + STAGE_TASK_TEMPLATE.md (Workflow step 4): every plan carries a distinct
  "Deviations from the task file" section (or "no deviations"); durable docs may not assert
  unverifiable claims about a conversation.
- 2026-07-13 — The owner can approve a plan unread, and the process had one enforcement point
  (owner approval) with no fallback. — resolved (2026-07-14): AI_TASK_PROTOCOL.md (Session Duties —
  plan-deviation lines must cite where the requirement is specified). Task-file-only deviations are
  approvable in-plan; a deviation from a PRD/FS-named requirement is not — it routes through the
  existing STOP/escalate rule. A mandatory Codex plan pre-check was **rejected**: Codex cannot read
  a chat plan without new persistence machinery, and the round-trip costs more owner time than
  reading the one-line section.
- 2026-07-13 — Nobody owned the post-review fix loop, so it defaulted to a STRAT session doing IMPL
  work. — resolved: AI_TASK_PROTOCOL.md (Post-Review Fix Loop): the IMPL session that built the
  block owns the whole loop (handoff → Response → fixes → gates → commit → consensus) and stays open
  until consensus. STRAT does not participate; no final STRAT sign-off (it would be a rubber stamp).
- 2026-07-13 — Owner asked whether Codex should take token-heavy low-judgment work off Claude. —
  resolved: writing tests is a normal case of the existing delegation mechanism, no role-scope
  change. The real win: Claude's expensive step is triaging gate failures, not running gates — so
  Codex must iterate its own lint/typecheck/test to a clean pass (or a precise unresolved report)
  before handoff; Claude's final full `pnpm qg` stays mandatory. — AI_TASK_PROTOCOL.md (Delegating
  IMPL Tasks to Codex) + AGENTS.md.
- 2026-07-14 — An IMPL session ran the in-session pipeline green and headed for a commit without
  ever opening an independent review thread; caught only by an owner nudge. Root cause: **no
  document said when a cross-review is required at all** — the protocol/template said "*when*/*if* a
  review is run", so the decision belonged to nobody. — resolved: AI_TASK_PROTOCOL.md (new
  "Independent Review Is Mandatory"), AI_REVIEW_PIPELINE.md (Execution Order step 8; Pipeline
  Status), STAGE_TASK_TEMPLATE.md. The cross-review is now a **gate**: every source-changing IMPL
  block opens a thread before a commit is proposed; `READY FOR DEVELOPER REVIEW` no longer licenses
  a code commit — that arrives at **consensus**. Blanket default over a risk threshold because a
  threshold is a judgment made where this check just failed; revisit if Codex becomes costly or the
  slot blocks.
- 2026-07-14 — `pnpm qg` re-run cost measured (lint 7.7s / typecheck 2.6s / test 26.4s / build
  14.1s ≈ 51s, ~74 lines). A green run is nearly free; the expensive run is a red one (which is the
  gate's whole point). Only the re-run after a *durable-doc* update was wasted — the re-arm rule
  said "any file change" and overrode the "skip docs-only" line. — resolved: AI_REVIEW_PIPELINE.md
  (re-arm scoped to source/tests/gate-config; durable docs do not re-arm) + STAGE_TASK_TEMPLATE.md.
  Re-runs after code fixes (incl. post-review fixes) stay mandatory.
- 2026-07-14 — No protocol for asking an independent AI to *research an open question*; the only
  mechanism was the review thread (reviews finished work). Triggered by the Item 1 review finding
  the 10 MB limit undeliverable through Vercel, making client-side compression an open question. —
  resolved: AI_CROSS_REVIEW.md (new "Research Threads") + AGENTS.md (researcher role,
  `docs/project/research/` write surface). A separate lightweight thread type
  (`RESEARCH_<date>_<slug>.md`, statuses `awaiting-research`/`awaiting-external`/`awaiting-owner`/
  `closed`, turns Question → Findings → Response → Outcome); it does NOT occupy the review slot;
  Codex is researcher (not `external` — that only worsens the channel). Codex may/must delegate
  outward for current external facts via an owner-carried `.request.md`/`.answer.md`, but stays the
  owner of the answer and labels provenance (repo-verified / model-knowledge / external-unverified).
  A research thread never decides — it closes only by landing its `## Outcome` in a durable doc.
- 2026-07-14 — Nothing triggers recognition that something is an *open question* vs a task; and
  nothing shows what is open right now. Researched:
  `research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`. — resolved:
  (Q1) AI_TASK_PROTOCOL.md — Session Duties, "Name the basis of a claim the repo does not own": a
  claim about a system nobody here owns (platform limits, browser/library behavior, pricing) must
  name its basis (owner policy / repo evidence / dated external evidence / else → open a research
  thread); trigger is the class of claim, not confidence. Backstopped by the mandatory review's
  external-boundary check (AI_CROSS_REVIEW.md). Both, because the 10 MB number entered via a
  docs-only change that skips the code pipeline. (Q2) build `pnpm project:status`
  (`tasks/TOOLING_TASK_01`, `draft`): read-only, filesystem-derived, prints integrity warnings,
  writes nothing; a persisted/generated status file was rejected (rots like the hand-written ones).
  (Bug) `STAGE_6_TASK_08` was undelegatable by construction (baseline hash the file could never
  equal) — the baseline is now derived (`git log -1 -- <task file>`), never typed; found by a
  machine check after four human/AI passes missed it.
- 2026-07-14 — An IMPL session can leave mandatory follow-ups (apply a migration, set a secret, run
  a live verification) that get written into the log but that nothing obliges anyone to do. Item 1
  shipped green while the live DB was broken (unapplied migration), a required secret was unset, and
  a mandated E2E check was unrun — all recorded, all would have been missed. Researched:
  `research/done/RESEARCH_2026-07-14_deferred-actions-and-review-granularity.md`. — resolved:
  AI_TASK_PROTOCOL.md (new "Completion Obligations") + STAGE_TASK_TEMPLATE.md + CLAUDE.md. A task
  may not go `done` while a completion obligation exists only as prose — each needs completion
  evidence or a pointer to a work item created before the task closes; qualification is objective
  (named basis + a claim that can't honestly be made until done + no evidence it was); close-out is
  a fixed reconciliation against four sources, not "remember what you left undone". Blocking is a
  `Blocks:` field on the follow-up task; `OPEN_ACTIONS.md` and a parsed `⛔` prose marker rejected
  (stale-dashboard design). STRAT's duty keys on canonical work naming a task as blocked, not on
  re-reading prose.
- 2026-07-14 — One IMPL task became one 60-file commit reviewed once at the end; both blockers found
  were design defects in the core, already built upon. Same research thread. — resolved:
  AI_TASK_PROTOCOL.md (new "A Large Task Is Reviewed in Checkpoints") + STAGE_TASK_TEMPLATE.md
  (Review Granularity). Correction that reframed it: committing at seams is NOT cheap (every commit
  needs its own owner approval; every source block its own review to consensus), so commit
  granularity and review granularity are separate decisions and only the second fixes late feedback.
  Over the size trigger (16 execution-affecting files or 500 churn — a **trial** number calibrated on
  one positive case, recalibrate after firings) a task is built/reviewed as a few checkpointed blocks
  (prefer two), risk nucleus first. STRAT owns the task boundary; IMPL owns the seams; collapsing a
  required checkpoint is a deviation.
- 2026-07-14 — The thread header had no defined format; a Codex research turn searched for a bare
  `Status:` and matched nothing against a backticked header (should have halted; recovered by
  reading by eye). The format had already drifted (8 backticked, 1 bare). — resolved:
  AI_CROSS_REVIEW.md (Header format — a machine-read contract: canonical form backticked, readers
  accept both, trailing text ignored, no improvised status values) + AGENTS.md + TOOLING_TASK_01
  parser requirement.
- 2026-07-15 — External audit (owner relayed 10 Perplexity questions, blind; answered repo-aware by
  Codex) confirmed the process is being optimized harder than the product — ~3.4:1 process/docs vs
  product commits, framework ~70% of runtime-source size in two days. It also caught three live
  desyncs left by this week's own framework commits (a not-yet-built `project:status` in present
  tense; a half-corrected baseline in TASK_08; a lifecycle summary omitting the consensus gate). —
  resolved: `research/done/RESEARCH_2026-07-15_external-framework-audit.md`. AI_WORKFLOW_MASTER.md
  gained a **"What to fix now vs. defer"** bar; the three desyncs were fixed immediately; the
  journal was compacted (this file). Consolidation of the older `AI_DEVELOPMENT_*` layer and inline
  narratives is filed as `META_TASK_01_framework_consolidation.md` (`draft`) for a fresh session —
  deferred because it is polish touching an unedited layer, not a live defect. Owner's steering
  (2026-07-15): fix live orchestration defects and desyncs **immediately** (tech-debt here slows
  development more than fixing it); defer only tidiness; for docs the test is "does it get in the
  way now (confusion / findability / context-token weight)", not length.
