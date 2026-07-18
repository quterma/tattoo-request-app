# Research: agentic-engineering practices — outward scan, then a short candidate list

Status: `closed`
Researcher: codex
Requested by: `AIENG: outward scan — agentic engineering practices` (2026-07-16)

## Question

The owner has spent significant time designing this project's AI-assisted development process. It
works and he is satisfied with it. What he does not know is **how it compares to what the wider
agentic-engineering world actually practises** — whether we are reinventing solved problems, or
missing a small number of practices that would be genuinely valuable here.

**Scan outward first, then select. This is not an audit.** Do not start from our problems and hunt
for fixes: that framing can only find what we already know hurts, and would miss the practice we
don't know we're missing — which is the entire point. Start genuinely outside.

### Round 1 — two parts, one `## Findings 1`, in this order

**(a) Inventory what this project already rejected, and why.** Read the resolved entries in
`docs/framework/AI_FRAMEWORK_IDEAS.md` (compact) and the closed threads in
`docs/project/research/done/`. List what was considered and turned down with the stated reason. This
is cheap for you, it is the guard against re-proposing a settled question, and it makes part (b)
sharper — you will recognize a practice we have already priced.

**(b) Scan outward.** This turns on *current external facts*, so use your web search. Where the
platform blocks you (a video talk, a page you cannot open), do not substitute model knowledge:
follow `AGENTS.md` — Answering a research thread, §4 — write the external prompt yourself, save
`RESEARCH_2026-07-16_agentic-engineering-practices-scan.request.md`, create the empty `.answer.md`,
set Status `awaiting-external`, and tell the owner. He carries it to an external AI (which reaches
video and closed pages) and pastes the reply back. You stay the owner of the answer.

Aim (a starting aim, not a checklist): how people actually structure context for coding agents
(memory/rules/skills/per-directory instructions) and what proved load-bearing vs. cargo cult;
patterns for handoff between disposable sessions and keeping a long effort coherent; review of
agent-written code beyond "a human reads the diff"; verification a green test suite cannot give
(real-boundary, deploy-state truth); **what the field tried and discarded** — as valuable as what
works, since it tells us what not to build; what is genuinely standard now vs. noise.

### Calibrate against our setup — read it, don't take my word for it

`docs/framework/AI_TASK_PROTOCOL.md` (session types, lifecycle, delegation, mandatory review),
`AI_CROSS_REVIEW.md` (threads), `AI_REVIEW_PIPELINE.md` (gates), `.claude/CLAUDE.md`, `AGENTS.md`,
`docs/project/PROJECT_CONTEXT.md` (the product and its scale).

Two facts that are judgment, not lookup, and must anchor every candidate:

- **The owner's attention is the binding constraint** — not compute, not model time. A practice that
  costs him a routine round-trip is worse than the problem it solves.
- **We are not in build-more-process mode.** The framework grew ~3.4:1 against product work in two
  days (`research/done/RESEARCH_2026-07-15_external-framework-audit.md`). A candidate that adds a
  document, a status, or a ceremony must justify itself against that.

### Out of scope — say so and move on

Redesigning the framework. Novelty for its own sake. Practices that only pay off at **team scale**
(multi-contributor coordination, org process, compliance, approval chains) — this is a single-owner
MVP with one artist as the user, ~5–20 requests/week. Infrastructure we don't have and don't want
(CI is already a deferred decision with a trigger — `PROJECT_DECISIONS.md`; do not re-propose it).
Model/benchmark comparisons. The two `open` journal observations — those are META's.

### Rounds

Each additional round must earn itself: state which specific question is still blocking candidate
selection and why the previous answer didn't settle it. "I'd like to know more" is not a reason.
When the remaining unknowns no longer change which candidates you'd propose, stop and write the
findings — even if the map feels incomplete. The map is not the deliverable; the selection is.

### Deliverable

1. **The map** — short and honest: what exists out there, what is actually load-bearing. Context for
   the selection, not an essay.
2. **At most 5 candidates**, each in exactly this shape:
   - **Practice** — one or two lines.
   - **What it would do for *this* project** — naming the file, flow, or session type it touches.
     "Improves quality" is not a candidate.
   - **Cost** — the owner's attention first (a round-trip? a routine step?), then setup effort.
   - **What we'd give up** — every real change trades something.
   - **Verdict** — `try now` / `later` / `note only`, one-line reason.

Rank by value to us, not by how interesting it is. **"Nothing here is worth adopting" is a
legitimate and successful outcome** — if our setup already covers what matters at our scale, say
exactly that. Do not manufacture candidates: a padded list costs the owner more than an empty one.

### Constraints your answer must respect

1. **Value here, not general excellence.** Every candidate survives: "what does this do for a
   single-owner MVP with one artist as the user?"
2. **Name the attention cost of every candidate.** A routine round-trip needs an extraordinary payoff.
3. **Don't re-propose what was already rejected with reasons** (part (a) is your own guard). If you
   think a past rejection was wrong *and* the scan gives new evidence — argue it explicitly. That is
   welcome, but it must be argued, not slipped in.
4. **Provenance labels are mandatory**: *verified against the repo* / *model knowledge* /
   *external AI, unverified*. The map will lean on the latter two — label it honestly rather than
   presenting it as fact.
5. **No decision is yours.** Options with trade-offs; the owner decides. This thread proposes to
   META and does not change the framework (`docs/framework/AI_ENGINEERING_SCOUT.md` — Rights).

## Findings

<!-- Codex: append `## Findings 1` here, then set Status to `awaiting-response` -->

## Findings 1

### Method and provenance

- **Verified against the repo:** I read the current working-tree versions of the framework files
  named in the Question, all four closed research threads, the current product context and Stage 6
  Source of Truth, the two already-filed framework/tooling tasks, `.claude/settings.json`,
  `package.json`, `.husky/pre-commit`, and `PROJECT_TESTING_STRATEGY.md`. I also ran read-only
  Git/filesystem searches. The repo findings below come from those reads, not from the narrative in
  the Question.
- **External web evidence, checked by Codex on 2026-07-17:** this is the outward scan the Question
  explicitly requested. I used dated primary sources from OpenAI, Anthropic, Cursor, GitHub, DORA,
  and METR. This is neither repo evidence nor model memory; links are attached to the claims they
  support.
- **Model knowledge / reasoning:** all judgments about transfer to this particular project,
  attention cost, ranking, and verdict are my reasoning over the repo and external evidence. They
  are proposals, not external facts.
- **External AI, unverified:** none. The web-accessible sources settled the candidate selection;
  no blocked video or closed page contained a fact that would change the list, so an owner-carried
  external round was not earned.

---

### Part (a) — settled negative space in this repository

**Verified against the repo.** These are the material designs already considered and turned down,
with the reason that controls this scan:

1. **One accumulative task file per stage** — rejected because it bloats executor context and
   creates parallel-write conflicts. The adopted unit is one file per task plus `tasks/done/`
   (`AI_FRAMEWORK_IDEAS.md`, 2026-07-12; `AI_TASK_PROTOCOL.md — Task Files`).
2. **A mandatory Codex pre-check of every implementation plan** — rejected because chat plans are
   not repo-readable without new persistence machinery, and the extra owner round-trip costs more
   than the one-line plan-deviation section it would check. Ad-hoc plan review remains possible.
3. **A final STRAT sign-off after implementation/review** — rejected as a rubber stamp: it adds an
   owner/session turn but applies no instrument not already applied by plan approval, gates,
   independent review, and commit approval. The originating IMPL session owns the review/fix loop.
4. **Confidence-triggered research (`"if unsure, research"`)** — rejected because models are rarely
   unsure when they are wrong. Also rejected: mandatory research for every number/external noun
   (too many owner transports) and semantic lint for unstated assumptions (cannot find what was
   never written and creates false confidence). The adopted trigger classifies who owns the truth
   of an execution-critical claim and requires evidence or a research thread.
5. **A hand-maintained or generated status dashboard** — rejected because it becomes stale whenever
   generation/editing was not the last action. `OPEN_ACTIONS.md`, a parsed `⛔ BLOCKER` in journal
   prose, and narrative restatements of task state were rejected for the same duplicated-state
   reason. The accepted direction is a read-only, filesystem-derived `pnpm project:status` command,
   still filed as `TOOLING_TASK_01_project_status_command.md` (`draft`).
6. **“Read the previous task's leftover prose before planning”** — rejected as another memory
   ritual. An unfinished completion duty must instead carry evidence or point to canonical work,
   and blockers live as metadata on that work.
