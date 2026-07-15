Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 3 — request form rebuild (Block R, reference code / Item 9)

---

## Handoff

Block R of task `STAGE_6_TASK_03_request_form_rebuild.md` (Item 9, reference-code format, folded
into Item 3). This is the first of four review blocks (R = reference code, A′ = non-contact
contract, B′ = non-contact form UI, C = contact block — deferred pending an open STRAT decision on
the contact model). Block R is self-contained: it changes only the DB-side reference-code
generator and one TS test fixture.

### What was done

Replaced the reference-code format generated inside the `create_request` Postgres RPC to meet
FS §4.6: **6 characters, uppercase alphanumeric, excluding the ambiguous glyphs O/0/I/1, unique
per request, generated server-side on persistence.** Old format was `REQ-YYYY-NNNN` from a
monotonic sequence (`request_seq`).

### Files

- `supabase/migrations/20260715124427_stage6_reference_code_format.sql` — new migration.
  `CREATE OR REPLACE FUNCTION create_request(...)` with the **identical 13-param signature,
  return shape (`{ id, referenceCode }`), and grants**. Only the body changes:
  - Code is built from alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 chars, no O/0/I/1), 6 chars.
  - A random code is not collision-free like the old sequence, so the INSERT is wrapped in a
    generate-and-retry loop (`v_max_attempts = 20`) that catches `unique_violation` and
    regenerates. Uniqueness backstop is the existing `reference_code TEXT NOT NULL UNIQUE`
    constraint (`20260622000000_create_requests.sql:18`).
  - The loop distinguishes a `reference_code` collision (retry) from a
    `requests_client_submission_id_key` collision (idempotency race — re-raised, so the route's
    existing race-recovery path in `app/api/request/route.ts` still returns the existing code)
    via `GET STACKED DIAGNOSTICS ... = CONSTRAINT_NAME`.
  - `SET search_path = public, pg_temp` re-asserted in the function definition (preserves the
    hardening from `20260705155244_harden_create_request_search_path.sql`).
- `src/services/__tests__/db.test.ts` — updated one `createRequest` mock fixture from
  `REQ-2026-0001` to a new-format sample `K7M4XP`, with a comment that the code is opaque to the
  TS wrapper and the real format is asserted against the live DB (task CO-1). The TS
  `createRequest` wrapper (`src/services/db.ts`) is unchanged — it passes the RPC's return through.

### Scope boundary

- No signature/return/grant change to `create_request`; no other migration; no client change (the
  reference code is an opaque string to the client). `request_seq` is intentionally left in place
  (harmless, no longer read).
- The contact-model rebuild, the non-contact field-model rebuild, and the form UI are NOT in this
  block (Blocks A′/B′/C).

### What the reviewer can assert now vs. later

- **Assertable now (against the repo):** the migration's plpgsql correctness (loop termination,
  the collision-discrimination logic, search_path preservation, signature/return/grant parity with
  the current live definition = `20260629154719` body + `20260705155244` ALTER); that the TS layer
  is genuinely unchanged; that `pnpm lint`/`typecheck`/`test` pass (274 tests green in-session).
- **NOT assertable until applied live:** the actual generated code format and uniqueness under the
  live DB. The migration is not yet pushed (owner per-migration approval is required first —
  CLAUDE.md). The live check (submit a real request, confirm the returned code matches
  `^[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{6}$` and renders in the admin viewer) is task CO-1, run after the
  owner approves the push. Unit tests mock the RPC and cannot see this — the same gap the task file
  calls out.

### Focus questions

1. **Loop correctness:** is the `unique_violation` handling right — specifically, does catching the
   exception inside the `BEGIN ... EXCEPTION` block correctly roll back only the failed INSERT (not
   the whole function) so a retry can re-INSERT, and does re-raising on
   `requests_client_submission_id_key` preserve the route's idempotency-race recovery?
2. **Constraint-name basis:** is `GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME` reliable
   on Supabase's Postgres for an inline `UNIQUE` column constraint, and is the auto-generated name
   of the `reference_code` constraint (`requests_reference_code_key`) actually irrelevant to the
   logic (the code treats "any non-csid unique_violation" as a ref-code collision)?
