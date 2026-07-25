# Task: Tooling — `pnpm project:status` (read-only process status view)

(Not Stage 6 product work: this is process tooling, independent of the public-website stage. It
does not appear in STAGE_6_IMPLEMENTATION_PLAN.md and blocks nothing there.)

## Status

`done` · created 2026-07-14 · promoted `ready` 2026-07-25 (owner decision, delegation to Codex)
· Codex execution completed 2026-07-25 · Claude review passed 2026-07-25
· done: 2026-07-25 · PROJECT_STAGE_LOG.md — "2026-07-25 — TOOLING: `pnpm project:status`"

Source: `docs/project/research/done/RESEARCH_2026-07-14_open-question-trigger-and-thread-visibility.md`
(Q2 — owner decision 2026-07-14: build the command).

## Execution

- Executor: `codex` — deterministic, local, decision-free: a read-only script over files whose
  format is already fixed, with an objective expected output. Delegable per AI_TASK_PROTOCOL.md.
- Reviewer: `claude` — mandatory independent review pass + full `pnpm qg`.
- Baseline: the commit that introduced this task file — derive it with
  `git log -1 --format=%H -- docs/project/tasks/TOOLING_TASK_01_project_status_command.md`. Stop
  only if a path in the Allowed Write Surface is dirty or has moved since then.
- Allowed Write Surface (nothing outside it):
  - `scripts/project-status.mjs` (new)
  - `package.json` (add exactly one script entry: `project:status`)
  - `scripts/__tests__/project-status.test.ts` (new. Resolved 2026-07-25: no script-test pattern
    exists in the repo yet; use this path — vitest's include glob
    `**/__tests__/**/*.{test,spec}.{ts,tsx}` picks it up with **no** config change.
    `vitest.config.ts` is outside the surface and must not be touched.)
- May touch dependencies / migrations / generated files / shared docs: **no**. The script must be
  dependency-free (Node 20 built-ins only — the repo already does this in
  `scripts/update-structure.mjs`; read it first and follow its conventions).

## How to run (session settings)

- Executor session: fresh Codex session; owner kickoff
  `Execute docs/project/tasks/TOOLING_TASK_01_project_status_command.md` (this IS the delegation
  authorization per AI_TASK_PROTOCOL.md). Codex still presents a plan and waits for approval.
- Reviewer session: Claude, standard tier is enough (review + full `pnpm qg`).
- See docs/framework/AI_TASK_PROTOCOL.md — Session Settings Guidance

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. `docs/framework/AI_TASK_PROTOCOL.md` — Task Files (lifecycle, statuses, `Executor`/`Reviewer`/
   Baseline/Allowed Write Surface fields); Delegating IMPL Tasks to Codex (the baseline rule this
   command must check).
3. `docs/framework/AI_CROSS_REVIEW.md` — review thread statuses and the one-active-thread rule;
   research thread statuses; the `.request.md`/`.answer.md` transport buffers.
4. `scripts/update-structure.mjs` — the existing dependency-free script pattern (invocation, style,
   how it is wired into `package.json`).
5. The research thread named under Status above — it contains the reasoning and the rejected
   alternatives; do not re-litigate them.

## Goal

A read-only command that prints what is currently open and what is internally inconsistent, derived
entirely from the canonical files on disk. It replaces reading directories by eye. It **writes
nothing** — stdout is the whole product.

## Scope

1. **Tasks** — every file in `docs/project/tasks/` and `tasks/done/`: name, `Status`, `Executor`,
   `Reviewer`, and location.
2. **Review threads** — every file directly under `docs/project/reviews/` (not `done/`): name,
   `Status`, `Reviewer`, `Requested by:`.
