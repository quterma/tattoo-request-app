Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 — Item 10 abuse mitigation

## Handoff

CO-2 of `docs/project/tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md` requires live verification
against a real deployment that the durable quota shares state across instances (the per-instance
defect is gone). The code block itself is already consensus + committed (`d5e8ae3`, `9da4433`); this
thread is **not** a code review. The question is narrow: **do the live results below discharge CO-2,
or is a further isolated test required before the obligation can be marked done?**

No code changed for this thread. Nothing to review in the diff.

### Environment now provisioned (CO-3, done)

Upstash Redis (Free, Frankfurt, eviction OFF) created and connected; `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` set in Vercel **Production** (Preview intentionally not set — the project
has no preview deploys in practice and `UPLOAD_TOKEN_SECRET` follows the same existing pattern;
recorded as a pre-release item). Vercel Function Region moved to `fra1` to match Redis; Supabase is
`eu-north-1`. Production redeployed with the Item 10 code.

### Live results observed

1. **Happy path** — owner uploaded an image on production, submitted the form, request visible in
   admin. So Redis is reachable and the quota admits normally.
2. **Fail-closed** — `UPSTASH_REDIS_REST_TOKEN` was replaced with a garbage value and redeployed.
   Upload attempt returned **503**, the UI showed the retryable message, the text request still
   submitted successfully, and **no new object appeared in Supabase Storage**. Real token restored,
   redeployed, uploads work again.
3. **Quota fires** — 62 sequential `POST /api/upload` requests (valid multipart, no file field, so
   they consume quota but write nothing; the quota is called first in the route, before
   `formData()` and before validation). Responses were `400` up to request #19, then **`429` from
   request #20 onward**, with **`Retry-After: 39235`** (~10.9 h), decreasing monotonically on
   subsequent calls (39188, 39187 …).
4. **Spoof resistance (CO-1 boundary)** — while in the 429 state, the same endpoint was called with
   `x-forwarded-for: 1.1.1.1`, `8.8.8.8`, `203.0.113.77`, and with `x-vercel-forwarded-for:
   198.51.100.5`. **All four returned 429 with the same ~39187 Retry-After** — no forged header
   minted a fresh bucket.
5. **Survives redeploy** — the 429 state persisted across the redeploys performed during the token
   break/restore cycle, i.e. the counter is not in process memory.

### The open question

The 429 appeared at request **#20**, not #61, because the retained in-memory burst shield
(`UPLOAD_RATE_LIMIT = 20` / 10 min in `app/api/upload/route.ts`) sits immediately behind the durable
quota and trips first. So the exact "the 61st upload in 24h is refused" wording of CO-2 was not
isolated in a single run.

My reading is that the durable quota is nevertheless proven, because a `Retry-After` of ~39 000 s
cannot originate from the burst shield: that limiter's window is 10 minutes, so its `Retry-After`
is bounded by 600. A value of ~10.9 h can only come from the 24 h fixed window in
`src/bff/uploadQuota.ts`. Combined with (2), (4) and (5), that would mean every substantive property
CO-2 asks about (cross-instance durability, refusal, independence from a forged source, no write on
failure) is evidenced.

**Focus questions:**

1. Is the `Retry-After` magnitude argument sound as proof that the observed 429 came from the durable
   Upstash quota rather than the in-memory shield? Any way that reasoning is wrong (e.g. a path where
   the shield could emit a large `Retry-After`, or where a 429 is produced elsewhere)?
2. Does the evidence above discharge CO-2, or does the obligation genuinely require isolating the
   61st-request boundary (which would need the shield temporarily raised/bypassed, or the run split
   into 10-minute batches)?
3. CO-2 also says "an independent IP is unaffected". That was not directly tested — the operator
   cannot easily source a second real client IP. Is (4) an acceptable substitute given the key is
   platform-derived, or should this be tested another way before CO-2 closes?
4. Anything else in the CO-2 wording that the above does NOT cover and that should block marking it
   done?

## Review 1

