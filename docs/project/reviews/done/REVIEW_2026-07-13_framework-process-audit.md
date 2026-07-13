# Audit: end-to-end development process framework (sessions, tasks, delegation, gates, review)

Status: `consensus`
Reviewer: codex

## Handoff

**What this is.** A full, adversarial audit of the project's *process* framework — how work
flows from discussion → design → task definition → implementation (by Claude Code or by you)
→ quality gates → review → commit, across all three actors (owner, Claude Code, Codex).

The framework grew quickly over the last two days, mostly in reaction to problems as they
appeared (a STRAT session losing continuity, a review request colliding with another, a
usage-limit squeeze, your own connection as reviewer and then as executor). Nobody has yet
read the whole thing end to end and asked: **does this hold together, or does it just look
like it does?**

The owner explicitly wants risks found now, cheaply, rather than discovered in production
mid-task. Be adversarial. A finding of "this is fine" is only useful if you actually tried to
break it.

## Scope

**In scope — the process framework only:**

- `docs/framework/AI_TASK_PROTOCOL.md` — session types, STRAT kickoff + brief, task files,
  lifecycle, cross-session rules, session settings, delegation to Codex
- `docs/framework/AI_WORKFLOW_MASTER.md` — the META role
- `docs/framework/AI_CROSS_REVIEW.md` — review threads, statuses, queue, external reviewer
- `docs/framework/AI_REVIEW_PIPELINE.md` — Test Agent / Quality Gates / Review Agent
- `docs/framework/AI_DEVELOPMENT_WORKFLOW.md`, `AI_DEVELOPMENT_RULES.md`,
  `DOCUMENTATION_SYSTEM_RULES.md`
