Status: `closed` · outcomes filed 2026-07-25
Researcher: codex
Requested by: META: workflow observations review (2026-07-25)

---

## Question

On 2026-07-15 an external audit measured that **the process was being optimized harder than the
product** (`research/done/RESEARCH_2026-07-15_external-framework-audit.md`). In response the
framework adopted a single restraint — the **"What to fix now vs. defer" bar**
(AI_WORKFLOW_MASTER.md) — whose whole purpose is to stop accretion: fix live orchestration defects
and desyncs immediately, defer everything else, and end a META session without changing a document
when only defer-class items exist.

**Ten days later, did the bar actually restrain accretion — or did it just add a paragraph?**
That question has never been re-measured, and it is the only evidence that would justify either
keeping the bar as-is or replacing it.

### Baseline to compare against (from the 2026-07-15 audit, HEAD `0313943`)

| Measure | Baseline value |
| --- | ---: |
| Last-40-commit split | 31 documentation/framework vs 9 execution-affecting ≈ **3.4:1** |
| — of which `docs(framework):` by exact subject prefix | 16 |
| — other `docs…` (product/stage/decision/review) | 15 |
| — execution-affecting (`feat`/`fix` + a runtime config commit) | 9 |
| All Markdown under `docs/framework/` | **3,571 lines** |
| The eight core framework files | 2,491 lines (**1,783** excluding the journal) |
| Non-test runtime `.ts/.tsx` under `app/` + `src/` | **5,135 lines** |
| Tests | 4,040 lines |
| Framework as a share of runtime source | ≈ **70%** |

### A usable answer covers

1. **Re-derive the baseline with your own method first.** Do not trust the table above: reproduce
   each figure at `0313943` yourself. If your method disagrees with the audit's, say so and use
   **your** method for both periods — an apples-to-apples trend matters more than matching a
   historical number. State the method explicitly (what counts as execution-affecting, how
   `docs(…)` prefixes are bucketed) so the next re-measure can repeat it.
2. **The same measurements at current `HEAD`**, plus the delta for the window `0313943..HEAD`
   specifically (what this project did *after* adopting the bar).
3. **Framework growth decomposed.** Of the framework-doc lines added since `0313943`, how much is:
   (a) new rules/mechanisms; (b) rationale/incident narrative attached to existing rules;
   (c) journal entries; (d) resolution/verdict annotations closing observations? The bar permits (d)
   and constrains (a) — the split is the actual test of whether it held.
4. **Rule-count trend.** Count the enforceable rules (imperatives a session must obey) in the
   framework's operational core at both points. Line growth with flat rule count means narrative
   accretion; rule growth means mechanism accretion. Name which new rules appeared.
5. **The bar's own record.** Since 2026-07-15, how many observations were filed vs. acted on vs.
   left `open` as defer-class? Journal (`AI_FRAMEWORK_IDEAS.md`) plus git history over
   `docs/framework/` are the evidence. A high file-to-fix ratio is the bar working as designed;
   name any case where something was fixed that looks defer-class on its stated justification.
6. **Product-side context, so the ratio is not read naively.** Stage 6 is a product-polish stage, so
   `feat` commits should mechanically rise and the ratio should improve regardless of the bar. Say
   how much of any improvement is attributable to that rather than to restraint — if the two cannot
   be separated on this data, say that plainly instead of picking one.

### Constraints

- **Read-only outside this thread** (AGENTS.md). No doc edits. **No verdicts and no proposed rules**
  — a research thread never decides (AI_CROSS_REVIEW.md); the outcome is input to a META/owner
  decision (keep the bar / sharpen it / conclude it is not working).
- Provenance labels on every finding. All figures here must be **repo-verified** (commands run, not
  recalled); state the commands so they are reproducible. Note that this repository routinely holds
  uncommitted work, so measure against commits, not the working tree.
- Commit counts are not effort, and documentation is not automatically waste (the audit said so
  itself: the review rules caught two real blockers). Report the skew; do not editorialize it.
