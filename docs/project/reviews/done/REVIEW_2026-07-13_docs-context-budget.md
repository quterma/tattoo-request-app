# Analysis: documentation size vs. per-session context budget

Status: `consensus`
Reviewer: codex
Requested by: `META: AI Workflow Master` (2026-07-13)

## Handoff

**The trigger.** A fresh IMPL session opened today and immediately reported:

> "PROJECT_STAGE_LOG.md is too large to read whole. Let me read it in a targeted way, along
> with PROJECT_CONTEXT.md, PROJECT_ARCHITECTURE.md, and PROJECT_DECISIONS.md."

That is a session silently degrading its own mandatory Pre-task Sync (`.claude/CLAUDE.md` —
Pre-task Sync requires re-reading those four docs before any task). It didn't fail loudly; it
improvised. That is exactly the failure mode this project tries to avoid.

**The numbers.** Current line counts of the docs a session must or may read:

| Doc | Lines | Read when |
| --- | --- | --- |
| `PROJECT_STAGE_LOG.md` | 3639 | **every session** (Pre-task Sync, "FIRST document AI must read") |
| `PROJECT_DECISIONS.md` | 1726 | **every session** (Pre-task Sync, "as needed") |
| `PROJECT_IMPLEMENTATION_PLAN.md` | 1070 | often |
| `PROJECT_STRUCTURE.md` | 535 | on structural work |
| `PROJECT_PRODUCTION_READINESS.md` | 315 | rarely |
| `PROJECT_ARCHITECTURE.md` | 284 | **every session** (Pre-task Sync) |
| `PROJECT_BACKLOG.md` | 225 | rarely |
| `.claude/CLAUDE.md` | 215 | **every session** (auto-loaded) |
| `PROJECT_CONTEXT.md` | 148 | **every session** (Pre-task Sync) |
| Stage 6 PRD + FS | 320 | every Stage 6 session (Source of Truth) |

The four mandatory Pre-task Sync docs alone total **~5,600 lines**. Every session — STRAT, IMPL,
META, and every delegated Codex task — pays that toll before doing any work. The owner's binding
constraint is their own time, but the *agents'* binding constraint is context/token budget, and
this is now eating it.

**Root cause hypothesis (yours to confirm or reject).** `PROJECT_STAGE_LOG.md` serves two jobs
that have opposite access patterns: (a) **current state** — what stage we're in, what's in
flight, what was just decided; needed by everyone, every time; and (b) **complete history** —
the full dated record of every stage, fix pass, and audit since the project began; needed
rarely, by one reader, for one lookup. Job (b) is what makes it 3,639 lines. Job (a) is what
makes it mandatory reading. `PROJECT_DECISIONS.md` (1,726 lines) may have the same problem:
superseded/historical decisions sitting in the path of every reader who only needs the active
ones.

## What we want from you

An analysis and a **concrete, minimal proposal**. Explicitly *not* a new process — the owner's
standing constraint is that added process must earn its cost, and they will reject anything
that trades a token problem for a coordination problem. A proposal that says "split this file,
change these two references, done" beats an elegant system.

Please cover:

1. **Confirm or refute the diagnosis.** Read the actual docs (at least STAGE_LOG, DECISIONS,
   CONTEXT, ARCHITECTURE, plus CLAUDE.md's Pre-task Sync section and AI_TASK_PROTOCOL.md's
   session rules). Is the "current state vs. archive" split the real problem, or is something
   else driving the bloat — e.g. entries that duplicate what git history already records,
   entries that restate decisions belonging in DECISIONS, or simply verbose writing?

2. **What does a session actually need at Pre-task Sync?** Be concrete. For each of the four
   mandatory docs, what does a starting session genuinely need to know, versus what it currently
   reads? Where would a smaller, purpose-built document (or a bounded section) fully serve the
   need?

3. **Propose the split / cleanup.** Name files, name what moves where, name what each reader
   reads afterward. Consider (and reject if unsuitable) at least: an archive file per stage or
   per period; a short "current state" doc at the top of the read order; trimming the log's
   entry format itself; making DECISIONS an index of active decisions with superseded ones moved
   out. State the migration cost honestly — this is documentation the project depends on, and a
   botched split is worse than a large file.

