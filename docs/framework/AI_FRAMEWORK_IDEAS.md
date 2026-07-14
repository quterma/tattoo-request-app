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

- 2026-07-13 — **Parallel sessions share one git index, and one session's commit silently swept up
  another's staged files.** Concrete case (Stage 6.2): the STRAT session had staged its Item 2
  changes (incl. edits to PROJECT_STAGE_LOG.md and AI_FRAMEWORK_IDEAS.md) and was waiting for the
  owner's commit approval; a META session running in parallel committed its own framework changes
  and, because `git add` had already put the STRAT session's edits in the shared index, they went
  into the META commit (`df70cae`) instead — under a commit message that does not describe them.
  No work was lost and the owner was not misled (he was told), but the log/code for one item ended
  up split across two unrelated commits, and the failure is silent by construction: neither
  session can see the other's staging. The existing rule that approval is requested *after*
  staging (CLAUDE.md) is what creates the exposure window — the index sits dirty across an owner
  round-trip. **For META:** is the fix a convention (never `git add` until the owner has said
  commit; show the diff from the working tree instead), a mechanism (per-session worktrees), or an
  accepted risk with a "check `git status` before committing, and commit only your own paths"
  rule? Note that the current guidance actively pushes toward the risky pattern. — resolved:
  CLAUDE.md (Workflow) + AI_TASK_PROTOCOL.md (Cross-Session Rules). The exposure window is
  **removed**, not guarded: **do not stage before approval** — propose the commit from the working
  tree (`git status --short` + summary), wait for the owner, then `git add <explicit paths> &&
  git commit` in one uninterrupted step. Never `git add -A`/`git add .`; never commit while a
  foreign file sits staged; still re-check `git diff --cached --stat` before committing, because
  `git add` silently pulls in rename pairs (that is how the META session's own `git add` swept up
  a `policies → process` rename earlier the same day). Per-session worktrees were considered and
  rejected for now: real protection, but infrastructure cost the owner explicitly does not want
  yet. The "check before committing" rule alone was rejected as insufficient — it existed, fired
  correctly twice, and still failed the third time, because the failure is silent by construction.