3. **Research threads** — same, for `docs/project/research/`.
4. **Integrity warnings** — the point of the command, not a bonus. At minimum:
   - a task whose `Status` is missing, unknown, or duplicated;
   - an illegal status/location combination (`done` still in `tasks/`; a non-`done` file in
     `tasks/done/`);
   - **more than one active review thread** (active = any status other than `queued`, still outside
     `done/`) — the protocol's one-active-thread invariant;
   - a `queued` review thread while no thread is active (an orphaned queue);
   - a research thread in `awaiting-external` whose `.request.md` or `.answer.md` buffer is missing;
   - **a task carrying a literal `Baseline commit: <hash>`** — the convention forbids it (a file
     cannot name the commit that carries it; see AI_TASK_PROTOCOL.md). This exact defect was live
     in `STAGE_6_TASK_08` and is what motivated the command.
   - **a `done` task whose `## Completion obligations` entry has no resolvable disposition** —
     neither completion evidence nor a `tracked in:` target that exists (AI_TASK_PROTOCOL.md —
     Completion Obligations). Warn, do not error, for tasks created before the section existed:
     enforce on files that contain it, and do not fail the whole repo retroactively.
   - a `tracked in:` target that points at a **journal or brief** (PROJECT_STAGE_LOG.md, a STRAT
     brief) rather than a task file or backlog entry — a sentence in a journal is not a work item.
5. **Blocking work is surfaced, not buried.** Print every non-`done` task's `Blocks:` target
   prominently (the command may render it as `⛔ BLOCKS <target>`), derived from the task's own
   metadata. `Status` remains the source of truth for whether the work is open; `Blocks` only says
   what it holds up. Do NOT introduce a separate open-actions file — that design is rejected
   (AI_TASK_PROTOCOL.md — Completion Obligations).
6. **Header parsing must tolerate the formats that actually exist.** Status values appear both
   backticked (`` Status: `consensus` ``, the canonical form) and bare (`Status: consensus` — one
   legacy thread), and may carry trailing free text (`` Status: `closed` · outcomes filed … ``).
   Strip backticks, take the first token, ignore the rest — see AI_CROSS_REVIEW.md, Header format.
   A parser that matches only one form finds nothing and reports a false "no threads". (This is
   not hypothetical: a Codex research turn hit exactly this on 2026-07-14.)
7. **Git overlay only** — mark artifacts that are modified/untracked relative to HEAD, so a
   held working-tree change is not mistaken for committed state. The filesystem is the source; git
   is an annotation on it. (Do not build the view from `git log`: this repo routinely holds
   uncommitted work across sessions.)
8. **Honest gaps** — for categories that are not structured data today (blocked work and
   deferred-accepted findings live in prose), print `not represented by structured data` rather
   than scraping prose and presenting the result as complete.

## Out of Scope

- Writing, generating, or persisting any status file. Explicitly rejected in the research thread:
  a generated status document is stale the moment generation is not the last action, and this
  project already has a scar from docs that confidently lied about world state. stdout only.
- Normalizing the task/backlog schema (adding a `blocked` status, uniform backlog fields). That is
  the research thread's Q2 Option B — a separate decision the owner has not made.
- Any change to the review/research protocols themselves.
- CI wiring.

## Workflow (enforced)

1. Read the Context docs; confirm understanding in 3–5 lines.
2. Read `scripts/update-structure.mjs` before designing anything — match its conventions.
3. Present a plan (incl. the exact output shape) and wait for explicit approval. The plan must
   carry a **"Deviations from the task file"** section (or "no deviations").
4. Implement within Scope only.
5. Gate loop (Codex owns it): run `pnpm lint` / `pnpm typecheck` / `pnpm test` — the non-mutating
   gates only; never `pnpm qg`, `pnpm structure`, or `pnpm build` (they write files). Iterate to a
   clean pass, or stop and report exactly which check failed and why.
6. Write the execution report into this file (Reporting below), set Status
   `awaiting-claude-review`. **No separate cross-review thread** — for a routine delegated task
   the report and Claude's review verdict live here (AI_TASK_PROTOCOL.md — Delegating IMPL Tasks
   to Codex). Claude then reviews the diff as an unfamiliar patch, runs the full `pnpm qg` itself,
   and owns docs / `done` / commit proposal.

