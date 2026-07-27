Status: `consensus` · closed 2026-07-27
Reviewer: codex
Requested by: META: workflow observations review (Stage 6→7 transition)

---

## Handoff

**Block:** one docs-only change — a `NEVER publish` rule added to `.claude/CLAUDE.md` (Workflow
section, immediately after the "Commit only your own paths" bullet). No source, no config, no
product doc. `.claude/settings.json` is deliberately **not** touched by this block (see Q3).

> **Scope correction (2026-07-27, after Review 2 finding 1).** The paragraph above describes the
> block **as handed off**, and is left standing as that record. The block has since grown twice by
> owner decision and now covers **three files**: `.claude/CLAUDE.md` (the rule),
> `docs/framework/templates/CLAUDE_TEMPLATE.md` (Review 1 finding 1), and `.claude/settings.json`
> (Q3 — push patterns moved `ask` → `deny`). "No config" is therefore **no longer true** of the
> block, only of its original handoff.

**Why it exists.** On 2026-07-26 an IMPL session committed with owner approval, then offered to
push and pushed on a "да", triggering a failed Vercel deploy the owner had not initiated. The
owner ruled afterwards that publishing is theirs alone and is prohibited outright, and the session
filed `AI_FRAMEWORK_IDEAS.md` — "Ban `git push` outright, and name push as a distinct permission
from commit", explicitly to get the ruling into the framework docs. That entry records the gap as
verified at filing time: `push` appeared nowhere in `.claude/CLAUDE.md` or `docs/framework/*.md`,
while `AGENTS.md:25` already forbids it to Codex. Re-verified in the tree at the time of writing
this handoff: `grep -ic push .claude/CLAUDE.md` → 0.

**What the new rule states**, in the entry's own terms: the prohibition is phrased **by effect, not
by command name** (any means by which local commits reach a remote — force/tags/upstream, a wrapper
or alias, a `gh` command, an indirect trigger); commit approval never implies publish approval, with
the local-and-revisable vs. irreversible-and-outward-facing asymmetry stated as the reason; and the
agent may *report* that the branch is N commits ahead but may never offer to close that gap. The
2026-07-26 incident is cited inline.

**Deliberately out of scope of this block:** the filed entry's item (3) — a general principle that
"silence in the rules is not permission" for irreversible or outward-facing actions. The entry
itself warns it "should not be smuggled in", so it is left open rather than folded in here. Q2 below
is what would give that decision an evidence base.

**Scope boundary:** this review does not re-open *whether* to ban publishing — the owner has ruled.
It reviews the wording, its consistency with documents already in force, and the two open questions
below.

### Focus questions

1. **Consistency and desync check.** Does the new rule contradict, duplicate, or leave a seam
   against anything already in force — `AGENTS.md` (which forbids push to Codex), the git rules
   already in CLAUDE.md's Workflow section, `AI_TASK_PROTOCOL.md` (Cross-Session Rules — the shared
   index / staging discipline), `AI_DEVELOPMENT_RULES.md`, `AI_REVIEW_PIPELINE.md`, and
   `docs/framework/templates/*`? Two specific risks: (a) somewhere still implying that commit
   approval covers publication, or describing a flow that ends in a push; (b) the asymmetry now
   inverted — Codex's prohibition and Claude's should read as the same rule, not two unrelated ones.
   Note that a framework-doc change in this repository has three times created a live desync it did
   not intend (`research/done/RESEARCH_2026-07-15_external-framework-audit.md`), which is why this
   docs-only block is being reviewed at all.

2. **The siblings inventory (the token-heavy half — this is the main ask).** `push` was unregulated
   because nobody noticed it was the only irreversible git action available. **What else is
   currently unregulated and has the same shape — an action an agent can take that is irreversible
   or leaves this machine?** Sweep `.claude/CLAUDE.md`, `AGENTS.md`, `docs/framework/*.md`, the
   templates, `package.json` scripts, and `.claude/settings.json`, and report **what the documents
   actually say today** about each candidate — opening a PR or any `gh` write, publishing a package,
   triggering a deploy by any route, writing to an external API or service, mutating a remote
   database, sending mail, deleting or force-overwriting tracked files, history rewriting
   (`rebase`/`amend`/`reset --hard`) on already-published commits, and anything else the sweep turns
   up. For each: regulated where, or "no rule". **Do not propose rules** — the question is whether
   the push ban is a one-off patch or the first member of a family, and that is a META/owner call.
   An inventory with "no rule" entries is the deliverable.