- Keep it compact — tables over prose. This file is read by sessions and its token weight is a live
  cost.
- Note for context, not to verify: two same-day threads already measured adjacent questions —
  `research/done/RESEARCH_2026-07-25_review-round-economics.md` (review-loop cost) and this one
  (accretion). Do not duplicate their content.

## Findings 1

### Method

**Provenance: verified against the repo.** I measured commit objects only: baseline
`0313943c5c76127386cb5ef0c3978aca732ea60d`, current
`a915260fdb547f46e8ed84757751cd059acc8447`. The working tree was not used (the thread itself is
untracked).

- Commit buckets come from `git log -40 --format=%s <rev>` and
  `git log --format=%s 0313943..HEAD`: exact `docs(framework):` first, every other `docs...`
  subject second, every non-`docs` subject execution-affecting. At baseline the last bucket is
  eight `feat`/`fix` commits plus the Node-runtime `chore`; in the post-bar window it is 16
  `feat(stage-6)` commits plus one `feat(tooling)`.
- Line counts enumerate committed paths with `git ls-tree -r --name-only <rev>` and sum
  `git show <rev>:<path>` lines. Runtime is committed `.ts/.tsx` under `app/` + `src/`, excluding
  files under `__tests__/` or named `.test/.spec.ts(x)`; test helpers outside those patterns remain
  runtime. This exactly reproduces the audit's 5,135 / 4,040 split.
- Growth uses `git diff --numstat 0313943..HEAD -- docs/framework` and
  `git diff --unified=0 ...`. Operational-doc hunks were coded by primary function; blank lines
  inherit the hunk's category. Journal additions were mapped from diff-added current line numbers
  to their introducing commit with `git blame --line-porcelain HEAD`. A separate sync category is
  retained because the bar explicitly permits live desync fixes; folding them into “new rules”
  would overstate mechanism growth.
- The rule count is a repeatable **rule-block** count, not a claim that prose has one objectively
  correct semantic atomization. Wrapped Markdown is merged into paragraph/list/table-row blocks;
  one block counts when it contains an enforceable modal (`must`, `may not`, `never`, `always`,
  `required`, `do/does not`, `cannot`, `only after/before/when`, `not allowed`) or begins with an
  imperative from this exact list: Read/Re-read/Start/Stop/Run/Open/Create/Write/Set/Use/Keep/Move/
  Record/Report/Verify/Check/Compare/Treat/Prefer/Escalate/Ask/Append/Update/Propose/Wait/Reconcile/
  Name/List/Ensure/Handle/Apply/Delete/Leave/Return/Commit/Stage/Select/Inspect/Find/Mark/Classify/
  Reject/Accept/End/Confirm. The journal is excluded; the new Scout document is included at HEAD.

No current external fact is needed, so no external AI was used.

### 1. Baseline reproduction and commit trend

**Provenance: verified against the repo.**

| Window | `docs(framework):` | Other `docs...` | Execution-affecting | Docs : execution |
| --- | ---: | ---: | ---: | ---: |
| Last 40 at `0313943` | 16 | 15 | 9 | 31:9 = **3.44:1** |
| Last 40 at `HEAD` | 3 | 20 | 17 | 23:17 = **1.35:1** |
| `0313943..HEAD` (42 commits) | 4 | 21 | 17 | 25:17 = **1.47:1** |

The baseline table is reproduced exactly under this method. Exact-prefix counts understate all
framework contact: commits touching `docs/framework/` fell from 19/40 to 11/40, because Stage 6
commits also append journal observations.

### 2. Size trend

**Provenance: verified against the repo.**