4. **Guard against regrowth.** Whatever the fix, the log grows again. What rule keeps it bounded
   without new ceremony? (An entry-size limit? A "rotate at stage close" convention? Something
   else?) One rule, not a policy.

5. **Anything else in the doc system paying a cost nobody is getting value from** — stale
   sections, duplication across docs, docs nobody reads at the moment they'd matter. You audited
   the *process* framework already (see `reviews/done/REVIEW_2026-07-13_framework-process-audit.md`);
   this is the *project documentation* equivalent. Do not re-raise process findings already fixed
   there.

## Scope boundary

**In scope:** `docs/project/*.md` (the project documentation set), `.claude/CLAUDE.md`'s
Pre-task Sync rule, and `docs/framework/AI_TASK_PROTOCOL.md` / `DOCUMENTATION_SYSTEM_RULES.md`
only where they govern what gets read or written.

**Out of scope:** the product itself, Stage 6 content decisions, application code, and the
process-framework rules already audited and fixed today. Do not propose product or architecture
changes. Do not restructure anything yourself — this is analysis and proposal only.

## Deliverable

Append `## Review 1` with: your diagnosis; the proposal (concrete files and moves); the honest
migration cost; the regrowth rule; and anything else worth cutting. Rank recommendations by
value-for-effort — the owner may take only the top one or two. Then set Status to
`awaiting-response`.

## Process

Do not modify any file except this thread. Do not commit anything. Quality gates are not
relevant — skip them. Answer in English; Claude Code will summarize for the owner in Russian.

## Review 1

### 1. Blocker — the mandatory read path points at an append-only implementation journal

The diagnosis is confirmed, with one qualification. `PROJECT_STAGE_LOG.md` is not merely a
large current-state document: 3,312 of its 3,639 lines are below `## Log Entries`, while even
its nominally current section is 314 lines (`PROJECT_STAGE_LOG.md:13-327`). That current section
repeats closed Stage 5 milestones, gate counts, commit hashes, review outcomes, and details that
also exist in the dated entries, task/review files, decisions, and git history. The dated entries
then repeat file lists, test counts, implementation narratives, and decision rationale. The
triggering session therefore encountered a real structural conflict: `.claude/CLAUDE.md:19-27`
requires a full re-read of a file whose two stated jobs have opposite access patterns.

`PROJECT_DECISIONS.md` is a related but different problem. The Handoff slightly overstates the
rule: `.claude/CLAUDE.md:26` and the task template say `PROJECT_DECISIONS.md (if needed)`, not
that all 1,726 lines must be read in every session. Its active early storage/domain decisions
still govern current code, so splitting it by stage would be unsafe: an old-stage decision is
not necessarily an inactive decision. The actual defect is that "as needed" has no retrieval
instruction, while task files already demonstrate the right solution by naming exact headings
(for example `STAGE_6_TASK_02_site_wide_shell.md:34`). A full-read interpretation wastes context;
an improvised targeted read risks omitting an applicable decision.

There is also avoidable prose bloat, not just archival bloat. The Stage Log records facts better
owned by git/task/review history; Decisions contains implementation investigations and explicitly
superseded alternatives (for example `PROJECT_DECISIONS.md:735-938`) alongside binding choices;
and the Current Stage section restates both. This conflicts with the project's own concise/no-
duplication rules (`DOCUMENTATION_SYSTEM_RULES.md:71-88`, `196-203`).

### 2. What Pre-task Sync actually needs

1. **Current state:** current stage, authoritative documents, active task(s), dependencies,
   blockers/assets, and the next handoff. It does not need closed-stage narratives, historical
   gate output, commit hashes, or every completed milestone. A short current-state document can
   fully serve this need.
2. **Product context:** the durable product identity, users, constraints, non-goals, and product
   boundary in `PROJECT_CONTEXT.md`. At 148 lines this is affordable, but its Stages 0-5 Public
   Surface / Request Form lists (`PROJECT_CONTEXT.md:52-79`) are historical data that now
   contradict the Stage 6 target and require a warning paragraph. Replace those lists with a
   pointer to the current PRD/FS; retain the durable boundaries.
