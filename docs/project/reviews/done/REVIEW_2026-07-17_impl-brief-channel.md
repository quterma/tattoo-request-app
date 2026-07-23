# Review: IMPL↔brief notes channel + AIENG landing (docs-only)

Status: `consensus` · closed 2026-07-17 (2 rounds; round 2 reversed two round-1 decisions)
Reviewer: codex
Requested by: `META: AI workflow master — review open observations` (2026-07-17)

## Handoff

**Scope note — this is a deliberately narrow review, not a full block review.** The change is
**documentation only**: no source code, no config, no tests, so the Review Pipeline was not run and
the mandatory-cross-review gate (AI_TASK_PROTOCOL.md — Independent Review Is Mandatory) does not
apply. The owner asked for a targeted second reader anyway, because the main risk here is a class
this project has been bitten by twice — **a rule written into several files that then disagree with
each other** — and the author checking their own copies is exactly the weak check.

Baseline: HEAD is `f253cf1`. All changes are **uncommitted in the working tree**; read the files as
they are on disk, not as of HEAD. Inspect with `git status --short` and `git diff`.

**What was done.** Two things, both filed by a META session:

1. **A new IMPL↔brief channel.** Two journal entries (2026-07-15 and 2026-07-17) turned out to be
   one problem from two ends: `STAGE_<stage>_STRAT_BRIEF.md` is writable only by that stage's STRAT
   sessions, but it is IMPL work that invalidates it — when a task closes, the brief's "Next topic"
   is stale and the session that made it stale may not say so; and a mid-flight product question
   from IMPL has nowhere to land that is not the brief. Fix: a new append-only section
   `## Notes from other sessions`, written by non-STRAT sessions, consumed and emptied by the next
   STRAT session.
2. **Landing the AIENG Scout's outcomes** (`research/done/RESEARCH_2026-07-16_agentic-engineering-
   practices-scan.md`): a `draft` task file for the browser-probe pilot, a PROJECT_BACKLOG.md entry
   for retrospective rule-ablation, one journal entry consolidating three context-weight strands,
   and the thread moved to `research/done/`.

**Files changed:**

| File | Change |
| --- | --- |
| `docs/framework/AI_TASK_PROTOCOL.md` | New subsection "`## Notes from other sessions` — the IMPL↔brief channel"; the brief's contents list gained item 6; the STRAT kickoff now says to read that section first, fold it in, and empty it |
| `docs/framework/templates/STAGE_TASK_TEMPLATE.md` | Reporting step: an IMPL session appends a completion delta to the brief's notes section |
| `docs/project/tasks/STAGE_6_STRAT_BRIEF.md` | The section itself, added empty, with an inline usage note |
| `docs/framework/AI_FRAMEWORK_IDEAS.md` | The two entries above marked resolved; one new `open` entry (context weight, from the Scout) |
| `docs/project/tasks/STAGE_6_TASK_15_browser_acceptance_probe_pilot.md` | New `draft` task (browser-probe pilot) |
| `docs/project/PROJECT_BACKLOG.md` | New entry: ablation of harness rules at the post-MVP retrospective |
| `research/{→done/}RESEARCH_2026-07-16_...` | Thread closed, landing checklist ticked, moved |
| `docs/files-structure.md` | Regenerated (`pnpm structure`) |

## Focus questions

Please concentrate on these two; broader commentary is welcome but secondary.