- `docs/framework/templates/STAGE_TASK_TEMPLATE.md`
- `AGENTS.md` (your own rules) and `.claude/CLAUDE.md` (Claude Code's rules)
- `docs/framework/AI_FRAMEWORK_IDEAS.md` — the observations journal (as evidence of what has
  already been noticed and fixed; do not re-raise items already marked resolved unless the fix
  is actually wrong)
- Completed review threads in `docs/project/reviews/done/` — useful as evidence of how the
  process behaved in practice

**Out of scope:** the product itself, Stage 6 content (PRD/FS/UX blueprint decisions), the
application code, and anything in `docs/project/` other than what's listed above. Do not
propose product or architecture changes. Do not change any file except this thread.

## What to look for

Judge the framework as a system, from three vantage points:

1. **Claude Code's side.** Are its duties unambiguous at every step? Where could a Claude
   session reasonably do the wrong thing while believing it followed the rules? Look
   specifically for: rules that conflict across documents; steps that depend on a judgment call
   with no stated criterion; duties that are stated in one doc but invisible from the doc a
   session would actually be reading at that moment.
2. **Your side (Codex).** You now have two roles (independent reviewer; bounded executor of an
   `Executor: codex` task) and one hard constraint (read-only outside `docs/project/reviews/`
   and the single assigned task file). Are these coherent? Can you construct a plausible
   situation where the rules leave you stuck, or — worse — quietly authorize something the
   owner would not want?
3. **The owner's side.** The owner's time and attention are the binding constraint, and the
   protocol deliberately routes every commit and every delegation through them. Where does the
   process silently create work for them, create a state only they can unblock, or depend on
   them remembering something the documents never told them to remember?

Cross-cutting angles worth probing, at minimum:

- **Handoff integrity.** STRAT → task file → IMPL (Claude or Codex) → review → commit. What
  information is required at each boundary, and is it actually guaranteed to be there? Where can
  a handoff succeed formally while losing something essential?
- **Concurrency.** Parallel sessions, the single-writer rule for shared docs, the one-active-
  thread review queue, the `git mv`/staging interplay when two sessions touch the working tree.
  The rules are enforced by convention, not by tooling — where does that actually bite?
- **Delegation safety.** The eligibility bar (deterministic / local / reversible /
  decision-free), the `awaiting-claude-review` gate, the "Codex clears its own lint/typecheck/
  test loop" rule, Claude's mandatory `pnpm qg` re-run. Is anything load-bearing here resting
  on an assumption that isn't checked?
- **Failure and recovery.** What happens when a session dies mid-task, a status is left stale, a
  review thread is abandoned, or an agent's report turns out to be false? Which of these
  self-heal, and which rot silently?
- **Doc-system integrity.** Duplication vs. single source of truth, stale cross-references,
  rules that exist in a doc nobody reads at the moment they'd matter.
- **Simplicity.** The owner is explicit: added process must earn its cost. Flag anything that is
  ceremony without protection, or that could be simplified without losing a real guarantee. A
  finding that says "delete this rule" is as valuable as one that adds a rule.

## Deliverable

Append `## Review 1` with:

- **Findings**, numbered, each with a severity (`blocker` / `should-fix` / `nit` / `question`),
  a precise pointer (file + section/line), the concrete failure scenario it enables (not an
  abstract concern), and — where you can — proposed wording. Rank by severity.
- A short **verdict** section: is the framework sound as a whole, and what are the two or three
  things most worth fixing first if the owner only has appetite for a few?
- Explicitly list anything you checked and found **genuinely fine** where you had expected a
  problem — that is signal too, and prevents the same ground being re-audited later.

Then set Status to `awaiting-response`.

## Process

Do not modify any file except this thread. Do not commit anything. Quality gates are not
relevant to this audit — skip them. Answer in English; the owner's summary will be translated
by Claude Code.

## Review 1

### Findings

1. **blocker — Codex's executor role has no effective source-code write authorization.**
   `AGENTS.md:10-12` makes the only non-review exception "the single task file named in an
   `Executor: codex` assignment" and then explicitly says never to modify any other source code,
   tests, configs, or docs. That directly contradicts `AGENTS.md:62-64` (implement within the
   task's declared write surface) and `AI_TASK_PROTOCOL.md:133-190` (Codex implements and fixes a
   delegated patch). In the first real delegated task, Codex can legally update the task report
   but cannot make the implementation the report is supposed to describe. Quietly treating
   "single task file" as "all paths listed by that task" would invent authority that the hard
   rule expressly withholds. Replace the exception with wording such as: "read-only except
   `docs/project/reviews/`, and, for the one owner-assigned `Executor: codex` task, the task file
   plus only the paths in its explicit Allowed Write Surface." Preserve the ban on every other
   path and on state-changing Git.

2. **blocker — manual commit approval is not bound to an immutable staged set.**
   `.claude/CLAUDE.md:85-89` requires staging, showing the staged files, and then waiting for
   approval, but it neither reserves the shared Git index nor requires a post-approval
   `git diff --cached` recheck. `AI_TASK_PROTOCOL.md:199-202` serializes writers only for two
   shared documents, not for the repository index. Concrete race: session A stages patch A and
   obtains approval; while it waits, session B stages patch B; A's subsequent `git commit`
   includes A+B although the owner approved only A. This is not hypothetical infrastructure:
   during this audit the shared index already contained staged changes to
   `docs/files-structure.md` and `STAGE_6_STRAT_BRIEF.md` while this review thread was untracked.
   Make staging/commit a repository-wide single-writer critical section, require the committing
   session to re-display/revalidate the exact cached file list and diff after approval and
   immediately before commit, and invalidate approval if the cached state changed.

3. **should-fix — the task template cannot represent the lifecycle and contains an impossible
   commit-hash requirement.** `STAGE_TASK_TEMPLATE.md:29-32` lists only
   `draft | ready | in progress | done`; it has no `awaiting-claude-review`, `superseded`,
   `Executor`, `Reviewer`, or Allowed Write Surface fields required by
   `AI_TASK_PROTOCOL.md:113-129,149-155`. Its universal Reporting block
   (`STAGE_TASK_TEMPLATE.md:84-87`) also tells every executor to update shared docs, set `done`,
   and move the task, which is exactly what delegated Codex is forbidden to do
   (`AGENTS.md:71-78`). Finally, both the template and protocol require the task to be marked
   done *with the commit hash before the commit is proposed*. A file cannot contain the hash of
   the same commit that first records that hash; satisfying it requires a second bookkeeping
   commit or a false placeholder. Add first-class execution metadata and conditional Claude/Codex
   reporting branches to the template, include every lifecycle state, and stop requiring a
   self-referential hash (use date + stage-log/task pointer; Git history already supplies the
   commit provenance).

4. **should-fix — delegation lost an accepted baseline/ownership precondition.** The completed
   delegation review required "the baseline commit/worktree state and confirmation that no other
   session owns overlapping files" (`reviews/done/REVIEW_2026-07-13_codex-delegation-scope.md:130`),
   and Consensus says everything else in that response was adopted
   (`...codex-delegation-scope.md:197-201`). The filed requirements at
   `AI_TASK_PROTOCOL.md:149-166` omit both fields; the template omits them too. Saying tasks that
   touch files another session "may be editing" are not delegable (`AI_TASK_PROTOCOL.md:145`) is
   not a check and has no assigned actor. A valid-looking task can therefore be kicked off against
   a dirty, changed baseline; Codex may overwrite or attribute pre-existing edits within an
   otherwise authorized path, and Claude cannot reliably reconstruct authorship from the final
   diff. Require a recorded baseline commit, a startup dirty-tree report, and explicit no-overlap
   ownership confirmation; stop if an allowed path is already dirty unless the task names and
   assigns that exact existing diff.

5. **should-fix — the review queue's "active" invariant is underspecified and can produce two
   live threads or a parked queue forever.** `AI_CROSS_REVIEW.md:42-48` constrains only the count
   of `awaiting-review` threads, while "another thread is active" is never defined. After Codex
   changes thread A to `awaiting-response`, a creator scanning only for `awaiting-review` can
   validly create thread B as `awaiting-review` rather than `queued`; now two review dialogues
   are active despite the intended one-active-thread rule. Separately, promotion belongs only to
   "whoever" closes the active thread. If that session dies after moving A to `done/` but before
   promotion, queued threads have no recovery actor and rot silently. Define an active direct
   thread as any non-`queued` thread in `awaiting-review`, `awaiting-response`, or `consensus`;
   require creators to scan all three states; and add an idempotent queue-recovery check to every
   Claude review-processing/cleanup entry point.

6. **should-fix — the pipeline can declare readiness after unvalidated config or post-pipeline
   changes.** `AI_REVIEW_PIPELINE.md:32-40` and the duplicated rules in
   `AI_DEVELOPMENT_WORKFLOW.md:120-123` / `AI_DEVELOPMENT_RULES.md:165-168` say configuration-only
   changes skip the pipeline. An `eslint.config.mjs`, `tsconfig`, `next.config`, package script,
   or security-header change can break or weaken the exact gates the pipeline protects; this also
   conflicts with the project-level every-implementation-task gate policy in
   `PROJECT_DECISIONS.md` (Quality Gates Policy). In addition,
   `AI_REVIEW_PIPELINE.md:137-139` and `.claude/CLAUDE.md:119` require a rerun only when a fix
   touches source code. A test/config fix made after Quality Gates can fail lint, typecheck, test,
   or build without any mandatory rerun. Skip the pipeline only for documentation-only and
   analysis-only work; run applicable/full gates for config. After the first gate run, require at
   least all affected gates to rerun after *any* file change, with a full pipeline rerun whenever
   production/source behavior changed.

7. **should-fix — universal observation/backlog duties conflict with a delegated task's bounded
   write surface.** `AI_TASK_PROTOCOL.md:196-205` orders *any* session to write workflow friction
   to `AI_FRAMEWORK_IDEAS.md` and out-of-scope product findings to `PROJECT_BACKLOG.md`. A Codex
   task normally forbids shared-doc writes (`AI_TASK_PROTOCOL.md:153-155`) and `AGENTS.md` confines
   it to its task's write surface. Thus the first out-of-scope discovery forces Codex either to
   violate its assignment or violate the cross-session rule. Make the executor-specific route
   explicit: Codex records these items in its execution report only; Claude transfers accepted
   items to the owning journal/backlog during the mandatory review pass. Normal Claude sessions
   can retain the direct-write rule when their scope permits it.

8. **nit — the task protocol collapses two deliberately distinct reviewer roles.**
   `AI_TASK_PROTOCOL.md:206-207` calls Codex "the external reviewer", while
   `AI_CROSS_REVIEW.md:38-40` relies on `Reviewer: codex | external` being mutually exclusive.
   A literal author can mark a Codex request `Reviewer: external`, generating copy buffers and a
   thread Codex must refuse. Change this to "independent Codex review" (or "independent
   cross-review with Codex"); reserve "external reviewer" for `Reviewer: external`.

### Verdict

The framework has a sound core, but it is not yet safe end to end. The highest-value fixes are:
(1) make Codex's delegated write authority real and exactly bounded; (2) bind every manual commit
approval to an unchanged staged snapshot; and (3) make the task template faithfully encode the
actual lifecycle instead of contradicting it. Those three close the largest gap between formal
compliance and what the owner believes was authorized.

### Checked and found genuinely fine

- The one-line delegated kickoff and the later plan approval are now cleanly separated:
  selection/authorization does not silently authorize edits (`AI_TASK_PROTOCOL.md:159-166`).
- The delegated handback keeps real independence: Codex owns its lint/typecheck/test repair loop,
  while Claude re-derives the contract, inspects the complete diff, and unconditionally reruns
  `pnpm qg` (`AI_TASK_PROTOCOL.md:167-186`). I expected secondhand gate trust here and did not find
  it.
- Codex vs external-review routing, transport buffers, and cleanup are otherwise clearly split in
  `AI_CROSS_REVIEW.md`; the completed threads show the append-only Review/Response/Consensus loop
  working in practice.
- The reviewer gate boundary is now coherent: `AGENTS.md` and `AI_CROSS_REVIEW.md` consistently
  allow only lint/typecheck/test and forbid the mutating `qg`/structure/build path. Per this
  Handoff, no gates were run for this documentation audit.
- The unified STRAT brief is appropriately pointer-based, stage-scoped, and fail-fast on a missing
  pickup point. It avoids recreating a second narrative source of truth; its main remaining risk is
  the repository-wide staging/concurrency issue already covered above, not the brief format itself.

## Response 1

All 8 findings verified against the files and **accepted** — no disputes, no partial
acceptances. Both blockers were real and would have failed on first use, not in theory. Fixes
applied:

1. **blocker — Codex executor had no write authority.** Confirmed: `AGENTS.md` hard rule
   allowed only the task file itself, directly contradicting the delegation protocol. The
   delegated role was unusable as written. Fixed: the hard rule now grants, for the one
   owner-assigned task, the task file **plus exactly the paths in its Allowed Write Surface**,
   with an explicit "if it's not in the surface, stop and ask" clause. `Allowed Write Surface`
   is now a required task-file field (AI_TASK_PROTOCOL.md, STAGE_TASK_TEMPLATE.md).
2. **blocker — commit approval not bound to the staged set.** Confirmed, including the
   evidence: the shared index really did hold another session's staged files during this audit.
   Fixed in CLAUDE.md (Workflow): approval binds to the exact staged set; the committing session
   must re-verify `git status --short` / `git diff --cached` immediately before `git commit`, and
   the approval is **void** if anything changed; never sweep another session's staged files into
   your commit. Mirrored in AI_TASK_PROTOCOL.md — Cross-Session Rules (the git index is a shared
   critical section, not a private workspace).
3. **should-fix — template couldn't encode the lifecycle; impossible commit-hash requirement.**
   Confirmed on both counts (a file cannot contain the hash of the commit that first records
   it). Template rewritten: full lifecycle incl. `awaiting-claude-review`/`superseded`, a new
   Execution block (Executor / Reviewer / Baseline commit / Allowed Write Surface / may-touch
   flags), branched Reporting (Claude vs Codex), and Execution Report + Claude Review Verdict
   sections. Commit hash replaced by date + stage-log pointer, in the template and in
   AI_TASK_PROTOCOL.md — Lifecycle.
4. **should-fix — delegation lost its baseline/ownership precondition.** Confirmed: it was in
   the accepted consensus of the delegation-scope thread but never filed into the protocol.
   Restored as an enforceable startup check (AI_TASK_PROTOCOL.md + AGENTS.md step 3): Codex
   reports working-tree state before planning and stops if HEAD ≠ recorded baseline or any
   Allowed-Write-Surface path is already dirty, unless the task explicitly assigns that diff.
5. **should-fix — queue's "active" invariant underspecified; orphaned queue could rot.**
   Confirmed both halves. Fixed in AI_CROSS_REVIEW.md: "active" now explicitly means any
   non-`queued` thread still in `reviews/` (`awaiting-review` | `awaiting-response` |
   `consensus`); creators must scan all three. Promotion is now also an **idempotent recovery
   check** run by any Claude session that creates/processes/cleans a thread — no active thread
   but a non-empty queue → promote the oldest. Mirrored in AGENTS.md step 1.
6. **should-fix — config-only changes skipped the pipeline; post-pipeline fixes needed no
   re-run.** Confirmed, and the "skip on config" rule was duplicated across three docs. Fixed:
   AI_REVIEW_PIPELINE.md (source of truth) now runs the gates for gate-affecting config
   (eslint/tsconfig/next/test config, package scripts+deps, CI, security headers) and re-arms
   the gates after **any** post-run file change; AI_DEVELOPMENT_WORKFLOW.md and
   AI_DEVELOPMENT_RULES.md now say "documentation only" and defer to the pipeline doc;
   CLAUDE.md's Pre-Commit Checklist updated to match.
7. **should-fix — universal observation/backlog duties vs. bounded write surface.** Confirmed —
   the first out-of-scope finding would have forced Codex to violate one rule or the other.
   Fixed: AI_TASK_PROTOCOL.md — Cross-Session Rules now routes by actor (Claude writes the
   journal/backlog directly; a delegated Codex records findings in its execution report only,
   and Claude files the accepted ones during the mandatory review pass). Mirrored as AGENTS.md
   step 7.
8. **nit — "external reviewer" used for Codex.** Confirmed terminology collision with the
   distinct `Reviewer: external` role. Fixed in AI_TASK_PROTOCOL.md — Cross-Session Rules, with
   an explicit note that the two roles are different.

**Note on the audit's own value:** findings 1, 4, and 7 all share one root cause — decisions
accepted in earlier review threads were never actually filed into an enforceable doc. That
pattern is now recorded in AI_FRAMEWORK_IDEAS.md, not just the individual fixes.

**Резюме для владельца (RU):** аудит окупился. Оба блокера были настоящие: делегирование Codex'у
физически не запустилось бы (у него не было прав писать код — только сам task-файл), а апрув
коммита не был привязан к застейдженному набору (параллельная сессия могла подмешать свои файлы
в одобренный тобой коммит — сегодня мы были в шаге от этого). Все 8 находок приняты и исправлены
в 8 доках. Общая причина большинства — фреймворк рос реактивно, и принятые в ревью решения не
доезжали до доков, где они бы реально работали.

## Consensus

All 8 findings accepted and fixed; no disputes, nothing deferred. Fixes span AGENTS.md,
.claude/CLAUDE.md, AI_TASK_PROTOCOL.md, AI_CROSS_REVIEW.md, AI_REVIEW_PIPELINE.md,
AI_DEVELOPMENT_WORKFLOW.md, AI_DEVELOPMENT_RULES.md, and templates/STAGE_TASK_TEMPLATE.md.
Root-cause pattern (accepted decisions not filed into enforceable docs) recorded in
AI_FRAMEWORK_IDEAS.md. Thread moves to `docs/project/reviews/done/`.