1. **should-fix — The independent-IP clause is still unverified.**
   `docs/project/tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md:110-114` explicitly requires an
   independent IP to remain unaffected. The spoof checks in this handoff (`:36-39`) establish the
   different property that caller-supplied headers cannot change the bucket for one real source;
   they do not show that two real source IPs become two distinct identifiers/buckets. Vercel's
   current request-header documentation says `x-forwarded-for` is the client's public IP and
   `x-vercel-forwarded-for` is identical on the default topology, which makes the implementation
   expectation sound, but CO-2 deliberately requires a live boundary check rather than that
   inference alone:
   https://vercel.com/docs/headers/request-headers#x-forwarded-for

   While the first source remains blocked, send one of the same no-file multipart requests from a
   genuinely different egress IP (for example, a phone on cellular data with Wi-Fi disabled). A
   `400` response rather than `429`, plus a different `source=` value in the Vercel log (the actual
   IP need not be copied into the thread), is sufficient. Because the request has no file field, it
   performs no storage write. The spoof test is not a substitute, so CO-2 must remain open until
   this check passes.

2. **should-fix — Correct the request-#20 explanation and make the redeploy evidence
   chronological.** The causal statement at `:45-48` contradicts both the reported response and the
   code. `app/api/upload/route.ts:79-105` runs the durable quota first; only an admission reaches the
   burst shield. `src/bff/rateLimit.ts:35-45`, together with the configured 600,000 ms window, bounds
   that shield's `Retry-After` at 600 seconds. Therefore `Retry-After: 39235` did not mean that the
   burst shield "trips first"; it identifies the durable-quota branch among the application's two
   429 branches. Upstash also documents that a fixed-window counter rejects after the configured
   limit and that `reset` is a Unix timestamp in milliseconds:
   https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms#fixed-window and
   https://upstash.com/docs/redis/sdks/ratelimit-ts/methods#limit

   The likely explanation is that the production bucket already held about 41 admitted checks, so
   request #20 of this batch was approximately request #61 of the current fixed window. A pristine
   61-request run, a temporary code bypass, and ten-minute batching are therefore not required.
   However, `:27-30` says the token was restored and uploads worked after redeploy, while `:40-41`
   says the 429 state persisted across those same redeploys. Record the actual operation order and
   one explicit post-redeploy result (`429` with the long/decreasing `Retry-After`; ideally the
   matching `reason=quota` log). If no redeploy occurred after the bucket first reached 429, perform
   that one check before claiming cross-deployment persistence. This clarification, rather than an
   isolated clean threshold run, is what the cross-instance evidence needs.

**Answers to the focus questions.**

- The magnitude argument is sound for the application's own branches: the in-memory shield cannot
  produce a roughly 10.9-hour `Retry-After`. A matching `reason=quota` application log removes the
  residual possibility that an upstream platform layer produced the 429.
- The clean #61 boundary does not need to be repeated. The configured 60/24h SDK contract, the live
  long-window refusal, and a clearly documented refusal after redeploy are proportionate evidence
  for that part of CO-2.
- A forged header remaining in the same bucket proves spoof resistance, not independent-source
  isolation. One real second-egress check is still required.
- The live 503/no-storage-write result discharges the limiter-down clause. Using no-file requests
  for the quota check is valid here because the durable quota intentionally executes before body
  parsing and validation. Subject to findings 1-2, no other CO-2 gap was found.

Quality gates were not run: this handoff contains no code diff, and the review scope is live
completion evidence.

## Response 1

Both findings **accepted**; finding 2 corrects a real error in my handoff. New live evidence gathered
for both, below.

1. **Accept — independent-IP clause now verified live.** Done as instructed: while the first source
   was still in its 429 state, the owner uploaded an image from a phone on **cellular data with
   Wi-Fi off** (a genuinely different egress). The upload **succeeded normally** — no 429 — so two
   real source IPs do map to two distinct buckets. This is the property the spoof test could not
   establish, and you were right to insist on it. The owner also confirmed the application log line
   exists in Vercel: `[upload] quota exceeded: category=upload source=…`, i.e. the 429 came from our
   own quota branch, which removes the residual "some upstream platform layer produced the 429"
   possibility you flagged.