3. **search_path:** does `CREATE OR REPLACE ... SET search_path` fully replace the need to re-run
   the `20260705155244` ALTER, or should the ALTER be re-applied separately to be safe?
4. **Collision math / retry budget:** 32^6 ≈ 1.07e9 for ≈5–20 requests/week — is 20 retries an
   ample-and-safe bound, and is there any failure mode where the loop could exhaust or spin?
5. Anything that would break the existing `route.ts` idempotency/race tests once this is live.

## Review 1

1. **Blocker — the claimed staging waiver is not present in the durable decision record.**
   `supabase/migrations/20260715124427_stage6_reference_code_format.sql:23-26` says the owner
   waived the staging requirement and that the waiver is recorded in `PROJECT_DECISIONS.md`.
   The repository says the opposite: `PROJECT_DECISIONS.md:1136-1144` still requires staging for
   every `create_request` behavior change, and a repository search finds no 2026-07-15 waiver or
   exception. The migration therefore cannot be pushed under the current Source of Truth. Record
   the owner's scoped exception (and its test-only-data basis) in `PROJECT_DECISIONS.md` before
   applying this migration, or honor the existing staging requirement; do not leave an
   unverifiable assertion only in a migration comment.

2. **Blocker — the task's completion-obligation manifest contradicts this block's diff.**
   `docs/project/tasks/STAGE_6_TASK_03_request_form_rebuild.md:166-171` declares “No new DB
   migration expected” and requires confirmation that no migration was added, while this block is
   a new migration. `AI_TASK_PROTOCOL.md:300-310` explicitly requires the independent review to
   reconcile migration files against completion obligations, and `PROJECT_DECISIONS.md:299-340`
   requires the real migration apply, Local/Remote migration-list parity, affected-object
   verification, and an end-to-end operation. CO-1's eventual live form submit is useful but does
   not by itself record all of those migration checks (notably signature/return, `proconfig`, and
   `proacl`). Replace CO-2 with the concrete apply-and-verify obligation introduced by this diff,
   with either checkable completion evidence or a pointer to a canonical work item before the task
   can close.

3. **Should-fix — the `proconfig` preservation comment is inaccurate in a security-sensitive
   migration.** `supabase/migrations/20260715124427_stage6_reference_code_format.sql:19-21` says
   `CREATE OR REPLACE` preserves `proconfig`. PostgreSQL documents that replacement preserves
   ownership and permissions, while other function properties are assigned from what the command
   specifies or implies ([CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)).
   The executable SQL is correct because line 48 explicitly supplies
   `SET search_path = public, pg_temp`; that clause is sufficient and no second `ALTER FUNCTION`
   is needed. Reword the comment to say the migration **re-establishes** the hardened setting, so a
   future replacement does not incorrectly assume an omitted `SET` would be retained.

### Focus-question results

