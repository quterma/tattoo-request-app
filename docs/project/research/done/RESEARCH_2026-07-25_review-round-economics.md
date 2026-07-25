Status: `closed` · outcomes filed 2026-07-25
Researcher: codex
Requested by: META: workflow observations review (2026-07-25)

---

## Question

The framework carries two numeric process rules fitted to thin data, plus one measured-but-only-
ad-hoc-explained cost curve. This thread measures all three against the full corpus so a META
session and the owner can recalibrate on evidence instead of anecdote.

1. **The size trigger** (AI_TASK_PROTOCOL.md — "A Large Task Is Reviewed in Checkpoints", "The size
   trigger": 16 execution-affecting files or 500 lines of execution-affecting churn) is explicitly
   a **trial rule** calibrated on a 20-commit sample with exactly one positive case (Item 1,
   2026-07-14). The protocol itself orders: "recalibrate after a few firings or near-misses."
   Stage 6 has since produced many more reviewed blocks — the recalibration data now exists.
2. **The 3-round review cap** (AI_CROSS_REVIEW.md — Turn Structure, step 4; adopted 2026-07-25,
   commit `a6e5164`) rests on the waste pattern of two threads (Items 5 and 17). Its premise —
   *real findings concentrate in rounds 1–3; later rounds are mostly process/reporting churn* —
   has not been checked against the whole corpus.
3. **Round counts climbed on Stage 6 refactor-shaped tasks** (4/4/4/9/8+ — AI_FRAMEWORK_IDEAS.md,
   entries 2026-07-24/25). Causes were classified ad hoc per thread, never systematically.

**Dataset:** all threads in `docs/project/reviews/done/` (26 files as of 2026-07-25), the task
files and commits they reference, and git history. Threads reviewing docs/process-only blocks
(e.g. the 2026-07-13 framework threads) are in scope for round/cause analysis but excluded from
the surface/trigger analysis (no execution-affecting diff).

**A usable answer covers:**

1. **Per-thread measurement table** (compact — one row per thread): reviewed block/task; rounds to
   consensus; findings per round (count × severity); the round of the **last accepted
   code-affecting finding** vs. total rounds.
2. **Per-round cause classification**, one taxonomy across all threads — suggested classes (adjust
   if the data demands): real code/product defect; external-boundary feasibility;
   doc/reporting-sync drift; write-surface / process hygiene; re-litigation of an already-stated
   finding. Flag rounds whose findings were caused by a previous round's own fix.
3. **Surface measurement per source-changing block**: execution-affecting files and churn, counted
   exactly per the trigger's rule (runtime source, migrations, gate-affecting config; tests, docs,
   generated files, lockfiles excluded). Did the block cross 16/500? Was it checkpointed?
4. **Trigger recalibration analysis**: does 16/500 separate expensive blocks from cheap ones on
   this data? Name near-misses in both directions (under-trigger blocks with heavy review cost;
   over-trigger blocks that reviewed cleanly). Present **options with trade-offs** (keep / move
   the numbers / change the metric), not a verdict.
5. **Cap validation**: distribution of "round of last real finding"; which accepted code-affecting
   findings a hard stop at round 3 would have delayed behind an owner decision; whether the
   re-arm-at-6 matters on this data.