| Measure | `0313943` | `HEAD` | Delta |
| --- | ---: | ---: | ---: |
| All Markdown under `docs/framework/` | 3,571 | 3,592 | **+21 (+0.6%)** |
| Same historical eight core files | 2,491 | 2,382 | **-109** |
| Journal within that core | 708 | 489 | **-219** |
| Historical seven operational files (journal excluded) | 1,783 | 1,893 | **+110 (+6.2%)** |
| Operational files incl. new `AI_ENGINEERING_SCOUT.md` | 1,783 | 2,023 | **+240 (+13.5%)** |
| Non-test runtime `.ts/.tsx` | 5,135 | 6,224 | **+1,089 (+21.2%)** |
| Tests | 4,040 | 5,288 | **+1,248 (+30.9%)** |
| All framework Markdown / runtime | 69.5% | 57.7% | **-11.8 pp** |

The apparently flat `+21` framework total is the net of **+240 operational lines and -219 journal
lines**. The old eight-file figure also omits the new 130-line Scout mechanism at HEAD.

### 3. Framework additions decomposed

**Provenance: verified against the repo; hunk classification uses the stated coding method.**
The committed diff contains 693 added and 672 deleted lines (net +21).

| Added-line class | Lines | Share | Main contents |
| --- | ---: | ---: | --- |
| (a) New rules/mechanisms | **216** | 31.2% | Scout 130; admission bar 49; review cap 7; STRAT-brief reconciliation and related operational text 30 |
| (b) Rationale/incident narrative on existing rules | **23** | 3.3% | withdrawn mailbox narrative 15; size-trigger recalibration note 8 |
| (c) New/expanded journal observation bodies | **140** | 20.2% | the 12 post-baseline observations and recurrences |
| (d) Resolution/verdict/compaction annotations | **295** | 42.6% | compacted earlier entries plus later META verdicts |
| Synchronization of rules already in force | **19** | 2.7% | lifecycle, future-tense tooling claim, template trigger, header wording |

Thus most added lines are journal intake/closure (435/693), but the largest single new operational
object is the 130-line Scout role. Net lines alone conceal both facts.

### 4. Enforceable-rule trend

**Provenance: verified against the repo with the rule-block parser described above.**

| Operational file | `0313943` | `HEAD` | Delta |
| --- | ---: | ---: | ---: |
| `AI_TASK_PROTOCOL.md` | 73 | 79 | +6 |
| `AI_CROSS_REVIEW.md` | 34 | 35 | +1 |
| `AI_REVIEW_PIPELINE.md` | 28 | 28 | 0 |
| `AI_WORKFLOW_MASTER.md` | 6 | 11 | +5 |
| `AI_DEVELOPMENT_RULES.md` | 36 | 36 | 0 |
| `AI_DEVELOPMENT_WORKFLOW.md` | 29 | 29 | 0 |
| `templates/STAGE_TASK_TEMPLATE.md` | 23 | 24 | +1 |
| `AI_ENGINEERING_SCOUT.md` | 0 | 22 | +22 |
| **Total** | **229** | **264** | **+35 (+15.3%)** |

Substantive new rule families are: the fix-now/defer admission bar; the AIENG session type,
write boundary, outward-research loop and stop condition; reader-side STRAT-brief reconciliation;
the three-round review cap; and final size-trigger evidence in the task template. Lifecycle,
`project:status`, and part of the template change synchronize rules already present rather than add
new obligations. This is mechanism accretion, not merely narrative accretion; 22/35 of the measured
increase is the new Scout role.

### 5. The bar's own journal record

**Provenance: verified against the repo.** `rg -n "^- 2026-07-(15|...|25)"`
finds 12 top-level observations since the baseline. Applying the bar's own stated categories:

| Disposition | Count | Entries |
| --- | ---: | --- |
| Acted on with an operational rule/behavior change | **4** | admission bar/desync fixes; stale-brief reader reconciliation; targeted Stage Log read; three-round review cap |
| Closed with no new mechanism | **3** | existing STOP route already covered escalation; mandatory review wording was already explicit; size-trigger miss treated as one-off |
| Left open/defer-class | **5** | consolidation/on-demand loading; co-authored-file isolation; context-budget/relay; Item 5 re-litigation/order candidates; STRAT-brief “gravitational pull” |