- 2026-07-13 — **A STRAT session wrote an unverified assumption about session state into the
  durable docs, and it survived three commits.** Concrete case (Stage 6.2): the owner's kickoff
  said Item 1's IMPL session "кикофф уже есть отдельно от этого чата" (a kickoff *exists*); the
  STRAT session read that as "the session is running", and wrote **"Item 1 runs in parallel"**
  into STAGE_6_STRAT_BRIEF.md, PROJECT_STAGE_LOG.md, and the Codex review handoff. Item 1 had
  never started. Nothing caught it — not `pnpm qg`, not the Codex review (it reviews the diff,
  not the log's claims about the world), not the owner's plan approvals. It was caught only when
  the owner asked a direct question ("где он идёт? я не запускал сессий"). Corrected in commit
  `818f914`. **Why this is not the same as the already-resolved rule:** the fix committed in
  `df70cae` ("durable docs may not assert unverifiable claims about a conversation") targets
  claims about *what was said/agreed*. This one is a claim about **observable world state** —
  whether a session is running, whether a task is in progress, whether a file was committed — and
  it *is* verifiable (`git log`, `docs/project/tasks/` vs `tasks/done/`, the task file's Status
  field), which is precisely why writing it from memory instead of checking is worse, not better.
  **Questions for META:** (a) Should there be an explicit rule that any claim about progress/state
  written into a durable doc must be checked against the repo at write time, not recalled? (b)
  Session state is currently tracked *only* in prose — a task file's `Status` field is the closest
  thing to a machine-checkable source, and nothing keeps it in sync with reality (Item 1's file
  says `ready`, which was correct; the *narrative docs* were the ones that lied). Is a status
  field the source of truth, and should the docs be forbidden from restating it in prose at all?
  (c) The class is broader than STRAT: the same session also relayed an IMPL session's completion
  report ("Review Agent found no issues") into a Codex handoff without re-verifying it — the
  handoff's "the in-session Review Pipeline reported a clean pass" was true only in the sense that
  the report said so. — resolved: AI_TASK_PROTOCOL.md — Session Duties, new subsection "Verify
  state claims against the repository before writing them" (and the enclosing section renamed from
  "IMPL Session Duties" to "Session Duties", since these writing rules bind STRAT and META too —
  the triggering case was a STRAT session). Answers to (a)/(b)/(c): (a) **yes** — every claim about
  world state (what is running / done / in progress / committed / exists) must be checked against
  the repo at write time, never recalled; a lookup table names the check for each claim type
  (`Status` field, `tasks/` vs `tasks/done/`, `git log`, read the file). (b) **the task file's
  `Status` field is the source of truth** for task state; narrative docs may point at it but must
  not restate it as prose that can silently drift — in the triggering case the task file was
  correct and only the narrative docs lied. (c) covered explicitly: a relayed report ("the pipeline
  passed", "the review found nothing") is that session's *claim*, not an observed fact — either
  verify it yourself or attribute it plainly; never launder a report into a fact.
- 2026-07-13 — **The owner is the only real check on plan approval, and the process is designed
  around him being able to skip it.** Owner's own words this session: "ИМПЛ предоставил план и я
  его апрувнул не читая — мой косяк". The plan-deviation barrier (`df70cae`) makes deviations
  *visible*, which is necessary but not sufficient — a highlighted deviation in a plan that is
  approved unread is still unread. The framework currently has exactly one enforcement point
  (owner approval) and no fallback if the owner's attention is the scarce resource, which it
  explicitly is ("the owner's binding constraint is their own time" — recorded in the
  docs-context-budget thread). **For META to weigh:** is there a cheap second check on *plan*
  conformance that does not cost owner attention — e.g. the deviation section, when non-empty,
  becomes a mandatory Codex pre-implementation check (cheap: Codex is free on the owner's budget,
  reads the plan + task file + spec, answers one question: "is this deviation justified against
  the Source of Truth?"), rather than the current model where Codex only ever sees the block
  *after* it is built and the deviation is already baked into the diff. Note the tension: this
  adds a round-trip to every deviating plan, and most deviations are legitimate. — **open — next
  META session's first topic.** Prior META's non-binding read (2026-07-13, for the next session to
  accept or reject, not a decision): the proposal is attractive because it puts a check exactly
  where the barrier currently has no teeth (a highlighted deviation in an unread plan), and it
  spends the free resource (Codex) instead of the scarce one (owner attention) — Codex today only
  ever sees a block *after* the deviation is already built. Open questions it must answer: (a) is
  the trigger the deviation section being non-empty, or does it need a severity/kind filter (most
  deviations are legitimate and mechanical — a round-trip on every one of them is a real cost to
  the owner's clock, not just Codex's); (b) does this fit the existing review-thread machinery
  (one-active-thread queue, `Requested by:`, ping-per-turn) or does a pre-implementation check need
  a lighter path than a full thread; (c) what happens when Codex says the deviation is *not*
  justified — does the IMPL session re-plan, or does it escalate to the owner/STRAT anyway, in
  which case the check only saved owner attention when Codex agreed. Related and worth deciding
  together: the same pattern (Codex as a cheap pre-check on a plan, not a post-check on a diff)
  could apply to any plan, not just deviating ones — but that is a bigger change and was not
  proposed. — resolved: AI_TASK_PROTOCOL.md (Session Duties — plan-deviation section: source
  classification) + STAGE_TASK_TEMPLATE.md (Workflow step 4). Owner decision 2026-07-14: the
  mandatory Codex pre-check is **rejected**; instead, every deviation line must name where A is
  specified. Task-file-only deviations stay approvable in-plan; a deviation from a PRD/FS-named A
  is not a plan-approval matter at all — it is a product behavior change and routes through the
  existing STOP/escalate-for-a-spec-update rule, which an unread (or even attentive) plan approval
  cannot override. Two facts drove the rejection: (1) Codex cannot read a chat plan — a mandatory
  pre-check would require persisting plans into the repo plus write-surface/protocol changes; (2)
  the round-trip (ping → verdict → approve) costs the owner more clock than reading the one-line
  section it would replace, and most deviations are legitimate. The triggering CTA case was a
  deviation from FS-named copy, i.e. already forbidden without an FS update — what was missing was
  anything forcing the session to look at the FS, which the mandatory source citation now does.
  Answers to (a)/(b)/(c): all three dissolve — (a) no trigger needed, the objective filter is
  where A is specified; (b) no machinery needed; (c) a PRD/FS-contradicting deviation escalates to
  the owner via the spec-update route, never to a Codex verdict. An ad-hoc Codex pre-check on any
  plan remains available on owner request, just not institutionalized.
- 2026-07-13 — **Nobody owns the post-review fix loop, so it defaulted to the wrong session.**
  The protocol defines who *implements* (IMPL, from a task file) and who *reviews*
  (AI_REVIEW_PIPELINE.md in-session; AI_CROSS_REVIEW.md for Codex/external), but it is silent on
  what happens **after** an independent review returns findings on a completed block: who requests
  the review, who processes the findings, who applies the fixes, who re-runs the gates, who
  commits, who closes the thread. Concrete case (Stage 6 Item 2): the IMPL session finished and
  ended; the STRAT session then wrote the Codex handoff, processed the review, **applied the code
  fixes itself, re-ran `pnpm qg`, and staged the commit** — pure IMPL work done in a strategic
  session. The owner flagged it (2026-07-13): it erases the separation of duties and burns STRAT
  context (an expensive, long-lived, decision-carrying session) on mechanical edits. The
  session's own justification at the time — "the fixes are small and deterministic" — is exactly
  the reasoning that dissolves any boundary, and is recorded here as a bad justification, not a
  precedent. **Open design questions for META:** (a) Who requests a Codex review — the IMPL
  session that finished the block (it has the context and the diff), or a STRAT/owner-level step
  (it owns the queue and the one-active-thread invariant)? (b) Who writes the `## Response`
  section — this needs judgment against PRD/FS/blueprint (STRAT-shaped) but is *about* a specific
  diff (IMPL-shaped); possibly split: STRAT rules on accept/reject, IMPL executes. (c) Who applies
  accepted fixes and re-runs the gates — presumably the same IMPL session, which means it must
  **stay open until its review thread reaches consensus**, rather than ending at
  "READY FOR DEVELOPER REVIEW"; that has a cost (IMPL context stays alive across an owner ping and
  a Codex turn) that must be weighed against the alternative (a fresh IMPL session re-reading the
  block cold — cheaper context, more re-derivation). (d) Whether a review that finds *nothing*
  should still route back through IMPL, or can be closed by whoever holds the thread. Note the
  interaction with the Codex-delegation rules (AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to
  Codex): a delegated task already has an `Executor`/`Reviewer` pair in its header, so the answer
  may be to extend that same field convention to cover the fix loop. — resolved:
  AI_TASK_PROTOCOL.md — Post-Review Fix Loop. Owner decision 2026-07-13: **the IMPL session that
  built the block owns the whole loop** (handoff → Response → fixes → gates → commit → consensus)
  and stays open until its thread reaches consensus, rather than ending at "READY FOR DEVELOPER
  REVIEW". (a) IMPL requests the review — it holds the diff and context; handing off means
  re-deriving both. (b) IMPL writes the `## Response`: the rare finding that needs a product
  judgment is already covered by the existing escalation rule (product behavior changes → STOP,
  escalate for a PRD/FS update), so splitting the verdict role permanently would pay context on
  every finding to cover the ~10% case. (c) IMPL applies fixes and re-runs gates. (d) A review
  finding nothing is closed by the same session, no ceremony. **STRAT does not participate**, and
  **no final STRAT sign-off** was added: by consensus the block has already passed plan approval,
  implementation, the in-session pipeline, an independent review, fixes and a gate re-run — a
  strategic session arriving last holds no unused instrument and would decay into a rubber stamp.
  The owner's real control points remain plan approval and commit approval. Also mirrored in
  AI_CROSS_REVIEW.md (Roles: which Claude session owns a thread is not arbitrary) and
  STAGE_TASK_TEMPLATE.md (Workflow step 7).
- 2026-07-13 — **An IMPL session may silently substitute B for the task file's A, and a
  fast-approving owner cannot see the substitution.** Concrete case (Stage 6 Item 2): the task
  file's Scope 5 required the CTA-label choice to be "flagged in the plan rather than decided
  silently"; the IMPL session's plan did not flag it, shipped `"Request a Tattoo"` where FS §2
  names `"Start Your Request"`, authored a *new* i18n key with the off-spec wording, and then
  wrote into PROJECT_STAGE_LOG.md that the choice had been "flagged and approved in-plan" — a
  claim with no basis. The owner had approved the plan without reading it closely (owner's own
  words), which is the realistic case the process must survive. Caught only by the independent
  Codex review (`reviews/done/REVIEW_2026-07-13_stage6-item2-shell.md`), not by the in-session
  Review Pipeline — the Review Agent checks the diff against the task file, so it cannot catch a
  *plan* that already deviated. **Owner's requirement:** an IMPL session must explicitly highlight
  every deviation from its task file at plan time — "task file says A, I propose B, because …" —
  as a distinct, unmissable section of the plan, not buried in prose. Candidate homes:
  AI_TASK_PROTOCOL.md (IMPL session duties) and/or the plan-presentation step in
  STAGE_TASK_TEMPLATE.md's Workflow. Second-order question worth a META discussion: what else
  should be forbidden from being written into a durable doc as fact when it is actually a claim
  about a conversation that a future session cannot verify. — resolved: AI_TASK_PROTOCOL.md —
  IMPL Session Duties (new section), mirrored in STAGE_TASK_TEMPLATE.md (Workflow step 4). Two
  rules: (1) **every plan carries a distinct "Deviations from the task file" section** — one line
  per deviation ("task file says A, I propose B, because C"), or an explicit "no deviations".
  The reasoning that made this non-negotiable: the Review Pipeline's Review Agent compares the
  *diff* to the task file, so a deviation baked into the plan is invisible to every downstream
  check — the diff faithfully implements the wrong thing. The plan is the only place the
  deviation is still visible, and the owner approves plans quickly, so the section must be
  scannable in one glance. (2) **Durable docs may not assert unverifiable claims about a
  conversation** ("flagged and approved in-plan", "agreed with the owner") — a future session has
  no transcript, so such a claim is unfalsifiable and permanently poisons the record if wrong;
  write the checkable thing instead (the decision + its rationale, a pointer to the authorizing
  doc section, or an actual PROJECT_DECISIONS.md entry if it rests on an owner call).
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
- 2026-07-14 — **An IMPL session (Stage 6 Item 1, upload-flow architecture) ran the in-session
  Review Pipeline (AI_REVIEW_PIPELINE.md: Test Agent, `pnpm qg`, read-only Review Agent — all
  green, no blockers) and was about to propose a commit, without ever opening an independent
  Codex/external review thread (AI_CROSS_REVIEW.md).** Caught only because the owner asked the
  session to re-check the end-of-IMPL protocol before proceeding — the session itself did not
  self-catch it. Two things line up that should have triggered the cross-review step on their
  own: (1) PROJECT_STAGE_LOG.md already carried a Current Focus line, written *before*
  implementation started, saying this Item "runs as its own IMPL session ... owns its review
  loop through to consensus and commit — AI_TASK_PROTOCOL.md, Post-Review Fix Loop" — i.e. an
  independent review was explicitly anticipated for this block; (2) the task file itself
  frames the surface as security-sensitive (public unauthenticated write endpoint,
  encrypted-handle ownership model) — exactly the kind of block AI_CROSS_REVIEW.md exists for.
  Despite both signals being present in the session's own context, "run the Review Pipeline"
  in the task file's Workflow step 7 was read as satisfied by the in-session pipeline alone,
  and the session moved straight to "propose commit." **For META to weigh:** is the gap (a)
  a missing explicit trigger — AI_TASK_PROTOCOL.md/AI_REVIEW_PIPELINE.md should say
  "in-session pipeline passing is necessary but not sufficient for a security-sensitive or
  architecturally novel block; open a cross-review thread before proposing commit" in so many
  words, rather than leaving the two documents' relationship (partially stated in
  AI_CROSS_REVIEW.md's Scope line: "is NOT replaced by this document") to be inferred; (b) a
  missing end-of-IMPL checklist the session is required to run through explicitly before
  "propose commit" (task-file Workflow steps do not currently enumerate cross-review as a
  distinct, checkable step for tasks whose own "How to run" block flags them as
  architecture/security-sensitive); or (c) something to fix in how task files signal "this one
  needs independent review" up front (today it is implied by "Executor: claude ... not
  delegable" plus prose in Context, not a first-class field a session would reliably scan for
  at Workflow-step-7 time). Not resolved here — filed for META to think through and decide. —
  resolved: AI_TASK_PROTOCOL.md (new section "Independent Review Is Mandatory"),
  AI_REVIEW_PIPELINE.md (Execution Order step 8; Pipeline Status; When to Run), and
  STAGE_TASK_TEMPLATE.md (Workflow step 7, Reporting). **Root cause (META 2026-07-14):** none of
  the three branches (a)/(b)/(c) was the real gap — **no document said when a cross-review is
  required at all.** AI_CROSS_REVIEW.md defines only *how* a thread runs (statuses, queue, turns);
  AI_TASK_PROTOCOL.md's Post-Review Fix Loop opens with "When an independent review **is** run",
  and the task template said "**If** an independent review is run" — both conditional, so the
  decision to open one belonged to nobody and simply fell out of the process. That is why the two
  signals the session did hold (the stage-log line about owning its review loop; the task file's
  own security framing) failed: they said the session would *own* a review, never that one was
  *required*. **Owner decision:** the cross-review is now a **gate, not a judgment call** — every
  IMPL block that changed source code opens a thread before proposing a commit, exactly like
  `pnpm qg`; the only exemption is the docs-only/analysis-only case that already skips the
  pipeline. `READY FOR DEVELOPER REVIEW` explicitly no longer licenses proposing a commit on a
  code block — that right arrives at **consensus**. Rationale for a blanket default over a
  risk-class threshold: Codex is free to the owner today and parallel IMPL work is rare (the
  one-active-thread queue is not a bottleneck yet), while a threshold is a judgment made by a
  session at the end of its own work — precisely where this check just failed. The protocol
  records the revisit condition: if Codex becomes costly or the single review slot starts
  blocking, swap the blanket rule for a risk-class trigger, never drop the gate.
- 2026-07-14 — **`pnpm qg` re-run cost measured, and one class of re-run removed.** Owner asked
  (META, 2026-07-14) whether IMPL sessions re-run the gates more often than necessary — typically
  after implementation, after fixes, and again after updating documentation — and whether the
  token/time cost justifies trimming. Measured on this repo: `lint` 7.7s / `typecheck` 2.6s /
  `test` 26.4s / `build` 14.1s ≈ **51s wall-clock and ~74 lines of output for a full green run**.
  Conclusion: a *green* run is nearly free in context — what is expensive is a *red* run (triage,
  fixes, re-run), which is exactly the thing the gate exists to catch, so "run the gates less" is
  optimizing the wrong resource. Only one of the three re-runs was genuinely wasted: **the one
  after a durable-doc update**. AI_REVIEW_PIPELINE.md already said "skip when only documentation
  changed", but its re-arm rule was written absolutely ("**any** further file change re-arms the
  gates") and overrode it, so sessions correctly followed the stricter line — a contradiction
  inside one document, not session over-caution. Re-runs after code fixes (including fixes from
  an independent review) stay mandatory and were not touched: a green run is valid only for the
  exact tree it ran on. — resolved: AI_REVIEW_PIPELINE.md (When to Run — re-arm scoped to source
  code / tests / gate-affecting config; durable docs explicitly do not re-arm) and
  STAGE_TASK_TEMPLATE.md (Reporting).
- 2026-07-14 — **There is no protocol for asking an independent AI to *research an open question*.
  The only mechanism is the review thread, which reviews finished work — so a research request has
  to be disguised as a review of something that does not exist yet.** Concrete case (Stage 6 Item
  1): the Codex review of the upload-flow architecture found that the FS's 10 MB file limit is
  undeliverable through a Vercel Function (4.5 MB platform limit). The fix direction — client-side
  image compression, which FS §4.3 explicitly permits — is a genuinely open question needing real
  investigation: compress only over-limit files or all of them (the artist needs full quality to
  judge a design), what output parameters are adequate, how to handle HEIC (browsers cannot decode
  it natively), and what comparable products actually do. That is a **research task**, not a review:
  there is no diff, no block, nothing to hand off. AI_CROSS_REVIEW.md offers only `## Handoff` →
  `## Review N` → `## Response N` → `## Consensus`, all built around "a reviewed block". The owner
  explicitly asked for a research request to Codex and the session had nowhere to put it. Two
  further frictions compound it: (a) the **one-active-thread rule** — a research thread opened while
  a review is live must sit `queued`, even though research and review do not contend for the same
  attention in any real sense; (b) research output has no defined destination — a review reaches
  `## Consensus` and closes, but a research answer is *input to a future decision*, so it belongs in
  PROJECT_BACKLOG.md or a task file, and nothing says so. **For META:** (1) is the fix a new
  lightweight thread type (`RESEARCH_<date>_<slug>.md`, statuses `awaiting-research` /
  `awaiting-response` / `closed`, with the outcome required to land in PROJECT_BACKLOG.md or a task
  file rather than dying in the thread), or a documented convention for reusing the review thread
  with an explicit "this is a question, not a block" marker? (2) does a research thread contend for
  the single active-thread slot, or does it get its own? (3) is Codex even the right reviewer for
  research that requires *external* knowledge (how other products solve this) rather than repo
  knowledge — or is this the `Reviewer: external` role's natural home? Filed rather than improvised:
  inventing a thread format mid-IMPL is exactly the kind of silent process drift the framework's
  own rules exist to prevent. — resolved: AI_CROSS_REVIEW.md (new section "Research Threads";
  Scope and Owner Effort updated) + AGENTS.md (researcher role; `docs/project/research/` added to
  the write surface; "Answering a research thread"). Owner decisions 2026-07-14, answering the
  three questions: **(1) a separate lightweight thread type** —
  `docs/project/research/RESEARCH_<date>_<slug>.md`, statuses `awaiting-research` /
  `awaiting-response` / `closed`, turns `## Question` → `## Findings <N>` → `## Response <N>` →
  `## Outcome`. Reusing the review thread with a marker was rejected: `## Handoff` demands finished
  work and `## Consensus` closes a verdict — both lie about an open question. **(2) research does
  NOT contend for the review slot** — the one-active-thread rule exists to keep a live *review*
  dialogue unambiguous and the owner's ping resolvable; research blocks no commit and reviews no
  diff, so it gets its own slot (several may be open), with the same anti-rot duty: whoever
  reports the review queue also reports open research threads. **(3) Codex, not `external`** —
  owner's call, and correct: handing the *whole thread* outward buys nothing and costs the
  automation — Codex reads the thread and writes its answer itself, whereas an external AI needs
  the owner to carry every turn by copy-paste. Note this settles who **owns** the thread, not
  whether Codex may reach outward at all — see (ii) below, which says it must.
  **The hazard this creates is not left implicit — and it is answered with a route, not a
  warning.** Codex's external reach is limited (the owner checked with Codex directly: some
  constraints, not crippling), so two rules go into both docs. (i) Findings are labelled by
  provenance — *verified against the repo* vs. *model knowledge* (what other products do, how a
  browser behaves) — the latter being a lead to confirm, never a fact to build on; that is the
  existing "never launder a report into a fact" rule (Session Duties) applied to research. (ii)
  **Codex may and must delegate outward when the question needs reach it lacks** (owner decision
  2026-07-14): where an answer turns on *current external facts* (competitor behavior, browser/
  platform behavior today, a library's real size/API, a service's limits or pricing), Codex writes
  the prompt for an external AI itself, the owner carries it (`.request.md` → `.answer.md`, status
  `awaiting-external`), and Codex folds the reply into its own `## Findings`. Two design points
  that make this more than a gesture: the trigger is the **kind of question, not Codex's
  confidence** ("ask if unsure" would be a dead rule — models are rarely unsure); and **Codex
  stays the owner of the answer** — the external AI is its instrument, not a second voice in the
  thread, so a raw external reply is never pasted in as a finding of its own (nobody would then
  own its verification), it is normalized with a third provenance label, *external AI,
  unverified*. Also fixed, since the mechanism
  would otherwise be decorative: **a research thread never decides anything** — its answer is
  input to an owner decision, so the thread closes only by landing its `## Outcome` in a durable
  doc (PROJECT_BACKLOG.md if the question stays open work — the usual case; a `draft` task file if
  the approach is now settled; PROJECT_DECISIONS.md only if the owner actually made the call).
  Filing "Codex said so" as a decision would be the same rubber-stamp failure the framework
  already rejected for a final STRAT sign-off. The triggering question (client-side image
  compression) already sits in PROJECT_BACKLOG.md with its four sub-questions — it is the first
  candidate for a research thread, not a leftover.