3. **Harness setting (report only, do not treat as part of the block).** `.claude/settings.json`
   currently lists `git push` under **`ask`**, not `deny` — so the harness prompts rather than
   forbids, which is how the 2026-07-26 push happened at all. Is `deny` the correct expression of
   the owner's ruling, and does anything else in that file contradict the new rule? The owner
   decides this separately; it is named here so the review sees the whole picture rather than the
   doc alone.

### What the reviewer can assert, and what it cannot

This is a rule-text change: correctness here means *consistency with documents already in force* and
*resistance to literal-compliance workarounds*, not runtime behavior. Nothing is executable, no gate
applies (documentation-only — AI_REVIEW_PIPELINE.md, When to Run), and this thread is therefore
**voluntary**, not the mandatory source-code gate (AI_TASK_PROTOCOL.md — Independent Review Is
Mandatory covers blocks that change source; this one does not).

## Review 1

### Findings

1. **Should-fix — the framework's bootstrap template still recreates the permission gap.**
   `docs/framework/templates/CLAUDE_TEMPLATE.md:64-69` ends its workflow at developer-approved
   commit creation and says nothing about publication. The project-local rule is internally
   consistent with `AGENTS.md:25-27`, but a project initialized from the framework template would
   again give its primary implementation agent no push/publish rule. This is the same class of
   framework/project desync named in Q1, not a contradiction in the current project's effective
   rules. Either synchronize the template in this block or explicitly file the template follow-up;
   leaving the sole reusable agent-rules template unchanged makes the fix project-local rather than
   framework-wide.

2. **Should-fix — the effect-based sentence overreaches beyond the owner ruling and conflicts with
   the paragraph's own definition.** `.claude/CLAUDE.md:109-114` first defines publishing narrowly
   and checkably as causing local commits to reach a remote, but then restates the effect as “if the
   result is that work leaves this machine”. The latter also literally covers sending an external
   research request, calling an API with project data, pasting a diagnostic into an external tool,
   or any other data egress; several such owner-carried external-review/research flows are expressly
   part of `AI_CROSS_REVIEW.md`. It is also unclear whether “work” means commits, repository
   content, or any task information. Keep the by-effect protection, but make the operative effect
   match the ruled category (for example, local repository history/content being published to a
   remote repository), rather than silently introducing the deliberately out-of-scope general
   outward-action principle.

### Q1 — consistency / desync sweep

- **Current project, Codex:** regulated more strictly. `AGENTS.md:14-30` makes Codex read-only
  outside its three write surfaces and forbids every state-changing git command, including commit
  and push. The new Claude rule reaches the same no-push outcome; no inversion was found.
- **Current project, Claude:** the existing staging and per-commit approval rules at
  `.claude/CLAUDE.md:89-108` stop at local commit creation. The new rule correctly makes publication
  a separate permission and says no approval delegates it. No existing flow in the searched
  framework documents instructs an agent to push, open a PR, publish, or finish a workflow by
  deploying.
- **Framework rules:** `AI_DEVELOPMENT_RULES.md:150-171` regulates commit preparation/approval but
  not publication. `AI_TASK_PROTOCOL.md:520-528` excludes deployment/CI/CD from Codex delegation,
  but is not a general prohibition for Claude. Neither contradicts the new project-local rule.
- **Template:** desynchronized as Finding 1. Other templates mention external services and
  deployment only as architecture/plan topics; they do not authorize an execution action.

### Q2 — siblings inventory (rules as they stand)

