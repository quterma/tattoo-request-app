Purpose
Define the cross-review protocol between Claude Code (author) and an independent reviewer —
Codex (repo access) or an external AI (no repo access): review-thread files, turn structure,
statuses, and cleanup.

Scope
Cross-tool workflow between Claude Code and an independent AI: **review threads** (a finished
block is checked) and **research threads** (an open question is investigated — see Research
Threads below). Session organization lives in AI_TASK_PROTOCOL.md; the in-session review pipeline
(Test Agent / Quality Gates / Review Agent) lives in AI_REVIEW_PIPELINE.md and is NOT replaced by
this document. Codex behavior rules live in AGENTS.md (repository root).

Audience
Claude Code sessions, Codex sessions, and the owner.

---

# Roles

- **Claude Code** — primary agent: design, analysis, implementation, and processing of
  reviews. Writes Handoff and Response sections; commits review files (with owner approval).
  **Which Claude session owns a thread is not arbitrary: the session that produced the reviewed
  block owns its review loop end to end** (for an implementation block that is the IMPL session,
  which stays open until consensus — AI_TASK_PROTOCOL.md, Post-Review Fix Loop). A STRAT session
  must not pick up another session's review thread and start fixing code in it; that is IMPL
  work done in a strategic context. META threads are owned by the META session, and so on.
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
- Header fields — see **Header format** below; it is a contract, not a style preference:
  - `Status:` — drives who acts next (table below).
  - `Reviewer: codex | external` — drives WHO reviews (prevents Claude Code waiting on Codex
    when an external review was agreed, and vice versa).
  - `Requested by:` — the session that opened the thread, by its title (e.g.
    `META: framework audit`, `STRAT: Stage 6 UX blueprint`, `IMPL: Stage 6 item 2 shell`).
    Findings usually belong to that session's work; without this, a later reader cannot tell
    who should act on them or which session to return to.

## Header format (both thread types)

The header is **read by machines** — an agent locating the one thread it must act on, and
(once built — `tasks/TOOLING_TASK_01_project_status_command.md` is still `draft`) the
`pnpm project:status` command — so its shape is fixed:

- Each field is its own line at the top of the file, `Field: value`, nothing before the colon.
- **The status value is wrapped in backticks**: `` Status: `awaiting-review` `` — the dominant
  form in the existing threads, and the one to write from now on.
- **A reader must accept the value with or without backticks.** This is not permission to write it
  loosely; it is a reader obligation, because the existing threads are already inconsistent (one
  `consensus` sits bare among eight backticked ones) and a reader that only matches one form
  silently finds nothing.
- Anything after the status value (a date, a pointer) is free text and must be ignored by readers:
  `` Status: `closed` · outcomes filed 2026-07-14 `` is valid.
- `Researcher:`/`Reviewer:` values are written **bare**: `Researcher: codex`.

Never invent a status value. If a thread needs a state the table below does not have, that is a
protocol gap — raise it (AI_FRAMEWORK_IDEAS.md), do not improvise a new word into the header.

(2026-07-14: this is written down because a Codex research turn searched for
`^Status:\s*awaiting-research\s*$`, found zero matches against a backticked header, and — per the
"stop if you find zero or several" rule — should have halted. It recovered by reading the headers
by eye, which is exactly the fragility this section removes.)
- The whole dialogue lives in this one file as appended sections; history is preserved in git.
- **A thread is ACTIVE if it is not `queued` — i.e. its status is `awaiting-review`,
  `awaiting-response`, or `consensus` — and it still sits in `docs/project/reviews/` (not
  `done/`). At most one **review** thread may be active at a time.** A dialogue mid-flight is
  still occupying the slot: do not create a new active thread just because nothing is currently in
  `awaiting-review`. (This slot counts review threads only — research threads live in
  `docs/project/research/` and never occupy it; see Research Threads below.)
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
   question), each with file/line pointers. **Always check external-boundary feasibility**: does
   the block actually survive the limits of systems nobody here owns (platform request/response
   ceilings, runtime and payload limits, browser capabilities, third-party API behavior)? Unit
   tests routinely exercise a handler *below* such a boundary and cannot see the violation — this
   is where that class is caught (AI_TASK_PROTOCOL.md — Name the basis of a claim the repo does not
   own). Optionally include the non-mutating quality-gate results
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

# Research Threads (an open question, not a reviewed block)

A review answers "is this finished work correct?". A **research thread** answers "what should we
do about X?" — an open question that needs investigation before anyone can decide or implement.
It has no diff, no block, and nothing to hand off, so it cannot be dressed up as a review: the
`## Handoff` turn demands finished work and the `## Consensus` turn closes a verdict, neither of
which exists here. (Real case, 2026-07-14: the Codex review of the upload flow found the FS's
10 MB limit undeliverable through a Vercel Function; the fix direction — client-side image
compression — was a genuinely open question, and the session had nowhere to put it.)

- Location: `docs/project/research/RESEARCH_<YYYY-MM-DD>_<slug>.md`. Never deleted; closed
  threads move to `docs/project/research/done/`, same convention as reviews and task files.
- Header: `Status:` (table below), `Researcher: codex` (default — see below), `Requested by:`
  (the session that opened it, by title).