## Acceptance Criteria

- `pnpm project:status` prints tasks, review threads, and research threads with their statuses,
  and writes nothing (verify: `git status` is unchanged after a run).
- It flags every integrity warning in Scope 4. Specifically, it must flag a literal
  `Baseline commit:` hash if one is reintroduced.
- Exit code: non-zero on malformed/contradictory metadata; **zero when work is merely open** (open
  work is not an error).
- It fails loudly on unparseable metadata rather than silently omitting the artifact.
- Categories with no structured representation print the honest placeholder, not a guess.
- `pnpm qg` passes.

## Completion obligations

None.

Reconciled 2026-07-25 against the four objective sources: no migration/schema change, required
environment variable or external configuration, manual/real-boundary acceptance check, or deferred
review finding was introduced.

## Review Granularity

`single`. Actual measured surface: **2 execution-affecting files / 806 lines of
execution-affecting churn** (`scripts/project-status.mjs`: 805 added lines; `package.json`: one
added script entry). The 325-line test file, this task report, and generated files are excluded
from the trigger per AI_TASK_PROTOCOL.md.

This crossed the 500-line trigger after the plan's below-threshold estimate. No checkpoint was
created: the implementation is one dependency-free CLI contract whose parsing, integrity
validation, rendering, Git overlay, and exit code must work together; splitting those internals
would have produced either an acceptance-incomplete command or a temporary same-file interface,
not an independently useful green block. The full integrated surface is handed to Claude for the
mandatory unfamiliar-patch review.

## Reporting

Per STAGE_TASK_TEMPLATE.md — Reporting (`Executor: codex` branch).

## Execution Report (filled by the executor)

### Changed

- Added dependency-free `scripts/project-status.mjs` using Node 20 built-ins only. It reads every
  task artifact in `docs/project/tasks/` plus `tasks/done/`, direct active review/research
  artifacts, and Git porcelain state; transport buffers are validation dependencies rather than
  thread rows.
- Added the exact `package.json` script `project:status`.
- Added `scripts/__tests__/project-status.test.ts` with seven isolated temporary-Git-repository
  scenarios covering status formats, all required invariant classes, `Blocks:`, completion
  dispositions/targets, Git overlay, exit behavior, and read-only operation.
- No dependency, lockfile, config, generated-file, migration, application-source, or shared-doc
  change.

### Verification

- `pnpm project:status`: command ran successfully as a program and exited `1`, correctly reflecting
  the current repository's pre-existing malformed/contradictory metadata; `git status` before and
  after was byte-for-byte unchanged (`GIT_STATUS_UNCHANGED=true`).
- `pnpm lint`: **PASS** — 0 errors; one pre-existing unrelated
  `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx:32`.
- `pnpm typecheck`: **PASS**.
- `pnpm test`: **PASS** — 33 test files, 406 tests.
- `pnpm exec prettier --check scripts/project-status.mjs
  scripts/__tests__/project-status.test.ts package.json`: **PASS**.
- `git diff --check`: **PASS**.

### Unresolved / out-of-scope findings

None in the implementation. The non-zero real-repo status is expected and demonstrates the
command's integrity contract. It surfaced these pre-existing records, left unchanged because they
are outside the Allowed Write Surface:

- `STAGE_6_STRAT_BRIEF.md` sits in the task directory but has no task status/execution metadata.
- `STAGE_6_TASK_17_studio_config_extraction.md` is `done` but remains outside `tasks/done/`.
- Unresolved or non-canonical completion-obligation dispositions in Tasks 03, 05, 06, 07, 10, and
  12, including STRAT-brief targets and a backlog pointer without a resolvable entry anchor.
- Legacy done Tasks 01, 02, 08, and 09 have no Completion obligations section; these are warnings,
  not errors, by the task's retroactivity rule.