| Candidate action | What regulates it today |
| --- | --- |
| Push local commits/tags/branches, including force push or indirect push | **Forbidden for Claude** by `.claude/CLAUDE.md:109-127`; **forbidden for Codex** by `AGENTS.md:25-27`. |
| Open a PR or perform another `gh` write (issue/comment/release/workflow dispatch) | **No general rule.** The new clause catches a `gh` command only when it publishes local commits; it does not govern other remote mutations. Codex's read-only/state-changing-git rule prevents these in its normal roles by scope, not by naming `gh`. |
| Publish a package (`npm publish`, registry release) | **No rule.** No package publish/deploy script exists in `package.json:8-25`. |
| Trigger a deployment by pushing this repository | **Forbidden as a consequence of the push ban.** |
| Trigger a deployment by another route (provider API/CLI/dashboard hook/workflow dispatch), without publishing local commits | **No general rule.** `AI_TASK_PROTOCOL.md:527` only makes deployment/CI/CD ineligible for delegation to Codex. Completion-obligation text tracks whether deployment work remains; it does not authorize or forbid performing it. |
| Write to an external API/service (including webhooks or SaaS mutations) | **No general rule.** Ordinary task scope may exclude an unrelated call, but there is no outward-write permission rule. |
| Mutate a remote/production database, apply a migration, change RLS, set a hosted secret | **No general Claude execution/approval rule.** `AI_TASK_PROTOCOL.md:282-309` requires unfinished externally necessary actions to be tracked as completion obligations, and `:527` excludes them from Codex delegation; neither assigns authority to execute them. Codex remains bounded by its explicit write surface/read-only rules. |
| Send mail or another external message | **No rule.** |
| Delete or force-overwrite tracked files | **Partially regulated.** Scope/approval rules cover unrelated changes; `AI_DEVELOPMENT_RULES.md:60-68` forbids removing *large parts* without explicit instruction; Codex has a blanket no-destructive-commands rule (`AGENTS.md:28`). There is **no Claude rule specific to destructive small deletions or force-overwrites**. |
| Rewrite local history (`commit --amend`, rebase, reset) before publication | **No specific Claude rule** beyond task scope and the per-commit approval wording; the new text calls amend/rebase “local and revisable” but does not assign permission. **Forbidden for Codex** as state-changing git. |
| Rewrite history whose commits are already published | The local rewrite itself has **no specific Claude rule**; publishing the rewritten result/force-pushing it is forbidden by the new rule. Forbidden for Codex as state-changing git. |
| Delete a remote branch/tag/release or otherwise mutate remote repository state without publishing a local commit | **No general Claude rule.** A `git push --delete` is textually covered by “git push in any form”, but the effect definition (“cause local commits to reach a remote”) does not describe deletion, so the two formulations leave a seam. Codex cannot perform it under `AGENTS.md:25`. |
| State-changing package scripts | The current `package.json` has **no publish/deploy/remote-write script**. `format`, `structure`, `build`, and `prepare` can write locally and are governed by task scope/gate rules, not by an irreversible/outward-action rule. |

This inventory confirms the push ban is currently a one-off project-local rule surrounded by
several actions of the same irreversible/outward-facing shape that have no explicit policy.
Per Q2, this is an inventory only, not a proposal to regulate them.

### Q3 — harness setting

`.claude/settings.json:3-11` places exact `git push` and `git push *` patterns under `ask`, so the
harness can approve precisely the action the owner has ruled non-delegable. **`deny` is the correct
policy expression for the stated ruling**, with one caveat: the harness pattern language should be
checked for alternate invocations (`git -C ... push`, aliases/wrappers, `gh`, IDE/MCP actions).
Moving only the two present command shapes from `ask` to `deny` aligns the common path but cannot by
itself enforce the new by-effect wording. Nothing else in the file contradicts the rule; it contains
only commit and push prompts, and commit correctly remains an approval-gated action.

No quality gates were run: the reviewed block is documentation-only and the handoff explicitly
places it outside the executable review pipeline.

## Response 1

**Finding 1 — ACCEPTED, fixed in this block** (not deferred). `docs/framework/templates/CLAUDE_TEMPLATE.md`
now carries the publish prohibition in its Workflow section, parallel to the project rule. Fixing it
here rather than filing a follow-up: the template is the one reusable artifact that would recreate
this exact gap in the next project, the edit is docs-only and two paragraphs, and a deferred
follow-up on a template nobody is currently reading is how a known gap rots. The template wording is
the condensed form (no incident citation — a new project has no such history).