7. **Per-session worktrees for the current shared-index hazard** — considered and rejected because
   the owner does not want that infrastructure at this scale. A bare “check the index before
   committing” rule was also rejected because it already existed and still failed silently.
   The adopted mitigation is no staging across an approval turn, explicit paths, and a cached-diff
   re-check.
8. **One task = one commit, or a commit/review at every possible seam** — rejected. Commit
   granularity and review granularity are separate; every additional commit costs another owner
   approval and every source checkpoint another review. Large/risky tasks instead use a few
   legitimate checkpointed blocks, preferably two.
9. **Letting an external AI own a research thread** — rejected because it loses repo access and
   makes the owner transport every turn. Codex owns the answer and delegates only the
   current-external-fact slice when needed.
10. **Immediate CI/CD adoption** — deliberately deferred to the existing pre-launch or
    second-contributor trigger in `PROJECT_DECISIONS.md`. It is not an unconsidered gap and is not
    a candidate here.
11. **A cadence/quota for META work** — rejected because it can delay a severe first incident and
    invites gaming the ratio. The adopted admission bar is event-based: fix a live defect/desync or
    owner-action sink; defer polish.
12. **Keeping copied global workflow prose in every task for self-containment** — priced and
    rejected after the copies drifted. The accepted one-time consolidation is already filed as
    `META_TASK_01_framework_consolidation.md` (`draft`): canonical rules plus pointers, no new
    framework index.

This inventory removes several fashionable outward practices from the candidate pool before the
scan starts: agent fleets/worktrees, another status ledger, more review personas, plan-review
ceremony, and immediate CI are not “missing ideas” here.

---

### Part (b) — outward map

#### 1. Context: a small map plus just-in-time retrieval is load-bearing