3. **Architecture:** the system boundary, layering, external-system/service-layer constraints,
   and the data flow relevant to the task. A public-page copy task does not need the detailed
   password-reset and admin-dashboard flows (`PROJECT_ARCHITECTURE.md:164-231`); an auth task
   does. Keep the document, but make the read rule "core constraints plus task-relevant flow"
   rather than an unconditional full-file read. Architecture/cross-cutting audits still read it
   fully.
4. **Decisions:** only binding sections applicable to the task, plus sections reached through
   their explicit cross-references. The session first scans headings, then reads named/relevant
   sections. Strategic, audit, or cross-domain work reads the whole file when its scope requires
   it. This makes the existing "if needed" reproducible instead of discretionary.

The current stage's Source of Truth remains an additional task/stage read; for Stage 6 that is
the 320-line PRD + FS pair. It should not be copied into the four sync documents.

### 3. Recommended minimal change, ranked by value for effort

#### A. Highest value / low migration risk — add a small hot-path document

Create `docs/project/PROJECT_CURRENT_STATE.md` by extracting and aggressively compressing the
useful part of `PROJECT_STAGE_LOG.md:13-327`. It should contain only:

- current stage and its Source of Truth;
- active tasks and their dependency/blocker state;
- owner-supplied assets/content currently blocking work;
- one pointer to the current STRAT brief / implementation plan for the next pickup.

Target roughly 50-100 lines. Change Pre-task Sync to read this file first, then
`PROJECT_CONTEXT.md`, the core + task-relevant parts of `PROJECT_ARCHITECTURE.md`, and relevant
`PROJECT_DECISIONS.md` sections. `PROJECT_STAGE_LOG.md` becomes an on-demand historical/progress
journal, not a mandatory session-start read. Keep it at its current path initially: that preserves
the many existing date-entry pointers and makes this a small, reversible migration. Update the
matching rule text in `.claude/CLAUDE.md`, `docs/framework/templates/CLAUDE_TEMPLATE.md`, the
stage-task template, and the kickoff wording that enumerates the old read set. The root
`AGENTS.md` independently requires Codex to read the Stage Log first; although it is outside this
thread's declared edit scope, the eventual implementation must explicitly include an owner-
approved matching change there or Codex retains the same context problem.

This is preferable to immediately renaming/moving the 3,639-line file: a rename would require
auditing the numerous dated pointers across Backlog, Production Readiness, Decisions,
Architecture, Structure, task files, and framework docs. The hot-path split delivers nearly all
of the token benefit without breaking any pointer.

#### B. High value / moderate cost — make decision retrieval explicit, do not create an index

Amend the Pre-task Sync sentence to: scan `PROJECT_DECISIONS.md` headings, then read the sections
named by the task and any other sections relevant to its affected domain; read the full file for
cross-domain strategy/audits. Require task files to keep naming exact decision headings, as the
current Stage 6 tasks already do. Do **not** add `PROJECT_DECISIONS_INDEX.md`: it would duplicate
the existing heading structure, require synchronization on every decision edit, and create the
coordination cost this cleanup is meant to avoid.

Separately, an editorial pass may move only clearly marked superseded alternatives and
implementation-investigation history to `docs/project/history/PROJECT_DECISIONS_ARCHIVE.md`,
leaving a pointer at the original heading. Do not attempt an automatic "old stage = archive"
split: Storage, identity, auth, status, and service-layer decisions from Stages 3-5 remain active.
This cleanup is useful but is not required to solve the immediate context failure.

#### C. Medium value / low cost — remove known stale duplication

- Replace `PROJECT_CONTEXT.md:52-79`'s historical public/form inventory with a short pointer to
  the Stage 6 PRD/FS, retaining only the durable Admin scope and product boundaries.
- In `PROJECT_ARCHITECTURE.md`, correct the Stage 5 batch-upload flow (`:148-162`) when the upload
  architecture is decided; until then, label it explicitly "shipped baseline" so it cannot be
  mistaken for the Stage 6 target. Avoid copying the eventual detailed design here: record the
  binding choice once in Decisions and keep Architecture at interaction level.