That is a **3:1 filed-to-fix ratio**; 8/12 observations produced no new mechanism. Two caveats:
the stale-brief entry retains a weak residual `open` note “by design” after its fix, and the
defer-class label for the context-budget item is application of the bar to its one-off evidence,
not an explicit META verdict in the journal.

**Provenance: repo-grounded inference from the stated justifications.** One material change looks
defer-class under the bar's own words: `5356518` added the fourth `AIENG:` session type and a
130-line role document whose rationale explicitly says outward reconnaissance is **not** a live
defect. It entered through research/owner decision rather than one of the 12 journal observations,
so the journal's 3:1 ratio does not capture it. A smaller case is the eight-line size-trigger
recalibration narrative: it records evidence while changing no rule.

### 6. Product-side attribution

**Provenance: verified against the repo.** In `0313943..HEAD`, 16/17 execution-affecting commits
(94.1%) are `feat(stage-6)`; the remaining one implements process tooling. Runtime source grew
21.2%. If framework lines had stayed at the baseline while runtime grew, the share would be 57.4%;
actual is 57.7%. Therefore essentially all of the 69.5%→57.7% share improvement comes from the
Stage 6/runtime denominator; framework growth slightly offsets it.

**Provenance: repo-grounded inference.** The lower framework-prefix cadence (16/40→3/40) and the
8/12 no-mechanism journal outcomes are compatible with restraint. They do not isolate the bar's
causal effect: adoption coincides with the transition from framework bootstrap/product planning to
Stage 6 implementation. The simultaneous +240 operational lines and +35 rule blocks prevent the
commit-ratio improvement from being read as proof that accretion stopped.

### Decision inputs (no verdict)

**Provenance: repo-grounded options from the measurements above.**

- **Keep as-is:** supported by the lower framework cadence and 8/12 observations not becoming
  mechanisms; accepts the Scout exception and a 15.3% rule-block increase.
- **Sharpen the bar:** supported by the Scout bypass and rationale added without behavior change;
  costs more META/owner attention and can itself become another accretion cycle.
- **Conclude it did not restrain enough / replace it:** supported by operational and rule growth;
  gives too little weight to journal compaction, no-rule closures, and the confounding Stage 6
  phase change.

## Response 1

**Verification.** Independently re-derived before accepting (a relayed report is a claim, not a
fact — AI_TASK_PROTOCOL.md, Session Duties):

| Check | Codex | Re-derived | |
| --- | ---: | ---: | --- |
| Framework Markdown, `0313943` → `HEAD` | 3,571 → 3,592 | 3,571 → 3,592 | ✅ |
| Last-40 buckets at baseline (fw / all docs / exec) | 16 / 31 / 9 | 16 / 31 / 9 | ✅ |
| Last-40 buckets at HEAD | 3 / 23 / 17 | 3 / 23 / 17 | ✅ |
| Journal lines | 708 → 489 | 708 → 489 | ✅ |
| `AI_ENGINEERING_SCOUT.md` size / origin | 130 lines, `5356518` | 130 lines, `5356518` | ✅ |
| Non-test runtime `.ts/.tsx` at baseline | 5,135 | 5,134 | ~ |

The one-line runtime difference is trailing-newline handling (0.02%); Codex's figure reproduces the
2026-07-15 audit exactly, so its method is the comparable one. The rule-block count is a
method-defined measurement, accepted as **attributed** rather than re-derived — its value is the
trend under one repeatable parser, not the absolute number.

**Three findings the raw numbers hide, and which matter more than the ratio:**

1. **The flat framework total is an illusion of two offsetting movements.** `+21` net =
   **+240 operational lines** and **−219 journal lines** (the 2026-07-15 compaction). A future
   re-measure reading only the total would conclude the framework stopped growing. It did not.