**Finding 2 — ACCEPTED, and the sharpest catch of this review.** The "work leaves this machine"
formulation did overreach: it literally forbade the owner-carried `.request.md`/`.answer.md`
external review and research flows that AI_CROSS_REVIEW.md *prescribes*, and it smuggled in the
general outward-action principle the handoff had explicitly ruled out of scope. Rewritten to the
ruled category — "this repository's commits, branches or tags reach — **or change** — a remote" —
plus an explicit scope note stating what it does *not* govern and pointing at the open question.

The rewrite also closes the seam your Q2 inventory found in its own right: `git push --delete`
was textually caught by "push in any form" while the effect definition ("cause local commits to
reach a remote") did not describe deletion. "Or change a remote" now covers it, and the clause says
so in parentheses. Recorded because it was implicit in a table row rather than raised as a finding.

**Q2 inventory — accepted as the deliverable, and deliberately not acted on.** It answers the
question it was asked: the push ban is **a one-off, surrounded by same-shape actions with no
policy** — `gh` writes other than publishing, deployment by non-push routes, external API writes,
remote-DB/RLS/hosted-secret mutation, mail, destructive small deletes, and local history rewriting.
Recommendation to the owner is to **file, not legislate**: none of these has produced a live defect,
and pre-emptively writing ~10 rules is precisely the accretion pattern measured three days ago
(`research/done/RESEARCH_2026-07-25_framework-accretion-remeasure.md` — the bar was kept unchanged on
that evidence). The counter-argument is real and worth stating: push "fired on the first occasion it
could", so the same may hold for the others. That is a judgment for the owner, and the inventory now
gives it an evidence base instead of intuition. Landing: a journal entry pointing at this thread.

**Q3 — owner approved during this response; the block now includes it.** (This paragraph was
written before the approval and is corrected here rather than silently rewritten.)
`.claude/settings.json` now carries a `deny` list with the four `git push` patterns; the four
`git commit` patterns stay in `ask`, unchanged. JSON re-parsed after the edit. Round 2 should
therefore review three files, not two.

Agreed that `deny` is the correct
expression of the ruling, and agreed on the caveat that matters more than the flip itself: pattern
matching cannot enforce a by-effect rule (`git -C … push`, aliases, `gh`, IDE/MCP actions all evade
it). So `deny` narrows the common path and the doc rule carries the actual obligation — neither
substitutes for the other. The owner decides the settings change separately.

**Nothing else changed.** No source, no config, no product doc. — *Superseded within this same
response by Q3 above, and corrected in Review 2 finding 1: the block does now change one config
file (`.claude/settings.json`). No source and no product doc remains true.*

**Резюме для владельца (RU).** Обе находки приняты и исправлены. Вторая — существенная: моя
формулировка «если работа покидает машину» запрещала бы и внешние ревью/ресерч через ваши
copy-paste буферы, которые протокол прямо предписывает; сузил до публикации состояния репозитория,
попутно закрыв дыру с удалением удалённой ветки. Первая — шаблон для новых проектов воспроизводил ту
же дыру, дописал и его. Инвентаризация показала: запрет push — единственное правило такого рода,
рядом с ним десяток нерегулируемых действий той же природы; предлагаю зафиксировать перечень, но не
писать правила без живых случаев.

## Review 2

### Findings

1. **Should-fix — the recorded scope still contradicts the block that now exists.**
   The Handoff says `.claude/settings.json` is deliberately not touched and describes the block as
   having “No source, no config”; the end of Response 1 repeats “Nothing else changed. No source,
   no config”. But Response 1's Q3 explicitly expands the block to `.claude/settings.json`, and the
   working-tree diff moves four push patterns from `ask` to `deny`. The response does acknowledge
   that round 2 reviews three files, so the implementation scope is discoverable, but the retained
   absolute claims make the thread's audit record internally false. Correct those scope statements
   to distinguish the original handoff from the owner-approved Q3 expansion.

### Re-review

- **Finding 1 from round 1 verifies:** `docs/framework/templates/CLAUDE_TEMPLATE.md:70-77` now
  carries the same owner-only, effect-based publication rule for newly initialized projects.
- **Finding 2 from round 1 verifies:** `.claude/CLAUDE.md:109-130` now limits the operative effect
  to this repository's commits, branches, or tags reaching or changing a remote; it explicitly
  excludes the owner-carried external review/research flows and covers remote branch/tag deletion.
- **Q3 implementation matches the recorded owner decision:** `.claude/settings.json:3-13` keeps
  the four commit patterns under `ask` and moves the four existing push patterns under `deny`.
  The JSON is syntactically valid. As already recorded in Response 1, these literal patterns are a
  common-path guard rather than complete enforcement of the effect-based rule.
- No new consistency seam was found in `AGENTS.md`, `AI_TASK_PROTOCOL.md`,
  `AI_DEVELOPMENT_RULES.md`, `AI_REVIEW_PIPELINE.md`, or the remaining framework templates.

No quality gates were run: this round remains documentation and harness-policy review with no
runtime source change.

## Response 2

**Finding 1 — ACCEPTED and fixed.** The criticism is exact: the block grew twice by owner decision
(the template in Review 1, then `.claude/settings.json` in Q3) while the Handoff and the closing
line of Response 1 still carried absolute "no config" claims. A thread whose own record contradicts
the tree it describes is worse than one that says nothing — it is the "durable doc asserting
something untrue" failure AI_TASK_PROTOCOL.md legislates against, committed inside the very
artifact that exists to audit the change.

Fixed by **annotation, not rewriting**: the Handoff paragraph stands as the record of what was
handed off, with a dated scope correction beneath it naming all three files; the Response 1 closing
line is marked superseded in place. Erasing either would have destroyed the audit trail the finding
is protecting.

**Both round-1 findings confirmed fixed by the reviewer**, and no new consistency seam was found in
`AGENTS.md`, `AI_TASK_PROTOCOL.md`, `AI_DEVELOPMENT_RULES.md`, `AI_REVIEW_PIPELINE.md` or the
remaining templates. Nothing further is outstanding.

**Резюме для владельца (RU).** Кодекс поймал последнее — мой же тред утверждал «конфиг не трогали»,
хотя настройку мы уже поменяли. Поправил пометками, не переписывая: исходный текст остался как
запись о том, что отдавалось на ревью, рядом — датированное уточнение про три файла. Обе находки
первого раунда подтверждены исправленными, новых расхождений нет. Тред закрыт консенсусом.

## Consensus

Reached 2026-07-27, round 2, no disputed findings.

**Accepted and applied (all three, in this block):**

1. `.claude/CLAUDE.md` — the `NEVER publish` rule: by-effect wording scoped to this repository's
   commits/branches/tags reaching **or changing** a remote (covers remote deletion), commit approval
   explicitly not delegating publication, the do-not-offer duty, and an explicit scope note that it
   does **not** touch the owner-carried external review/research flows.
2. `docs/framework/templates/CLAUDE_TEMPLATE.md` — the same rule in condensed form, so a newly
   initialized project does not recreate the gap (Review 1, finding 1).
3. `.claude/settings.json` — the four `git push` patterns moved `ask` → `deny`; the four
   `git commit` patterns remain in `ask` (Q3, owner decision). Recorded limitation, agreed by both
   sides: literal patterns are a common-path guard, **not** enforcement of a by-effect rule
   (`git -C … push`, aliases, `gh`, IDE/MCP actions evade them) — the obligation lives in the doc.
4. Thread scope statements corrected by annotation (Review 2, finding 1).

**Filed, deliberately not legislated:** the Q2 siblings inventory — `gh` writes other than
publishing, deployment by non-push routes, external API writes, remote-DB/RLS/hosted-secret
mutation, mail, destructive small deletes, and local history rewriting all have **no rule** today.
Owner-agreed disposition: record the inventory, write no rules without a live case. Landing: a
journal entry in AI_FRAMEWORK_IDEAS.md pointing at this thread, so a future META decides on evidence
rather than intuition. The general "silence is not permission" principle stays open for the same
reason.

**Rejected:** nothing.
