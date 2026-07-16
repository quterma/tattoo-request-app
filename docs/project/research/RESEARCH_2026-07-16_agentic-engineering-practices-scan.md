# Research: agentic-engineering practices — outward scan, then a short candidate list

Status: `draft` — **inherited draft, not a live thread.** Do not act on it as a Codex research
thread in this state.
Researcher: codex (with outward delegation to an external AI — expected, see below)
Requested by: `META: AI workflow master` (2026-07-16) — **to be re-owned by the first `AIENG:`
session; see below**

## Handover note (written by META, 2026-07-16)

This brief was drafted by a META session **before** the `AIENG:` session type existed, then handed
over when the owner decided that outward scouting deserves its own session type
(`docs/framework/AI_ENGINEERING_SCOUT.md`).

**It is a starting draft, not an instruction.** The first `AIENG:` session owns this topic and
therefore owns this thread. It must:

1. **Take authorship** — set `Requested by:` to itself (`AIENG: <topic>`), since the Scout, not
   META, owns outward research.
2. **Judge the brief on its merits** — it was written by a role that does not own this work. Rewrite
   the scope, the outward questions, the deliverable, anything. Deleting a section is a legitimate
   act, not a deviation. Do not treat META's framing as authoritative here; if it disagrees with
   AI_ENGINEERING_SCOUT.md, that document wins.
3. **Check with the owner first if anything is unclear** — clarify before scanning, not after.
4. Only then set Status `awaiting-research` (or take the thread outward directly) and proceed.

The one thing that is *not* the Scout's to rewrite is the boundary: this thread **proposes to
META**; it does not change the framework (AI_ENGINEERING_SCOUT.md — Rights).

---

## Question

### What this is, and what it is not

The owner has spent significant time designing this project's AI-assisted development process. It
works and he is satisfied with it. What he does not know is **how it compares to what the wider
agentic-engineering world actually practises** — whether we are quietly reinventing solved problems,
or missing a small number of practices that would be genuinely valuable here.

This thread's job, in order:

1. **Look outward first, without prejudice** — what practices exist today for AI-assisted /
   agentic software development? What is actually good and load-bearing (not marketing)?
2. **Then select** — against this repository's real setup, propose **at most 5 candidates** worth
   trying here. Not a syllabus, not "adopt everything", not a redesign.

**This is a scan-then-select, NOT an audit.** Do not start from our problems and hunt for fixes —
that framing can only ever find what we already know hurts, and would miss the practice we don't
know we're missing (which is the point of going outward). Start genuinely outside.

### Explicit non-goals (out of scope — say so and move on if you drift here)

- **Redesigning the framework.** Not on the table.
- **Chasing novelty** — new tools/features because they are new. The bar is value here, not
  recency.
- Practices that only pay off at **team scale** (multi-contributor coordination, org process,
  compliance, approval chains). This is a **single-owner MVP**: one artist, one developer, low
  volume. Reject them explicitly rather than listing them.
- Anything requiring **infrastructure we don't have and don't want yet** (CI platforms,
  observability stacks, eval harnesses, agent-orchestration frameworks heavier than our setup).
  Note: CI is already an explicit deferred decision with a trigger
  (`PROJECT_DECISIONS.md — CI/CD`) — do not re-propose it.
- **Model/benchmark comparisons.** Irrelevant to process.
- **Fixing our two open journal observations.** They are META's, being handled separately — see
  "Relationship to META" below. You may *note* if an outward practice happens to bear on them, but
  do not make this thread about them.

### What you are looking at, on our side (read to calibrate, not to audit)

Our setup, so you can judge what actually transfers:

- **Roles:** three session types — `STRAT` (product/design decisions), `IMPL` (executes exactly one
  task file), `META` (changes the process itself). Plus Codex as independent reviewer / researcher /
  bounded delegated executor (`AGENTS.md`), and an external AI reachable only through the owner.
- **Docs-as-interface:** sessions are disposable; everything durable lives in `docs/`. Task files
  (`docs/project/tasks/`), review threads (`docs/project/reviews/`), research threads
  (`docs/project/research/`), a decision log, a stage log, an observation journal.
- **Gates:** `pnpm qg` (structure/lint/typecheck/test/build) + a mandatory independent cross-review
  to consensus before any source commit is proposed. Commits require explicit per-commit owner
  approval.
- **Key framework docs:** `AI_TASK_PROTOCOL.md`, `AI_CROSS_REVIEW.md`, `AI_REVIEW_PIPELINE.md`,
  `AI_WORKFLOW_MASTER.md`, `templates/STAGE_TASK_TEMPLATE.md`, `.claude/CLAUDE.md`, `AGENTS.md`.
- **Constraint that dominates everything:** the owner's own attention is the scarce resource — not
  compute, not model time. A practice that costs him a routine round-trip is worse than the problem
  it solves.