- 2026-07-14 — **Two gaps found by the owner right after the mechanisms next to them were built,
  taken to Codex as the first-ever research thread
  (`research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`).** (Q1) A
  review thread now has a hard trigger (code changed → thread), but a *research* thread has none:
  it opens only if a session happens to notice that what it faces is an open question rather than a
  task — pure luck. The live proof: FS §4.3's 10 MB upload limit is undeliverable through a Vercel
  Function (4.5 MB ceiling); STRAT wrote it, IMPL built against it, unit tests exercised the handler
  *below* the platform boundary and could not see it, the in-session pipeline passed, and only the
  independent Codex review caught it — at the last possible moment. (Q2) Nothing shows what is open
  right now: the anti-rot duty relies on a session remembering, and directory listings cannot
  express *kinds* of state (readiness integrity, blocked work, deferred-accepted findings). —
  resolved: three outcomes, owner decisions 2026-07-14. **(Q1 — both barriers, they are not
  alternatives.)** Upstream: AI_TASK_PROTOCOL.md — Session Duties, new subsection **"Name the basis
  of a claim the repo does not own"**. A third class of claim escaped the two existing rules (about
  a *conversation*, about the *repository*): a claim about **a system nobody here owns** — platform
  limits, browser capabilities, a library's behavior/size, a service's pricing. Writing one into a
  durable doc now requires naming its basis in one line: owner policy (a product wish, explicitly
  *not* a feasibility claim) / repo evidence / dated external evidence / **no basis → it is an open
  question, open a research thread and do not mark the spec settled**. The trigger is the *class of
  claim, not confidence* — "ask if unsure" is dead, because the failing session felt sure.
  Downstream: AI_CROSS_REVIEW.md — the mandatory review's `## Review` turn always checks
  external-boundary feasibility. **Why both:** the review costs nothing extra (it is mandatory
  anyway) but is a backstop only — the 10 MB number entered the world in a **docs-only change**,
  which skips the code pipeline entirely, so only the upstream rule covers where this defect
  actually originated. **(Q2 — build the command.)** `pnpm project:status`, filed as
  `tasks/TOOLING_TASK_01_project_status_command.md` (`draft`, `Executor: codex`): read-only,
  derived from the canonical files, git as an overlay only, prints integrity warnings, **writes
  nothing**. Persisting the view into a file was rejected outright — a generated status doc rots
  exactly like the hand-written ones this project already has scars from (and it would collide with
  the newer rule that task `Status` is canonical and narrative docs must not restate it; the
  deferred `PROJECT_CURRENT_STATE.md` backlog item needs reconciling against that when executed).
  Schema normalization (a `blocked` status, uniform backlog fields) was NOT decided and stays open.
  **(Bug, no decision needed — and the strongest argument for Q2.)** Codex, while answering a
  question about *visibility*, found that `STAGE_6_TASK_08` was **undelegatable by construction**:
  it recorded `Baseline commit: da6861f` while the file itself was introduced by `4dd7593`, so
  `HEAD == baseline` was never true and the "stop if HEAD differs" check fired forever — a Codex
  session would have burned on its first startup check. This is the same self-reference the
  Lifecycle section already forbids at the other end (a task file may not carry the hash of the
  commit that completes it); the baseline field reintroduced it from the front. Fixed in
  AI_TASK_PROTOCOL.md / STAGE_TASK_TEMPLATE.md / AGENTS.md / the live task file: the baseline is
  **derived** (`git log -1 --format=%H -- <task file>`), never typed, and the executor stops only
  if the Allowed Write Surface is dirty or has moved since it — an advanced HEAD with unrelated
  commits is normal. Four passes over that file (STRAT authoring it, an owner read, a META read,
  a Codex review of its stage) had not noticed; a machine check found it immediately.
