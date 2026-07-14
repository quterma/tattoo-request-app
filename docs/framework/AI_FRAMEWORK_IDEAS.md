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
