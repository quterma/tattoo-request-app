Purpose
Define the cross-review protocol between Claude Code (author) and an independent reviewer —
Codex (repo access) or an external AI (no repo access): review-thread files, turn structure,
statuses, and cleanup.

Scope
Cross-tool review workflow only. Session organization lives in AI_TASK_PROTOCOL.md; the
in-session review pipeline (Test Agent / Quality Gates / Review Agent) lives in
AI_REVIEW_PIPELINE.md and is NOT replaced by this document. Codex behavior rules live in
AGENTS.md (repository root).

Audience
Claude Code sessions, Codex sessions, and the owner.

---

# Roles

- **Claude Code** — primary agent: design, analysis, implementation, and processing of
  reviews. Writes Handoff and Response sections; commits review files (with owner approval).
- **Codex** — independent reviewer with repo access: read-only everywhere except
  `docs/project/reviews/`; writes Review sections; never commits (AGENTS.md — Hard rules).
  Codex acts ONLY on threads with `Reviewer: codex`.
- **External reviewer** — an AI outside this repository (no file access); reviews via
  copy-paste transport carried by the owner (see External Reviewer Flow below). Threads
  marked `Reviewer: external` are never Codex's to act on.
- **Owner** — pings each side with a one-line prompt and decides on disputed findings; for
  external threads additionally carries the request/answer between the repo and the external
  AI. The protocol is status-driven so pings never need to explain state.

Independence rule: Codex reviews against the repository and docs, not against Claude's chat
reasoning — the Handoff section states scope and questions, not the author's conclusions.

# Review Threads

- Location: `docs/project/reviews/REVIEW_<YYYY-MM-DD>_<slug>.md` — one file per review
  thread (one reviewed block: an implementation task, a spec, a design/stage block).
- Header fields:
  - `Status:` — drives who acts next (table below).
  - `Reviewer: codex | external` — drives WHO reviews (prevents Claude Code waiting on Codex
    when an external review was agreed, and vice versa).
  - `Requested by:` — the session that opened the thread, by its title (e.g.
    `META: framework audit`, `STRAT: Stage 6 UX blueprint`, `IMPL: Stage 6 item 2 shell`).
    Findings usually belong to that session's work; without this, a later reader cannot tell
    who should act on them or which session to return to.
- The whole dialogue lives in this one file as appended sections; history is preserved in git.
- **A thread is ACTIVE if it is not `queued` — i.e. its status is `awaiting-review`,
  `awaiting-response`, or `consensus` — and it still sits in `docs/project/reviews/` (not
  `done/`). At most one thread may be active at a time.** A dialogue mid-flight is still
  occupying the slot: do not create a new active thread just because nothing is currently in
  `awaiting-review`.
- Parallel review requests are allowed via the queue: a thread created while another is active
  starts as `queued` (parked — nobody acts on it). Before creating a thread, scan all three
  active statuses, not just `awaiting-review`.
- **Queue promotion, and recovery if it was missed.** Whoever moves the active thread to
  `done/` must then promote a `queued` thread to `awaiting-review` and tell the owner it is
  ready for the next ping. Default is oldest-first, but the owner may prioritize any queued
  thread — work that blocks an active session outranks analysis that can wait. Because a
  session can die between those two steps, promotion is also a recovery check, not only a duty:
  **any Claude session that creates a thread, processes a review, or cleans one up must first
  check for an orphaned queue — no active thread but one or more `queued` — and promote one if
  so.** The check is idempotent and costs one directory scan. Report the current queue size to
  the owner whenever it is greater than zero.
- The reviewer handles exactly one thread per owner ping — the next review starts only after
  another explicit ping, never automatically.
- A side asked to act that finds zero or multiple threads matching what it expects stops and
  asks the owner — never guesses.
- Status header at the top drives who acts next:

