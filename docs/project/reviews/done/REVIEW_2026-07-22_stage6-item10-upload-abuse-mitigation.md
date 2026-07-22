Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 — Item 10 abuse mitigation

## Handoff

Implemented `docs/project/tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md` (Option B per
PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation" §2): a durable, non-caller-resettable
per-IP quota on the public unauthenticated `POST /api/upload`, plus an invisible submit honeypot on
`POST /api/request`. No CAPTCHA. Global circuit-breaker (Option C) is out of scope by decision.

This is a security-sensitive change on a public write surface and it adds a paid dependency
(Upstash), so the task mandates independent cross-review to consensus (Review Granularity: `multi`).

Baseline: the working tree on `main` (uncommitted — the commit is gated on this review's consensus
+ owner approval). `pnpm qg` is green: lint 0 errors (1 pre-existing unrelated warning), typecheck,
393 tests, build.

**Changed files (source):**
- `src/bff/uploadQuota.ts` (new) — the durable quota. `@upstash/ratelimit` `fixedWindow` over
  `@upstash/redis`, lazily-constructed module singleton, exports `checkUploadQuota(sourceKey)` and
  the named constants `UPLOAD_QUOTA_LIMIT` / `UPLOAD_QUOTA_WINDOW`. Returns a discriminated result
  (`allowed` / `quota` + `retryAfterSeconds` / `unavailable`).
- `src/bff/rateLimit.ts` — reworked `clientIpFromHeaders` (header preference order + blank handling)
  and reframed the module doc comment; the in-memory limiter itself is unchanged in behavior.
- `src/bff/index.ts` — barrel exports for the new module.
- `src/config/index.ts` — `upstash: { redisUrl, redisToken }` via the existing `requireEnv` pattern.
- `app/api/upload/route.ts` — calls the durable quota, and demotes the pre-existing in-memory
  limiter; adds a 503 helper and structured `console.warn` on limited/unavailable paths.
- `app/api/request/route.ts` — a honeypot check and a local synthesized-reference-code helper.
- `src/shared/api/index.ts` — `REQUEST_FIELDS.website` (the honeypot field name).
- `src/features/request/ui/RequestForm.tsx` — the hidden honeypot input + its submission wiring.
- `.env.example` — `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

**Changed files (tests + reporting):**
- `src/bff/__tests__/uploadQuota.test.ts` (new), `src/bff/__tests__/rateLimit.test.ts`,
  `app/api/upload/__tests__/route.test.ts`, `app/api/request/__tests__/route.test.ts`,
  `src/features/request/__tests__/RequestForm.submission.test.tsx`.
- `package.json`, `pnpm-lock.yaml` (the two Upstash packages).
- `docs/files-structure.md`, `docs/project/PROJECT_STAGE_LOG.md`.

**Scope boundary:** the task's Allowed Write Surface. No migrations, no other shared docs, no change
to the 4 MB ceiling / MIME-magic checks / handle model / adoption caps. The three "real ceiling"
comments named in the task (CO-5) were corrected in the three files the task lists.

**Completion-obligation context (for your feasibility check, not for you to close):** CO-1 (the
`x-forwarded-for` trust question) was resolved in-plan from current Vercel request-headers docs;
CO-2 (live cross-instance + spoof verification), CO-3 (real Vercel env), and CO-4 (owner-debt:
Firewall/Log alert, WAF deny drill, provisioning, spend safeguards) remain open as
deploy-time/owner obligations. A green `pnpm qg` certifies the tree, not the deployed control.

**Focus questions:**

1. **Fail-mode of the durable quota.** Does `checkUploadQuota` actually fail *closed* on every way
   the store can fail (network error, auth error, malformed response, the SDK's own timeout
   behavior)? Is there any path where an unreachable/erroring store results in an upload being
   admitted or written? Check the `@upstash/ratelimit` timeout semantics against the value this code
   passes.
2. **Ordering & no-write on the failure paths in `app/api/upload/route.ts`.** Is the durable check
   genuinely first (before the body is read and before the in-memory limiter), and do the 429 and
   503 paths return without writing to storage and without falling through to the in-memory limiter?
3. **Source-key trust (CO-1) against real Vercel behavior.** Given the header preference order in
   `clientIpFromHeaders`, can a caller mint a fresh quota bucket by setting a request header on this
   deployment's topology? Is the "blank/missing → shared bucket, never no-limit" property actually
   upheld for every branch? This is the external-boundary claim the repo does not own — please assess
   it against current platform behavior, not just the unit tests.
4. **Honeypot correctness in `app/api/request/route.ts`.** Is the honeypot read before parsing and
   kept out of the validated payload/zod schema? On a filled honeypot, is nothing persisted (so the
   same `clientSubmissionId` can still submit legitimately later), and is the response shape
   indistinguishable from a genuine success (including the reference-code format vs. the DB
   generator)? Is a whitespace-only value handled the way a real empty field is?
5. **Leakage.** Do the new `console.warn` lines (and any other new logging) avoid emitting storage
   paths, handles, tokens, or request PII?
6. **Constants & config.** Is the threshold a code constant (not env) with the creds in env via
   `requireEnv`, and are the keys prefixed so staging/production cannot collide?

Any blocker or should-fix with a file:line pointer and a concrete failure scenario is what I need.

## Review 1

1. **Should-fix — a stalled quota-store call never reaches the promised 503 path.**
   `src/bff/uploadQuota.ts:40-54,66-74` correctly sets the Ratelimit SDK's `timeout` to `0`, which
   disables its documented fail-open timeout. However, the underlying `Redis` client is created
   without an abort signal or any other fail-closed deadline. If the fetch stalls instead of
   rejecting (for example, a black-holed upstream connection), `limit()` remains pending, the
   `catch` never returns `unavailable`, and Vercel eventually terminates the Function. The caller
   therefore gets a platform timeout rather than the task's retryable 503, and the 503
   `console.warn`/alert signal is never emitted. Add a bounded abort/deadline that rejects into the
   existing `unavailable` branch while keeping the Ratelimit SDK's fail-open timeout disabled, and
   cover a non-settling/aborted store call. Upstash confirms that its Ratelimit timeout admits the
   request after the deadline, so that timeout itself cannot implement this fail-closed deadline:
   https://upstash.com/docs/redis/sdks/ratelimit-ts/features#timeout.

2. **Should-fix — a 24-hour quota breach still tells the visitor to press Retry immediately.**
   `src/features/request/lib/upload.ts:31-34` maps every 429 to `UPLOAD_INVALID` and marks it
   retryable; `src/shared/i18n/messages/en.json:224` renders that as "Press Retry ... then send
   again", and `src/features/request/ui/UploadCategoryInput.tsx:162-169` shows the Retry control.
   Thus the exact condition anticipated by task lines 75-79 is true but was not handled: repeated
   clicks cannot succeed until `Retry-After` expires and only create more quota/log traffic. Give
   429 a rate-limit-specific visitor message (and tests) that does not claim an immediate retry can
   succeed; preserve 503/network failures as normally retryable.

3. **Should-fix — the Redis namespace does not isolate deployments.**
   `src/bff/uploadQuota.ts:46-48` prefixes only with `deploymentStudioId`, and
   `src/bff/__tests__/uploadQuota.test.ts:52-65` locks that shape in while claiming it isolates
   staging and production. A preview/staging deployment serving the same studio and using the same
   Redis database therefore consumes the production bucket for the same IP. Include a stable
   deployment/environment dimension as required by task lines 71-74, and test two environments
   with the same studio ID.

4. **Should-fix — syntactically invalid source identifiers get independent quota buckets.**
   `src/bff/rateLimit.ts:85-94` accepts any non-blank first token, so values such as `garbage-a` and
   `garbage-b` become separate keys instead of the shared `unknown` bucket required by task line
   74 / PROJECT_DECISIONS.md:2254-2258. Validate that the selected token is an IPv4 or IPv6 address
   before returning it and add malformed-value coverage. For the current default Vercel topology,
   the official boundary documentation does support preferring `x-vercel-forwarded-for`: Vercel
   says it overwrites `x-forwarded-for` to prevent spoofing and that `x-vercel-forwarded-for` is an
   identical platform header that survives a proxy on top of Vercel
   (https://vercel.com/docs/headers/request-headers#x-forwarded-for). The required live spoof test
   remains correctly open under CO-2; this finding concerns the separate invalid-source contract.

5. **Should-fix — CO-5 is not complete, but the durable status report says it is.**
   `app/api/upload/route.ts:134` still calls the caller-resettable per-session object cap "the real
   defence against bucket-filling replay" — one of the three stale claims explicitly named by
   task lines 122-124. `docs/project/PROJECT_STAGE_LOG.md:52` nevertheless records `CO-5 done`.
   Reword the remaining comment to describe only an honest-session cap and correct the status
   report. Also align `src/bff/rateLimit.ts:10` with the actual ordering: the in-memory shield runs
   after, not "in front of", the durable check.

6. **Nit — the required structured log category is only implicit text.**
   `app/api/upload/route.ts:81,88,99` emits `source=` and `reason=`, but no explicit `category=`
   field; the category exists only in prose such as `quota exceeded`. Since task lines 82-84 make
   source/category/reason the dashboard-alert contract, add a stable `category=` value (without
   reading the body before the quota) and assert it in the route tests.

External-boundary and flow checks otherwise passed: the durable check is first and all explicit
429/503 branches return before body parsing, the in-memory limiter, and storage writes; the current
Vercel header choice is supported by the official documentation cited above; the honeypot is read
outside the validated payload before parsing/persistence and returns the DB generator's current
six-character shape; no new log emits a storage path, handle, token, or request payload. The logged
source IP is the source key explicitly required by the observability decision.

Verification: `pnpm lint` PASS (one pre-existing `no-img-element` warning), `pnpm typecheck` PASS,
`pnpm test` PASS (31 files / 393 tests). `git diff --check` reports trailing whitespace on the 17
new `PROJECT_STAGE_LOG.md` lines; clean that reporting-only diff before commit.

## Response 1

All six items **accepted** and applied in this round; nothing goes to the owner. Re-ran the gates on
the fixed tree: `pnpm qg` green — lint 0 errors (same pre-existing `no-img-element` warning),
typecheck, **399 tests** (was 393; +6), build.

1. **Accept — stalled store call now fails closed.** Correct and important: `timeout:0` only removes
   the SDK's fail-*open* race; a hung (never-settling) fetch left `limit()` pending until the
   platform killed the Function, bypassing the 503. Added an own `QUOTA_STORE_DEADLINE_MS = 3000`
   deadline via `Promise.race`; the loser rejects into the existing `catch` → `unavailable`
   (`src/bff/uploadQuota.ts`). New test drives a non-settling call under fake timers and asserts
   `unavailable`.
2. **Accept — 429 gets its own copy.** The owner had pre-authorized "switch if Codex dissents" on
   exactly this UX call, and the concrete condition is real. Split `keyForStatus`: `429 →
   UPLOAD_RATE_LIMITED` (still retryable — the slot Retry re-uploads later and the text request
   submits regardless — but the message no longer says "press Retry" now); `>=500`/network unchanged
   (`upload_invalid`). Added key + i18n message + `errors.ts` mapping, and an `errors.test.ts`
   asserting the rate-limit copy does not promise an immediate retry while the transient one still
   does.
3. **Accept — env dimension in the prefix.** Prefix is now
   `upload-quota:${studioId}:${VERCEL_ENV ?? "local"}`, so a preview/staging deploy serving the same
   studio no longer consumes the production bucket. Test asserts two environments with the same
   studio ID get distinct prefixes.
4. **Accept — malformed source collapses to `unknown`.** `clientIpFromHeaders` now validates the
   extracted token is IPv4/IPv6-shaped; a non-IP value falls through to the shared `unknown` bucket
   instead of minting a per-value key. Tests cover `garbage-a`/`garbage-b → unknown` and a valid
   IPv6 passing. (The live spoof test stays open under CO-2, as noted.)
5. **Accept — CO-5 genuinely complete + report corrected.** You caught a real miss: the inline
   comment at the per-session count check (not the constant's declaration comment, which I had
   edited) still called the cap "the real defence." Reworded to describe only an honest-session cap;
   also fixed `rateLimit.ts` "in front of" → "behind / runs after." PROJECT_STAGE_LOG.md updated to
   describe CO-5 accurately (and the trailing whitespace on the reporting lines is cleaned —
   `git diff --check` is clean).
6. **Accept — explicit `category=`.** The three `console.warn` lines now emit
   `category=upload source=… reason=…` as a stable literal (no body read before the quota). Route
   tests assert `category=upload` on the 429 and 503 paths.

**Резюме для владельца.** Codex нашёл 6 пунктов (5 should-fix + 1 nit) — все приняты и исправлены,
спорных нет. Самый важный: durable-квота теперь падает закрыто и при *зависшем* (а не только
отклонённом) вызове хранилища — добавлен собственный 3-секундный дедлайн → 503 без записи. Также:
429 теперь показывает отдельное сообщение (не обещает мгновенный повтор — как ты и разрешил
переключить, если Codex будет против); префикс ключа изолирует ещё и окружение (preview/prod);
мусорный source-заголовок сводится в общий `unknown` (без обхода лимита); исправлен пропущенный
комментарий CO-5; в логи добавлено `category=`. `pnpm qg` зелёный (399 тестов). Открытые CO
(не код): CO-2 (live cross-instance + спуф), CO-3 (реальные env в Vercel), CO-4 (owner-debt).

## Consensus

Accepted (all applied this round; filed in the fix diff, to be committed with the block):

- Fail-closed deadline for a stalled store call — `src/bff/uploadQuota.ts` (+ test).
- 429-specific visitor copy that does not promise immediate retry — `upload.ts`,
  `validationKeys.ts`, `errors.ts`, `en.json` (+ `errors.test.ts`).
- Deployment-environment dimension in the Redis prefix — `src/bff/uploadQuota.ts` (+ test).
- IP-shape validation so a malformed source shares the `unknown` bucket — `src/bff/rateLimit.ts`
  (+ tests).
- CO-5 completion: the missed inline "real defence" comment and the `rateLimit.ts` ordering comment
  corrected; PROJECT_STAGE_LOG.md report aligned; trailing whitespace cleaned.
- Explicit `category=upload` in the observability warns — `app/api/upload/route.ts` (+ test
  assertions).

Rejected: none. Deferred: none (CO-2/CO-3/CO-4 remain open as pre-existing deploy-time/owner
obligations recorded in the task, not review findings). Gates green on the fixed tree
(`pnpm qg`, 399 tests). Ready for owner-approved commit; this thread moves to `done/` as part of it.