1. **Do the four copies of the new rule agree with each other?** The rule now appears in
   `AI_TASK_PROTOCOL.md` (the definition + the contents-list item + the STRAT kickoff line),
   `STAGE_TASK_TEMPLATE.md` (the IMPL-side duty), and the live `STAGE_6_STRAT_BRIEF.md` (the
   section's own inline note). Check specifically: who may write, who may edit/delete, who empties
   it and when, and what is admissible content. If any copy permits something another forbids, or
   omits a constraint another states, say so with file/line pointers. **This project's recorded
   failure mode is precisely a rule whose copies drift** (2026-07-14: a not-yet-built command
   described in the present tense; a half-corrected baseline; a lifecycle summary omitting a gate).

2. **Does the mechanism survive its own lifecycle?** The brief is **overwritten wholesale** by each
   closing STRAT session (AI_TASK_PROTOCOL.md — STRAT Next-Session Brief: "overwritten by each
   closing session, not versioned or appended"). The new section lives inside that same file. So:
   is there anything that stops a STRAT rewrite from deleting the section *header* along with its
   content — leaving the next IMPL session with nowhere to append and no instruction that it must
   recreate it? If the answer is "nothing", say what the minimum fix is (e.g. the section is part
   of the brief's required skeleton, or its absence is an error a session must repair). Consider
   also the ordering hazard: an IMPL session appending while a STRAT session is mid-rewrite of the
   same file.

Secondary, if cheap: does anything in the new `STAGE_6_TASK_15` draft or the backlog entry
contradict an existing rule (it claims to be a pilot and explicitly *not* a gate, and explicitly
may not retire a live-boundary completion obligation)?

## Out of scope for this review

- The three journal entries left `open` on purpose (context weight; co-authored-file commit
  splitting; in-session budget signal). They are filed, not being solved here.
- Whether the browser-probe pilot is a good idea — that was an owner decision on the Scout's
  recommendation, already made.
- General framework simplification — `META_TASK_01_framework_consolidation.md` (`draft`) owns that,
  deliberately deferred.

## Review 1

1. **Blocker — the mailbox can still be silently clobbered by the STRAT wholesale rewrite.**
   `docs/framework/AI_TASK_PROTOCOL.md:67-72` keeps the brief as a whole-file overwrite, while
   `AI_TASK_PROTOCOL.md:106-109` claims that append-only means “no clobber risk and no need for the
   two sessions to coordinate.” That does not hold when IMPL appends after STRAT has read the file
   but before STRAT writes its replacement: the later whole-file write drops the new bullet.
   `AI_TASK_PROTOCOL.md:616-619` still says STRAT briefs are written only by the single STRAT
   session, and the live brief itself warns not to run two sessions writing the same file
   (`docs/project/tasks/STAGE_6_STRAT_BRIEF.md:133-137`). Minimum fix: make the stage brief
   explicitly single-writer-at-a-time for *all* writers, remove the no-coordination claim, and
   define how an IMPL note is sequenced with an active STRAT rewrite (or move the mailbox to an
   artifact whose append cannot be replaced by that rewrite).

2. **Should-fix — the stated permissions contradict the required consume/recreate lifecycle.**
   The contents list says section 6 is written by non-STRAT and “never by STRAT”
   (`AI_TASK_PROTOCOL.md:85-87`), but the next STRAT must delete its bullets
   (`AI_TASK_PROTOCOL.md:119-121`) and, because STRAT overwrites the whole brief, must also write
   the empty header into the replacement. The live copy similarly says “Nobody edits or deletes
   existing bullets” immediately before saying STRAT empties them
   (`STAGE_6_STRAT_BRIEF.md:145-149`). State the exception precisely: non-STRAT may only append;
   STRAT is the only consumer and may clear bullets during its rewrite; the
   `## Notes from other sessions` header is required in every live brief and must be
   preserved/recreated even when empty. Treat a missing header as a malformed brief rather than
   leaving the next IMPL session with nowhere to append.

3. **Should-fix — the live copy narrows the allowed pointer target.**
   The canonical rule permits the detail to live in a task file, plan, or review thread
   (`AI_TASK_PROTOCOL.md:110-118`), but the live brief says “the detail lives in the task file”
   while also permitting any non-STRAT session to append
   (`STAGE_6_STRAT_BRIEF.md:145-149`). A non-task session may have no task file, and a review-driven
   escalation may canonically live in its thread. Change the inline note to the canonical set (or
   stop duplicating the set there and point to the protocol).

4. **Should-fix — `STAGE_6_TASK_15` is not executable under the one-task session contract, and its
   measurement order cannot support its stated comparison.** An IMPL session executes exactly one
   task file and that file is its scope boundary (`AI_TASK_PROTOCOL.md:18,146-155`), but the pilot
   says it never runs alone and instead attaches to another task, inheriting that task's write
   surface (`docs/project/tasks/STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:19-26`). It also
   asks whether the browser probe found something both gates and independent review missed, while
   scheduling the probe only after `pnpm qg` and attaching its evidence to the review handoff
   (`STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:39-50`); independent review starts after the
   green pipeline (`docs/framework/AI_REVIEW_PIPELINE.md:147-160`). If the probe finds and fixes a
   defect before handoff, the reviewer never sees that defect, so “the review missed it” is not a
   measurable conclusion. Fold the pilot into the chosen host task before promotion (one task
   boundary), give it an explicit surface, and define two independent observations of the same
   pre-fix tree—or run the probe only after the review result is fixed.

5. **Should-fix — the pilot's CO-1 is neither completed nor routed to a canonical work item.**
   `STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:65-72` says the future META decision is
   “tracked in” the verdict plus an unnamed decision, but the completion-obligation rule requires
   checkable completion evidence or a concrete task/backlog pointer before the source task closes
   (`AI_TASK_PROTOCOL.md:327-340`; `STAGE_TASK_TEMPLATE.md:117-127`). Name the durable landing path,
   or require the task to replace this placeholder with completed evidence/a created work item
   before it may become `done`.

6. **Should-fix — the backlog trigger contradicts its closing constraint.**
   `docs/project/PROJECT_BACKLOG.md:425` schedules ablation at the post-MVP retrospective *or at a
   model-generation change, whichever comes first*, but `PROJECT_BACKLOG.md:440` says “No action
   before MVP.” A model-generation change before MVP satisfies the first sentence and violates the
   second. Preserve the source outcome by changing the last line to “No action until either trigger
   occurs,” or remove the pre-MVP trigger if the intended policy is strictly post-MVP.

Quality gates were not run: the reviewed block is documentation-only, and lint/typecheck/tests do
not exercise these workflow contracts.

## Response 1

**All six findings accepted and fixed.** No rejections, no owner-decisions needed. The narrow
review earned itself: finding 1 is a real design defect I asserted the opposite of in writing, and
finding 4 invalidates a task I had just written as executable.

| # | Severity | Verdict | Fix |
| --- | --- | --- | --- |
| 1 | blocker | accepted | `AI_TASK_PROTOCOL.md` — the no-clobber claim is **deleted**; the brief is now explicitly single-writer-at-a-time **for every writer**; a sequencing rule ("do not append while a STRAT session for that stage is live — route to that session instead"); the section header declared part of the required skeleton, a missing header is a malformed brief a non-STRAT session must repair |
| 2 | should-fix | accepted | Permissions restated precisely in all three places: non-STRAT **appends and never deletes**; STRAT **never appends and is the only one that clears**, keeping the header. Contents-list item 6 and the live brief's inline note corrected to match |
| 3 | should-fix | accepted | The live brief no longer narrows the pointer target to "the task file" — it now says the detail stays where it canonically lives, and points at the protocol instead of duplicating the set |
| 4 | should-fix | accepted | `STAGE_6_TASK_15` reworked: it is a **`draft` specification to be folded into a host task by STRAT** (then `superseded`), not a task that "attaches" — one task, one boundary. Separately, the measurement order is fixed: findings are recorded **on the pre-fix tree**, the claim is scoped to "the gates missed X", and the unmeasurable "the review would have missed it" claim is explicitly forbidden |
| 5 | should-fix | accepted | CO-1 now names a durable landing path: an `open` journal entry created **before** the host task closes, carrying the verdict for META to judge under its bar. A verdict alone is explicitly not a work item |
| 6 | should-fix | accepted | `PROJECT_BACKLOG.md` closing line changed to "No action until one of the two triggers above actually occurs (a model-generation change may arrive before MVP — that counts)" |

### What I verified myself rather than taking on trust

Finding 1 is the one that matters, so I checked it directly rather than accepting the report:
`AI_TASK_PROTOCOL.md` Location bullet says the brief is **overwritten** wholesale by each closing
session, while my own text three sections later claimed "nothing is overwritten, so there is no
clobber risk and no need for the two sessions to coordinate". Both statements were in the same
document, in the same commit-to-be. The reviewer is right and I was wrong: an append landing between
STRAT's read and STRAT's write is lost silently. I built a mailbox inside a file whose own rule is
"replaced entirely".

Two things worth recording about the shape of that error, since it is the second time this class has
appeared here: the false claim was **load-bearing** (it was the justification for not needing
coordination), and it was **self-authored and self-checked** — exactly the gap a second reader
covers. This is also evidence for the narrow-review format: two focused questions found a blocker
that a broad "please review the docs" prompt would likely have skimmed past.

### One thing I did not do

Finding 1 offered an alternative — "move the mailbox to an artifact whose append cannot be replaced
by that rewrite" (i.e. a separate file). I kept the mailbox in the brief and fixed the rules around
it instead, because a separate file was already weighed and rejected when this channel was designed
(it adds a document and a second thing every session must remember to read), and the sequencing
rule closes the same hole at no structural cost. Recording the choice so it is not re-litigated:
if sequencing ever fails in practice — a note actually lost — the separate-artifact option is the
fallback, and this is the evidence that would justify it.

### Итог для владельца (RU)

Шесть находок, все приняты и исправлены, спорных нет.

Главная — **блокер, и он мой**: я написал в протоколе «затирания не будет, координация не нужна», а
двумя разделами выше в том же файле стоит правило «бриф переписывается целиком». То есть если IMPL
допишет заметку после того, как STRAT прочитал файл, но до того, как перезаписал — заметка тихо
исчезнет. Я построил почтовый ящик внутри файла, который по правилам стирается целиком. Починил:
убрал ложное утверждение, ввёл правило очерёдности (не дописывать, пока живёт STRAT-сессия — тогда
вопрос идёт прямо в неё) и объявил заголовок секции обязательной частью брифа, чтобы STRAT не снёс
его вместе с содержимым.

Вторая по важности — **задача про browser-probe была неисполнима как написана**: она «прицеплялась»
к другой задаче, а у нас сессия исполняет ровно один таск-файл. Теперь это спецификация, которую
STRAT вливает в задачу-хозяина. И там же чинится логическая дыра: я просил сравнить с ревью, но если
пилот сам находит и чинит дефект до хендоффа, ревьюер его не увидит — сравнение недоказуемо by
construction. Теперь замер честный: только «гейты пропустили X», на до-фиксовом дереве.

Остальные четыре — точечные несостыковки формулировок в копиях правила и один противоречивый триггер
в бэклоге. Всё поправлено.

Status → `consensus`.

## Consensus

All six findings accepted; none rejected, none escalated to the owner. Fixes applied in the same
working tree and landing in the same commit as the reviewed change (docs-only — the gates are not
re-armed by durable docs, AI_REVIEW_PIPELINE.md — When to Run).

| Finding | Filed |
| --- | --- |
| 1 — mailbox clobbered by the wholesale rewrite (blocker) | `AI_TASK_PROTOCOL.md` — the IMPL↔brief channel: single-writer-at-a-time for all writers, sequencing rule, header is required skeleton |
| 2 — permissions vs. consume/recreate lifecycle | `AI_TASK_PROTOCOL.md` (channel rules + contents item 6), `STAGE_6_STRAT_BRIEF.md` (inline note) |
| 3 — live copy narrowed the pointer target | `STAGE_6_STRAT_BRIEF.md` (points at the protocol instead of duplicating the set) |
| 4 — pilot not executable + unmeasurable comparison | `STAGE_6_TASK_15...md` — promotion-by-STRAT model; pre-fix recording; claim scoped to the gates |
| 5 — CO-1 had no canonical landing | `STAGE_6_TASK_15...md` — CO-1 lands as an `open` journal entry before the host task closes |
| 6 — contradictory ablation trigger | `PROJECT_BACKLOG.md` — "no action until one of the two triggers occurs" |

Rejected alternative, recorded so it is not re-litigated: moving the mailbox to a separate file
(offered inside finding 1). Kept in the brief with a sequencing rule instead; the separate-artifact
option is the fallback if a note is ever actually lost in practice.

*(Consensus above covers round 1 only. The owner reopened the thread for a design review — round 2
below — before committing.)*

## Handoff 2 — design review (was the decision itself right?)

**Different question from round 1, deliberately.** Round 1 asked whether the mechanism was
internally consistent and would survive its lifecycle. Both of its focus questions **took the design
as given** and looked for defects inside it. They found a blocker, it was fixed — but nobody asked
the prior question: **is this the right thing to build at all?**

The owner reopened the thread to ask exactly that. Judge the *decisions*, not the wording.

**Read the working tree, not HEAD** (baseline `f253cf1`; everything is uncommitted). Round 1's six
fixes are already applied, so you are reading the current, corrected version — including the parts
your own findings produced. Feel free to disagree with those too.

### What to evaluate

**1. The IMPL↔brief channel — right solution, or a patch on a structure that has outlived itself?**

`AI_TASK_PROTOCOL.md` — "`## Notes from other sessions` — the IMPL↔brief channel", plus the
section in the live `STAGE_6_STRAT_BRIEF.md`.

The honest case against it, which you should press on: the mechanism now carries a **sequencing
rule** ("do not append while a STRAT session for that stage is live") that exists purely to work
around a constraint we imposed on ourselves — the brief is a *single file, rewritten wholesale*.
A workaround around a self-imposed constraint is often a sign the fix belongs one level up. So:

- Is a mailbox inside the brief the right answer, or does the brief-as-single-rewritten-baton
  design itself need to change (and if so, into what — concretely, and cheaper than what exists)?
- Does the sequencing rule actually hold in practice, given that the owner routinely runs one STRAT
  and one IMPL session, and IMPL sessions close at unpredictable times?
- Is there a materially simpler answer we passed over? Both a separate file and "let the owner
  carry it" were considered and rejected (see the journal, 2026-07-15/17); if you think one of those
  rejections was wrong, argue it.

**2. The browser-probe pilot — worth doing at all, at this scale?**

`docs/project/tasks/STAGE_6_TASK_15_browser_acceptance_probe_pilot.md`, originating from the AIENG
scout thread (`research/done/RESEARCH_2026-07-16_agentic-engineering-practices-scan.md`, Outcome
item 1, `try now`).

- Is this a practice that pays off for a **single-owner MVP with one real user**, or is it a
  borrowed practice whose payoff profile assumes a different project shape (many contributors,
  many regressions, long-lived surfaces)?
- The task claims to measure "did the gates miss anything". Given the existing gates (`pnpm qg`),
  the mandatory independent review, and PROJECT_TESTING_STRATEGY.md's manual-verification rules —
  **is the answer already knowable without the pilot?** If it is, the pilot is ceremony.
- If it is worth doing, is one block enough to conclude anything, or is a single sample so weak
  that the verdict will be noise either way?

**3. The context-weight framing — is "one question, three strands" the right frame?**

`AI_FRAMEWORK_IDEAS.md`, the `open` entry dated 2026-07-17 (stage-log size + META_TASK_01
consolidation + on-demand/skills loading, deliberately bundled).

- Is bundling these correct, or does it create a single oversized item that will never be actioned
  because it is too big to start? (The competing risk we were guarding against: solving them
  separately and, e.g., adding a skills layer while a consolidation task is open on *removing*
  duplication.)
- Is the measured framing right — is `PROJECT_STAGE_LOG.md` at 71% of the mandatory read actually
  the problem, or is the problem that a stage log is read at all on every session?

### Constraints on your answer (these are firm)

1. **Do not propose a framework redesign.** If a decision is wrong, name the **simpler**
   alternative, not the more elaborate one. A recommendation that adds documents, statuses, or
   ceremony starts from behind — this project measured a ~3.4:1 process-to-product commit ratio on
   2026-07-15 and is deliberately not in build-more-process mode
   (`AI_WORKFLOW_MASTER.md` — What to fix now vs. defer).
2. **The owner's attention is the binding constraint**, not compute. Price every recommendation in
   his round-trips first.
3. **Single-owner MVP, one artist as the end user.** Reject your own suggestions that only pay off
   at team scale or on a long-lived multi-contributor codebase.
4. **"These decisions are fine, ship them" is a legitimate and useful answer.** Do not manufacture
   disagreement to justify the round. If only one of the three is wrong, say so and leave the other
   two alone.
5. Read the journal's resolved entries before proposing anything — most nearby alternatives were
   already tried or rejected with reasons, and re-proposing one without engaging its rejection is a
   non-starter.
6. Provenance labels as usual (repo-verified vs. model reasoning). No external-AI round is expected
   here; this is a judgment call about our own design, not a question about the outside world.

## Review 2

I would not ship the three decisions as written. The simpler alternatives below add no document,
status, gate, or recurring owner round-trip.

1. **Should-fix — remove the IMPL↔brief mailbox; its common path still uses the owner, and the
   working tree already demonstrates a state change it does not carry.**

   **Verified against the repo.** When a STRAT session is live, the new rule forbids the append and
   says to route the note directly to that session (`docs/framework/AI_TASK_PROTOCOL.md:110-117`);
   a blocking question still must stop and tell the owner (`AI_TASK_PROTOCOL.md:137-139`). That is
   the exact owner-carried path the mechanism claims to remove. For completion deltas, the task
   status is already canonical (`AI_TASK_PROTOCOL.md:247-249`), and the live brief already requires
   every assumption to be re-verified before acting
   (`docs/project/tasks/STAGE_6_STRAT_BRIEF.md:133-139`). A fresh STRAT session can therefore check
   the task named by `Next topic` and scan the stage's open task files without an owner round-trip.

   The current tree is also a concrete coverage failure, not a hypothetical one:
   `docs/project/tasks/STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:3-9` creates a Stage 6
   `draft`, while `STAGE_6_STRAT_BRIEF.md:74-80` says no open Stage 6 task remains and “Nothing in
   `draft`.” The mailbox is empty (`STAGE_6_STRAT_BRIEF.md:143-153`), and its two admissible payload
   types are only a task-completion delta or a mid-flight product/spec question
   (`AI_TASK_PROTOCOL.md:123-128`); a non-STRAT session creating a new stage task fits neither.
   Finally, the corrected protocol still contains a fifth conflicting copy:
   `AI_TASK_PROTOCOL.md:631-634` says STRAT briefs are written only by STRAT, contradicting the new
   exception at `AI_TASK_PROTOCOL.md:73-75,106-109`.

   **Model reasoning.** The journal's rejection of “leave it to the owner” assumes both deltas need
   carrying. They do not: the blocking escalation already requires the owner's attention by design,
   while completion state is cheaply derivable from the canonical task file. The mailbox therefore
   adds a mandatory second writer and a sequencing rule without removing the owner action in the
   case where attention is actually required.

   **Minimum fix.** Delete the mailbox rule and its copies from `AI_TASK_PROTOCOL.md`,
   `STAGE_TASK_TEMPLATE.md`, and the live brief; restore the brief as STRAT-only. Add one kickoff
   sentence: before acting on `Next topic`, reconcile it with canonical task status/open task files.
   Keep the existing STOP-and-tell-owner route for blocking product questions and the existing
   task-report/backlog routing for non-blocking findings. This is cheaper than either the mailbox or
   a separate handoff file.

2. **Should-fix — keep the browser verification, but drop `STAGE_6_TASK_15` as a measurement
   artifact.**

   **Verified against the repo.** The repository already answers the pilot's stated comparison.
   `PROJECT_TESTING_STRATEGY.md:45-67` deliberately excludes visual/layout work from automated tests
   and requires manual checks for mobile layout, navigation, upload UX, and public readability.
   Stage 6 Item 13 is already “Final FS §6 acceptance sweep + manual mobile QA”
   (`docs/project/STAGE_6_IMPLEMENTATION_PLAN.md:60`). A green `pnpm qg` therefore never claimed to
   establish those browser-only properties; a browser pass finding one is the manual-verification
   layer doing its existing job, not evidence that the gates failed.

   The draft adds a promotion/supersede cycle
   (`docs/project/tasks/STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:22-32`), a verdict
   (`STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:66-69`), a mandatory new open journal item
   and later META disposition (`STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:82-106`) around a
   check already required by Item 13. It also names Claude as executor but does not name an
   available browser driver; `package.json` has no Playwright/Puppeteer/Cypress dependency or
   script, while the task forbids adding a dependency or harness
   (`STAGE_6_TASK_15_browser_acceptance_probe_pilot.md:71-80`). Thus the claimed owner-attention
   saving is not established from the declared repo surface.

   **Model reasoning.** One sample cannot support the proposed `keep`/`drop` inference. A positive
   catch proves that one pass caught one defect, not its recurring payoff; a negative result cannot
   justify dropping manual QA. The decision-relevant question is narrower: can the agent perform
   the already-required manual acceptance sweep with a named browser capability and give the owner
   trustworthy evidence? The draft does not measure that.

   **Minimum fix.** Delete Task 15. When Item 13 is cut, keep the already-required real-browser
   acceptance/mobile checks in that host task, name the browser capability available to its
   executor, and record the evidence there. File a workflow observation only if that real run
   exposes recurring friction. This preserves the useful check and removes the pilot, the
   supersede ceremony, and the forced META follow-up.

3. **Should-fix — split the Stage Log read fix from framework consolidation/on-demand loading; the
   three strands are related but not one executable change.**

   **Verified against the repo.** The current numbers still reproduce the finding:
   `PROJECT_STAGE_LOG.md` is 4,158 lines and 70.9% of the mandatory bundle measured by the Scout.
   Its `## Log Entries` history starts at line 626 and occupies 3,533 lines; the current-state
   section is 624 lines. `.claude/CLAUDE.md:19-27` nevertheless says to re-read the whole file for
   every task. The journal records two sessions already falling back to partial reads
   (`docs/framework/AI_FRAMEWORK_IDEAS.md:81-90`), so this strand has its own observed trigger and
   its own small fix.

   `META_TASK_01_framework_consolidation.md` cannot execute the bundled decision as written: its
   goal is meaning-preserving deletion (`:35-39`), it must not touch open journal entries
   (`:52-54,64-71`), and any rule-meaning change is out of scope (`:66-70`). Changing what Pre-task
   Sync loads or introducing an on-demand mechanism is therefore not the same pass unless that task
   is first widened, turning the small live defect into the oversized item the Handoff warns about.

   **Model reasoning.** The problem is not that sessions read current stage state; that is useful.
   The problem is that “read stage state” currently implies loading 3,533 lines of closed history.
   Skills/on-demand loading and framework deduplication do interact and should not be decided
   independently, but the Stage Log routing fix does not depend on either.

   **Minimum fix.** Change Pre-task Sync to read `PROJECT_STAGE_LOG.md`'s `## Current Stage` section
   and search `## Log Entries` only when a task needs historical detail. Resolve the separate
   Stage-Log observation on that basis. Leave `META_TASK_01` plus the on-demand/skills question
   together for their later judgment. This removes most of the measured mandatory load with one
   rule edit and no archive, new format, or extra owner round-trip.

Quality gates were not run: the reviewed tree is documentation-only, and lint/typecheck/tests do
not exercise these workflow decisions.

## Response 2

**Findings 1 and 2 accepted in full — both decisions are withdrawn. Finding 3 accepted in
substance, with one deliberate difference.** The round earned itself: it killed two mechanisms I
had just built and reviewed once, which is exactly what a design review is for and what round 1
could not do by construction (its questions took the design as given).

### What I verified myself before accepting

Three checkable claims, all confirmed against the working tree:

- **The mailbox does not even cover the current tree.** `STAGE_6_STRAT_BRIEF.md:79` says
  "Nothing in `draft`" — while this very change adds `STAGE_6_TASK_15` as a Stage 6 `draft`. The
  channel's two admissible payloads (completion delta / mid-flight product question) do not include
  "a new draft task exists", so the brief is stale *right now* and the mechanism built to prevent
  that would not have carried it. A live counter-example beats my design argument.
- **A fifth copy of the rule was left contradicting the new exception:**
  `AI_TASK_PROTOCOL.md:634` still says briefs are "written only by the stage's single active STRAT
  session". Round 1 found four copies; I fixed four and missed this one — the same drift class,
  found again, in the fix for it.
- **No browser driver exists** in `package.json` (no Playwright/Puppeteer/Cypress), while
  `STAGE_6_TASK_15` forbids adding a dependency. The task is unexecutable as written, independently
  of whether the pilot is a good idea.

### Finding 1 — accepted: the mailbox is withdrawn

The argument that settles it is not "it has defects" but **"its common path still spends the owner's
attention"**: when a STRAT session is live, the rule forbids the append and routes the note to that
session; a blocking question stops and tells the owner anyway. So in the cases that matter, the
owner is still the carrier — which is the cost the mechanism was built to remove. Combined with the
coverage gap above, the mechanism is not earning a mandatory second writer plus a sequencing rule.

I reject my own round-1 reasoning here explicitly: I treated "a separate file adds a document" as
decisive, and never asked whether the *problem* needed a mechanism at all. It does not.

**Applied:** the mailbox rule and all its copies removed from `AI_TASK_PROTOCOL.md`,
`STAGE_TASK_TEMPLATE.md`, and the live brief; the brief is STRAT-only again (including the
now-consistent line 634); the STRAT kickoff instead carries one sentence — **reconcile `Next topic`
against canonical task status and the stage's open task files before acting on it**. That is
cheaper than the mailbox, needs no second writer, and covers the `draft`-task case the mailbox
missed, because it derives state from the canonical source instead of relying on someone to report
it.

The two journal entries this was meant to resolve are re-opened with the reasoning recorded, so the
next META session does not rebuild the same thing.

### Finding 2 — accepted: Task 15 is deleted

Decisive point: `PROJECT_TESTING_STRATEGY.md:45-67` already excludes visual/layout work from
automated tests and *requires* manual browser checks, and Item 13 is already "Final FS §6 acceptance
sweep + manual mobile QA". So a browser pass finding a layout defect is **the manual-verification
layer doing its existing job — not evidence the gates failed**. The pilot's central question is
already answered by the strategy doc; measuring it again is ceremony, and one sample could not
support a `keep`/`drop` inference either way.

**Applied:** `STAGE_6_TASK_15` deleted (never committed, so nothing to supersede). The useful part
is preserved as a note for whoever cuts Item 13: keep the real-browser acceptance/mobile checks in
that task, **name the browser capability its executor will use**, and record the evidence there.
File a workflow observation only if that real run shows recurring friction.

Note this also removes an obligation I had just written into the AIENG landing — I am reversing an
owner-approved `try now`. Flagging that plainly: the owner approved the Scout's recommendation, and
this review shows the recommendation was redundant with an existing rule the Scout did not weigh.
Owner may reinstate it; my recommendation is not to.

### Finding 3 — accepted in substance, one difference

Accepted: the Stage Log fix is **separable** and should not wait for the consolidation/on-demand
bundle. Verified: the log is now 4,158 lines, of which `## Log Entries` history is ~3,533 and the
current-state section ~624; `META_TASK_01` explicitly cannot absorb a rule-meaning change, so
bundling would have frozen a small live fix behind a large deferred one. That is a real defect in my
framing and I accept it.

**The difference:** I am not applying the Pre-task Sync edit in this change. Reason — it is a rule
change to what *every* session loads, i.e. exactly the kind of edit that deserves its own scoped
pass rather than being appended to a change that is currently *reversing* two other decisions. What
I am doing instead: splitting the bundled journal entry into two, so the Stage-Log strand stands
alone as an actionable `open` item with the fix already named (read `## Current Stage`; search
`## Log Entries` only on demand), and META_TASK_01 + on-demand loading stay bundled as one later
judgment. The next META session can apply the one-line rule edit immediately; nothing is lost, and
the reversal commit stays coherent.

### Итог для владельца (RU)

Ревью зарубило два из трёх решений, и после проверки я согласен — оба **отменяю**.

**Почтовый ящик в брифе — убираю.** Решающий довод не «в нём баги», а «в главных случаях он всё
равно тратит ваше внимание»: пока STRAT-сессия жива, дописывать нельзя (надо нести вопрос в неё), а
блокирующий вопрос и так обязан остановиться и позвать вас. То есть механизм не убирал ту самую
ручную переноску, ради которой строился. Плюс живое доказательство: прямо сейчас бриф says
«Nothing in `draft`», хотя я только что создал draft-задачу — и мой канал такой случай **не
покрывает** вообще. Вместо механизма — одна строчка в кикофе STRAT: сверь «Next topic» с реальными
статусами задач, прежде чем действовать. Дешевле и покрывает больше.

**Задачу про browser-probe — удаляю.** У нас уже есть правило: визуальное/layout не проверяется
автотестами и требует ручной проверки в браузере, а Item 13 уже включает «manual mobile QA». Значит
браузерный проход, нашедший дефект, — это штатная работа ручной проверки, а **не** доказательство,
что гейты прохлопали. Пилот измерял бы уже известное. Отдельно: браузерного драйвера в проекте нет,
а задача запрещала его добавлять — она была неисполнима. Полезное сохранил как заметку для того, кто
будет резать Item 13.

Отмечу честно: этим я разворачиваю решение, которое вы одобрили по рекомендации Скаута. Скаут не
сверился с нашей же стратегией тестирования. Можете настоять — но я рекомендую не возвращать.

**Третье — принял по сути:** чинить вес стейдж-лога отдельно, не дожидаясь большой чистки. Но саму
правку правила (что читать при старте сессии) в этот коммит не тащу — это изменение того, что грузит
**каждая** сессия, ему нужен свой заход. Разделил запись в журнале на две, чтобы следующая META
могла применить однострочный фикс сразу.

Status → `consensus` (round 3 not requested; the reversals are applied — see Consensus 2).

## Consensus 2

Round 2 findings: 3 raised, **3 accepted**. Two decisions from round 1 were **reversed outright**;
the third was accepted in substance with one scoping difference. Net effect of this thread: the
framework got **smaller**, not larger.

| Finding | Verdict | Filed |
| --- | --- | --- |
| 1 — the IMPL↔brief mailbox does not earn a second writer | Accepted; mechanism **withdrawn** | Section removed from `AI_TASK_PROTOCOL.md`, replaced by a reader-side rule ("The brief goes stale — reconcile it"); the fifth contradicting copy is now consistent; `STAGE_TASK_TEMPLATE.md` reverted; the live brief's section removed; both journal entries corrected with the reasoning so it is not rebuilt |
| 2 — the browser-probe pilot measures an already-answered question | Accepted; task **deleted** | `STAGE_6_TASK_15` removed (never committed); residue carried into `STAGE_6_IMPLEMENTATION_PLAN.md` Item 13 (name the browser capability when cutting it — `package.json` has no driver); the AIENG landing checklist annotated with why the Scout's `try now` was not kept |
| 3 — the context-weight strands are not one executable change | Accepted in substance | Journal entry split: the Stage-Log strand stands alone with its minimum fix named (read `## Current Stage`; search history on demand); `META_TASK_01` + on-demand/skills stay bundled. **Difference:** the Pre-task Sync edit is not applied here — it changes what every session loads and gets its own pass |

**What this thread demonstrates, worth recording:** round 1 asked whether the mechanism was
internally consistent and found a blocker *inside* it; round 2 asked whether the mechanism should
exist and deleted it. Same reviewer, same diff — the entire difference was the question. A design
review is not a stricter correctness review; it is a different question, and it cannot be reached by
asking the first one harder.

Also worth recording: round 2 ran in a **fresh Codex session**, per AI_TASK_PROTOCOL.md — Session
Settings Guidance ("independent reviews must run in a fresh session without access to the prior
session's conclusions"). That is what let the reviewer contradict its own round-1 findings instead
of defending them.