| Status | Meaning | Who acts |
| --- | --- | --- |
| `queued` | Created while another thread was active; parked | Nobody (promoted on active thread's close) |
| `awaiting-review` | Handoff (or Response) written, review requested | Codex |
| `awaiting-response` | Review written | Claude Code |
| `consensus` | Both sides agree; outcomes filed | Claude Code (cleanup) |

# Turn Structure (appended sections)

1. `## Handoff` — Claude Code, at block completion: what was done (one paragraph), commit
   range or file list, scope boundary, specific focus questions. No self-assessment beyond
   facts — the reviewer must stay independent.
2. `## Review <N>` — Codex: numbered findings (severity: blocker / should-fix / nit /
   question), each with file/line pointers; optionally the non-mutating quality-gate results
   (`pnpm lint` / `pnpm typecheck` / `pnpm test` — the reviewer never runs `pnpm qg`,
   `pnpm structure`, or `pnpm build`, which write files); open questions. Set Status
   `awaiting-response`.
3. `## Response <N>` — Claude Code: verdict per finding (accept / reject / needs-owner) with
   one-line rationale; a short Russian summary for the owner at the end of the section.
   Disputed items go to the owner. Set Status `awaiting-review` (next round) or `consensus`.
4. Repeat 2–3 until consensus.
5. `## Consensus` — final list: accepted findings and where each was filed (fix commit, task
   file, PROJECT_BACKLOG.md), rejected findings with rationale.

## Deferred execution (review done, work postponed)

A thread reaches `consensus` when the *review* is settled — the findings are understood and the
owner has decided what to do with them. It does NOT require the work to be finished. Accepted
findings whose execution is postponed (owner priority, usage budget, a conflicting active
session) are **still consensus**: close the thread, move it to `done/`, free the slot.

The deferred work itself goes where work already lives — never in a lingering review thread:

- a `draft` task file (`docs/project/tasks/`) if it is concrete enough to execute, or
- `PROJECT_BACKLOG.md` if it is not yet.

Either way the entry names the thread it came from (`reviews/done/REVIEW_<...>.md`) and the
session that requested it (the thread's `Requested by:`), so a later reader can reconstruct the
reasoning without reopening the review. **Never park deferred work by leaving a thread open** —
that blocks the review slot and hides the work from the places the owner actually looks.

Anti-rot: any session that reports the review queue to the owner also reports open deferred
items it filed or found (one line each: what, where it's filed, what it's waiting on). Same
cost as the queue-size report, same purpose — nothing accepted quietly disappears.

# External Reviewer Flow (`Reviewer: external`)

The external AI cannot read the repository, so the owner is the transport and the request
must be self-contained. Per round, Claude Code maintains two transient files next to the
thread:

- `REVIEW_<date>_<slug>.request.md` — the outbound request: all needed context embedded
  inline (doc excerpts, diffs, code fragments) plus the questions — copyable as-is, no repo
  references the external AI can't resolve.
- `REVIEW_<date>_<slug>.answer.md` — created empty; the owner pastes the external AI's
  answer into it, in any format.

Round flow:

1. Claude Code writes the thread's Handoff (or next Response), generates `request.md`,
   creates/empties `answer.md`, and hands the owner two links: "copy from → save to".
2. The owner carries the request out, pastes the answer in, and pings Claude Code
   (`Process the external review`).
3. Claude Code normalizes the answer into the thread as `## Review <N> (external)` (the
   thread file remains the single source of history), reconciles as usual, and either
   prepares the next round's `request.md` or closes with Consensus.

Transient-file cleanup: `request.md` / `answer.md` are copy buffers — their content is always
duplicated into the thread, so on Consensus they are **deleted** (the never-delete convention
applies to threads, not to these buffers). Only the thread moves to `done/`.

# Consensus and Cleanup

- Accepted findings become work items per existing conventions: immediate fixes (owner-
  approved), task files, or PROJECT_BACKLOG.md entries — the review file itself is a
  discussion record, not a work tracker (no duplication).
- After Consensus: Claude Code moves the file to `docs/project/reviews/done/` (same
  never-delete convention as task files) and notes the review in PROJECT_STAGE_LOG.md if the
  outcome changed progress or decisions.
- No `REVIEW_*.md` files directly under `docs/project/reviews/` means no active review debt
  (`.gitkeep` and the `done/` subdirectory don't count).

# Owner Effort (by design)

Codex thread — two one-line pings per round, nothing else:

- to Codex: `Review per AGENTS.md` (it finds the `awaiting-review` thread itself)
- to Claude Code: `Process the Codex review` (it finds the `awaiting-response` thread itself)

External thread — two one-line pings plus the copy-paste transport:

- to Claude Code: `Подготовь внешнее ревью: <тема>` → get two links (request → answer)
- carry the request out, paste the answer in, then: `Process the external review`
