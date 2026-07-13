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
- Header fields: `Status:` (drives who acts) and `Reviewer: codex | external` (drives WHO
  reviews — prevents Claude Code waiting on Codex when an external review was agreed, and
  vice versa).
- The whole dialogue lives in this one file as appended sections; history is preserved in git.
- **At most one thread may have status `awaiting-review` at a time.** A side asked to act
  that finds zero or multiple matching threads stops and asks the owner — never guesses.
- Status header at the top drives who acts next:

| Status | Meaning | Who acts |
| --- | --- | --- |
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