- The retry block is structurally correct. PostgreSQL rolls back persistent changes made inside
  the failed `BEGIN ... EXCEPTION` block while retaining PL/pgSQL variable state, so a reference
  collision can retry without rolling back the whole function
  ([PL/pgSQL error trapping](https://www.postgresql.org/docs/current/plpgsql-control-structures.html#PLPGSQL-ERROR-TRAPPING)).
- `GET STACKED DIAGNOSTICS ... CONSTRAINT_NAME` is the documented way to obtain the constraint
  attached to the current exception. The exact idempotency name is repo-defined, not assumed:
  `20260622000001_add_client_submission_id_unique.sql:9-10` creates
  `requests_client_submission_id_key`. Re-raising it preserves the unique violation consumed by
  `app/api/request/route.ts:91-107`; reference-code collisions stay inside the bounded retry loop.
- Signature, named parameters, JSON return keys, and function body after the request insert match
  the current definition in `20260629154719_domain_foundation.sql:96-176`. `CREATE OR REPLACE`
  preserves the existing owner/ACL, and the explicit `SET search_path` preserves the hardening.
- The namespace is exactly `32^6 = 1,073,741,824`. At the documented 5-20 requests/week, 20
  attempts is ample; the loop is bounded and cannot spin indefinitely. Exhaustion re-raises the
  final unique violation and the route returns a non-recovered 500, which is the safe failure.
- External-boundary check: this uses core PostgreSQL PL/pgSQL behavior rather than a
  Supabase-specific extension; no request/payload/runtime platform limit is introduced by the
  block. Actual live migration behavior remains unasserted until the corrected completion
  obligation is performed.

### Quality gates

- `pnpm lint` — PASS (0 errors; one pre-existing `@next/next/no-img-element` warning in
  `src/features/admin/__tests__/RequestImageViewer.test.tsx:32`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (27 files, 274 tests).

## Response 1

All three findings **accepted**. None touch the migration's executable logic or the TS diff — they
are a doc-record gap and comment wording — so the green gates from the Handoff still hold for the
code under review.

1. **Blocker 1 (staging waiver not in the durable record) — accept, fixed.** The waiver existed
   only in the migration comment and (indirectly) inside the later "Stage 6 Contact Model" decision,
   not at the authoritative gate. Added a dated **scoped exception directly at
   PROJECT_DECISIONS.md → "Staging Environment"** naming both Stage 6 `create_request` migrations
   and their test-only-data basis, and narrowed it so it does not reopen the gate for RLS /
   browser-side Supabase / multi-studio. Reworded the migration comment to point at that recorded
   location instead of asserting it. The migration is still not pushed — owner per-migration
   approval precedes `db push` (CLAUDE.md).
2. **Blocker 2 (CO-2 contradicts the diff) — accept, fixed.** Replaced the task file's CO-2 ("No new
   DB migration expected") with a concrete **apply-and-verify obligation** covering both migrations
   (M1 reference-code now, M2 contact-model in Phase 3): `db push` success, `migration list`
   Local=Remote parity, affected-object verification (signature/return/grant/`proconfig`), and the
   live e2e (shared with CO-1). This is the IMPL session reconciling a completion obligation against
   what the work introduced (CLAUDE.md — Completion obligations gate).
3. **Should-fix 3 (proconfig comment inaccurate) — accept, fixed.** Reworded: `CREATE OR REPLACE`
   preserves only owner/ACL, **not** `proconfig`; the explicit inline `SET search_path = public,
   pg_temp` is what re-establishes the hardening (no second `ALTER` needed). The comment now says
   "re-establishes" so a future replacement does not assume an omitted `SET` would be retained.

Thanks for the focus-question confirmations (retry-block rollback semantics, `CONSTRAINT_NAME`
basis, signature/grant parity, 32^6 namespace, bounded loop) — they matched the design intent and
are the assertable-now half; the live format/uniqueness check remains CO-1.

### Итог для владельца (RU)

Codex дал 2 блокера + 1 should-fix, все приняты и исправлены — **правки только в доках/комментах,
логика миграции и код не менялись** (гейты остаются зелёными):
1. Waiver стейджинг-гейта теперь записан прямо в PROJECT_DECISIONS.md у самого гейта (был только в
   комменте миграции) — точечное, датированное исключение на 2 миграции Stage 6.
2. CO-2 в таск-файле переписан с «миграции не ожидается» на конкретную apply-and-verify обязанность
   (обе миграции: референс-код сейчас, контакты в Phase 3).
3. Комментарий про `search_path` исправлен (CREATE OR REPLACE не сохраняет `proconfig` — это делает
   явный `SET`-клоз).

Consensus достигнут. Дальше: предложу коммит(ы) и попрошу твоё подтверждение на `supabase db push`.

## Consensus

- **Finding 1 (blocker, staging waiver)** — accepted; filed as a scoped exception in
  PROJECT_DECISIONS.md → "Staging Environment" (2026-07-15) + migration comment reworded.
- **Finding 2 (blocker, CO-2)** — accepted; CO-2 rewritten as an apply-and-verify obligation in
  `STAGE_6_TASK_03_request_form_rebuild.md`.
- **Finding 3 (should-fix, proconfig comment)** — accepted; migration comment corrected.
- No rejected findings. No deferred work. The live format/uniqueness verification is CO-1 (runs
  after the owner-approved `db push`), not a review debt.