6. **Waste-cause ledger**: for each waste class from (2) — is it already addressed by an existing
   rule (name it) or unaddressed (say "no rule"; do not propose new rules — that is META's call).

**Constraints:**

- Read-only outside this thread (AGENTS.md). No doc edits, no verdicts: a research thread never
  decides (AI_CROSS_REVIEW.md) — the outcome is input to a META/owner decision on (a) immediate
  trigger recalibration, (b) cap tuning, (c) the post-MVP retrospective.
- Provenance labels on every finding (repo-verified / model knowledge / external-unverified).
  Round counts, finding classes and surface numbers must be repo-verified (read the threads, run
  the git commands); where a thread→commit mapping is ambiguous, flag it rather than guess.
- Governing texts: AI_TASK_PROTOCOL.md ("A Large Task Is Reviewed in Checkpoints",
  "Independent Review Is Mandatory"), AI_CROSS_REVIEW.md (Turn Structure step 4),
  AI_FRAMEWORK_IDEAS.md (entries dated 2026-07-24 and 2026-07-25).
- Keep the Findings compact: tables over prose; this file is read by sessions and its token
  weight is a live cost.

## Findings 1

### Method and taxonomy

**Provenance: repo-verified.** I read all 26 files under `docs/project/reviews/done/`, their
referenced task files, the governing framework sections, and the relevant Git diffs/history. The
corpus contains 24 review-format threads and two early ungraded discussion threads. The 24 formal
threads contain 57 labelled review rounds and 133 graded findings: 16 blocker, 99 should-fix, and
18 nit/question.

Counts below use the severities written in each `## Review N`; an unnumbered verification note is
not promoted into a graded finding. Item 5 is kept at the thread's own reported nine rounds even
though it has no `## Review 6` heading: an owner ruling plus `## Response 6` occupies that labelled
cycle before `## Review 7`. This numbering defect is flagged rather than silently normalized.

Primary cause codes:

| Code | Primary cause |
| --- | --- |
| C | real code/product/spec defect |
| E | external-boundary feasibility or live-boundary evidence |
| D | durable-doc/reporting/state-sync drift |
| P | write-surface, lifecycle, gate, permission, test-strategy, or other process hygiene |
| R | re-litigation / incomplete disposition of an already-stated finding |

`↩` marks a round containing at least one finding created by, or left specifically incomplete by,
the previous round's response/fix. Causes are assigned once per finding by the primary failure mode;
mixed findings are not double-counted.

### Per-thread measurement

**Provenance: repo-verified.** `B/S/N/Q` mean blocker/should-fix/nit/question. The final column is
the last accepted finding that required an edit in an execution-affecting path versus total rounds;
`comment` means no executable behavior changed.

| Reviewed block / task | Rounds to close | Findings by round: severity `[cause counts]` | Last execution-path finding / total |
| --- | ---: | --- | ---: |
| Codex delegation invocation | 1 discussion | ungraded answers; no Review finding | — / 1 |
| Codex delegation scope | 1 discussion | ungraded answers; no Review finding | — / 1 |
| Codex sync setup | 2 | R1 `3S+1N [P4]`; R2 `0` | — / 2 |
| Docs context budget | 1 | R1 `1B [D1]` | — / 1 |
| Framework process audit | 1 | R1 `2B+5S+1N [P8]` | — / 1 |
| Stage 6 Item 2 — shell | 1 | R1 `1S [C1]` | R1 / 1 |
| UX blueprint batch 2 | 1 | R1 `1B+2S [C2,D1]` | — / 1 |
| UX blueprint full | 2 | R1 `1B+3S+1N [C3,D2]`; R2 `1S [R1] ↩` | — / 2 |
| Item 1 — upload flow | 1 | R1 `2B+2S+1N [C3,E1,P1]` | R1 / 1 |
| Item 3 A′ — non-contact contract | 1 | R1 `2B+2S [C3,P1]` | R1 / 1 |
| Item 3 R — reference code | 1 | R1 `2B+1S [P2,D1]` | R1 comment / 1 |
| Item 3 B′ — form UI | 1 | R1 `2B+4S [C6]` | R1 / 1 |
| IMPL↔STRAT brief channel | 2 | R1 `1B+5S [P5,D1]`; R2 `3S [P3] ↩` | — / 2 |
| Item 3 C — contact model | 1 | R1 `1S [C1]` | R1 / 1 |
| Item 9 — placement free text | 5 | R1 `2B+2S+1Q/N [C3,P2]`; R2 `1S [D1]`; R3 `1S [P1] ↩`; R4 `1S [D1]`; R5 `0` | R1 / 5 |
| Item 4 — Success | 1 | R1 `1S+1N [C2]` | R1 / 1 |
| Item 7 — Location map | 1 | R1 `2S [E1,P1]` | — / 1 |
| Item 11 — public 404/error | 2 | R1 `2S+1N [C1,E1,D1]`; R2 `1S [D1] ↩` | R1 / 2 |
| Item 12 — favicon/OG/SEO | 4 | R1 `2S [E1,P1]`; R2 `1S [E1] ↩`; R3 `1S+1N [E1,D1] ↩`; R4 `1S [D1] ↩` | R3 / 4 |
| Item 10 post-consensus amend | 1 | R1 `0` | — / 1 |
| Item 10 — abuse mitigation | 1 | R1 `5S+1N [C4,E1,D1]` | R1 / 1 |
| Item 10 CO-2 live verification | 1 | R1 `2S [E2]` | — / 1 |
| Item 15 — prep/aftercare discovery | 4 | R1 `3S+1N [E1,P1,D2]`; R2 `2S+1N [P2,D1] ↩`; R3 `1S [R1] ↩`; R4 `0` | — / 4 |
| Item 5 — Home | 9 | R1 `2S [C1,P1]`; R2 `3S [R1,P2] ↩`; R3 `1S [R1] ↩`; R4 `3S [R1,D2] ↩`; R5 `1S [R1] ↩`; R6 `0` (owner ruling/response, no Review heading); R7 `1S [P1] ↩`; R8 `1N [D1] ↩`; R9 `0` | R1 / 9 |
| Item 6 — Process | 4 | R1 `4S+1N [C3,P1,D1]`; R2 `2S [D2] ↩`; R3 `1S [R1] ↩`; R4 `0` | R1 / 4 |
| Item 17 — studio config | 9 | R1 `4S+1N [C1,P3,D1]`; R2 `3S [R1,P1,D1] ↩`; R3 `3S+1N [P2,D2] ↩`; R4 `2S+1N [R1,D1,P1] ↩`; R5 `3S+1N [D3,P1] ↩`; R6 `1S [D1] ↩`; R7 `1N [D1] ↩`; R8 `2S [D2] ↩`; R9 `1S [D1] ↩` | R2 comment (R1 behavior) / 9 |

The last graded-finding distribution across the 24 formal threads is: R1 `14`, R2 `3`, R3 `2`,
R4 `2`, R8 `1`, R9 `1`, and no findings `1`. Six threads crossed a third round; only four produced
any post-R3 finding.

### Execution-affecting surface

**Provenance: repo-verified.** Counts come from `git diff --numstat <block baseline> <final
commit>`, counting runtime `app/`, `src/`, runtime assets, migrations, and gate-affecting config;
tests, docs, generated files, lockfiles, and `.env.example` are excluded. Binary favicon removal
counts as one file and zero line churn. `Cross` applies the current `>=16 files OR >=500 churn`
rule.

| Source-changing reviewed block (final commit/range) | Files | Churn | Cross | Checkpointed? |
| --- | ---: | ---: | --- | --- |
| Item 2 shell (`e833398`) | 9 | 102 | No | No |
| Item 1 upload (`480c721`) | 30 | 1,769 | Yes, both | No; rule was adopted from this miss |
| Item 3 R reference (`5de9329`) | 1 | 146 | No | Yes — Task 03 checkpoint R |
| Item 3 A′ non-contact (`4721dcd`) | 10 | 92 | No | Yes — Task 03 checkpoint A′ |
| Item 3 B′ form UI (`7eaa7ac`) | 7 | 534 | Yes, churn | Yes — Task 03 checkpoint B′ |
| Item 3 C prep + cutover (`050260a..0b38243`) | 19 | 890 | Yes, both | Yes — Task 03 checkpoint C; prep and cutover were jointly reviewed |
| Item 9 placement (`552c8af`) | 7 | 91 | No | No |
| Item 4 Success (`94ef19b`) | 7 | 214 | No | No |
| Item 7 Location (`651d62c`) | 2 | 8 | No | No |
| Item 11 404/error (`e213268`) | 3 | 73 | No | No |
| Item 12 favicon/SEO (`a37e7eb`) | 5 | 95 | No | No |
| Item 10 abuse (`d5e8ae3`) | 13 | 295 | No | No size checkpoint; three review threads covered code, amend, and live CO evidence |
| Item 6 Process (`5eb7855`) | 6 | 164 | No | No |
| Item 5 Home (`a4cbf31`) | 2 | 125 | No | No |
| Item 15 discovery (`da3000c`) | 2 | 17 | No | No |
| Item 17 studio config (`c7ba5e2`) | 20 | 150 | Yes, files | No; task says `single`, and no end-of-task size-trigger justification was found |

Two measurement qualifications matter:

- The protocol's historical Item 1 figure is `28 / 1,763`. Applying its present wording exactly
  adds `eslint.config.mjs` and `vitest.config.ts` (two gate-affecting files, six churn), yielding
  `30 / 1,769`. The old figure is reproducible only by excluding the gate configs that the rule
  now says to include.
- Commit `94ef19b` also swept 17 execution-affecting lines from Item 8 into `en.json`. Its namespaces
  are separate and the patch hunk attribution is unambiguous: the whole-commit source figure is
  `7 / 231`; the Success block itself is `7 / 214`. This is the only mixed source commit in the
  table that changes a surface count.

### Trigger recalibration

**Provenance: repo-verified.** On these 16 source-changing blocks, the current trigger selects four:
Item 1, Item 3 B′, Item 3 C, and Item 17. Their mean review cost is `3.00` rounds; the 12
under-trigger blocks average `2.83`. Pearson correlation is `-0.066` for files versus rounds and
`-0.291` for churn versus rounds. With 16 non-independent observations (four rows belong to one
checkpointed task), these are descriptive only, but they show no separation of review-loop cost.

Near-misses:

- **Under trigger, expensive:** Home `2/125 → 9 rounds`; Placement `7/91 → 5`; favicon/SEO
  `5/95 → 4`; Process `6/164 → 4`; discovery `2/17 → 4`.
- **Over trigger, cheap in rounds:** Item 1 `30/1,769 → 1 round`, form UI `7/534 → 1`, and contact
  `19/890 → 1`. These were not finding-free: Item 1 had two blockers, form UI two blockers plus
  four should-fix, and contact one should-fix. The trigger better describes late/design-risk
  exposure than dialogue length.
- **Over trigger and expensive:** Item 17 `20/150 → 9`, but only R1 changed runtime behavior;
  later cost came from surface/reporting hygiene. Splitting the refactor would not by itself have
  removed that cause.
- **Strictly clean over-trigger blocks:** none. Contact C is the closest (one should-fix, one round).

Options, not a verdict:

| Option | What the corpus says | Trade-off |
| --- | --- | --- |
| Keep `16/500` | It catches all three very large Task 03/Item 1 blocks plus Item 17; every selected block had a real first-round finding. | Keep it as an implementation/design-risk trigger, not a predictor of review rounds; first resolve the `28/1,763` versus `30/1,769` counting inconsistency. |
| Move to `13/300` | Selects 5/16 by additionally catching security-sensitive Item 10 (`13/295`). | Small increase in checkpoints; still misses every small-surface 4–9-round loop, so it does not solve round economics. |
| Move to `7/100` | Selects 12/16, including Home, Process, Placement, and Success. | Owner/review overhead becomes near-default and still misses 4-round Item 15 and 4-round favicon/SEO; the data does not support this as a separating cutoff. |
| Change to two axes | Retain size/churn for late-design-risk; separately observe coordination risk (mutable durable docs, generated/config artifacts, external COs, and surface exceptions). | Best fit to the measured causes, but adds a new metric whose numeric threshold is not calibrated by this corpus; it should start as measurement, not a claimed constant. |

### Three-round cap

**Provenance: repo-verified.**

- `18/24` formal threads (75%) closed within three rounds. Six exceeded three: Placement, Item 12,
  Item 15, Home, Process, and Item 17.
- There were 20 post-R3 graded findings (`16S + 4N`) across four threads. Two additional threads
  (Item 15 and Process) used R4 only to confirm the R3 fix.
- Across the 16 source-changing blocks, the last accepted **runtime-behavior** finding was R1 in
  12 blocks, R3 in one (Item 12's ineffective Vercel guard), and nonexistent in three (reference
  code changed only docs/comments; Location accepted an external risk without a code fix; Item 15
  changed only process/reporting evidence during review). No runtime-behavior finding occurred
  after R3.
- If “code-affecting” includes comments inside production paths, the sole post-R3 example is Item
  17 R5's stale `AGE_THRESHOLD` ownership comment. It changed no executable behavior.
- A hard stop after R3 would therefore have delayed **zero executable fixes** behind owner
  intervention. It would have delayed authoritative/spec/reporting/process fixes: Placement R4's
  stale FS owner-config statement; Item 12 R4's lifecycle text; Home's write-surface/CO/provenance
  tail; and Item 17's backlog/provenance/reporting tail.
- The re-arm at R6 is exercised only by Home and Item 17. Their post-R6 output is `4S + 2N`, all
  completion-work-item or reporting consistency; no code/product/external-boundary finding. On this
  corpus it matters as a second owner-attention brake, not as a code-correctness gate.
- Item 17 closed by owner decision after R9 without a clean confirming round; Item 5's missing
  `Review 6` heading shows that long loops also degrade their own bookkeeping. Both support a
  checkpoint at three even though neither demonstrates a need for automatic continuation.

### Waste-cause ledger

**Provenance: repo-verified.** `C` and `E` are productive review output, not waste; they are included
to show that the framework already has a home for them.

| Cause | Corpus evidence | Existing rule | Coverage |
| --- | --- | --- | --- |
| C — code/product/spec defect | Item 1, form UI, error boundary, abuse control, Process | Mandatory independent review; review against task/PRD/FS; gates and completion obligations | Addressed; findings concentrate in R1 |
| E — external boundary | Vercel body limit and system vars, Google embed support, Next 16 retry contract, Upstash fail mode/live IP evidence | `AI_CROSS_REVIEW.md` always-check-external-boundary duty; `AI_TASK_PROTOCOL.md` basis-of-claim and completion-obligation rules | Addressed and valuable; not waste |
| D — doc/reporting/state drift | Item 6 R2–R3; Item 17 R4–R9; stale paths/counts/evidence cadence | `AI_TASK_PROTOCOL.md` “Verify state claims”; canonical-doc rules; new 3-round cap | Partly addressed: truth rule exists, but no preventive rule for round-by-round narrative/cross-doc resync |
| P — write-surface/lifecycle/gate hygiene | Item 5/15 generated file; Item 17 surfaces and `.claude/settings.json`; task statuses/CO pointers | Exact Allowed Write Surface; generated-files field in task template; lifecycle; Completion Obligations; no pre-approval staging | Addressed in text, repeatedly missed in execution. No specific cleanup rule for harness-created `.claude/settings.json` entries |
| R — re-litigation/incomplete response | Blueprint full R2; Home R2–R5; Item 15 R3; Item 17 R2/R4 | Exact surface rule supplies the answer; 3-round cap now forces owner checkpoint | Partly addressed: cap bounds recurrence; the proposed “revert-or-escalate, do not explain-and-keep” rule remains deliberately unadopted |
| `↩` — fix-created follow-up drift | Item 12 guard; Item 5 backlog provenance; Item 17 repeated counters/pointers; Item 15 live-check permissions | Source/test/config changes re-arm gates; durable docs do not. Generic state-claim rule still applies | No preventive cross-document consistency rule; cap is the only new bound |

No model-knowledge or external-unverified claim is used in these findings. The evidence is entirely
repository-local; no external-AI delegation is required.

## Response 1

**Verification.** Three independent spot-checks before accepting the numbers (a relayed report is a
claim, not a fact — AI_TASK_PROTOCOL.md, Session Duties):

1. Item 1 surface recounted from `git show --numstat 480c721`: raw filter gave 29/1,767; the one-file
   delta is `src/shared/test/serverOnlyStub.ts` (test support outside `__tests__`, correctly
   excluded by Codex) — with it excluded, exactly 28/1,763 base and 30/1,769 under the current
   gate-config-inclusive rule. **Matches.**
2. Item 17 file count (20 execution-affecting) re-derived from the pre-commit `git status` snapshot
   of that session. **Matches.**
3. Item 5's missing `## Review 6` heading confirmed by grep (headings jump 5 → 7). **Matches.**

Remaining figures accepted as Codex's repo-verified measurements on the strength of the three exact
matches (attributed, not independently re-derived). No disputed findings; no follow-up round needed.

**Usable now — recommendations to the owner (this thread decides nothing):**

1. **Cap: keep as adopted, no doc change.** Corpus-validated: zero executable fixes past R3 in 24
   threads; the re-arm at 6 only ever caught reporting tails. Proposed landing: one validation
   pointer appended to the journal's resolved 2026-07-25 entry.
2. **Size trigger: keep `16/500` (Option 1), reframed per evidence** — it marks late-design-risk
   blocks (every selected block carried real first-round findings), it does not predict review-round
   count (correlations ≈ 0; the longest loops were small-surface blocks). Proposed landing: a short
   recalibration note in AI_TASK_PROTOCOL.md — The size trigger, including the counting fix (the
   historical `28/1,763` predates gate-config inclusion; current-rule figure is `30/1,769`). The
   two-axes option is deliberately **not** adopted — a new uncalibrated metric is accretion; the
   coordination-risk observation stays here for the post-MVP retrospective.
3. **Item 17 trigger-step miss**: crossed on files (20/150) but closed without the mandated
   "why no legitimate seam existed" record. Proposed landing: one journal observation, closed as a
   one-off execution miss (single-contract refactor, tiny churn — the justification would have been
   one sentence); reopen on recurrence.
4. **Waste-ledger gaps** (round-by-round reporting resync; `.claude/settings.json` hygiene) —
   consistent with the 2026-07-25 META defer verdicts; no new rules now.

**Резюме для владельца (RU).** Кодекс измерил все 24 формальных треда (57 раундов, 133 находки);
три выборочные проверки сошлись точь-в-точь. Главное: (1) кап на 3 раунда подтверждён данными — ни
одной правки исполняемого кода после раунда 3 во всём корпусе; (2) size-триггер 16/500 стоит
оставить — он ловит блоки с дизайн-риском (у всех пойманных были реальные находки в раунде 1), но
длину диалога не предсказывает — длинные циклы дают маленькие диффы из-за дрейфа отчётных доков;
попутно чинится расхождение в счёте (28/1,763 → 30/1,769 по текущему правилу); (3) Item 17 пересёк
триггер, но закрылся без обязательной записи «почему без чекпойнтов» — разовый промах, предлагаю
зафиксировать в журнале и закрыть. Решения за вами — три пункта выше.

## Outcome

Owner decision 2026-07-25: all three recommendations accepted as-is — **no process-rule change**.
Landed in durable docs:

- **Cap kept.** Corpus-validation line appended to the journal's resolved 2026-07-25 round-counts
  entry (AI_FRAMEWORK_IDEAS.md — Workflow Observations).
- **Size trigger kept at 16/500.** Recalibration note (design-risk marker, not a round-count
  predictor) + the counting reconciliation (28/1,763 → 30/1,769 under the current rule) landed in
  AI_TASK_PROTOCOL.md — "The size trigger".
- **Item 17 trigger-step miss** recorded in the journal and closed as a one-off execution miss;
  reopen on recurrence.
- The two-axes coordination-risk option deliberately **not** adopted (uncalibrated new metric);
  it remains in this thread's Findings as input to the post-MVP retrospective.
- Progress noted in PROJECT_STAGE_LOG.md (2026-07-25 META entry, same-day follow-up).