- **Recent history worth knowing:** the framework was built fast (2026-07-13/15) and an audit
  (`research/done/RESEARCH_2026-07-15_external-framework-audit.md`) found process work had outpaced
  product work ~3.4:1. We are deliberately not in a build-more-process mode. Read
  `AI_WORKFLOW_MASTER.md — What to fix now vs. defer` before proposing anything.

### The outward scan (the actual work)

You have no internet. **This part genuinely requires current external facts, so delegating outward
is expected, not optional** (AGENTS.md — Answering a research thread; AI_CROSS_REVIEW.md — Research
Threads). Write the prompt for the external AI yourself, set Status `awaiting-external`, and hand
the owner the `.request.md`/`.answer.md` pair. You remain the owner of the answer: fold the reply
into your own `## Findings`, labelled by provenance, keeping what survives contact with our repo.

Aim the outward question at what is **practised and load-bearing**, e.g.:

- How do people actually structure context for coding agents (memory files, rules files, skills,
  per-directory instructions)? What has proven to matter vs. cargo cult?
- What patterns exist for **agent-to-agent handoff** and for keeping a long-running effort coherent
  across disposable sessions?
- What do people do about **review of agent-written code** — beyond "a human reads the diff"?
- Where do teams put **verification** that a green test suite cannot give (real-boundary checks,
  deploy-state truth)?
- What has the field **learned and discarded** — practices that looked good and did not survive?
  (This is as valuable as what works: it tells us what not to build.)
- Tooling that is genuinely standard now vs. noise.

Adapt these — they are a starting aim, not a checklist. If the external answer is vague or
marketing-shaped, say so; a thin answer honestly reported beats a padded one.

### Rounds

There is no hard cap on outward rounds — but each one must **earn itself**. Before requesting
another, state in the thread: *what specific question is still blocking candidate selection, and
why the previous answer didn't settle it.* "I'd like to know more" is not a reason. When the
remaining unknowns no longer change which candidates you'd propose, **stop and write the findings**
— even if the map feels incomplete. The owner explicitly does not want this to become a long-term
research project.

### Deliverable

Two parts, both in `## Findings`:

1. **The map** — a short, honest picture of what exists out there and what is actually
   load-bearing. Brief. This is context for the selection, not an essay.
2. **At most 5 candidates**, each in exactly this shape:
   - **Practice** — what it is, in one or two lines.
   - **What it would do for *this* project** — concrete, naming the file/flow/session type it
     touches. Not "improves quality".
   - **Cost** — in the owner's attention first (does it add a round-trip? a routine step?), then in
     setup effort.
   - **What we'd give up** — every real change trades something.
   - **Verdict** — `try now` / `later` / `note only`, with a one-line reason.

**"Nothing here is worth adopting" is a legitimate and successful outcome.** If the honest answer
is that our setup already covers what matters at our scale, say exactly that. Do not manufacture
candidates to fill the list — a padded list costs the owner more than an empty one, and this
project has an explicit rule against codifying things without a real reason.

Rank candidates by value-to-us, not by how interesting they are.

### Relationship to META (important — this defines who does what)

This thread **researches and proposes; it does not change the framework**. That boundary is the
owner's explicit condition for running it separately from META.

- The thread's `## Outcome` is a **proposal to META**, nothing more.
- META (the AI Workflow Master role — `AI_WORKFLOW_MASTER.md`) keeps its existing job: fixing live
  orchestration defects and desyncs as they surface from real implementation work. That work is
  **not** paused by this thread and is not this thread's business.
- Accepted candidates reach the framework only by the normal route, by consensus between the owner
  and META: `try now` → a task file; `later` → PROJECT_BACKLOG.md or an `open` journal entry;
  `note only` → nothing.
- Nothing from this thread edits `docs/framework/*` directly. If a candidate implies a framework
  change, that change is proposed, agreed, and then made through META — with the usual bar
  (`AI_WORKFLOW_MASTER.md — What to fix now vs. defer`).

### Constraints your answer must respect

1. **Value here, not general excellence.** Every candidate must survive the question "what does
   this do for a single-owner MVP with one artist as the user?"
2. **The owner's attention is the binding constraint.** Name the attention cost of every candidate
   explicitly. A candidate that adds a routine round-trip needs an extraordinary payoff.
3. **We are not in build-more-process mode.** A candidate that adds a document, a status, or a
   ceremony must justify itself against the accretion problem the 2026-07-15 audit measured.
4. **Do not re-propose what this project already rejected with reasons** — read the journal
   (`AI_FRAMEWORK_IDEAS.md`, resolved entries; it is compact) and the closed research threads. If
   you think a past rejection was wrong *and* the outward scan gives new evidence, say so
   explicitly and argue it — that is allowed and welcome, but it must be argued, not slipped in.
5. **Provenance labels are mandatory.** Mark what is *verified against this repo*, what is *model
   knowledge*, and what came back from the *external AI (unverified)*. The map will lean heavily on
   the last two — that is expected; label it honestly rather than presenting it as fact.
6. **No decision is yours.** Candidates with trade-offs; the owner and META decide.

## Findings

<!-- Codex: append `## Findings 1` here, then set Status to `awaiting-response` -->