## Claude Review Verdict (delegated tasks only)

**PASS** (2026-07-25) — reviewed as an unfamiliar contributor's patch: the acceptance criteria were
re-derived from this file before reading the execution report, and the complete diff including
untracked files was inspected.

**Authorization** — every changed path is inside the Allowed Write Surface
(`scripts/project-status.mjs`, `scripts/__tests__/project-status.test.ts`, one `package.json`
script entry). No dependency, lockfile, config, migration, application-source or shared-doc change;
`vitest.config.ts` untouched (the new test is picked up by the existing include glob, as the task
predicted). Node built-ins only.

**Independently verified, not taken from the report:**

- `pnpm project:status` run against the live repository: exits `1` on real integrity errors, and
  `git status --porcelain` is byte-identical before and after — the read-only contract holds.
- `pnpm qg` (mandatory, re-run by Claude after the review fix below): **PASS** — structure, lint
  (0 errors; one pre-existing unrelated `no-img-element` warning), typecheck, 33 test files /
  407 tests, production build all green.
- Spot-checked the integrity findings against the source documents rather than trusting the
  output: Task 03 CO-3 ("expected `None`; confirm at close" — never confirmed), Task 06 CO-2
  (`PARTIAL`) and CO-3 (`OPEN — owner`), Task 07 CO-3 and Task 10 CO-4 (both track work in the
  STRAT brief), Task 12 CO-5 (owner debt carried in the brief). All are **true positives** — the
  command's first real run found genuine unresolved obligations behind closed tasks.

**Two should-fixes found and fixed during review** (each treated as a new diff; gates re-run above).

The second was found by the command itself, on this very task file: the explicit-`None`
completion-obligations marker was matched only as a bare line, so `None.` — the form this
repository actually uses (also `STAGE_6_TASK_08`) and the form AI_TASK_PROTOCOL.md's "write an
explicit `None`" naturally produces — was reported as a missing entry. It now matches the word at
line start, with a test. Left as-is deliberately: the tool exits non-zero on the live repository,
which is correct — that is real debt, not a parser artifact.

The first:
`STAGE_6_STRAT_BRIEF.md` lives in `docs/project/tasks/` **by protocol**
(AI_TASK_PROTOCOL.md — STRAT Next-Session Brief) but carries no task metadata, so parsing it as a
task produced three permanent `ERROR`s plus a junk row, making exit `1` unconditional and the exit
code meaningless. `taskFiles()` now excludes `*_STRAT_BRIEF.md`, with a test. **This deviates from
Scope 1's literal "every file in `docs/project/tasks/`"** — recorded here rather than applied
silently; the wording predates nothing in the brief's favor, and a status command that always
reports a malformed repository fails its own acceptance criterion ("zero when work is merely
open").

**Accepted as correct-by-design, not defects:** the anchor requirement on `PROJECT_BACKLOG.md`
targets (an unanchored backlog pointer is unverifiable); the non-zero exit on the live repository
(it reflects real debt, now routed to PROJECT_BACKLOG.md).

**Nits left unfixed deliberately** (cosmetic, not worth a churn round — the corpus evidence on
review-round economics argues against polishing here): a single unresolved obligation can emit both
`TASK_COMPLETION_TARGET_MISSING` and `TASK_COMPLETION_UNRESOLVED`; Task 12 CO-5 names the STRAT
brief in prose rather than `tracked in:` syntax, so it is reported as `UNRESOLVED` instead of the
more precise `TARGET_NOT_WORK_ITEM`.

**Out-of-scope finding routed, not fixed in this diff:** the command's first run surfaced 9
unresolved completion obligations across Tasks 03/05/06/07/10/12 and one misplaced `done` task
(`STAGE_6_TASK_17`, still in `tasks/`). Filed as a PROJECT_BACKLOG.md entry; the misplaced file was
moved to `tasks/done/` as protocol-mandated housekeeping (AI_TASK_PROTOCOL.md — Lifecycle).