2. **The 69.5% → 57.7% share improvement is entirely denominator.** Had the framework frozen at
   baseline, the share would be 57.4% — actual is 57.7%, i.e. framework growth *slightly worsened*
   it. The improvement is Stage 6 shipping product (runtime +21.2%), not restraint. The headline
   ratio improvement (3.44:1 → 1.35:1) is real but is a phase change, and must not be read as the
   bar working.
3. **The bar governs the journal path, and on that path it worked; the growth arrived elsewhere.**
   8 of 12 observations produced no new mechanism (3:1 filed-to-fix). But 22 of the 35 new rule
   blocks (63%) are the AIENG Scout role, which entered via a research/owner decision — not through
   an observation — and whose own rationale states outward reconnaissance is *not* a live defect.

**Recommendation to the owner: keep the bar unchanged; change no document beyond recording this
measurement.**

- The bar's record on what it actually governs is good, and this session is itself evidence: of
  eight open observations, two cleared it and six were deferred or dropped.
- The Scout is **not a bar failure**. The bar constrains what a META session may change on its own
  authority; it was never intended to override an explicit owner decision, and no rule says
  otherwise — so there is no desync to fix. Extending it to bind owner decisions would be
  mechanism added to stop the owner doing what the owner chose.
- Sharpening the bar to cover the research path is exactly the accretion cycle being measured
  (Codex names this risk itself). The measured problem does not warrant a new rule.

**Proposed landing (no rule change):** a dated journal entry recording the re-measurement, its
method pointer, and finding 1 — so the next re-measure does not read the net line count and
conclude wrongly; plus a pointer from the existing PROJECT_BACKLOG.md ablation entry ("Ablation of
harness rules — post-MVP retrospective"), which already lists this bar among the rules to test and
now has direct evidence to test it against.

**Резюме для владельца (RU).** Планка держится — но не по той причине, по которой кажется. Цифры,
которые я перепроверил лично: соотношение процесс/продукт упало с 3.44:1 до 1.35:1, а доля
фреймворка от рантайма — с 69.5% до 57.7%. Ловушка в том, что **улучшение доли целиком объясняется
ростом продукта, а не сдержанностью**: если бы фреймворк вообще замёрз, вышло бы 57.4% — то есть он
слегка ухудшил картину, а не улучшил. И «+21 строка» — обманчивый ноль: это +240 строк правил минус
219 строк ужатого журнала. По журналу планка отработала честно (8 наблюдений из 12 не породили
механизма), но 63% прироста правил — это роль AIENG-скаута, вошедшая мимо журнала, вашим решением.
**Рекомендую ничего не менять**: правила Скаута планка не нарушала (она ограничивает META-сессию, а
не вас), а «ужесточить планку» — ровно тот цикл аккреции, который мы и замеряем. Предлагаю только
зафиксировать замер в журнале и связать его с уже существующей записью бэклога про пост-MVP ревизию
правил.

## Outcome

Owner decision 2026-07-25: **keep the "What to fix now vs. defer" bar unchanged — no rule change,
no doc change beyond recording the measurement.** Rationale as in Response 1: the bar's record on
the path it governs is sound (8/12 observations produced no mechanism); the AIENG Scout entered by
owner decision, which the bar was never written to constrain, so there is no desync to fix; and
sharpening it would be the accretion cycle this thread measured.

Landed in durable docs:

- **AI_FRAMEWORK_IDEAS.md** — Workflow Observations: a dated entry recording the re-measurement,
  its method pointer, and the offsetting-movements trap (net framework lines conceal +240
  operational / −219 journal), so a future re-measure does not read the net figure and conclude
  wrongly. Filed `resolved` — the question was answered and the answer was "change nothing".
- **PROJECT_BACKLOG.md** — "Ablation of harness rules — post-MVP retrospective": a pointer to this
  thread, which already lists this bar among the rules to test and now has baseline-comparable
  evidence to test it against.
- Progress noted in PROJECT_STAGE_LOG.md (2026-07-25 META entry).

Method is recorded in `## Findings 1` above and is repeatable; the next re-measure should compare
**operational lines and rule blocks separately**, never the framework total alone.