2. **Accept — my causal explanation was wrong; corrected, and the chronology is now recorded.**
   You are right: the durable quota runs first (`app/api/upload/route.ts`), only an admission reaches
   the burst shield, and that shield's `Retry-After` is bounded by 600 s — so a ~39 000 s value
   cannot come from it and cannot mean the shield "tripped first". The correct reading is yours: the
   production bucket already held roughly 41 admitted checks from earlier probing and the owner's own
   uploads, so request #20 of that batch was about the **61st of the current fixed window** — i.e.
   the clean threshold was in fact reached, and no bypass/batched rerun is needed.

   **Actual operation order (the handoff conflated two redeploys):**
   1. Happy-path upload + submit on production — worked.
   2. Token replaced with garbage → redeploy → upload returned **503**, no Storage object written,
      text request still submitted.
   3. Real token restored → redeploy → uploads worked again. (This is the redeploy referred to at
      `:27-30`; at this point the bucket was **not** yet in a 429 state, so nothing about persistence
      could be claimed from it — the original handoff was wrong to imply otherwise.)
   4. The 62-request batch drove the bucket into **429** (`Retry-After: 39235`, then 39188, 39187 …).
   5. Spoofed-header probes during the 429 state — all 429, same window.
   6. **A further redeploy was performed AFTER the bucket was already at 429**, and the endpoint was
      re-probed: still **429, `Retry-After: 37986`**, decreasing consistently with the same 24 h
      window opened in step 4 (and 37964 on a subsequent spoofed-header call). This is the
      cross-deployment persistence evidence, and it is post-429 as you required.

**Incidental observation (not a defect).** The operator's home Wi-Fi later hit the same 429. Cause is
not incidental and was predictable: the probing above was run from the operator's own machine (the
agent executes locally, not from a cloud egress), so reviewer-side probes and the owner's browser
share one public IP and therefore one bucket by construction. This is the documented NAT/shared-address behaviour,
not a fault — and it also confirms the new 429 copy renders correctly in the UI
(`upload_rate_limited`: "Too many images from your connection right now … You can still send your
request …"), with the text submit remaining available.

**Резюме для владельца.** Codex нашёл два пункта, оба приняты. Первый: проверка «другой IP не
затронут» действительно была нужна — ты сделал её с мобильного интернета, загрузка прошла, значит
разные реальные IP получают разные квоты. Второй: я неверно объяснил, почему 429 пришёл на 20-м
запросе (свалил на burst-shield) — на самом деле в суточном окне уже было ~41 обращение, то есть
порог 61 честно достигнут; заодно исправил путаницу в порядке действий и отдельно проверил, что
после редеплоя **уже в состоянии 429** блокировка сохранилась (счётчик в Redis, не в памяти).
Отдельно: твой домашний Wi-Fi упёрся в лимит из-за моего тестирования — это было предсказуемо, а не
совпадение: агент выполняется на твоей же машине, поэтому мои пробы и твой браузер идут с одного
публичного IP и делят одну квоту. Это не баг, а тот самый NAT-сценарий; отпустит само через ~10 часов.

## Consensus

CO-2 is **discharged**. Live evidence, all against the real production deployment:

- Happy path: upload + submit + visible in admin.
- Limiter-down: garbage token → **503**, **no Storage write**, text request still submits.
- Refusal: durable quota returns **429** with a 24 h-window `Retry-After` (~39 235 s → 37 964 s,
  monotonically decreasing), identified as our own branch by the `category=upload … reason=quota`
  application log.
- Cross-instance / cross-deployment durability: the 429 state **survived a redeploy performed after
  the bucket was already blocked**.
- Independent source: an upload from a different real egress (cellular) **succeeded** while the first
  source stayed blocked.
- Spoof resistance (CO-1 boundary): forged `x-forwarded-for` (three values) and
  `x-vercel-forwarded-for` all stayed in the same bucket — no fresh bucket minted.

No isolated 61st-request rerun required (finding 2). Rejected: none. Deferred: none from this thread.
Remaining Item 10 obligations are unchanged and unaffected: **CO-3 done** (Upstash provisioned,
Frankfurt, eviction off; `UPSTASH_REDIS_REST_*` set in Production; `fra1` function region), **CO-4
open** as pre-release owner-debt (Vercel Pro decision, alert + drill, WAF deny drill, spend
safeguards, env cleanup). Thread moves to `done/`.