- **A research thread does NOT occupy the review slot.** The one-active-thread rule exists so a
  live *review* dialogue is unambiguous and the owner's ping resolves to exactly one thread;
  research contends with none of that — it blocks no commit and reviews no diff. Research threads
  have their own slot, and more than one may be open. The same anti-rot duty applies: any session
  reporting the review queue also reports open research threads (one line each: question, where
  filed, what it's waiting on).
- **Researcher is `codex` by default** (owner decision 2026-07-14). Handing the *whole thread* to
  an external AI buys nothing and costs the automation: Codex reads the thread and writes its
  answer itself, whereas an external AI needs the owner to carry every turn by copy-paste. That is
  an argument about who **owns** the thread — not a ban on reaching outward, which Codex can and
  sometimes must do for part of a question (next bullet but one).
- **Codex's reach is limited, and it must route around that rather than guess.** Findings are
  labelled by provenance: *verified against the repo* (a file was read, a command was run) vs.
  *model knowledge* (what comparable products do, how a browser behaves, what a library weighs) —
  the latter is a lead to confirm, never a fact to build on. This is the existing rule against
  laundering a report into a fact (AI_TASK_PROTOCOL.md — Session Duties), applied to research.
- **Codex may — and on some questions must — delegate part of the research to an external AI**
  (owner decision 2026-07-14). Where an answer turns on *current external facts* — what comparable
  products actually do, how a browser or platform behaves today, a library's real size or API,
  a service's limits or pricing — Codex does not answer from model knowledge and call it research:
  it **writes the prompt for the external AI itself** and hands it to the owner, who carries it
  out and brings the answer back. "Ask if unsure" would be a dead rule (models are rarely unsure);
  the trigger is the *kind* of question, not Codex's confidence in it.
  - **Codex stays the owner of the answer.** The external AI is Codex's instrument, not a second
    voice in the thread: Codex normalizes the returned answer into its own `## Findings` — what it
    accepted, what it discarded, what it could cross-check against the repo — and keeps labelling
    provenance (now with a third label: *external AI, unverified*). A raw external answer is never
    pasted in as a finding of its own; nobody would then own its verification.
  - Transport is the owner's, same as `Reviewer: external`: Codex writes
    `RESEARCH_<date>_<slug>.request.md` next to the thread and leaves an empty
    `RESEARCH_<date>_<slug>.answer.md`; the owner pastes the reply in and pings Codex again. On
    close, both buffers are deleted — their content already lives in the thread.

| Status | Meaning | Who acts |
| --- | --- | --- |
| `awaiting-research` | Question written, research requested | Codex |
| `awaiting-external` | Codex wrote a prompt for an external AI; `.request.md` ready | Owner (carries it out, pastes the reply into `.answer.md`, pings Codex) |
| `awaiting-response` | Findings written | Claude Code |
| `awaiting-owner` | Findings processed; the remaining choice is the owner's | Owner (decides; a Claude session then files the `## Outcome`) |
| `closed` | Outcome filed in a durable doc | — (thread moves to `research/done/`) |

`awaiting-owner` is the normal terminal state of a useful research thread, not an exception: the
thread's whole purpose is to inform a decision it may not make itself. Do not park a decided
question there — once the owner has chosen, file the `## Outcome` and close.

Turn structure: `## Question` (Claude Code — the open question, why it is open, what a usable
answer must cover, and the constraints the answer must respect: the relevant PRD/FS sections,
platform limits, decisions already made) → `## Findings <N>` (Codex — the investigation, each
finding labelled by provenance per above; options with trade-offs, not a verdict) → `## Response
<N>` (Claude Code — what is usable, what needs confirmation, what is still open; a short Russian
summary for the owner) → repeat if a follow-up round is needed → `## Outcome`.

**A research thread never decides anything.** Its answer is *input to a decision the owner makes*
— filing it as a decision would replace the owner's judgment with "Codex said so", the same
rubber-stamp failure the framework already rejected for STRAT sign-off. The thread therefore
closes only by **landing its outcome in a durable doc**, and the `## Outcome` section names where:

- **PROJECT_BACKLOG.md** — the question stays open work (the usual case: the answer sharpens the
  options but the owner has not chosen);
- **a `draft` task file** — the answer settled the approach and the work is now concrete enough
  to execute;
- **PROJECT_DECISIONS.md** — only when the owner has actually made the call on the strength of
  the findings.

Never leave the answer to die in the thread: a research thread is a discussion record, not a work
tracker (same rule as reviews — Consensus and Cleanup above).

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
applies to threads, not to these buffers). Only the thread moves to `done/`. The same holds for a
research thread's `RESEARCH_<date>_<slug>.request.md` / `.answer.md` when Codex delegates part of
a question outward: deleted on close, once the content is folded into `## Findings`.

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

Research thread — same shape, one ping per side (Codex reads and writes the thread itself, which
is exactly why research does not go to an "external" AI):

- to Codex: `Research per AGENTS.md` (it finds the `awaiting-research` thread itself)
- to Claude Code: `Process the research` (it finds the `awaiting-response` thread itself)

If Codex decides part of the question needs an external AI, it sets `awaiting-external` and hands
you two links (copy from `.request.md` → paste into `.answer.md`). Carry it, then ping Codex again
with the same `Research per AGENTS.md` — it picks its own thread back up and folds the answer into
its findings.
