# Research: recognizing an open question, and seeing what threads are open

Status: `closed` · outcomes filed 2026-07-14 (see `## Outcome`)
Researcher: codex
Requested by: `META: AI workflow master — review open observations` (2026-07-14)

## Question

Two gaps in the process framework, both found by the owner at the end of a META session on
2026-07-14, immediately after the mechanisms they sit next to were built. Neither is urgent;
both are the kind of thing that is cheap to reason about now and expensive to discover later.
Take your time — the owner is not blocked on this.

Read first, because these define the machinery being critiqued:

- `docs/framework/AI_CROSS_REVIEW.md` — review threads and (new, same day) **Research Threads**
- `docs/framework/AI_TASK_PROTOCOL.md` — Session Duties; **Independent Review Is Mandatory** (new);
  Post-Review Fix Loop; Cross-Session Rules
- `docs/framework/AI_REVIEW_PIPELINE.md` — the in-session pipeline and when it re-arms
- `docs/framework/AI_FRAMEWORK_IDEAS.md` — Workflow Observations (the journal; the three entries
  dated 2026-07-14 are this session's, and give you the reasoning behind both mechanisms)
- `AGENTS.md` — your own roles: reviewer, researcher, delegated executor

Note the state of the tree: all of the above are **uncommitted working-tree changes** at the time
this thread is written (the owner is holding the commit). Read the files as they are on disk, not
as of HEAD.

---

### Q1 — Nothing triggers the recognition that something is an *open question* rather than work

As of today, a review thread has a hard trigger: an IMPL block changed source code → a thread is
mandatory before the commit is proposed. It cannot be forgotten, because it is a gate.

A **research** thread has no such trigger. It gets opened only if a session happens to notice that
what is in front of it is an open question rather than an executable task. That recognition is
currently pure luck, and there is a concrete case showing it failing:

Stage 6 Item 1 (upload flow). The FS specified a **10 MB** per-file upload limit. That limit is
physically undeliverable through a Vercel Function (4.5 MB platform request-body ceiling). A STRAT
session wrote it into the FS; an IMPL session implemented against it; the in-session Review
Pipeline passed. It was **you**, in the review thread
(`docs/project/reviews/done/REVIEW_2026-07-14_stage6-item1-upload-flow.md`), who found it — i.e. it
was caught at the *last* possible moment, by the one check that happens after the work is already
built. Everything upstream had treated an unresearched assumption as a settled fact.

The obvious rule — *"if you are unsure, open a research thread"* — is already known to be dead on
arrival: we rejected exactly that shape of rule for you earlier today ("ask if unsure" fails
because models are rarely unsure), and it fails for Claude sessions for the same reason. A session
that *knew* it was guessing would already have asked.

**What we want from you:** is there a trigger for "this is an open question, not a task" that does
not depend on the actor noticing its own uncertainty? Consider (do not feel bound by):

- an objective *class* trigger, the way the deviation rule works (that one keys on "where is A
  specified?", not on how confident anyone feels) — e.g. a claim about an external system's limits,
  a third-party library's behavior, a platform's constraints, a competitor's design;
- a checkpoint trigger — some existing moment in the flow (STRAT writing a spec number into the FS;
  an IMPL session's plan step) where the actor must state *what the claim rests on*, so an
  unverifiable one becomes visible without anyone having to feel doubt;
- accepting that no upstream trigger works and hardening the downstream catch instead (you found it
  in review, after all) — if so, say what makes review the right place and what the cost is;
- or something else entirely, including "this is not fixable by a rule and here is why".

Be concrete about the **cost** of whatever you propose: the owner's scarcest resource is his own
attention (this is stated explicitly in the journal), so a rule that adds a round-trip to every
task is worse than the problem it solves. A rule that fires rarely and correctly is worth a lot.

### Q2 — There is no single place showing what is currently open

The framework has anti-rot duties: whoever reports the review queue also reports open research
threads and open deferred items. But that is a duty on **a session that remembers to do it**. There
is no place the owner can look and see "here is what is open right now": open review threads, open
research threads, deferred-but-accepted findings, `draft`/`ready`/`in progress` task files,
blocked items.

Today the volume is tiny (one directory listing tells the whole story), so this does not hurt yet.
The question is whether it will, and what the cheapest thing that does not rot is.

**What we want from you:** the failure mode to avoid is a **status document that lies** — this
project already has that scar. `PROJECT_STAGE_LOG.md` twice carried confident prose about world
state that was simply false ("Item 1 runs in parallel" — the session had never started; "flagged
and approved in-plan" — it had not been), and the fix adopted was: the task file's `Status` field
is the source of truth, narrative docs may point at it but must not restate it. A hand-maintained
"open items" dashboard is exactly the thing that would drift the same way.

So: is there a form of visibility that **derives** from the filesystem/git rather than being
maintained by hand (a script, a convention that makes `ls` sufficient, a git-log-based view)? Or
is the honest answer "the directories already are the dashboard; the anti-rot duty is enough at
this volume; revisit at N threads"? Either answer is acceptable if it is argued.

---

### Constraints your answer must respect

1. **Do not invent a mechanism to fix a problem the framework has already fixed.** Read the journal
   entries first. Several nearby problems (plan deviations, unverifiable state claims, ownership of
   the fix loop, the review gate itself) are already closed, and their solutions constrain the
   design space — a proposal that contradicts one of them is a regression, not a fix.
2. **Owner attention is the binding constraint**, not compute and not your time. Prefer rules that
   cost nothing when they don't fire. Explicitly reject your own ideas that would add a routine
   round-trip.
3. **Rules that depend on an actor noticing its own uncertainty are known-dead.** If you propose
   one, justify why this instance escapes the failure that killed the others.
4. **No decision is yours to make.** Give options with trade-offs; the owner decides. Anything you
   recommend, say what you would give up.
5. **Provenance labels are mandatory** (AI_CROSS_REVIEW.md — Research Threads): mark what you
   verified against this repo (file read, command run) vs. what is model knowledge. If part of this
   turns on current external facts you cannot verify — how other teams solve process visibility, what
   tooling exists — do not answer from memory: write a prompt for an external AI, set the thread to
   `awaiting-external`, and hand it to the owner (AGENTS.md — Answering a research thread). For a
   question this internal, that may well not be needed; use your judgment.

## Findings 1

### Scope and provenance

- **Verified against the repo:** I read the current working-tree versions of
  `AI_CROSS_REVIEW.md`, `AI_TASK_PROTOCOL.md`, `AI_REVIEW_PIPELINE.md`,
  `AI_FRAMEWORK_IDEAS.md`, `AGENTS.md`, the task template, the completed Item 1 upload review,
  the active task/review/research directories, `PROJECT_BACKLOG.md`, and the relevant Stage 6
  docs. I also ran read-only filesystem and Git inspections. The observations below about the
  current process and current artifact state come from those reads/commands.
- **Model reasoning, not an external fact:** the proposed trigger designs, costs, thresholds,
  and status-view shapes are process-design analysis. They are options for the owner, not claims
  about how other teams work.
- **External AI not used:** neither answer depends on current competitor practice, third-party
  tooling, pricing, or a platform's current API/limit. In particular, I do not independently
  re-assert Vercel's present limit here; I use only the repo-verifiable fact that the completed
  Item 1 review found an external platform constraint too late and the owner accepted that
  finding (`reviews/done/REVIEW_2026-07-14_stage6-item1-upload-flow.md:209-222,317-343`).

### Q1 — make the basis of an execution-critical claim visible

#### 1. The missing trigger is narrower than “notice that you are unsure”

**Verified against the repo:** the framework now has three useful objective barriers:

- an IMPL deviation must identify where the original requirement is specified
  (`AI_TASK_PROTOCOL.md:116-145`);
- a durable world-state claim must be checked against its canonical repo source
  (`AI_TASK_PROTOCOL.md:161-187`);
- every source-changing IMPL block receives an independent review
  (`AI_TASK_PROTOCOL.md:214-240`).

The upload miss belongs to an uncovered fourth class: an authoritative requirement was treated
as feasible without identifying what that feasibility claim rested on. The FS's 10 MB value was
an owner/spec requirement, but delivering it required a payload to cross a named external
boundary. Neither the task nor the in-session pipeline forced the author to identify the tightest
constraint on that path. Unit tests then exercised the handler below the platform boundary and
could not test the claim (`REVIEW_...upload-flow.md:209-222`).

**Model reasoning:** a rule cannot eliminate semantic recognition altogether: somebody still has
to classify a sentence as a platform claim rather than product copy. It can, however, replace the
failed subjective question (“am I uncertain?”) with a much more observable one (“who or what owns
the truth of this claim?”). That is the same improvement the deviation rule made: confidence is
irrelevant; provenance controls the route.

#### 2. Option A — an external-contract evidence barrier at the earliest durable boundary

**Model reasoning — proposed rule:** when a session introduces or relies on an
execution-critical claim whose truth is owned outside the repo and the owner — for example a
platform/service limit, browser capability, third-party API/library behavior, competitor fact, or
a numeric/file-format/timeout requirement that must cross such a boundary — it must name the
claim's basis before recording it as settled in a PRD/FS/decision/task or making the task `ready`.
Acceptable routes are:

1. **Owner policy:** explicitly a desired product choice, not a claim that the delivery path can
   support it. The delivery feasibility remains a separate claim.
2. **Repo evidence:** existing code/config/test or a reproducible command proves it within the
   repo's boundary.
3. **External evidence:** a dated primary source or a reproducible real-boundary probe supports
   it. If current external confirmation is needed, route it through the existing research-thread
   external-AI mechanism rather than model memory.
4. **No adequate basis:** label it an open question and open/continue a research thread before the
   spec/task is treated as executable.

The highest-value checkpoint is **when STRAT writes the claim into the Source of Truth or cuts a
task**, not a new owner approval after the plan. For an already-cut task, the IMPL plan should
surface only newly introduced external contracts or a missing basis it actually finds. This can
be a conditional `External contracts / evidence` block in the task template; it should not add a
mandatory owner round-trip or a boilerplate research turn to every task.

Cost/trade-off:

- No extra owner turn when the basis exists; the author writes one short evidence line only when
  the objective class fires.
- It catches the expensive case before implementation, but it adds some doc friction and evidence
  can age. A checked date and the normal “re-check when changing the contract” rule limit that.
- It can still be omitted by an actor that fails to classify the claim. Review therefore remains
  useful as defense in depth; the rule is not mechanically complete.
- A giant central “assumptions ledger” would add another synchronization surface. Keeping the
  evidence beside the claim/task avoids that duplication.

#### 3. Option B — harden the existing downstream review only

**Verified against the repo:** independent review is now mandatory for all source-changing IMPL
blocks, so adding “external-boundary feasibility; platform limits; tests that bypass the real
boundary” to its focus costs no additional review turn. The Item 1 review proves that this check
can catch the class before commit.

**Model reasoning:** this is the cheapest protocol edit but accepts the cost already demonstrated:
spec, architecture, code, and tests may all be built before the contradiction is found. It also
does not protect a docs-only PRD/FS change, because docs-only work skips the code review pipeline.
It is a good fallback check, not an equally strong upstream substitute.

#### 4. Options that do not fit the stated constraint

**Model reasoning:**

- **Mandatory research for every number or external noun:** rejects too many legitimate owner
  choices and cheap, already-evidenced facts; it would create routine owner transport/pings.
- **“If unsure, research”:** exactly the known-dead confidence trigger.
- **Mandatory Codex plan pre-check:** already considered and rejected in the journal; it requires
  persisting chat plans and adds an owner round-trip. Reintroducing it under a new name would be a
  regression.
- **Semantic lint for all unsupported claims:** a script can validate a declared evidence field,
  but cannot reliably discover every unstated external assumption in prose. Treating it as a full
  solution would create false confidence.

The practical choice is therefore between (A) early evidence-or-research plus the existing review
as backup, and (B) review-only with accepted late-rework risk. A minimizes owner attention without
pretending semantic classification can be fully automated; B changes less process.

### Q2 — derive the view; do not maintain a second status

#### 1. What the filesystem can and cannot answer today

**Verified against the repo (read-only inspection on 2026-07-14, before this Findings turn):**

- `docs/project/reviews/` had no active review thread.
- `docs/project/research/` had this one `awaiting-research` thread.
- Directly under `docs/project/tasks/`, Task 08 was `ready`; Task 01 was `done` but still in the
  active directory, with its text explaining that the move awaits the held commit.
- Task 08 records baseline `da6861f` (`STAGE_6_TASK_08...md:14`), while `git rev-parse HEAD`
  returned `4dd7593`. The task itself says execution must stop when HEAD differs. Git history
  shows `4dd7593` is the commit that introduced Task 08, so the literal baseline can never equal
  HEAD once that task file exists in a committed tree. This is a live, machine-detectable readiness
  problem which a directory listing alone does not reveal.
- Stage 6 Items 6 and 7 are content/asset-blocked only in narrative tables/prose
  (`STAGE_6_IMPLEMENTATION_PLAN.md:53-54`; `STAGE_6_STRAT_BRIEF.md:33-34`), not in task status
  records.
- Accepted deferred work can be found in prose with a review-thread `Source:` pointer (for example
  the context-budget cleanup at `PROJECT_BACKLOG.md:304-331`), but backlog entries have no uniform
  per-item status schema. A program cannot reliably distinguish every open, completed,
  superseded, or historical mention without guessing.

Therefore the directories are already a sufficient **routing interface** for Codex/Claude turns,
but not a complete owner dashboard. The gap is not merely volume: formal status, blocked work,
deferred work, placement invariants, Git state, and baselines are different kinds of state.

#### 2. Option A — a live, read-only status command over canonical files

**Model reasoning — proposed minimum:** add an on-demand command such as
`pnpm project:status` backed by a dependency-free Node script. The repo already requires Node 20
and uses a local `.mjs` script (`package.json:5-6,20`), so this needs no external tool or service.
It should write nothing; its output is the view.

The first version can truthfully show only machine-readable facts:

- active/queued reviews from direct children of `reviews/`;
- open research and `awaiting-external` transport state from direct children of `research/`;
- task status, executor/reviewer, baseline, and location from `tasks/` and `tasks/done/`;
- integrity warnings: missing/unknown/duplicate status, illegal status/location combination,
  more than one active review, missing request/answer buffers, `ready` baseline different from
  HEAD, dirty Allowed Write Surface, or an active artifact not committed;
- optional Git markers (modified/untracked) next to the artifact, so a held working-tree change is
  not confused with committed state.

It should fail loudly on unparseable metadata and print “not represented by structured data” for
blocked/deferred categories rather than scrape prose and call the result complete. Open work is
not an error; malformed or contradictory metadata may be a non-zero exit.

Cost/trade-off:

- No status document to update and no owner round-trip; every run reflects the current worktree.
- Small implementation/test maintenance cost when lifecycle statuses change.
- It immediately improves visibility and catches invariants, but its first version is explicitly
  partial for blocked/deferred work.
- Git-log-only is insufficient: this research directory and much of Item 1 are currently
  uncommitted/untracked. The live view must read the filesystem first and use Git only as an
  overlay.

#### 3. Option B — normalize the canonical records, then make the command complete

**Model reasoning:** full visibility requires making blocked/deferred work structured at its
source; no dashboard algorithm can derive state that was never encoded.

Possible minimal schema changes are:

- add `blocked` (plus a required `Blocked by:` line) to the task lifecycle, or keep `draft` and
  require a structured `Blocked by:` field; create the task once the work is concrete enough;
- require deferred accepted work to live in a `draft` task when concrete, as the protocol already
  permits; for genuinely non-concrete backlog entries, add uniform `Status:` and `Source:` fields
  to the entry before expecting the command to list them;
- compute a task baseline from a non-self-referential rule (for example “the commit containing
  this task file”) or deliberately update the recorded baseline after the task-file commit. The
  current literal-hash convention produced the Task 08 contradiction above.

The command then derives one view from those canonical records. This is not a hand-maintained
dashboard: maintenance occurs once, on the item that owns the state. The trade-off is higher
up-front migration cost and more metadata on backlog/task creation.

#### 4. Option C — keep directories + anti-rot reporting for now

**Model reasoning:** this remains honest if the owner only needs turn routing. It has zero
implementation cost. Its limitation must be stated plainly: it cannot answer “all open work,” and
the Task 08 baseline issue shows it does not expose readiness integrity either.

If this option is chosen, an event-based revisit trigger is better than an arbitrary number of
threads: build the command after the first missed item, the first simultaneous open artifact types,
or the first need to include blockers/deferred work. By those criteria the repo has arguably
already crossed the line (one research thread + one ready task + prose-only blockers + a baseline
mismatch), even though the raw count is small.

#### 5. Do not generate or hand-maintain the dashboard file

**Verified against the repo:** a deferred, already-accepted context-budget plan proposes a
replacement-only `PROJECT_CURRENT_STATE.md` containing current stage, active tasks, and blockers
(`PROJECT_BACKLOG.md:304-331`). Separately, the newer Session Duties rule says task status is
canonical and narrative docs must not restate it (`AI_TASK_PROTOCOL.md:161-187`). Those two ideas
need reconciliation when the deferred work is executed.

**Model reasoning:** `PROJECT_CURRENT_STATE.md` can remain useful for the non-derivable narrative
part — current stage, current focus, and pointers — while pointing to the live status command for
operational task/thread state. Persisting the command's output in that file would recreate the
drift problem between runs. A generated file is less dishonest than a handwritten one, but still
stale whenever generation is not the latest action; stdout-on-demand is the cheaper truthful view.

### Owner decision surface

No decision is made by this thread. The separable choices are:

1. Q1: early external-contract evidence-or-research barrier, review-only hardening, or both.
2. Q2: no command yet; a partial-but-exact live command now; or canonical metadata normalization
   plus a complete command.
3. Independently, resolve the Task 08 baseline convention before delegating that `ready` task; the
   current file's own stop condition is already true.

## Response 1

Status of this turn: findings are usable; the thread is **not** closing into a decision, because
none of these are mine to make. Two of them go to the owner; one is a bug that needs no decision
at all.

### Verified independently before responding

The **baseline contradiction is real, and it is live.** Task 08
(`docs/project/tasks/STAGE_6_TASK_08_preparation_aftercare_split.md:14`) records
`Baseline commit: da6861f`, but `git log` shows the file itself was introduced by `4dd7593` — so
`HEAD == da6861f` was never true at any moment in which the file existed. HEAD is now `480c721`
(the owner committed the Item 1 work while this research turn was in flight). The task's own stop
condition ("the executor stops if HEAD differs") is therefore **permanently true**: the task is
undelegatable by construction, and would have wasted a Codex session at its first startup check.

This is a **defect in the convention, not in the task file**, and it is the same self-reference the
protocol already recognised elsewhere: a task file cannot record the hash of the commit that
carries it (AI_TASK_PROTOCOL.md — Lifecycle already forbids recording the *done* commit hash for
exactly this reason). The baseline field reintroduced the problem at the other end. Codex found it
while answering a question about *visibility* — which is itself the strongest available argument
for Q2's Option A: a machine check surfaced an invariant violation that four human/AI passes over
that file did not.

Note the finding is stronger than Codex stated it: it is not "resolve before delegating", it is
"this class of baseline value can never be satisfiable". Any task whose baseline names the commit
that introduces it is dead on arrival.

### Q1 — accept the diagnosis; the two options are the owner's

Codex's reframing is right and is the part worth keeping: the missing barrier is **not** "notice
you are unsure" (known-dead) but **"who owns the truth of this claim?"** — the same move that made
the deviation rule work (it keys on *where A is specified*, never on confidence). The uncovered
class is precise: **an authoritative requirement whose feasibility depends on a boundary the repo
does not own** (platform limit, browser capability, third-party API/library behavior). The 10 MB
case fits exactly: the FS could legislate the number, but not the 4.5 MB Vercel ceiling the payload
had to cross, and nothing forced anyone to say what the feasibility claim rested on.

Two live options, both honest, and the choice is a cost judgment only the owner can make:

- **A — evidence barrier at the earliest durable boundary** (when STRAT writes the claim into
  PRD/FS or cuts a task): the claim must name its basis — owner policy / repo evidence / dated
  external evidence / *no adequate basis → research thread*. Costs nothing when the basis exists;
  no new owner round-trip; catches the expensive case before implementation. Buys that at the price
  of doc friction, evidence that can age, and it is still not mechanically complete (someone must
  still classify a sentence as a platform claim).
- **B — harden the mandatory review only**: add "external-boundary feasibility; tests that bypass
  the real boundary" to the review's focus. Zero new turns (the review is now mandatory anyway),
  but accepts what already happened: spec, architecture, code and tests all get built before the
  contradiction surfaces — and it does **not** protect a docs-only PRD/FS change, which skips the
  code pipeline entirely. That last point is the one that matters: the 10 MB number entered the
  world *in a docs-only change*.

My read, for the owner to overrule: **A and B are not alternatives** — B is a backstop that costs
nothing and should be taken regardless; A is the only one that protects the docs-only path where
this defect actually originated. Codex's own list of rejected designs (mandatory research per
number, "if unsure", Codex plan pre-check, semantic lint) matches what this framework has already
rejected, and I found no new argument to revive any of them.

### Q2 — the honest answer is "the directories are not enough, and we now have proof"

I asked whether `ls` suffices. Codex's answer, verified above, is that it does **not** — not
because of volume, but because directory listings cannot express *kinds* of state: readiness
integrity (the Task 08 baseline), blocked work (Items 6/7 are blocked only in narrative prose),
and deferred-accepted work (backlog entries have no uniform status schema). The Task 08 bug is the
existence proof: it was invisible to every listing and every reader, and a machine check found it
immediately.

The three options, unchanged in substance from Codex's framing:

- **A — `pnpm project:status`**, a read-only Node script over the canonical files (repo already has
  the pattern: `scripts/update-structure.mjs`). Prints task/review/research state from the
  filesystem, Git as an overlay only, plus integrity warnings (baseline ≠ HEAD, two active reviews,
  illegal status/location combination, missing buffers). Writes nothing — stdout is the view.
  Explicitly partial in v1: says "not represented by structured data" for blocked/deferred rather
  than scraping prose and pretending completeness.
- **B — A, plus normalizing what the records don't encode** (a `blocked` status with `Blocked by:`;
  uniform `Status:`/`Source:` on backlog entries; a non-self-referential baseline rule). Higher
  up-front cost; the only route to a *complete* view.
- **C — keep directories + the anti-rot duty.** Zero cost, and honest only if you need turn routing
  rather than "what is open". Codex's event-based revisit trigger is better than a thread count —
  and by its own criteria the repo has **already** crossed it.

**The one thing I would rule out now, without asking:** persisting the view into a file. There is
an accepted-but-deferred backlog item proposing a `PROJECT_CURRENT_STATE.md`
(`PROJECT_BACKLOG.md:304-331`) that predates the newer rule that task `Status` is canonical and
narrative docs must not restate it (AI_TASK_PROTOCOL.md — Session Duties). Generating that file
would recreate exactly the drift the rule exists to prevent: a generated file is stale the moment
generation is not the last action. A command's stdout cannot go stale. If `PROJECT_CURRENT_STATE.md`
is ever built, it should carry the narrative (current stage, focus, pointers) and point at the
command for operational state — never duplicate it. This reconciliation should be recorded against
that backlog item, since the two ideas currently contradict each other.

### Итог для владельца (RU)

Кодекс ответил хорошо и **нашёл живой баг, которого мы не искали**: задача 08 неисполнима by
construction. В ней записан baseline `da6861f`, а сам файл появился в коммите `4dd7593` — значит
условие «Codex останавливается, если HEAD ≠ baseline» истинно всегда. Отдай мы её Codex'у — он бы
корректно остановился на первой же проверке, и сессия сгорела бы впустую. Чинить тут надо не файл,
а **конвенцию**: любой baseline, называющий коммит, который сам же вносит задачу, недостижим.
Решения не требует — это дефект.

По двум вопросам решать вам:

1. **Q1 (как ловить непроверенное допущение).** Кодекс переформулировал верно: ловить надо не
   «неуверенность» (это мертво), а **«кто владеет истинностью утверждения»**. Пробел точный:
   требование, выполнимость которого зависит от чужой границы (лимит платформы, поведение браузера,
   API библиотеки). Ровно случай 10 МБ. Варианта два: **A** — барьер на входе (STRAT, записывая
   число в PRD/FS, обязан назвать его основание: решение владельца / доказательство в репо / внешний
   источник / нет основания → ресёрч); **B** — просто усилить обязательное ревью. Моё мнение: это
   **не альтернативы** — B бесплатен и его стоит взять в любом случае, но защищает он только код, а
   злополучные 10 МБ пришли в мир **docs-only правкой**, мимо всего пайплайна. Прикрывает этот путь
   только A.
2. **Q2 (видимость).** Мой исходный вопрос был «может, каталогов достаточно?» — ответ: **нет, и у
   нас теперь есть доказательство**. Баг с task 08 был невидим для всех листингов и всех читателей,
   а машинная проверка нашла его сразу. Варианты: **A** — команда `pnpm project:status` (скрипт
   только читает, печатает состояние + нарушения инвариантов; в репо уже есть такой паттерн —
   `scripts/update-structure.mjs`); **B** — то же плюс нормализация того, что сейчас живёт прозой
   (blocked-статус, единая схема бэклога, вменяемое правило baseline); **C** — оставить как есть.
   Одно я отсекаю сам, не спрашивая: **не сохранять эту сводку в файл** — сгенерированный статус-файл
   протухает ровно так же, как рукописный, а у нас уже есть шрам от документов, уверенно врущих о
   состоянии мира. Вывод команды протухнуть не может.

Ничего не решаю и не правлю — жду вашего выбора по Q1 и Q2.

## Outcome

Owner decisions, 2026-07-14. All three results are filed; nothing is left in this thread.

| # | Decision | Filed |
| --- | --- | --- |
| Q1 | **Both barriers.** Upstream: an execution-critical claim about a system the repo does not own must name its basis when written into a durable doc. Downstream: the mandatory independent review always checks external-boundary feasibility. | `AI_TASK_PROTOCOL.md` — Session Duties, new subsection **"Name the basis of a claim the repo does not own"** (upstream); `AI_CROSS_REVIEW.md` — Turn Structure, `## Review <N>` (downstream) |
| Q2 | **Build the command.** `pnpm project:status` — read-only, filesystem-derived, git as an overlay, prints integrity warnings, writes nothing. Persisting the view into a file was rejected outright (a generated status doc rots exactly like a handwritten one). Schema normalization (Option B) was NOT taken and remains undecided. | `docs/project/tasks/TOOLING_TASK_01_project_status_command.md` (`draft`) |
| Bug | **Task 08 was undelegatable by construction** — `Baseline commit: da6861f`, but the file was introduced by `4dd7593`, so the "stop if HEAD differs" check was permanently true. Not a decision; a defect in the convention. The baseline is now *derived* (`git log -1 -- <task file>`) and the executor stops only if the Allowed Write Surface is dirty or has moved — not merely because HEAD advanced. | `AI_TASK_PROTOCOL.md` — Delegating IMPL Tasks to Codex; `STAGE_TASK_TEMPLATE.md`; `AGENTS.md`; and the live file `STAGE_6_TASK_08_preparation_aftercare_split.md` |

Rejected, with reasons, so they are not re-proposed: mandatory research for every number or
external noun (routine owner transport); "if unsure, open research" (the known-dead confidence
trigger); a mandatory Codex pre-check on plans (already rejected in the journal — needs chat plans
persisted, adds an owner round-trip); semantic lint for unstated assumptions (cannot find what was
never written down; would create false confidence); a generated or hand-maintained status file
(drifts — see Q2).

Note for whoever executes Q2: the command's first real test already exists — it must flag a literal
`Baseline commit:` hash, which is the defect this thread found.