**External web evidence.** OpenAI reports that its “one big `AGENTS.md`” attempt failed because it
consumed task context, made all guidance equally noisy, rotted, and was hard to verify. Its working
shape is a roughly 100-line `AGENTS.md` as a map into a versioned in-repo knowledge base, with
progressive disclosure and executable plans
([OpenAI, “Harness engineering”](https://openai.com/index/harness-engineering/)). Anthropic's
context-engineering guidance converges on a tight context budget, just-in-time retrieval by paths
and links, a minimal tool set, and a few canonical examples rather than a laundry list of edge cases
([Anthropic, “Effective context engineering”](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).
Cursor's current practitioner guidance says the same operationally: rules contain essential
commands, canonical pointers, and repeated mistakes; style guides belong in linters; rarely
applicable edge cases should not be always-on; skills load dynamically
([Cursor, “Best practices for coding with agents”](https://cursor.com/blog/agent-best-practices)).

**Verified against the repo.** This project is directionally aligned already: `AGENTS.md` is 127
lines and routes to authoritative docs; product/spec/task state is versioned in the repo; task files
are executable plans. Its remaining duplication/default-context weight is already the scope of
`META_TASK_01_framework_consolidation.md`. Creating a new skill layer before that deletion would add
another source of truth, so this scan does not re-propose it.

**Model reasoning.** Load-bearing: one discoverable map, authoritative repo artifacts, canonical
examples, on-demand reads. Cargo cult: a universal encyclopedia, duplicating the same workflow into
every agent format, and adding rules for one-off mistakes.

#### 2. Continuity: small units and file handoffs survive; compaction rituals are model-dependent

**External web evidence.** Anthropic's long-running-agent work found two durable practices:
decompose work into tractable features and leave structured artifacts plus clean repository state
for the next fresh session. Compaction alone did not reliably preserve a partially implemented
feature in the earlier harness
([Anthropic, “Effective harnesses for long-running agents”](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)).
Its March 2026 follow-up is more important than the original recipe: with a newer model it removed
context resets and then removed the sprint construct; scaffolding that had been load-bearing for
Opus 4.5 became overhead for Opus 4.6
([Anthropic, “Harness design for long-running application development”](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

**Verified against the repo.** One-task IMPL sessions, the STRAT brief, task reports, checkpointed
large blocks, and “fresh session instead of pushing through summarization” already implement the
durable half of this pattern. The repo has also correctly rejected a single accumulative task file.

**Model reasoning.** The external lesson is not “add more handoff files”; it is that handoffs and
bounded work are stable, while model-specific orchestration must be removable. That produces one
later candidate (ablation), not a new session status.

#### 3. Review: an independent evaluator matters most when it can observe the product

**External web evidence.** Anthropic reports that generators systematically over-praise their own
work; separating evaluator from generator was a strong lever. In its application harness the
evaluator drove the running UI with Playwright, exercised API paths, and checked database state,
rather than grading only the patch. It also found the full planner/generator/evaluator+sprint
harness was over 20× as expensive as a solo run ($200 vs. $9 in the reported experiment), and later
made evaluator use conditional on whether the task exceeded the current model's reliable solo
capability
([Anthropic, harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps)).
Anthropic's eval guidance makes the same distinction more generally: a transcript may say a flight
was booked; the outcome is whether the reservation exists in the environment
([Anthropic, “Demystifying evals”](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).
OpenAI likewise made its application UI, logs, metrics, and traces agent-legible so an agent can
reproduce a bug, drive the app, and record before/after evidence
([OpenAI, harness engineering](https://openai.com/index/harness-engineering/)).

**Verified against the repo.** This project already has the independent-reader half: every ordinary
source block gets a fresh Codex cross-review, and delegated Codex code gets an unfamiliar-patch
Claude review. It does **not** have the environment-observation half: `package.json` has Vitest but
no Playwright/Puppeteer/smoke command; `PROJECT_TESTING_STRATEGY.md` assigns mobile layout,
navigation, upload UX, admin usability, and readability to manual verification. Completion
obligations can track a live check, but often leave the owner as the person who must perform it.

**Model reasoning.** This is the clearest missing capability. Another prose reviewer would be
duplication; letting the existing implementer/reviewer see and drive the running product changes
what can actually be verified.

#### 4. Guardrails: repeated invariants move from prose into deterministic tools

**External web evidence.** OpenAI's agent-first repository uses structural tests and custom linters
for dependency direction, boundary validation, naming, and reliability constraints; its stated
pattern is to enforce invariants centrally and leave implementations flexible
([OpenAI, harness engineering](https://openai.com/index/harness-engineering/)). Claude Code now
supports project-committed `PreToolUse` hooks that can inspect and deny a shell command before it
runs, including compound commands
([Claude Code hooks reference](https://code.claude.com/docs/en/hooks)). GitHub's coding agent
similarly places CodeQL, dependency-advisory, secret scanning, and a review/fix loop inside the
agent workflow before handoff
([GitHub, coding-agent validation](https://github.blog/changelog/2025-10-28-copilot-coding-agent-now-automatically-validates-code-security-and-quality/)).

**Verified against the repo.** Dependency direction is already mechanically enforced here, and
`.claude/settings.json` asks before `git commit`/`git push`. But Claude's settled shared-index
safety rule (`git add -A`/`.` forbidden) remains prose; there are no project hooks. Codex has the
separate, stronger read-only Git rule in `AGENTS.md`. The known `df70cae` incident is exactly the
sort of repeated, machine-recognizable invariant a hook can cover.

**Model reasoning.** Mechanical enforcement is valuable only for syntactic, low-false-positive
rules. It should not try to decide whether an owner approved a commit or whether a product deviation
is semantically acceptable.

#### 5. What is standard versus noise at this scale

**External web evidence.** The sources converge on plan-before-code for non-trivial work, scoped
tasks, repo-local instructions, iterative gates, independent evaluation, and tools that expose the
real system. They do **not** converge on a permanent maximal harness. Anthropic removed components
as model capability changed; Cursor says to start simple and add rules only after repeated mistakes.
DORA's 2025/2026 analysis says AI amplifies the existing delivery system and reallocates creation
time into auditing/verification; higher adoption was associated with both throughput and
instability
([DORA, “Balancing AI tensions”](https://dora.dev/insights/balancing-ai-tensions/)).

METR's current correction is a useful warning against confident productivity folklore: its early
2025 19% slowdown result is now explicitly marked out of date; late-2025 raw estimates suggest
speedup, but METR says task/developer selection and concurrent-agent measurement make the magnitude
unreliable. Developers also changed which tasks they selected for AI
([METR, February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/)).

**Model reasoning.** Multi-agent fleets, Best-of-N, per-agent worktrees, continuous doc-gardening,
and always-on security/quality fleets are real practices, not imaginary hype. They pay at high
throughput and team scale. For this single-owner, low-volume MVP they are noise unless a live
constraint appears. The project's bounded delegation and single independent-review slot are closer
to the evidence than a “software factory” would be.

---

### Ranked candidate list

#### 1. Outcome-focused browser acceptance probe for visitor-visible changes

- **Practice** — A browser-capable agent drives the changed flow in the running application and
  records concise outcome evidence (steps plus screenshots/state), while the diff reviewer remains
  independent. Pilot it on one remaining Stage 6 visitor-facing block before making it a rule.
- **What it would do for this project** — For a public UI/request-flow IMPL block, add a
  task-specific verification step after `pnpm qg`: start the local app, exercise only the task's
  acceptance path at mobile width (including one failure path), and attach the observed result to
  the task/review handoff. If the pilot catches useful issues or removes an owner check, META can
  later decide whether `PROJECT_TESTING_STRATEGY.md — Manual Verification` and
  `AI_REVIEW_PIPELINE.md` should name a reusable Playwright/browser smoke path. This directly
  covers navigation, focus/error behavior, upload UX, and Success routing that Vitest/build cannot
  establish.
- **Cost** — Owner attention: one approval to run the pilot; **no additional routine round-trip**,
  and potentially fewer manual QA requests. Setup: small-to-moderate (choose an available browser
  tool or add a narrow Playwright setup, define stable fixtures, make the app boot predictably);
  each run costs minutes.
- **What we'd give up** — Some implementation time now, plus maintenance/flakiness if the pilot is
  prematurely turned into a broad E2E suite. A local browser does not prove the deployed Vercel /
  Supabase boundary, and it does not replace the owner's visual taste; those claims stay manual or
  live completion obligations.
- **Verdict** — `try now` — as one task-scoped pilot, not a new universal framework gate. Stage 6
  is precisely the visual/product phase, and this is the only candidate that can remove a recurring
  owner verification action while observing outcomes the current gates cannot see.

#### 2. Encode the already-settled Git safety invariants as a project hook

- **Practice** — Use a deterministic `PreToolUse`/permission guard for a tiny deny-list of commands
  whose invalidity is syntactic and already decided; leave semantic/product judgment with the
  owner.
- **What it would do for this project** — A project hook referenced by
  `.claude/settings.json` would reject broad staging (`git add -A`, `git add .`) before execution,
  with an error pointing back to the explicit-path workflow. Existing “ask before commit/push”
  stays. This turns the `df70cae` scar from an instruction the agent must remember into a technical
  boundary. It does not attempt to infer whether a commit was approved.
- **Cost** — Owner attention: one review/approval of the exact deny-list; **zero routine
  round-trips**, because valid explicit-path commands proceed normally. Setup: one small
  cross-platform hook script plus settings/tests against representative command strings.
- **What we'd give up** — A little shell flexibility and another tool-specific config surface;
  false positives must be kept low. It protects Claude Code, not every possible agent shell, and
  cannot solve intra-file co-authorship or determine authorization from chat.
- **Verdict** — `try now` — it enforces existing policy rather than adding process, addresses a
  repo-verified incident, and has the best owner-attention profile in the list.

#### 3. Ablate harness rules at the existing post-MVP retrospective

- **Practice** — Treat each scaffold/ceremony as a hypothesis about what the current model cannot do.
  At a model-generation change or the already-planned post-MVP retrospective, remove or relax one
  component at a time and inspect representative outcomes; do not preserve a rule merely because an
  older model once needed it.
- **What it would do for this project** — Add no new document or session now. When META executes the
  existing retrospective/consolidation work, use the repo's incident record to test whether the
  blanket review rule, checkpoint threshold, fresh-session guidance, duplicated preflight reads, or
  other scaffolding still pays for itself. `AI_FRAMEWORK_IDEAS.md` already preserves why each rule
  exists; the retrospective would retire only rules whose original failure no longer reproduces or
  whose cost now exceeds the catch rate.
- **Cost** — Owner attention: one bounded retrospective decision surface, **no per-task
  round-trip**. Setup: choose a few completed representative tasks/incidents and change one
  variable at a time; no new status, dashboard, or ongoing metric.
- **What we'd give up** — Some guardrail certainty while a component is on trial, and the evidence
  will be noisy because tasks differ. It must be reversible and cannot turn into continuous harness
  benchmarking (model/benchmark comparison remains out of scope).
- **Verdict** — `later` — Anthropic's removal experiments are the most relevant external lesson for
  a framework that grew 3.4:1 against product work, but doing it before Stage 6 ships would become
  the very process project this thread is meant to avoid.

### Selection boundary

No fourth or fifth candidate clears the bar. Short-map context, structured handoffs, scoped plans,
independent review, checkpointed risky work, and evidence for external claims are already present
or already filed for one-time consolidation. Parallel agent fleets/worktrees, Best-of-N, another
status artifact, immediate CI, continuous cleanup agents, and universal security/eval machinery
either repeat a settled rejection or pay only at a throughput/team scale this product does not
have.

This thread makes no decision. The owner/META may take either `try now` pilot, defer both, or decide
that the existing setup is sufficient; the external scan does not justify a general framework
expansion.

## Response 1

Scout's processing of Findings 1. The scan earned itself and I am **not requesting another outward
round**: the remaining unknowns do not change which candidates I would propose (AI_ENGINEERING_SCOUT.md
— Stop Condition). Below: what I verified, what I accept, and where I depart from the researcher.

### What I re-verified independently (not taken on trust)

Both `try now` candidates rest on repo claims, so I checked the load-bearing ones myself:

- **No browser/E2E tooling exists** — `package.json` has no Playwright/Puppeteer/Cypress; scripts are
  `dev, build, start, lint, format, format:check, typecheck, test, test:watch, test:coverage,
  test:ui, structure, qg, prepare`. Codex's claim holds. *(Verified against the repo.)*
- **No hooks exist** — `.claude/settings.json` contains only a `permissions.ask` list for
  `git commit` / `git push` (Bash + PowerShell). There is no `hooks` key. Codex's claim holds.
  *(Verified against the repo.)*
- **The `git add -A` prohibition is prose only** — it lives in `.claude/CLAUDE.md:100` and is restated
  in `AI_TASK_PROTOCOL.md:579`, `AI_FRAMEWORK_IDEAS.md:146`, `AI_ENGINEERING_SCOUT.md:61`. Nothing
  mechanical enforces it. Codex's claim holds. *(Verified against the repo.)*

Provenance discipline was honest: web claims carry dated primary sources, repo claims are separable
from reasoning, and the "external AI, unverified: none" line is a real judgment, not an omission —
the outward round was not needed once the sources settled the list. Correct call under the
earn-itself bar.

### Accepted

- **Part (a)'s function.** The inventory did its job: it pre-emptively removed agent fleets,
  worktrees, another status ledger, plan-review ceremony, and immediate CI from the pool. No
  candidate re-proposes a settled rejection.
- **The map's core lesson.** The strongest external finding is not a practice to add but Anthropic's
  *removal* result: scaffolding load-bearing for one model generation became overhead for the next.
  For a framework measured at 3.4:1 against product work, that is the most relevant thing the scan
  returned.
- **The selection boundary.** Three candidates, not five. The refusal to pad is correct and matches
  the Scout's own bar.
- **Candidate 3 (`later`)** — ablation at the existing retrospective. Adds nothing now, and doing it
  before Stage 6 ships would become the process project this thread exists to avoid.

### Where I depart from the researcher

**Candidate 2 — I am not ready to call this `try now`; it is `try now` only if the hook is trivial,
otherwise `later`.** *(Model reasoning.)*

Codex ranks it best-in-list on attention profile, and its diagnosis is right: the `df70cae` scar is
prose, and prose already failed there — the journal records that a "check before committing" rule
existed, fired twice, and still failed silently. That is a real argument for mechanical enforcement.

But two things weaken the candidate as scoped:

1. **It guards a rule the current design already removed the need for.** The adopted mitigation was
   not "remember not to `git add -A`" — it was *don't stage across an approval turn at all*
   (`AI_FRAMEWORK_IDEAS.md:143-149`: "Exposure window **removed, not guarded**"). A deny-list on
   `git add -A` guards the narrower残 surface, not the failure mode that actually bit.
2. **Cross-platform hook scripts are a maintenance surface**, and this repo runs on Windows with both
   Bash and PowerShell shells — the deny-list must match command strings across both, which is
   exactly where false negatives hide (`git add --all`, `git add :/`, compound commands).

I am not rejecting it — the payoff is real and the round-trip cost is genuinely zero. I am saying the
verdict depends on a fact neither of us established: **how small the hook actually is.** If it is a
few lines matching a handful of literal forms, `try now` is right. If it needs a cross-shell parser,
it is `later` — that is infrastructure, and this project has a standing rule against building it
without a live trigger.

**Candidate 1 — I accept `try now` and consider it the only candidate that matters.** *(Model
reasoning.)* Codex's ranking is right for the reason it gives: it is the one candidate that removes a
recurring *owner* action rather than adding one. `PROJECT_TESTING_STRATEGY.md` currently assigns
mobile layout, navigation, upload UX and readability to manual verification — i.e. to the owner, the
binding constraint. But I sharpen two boundaries Codex left soft:

- **The pilot must not become a suite.** Its scope is one task's acceptance path plus one failure
  path. The failure mode here is well known outside: a broad E2E suite that goes flaky and costs more
  attention than the manual check it replaced. If the pilot drifts toward "add coverage", it has
  failed and should be dropped.
- **It proves the local app, not the deployed system.** Codex says this; it deserves emphasis because
  the project's own history is exactly this trap — Item 1 shipped green while the live DB was broken
  (`AI_FRAMEWORK_IDEAS.md`, 2026-07-14). A local probe must not be allowed to retire a completion
  obligation about the real Vercel/Supabase boundary.

### What I am putting to the owner

Ranked, with my recommendation:

1. **Candidate 1 (browser acceptance probe) — pilot it on one Stage 6 visitor-facing block.**
   Recommend yes. Only candidate that gives the owner attention back rather than spending it.
2. **Candidate 2 (git hook) — decide after sizing it.** Recommend a five-minute sizing check before
   the verdict, not a blind `try now`.
3. **Candidate 3 (ablation) — `later`, at the already-planned retrospective.** Recommend accept as
   filed; no action now.

Neither `try now` item is a framework change, and this thread does not make one. Candidate 1 is a
**task-scoped pilot**; only if it pays would META decide whether `AI_REVIEW_PIPELINE.md` /
`PROJECT_TESTING_STRATEGY.md` should name it. That sequencing is deliberate: piloting first is how a
candidate earns a rule, and it keeps this thread inside the Scout's boundary (propose, don't change).

### Резюме для владельца (RU)

Codex отсканировал наружу и вернул **три** кандидата вместо пяти — список не набивал, это правильно.
Его repo-утверждения я перепроверил сам: Playwright/Puppeteer в проекте нет, хуков нет, запрет
`git add -A` живёт только текстом. Всё подтвердилось.

Главное, что дал скан, — не практика, а **урок про удаление**: Anthropic сняла часть своих же
строительных лесов, когда сменилось поколение модели; то, что было необходимо, стало накладными
расходами. Для нашего фреймворка (3.4:1 против продукта) это самое релевантное, что вернулось наружу.

- **Кандидат 1 — браузерная проверка приёмки.** Агент запускает приложение и прогоняет путь задачи
  на мобильной ширине. Сейчас мобильная вёрстка, навигация, UX загрузки и читаемость проверяются
  **вами руками** — это единственный кандидат, который возвращает ваше внимание, а не тратит его.
  **Рекомендую: да, пилотом на одном блоке Stage 6.** Не сюитой — один путь приёмки плюс один
  сценарий ошибки. И он проверяет локальное приложение, не боевое: обязательства по живому
  Vercel/Supabase он не снимает.
- **Кандидат 2 — хук на `git add -A`.** Codex ставит его первым. **Я осторожнее.** Причина: принятое
  решение после `df70cae` было не «помни про `-A`», а «вообще не держи staged через круг одобрения» —
  окно убрано, а не охраняется. Плюс у нас Windows с двумя шеллами, и кросс-шелльный матчинг команд —
  это уже инфраструктура. **Рекомендую сначала оценить размер хука** (5 минут), потом вердикт.
- **Кандидат 3 — ревизия правил на пост-MVP ретроспективе.** `later`, ничего сейчас не делаем.

Решение ваше. Тред ничего не решает и фреймворк не меняет.

## Question 2 — the cost axis (round 2)

### Why this round earns itself

Required by AI_ENGINEERING_SCOUT.md — Stop Condition: name the specific question still blocking
candidate selection, and why round 1 did not settle it.

**Round 1 answered the wrong axis, because I asked the wrong question.** My `## Question` aimed at
*reliability* — "what is practised, what is load-bearing". Findings 1 answered exactly that, and
dismissed agent fleets/worktrees as "noise unless a live constraint appears… they pay at high
throughput and team scale". That dismissal is **correct for reliability and irrelevant for cost.**

The owner's live constraint is not throughput — it is the **Claude usage limit** (token/daily/weekly).
That is why Codex is already the default for research/review/analysis: it is *not* limit-bound
(established in this session, owner's own operating rule). Neither round 1 nor my Response 1 tested
whether the same logic extends *inside* Claude Code — i.e. whether work should be routed by model
tier (an orchestrator dispatching to a cheaper model for low-judgment steps) rather than run
top-tier throughout.

This is not a "would like to know more" round. It changes the candidate list: if routing pays, it is
a candidate that touches `AI_TASK_PROTOCOL.md — Session Settings Guidance` and outranks the git hook.
If it does not pay, it is closed with evidence instead of my speculation. Cost of the round: **zero
owner round-trips** (Codex is not limit-bound and has web access).

**Explicitly NOT in this round: skills.** Findings 1 declined to propose a skills layer because it
would add a third instruction format while `META_TASK_01_framework_consolidation.md` (`draft`) is
still open on *deleting* duplication. The Scout accepts that reasoning and is not reopening it —
on-demand loading already exists here structurally (a session reads only its own role doc). Do not
spend this round on it.

### Part (a) — count where our tokens actually go (repo; nobody else can do this)

The orchestration question is currently unanswerable because **both Codex and the Scout are
reasoning, not measuring.** Establish the baseline first:

Using read-only Git/filesystem evidence (commit history, task files and their reports, review and
research threads, `tasks/done/`), characterise **where the expensive work actually is**:

- Which session types and which *steps within them* dominate cost? Distinguish, with evidence:
  design/planning judgment · code generation · gate-failure triage · reading docs at session start
  (the Pre-task Sync + always-read doc weight) · review processing.
- Which of those steps are **low-judgment and mechanical** (a cheaper tier could plausibly do them
  without a quality loss we could detect) vs. **judgment-dense** (tier is the whole point)?
- What is the **always-loaded context weight** per session (`.claude/CLAUDE.md` + Pre-task Sync
  reads + `AI_TASK_PROTOCOL.md` at 608 lines + the journal), and how does it compare to the work
  product of a typical task? Cite line/byte counts.

State plainly what the repo **cannot** tell you (actual token counts per session are not in the
repo — do not invent them). A structural answer with named evidence beats a fabricated metric.

### Part (b) — outward: does model-tier routing actually pay?

Use your web search; dated primary sources. The claim to test is the owner's hypothesis:

> An orchestrator on a cheap/fast tier dispatches to a top tier for design and a mid tier for
> execution, routing each step to the cheapest model that can do it.

- Is **tiered/model routing** genuinely practised in agentic coding setups today, or is it mostly
  vendor framing? What shipped, what was tried and **abandoned**, and why.
- What is the **measured overhead of orchestration itself** — the coordinator's own token cost, and
  the cost of *re-establishing context* in a subagent that does not have the parent's loaded
  context? Round 1 already surfaced one hard number in this family (Anthropic's planner/generator/
  evaluator harness at >20× a solo run, $200 vs $9). Find whether tiered routing lands on the same
  side of that ledger or the opposite one.
- Where does routing **demonstrably fail** — cases where the cheap tier's output cost more to
  review/fix than it saved, or where the handoff lost context that mattered?
- **Subagent delegation specifically**: what is the evidence on delegating a *bounded, well-specified*
  step (write tests to a spec, run and triage gates, mechanical refactor) to a cheaper tier, versus
  delegating judgment work? This is the shape most relevant here, because it mirrors the existing
  Codex delegation rule (`AI_TASK_PROTOCOL.md — Delegating IMPL Tasks to Codex`) — which is
  **already an instance of exactly this idea, applied across tools rather than across model tiers**.

### The constraint the answer must respect

The existing setup already routes the biggest lever: **Codex takes research/review/analysis/bounded
execution precisely because it is not limit-bound.** Any routing candidate must therefore answer:
**what is left for a cheaper Claude tier that Codex should not simply take instead?** If the honest
answer is "nothing material", say so — that closes the question with evidence and is a successful
outcome (Deliverable, round 1: "nothing worth adopting" is legitimate).

Same output shape as round 1: map, then candidates in the fixed five-field form, or an explicit
"no candidate clears the bar". Same provenance labels. Same rule: no decision is yours.

## Findings 2

### Method and provenance

- **Verified against the repo (2026-07-17, committed baseline `96f320d`)** — read the session and
  workflow rules, the three completed Stage 6 task files, the six Stage 6 implementation-review
  threads, and the relevant commit history. Used read-only `git log`, `git show --numstat`, line/byte
  counts, and `claude --version`. No quality gate was run: this is a docs-only research turn, and
  gate duration/output would not reconstruct historical token use.
- **External primary sources (web, checked 2026-07-17)** — current official Claude Code/OpenAI
  documentation, product changelogs, first-party engineering reports, and the primary papers or
  authors' benchmark reports named below. Vendor benchmark claims are kept labelled as such; they
  are not treated as measurements of this repository.
- **Model reasoning** — all transfer judgments and tier classifications below. They are inferences
  from the two evidence sets, not observed token counts.
- **External AI, unverified** — none. Primary sources plus repo evidence settled the selection; no
  owner-carried external-AI round was needed.

### Part (a) — where this repository's expensive work is

#### The fixed context tax is large, but it is not a token measurement

**Verified against the repo.** The question names `AI_TASK_PROTOCOL.md` as 608 lines; it is now
**617 lines / 41,195 bytes** at the measured baseline. The normative per-session bundles are:

| Bundle required by the current rules | Files | Lines | Bytes |
| --- | ---: | ---: | ---: |
| `CLAUDE.md` + mandatory three-file Pre-task Sync + `AI_TASK_PROTOCOL.md` + the META journal | 6 | 5,527 | 381,778 |
| Same, when `PROJECT_DECISIONS.md` is needed (normal for Stage 6 work) | 7 | 7,648 | 517,657 |
| Same plus the committed Stage 6 PRD and FS | 9 | 8,019 | 546,837 |

The six completed Stage 6 code blocks have a median of **9.5 execution-affecting files / 330 lines
of execution-affecting churn**, or **841.5 lines of total churn** when tests, docs and review
artifacts are included. On the crude line-count axis, the normative startup bundle is therefore
about **6.6–9.5× the median block's total churn**, before the task file and relevant source are read.
That does **not** mean it costs 6.6–9.5× the tokens: Markdown, code, deletions, prompt caching, tool
summaries and repeated turns tokenize/bill differently. It does establish that "let a fresh worker
get context" is not a free handoff in this repo.

`CLAUDE.md:224` also says to read `docs/framework` during initialization. The ten top-level
framework Markdown files are another **2,508 lines / 126,500 bytes** if interpreted literally as
"read all"; the same paragraph says to re-read selectively after initialization. I did **not** add
all ten to the bundle above because the rule is ambiguous about full-file loading and the question
specifically names `AI_TASK_PROTOCOL.md` plus the journal. Counting them as always loaded would
overstate what the repo can prove.

#### Structural cost map

| Session step | Repository evidence | Judgment density / plausible routing |
| --- | --- | --- |
| **Design and planning** | `AI_TASK_PROTOCOL.md:598-608` assigns the highest-reasoning tier to strategy/meta/audit. Task 01 used Opus for an architecture/security decision; Task 03 used Opus for a contract-changing public write surface. | **Judgment-dense.** Model tier is the point. A cheap coordinator deciding what needs escalation would move the most consequential classification onto the weakest tier. |
| **Session-start reading and repo exploration** | Every task repeats the Pre-task Sync; task files then name more Source-of-Truth sections and current code. The fixed bundle above is larger than the median work product. | File discovery, grep and extraction are **mechanical if the question and output are narrow**; deciding which rule controls or resolving conflicts remains judgment-dense. This is the only meaningful internal split found. |
| **Code generation/editing** | The six Stage 6 blocks range from 92 to 1,779 execution-affecting churn. The small shell task was explicitly Sonnet; architecture/contact work was Opus. `AI_TASK_PROTOCOL.md:480-560` already sends deterministic, local, bounded whole tasks to Codex. | **Mixed.** Established-pattern editing can use Sonnet or Codex already. Contract/public-boundary work shares context with planning and testing and should stay with the main capable executor. |
| **Gate execution** | The durable record contains final PASS results, not shell transcripts, retry counts, failure logs or time spent. | Running a command and reporting its exit status is **mechanical**. Triage is only mechanical for an obvious lint/type failure; a behavior/spec failure is judgment work. The repo cannot say how often either occurs. |
| **Independent review** | Across the six Stage 6 implementation reviews: **20 findings, including 8 blockers**, all accepted (one accepted item deferred to its named later block). The handoffs/reviews/responses occupy 629/407/359 lines respectively. Every block's lint/typecheck/tests were green before the independent review. | **Judgment-dense and demonstrably load-bearing.** Green gates did not expose the platform-size contradiction, broken replay path, false abuse ceiling, missing FS behavior, or invented product limit. This work is already routed to non-limit-bound Codex. |
| **Review processing and fix loop** | Claude's six responses total 359 lines before consensus tables, plus the resulting code/tests/docs fixes. `AI_TASK_PROTOCOL.md:447-478` keeps the originating IMPL session open because it holds diff, context and reasoning. | **Judgment-dense.** Accept/reject/defer and repair must preserve the original contract. Handing it to a fresh cheap worker recreates exactly the re-derivation cost the protocol forbids. |
| **Reporting/doc sync** | Several accepted findings were false or unsupported durable claims, not syntax failures. Task 01 alone had three code-vs-doc mismatches; later reviews found a missing waiver and a completion-obligation contradiction. | Drafting a status line is mechanical; verifying that it is true is not. Codex delegation already covers objective doc sync when a task specifies the source and exact write surface. |

**Model reasoning from the repo evidence.** The high-tier cost is not simply "code generation."
The defensible ordering is:

1. design/planning and review-response judgment are the highest-value high-tier phases;
2. implementation volume is substantial but already tiered (Opus/Sonnet/Codex) by task risk;
3. repeated context acquisition is the clearest fixed input cost;
4. gate execution is cheap judgment-wise, but historical gate-*failure triage* cost is unknowable.

The repo cannot rank those phases by actual tokens. It contains no Claude transcripts, `/usage`
exports, per-phase timestamps, cache statistics, compaction events, or failed-attempt logs. Git
records accepted output, not the reasoning and discarded work that produced it. Any claim such as
"planning consumes 40%" or "gates are the dominant cost" would be invented.

The local installation is **Claude Code 2.0.55**; `.claude/agents/` is absent and
`.claude/settings.json` has only commit/push permission prompts. Thus no project-specific model
router or cheap-tier worker currently exists. The Stage 6 FS is dirty from another session; it was
not read as evidence after that change and was not touched here.

### Part (b) — what is actually practised outside

#### Short map

1. **Per-subagent model choice is shipped, not hypothetical.** Current Claude Code custom subagents
   can select `haiku`, `sonnet`, `opus`, `fable`, a full model ID, or inherit the parent; each starts
   with an isolated context and does not receive the parent's conversation or files already read.
   Custom/general agents load `CLAUDE.md`, while built-in Explore/Plan omit it. The current docs also
   say to keep work in the main conversation when planning, implementation and testing share
   significant context, and to use subagents for self-contained or verbose work
   ([Claude Code subagents, accessed 2026-07-17](https://code.claude.com/docs/en/sub-agents)).
   **External primary source.**

2. **Anthropic tried a cheaper default for code exploration and then removed that default.** The
   changelog introduced Explore as Haiku-powered in Claude Code 2.0.17; current docs say that as of
   2.1.198 Explore inherits the main model instead of always using Haiku. Users can still override
   it with a custom `model: haiku`. The docs do **not** state why the default changed, so attributing
   it to quality, provider compatibility or economics would be speculation
   ([Claude Code changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md),
   [current subagent behavior](https://code.claude.com/docs/en/sub-agents)). **External primary
   sources; reason unknown.**

3. **OpenAI ships the exact strong-parent/small-worker shape, but for narrow support work.** On
   2026-03-17 OpenAI described a larger Codex model doing planning, coordination and final judgment
   while GPT-5.4 mini subagents search code, review large files or process supporting documents.
   Mini uses 30% of the large model's Codex quota; the same release reports 54.4% versus 57.7% on
   SWE-Bench Pro, but a wider 60.0% versus 75.1% gap on Terminal-Bench 2.0
   ([GPT-5.4 mini and nano](https://openai.com/index/introducing-gpt-5-4-mini-and-nano/)).
   **External primary source/vendor evaluation.** This supports cheap bounded workers, not a cheap
   coordinator.

4. **Two-tier coding can improve correctness, but it adds an inference boundary.** Aider's 2024
   Architect/Editor mode lets a reasoning model solve and a second model format/apply edits.
   o1-preview plus a cheaper editor scored 85.0% versus the architect's 79.7% solo baseline on
   aider's editing benchmark. Aider also says the full-file combinations were slow enough to be
   impractical interactively, and older model chains had been too slow
   ([Aider, 2024-09-26](https://aider.chat/2024/09/26/architect.html)). **External primary
   source/project benchmark.** It proves a narrow division can work; it does not show that an
   autonomous cheap orchestrator saves total context.

5. **The strongest coding-specific routing evidence uses cheap exploration before escalation, not a
   cheap manager dispatching from the prompt.** SWE-Router (submitted 2026-06-30) runs a weak model
   for a few codebase-exploration turns, then a trained value head decides whether it should
   continue or a strong model should restart. The weak turns are always charged. The authors
   explicitly restart the strong model from the original task because conditioning it on the weak
   model's reasoning can bias it toward the weak model's mistakes. On their held-out
   SWE-Bench-Verified slice, temporal routing improved Route-AUC by at least 12 percentage points
   over their strongest prompt-only baseline
   ([SWE-Router paper](https://arxiv.org/pdf/2607.00053)). **External primary source/preprint.**
   Important boundary: the genuinely held-out slice was 100 issues, and the method trained a value
   head on roughly 1.7k weak-model trajectories plus other splits. This is evidence for the
   direction, not an installable rule for a project with three completed tasks.

6. **A very recent coding benchmark report shows the same direction at larger scale.** AI21's
   2026-07-15 vendor report used cheap parallel models for repo search/attempts, a mid-tier model for
   context extraction, and one frontier model for the final patch. It reports 80.8% on 731 public
   SWE-Bench Pro tasks at $5.99/task, versus a separately reported $18.28 solo Opus 4.8 run; only
   25% of its pipeline budget went to frontier models
   ([AI21 report](https://www.ai21.com/blog/better-and-cheaper-together-open-models-explore-frontier-models-patch/)).
   **External primary source/vendor self-report.** It is not independent validation, and it measures
   API dollars on hundreds of benchmark issues, not a subscription usage cap or owner attention on
   this private MVP. Still, its successful ordering is informative: cheap exploration → compressed
   context → frontier patch.

7. **Coordinator overhead is measured and can erase the saving.** Anthropic reports that its
   Opus-lead/Sonnet-worker research system beat solo Opus by 90.2% on an internal breadth-first
   research eval, but agents used about 4× chat tokens and multi-agent systems about 15×; it says
   coding usually has fewer parallelizable tasks and more shared dependencies
   ([Anthropic, 2025-06-13](https://www.anthropic.com/engineering/multi-agent-research-system)).
   Current Claude Code cost guidance says agent teams use about **7×** a standard session in plan
   mode because every teammate owns a context window; it recommends subagents for tests, docs or
   logs mainly so verbose output stays out of the parent context
   ([Claude Code costs, accessed 2026-07-17](https://code.claude.com/docs/en/costs)).
   **External primary sources.** Context isolation can protect the expensive parent while still
   increasing total tokens.

8. **"Cheap model" is not the same as "cheap completed run."** Microsoft's May 2026 Switchcraft
   paper reports 82.9% accuracy and 84% cost reduction on five tool-calling benchmarks, but also
   finds that nominally cheaper models can cost more in total because they reason with more tokens
   ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/switchcraft-ai-model-router-for-agentic-tool-calling/)).
   **External primary source; not a coding benchmark.** It directly invalidates routing by price
   label without outcome/trajectory measurement.

9. **The abandoned-heavy-harness result from Findings 1 remains the right warning.** Anthropic's
   Opus 4.5 planner/generator/evaluator run cost $200 versus $9 solo. With Opus 4.6, it removed
   context resets and sprint decomposition because the newer model made them overhead, while
   retaining QA only where it still caught real gaps
   ([Anthropic, 2026-03-24](https://www.anthropic.com/engineering/harness-design-long-running-apps)).
   **External primary source/engineering experiment.** A router is another scaffold whose value
   must be re-proved against the current model and task shape.

#### Claim test

**Model reasoning from repo + external sources.**

The owner's broad hypothesis is directionally right — different tiers can reduce frontier spend —
but its proposed topology is the weak form:

> cheap coordinator → top tier for design → mid tier for execution

The sources that show real coding gains instead use either:

- a **capable coordinator/final judge** with cheap bounded workers; or
- **cheap-first exploration**, followed by an evidence-based escalate/continue decision and a strong
  final patch.

A cheap coordinator must classify task difficulty, notice hidden dependencies, write complete
delegation prompts and decide when the worker is wrong. In this repository those are the same
judgment-dense acts that produced eight accepted blockers despite green gates. SWE-Router's central
result is that prompt-only routing lacks enough information; its strong model even discards the
weak trajectory rather than inherit potentially biased reasoning. Therefore a standing cheap
Claude orchestrator does **not** clear the bar.

The context ledger is likewise two-sided:

- a subagent saves the main context from verbose searches/logs and returns a compressed result;
- but it starts fresh, receives a delegation prompt, must re-read any missing task/code context, and
  makes the parent pay for synthesis or correction;
- a multi-agent team multiplies this cost; a narrow subagent may not, but no source provides a
  universal subagent-overhead percentage;
- in this repo a safe code-writing worker would need substantially more than the task title, because
  the normative bundle is 382–547 KB before task-specific code.

#### What remains for cheap Claude after Codex

**Model reasoning constrained by the repo.** One material niche remains:

- a **read-only, in-session side task inside a non-delegable Claude IMPL session** — e.g. a precisely
  bounded inbound-reference sweep or a path/line map for a named contract.

Codex should continue to own research, independent review, analysis and entire bounded execution
tasks. Sending a five-minute search substep to Codex would require a new owner-carried ping, a fresh
session and a handback; that coordination cost is larger than the substep. A Claude subagent can do
the same side task inside the already-approved session with no owner round-trip, while the capable
main session retains the task's plan, writes and final judgment.

No other material niche survives:

- **write tests to a spec** — tests here encode contracts; green tests coexisted with eight review
  blockers. Delegate an entire objectively specified test task to Codex, or keep tests with the
  implementing session.
- **mechanical refactor** — already a textbook Codex-delegable whole task.
- **gate execution** — a direct shell call is cheaper than an agent when green. A cheap log-triage
  worker might help only after this project records that verbose failures are a real recurring
  context cost; the repo currently cannot establish that.
- **review/fix processing** — already routed to Codex for independent judgment, then deliberately
  kept with the context-holding Claude executor for fixes.

### Ranked candidate list

#### 1. One measured cheap-tier repo-scout pilot inside a non-delegable Claude task

- **Practice** — Keep planning, edits and final judgment in the capable main Claude session; invoke
  one Haiku/cheap subagent for a narrow, read-only repository question whose output is objective
  paths/lines, not a recommendation or patch. Treat it as a measurement, not a new role or rule.
- **What it would do for this project** — On one future non-delegable Opus/Fable IMPL task that
  already requires a repo sweep, the main session completes Pre-task Sync and plan approval, then
  asks one cheap worker a bounded question such as "find every live caller/reference to this named
  route/type; return path:line plus one-line use." The main session verifies the load-bearing hits
  before using them. Capture the product's available `/usage`/plan-usage readout around the phase,
  record which model actually ran, and note whether the main session had to repeat reads or correct
  omissions. If the installed 2.0.55 client cannot expose the worker model or useful usage evidence,
  the pilot fails its observability condition and stops; do not add config to rescue it.
- **Cost** — Owner attention: **no additional round-trip** beyond the task's existing plan/commit
  approvals. Setup: one precise delegation prompt and a usage snapshot; no `.claude/agents/` file,
  skill, framework edit or dependency. Runtime cost: one extra model call, fresh worker context and
  main-session verification. Total tokens may rise even if frontier-tier usage falls.
- **What we'd give up** — The main model no longer sees the raw exploration path, only a compressed
  report; a weak worker can omit a semantically important caller, and correction can erase the
  saving. Current Claude Code has already changed Explore's default from Haiku back to inherited
  model, so this must prove itself locally rather than borrow a vendor default. The worker gets no
  writes and no authority to interpret Source-of-Truth conflicts.
- **Verdict** — `try now` — **one measured, task-scoped pilot only**. It is the sole remaining slice
  that external coding evidence consistently assigns to cheaper models, and the sole slice where
  in-session Claude avoids an owner round-trip that would make Codex delegation disproportionate.
  Promotion into `AI_TASK_PROTOCOL.md — Session Settings Guidance` requires actual local usage plus
  no-repeat/no-correction evidence; absent that, drop it.

### Selection boundary

No automatic router, cheap coordinator, cheap test writer, agent team, or second candidate clears
the bar. The benchmark winners depend on hundreds/thousands of trajectories, parallel rollouts or a
trained router; this project has six recent code blocks, already routes whole bounded work to Codex,
and cannot currently measure historical tokens. Building that machinery would spend the scarce
Claude/owner budget to optimize an unmeasured remainder.

This round changes the list by exactly one narrow proposal: a measured read-only scout pilot ranks
above the git-hook sizing question because it directly targets the owner's live Claude limit with
zero new owner round-trips or persistent infrastructure. It does **not** establish model routing as
a framework rule, and it makes no decision for the owner/META.

## Response 2

Scout's processing of Findings 2. **No round 3.** The remaining unknowns are unknowable from the
repo (historical token counts do not exist here) and would not change the list
(AI_ENGINEERING_SCOUT.md — Stop Condition). This is the thread's last research turn.

### What I re-verified independently

- **The bundle numbers are exact.** `.claude/CLAUDE.md` 239 + `AI_TASK_PROTOCOL.md` 617 +
  `AI_FRAMEWORK_IDEAS.md` 297 + `PROJECT_STAGE_LOG.md` 3,942 + `PROJECT_CONTEXT.md` 148 +
  `PROJECT_ARCHITECTURE.md` 284 = **5,527 lines**; +`PROJECT_DECISIONS.md` 2,121 = **7,648**.
  Both match Findings 2 exactly. *(Verified against the repo.)*
- **`.claude/agents/` is absent** — no project-specific router or cheap worker exists. Confirmed.
  *(Verified against the repo.)*
- **The honesty about limits is the best part of this turn.** Findings 2 states plainly that the
  repo holds no transcripts, no `/usage` exports, no per-phase timestamps, no failed-attempt logs —
  and that "planning consumes 40%" would be invented. It also refused to inflate the bundle by
  counting all ten framework files when `CLAUDE.md:224` is ambiguous about full-file loading. That
  is the discipline the thread asked for. *(Verified against the repo.)*

### Accepted — the hypothesis is answered, and the answer is "not in the proposed shape"

The owner's topology (**cheap coordinator → top tier for design → mid tier for execution**) does not
survive the evidence, and the reason is specific rather than general skepticism:

- Every source showing real coding gains inverts it: a **capable** coordinator with cheap **bounded**
  workers (OpenAI's large Codex model + GPT-5.4 mini subagents), or **cheap-first exploration** then
  escalation to a strong model (SWE-Router). Nobody ships a cheap manager dispatching from the prompt.
- SWE-Router's finding is the sharpest: prompt-only routing lacks the information to classify
  difficulty, and its strong model **discards** the weak trajectory rather than inherit biased
  reasoning. A cheap coordinator here would be doing the classification that produced **8 accepted
  blockers across 6 blocks despite green gates** — the single most judgment-dense act in this repo.
- Microsoft's Switchcraft closes the price-label argument: nominally cheaper models can cost *more*
  in total because they reason with more tokens. "Cheap tier" ≠ "cheap run".
- Anthropic's own numbers cut both ways and both ways hurt this topology: multi-agent ≈15× tokens,
  agent teams ≈7× a standard session, and coding specifically "has fewer parallelizable tasks and
  more shared dependencies" than research.

**Accepted: no automatic router, no cheap coordinator, no agent team.** Not as taste — on evidence.

### Where I depart from the researcher

**Candidate (cheap repo-scout pilot) — I move it from `try now` to `note only`.** *(Model reasoning.)*

Codex ranks it first because it targets the live Claude limit at zero owner round-trips. Both facts
are true. I still think it is not worth doing, for a reason its own analysis supplies:

1. **It optimizes a slice it cannot show is expensive.** Findings 2 concedes the repo cannot rank
   phases by tokens. The pilot therefore measures a saving on a step nobody has established as a
   cost. Its own observability condition ("if the client cannot expose the worker model or useful
   usage evidence, the pilot fails and stops") is likely to fire — and then we have spent the
   scarcest resource, an approved IMPL task's attention, to learn nothing.
2. **The ledger is plausibly negative at our size.** A subagent starts fresh: it re-reads what the
   parent already holds, and the parent must verify the load-bearing hits anyway. For a repo whose
   normative bundle is 382–547 KB *before* task code, a five-minute sweep is exactly the case where
   re-establishing context costs more than the sweep saved.
3. **Anthropic already ran this experiment on our behalf and reversed it.** Explore shipped
   Haiku-powered in 2.0.17 and, by 2.1.198, inherits the main model instead. Findings 2 correctly
   refuses to guess *why* — but for us the direction is the signal: the vendor's own cheap-exploration
   default did not hold, and we would be re-deriving it with a sample size of one task.

`note only` — not rejected forever. If a session ever records that verbose gate-failure triage or
repeated exploration is a real recurring context cost, the pilot becomes worth its approval. Today
that evidence does not exist, and the Scout's bar says a candidate must earn itself.

### What Findings 2 found and did not name

**This is my main addition to this round.** *(Verified against the repo.)*

Both rounds circled the fixed context tax without naming its actual composition. Findings 2 reports
the bundle as an aggregate (5,527 / 7,648 lines). Broken down, it is not evenly distributed:

| File | Lines | Share of the mandatory bundle |
| --- | ---: | ---: |
| `PROJECT_STAGE_LOG.md` | 3,942 | **71%** |
| `PROJECT_DECISIONS.md` | 2,121 | 28% of the extended bundle |
| everything else (CLAUDE.md + protocol + journal + context + architecture) | 1,585 | 29% |

**`PROJECT_STAGE_LOG.md` alone is 71% of what every session reads before it is allowed to do
anything** — and `CLAUDE.md` mandates it as the first read of every session except clarifying
questions. Together with `PROJECT_DECISIONS.md` the two files are **79%** of the extended bundle.
The framework documents this scan spent two rounds discussing (`AI_TASK_PROTOCOL.md` at 617 lines,
the journal at 297) are a rounding error beside them.

This reframes the cost question. The expensive thing about our setup is not which model runs a
substep — it is that **every session pays a ~4,000-line historical narrative to reach a ~330-line
median block**. The 2026-07-15 audit measured process-vs-product commits and produced the compaction
of the journal; nobody has since looked at the *stage log*, which is 13× the journal's size and is
read by strictly more sessions.

I am **not** proposing a fix. Two reasons, and they matter:

- **It is not the Scout's to propose.** This is an internal doc-weight question, not an outward
  practice. It belongs to META under its own bar — and it plausibly *clears* that bar without me:
  `AI_WORKFLOW_MASTER.md` names "real weight in context/tokens/limits (the docs loaded into every
  session are the ones that matter — a bloated always-read file is a live cost, not an aesthetic
  one)" as fix-now, not defer.
- **The outward scan is what surfaced it**, which is the one legitimate reason it appears in this
  thread at all. Round 2 asked "where do our tokens go"; the answer came back "we cannot know" — and
  it is true for *tokens*, but the line counts were sitting in plain sight the whole time.

Filed here as a **note to META**, not a candidate. META decides whether it is a live cost and, if
so, what to do — the same route as everything else in this thread.

### Final list to the owner

The thread's outward work is finished. What survives two rounds:

1. **Browser acceptance probe** (round 1, candidate 1) — `try now`, as one task-scoped pilot.
   Unchanged and still the only candidate that gives the owner attention back.
2. **Git-hook deny-list** (round 1, candidate 2) — verdict pending a five-minute sizing check.
   Unchanged.
3. **Ablation at the post-MVP retrospective** (round 1, candidate 3) — `later`. Unchanged.
4. **Cheap repo-scout pilot** (round 2) — **`note only`** (Codex proposed `try now`; I depart).
5. **Note to META, not a candidate:** `PROJECT_STAGE_LOG.md` is 71% of the mandatory per-session
   read. Surfaced by this scan; owned by META.

Model routing as a framework rule: **closed, on evidence, not adopted.**

### Резюме для владельца (RU)

**Ваша гипотеза проверена, и ответ — нет, но по конкретной причине, а не «мне не нравится».**

Codex посчитал и нашёл наружу первичные источники. Его цифры по репо я перепроверил сам — сходятся
до строки. Главное:

- **Ни у кого не работает дешёвый координатор.** Все, у кого есть реальный выигрыш на коде, делают
  наоборот: **сильный** координатор + дешёвые **узкие** исполнители (OpenAI: большой Codex + mini
  на поиск по коду), либо дешёвая разведка → эскалация к сильной модели (SWE-Router). Причина
  жёсткая: дешёвый координатор должен классифицировать сложность задачи — а это ровно тот акт,
  который у нас дал **8 принятых блокеров на 6 блоков при зелёных гейтах**.
- **«Дешёвая модель» ≠ «дешёвый прогон»** (Microsoft Switchcraft): дешёвые модели часто думают
  большим числом токенов и выходят дороже.
- **Координация сама жжёт**: у Anthropic мульти-агент ≈15× токенов, команды агентов ≈7× обычной
  сессии, и код параллелится хуже ресёрча.

**Кандидат Codex (дешёвый разведчик по репо) я понизил с `try now` до `note only`** — расхожусь с
ним. Он оптимизирует шаг, дороговизну которого сам же не смог показать; подагент стартует с нуля и
перечитывает то, что родитель уже держит; а Anthropic свой же дешёвый Explore на Haiku **откатила**
к наследованию основной модели. Повторять этот эксперимент на выборке из одной задачи — не окупается.

**А вот что нашлось попутно, и это важнее всех кандидатов.** Оба раунда крутились вокруг «налога на
контекст», но никто не назвал, из чего он состоит. Разложил:

**`PROJECT_STAGE_LOG.md` — 3 942 строки, это 71% всего, что читает каждая сессия перед работой.**
Вместе с `PROJECT_DECISIONS.md` — 79%. Тот самый `AI_TASK_PROTOCOL.md` (617), который мы два раунда
обсуждали, рядом с ними — погрешность.

То есть дорого у нас не то, какая модель делает подшаг, а то, что **каждая сессия платит ~4 000
строк истории, чтобы дойти до медианного блока в ~330 строк**. Аудит 2026-07-15 сжал журнал; на
stage log с тех пор не смотрел никто, а он в 13 раз больше журнала и читается чаще.

**Чинить не предлагаю — это не моё.** Это внутренний вопрос веса доков, он к META. И, по-моему, он
проходит её планку fix-now без моей помощи: там прямо написано, что «раздутый always-read файл — это
живая цена, а не эстетика».

## Outcome

Owner decided on the five-item final list (2026-07-17). This thread proposes to META and does not
change the framework (AI_ENGINEERING_SCOUT.md — Rights); it also may not write task files, the
backlog, or the journal. So this Outcome **names where each accepted item lands**; the actual
landing is done by META or the next appropriate session, which owns those write surfaces.

### Owner decisions

1. **Browser acceptance probe** — `try now`, as one task-scoped pilot.
   → **Lands as a `draft` task file** (`docs/project/tasks/`): a Stage-6 visitor-facing IMPL block
   adds, after `pnpm qg`, one browser run of that block's acceptance path at mobile width plus one
   failure path, evidence attached to the task/review handoff. Scope-locked to one block: it is a
   measurement, **not** an E2E suite and **not** a framework gate. It proves the local app only —
   it may not retire a completion obligation about the live Vercel/Supabase boundary. If the pilot
   pays, META later decides whether `AI_REVIEW_PIPELINE.md` / `PROJECT_TESTING_STRATEGY.md — Manual
   Verification` should name a reusable browser path. Source: round 1, candidate 1.

2. **Git-hook deny-list on `git add -A`** — **rejected by owner.** The existing prose rule in
   `.claude/CLAUDE.md` is deemed sufficient; a mechanical guard is not wanted. No work item. This
   overrides Findings 1's `try now` ranking — an explicit owner call, recorded so it is not
   re-proposed. Source: round 1, candidate 2.

3. **Ablation of harness rules at the post-MVP retrospective** — `later`.
   → **Lands in PROJECT_BACKLOG.md** as a retrospective item, pointing at this thread. At a model
   generation change or the post-MVP retrospective, test whether scaffolding (blanket review rule,
   checkpoint threshold, fresh-session guidance, duplicated preflight reads) still pays; retire only
   rules whose original failure no longer reproduces. No action now. Overlaps the already-filed
   `META_TASK_01_framework_consolidation.md`. Source: round 1, candidate 3.

4. **Cheap repo-scout subagent pilot** — `note only`, not adopted.
   → **No work item.** Model-tier routing as a framework rule is closed on evidence (Findings 2 +
   Response 2): no source ships a cheap coordinator; "cheap tier" ≠ "cheap run"; coordination
   overhead is real; Codex already owns the biggest routing lever. Revisit only if a session records
   that verbose gate-failure triage or repeated exploration is a real recurring context cost.
   Source: round 2, candidate 1 (Codex proposed `try now`; Scout departed to `note only`; owner
   confirmed).

5. **`PROJECT_STAGE_LOG.md` is 71% of the mandatory per-session read** (3,942 lines; with
   `PROJECT_DECISIONS.md`, 79% of the extended bundle) — **handed to META**, owner approved.
   → **Lands as an `open` entry in AI_FRAMEWORK_IDEAS.md — Workflow Observations**, for META to
   judge under its own bar. This is a candidate fix-now under `AI_WORKFLOW_MASTER.md` ("a bloated
   always-read file is a live cost, not an aesthetic one"), but the Scout does not decide that and
   does not write the journal — META does. Surfaced by round 2; not a Scout candidate. This is a
   note, per AI_ENGINEERING_SCOUT.md — Relationship to META (the Scout may note; META owns it).

6. **External validation of the existing process + one linked note** (added 2026-07-17, from an
   owner-supplied transcript: Matt Pocock's public "AI coding workflow" skills repo, ~162k stars).
   → **Folds into the item-5 journal note for META; not a new candidate, no separate work item.**
   The transcript is *not new practice to adopt* — it is independent confirmation that this project's
   three load-bearing rules were already arrived at, and in a stronger form:
   - "one unbroken context window, watch the ~140k smart zone, clear between tickets" — we already
     have this as *disposable sessions + docs-as-interface* (state is durable, not context-held), a
     stronger form than manual clearing;
   - "spec → tickets, each ticket = one context window" — this is our task-file convention
     (`AI_TASK_PROTOCOL.md`: one file = one task = one IMPL session; checkpointed large blocks);
   - "review in fresh-context sub-agents because an author over-praises its own code" — verbatim our
     mandatory independent Codex cross-review gate.
   **The one idea it sharpens** (does not settle): user-invoked **skills as an on-demand load
   mechanism** — Pocock reports 38 installed skills costing ~660 tokens because they load on `/call`
   rather than sitting always-read. That bears directly on item 5 (our 617-line `AI_TASK_PROTOCOL.md`
   is read in full by *every* session). Findings 2 already proposed a skills layer and the **Scout
   rejected it** — reason still standing: it adds a third instruction format (beside `CLAUDE.md` /
   `AGENTS.md`) while `META_TASK_01_framework_consolidation.md` (`draft`) is open on *deleting*
   duplication. The transcript shows the *benefit* (660 vs. 617) but does not remove the *cost*.
   → **For META: weigh on-demand loading of the always-read protocol *together with* the item-5
   stage-log weight and META_TASK_01 — one context-weight question, not three — never as a standalone
   new format.** Source: owner transcript, 2026-07-17; connects round 2 (context tax) + Findings 1
   (skills layer, rejected).

### Landing checklist (for META / the next session — not for the Scout)

The Scout's write rights stop at this thread. The following are **not yet done** and are the
reason this Outcome is a proposal, not a completed filing:

- [ ] `draft` task file for item 1 (browser-probe pilot on one Stage-6 block).
- [ ] PROJECT_BACKLOG.md entry for item 3 (retrospective ablation), pointing at
      `research/done/RESEARCH_2026-07-16_agentic-engineering-practices-scan.md`.
- [ ] `open` journal entry in AI_FRAMEWORK_IDEAS.md for item 5 (stage-log weight) **plus the item-6
      link** (on-demand loading / skills, weighed together with META_TASK_01 — one context-weight
      question), for META.
- [ ] On close, move this thread to `docs/project/research/done/`.

Items 2 and 4 need no work item (rejected / note only). Item 6 folds into item 5 (no separate item). No `.request.md`/`.answer.md` buffers were
created this thread (no external-AI round was earned), so none need deleting.

### Scout session close

The outward scan is finished and the role's stop condition is met: two rounds, each earned itself,
and the remaining unknowns (actual historical token counts) are unknowable from the repo and do not
change the list. Model routing closed on evidence; one pilot and one retrospective item survive; one
note handed to META. The Scout proposes; META and the owner dispose.