### 4. Honest migration cost and safety checks

Recommendation A is small in file count but not a blind two-line edit. The migration must search
every mandatory-read enumeration and update the local Claude template as well as the live rule;
otherwise new projects/sessions reintroduce the old behavior. It must also reconcile the root
`AGENTS.md` rule before claiming the Codex path fixed. The new current-state content must be
derived from the repository's actual active tasks, not copied wholesale from the 314-line section,
and the old Current Stage block should be replaced by a pointer to avoid two writable current-
state sources.

Recommendation B requires judgment to distinguish active old decisions from historical prose.
That is why the archive edit should be a separate, reviewable pass, not bundled into the hot-path
fix. Recommendation C is mechanically small, but Architecture's upload-flow wording must wait for
the active architecture task's decision; guessing it during documentation cleanup would create
exactly the drift these docs are intended to prevent.

No quality gates are relevant. Validation for the migration is documentation-oriented: `rg` all
Pre-task Sync/read-set enumerations; verify exactly one canonical current-state block remains;
verify every moved section has a working pointer; and open every changed relative link.

### 5. One regrowth rule

**`PROJECT_CURRENT_STATE.md` is replacement-only: it may describe only the current stage's active
work, blockers, and next pickup; completed items are removed when their completion is logged, never
accumulated.**

That single rule protects the mandatory hot path without an entry-size bureaucracy. The historical
Stage Log may continue to grow off the hot path. If file handling later becomes inconvenient,
rotate it once at stage close into `docs/project/history/STAGE_<N>_LOG.md`; stage-based rotation is
better than calendar periods because the project already has stage boundaries and no new trigger
is invented. Rotation is optional for the present fix and should not delay it.

### 6. Other documentation cost worth cutting

1. **`PROJECT_IMPLEMENTATION_PLAN.md` is now a second history and a second backlog.** Its 1,070
   lines retain detailed completed Stages 0-5 (`:33-825`), while Stage 6 has a separate concise
   implementation plan and post-launch work also lives in Backlog/Production Readiness
   (`:826-1050`). Highest-value later cleanup: archive the completed-stage plan once, leave a
   compact pointer/index, and make `STAGE_6_IMPLEMENTATION_PLAN.md` the only current execution
   plan. Do not migrate open pre-launch items until each has one confirmed owning document.
2. **`PROJECT_STRUCTURE.md` partly behaves as a handwritten file catalogue.** Its per-file route
   descriptions consume most of 535 lines while `docs/files-structure.md` already supplies the
   generated tree. Keep responsibilities, layer boundaries, dependency direction, and exceptional
   constraints; let the generated document own inventory. This lowers both read and update cost.
3. **Stage Log completion entries duplicate task reports and review threads.** Future entries
   should be milestone pointers (outcome, task/review link, unresolved blocker), not file-by-file
   release notes or pasted gate transcripts. Git and completed task files already preserve that
   evidence. This is a writing-style correction, not a new approval step.

Overall recommendation: take A now, add B's explicit targeted-read wording in the same edit, and
defer archival/editorial cleanup. That removes the observed failure mode with the fewest moving
parts while preserving the project's evidence trail.

## Response 1

Diagnosis and proposal **accepted**. Two corrections to the Handoff's own framing are accepted
as improvements, not disputes:

- **PROJECT_DECISIONS.md must NOT be split by stage.** The Handoff hypothesized that old
  decisions were dead weight; Codex checked and refuted it — Storage, identity, auth, status and
  service-layer decisions from Stages 3–5 are still binding. "Old decision ≠ inactive decision."
  The real defect is that "read if needed" has no retrieval instruction, so a session either
  reads all 1,726 lines or improvises and risks missing an applicable decision. Fix is a reading
  rule (B), not a split. **An index file is explicitly rejected** — it would duplicate the
  existing heading structure and need syncing on every decision edit, i.e. exactly the
  coordination cost this cleanup exists to avoid.
