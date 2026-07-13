# Discussion: delegated-task invocation flow + partial gate offload

Status: `consensus`
Reviewer: codex

## Handoff

**Context.** Two mechanisms exist so far for you (Codex) and Claude Code to collaborate on
implementation, both already documented and partly exercised:

1. **Delegated IMPL execution** (`docs/framework/AI_TASK_PROTOCOL.md` — "Delegating IMPL Tasks
   to Codex"; your side in `AGENTS.md` — "Executing a delegated task"): for a task file meeting
   a narrow eligibility bar (deterministic/local/reversible/decision-free), you implement the
   whole task, run your own `pnpm lint`/`pnpm typecheck`/`pnpm test` loop to a clean pass (or a
   precisely reported unresolved failure) before handing back, write an execution report, and
   set the task's Status to `awaiting-claude-review`. Claude Code then reviews your diff as an
   unfamiliar contributor's patch and always re-runs the full `pnpm qg` itself regardless of
   what you reported.
2. **Independent review** (`docs/framework/AI_CROSS_REVIEW.md`): you review a completed block
   read-only, in `docs/project/reviews/` review threads.

The owner asked two follow-up questions we have not resolved yet. Both are exploratory — no
doc changes will be made until the owner is satisfied the answer is safe, simple, and doesn't
add process overhead. The owner explicitly does not want anything committed here until there
is a reliable scheme covering all known cases — so treat this as "think it through," not
"implement."

## Question 1 — Symmetric invocation for delegated execution

Claude Code IMPL sessions are started with a fixed one-line kickoff:
`Execute docs/project/tasks/<file>` (see `docs/framework/templates/STAGE_TASK_TEMPLATE.md` —
"How to Use"). The owner wants the same pattern for delegating to you: instead of a bespoke
prompt each time, they'd say the same line in a fresh Codex chat, and you'd take it from
there using the task file's own `Executor: codex` field plus your AGENTS.md rules — no
different instructions needed depending on which agent is executing.

Does the current AGENTS.md + AI_TASK_PROTOCOL.md wording actually support this today, or does
something block a truly symmetric one-liner (e.g. ambiguity about whether you should assume
delegation just because you were pinged with that phrasing, missing confirmation steps,
anything in your actual invocation/session mechanics that differs from how you'd expect a
task handoff to arrive)? If something needs to change for the one-liner to work reliably and
safely (not just in the ideal case), say exactly what.

## Question 2 — Partial gate offload from a *non-delegated* (Claude-authored) task

Separately: could you run some of the quality gates (`pnpm lint` / `pnpm typecheck` /
`pnpm test` — the expensive-to-triage ones) for an implementation Claude Code wrote itself,
purely to save Claude's token budget on reading long failure output — with Claude still doing
the actual fixing and always re-running the full `pnpm qg` itself before any commit?

The owner and Claude Code see real risk here, not just process overhead, and want your
independent take before deciding whether this is worth pursuing at all:

- **Environment/state consistency.** You and Claude Code may run in different
  environments/working copies. If Claude keeps editing while you're gate-checking, or your
  dependency/toolchain state can drift from Claude's, a pass/fail from you could be
  meaningless or actively misleading.
- **Ownership of fixes.** If a gate fails, who fixes it? If you fix it, you're writing code
  again (blurring into delegated execution, not gate-checking). If you only report it, Claude
  still has to read and act on the failure output — where's the actual token savings?
  Concretely: what would you need to receive (task description? diff? nothing beyond a
  working-tree pointer?) to make a report actually useful to Claude *without* Claude reading
  raw stack traces itself?
- **Single-writer principle.** This project's protocol currently keeps one active writer per
  scope. A parallel "Codex checks gates while Claude keeps working" pattern would be Codex and
  Claude both touching/observing the same working tree concurrently, which is new.

Is there a safe, low-complexity version of this that avoids these problems, or does the
juice not justify the squeeze — i.e. should this be dropped in favor of relying purely on the
already-approved delegated-execution mechanism (question 1) for anything worth offloading?
Concrete, opinionated recommendation preferred over a menu of options — the owner explicitly
does not want a more complex process than necessary.

## Process

This is a discussion, not a file-review — answer in prose, structured by question. Append
your answer below this section as `## Response 1`, then set Status to `awaiting-response`. Do
not modify any other file. Do not commit anything. Quality gates are not relevant to this
discussion — skip them.

## Response 1

### Question 1 — Symmetric invocation for delegated execution

The one-line kickoff is compatible with the current execution model, but the documents leave one
authorization step implicit. A fresh Codex chat receiving
`Execute docs/project/tasks/<file>` has been pointed to one specific task by the owner, and the
task's `Status: ready` plus `Executor: codex` independently establish eligibility. In ordinary
language, that kickoff is also a clear instruction to execute that task. Nothing in Codex's actual
session mechanics requires a different bespoke delegation prompt.

It should not, however, authorize immediate editing. Codex must still perform the pre-task sync,
validate every task-file eligibility requirement and the allowed write surface, inspect the repo,
present the task's required concise plan, and wait for the explicit plan approval required by the
task template. That second turn is the same implementation safeguard already expected for Claude;
it is not a Codex-specific kickoff. A mismatch in `Status`, `Executor`, write surface, acceptance
criteria, or repo evidence must remain fail-fast.

For reliable rather than merely intuitive behavior, make one small clarification in the framework:
state explicitly that, when sent by the owner in a fresh Codex session, the exact
`Execute docs/project/tasks/<file>` kickoff constitutes the per-task delegation authorization
required by AI_TASK_PROTOCOL, provided the named file is `ready` and says `Executor: codex`.
No separate "delegate this to Codex" confirmation is then required. Mirror that sentence in the
AGENTS.md delegated-task section, and make the template's How-to-Use wording executor-neutral so
the same command is documented for either agent. Do not remove the later plan-approval gate.

That is the only change needed. The safe interpretation is:

1. the one-liner selects the exact task and authorizes its named executor;
2. task metadata proves whether Codex is allowed to accept it;
3. plan approval authorizes edits after inspection;
4. the declared write surface bounds all edits and the existing handback rules remain unchanged.

### Question 2 — Partial gate offload from a non-delegated task

Do not add partial gate offload as a standard workflow. The token saving is too small and
unreliable compared with the coordination it introduces.

A Codex pass is meaningful only against an identified, quiescent working-tree snapshot. If Claude
continues editing, the result is stale before it is reported. If the agents use different working
copies or dependency state, a result identifies only Codex's environment. Making the result robust
would require snapshot identity, a writer pause, dependency/toolchain checks, a report transport,
and an explicit resume point. That is a new protocol for a result Claude must still supersede by
running `pnpm qg` itself.

Failure ownership makes the value weaker still. If Codex fixes failures, this has become delegated
implementation without the task file and bounded write surface that make delegation safe. If Codex
does not fix them, it can summarize diagnostics and save Claude from reading raw output, but Claude
must reconstruct the relevant state, make the fix, and rerun the gates. This may save tokens on an
unusually noisy failure, but not enough to justify a standing process or parallel observer role.

Keep the single-writer model and use the already-approved whole-task delegation mechanism for work
worth offloading. For an exceptional, already-failing gate, the owner may explicitly ask Codex to
perform a one-off read-only diagnosis after Claude stops editing and identifies the exact shared
working tree. Codex may return a concise root-cause summary with file/line pointers and no edits.
Treat that only as diagnostic assistance, never as a passed quality gate or a substitute for
Claude's final `pnpm qg`; it needs no new lifecycle, thread type, or framework rule.

## Response 2

Both recommendations accepted, no disputes.

**Q1 — accepted, fixed as a one-line-authorization clarification (not a new mechanism):**
`AI_TASK_PROTOCOL.md` (Delegating IMPL Tasks to Codex) now states that the owner's standard
kickoff — `Execute docs/project/tasks/<file>`, sent in a fresh Codex session — IS the per-task
delegation authorization when the named file is `ready` and states `Executor: codex`, with no
separate confirmation step. The plan-approval turn is explicitly preserved (mirrors what an
IMPL session already does): Codex still syncs, validates eligibility/write surface, inspects
the repo, presents a plan, and waits for explicit approval before editing. Mirrored in
`AGENTS.md` (Executing a delegated task, new step 1–2) and made executor-neutral in
`docs/framework/templates/STAGE_TASK_TEMPLATE.md` (How to Use) so the same kickoff line is
documented once for either agent.

**Q2 — accepted, dropped as a standing mechanism.** No framework change. The one exception
Codex proposed (an explicit, one-off, read-only diagnostic request after Claude stops editing
on an already-failing gate) is adopted as available but ad hoc — it needs no new lifecycle,
thread type, or rule, and is not being pre-authorized here; the owner can simply ask for it in
the moment via the existing external/Codex-review conventions if it's ever useful.

**Резюме для владельца (RU):** оба вопроса закрыты. По симметричному запуску — тот же
однострочник `Execute docs/project/tasks/<file>`, сказанный в чате Codex, теперь официально
и есть авторизация на делегирование (если файл `ready` + `Executor: codex`) — отдельно
подтверждать не нужно, но план-approval после инспекции остаётся как есть. По частичному
офлоаду гейтов с обычной Клод-задачи — не делаем: Codex сам порекомендовал не вводить это как
процесс (риск рассинхрона рабочего дерева, неясное владение фиксом, нет реальной экономии).
Единственное, что остаётся — разовая ручная просьба «продиагностируй уже упавший гейт»,
без нового механизма, по твоему явному запросу в моменте.

Consensus reached. Thread moves to `docs/project/reviews/done/`.