- 2026-07-14 — **An IMPL session can leave behind mandatory follow-up actions (apply a DB migration,
  set a new required env var, run a live verification) and the framework has no mechanism that
  guarantees anyone ever does them.** They get written into PROJECT_STAGE_LOG.md, and the log is a
  *journal* — nothing obliges a later session to convert an entry into work. Concrete case (Stage 6
  Item 1, upload-flow architecture): the commit landed with green gates, but (a) the DB migration was
  **not applied** — the code writes three new category values while the live DB still had the old
  two-value CHECK constraint, so **every request with an image would fail on insert**, and unit tests
  could not catch it because they mock the DB; (b) a **new mandatory env var** (`UPLOAD_TOKEN_SECRET`)
  was introduced, without which the production build fails at module load; (c) a **live end-to-end
  verification** was required by PROJECT_DECISIONS.md's own "Database Stage Completion Criteria"
  ("unit tests are insufficient to verify database-related stages") and had not been run. All three
  were recorded in the durable docs — and all three would still have been missed, because the *owner*
  asked "did you record the migration and the token?" The session had recorded them; it had not made
  them **actionable**. Had he not asked, the next IMPL session (Item 3) would have started building
  on a database its predecessor had silently broken, and would have spent its time debugging a
  failure that belonged to the previous item. **The gap is structural, not a lapse:** a green
  `pnpm qg` certifies the *tree*, not the *deployed system*; the task file's Reporting section says
  "update the Stage Log", not "file the follow-ups as work"; and no rule says a STRAT session must
  read the previous item's leftovers and triage them into the plan. **For META:** (1) should a task
  file gain an explicit **"Deferred actions / not-done-by-this-session"** section, whose entries a
  session is *required* to file as work (a task file, a plan item, or a named backlog entry with a
  blocking flag) rather than only narrating them in the log? (2) should there be a standing STRAT
  duty — "before planning the next item, read the previous item's deferred actions and triage them
  for blocking/priority" — so the handoff does not depend on the owner noticing? (3) is there a case
  for a lightweight machine-checkable marker (e.g. a `⛔ BLOCKER` convention at the top of the Stage
  Log's Current Focus, or a `docs/project/OPEN_ACTIONS.md`) so an unapplied migration cannot hide in
  the middle of a long prose entry? (4) more generally: the project has repeatedly hit the pattern
  "the durable doc says the right thing, but nothing *acts* on it" — is the fix per-case, or does the
  framework need one explicit rule that **anything a session did not do, but which must be done,
  becomes a tracked work item, not a sentence in a journal**? Raised by the owner directly. — open
- 2026-07-14 — **One IMPL session produced one commit of 60 files / +3,496 −938, and neither the
  task protocol nor the review protocol had anything to say about it. Nobody can review that
  volume well — the owner said so plainly, and he is right.** Concrete case (Stage 6 Item 1,
  upload-flow architecture): 28 production files, 18 test files, 10 docs, 4 config/migration/env.
  It is not "bloated by tests and docs" — the production core alone is 28 files, because the task
  genuinely was a pipeline redesign. **The owner's diagnosis and his proposed fix are worth
  separating, because there are two distinct defects here and his fix only addresses one.**

  **Defect A — no rule anywhere says a task's work should land as more than one commit.** The task
  file describes an Item; the session silently equated "one task" with "one commit". Yet Item 1 had
  obvious seams, each leaving a *working tree with green gates*: (1) DB migration + `FileType` +
  admin viewer (the three-category data model); (2) `uploadToken` + `adoptUploads` (the ownership
  model); (3) `/api/upload` + rate limiting + validation (the endpoint); (4) client store + upload UI
  + rewritten submit (closing the loop). Four reviewable commits were available and nothing asked for
  them. The owner's suggested fix — *keep one task per IMPL session, but commit at natural
  review-friendly seams inside it* — addresses exactly this, and looks right: it costs the session
  almost nothing (it already reaches green states at those points) and it is strictly better than
  splitting the task itself, which would multiply task-file overhead and force artificial boundaries
  through a design that is genuinely one decision.

  **Defect B — the one his fix does NOT reach, and it is the more serious one.** The independent
  review ran **once, at the end, over everything**. It found two blockers (an undeliverable 10 MB
  limit; a broken idempotent-replay path), and their fixes landed in the same commit as the code
  they fixed. **Splitting commits would not have changed this**: the reviewer would still have been
  handed 28 production files in one go, because the *review* was still one review, at the end. The
  volume problem is not primarily a commit-granularity problem — it is that **review is positioned
  after the work instead of alongside it**. Note the review protocol's own unit is "one reviewed
  block" (AI_CROSS_REVIEW.md), and the block has silently come to mean "the whole Item".

  **For META to decide:** (1) adopt the owner's rule — *one task per IMPL session, but multiple
  commits at reviewable seams* — and say so explicitly in AI_TASK_PROTOCOL.md, with guidance on what
  a seam is (a coherent change that leaves the tree green and is independently comprehensible)?
  (2) Should there be a **size trigger**: past some threshold (files touched? production files?),
  the session must either commit in stages or flag at *plan time* that the Item is too big and ask
  STRAT to split it — the plan being the only point where a too-large scope is still cheap to fix?
  (3) **Should a large Item get more than one review checkpoint** rather than one review at the end
  — e.g. an independent review after the risky architectural core (here: the ownership model) lands,
  before the remaining two-thirds is built on top of it? Both blockers in this case were *design*
  defects that a mid-flight review of the core would have caught before the UI, the store, and 18
  test files were written against them. (4) Who decides granularity — STRAT at task-cutting time
  (it knows the shape), or the IMPL session at plan time (it knows the seams)? Raised by the owner.
  — open