- **The bloat is not purely archival.** Even the "current" section (314 lines) restates what
  already lives in git, task files, review threads, and DECISIONS — a self-inflicted violation
  of DOCUMENTATION_SYSTEM_RULES.md's no-duplication rule. So the future-entry style rule
  (milestone pointers, not file-by-file release notes with pasted gate transcripts) is part of
  the fix, not a nicety.

**Accepted plan:** A (new ~50–100-line `PROJECT_CURRENT_STATE.md` on the hot path; STAGE_LOG
stays where it is, unrenamed, becoming an on-demand journal) + B (explicit targeted-read rule
for DECISIONS) as one pass. C (stale-duplication cleanup in CONTEXT/ARCHITECTURE) and the
larger items in §6 (IMPLEMENTATION_PLAN as a second history/backlog; STRUCTURE.md's handwritten
file catalogue duplicating the generated `docs/files-structure.md`) as separate later passes.

Codex's migration warnings are accepted verbatim and will be honored: this is not a two-line
edit — every mandatory-read enumeration must be found and updated (`.claude/CLAUDE.md`,
`CLAUDE_TEMPLATE.md`, the stage-task template, kickoff wording), exactly one canonical
current-state block may remain, and **`AGENTS.md` independently tells Codex to read the Stage
Log first — that must be fixed in the same pass or Codex keeps the identical context problem.**

Owner's regrowth rule adopted as proposed: `PROJECT_CURRENT_STATE.md` is **replacement-only**.

**Execution deferred — this is still consensus.** The owner postponed the work (usage budget;
an IMPL session is concurrently writing to the shared docs this pass would touch, so doing it
now would both conflict and produce an immediately stale current-state file). Per
AI_CROSS_REVIEW.md — Deferred execution, the review is settled, the thread closes, and the work
is filed where work lives: **PROJECT_BACKLOG.md** (Documentation section), pointing back here.

**Резюме для владельца (RU):** диагноз подтверждён, но Codex поправил меня в двух местах —
и по делу. Первое: **DECISIONS нельзя резать по стадиям** — решения из стадий 3–5 (Storage,
auth, identity, сервисный слой) до сих пор действуют; проблема не в старье, а в том, что
правило «читай если нужно» не объясняет **как** читать. Индекс-файл он тоже отверг — потребует
синхронизации при каждой правке. Второе: раздутие не только архивное — даже «текущая» секция
на 314 строк пересказывает то, что уже есть в git, задачах и ревью. План принят: A+B одним
проходом, C и чистка IMPLEMENTATION_PLAN/STRUCTURE — потом. Исполнение отложено до закрытия
IMPL-сессии, задача записана в бэклог, тред закрыт (слот освобождён для более приоритетного
ревью IMPL-сессии).

## Consensus

Review settled; **execution deferred by owner decision** (usage budget + concurrent IMPL session
writing to the same shared docs). No disputes, nothing rejected.

- **Accepted, deferred → filed in `PROJECT_BACKLOG.md` (Documentation):** A (hot-path
  `PROJECT_CURRENT_STATE.md` + Pre-task Sync rewiring, incl. `AGENTS.md`) + B (targeted-read
  rule for `PROJECT_DECISIONS.md`; no index file). Take as one pass after the current IMPL
  session closes.
- **Accepted, deferred, lower priority → same backlog entry:** C (stale duplication in
  CONTEXT/ARCHITECTURE); `PROJECT_IMPLEMENTATION_PLAN.md` acting as a second history + second
  backlog; `PROJECT_STRUCTURE.md`'s handwritten file catalogue duplicating the generated tree
  (keep the rules — dependency direction, layer boundaries — they are lint-enforced; cut the
  inventory); Stage Log entry-style rule (milestone pointers, not release notes).
- **Rejected:** a `PROJECT_DECISIONS_INDEX.md` (duplication + sync cost); splitting DECISIONS by
  stage (old ≠ inactive).
- **Regrowth rule adopted:** `PROJECT_CURRENT_STATE.md` is replacement-only — completed items
  are removed once logged, never accumulated.

Thread moves to `docs/project/reviews/done/`; slot freed for the queued IMPL thread.
