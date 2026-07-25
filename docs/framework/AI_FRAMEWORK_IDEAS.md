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

- 2026-07-17 — **Context weight is ONE question, currently split across three items — do not solve
  them separately.** Handed to META by the AIENG Scout (`research/done/RESEARCH_2026-07-16_agentic-
  engineering-practices-scan.md`, Outcome items 5+6; owner approved). Measured: `PROJECT_STAGE_LOG.md`
  is **71% of the mandatory per-session read** (3,942 lines), or 79% of the extended bundle together
  with `PROJECT_DECISIONS.md`; `AI_TASK_PROTOCOL.md` (617 lines) is read in full by every session. By
  `AI_WORKFLOW_MASTER.md` this is a candidate **fix-now** ("a bloated always-read file is a live
  cost, not an aesthetic one"). The three strands that must be judged together: **(a)** the stage
  log's size (see the entry below, which is the same problem seen from a session's side); **(b)**
  `META_TASK_01_framework_consolidation.md` (`draft`) — deleting duplication across framework docs;
  **(c)** on-demand loading of the always-read protocol, sharpened by an owner-supplied transcript
  (Matt Pocock's public skills repo): 38 skills cost ~660 tokens *because they load on invocation*
  rather than sitting always-read. Note the transcript's main value was **validation, not novelty** —
  it independently arrived at three rules this project already has in stronger form (disposable
  sessions + docs-as-interface ≥ "clear context between tickets"; one task file = one context window;
  fresh-context review because an author over-praises its own code). **The open question is only the
  loading mechanism**, and it is genuinely two-sided: the benefit is real (660 tokens vs. a 617-line
  always-read file), but the Scout rejected a skills layer for a still-standing reason — it adds a
  *third* instruction format beside `CLAUDE.md`/`AGENTS.md` exactly while META_TASK_01 is open on
  *removing* duplication. — **SPLIT 2026-07-17** after a design review
  (`reviews/done/REVIEW_2026-07-17_impl-brief-channel.md`, round 2, finding 3): bundling all three
  was wrong — it would have frozen a small, independently-fixable defect behind a large deferred
  task. `META_TASK_01` explicitly cannot absorb a rule-meaning change (its goal is meaning-preserving
  deletion), so the stage-log fix could not have ridden along anyway. **This entry now covers (b)+(c)
  only** — framework-doc deduplication and the on-demand/skills loading question, which do interact
  and must still be judged together. Strand (a) stands alone in the entry below. — open: META to
  judge (b)+(c) together, and **never** to adopt an on-demand/skills format as a standalone novelty.
  Model-tier routing is **closed** on evidence from the same Scout thread (Findings 2 / Response 2).
- 2026-07-17 — `PROJECT_STAGE_LOG.md` has grown past the point where a session can read it whole
  (~3,940 lines / >256 KB; the Read tool refuses it, and two sessions in a row — a STRAT and the
  Item 14 IMPL — fell back to reading only the tail). It is a Pre-task Sync doc read at the start of
  **every** session, so its size is a live per-session token cost, and "read only recent entries"
  is an undocumented workaround each session reinvents. Note the same journal already compacted
  itself on 2026-07-15 for exactly this reason (729→237 lines); the stage log has no such discipline
  and is ~16× larger. Options for META: a documented "read the tail + grep for specifics" rule (like
  the PROJECT_DECISIONS.md targeted-read rule already filed), and/or splitting closed stages
  (0–5) into an archive file the way PROJECT_IMPLEMENTATION_PLAN.md's history was flagged. Not
  urgent (sessions cope), but recurring. — open: **stands alone as of 2026-07-17** (split out of the
  bundled context-weight entry above, per `reviews/done/REVIEW_2026-07-17_impl-brief-channel.md`
  round 2, finding 3 — it does not depend on META_TASK_01 or on the skills question and must not
  wait for them). Re-measured 2026-07-17: **4,158 lines**, of which `## Log Entries` history is
  ~3,533 and the current-state section only ~624 — i.e. ~85% of the file is closed history that
  `.claude/CLAUDE.md` nonetheless tells every session to re-read. **Named minimum fix, ready to
  apply:** change Pre-task Sync to read the `## Current Stage` section and to search `## Log Entries`
  only when a task needs historical detail. One rule edit, no archive file, no new format, no owner
  round-trip. Deliberately not applied in the 2026-07-17 commit because it changes what *every*
  session loads and deserves its own scoped pass rather than riding along with an unrelated reversal.
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
  **Recurrence (2026-07-18):** a THIRD instance — Item 8's (Codex) `en.json` split was swept into
  Item 4's (IMPL) commit `94ef19b` while both ran live. Content-safe, documented, no rewrite (owner
  call), but the pattern is now `df70cae` → `da6861f` → `94ef19b`. The owner explicitly asked whether
  **per-session git branches / worktrees** should be adopted so sessions never share a working tree
  or index. STRAT's assessment (recorded for META, not decided): branches trade index-collisions for
  **doc merge-conflicts** (STRAT/IMPL both write PROJECT_* docs), so they are not a clean win at this
  project's tiny concurrency (usually 1 STRAT + 1 IMPL + occasional Codex) — sequencing is currently
  cheaper. But three misattributions in one stage is a real signal. META should weigh: at what
  concurrency does worktree isolation (the harness has an EnterWorktree tool) beat sequencing, and
  is there a doc-merge discipline that makes branches viable. **Priority: MINOR / not urgent** — every
  instance so far was content-safe and caught; revisit if an instance ever loses or corrupts content.
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
  in three days. AI_TASK_PROTOCOL.md (STRAT Next-Session Brief), CLAUDE.md. — resolved 2026-07-17,
  **together with the 2026-07-15 escalation entry below** (they are one problem from two ends —
  the brief is STRAT-owned but IMPL is what invalidates it): AI_TASK_PROTOCOL.md — new
  "`## Notes from other sessions` — the IMPL↔brief channel" + the section's registration in the
  brief's contents list + the STRAT kickoff (read it first, fold it in, empty it) +
  STAGE_TASK_TEMPLATE.md — Reporting (append the completion delta) + the live
  `STAGE_6_STRAT_BRIEF.md` (section added, empty). **The IMPL-appendable section won**, in a
  deliberately narrow form: append-only, dated bullets, pointers not prose, two admissible kinds
  (completion delta / a question for STRAT), no decisions and no status the task file already owns,
  and STRAT empties it on rewrite. Rejected alternatives: letting IMPL rewrite the brief (recreates
  the clobber risk the single-writer rule exists to prevent); a separate hand-off file (adds a
  document and a second thing to remember to read); waiting for `pnpm project:status`
  (`TOOLING_TASK_01` is still `draft`, and a generated board would not carry an escalation
  *question* anyway); leaving it to the owner (that is the manual carrying being removed). Not
  fixed by this and still true: a `draft` task whose precondition has since been met still needs a
  STRAT session to promote it — the note now makes that visible, but promotion remains STRAT's call
  by design. — **REOPENED 2026-07-17**: the mailbox fix was **withdrawn** after an independent
  design review (`reviews/done/REVIEW_2026-07-17_impl-brief-channel.md`, round 2, finding 1). Do not
  rebuild it. Why it failed: in the cases that matter it still spent the owner's attention (while a
  STRAT session is live the note must be routed to that session by hand; a blocking question stops
  and tells the owner anyway), and its two admissible payloads did not cover the case present in the
  very tree that introduced it — a non-STRAT session creating a new `draft` task, which left the
  brief saying "Nothing in `draft`" while a draft existed. Replaced by a **reader-side rule** (no
  second writer, no sequencing rule): a STRAT session reconciles the brief's `Next topic` against
  canonical task `Status` and the stage's open task files before acting — AI_TASK_PROTOCOL.md ("The
  brief goes stale") + the STRAT kickoff. That covers the `draft` case too, because it derives state
  instead of relying on someone to report it. — open only in the weak sense that the brief still
  lags between STRAT sessions **by design**; no further mechanism is wanted unless a real handoff is
  actually lost.
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
  the brief. — resolved 2026-07-17, jointly with the 2026-07-17 stale-board entry above (same root,
  opposite ends): AI_TASK_PROTOCOL.md — "`## Notes from other sessions` — the IMPL↔brief channel".
  A mid-flight question is recorded there as a pointer (question + where the detail lives), which
  neither overwrites the brief nor spawns a second STRAT stream. Note the deliberate limit: the note
  is the **durable record**, not a handoff that lets the session continue — if the question blocks
  IMPL now, it still stops and tells the owner, exactly as the existing STOP-and-escalate rule
  requires. When a STRAT session is already live, routing the question to it directly (as the owner
  did by hand this instance) remains correct and is now backed by a written record instead of a
  copy-paste. — **CORRECTED 2026-07-17**: the mailbox was withdrawn (see the reopened entry above
  and `reviews/done/REVIEW_2026-07-17_impl-brief-channel.md`, round 2). The resolution for *this*
  entry is simply that **no new channel was needed**: a mid-flight product/spec question already
  stops and goes to the owner (Deviations — STOP-and-escalate), and when a STRAT session is live the
  owner routes it there directly, which is what happened in the triggering case. Non-blocking
  findings go to the task report / PROJECT_BACKLOG.md as before. Resolved on that basis — the
  original instinct to build a channel was the error.
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
- 2026-07-24 — After a green `pnpm qg` on Stage 6 Item 6 (source-changing IMPL block), the session
  presented results and asked the owner whether to proceed with the mandatory independent cross-review,
  instead of just opening the thread. AI_TASK_PROTOCOL.md — Independent Review Is Mandatory — is
  explicit that this is "a gate, not a judgment call" and that the IMPL session "opens the thread
  itself... It does not wait to be told." The owner pointed this out directly ("ревью в конце — почему
  ты уточняешь?"). The stated reason at the time was uncertainty about whether opening a review thread
  counts as an action requiring a fresh explicit go-ahead versus a step to just execute — but the
  protocol already resolves this ("always", not a threshold; see the 2026-07-14 owner-decision
  rationale for why it's unconditional). Net effect: the block sat one full turn longer with an open
  gate than the protocol calls for, at zero benefit — the same "ask if unsure" failure mode the
  protocol already names as a dead rule (Name the basis of a claim the repo does not own). — open:
  META to judge whether the kickoff prompt / IMPL session template should say *always open the
  cross-review thread immediately after a green in-session pipeline, no confirmation step* even more
  explicitly than the current wording, or whether this was simply a one-off miss with no doc gap to
  fix.
- 2026-07-24 — Stage 6 Item 5 (Home rebuild) took **9 cross-review rounds** to reach consensus, on a
  change that was ultimately ~2 source files (`page.tsx`, `en.json` — under 130 changed lines
  combined) plus doc/reporting overhead. Rounds 1, 2, 6, 7, 8 found real, legitimate issues (a
  rendering bug, an invented lifecycle status, unreconciled completion obligations, a non-canonical
  CO-2 pointer, an evidence-attribution nit) — the review pipeline did its job there. **Rounds 3–5
  were the actual waste**: the same single finding (`docs/files-structure.md` sitting outside the
  task's declared Allowed Write Surface) got re-litigated three times because the executing session
  kept substituting *explanation* for *authorization* — "here's why this hunk is mine/attributable"
  instead of either reverting it immediately or escalating to the owner immediately. Codex had to
  restate the same underlying rule three times before it landed as a clean sentence ("authorization
  attaches to the path, not to whose hunk it is") in round 5. Separately, the session twice
  mis-inserted its own `## Response N` section before the `## Review N` it was replying to in the
  thread file, requiring a same-turn self-correction to fix append order — a mechanical error, not a
  reasoning one, but it added noise to an already-long thread. — open: is there a framework-level fix
  here, or is this a one-off reasoning failure? Candidates worth META's judgment: (a) a documented
  rule-of-thumb for the executor — "if a generated/mandatory file sits outside the declared surface,
  the first move is revert-or-escalate, not explain-and-keep" — since this session found the right
  answer only after being told the same thing three times; (b) whether `AI_CROSS_REVIEW.md`'s Turn
  Structure should say explicitly that a new `## Response N` is always appended after the *matching*
  `## Review N`, to make the ordering mistake harder to make. Not proposing either fix directly (AIENG
  scope note: this session is an IMPL session, not AIENG/META, and does not edit framework docs
  itself) — filed for a META session to decide.
- 2026-07-24 — **Recurring pattern: IMPL sessions keep planning to write into `STAGE_6_STRAT_BRIEF.md`,
  which is STRAT-only and outside every task's write surface.** Observed **three times** now across
  Stage 6, each caught at plan-review or cross-review, never reaching a commit — but the repetition
  is the signal: (1) Item 5 CO-3 was *written* to require the executor to add the Featured Work
  `__asset_TODO` entry to the brief (a drafting error in the task file — the STRAT session that cut it
  put an impossible obligation on the executor); Codex flagged it, the executor correctly reverted its
  attempted brief edit. (2) Item 17's plan proposed documenting the consolidated placeholder-marker
  grep in the brief's "Pre-deploy swaps to track" section; caught at plan review and redirected to
  `PROJECT_PRODUCTION_READINESS.md` (durable, in-surface). Both times the *pull* was the same: work
  that feels like "pre-deploy / cross-task tracking" reads as belonging in the brief, because that is
  where such lists currently live. The brief is the wrong home for anything durable — it is
  overwritten each STRAT session (a pointer, not a record) *and* STRAT-only. — open: candidates for a
  META session: (a) an explicit rule in `STAGE_TASK_TEMPLATE.md` / the IMPL kickoff convention —
  "cross-task/pre-deploy tracking that must survive belongs in a durable PROJECT_* doc
  (PROJECT_PRODUCTION_READINESS.md for pre-launch swaps); the STRAT brief only ever *points* at it,
  and only a STRAT session writes the pointer"; (b) a check when a STRAT session *cuts* a task —
  "no CO may require the executor to edit the STRAT brief" (would have caught Item 5's CO-3 at cut
  time, not review time); (c) whether the "Pre-deploy swaps to track" list should physically move out
  of the brief into PROJECT_PRODUCTION_READINESS.md so the gravitational pull points at the right file
  to begin with. Filed by the STRAT session coordinating Stage 6; not fixing framework docs here.
- 2026-07-25 — Review round counts climbing on refactor-shaped IMPL tasks (Item 5: 9, Item 17: 8+);
  owner flagged it as a velocity problem and asked about an MCP-wrapped Codex with a bounded/capped
  auto-loop. Root cause shifted mid-thread from write-surface/settings.json hygiene (rounds 1-3) to
  self-inflicted reporting-doc inconsistency (each round's fix desyncing the next). `open` — for
  META; full detail in
  `docs/project/reviews/done/REVIEW_2026-07-25_stage6-item17-studio-config-extraction.md`.
