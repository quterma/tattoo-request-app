# Research: Stage 6 Item 10 — `/api/upload` durable abuse control (mechanism + layer scope)

Status: `closed` · outcome filed 2026-07-22 (see `## Outcome`)
Researcher: codex
Requested by: `STRAT: Stage 6 — Item 10 abuse mitigation` (2026-07-21)

## Question

Item 10 is Stage 6's last un-cut item and a **pre-launch blocker**. It covers abuse mitigation on
both public write surfaces. The **submit honeypot** (`/api/request`, FS §4.5 — invisible, no CAPTCHA)
is free, needs no dependency, and is not in question here. This thread is only about the
**`/api/upload` durable control** and the shape of Item 10 around it.

A STRAT session was expected to lay out the mechanism options and get the owner's pick now. The owner
**redirected**: do not finalize the mechanism yet — Item 10 is wider than "which counter," and this
is a security-sensitive (public unauthenticated write surface) + money-sensitive (paid dependency,
spend risk) question that earns an independent, repo-aware pass before a decision. Hence this thread.

**A research thread never decides** (AI_CROSS_REVIEW.md — Research Threads). Give options with
trade-offs, each finding labelled by provenance (repo-verified / model-knowledge /
external-AI-unverified). The owner decides afterward.

### What a usable answer must cover

**Q1 — Verify the hole as described, against the repo.** Confirm or correct, reading the actual code:
- `clientSubmissionId` is **caller-chosen**, so an automated caller mints a fresh UUID per upload and
  never approaches the per-session object cap of 12 — it bounds an honest session, not a hostile one.
  (`app/api/upload/route.ts` — `UUID_V4` check + `MAX_OBJECTS_PER_SUBMISSION`;
  `countObjectsForSubmission` in the service layer.)
- The shipped limiter (`src/bff/rateLimit.ts`) is **in-memory / per-instance** on Vercel's
  multi-instance serverless runtime, so a distributed caller gets some multiple of the configured
  limit — not a bound. (The file's own docstring says as much; verify it is wired as the only
  cross-session control in the route.)
- The **concurrent-count race**: multiple in-flight uploads under one id can all read the same
  pre-upload count and pass the cap check before any write lands.

**Q2 — Check for partial existing protection already in the tree**, and state precisely what each
control *does* and *does not* bound: the `Content-Length` pre-check (`MAX_BODY_BYTES`), the MIME
allowlist + magic-byte sniff (`src/bff/validateFiles.ts` / `validateSingleFile`), the 4 MB per-file
size cap, and the private bucket with no public read path. The claim on record is that these bound
the *size* and *shape* of any single object but **nothing bounds the number of objects** an automated
caller can create. Confirm.

**Q3 — Item 10 is a layer, not one counter.** A passive limit is insufficient: a counter stops
threshold-crossing but does not diagnose or halt an attack, and does not by itself cap money if the
threshold is set weakly. Assess these four controls and, for each, say whether it is (a) required
pre-launch, (b) genuinely in Stage-6 Item 10 code scope, or (c) operational owner-debt (the Item 12
CO-5 pattern — a checkable owner action at/around deploy, tracked as a debt, not IMPL work):
- **durable rate-limit** — the non-caller-resettable counter (mechanism candidates in Q4);
- **alert / diagnostics** — so the owner learns of an upload spike (there is **none** today);
- **kill-switch** — a fast way to disable/throttle `/api/upload` under active abuse;
- **spend cap** — a hard money ceiling at Supabase / Vercel so cost is physically bounded even if a
  control fails or a threshold is mis-set.

Do not silently collapse Item 10 to one counter — that would repeat the Item 1 "10 MB limit" error
(a limit advertised that the platform could not honor).

**Q4 — Mechanism candidates for the durable limit, and the KV-vs-Upstash fork.** The three candidates
on record (PROJECT_BACKLOG.md — "Unbounded automated storage growth"; PROJECT_DECISIONS.md — "Stage 6
Upload-Flow Architecture" §1):
- **Upstash Redis** durable rate-limit (`@upstash/ratelimit`, separate account/env vars);
- **Vercel KV** durable rate-limit (same code shape, provisioned in the Vercel dashboard);
- **platform-level protection** (Vercel Firewall rate-limit rules / bot filtering — little/no
  in-repo code, config lives in the dashboard, not covered by `pnpm qg`).

Crucially, **KV vs Upstash is not an isolated choice — it forks on the Vercel Pro decision** that
belongs to `PROJECT_PRODUCTION_READINESS.md` (which already lists "exact Supabase/Vercel plan
capabilities and pricing" as open). Frame it as: **`if Pro → Vercel KV, else → Upstash`**. Reasoning
to check: commercial staging+production likely needs Pro (~$20/mo) regardless (Hobby forbids
commercial use; two protected environments); *if* Pro is taken anyway, KV stops being "pricier for
the same" — bundled, one vendor, one dashboard, no separate Upstash account; *if* Pro is not taken,
Upstash is genuinely ~$0 at this volume. The platform-protection candidate's real anti-bot tier is
itself Pro/Enterprise-gated — fold that into the same fork.

**Pricing/limits are current external facts and change** — do not answer them from model knowledge.
Per AI_CROSS_REVIEW.md — Research Threads, **delegate the pricing leg outward**: write the external
prompt yourself into `RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.request.md`, leave an empty
`.answer.md`, set `Status: awaiting-external`, and hand the owner the two links. Normalize whatever
returns into `## Findings` (label it *external-AI, unverified*); a raw external answer is never a
finding of its own. The pricing question, concretely: Upstash free-tier command allowance and paid
rate vs Vercel KV's included allowance and whether production KV pulls in Vercel Pro — evaluated at
**~5–20 uploads/week** real traffic (each upload ≈ 1–2 counter commands), plus a rough hostile-burst
figure.

### Constraints the answer must respect

- **FS §4.5** — abuse mitigation must be **invisible to legitimate visitors; no CAPTCHA**.
- **4 MB per-file ceiling** is fixed by Vercel's 4.5 MB Function request-body limit (PROJECT_DECISIONS
  — "Per-file size ceiling"); not in scope to revisit here.
- **Single-studio, ~5–20 real requests/week**; bucket is private, no public read path — exposure is
  **storage growth / cost, not data**.
- The **Vercel Pro / environments decision is owned by `PROJECT_PRODUCTION_READINESS.md`**, not by
  Item 10. This thread frames the fork; it does not decide Pro.
- Item 10 is **not folded into Item 3** (STAGE_6_IMPLEMENTATION_PLAN.md) — it stays a separate item.

### Read before answering

- `app/api/upload/route.ts`, `src/bff/rateLimit.ts`, `src/bff/validateFiles.ts` (via `@/bff`),
  `src/services` (`countObjectsForSubmission`, `uploadRequestFile`, `mintUploadHandle`),
  `src/config/index.ts` (env-var wiring pattern).
- PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture" §1 and §6 (the abuse model + honest
  orphan bound); the 2026-07-21 Item 10 reframing entry.
- PROJECT_BACKLOG.md — "Unbounded automated storage growth".
- `reviews/done/REVIEW_2026-07-14_stage6-item1-upload-flow.md` — Finding 3 (the origin of this hole).
- PROJECT_PRODUCTION_READINESS.md — the Vercel-plan/environments open decision (the Pro fork's owner).
- STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.5 (the honeypot half + the invisible/no-CAPTCHA constraint).

### What a usable answer produces

Not a verdict. For the owner to then decide: (1) the hole and existing controls verified or
corrected; (2) the four-control layer sorted into pre-launch / Stage-6-scope / owner-debt with
trade-offs; (3) the mechanism candidates with the KV/Upstash fork resolved *as a fork on Pro*, and
real pricing at this volume. On the owner's decision, a Claude session files `## Outcome` into
PROJECT_DECISIONS.md (mechanism chosen) and cuts the Item 10 task file; until then this stays open.

## Findings 1

### Provenance and confidence

- **Repo-verified** means I read the named file/current working tree. It establishes what this
  application does, not what a hosted vendor guarantees.
- **External-AI, unverified** means the fact came from the owner-carried answer in
  `RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.answer.md`. I normalized it and rejected
  conclusions that do not follow, but did not independently verify its vendor URLs.
- **Calculation from external-AI inputs, unverified** means the arithmetic is mine but its prices
  and allowances inherit that unverified provenance.
- No mechanism or threshold is selected below. Those are owner decisions.

### 1. Q1 — the hole is real; all three described paths verify

**Repo-verified — caller-resettable session cap.** `app/api/upload/route.ts:22-35` validates only
that `clientSubmissionId` has UUID-v4 syntax. The route does not issue, register, or otherwise bind
that identifier before accepting the file. It then counts Storage objects under the caller-provided
studio/session prefix (`app/api/upload/route.ts:99-107`; `src/services/storage.ts:142-161`). A bot can
therefore send a fresh syntactically valid UUID with every upload and keep every prefix below 12.
The encrypted handle is minted only *after* the object is stored (`app/api/upload/route.ts:107-125`)
and protects later adoption; an attacker filling Storage can simply discard it. The final-submit
caps in `src/bff/adoptUploads.ts:42-80` likewise protect a persisted request, not pre-submit objects
that are never adopted.

**Repo-verified — only cross-session application control is per-instance.** The upload route calls
`checkRateLimit("upload:" + clientIp, 20, 10 minutes)` before any other work
(`app/api/upload/route.ts:59-71`). `checkRateLimit` stores windows in a module-level `Map`
(`src/bff/rateLimit.ts:18-59`); there is no durable backend, package, or platform configuration in
the tree. The file's opening comment correctly admits the multi-instance limitation. No Upstash,
Redis, Vercel-WAF configuration, monitoring SDK, or alerting dependency exists in `package.json`.

**Repo-verified — count/upload is a TOCTOU race.** Each request lists the three category prefixes,
sums their current object counts, checks `< 12`, and only then performs a separately issued Storage
upload with a new UUID filename (`src/services/storage.ts:116-161`). There is no atomic reservation,
lock, unique quota row, or transaction spanning list and upload. Concurrent requests can all see the
same pre-upload count and all pass. This can overshoot 12 even for one identifier; fresh identifiers
make the hostile total unlimited regardless.

**Repo-verified — stale comments remain.** Although the route's declaration comment is now honest,
three nearby comments still contradict the decided pre-launch-blocker posture:
`src/bff/rateLimit.ts:7-10` says durable limiting is “gated on observed abuse” and calls the session
cap a “real ceiling”; `app/api/request/route.ts:23-24` repeats that ceiling claim; and
`app/api/upload/route.ts:101` calls the racy session check the “real defence against bucket-filling
replay.” These do not change runtime behavior, but should be corrected in the eventual Item 10 diff
so the withdrawn claim is not reintroduced from source comments.

### 2. Q2 — existing controls bound individual requests/objects, not hostile object count

| Control | Repo-verified effect | What it does **not** establish |
| --- | --- | --- |
| `Content-Length` pre-check | Before `formData()`, rejects a numeric header over `4 MiB + 256 KiB` (`app/api/upload/route.ts:37-40,73-78`). | Missing header becomes `0`; malformed values become `NaN`; both bypass this application pre-check. It is an early-rejection optimization, not the durable object-count control. The separate 4.5 MB Vercel edge limit is recorded in project docs but is a hosted-platform fact, not repo-verifiable. |
| Category + MIME allowlist | Accepts only the three configured categories and declared JPEG/PNG/WebP/HEIC/HEIF MIME values (`src/bff/validateFiles.ts:6-16,111-122`). | Declared MIME is attacker-controlled until the byte check; it does not cap request frequency or object count. |
| 4 MiB `File.size` check | Rejects the parsed file when its actual `File.size` exceeds 4 MiB (`src/features/request/config/form.ts:8-17`; `src/bff/validateFiles.ts:123-126`). | Does not cap cumulative bytes. At the limit, every successful hostile request may still add roughly 4 MiB. |
| Magic-byte check | Reads the file and compares its first 12 bytes with the declared format's signature/brand (`src/bff/validateFiles.ts:45-75,132-135`). This rejects simple MIME lies. | It is not a full decoder and does not prove the complete payload is a valid/decodable “real image.” A more precise claim is “allowed MIME plus matching leading signature,” not arbitrary-file exclusion. This distinction does not materially reduce the storage-cost exposure. |
| Per-session Storage count | Rejects after the visible count reaches 12 (`app/api/upload/route.ts:101-105`). | Caller resets it with a new UUID; concurrent calls can overshoot it. It bounds an honest sequential session only. |
| Adoption caps + opaque encrypted handle | A final request adopts at most 3/category and 9 total, only from handles minted for the same session (`src/bff/adoptUploads.ts:42-80`). Public upload responses contain a handle, not a path. | The object already exists before adoption. Ignoring the handle or abandoning the form leaves an orphan, so this does not constrain bucket filling. |
| Private Storage/read boundary | All repo Storage calls use the server-only service-role client (`src/services/supabase.ts`); public upload returns no path; signed URLs are created only while composing an admin detail after studio-scoped lookup (`src/services/requests.ts:62-93`). PROJECT_PRODUCTION_READINESS.md:78-89 records a live check that the bucket is private with zero public policies. | Privacy protects confidentiality/read access; it does not prevent the public route's service-role code from writing attacker-supplied, signature-bearing files. The live bucket state was not rechecked in this research turn. |

**Conclusion, repo-verified:** the record's core conclusion is correct: no current control bounds the
number of objects a hostile automated caller can cause the server to create. Two wording
corrections are needed: `Content-Length` is conditional rather than an unconditional body bound,
and the magic-byte test establishes a leading signature rather than full image validity.

### 3. Q3 — sort the four-control layer

The categories are not mutually exclusive: a control can be required pre-launch while its
implementation is operational owner-debt rather than code.

| Control | Required pre-launch? | Stage-6 Item 10 code scope? | Operational owner-debt? | Reason/trade-off |
| --- | --- | --- | --- | --- |
| Durable rate limit / quota | **Yes.** This is already the explicit blocker in PROJECT_BACKLOG.md:263-303 and PROJECT_PRODUCTION_READINESS.md:170-177. | **Mechanism-dependent.** Upstash/custom durable quota requires code, dependency/config, failure-mode tests, and route tests. A Vercel WAF rule is dashboard configuration, not a meaningful source-code implementation. | **Yes in either case:** provision credentials or publish/verify the WAF rule in the real production environment. | A durable *per-IP* counter fixes per-instance reset but still has no total bound against distributed sources. If “close the hole” means a physical object-count bound, the task must additionally choose a global circuit-breaker quota or explicitly accept the distributed residual risk. |
| Alert / diagnostics | **Yes, minimally:** the owner needs an actionable signal before a weak threshold becomes a bill. | **Normally no for this MVP.** The tree has only error logs and no monitoring/notification integration; adding an observability product would expand Stage 6's dependency and notification scope. | **Yes:** enable a vendor alert, choose the recipient/webhook, and test delivery. | External answer reports all-plan Vercel Firewall alerts/webhooks, while richer usage alerts need paid Observability Plus. An Upstash quota/budget email observes Redis use, not necessarily successful Storage writes. Alert source and trigger must be named. |
| Kill switch | **Yes:** an incident response that depends on editing code while an attack continues is not a fast control. | **Not necessarily.** A code env flag requires a deployment unless the chosen flag service is dynamic; no such service exists. | **Yes:** pre-create or document a Vercel WAF deny rule scoped to `POST /api/upload`, identify who can activate it, and live-test that it stops function/storage execution. | External answer reports dashboard WAF changes propagate without redeploy and can target method+path. Disabling Redis is a poor substitute unless the application has deliberately tested fail-closed behavior. |
| Spend safeguards | **Yes as configured safeguards and documented residual exposure; no vendor-wide exact ceiling can honestly be promised from the returned facts.** | **No.** Billing plans, budgets, quotas, and automatic actions are outside `pnpm qg` and application code. | **Yes:** configure and evidence the applicable Vercel, Upstash, and Supabase settings after plan/resource choice. | External answer says Vercel Spend Management is delayed and excludes Marketplace charges; Supabase's spend cap uses notification/grace/restriction rather than an exact Storage-ingress cutoff. Native Upstash PAYG documents the strongest per-database budget stop, but Marketplace availability is unresolved. Call this “spend safeguards,” not a guaranteed whole-system hard cap. |

**Scope consequence:** Item 10 should contain a bounded code diff only if a code-backed limiter/quota
is selected. Its completion obligations should separately point to checkable owner actions for
provisioning, alert delivery, the kill-switch drill, and spend settings. Those actions belong with
the production environment and cannot be certified by unit tests.

### 4. Q4 — external corrections invalidate the recorded Pro/KV fork

All facts in this subsection are **external-AI, unverified** unless marked otherwise.

1. **New Vercel KV no longer exists.** The answer says existing Vercel KV stores were migrated to
   Upstash Redis in December 2024 and new projects install Redis through Vercel Marketplace. Thus
   “Vercel KV vs Upstash” is not a technology/vendor choice in 2026.
2. **The remaining choice is provisioning/ownership:** Upstash Redis via Vercel Marketplace versus
   a native Upstash-managed database whose credentials are put into Vercel. Both normally use
   `@upstash/redis`; `@upstash/ratelimit` works with that client. The native path reportedly exposes
   at least one management API unavailable to third-party-created accounts. Exact Marketplace
   billing presentation and native budget availability were not established.
3. **Pro is a separate hosting-terms decision, not the Redis switch.** The answer says Marketplace
   storage integrations and WAF rate limiting are technically available on all Vercel plans, while
   Hobby is restricted to non-commercial personal use. If verified, this commercial studio needs
   Pro for terms compliance regardless of limiter, but Pro neither creates a distinct KV product nor
   bundles Redis usage as claimed in PROJECT_DECISIONS.md:2205-2218 and
   PROJECT_PRODUCTION_READINESS.md:127-135.
4. **The recorded anti-bot gating is also reported stale.** The answer says Vercel WAF rate limits
   and the managed bot ruleset are available on all plans, not only Pro/Enterprise. Bot protection
   uses a JavaScript challenge: no traditional CAPTCHA, but not a guaranteed zero-friction passive
   control. It should be optional defence-in-depth, not the sole invisible upload quota.

**External correction to the cost model.** The thread assumed 1–2 commands per upload. The returned
Upstash SDK cost table instead reports approximately 2 commands for an ordinary regional fixed-
window decision (3 for first state) and 4 for sliding window (5 for first state), before analytics,
deny-list, or dynamic-limit options. Rotating identifiers/windows tend toward the higher figures;
locally cached rejections can cost zero on a warm instance.

| Volume | Direct Upstash Free (reported 500k commands/month) | PAYG fixed window (~2 commands) | PAYG sliding window (~4 commands) |
| --- | --- | ---: | ---: |
| 80 attempts/month (20/week × 4) | $0 | ~$0.00032 | ~$0.00064 |
| 10,000 attempts | $0 | ~$0.04 | ~$0.08 |
| 100,000 attempts | $0 | ~$0.40 | ~$0.80 |
| 1,000,000 attempts | Quota fails after roughly 250k fixed-window or 125k sliding-window attempts, earlier with first-state/extra options | ~$4 | ~$8 |

**Calculation from external-AI inputs, unverified.** This uses the returned `$0.20/100k commands`.
Free-quota exhaustion is safe only if limiter unavailability is deliberately fail-closed; otherwise
the cheapest tier can remove the very control it was meant to provide. Fail-closed also means a
Redis outage/budget exhaustion blocks legitimate uploads, so the owner must choose that availability
trade rather than inherit it accidentally.

**External-AI, unverified — platform/storage scale.** The answer reports WAF rate limiting at
`$0.50/million allowed requests`, with mitigated requests not incurring ordinary CDN/Fast Data
Transfer, but allowed requests still reaching the function. At the maximum 4 MiB each, 10k/100k/1m
successful uploads retain roughly 39.1 GiB / 390.6 GiB / 3.81 TiB. Using its reported Supabase Pro
allowance (100 GB) and `$0.021/GB-month` overage gives a rough full-month storage overage of
`$0 / ~$6.10 / ~$79.93`, plus the base plan and other Vercel/Supabase usage. These are worst-case
retained-size calculations, not predicted bills. The answer did not quantify Vercel Function cost,
so total hostile-burst cost remains unresolved.

**External source trail, carried forward for later confirmation (all accessed 2026-07-21 per the
external answer; still unverified by Codex):** Vercel Redis replacement
<https://vercel.com/docs/redis> and Marketplace announcement
<https://vercel.com/changelog/upstash-joins-the-vercel-marketplace>; Marketplace storage
<https://vercel.com/docs/marketplace-storage>; Hobby/commercial terms
<https://vercel.com/docs/limits/fair-use-guidelines>; WAF rate limits, pricing, and observability
<https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting>,
<https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing>, and
<https://vercel.com/docs/vercel-firewall/firewall-observability>; bot protection
<https://vercel.com/docs/bot-management>; spend management
<https://vercel.com/docs/spend-management>; Upstash Redis pricing, limiter command costs, and budget
behavior <https://upstash.com/pricing/redis>,
<https://upstash.com/docs/redis/sdks/ratelimit-ts/costs>, and
<https://upstash.com/docs/common/account/faq>; Supabase pricing and spend-cap behavior
<https://supabase.com/pricing>, <https://supabase.com/docs/guides/platform/billing-on-supabase>, and
<https://supabase.com/docs/guides/platform/billing-faq>.

### 5. Mechanism options for the owner

#### Option A — Vercel WAF rate limit as the primary durable control

**External-AI, unverified:** a rule can match `POST /api/upload`, executes before the function, is
configured without an application dependency, and can count by IP or JA4. The answer reports fixed
windows, per-region counters, 40 rules on Pro, fast dashboard propagation, and blocked-request cost
advantages. This also supplies the cleanest endpoint kill switch and firewall event stream.

**Trade-offs:** configuration is outside versioned code and `pnpm qg`; the counter is regional; IP
or JA4 is source-scoped, so distributed/rotating sources remain unbounded in aggregate; shared/NAT
IP can group legitimate visitors. It closes the current *per-instance* defect but does not by itself
make the number of stored objects physically finite. A live configuration/export/evidence and an
alert/deny drill are therefore completion obligations, not assumed facts.

#### Option B — Upstash-backed application limiter

**Repo-verified implementation fit:** the existing BFF boundary already centralizes rate limiting,
the route already returns `429` with `Retry-After`, and `src/config/index.ts` has a fail-fast
server-only env pattern. A task could replace the upload route's `Map` lookup while leaving the
submit endpoint's separate honeypot work independent. It would add `@upstash/redis` and likely
`@upstash/ratelimit`, credentials, `.env.example` entries, and tests.

**External-AI, unverified trade-offs:** central Redis removes Vercel-instance reset and costs almost
nothing at normal volume. Marketplace and direct provisioning use the same Upstash technology, so
choose between them on account ownership, billing/budget controls, and operational convenience—not
on Vercel Pro. It still charges/checks attack attempts, adds a network dependency, and needs an
explicit fail-open/fail-closed policy. Before reusing `clientIpFromHeaders`, the task must verify
against deployed Vercel behavior that the chosen header is platform-controlled; the repo currently
trusts the first `x-forwarded-for` value (`src/bff/rateLimit.ts:68-75`), and repo inspection cannot
prove the external proxy sanitizes it.

#### Option C — layered edge per-source limit plus a global durable circuit breaker

**Repo-derived design option (not implemented):** WAF can absorb obvious per-source bursts before
the function, while a durable application counter keyed to a server constant (for example a
per-day global upload budget) can place an actual upper bound on uploads admitted across all source
identities. This is materially different from merely moving the existing per-IP `Map` to Redis.

**Trade-offs:** it is the only option here that directly converts “unbounded object count” into a
chosen numeric bound, but an attacker can exhaust the global budget and deny uploads to legitimate
visitors until reset or owner intervention. It also has two configuration surfaces and more tests.
The owner would need to choose whether that bounded-cost/availability trade is preferable to
accepting distributed residual risk with Option A or a per-IP-only Option B. Alert and kill-switch
controls remain required; the global counter does not diagnose the attack.

#### Bot protection — adjunct, not a quota mechanism

**External-AI, unverified:** Vercel's current managed bot ruleset uses a browser JavaScript challenge
and reportedly is available on all plans. It may be invisible to ordinary browsers, but can block
non-browser clients or create false/repeated challenges, especially with another reverse proxy in
front. It does not give the project a deterministic object or money ceiling. Use it only if the
owner accepts that no-CAPTCHA still permits an invisible JS challenge and a live legitimate-mobile
check succeeds.

### 6. Decisions and unresolved facts to carry forward

The owner needs to decide, after Claude processes these findings:

1. **Closure standard:** is a durable per-source limit with an accepted distributed residual risk
   sufficient, or must Item 10 include a global circuit breaker that truly bounds admitted objects?
2. **Primary mechanism:** WAF-only (Option A), Upstash application control (Option B), or the layered
   form (Option C).
3. If Upstash: Marketplace vs native account, fixed vs sliding window, failure mode, and whether a
   native budget is mandatory. This is **not** a Pro/KV fork.
4. Operational pre-launch obligations: alert channel and tested trigger; endpoint deny/throttle
   drill; Vercel spend action; Supabase spend-cap evidence; and Upstash budget/quota evidence if used.

The external answer left four facts unresolved and they must not be laundered into decisions:

- exact current Vercel Pro fixed/seat price (the repo's `~$20/mo` was not verified in the answer);
- exact Marketplace Upstash billing and whether its per-database hard budget is available;
- a distinct public price, if any, for Vercel managed bot protection;
- Vercel's exact sanitation/normalization of the IP header used by application code and IPv6
  aggregation behavior.

Finally, the obsolete `Vercel KV`, “bundled with Pro,” Pro-gated WAF/bot, and `if Pro → KV` claims
currently appear in PROJECT_DECISIONS.md, PROJECT_BACKLOG.md, PROJECT_PRODUCTION_READINESS.md,
STAGE_6_IMPLEMENTATION_PLAN.md, and the STRAT brief. They are **repo-verified as present but only
externally contradicted**. Claude should correct them only after accepting/confirming the external
facts; Codex does not edit those files from a research thread.

## Response 1

Status set to `awaiting-owner` — this is now a decision the owner makes on the findings. Below: what
is usable as-is, what changed from what we assumed, what must still be confirmed before it becomes a
decision, and a Russian summary.

### Usable now (repo-verified — safe to build on)

- **The hole is real and all three failure modes verify** (Findings §1): caller-resettable session
  cap, per-instance-only cross-session limiter, and a genuine TOCTOU list-then-upload race. The
  pre-launch-blocker posture stands.
- **Existing controls bound one object/request, not hostile object count** (§2). Two wording fixes
  we should carry into the eventual code/docs: the `Content-Length` check is *conditional* (a missing
  header → `0`, malformed → `NaN`, both bypass it), and the magic-byte test proves a *leading
  signature*, not full image validity. Neither materially reduces the storage-cost exposure.
- **Item 10 as a layer holds, with a sharper split** (§3): durable limit, alert, kill-switch, spend
  safeguards are each *required pre-launch*, but most of the layer is **operational owner-debt**
  (provisioning, alert delivery, a kill-switch drill, spend settings) — only a code-backed limiter is
  a bounded Stage-6 code diff. The Item 12 CO-5 pattern fits the rest.
- **Three stale in-code comments** (§1, last para) still call the session cap the "real ceiling"
  (`src/bff/rateLimit.ts:7-10`, `app/api/request/route.ts:23-24`, `app/api/upload/route.ts:101`) —
  fix in the Item 10 diff so the withdrawn claim isn't reintroduced from source.

### Changed from what we assumed — the reframing premise was partly wrong

- **"Vercel KV vs Upstash" is not a real fork** (§4). Vercel KV was migrated to Upstash (Dec 2024);
  new projects get Upstash Redis via Vercel Marketplace. So **"if Pro → KV, else → Upstash" is
  obsolete** — the real remaining choice is *Upstash via Marketplace vs native Upstash account*
  (billing/budget/ownership), which is **not a Pro decision at all**.
- **Pro is a separate, terms-only decision.** A commercial studio likely needs Pro for Hobby's
  non-commercial restriction regardless — but Pro does **not** bundle Redis or gate the limiter. The
  cross-dependency I wrote into PROJECT_PRODUCTION_READINESS.md (Pro "resolves" the mechanism fork) is
  therefore **false and must be corrected**.
- **WAF rate-limit + managed bot are reportedly all-plan, not Pro/Enterprise-gated** (§4.4) — so
  platform protection is a live option earlier than we recorded.
- **A per-source durable limit (Upstash *or* WAF) still has no total bound** against distributed
  sources (§5 A/B). Only a **global circuit-breaker quota** (Option C) converts "unbounded object
  count" into a chosen number — at the cost that an attacker can then deny uploads to real visitors
  until reset. This is a genuine new decision the reframing did not surface.

### Must be confirmed before it becomes a decision (do NOT launder these)

All pricing/product facts above are **external-AI, unverified** — Codex normalized them but did not
check the vendor URLs. Four facts were left explicitly unresolved (§6): exact Vercel Pro price (our
`~$20/mo` was never verified); whether Marketplace Upstash exposes a per-database hard budget; any
public price for Vercel managed bot protection; and Vercel's exact `x-forwarded-for` sanitation +
IPv6 aggregation (matters before reusing `clientIpFromHeaders` as a limiter key —
`src/bff/rateLimit.ts:68-75`). The stale KV/Pro claims across the five docs are corrected **only
after the owner accepts these external facts** — until then they stay flagged, not rewritten.

### The decisions now in front of the owner (§6)

1. **Closure standard** — is a durable *per-source* limit with accepted distributed residual risk
   enough, or must Item 10 include a **global circuit breaker** that truly bounds admitted objects
   (accepting the deny-legit-visitors-until-reset trade)?
2. **Primary mechanism** — WAF-only (A), Upstash app limiter (B), or layered edge + global breaker (C).
3. **If Upstash** — Marketplace vs native account, fixed vs sliding window, fail-open vs fail-closed.
   (Not a Pro/KV fork.)
4. **Operational pre-launch obligations** — alert channel + tested trigger, endpoint deny/throttle
   drill, Vercel spend action, Supabase spend-cap evidence, Upstash budget evidence if used.

### Русское резюме для владельца

**Ресерч подтвердил дыру — и опроверг одну из наших посылок.**

- **Дыра реальна** (проверено по коду): session-cap обходится сменой UUID, in-memory лимитер
  per-instance, плюс гонка «посчитал-загрузил». Пре-лонч блокер остаётся.
- **Существующие проверки** ограничивают один файл/запрос, но **не число объектов** у бота. Две
  мелкие правки формулировок (Content-Length — условная проверка; magic-byte — только сигнатура).
- **Item 10 как слой подтверждён**, но большая часть слоя (алерт, kill-switch, spend-cap,
  провижининг) — это **операционный долг владельца** (паттерн CO-5), а не код. Кодом реализуется
  только сам durable-лимитер.
- **Главное: развилка «Vercel KV vs Upstash» устарела.** Vercel KV влит в Upstash (дек 2024); KV
  как отдельного продукта нет. Значит **«if Pro → KV» — неверно**, и моя запись в
  PROJECT_PRODUCTION_READINESS про «Pro решает механизм» **ошибочна, её надо исправить**. Реальный
  выбор — Upstash через Marketplace vs нативный аккаунт Upstash (это НЕ про Pro). Pro всё равно
  вероятно нужен — но только из-за запрета Hobby на коммерцию, а не ради Redis.
- **Новое решение, которого мы не видели:** лимит per-IP (хоть Upstash, хоть WAF) **не даёт общего
  потолка** против распределённой атаки. Настоящий потолок числа объектов даёт только **глобальный
  circuit-breaker** (Option C) — но тогда атакующий может исчерпать общий бюджет и заблокировать
  загрузки реальным гостям до сброса. Это твой выбор: жёсткий потолок стоимости vs доступность.
- **Что ещё не проверено** (нельзя выдавать за факт): точная цена Vercel Pro, наличие жёсткого
  бюджета у Marketplace-Upstash, цена управляемой bot-защиты, и как Vercel санирует IP-заголовок.

**Твои решения (§6):** (1) стандарт закрытия — per-source с остаточным риском, или глобальный
circuit-breaker; (2) механизм — WAF-only / Upstash / слоёный; (3) если Upstash — Marketplace vs
нативный, fixed vs sliding, fail-open vs fail-closed; (4) операционные обязательства к лончу.

После твоего решения Claude-сессия: правит устаревшие KV/Pro-формулировки в пяти доках, вносит
`## Outcome` в PROJECT_DECISIONS.md и **режет task-файл Item 10**. До этого — тред открыт, ничего не
режется.

## Owner follow-up (round 2)

The owner engaged with the §6 decisions but did not settle a mechanism. His reasoning, verbatim in
substance: he does not feel equipped to pick between per-source and global-breaker himself, and
raised a genuinely different framing worth researching before he chooses —

> For an MVP with a **single user**, is heavy abuse protection even warranted yet? Maybe a simple
> durable throttle at a generous per-unit-of-time cap (comfortably above real request + testing
> volume, but below a dangerous flood) is sufficient *now*, and the serious hardening belongs many
> stages later — at actual market entry / SAAS, when the infrastructure may itself be different, so
> as not to bolt on premature patches.

He explicitly asked Codex to **weigh B vs C for the MVP stage** and give a reasoned recommendation.

### The question for this round

Give a provenance-labelled **recommendation between two closure standards, scoped to the current
reality** (single studio, not yet publicly launched, ~5–20 real requests/week, exposure is storage
cost not data), NOT to an eventual SAAS:

- **Option B — durable *per-source* throttle** (the owner's "simple generous cap done honestly"):
  fixes the per-instance defect, cheap, never blocks legitimate visitors, but has no aggregate bound
  against a distributed caller.
- **Option C — global circuit-breaker** that truly bounds admitted object count, accepting that a
  hostile burst can then deny uploads to real visitors until reset.

Address specifically, each finding labelled by provenance (repo-verified / model-knowledge /
external-AI-unverified):

1. **Is the owner's "B is enough for a single-user MVP, C at market entry" position sound**, given
   the actual threat model here (an unlaunched, private-bucket, low-volume single-studio site whose
   worst case is storage cost, not data loss)? Name what B genuinely leaves open at *this* stage and
   whether that residual is proportionate now — do not import a SAAS-scale threat model.
2. **What is the real forward-cost of choosing B now and C later** — is B a throwaway patch, or does
   a per-source durable limiter remain a component of C anyway (i.e. is this incremental, not
   rework)? This directly answers the owner's "don't bolt on premature patches" worry.
3. **Does B let the owner keep his "just stop + slow alert, react within a day" posture** without a
   global breaker — e.g. per-source throttle + panel-level spend safeguards + a WAF deny drill —
   and how far does that get him toward a de-facto cost bound without C's deny-legit-visitors trade?
4. **If B is recommended for now:** the minimal honest shape (per-IP vs per-session key given the
   `x-forwarded-for` caveat already flagged; fixed vs sliding window; fail-open vs fail-closed for a
   low-volume site) — enough to cut a bounded Item 10 task file, without pulling in the global-breaker
   design or the still-unverified hard-cap facts (those stay C's problem, deferred).

Do not re-litigate the whole layer — Findings 1 §3 already sorted it. This round is only: **B or C
for the MVP, why, and if B, the minimal shape.** Still a recommendation with trade-offs, not a
verdict — the owner decides.

Constraints unchanged (FS §4.5 invisible / no CAPTCHA; 4 MB ceiling; single-studio low volume;
Pro/environments owned by PROJECT_PRODUCTION_READINESS.md; the KV/Pro fork is dead per Findings 1
§4). The two unverified hard-cap facts (Upstash/Supabase physical spend stop) matter only if C is
recommended — do not block a B recommendation on them.

## Findings 2

### Recommendation in one sentence

**Recommendation — repo-grounded judgment, with model-knowledge threat assessment:** choose **B for
the current single-studio MVP**, implemented as a durable per-IP fixed-window quota, and defer C
behind an explicit trigger. This is proportionate only if the owner consciously accepts that a
distributed caller can still multiply the allowance and if the already-agreed alert + WAF deny
drill + spend safeguards ship with it. B is not a claim of a physical aggregate bound.

The recommendation is not “abuse cannot happen to a small site.” The endpoint will be public and
unauthenticated regardless of tenant count. It is instead: the remaining B-specific failure needs a
distributed/rotating-source attacker; the current consequence is bounded-size private orphan
storage plus service cost/availability, not read access or data loss; and the owner has a credible
one-day operational response. That is a proportionate accepted residual for this MVP, whereas C
turns any attacker able to consume the global allowance into an application-wide image-upload
outage by design.

### 1. Is “B now, C at a later trigger” sound for this MVP?

**Repo-verified context.** “Single user” should be read as **single tenant/studio**, not a private
single-user endpoint. `/api/upload` accepts unauthenticated public requests. Nevertheless, its blast
radius is unusually narrow:

- each successful object is at most 4 MiB (`src/features/request/config/form.ts:8-17`);
- upload responses expose an opaque handle rather than a Storage path
  (`app/api/upload/route.ts:107-125`);
- the service only creates signed read URLs through the admin detail path
  (`src/services/requests.ts:62-93`), and the production-readiness record says the bucket is private;
- all three upload categories are optional, and a failed file never blocks form submission
  (STAGE_6_FUNCTIONAL_SPECIFICATION.md:185-213; `src/features/request/lib/upload.ts:24-40`).

An abuse event can still create a bill, consume quotas, and degrade uploads; “cost, not data” does
not mean “no incident.” But a fail-closed upload control or emergency deny does not take down the
core text request: the visitor can remove/skip the failed optional image and submit the form.

**Model knowledge — threat assessment, not a verified probability.** Opportunistic single-source
scripts and accidental floods are materially easier than a sustained distributed attack that uses
many source addresses and sends signature-bearing multi-megabyte bodies. B directly addresses the
former. I cannot derive the probability of a motivated botnet from this repo, so the recommendation
does not call it zero; it treats the latter as an owner-accepted residual because this is one
low-volume studio, has no public object-read payoff, and has a manual response path.

**Correction to the option wording:** B does **not** guarantee it “never blocks legitimate
visitors.” Any IP-based control can group visitors behind carrier/office/Wi-Fi NAT, and an incorrect
or attacker-controlled IP header can collapse or evade buckets. A generous threshold makes false
blocking unlikely for the recorded volume; it cannot make it impossible. C has the stronger and
attacker-controllable failure mode: once the shared budget is exhausted, every visitor loses image
upload until reset, even from a fresh source.

**Why B is proportionate now.** C's marginal code is not huge, but it introduces a global product
policy before there is traffic evidence: one threshold becomes a deliberate site-wide availability
boundary, plus reset/override semantics. The hard-bound benefit matters most against the one threat
B intentionally leaves open—a distributed caller. For the present consequence and response model,
accepting that residual is reasonable. C should not be postponed merely to “some future stage”; it
should be attached to objective triggers (Finding 2 §6), so deferral is controlled rather than
forgetful.

### 2. What B actually leaves open, made concrete

**Repo-verified + arithmetic.** A per-IP quota bounds successful uploads from one observed source,
not the number of sources. With the concrete starting threshold recommended below—60 admitted
uploads per IP per 24-hour fixed window—the maximum stored payload per source/window is about
240 MiB. A fixed-window boundary can admit up to twice that in a short interval: about 480 MiB.

The distributed residual scales linearly and has no repo-owned ceiling:

| Distinct effective source buckets in one window | Maximum admitted objects | Maximum payload at 4 MiB each |
| ---: | ---: | ---: |
| 1 | 60 | 240 MiB |
| 10 | 600 | ~2.34 GiB |
| 100 | 6,000 | ~23.4 GiB |
| 1,000 | 60,000 | ~234 GiB |

This table is a bound on admitted file bytes for a chosen number of source buckets, not a bound on
an attacker: the attacker-controlled multiplier remains unbounded. It also excludes Vercel
Function/traffic and limiter-command cost. That is the precise residual the owner accepts with B.

**External-AI, unverified.** Findings 1 reports that WAF-denied traffic avoids ordinary downstream
CDN/transfer charges, Upstash command cost is tiny at these volumes, and Supabase Storage overage is
low per retained GB. Those facts make a one-day response more plausible, but do not create a hard
ceiling and must remain labelled unverified until confirmed.

### 3. B now is incremental, not a throwaway patch

**Repo-derived implementation assessment.** A code-backed B establishes the same primitives C
would need later:

1. one server-only durable Redis client and env/config boundary;
2. limiter invocation before `formData()` and before Storage;
3. a stable trusted-source identifier;
4. `429`/`Retry-After` handling and tests proving denied calls never touch Storage;
5. a chosen fail behavior when the durable store is unavailable;
6. deployment provisioning and alert/kill-switch operations.

C later adds a *second limiter decision* keyed by a server constant (for example,
`upload:global`) and a separate global threshold. The per-IP limiter remains useful in front of it:
it stops one source from consuming the whole shared allowance and preserves source-level
diagnostics. No B component needs to be removed. Threshold/config changes are expected tuning, not
architectural rework.

**Model knowledge — design judgment.** This is a normal defence-in-depth progression: source quota
first, aggregate circuit breaker when exposure or traffic justifies accepting its global
availability trade. If the future SaaS architecture replaces Upstash or Vercel, the small limiter
adapter may be replaced, but the source-quota concept and tests are still valid. Avoiding B now would
not protect against future rework; it would simply leave the known per-instance hole open.

**Important mechanism consequence.** To keep that incremental path, B should be the code-backed
Upstash form analyzed in Findings 1 Option B, while WAF remains the emergency deny/burst layer. A
WAF-only B would still remain useful at the edge later, but adding C would then introduce the Redis
application boundary for the first time. Marketplace versus native Upstash affects provisioning,
not this code shape; the unresolved Marketplace hard-budget fact is not needed to implement B.

### 4. Can “slow alert, react within a day” work without C?

**Recommendation — mixed provenance:** yes, as an operational posture, not as a mathematical cost
bound. It is credible only as the complete chain below:

1. **Repo/code:** B rejects over-quota requests before `formData()` and Storage. The current route
   ordering already gives the correct insertion point (`app/api/upload/route.ts:59-78`).
2. **External-AI, unverified:** a Vercel Firewall alert/webhook provides the slow signal, and a
   method+path WAF Deny rule can stop `POST /api/upload` without deployment.
3. **Owner operation:** the alert has a real recipient, the deny action is documented, and the
   owner has performed one production-like drill. “A dashboard exists” is not a response plan.
4. **External-AI, unverified:** Vercel/Supabase/Upstash spend settings provide delayed backstops,
   with the limitations already recorded in Findings 1; none is represented as a whole-system hard
   invoice cap.

This produces a **de-facto response bound in time**—owner aims to stop the endpoint within one
day—not a bound in bytes or money. Cost before reaction remains `number of effective sources ×
per-source allowance`, plus rejected-request platform/limiter cost. If the owner cannot reliably
respond within that window (travel, Sabbath/holiday, notification failure), the rationale for B
weakens and C becomes proportionate sooner.

The WAF deny drill is more important than an application env kill switch: no dynamic flag service
exists in the repo, while an env change normally implies a redeploy. Redis shutdown is also not a
clean incident switch unless fail-closed behavior is deliberate and tested.

### 5. Minimal honest B shape for the Item 10 task

#### Key: per-IP, never per-session

**Repo-verified.** `clientSubmissionId` is caller-generated and therefore invalid as the durable
quota key. Use the platform-derived client IP (or a stable privacy-preserving derivative of it) as
the source key. Keep the studio/deployment in the prefix so staging and production resources cannot
collide if credentials are ever shared.

**Required completion obligation, external boundary:** `src/bff/rateLimit.ts:68-75` currently trusts
the first `x-forwarded-for` hop. The repo cannot prove Vercel overwrites/sanitizes that value. The
task must either (a) establish the correct Vercel-controlled header from current official docs and
implement it, then live-test spoof attempts, or (b) use an edge-owned source key. B is not complete
if a caller can mint a fresh header value just as it mints a fresh UUID. Missing/invalid source data
should collapse to one shared `unknown` bucket, not silently disable limiting.

#### Algorithm and threshold: fixed 60 per 24 hours per IP

**Recommendation — repo-derived threshold, owner may choose another explicitly:** use a durable
fixed window, **60 admitted uploads per effective IP per 24 hours**.

- one valid request displays at most 9 images; the server's honest-session slack cap is 12;
- 60 permits five cap-sized sessions or more than six normal max-image requests from the same IP in
  one day, far above the site's recorded 5–20 requests *per week*;
- fixed-window accounting is simpler and cheaper than sliding; its known boundary burst is accepted
  and quantified above (maximum 120 objects/~480 MiB around a boundary for one source);
- keep the existing 20/10-minute in-memory limiter only as a cheap best-effort burst shield, clearly
  documented as non-security-boundary. It can be retuned upward if shared-IP false positives appear.

This threshold should be a named server constant with a rationale and tests, not a required env var:
changing it is a code/behavior decision, whereas credentials belong in env. If the owner wants
runtime tuning without deployment, that is a separate configuration-system choice and not minimal
B.

#### Failure policy: fail closed for upload, with a retryable response

**Repo-verified product fit + recommendation.** If the durable limiter is unavailable or its free
quota/budget is exhausted, do **not** fall back to the in-memory limiter and continue writing. Fail
closed for `/api/upload`, returning a deliberate 5xx/`503` retryable response; return `429` plus
`Retry-After` only when the caller actually exceeded the rate quota.

This availability trade is proportionate here because `xhrUpload` already treats `429` and every
5xx as retryable transport failure (`src/features/request/lib/upload.ts:24-40`), the per-file UI
shows Retry/Remove (`src/features/request/ui/UploadCategoryInput.tsx:85-95,154-170`), and failed
optional images do not block final submission (FS §4.5). The task should add a rate-limit-specific
message if the current generic “images could not be attached; press Retry” would encourage immediate
retries throughout a 24-hour window; it must not claim that Retry will succeed before reset.

#### Bounded code/test surface

The Item 10 task can stay narrow:

- add the server-only Upstash client/limiter dependency and explicit env wiring;
- add an upload-specific durable fixed-window primitive without converting `/api/request` to Redis;
- call it before body parsing/validation/Storage;
- preserve the current local limiter as an optional speed bump, not a fallback security boundary;
- test allowed, denied (`429` + `Retry-After`), independent-IP, shared fallback-key, store-failure
  (`503`, no Storage), and “denied never calls `formData()`/count/upload” paths;
- fix the three stale “real ceiling / gated on observed abuse” comments identified in Findings 1;
- record the header-trust live check, alert delivery, WAF deny drill, provisioning, and spend
  settings as completion obligations/owner debt rather than pretending `pnpm qg` verifies them.

No global counter, global reset UI/runbook, bot challenge, or hard-spend-cap claim belongs in this B
diff.

### 6. Controlled deferral of C

**Recommendation — owner decision required:** defer C, but file triggers now. Re-open the global
circuit-breaker decision at the earliest of:

- a verified distributed/multi-source upload spike or repeated per-IP limit hits across sources;
- Storage growth, limiter usage, or platform cost crossing an owner-chosen operating threshold;
- the owner no longer being able to guarantee the alert-to-deny response window;
- public marketing materially expanding reach beyond the present Instagram-led single-studio flow;
- multi-studio/SaaS work, where one tenant's attack can affect others.

At that point C is an additive second quota, not a redesign. The eventual global threshold should
be chosen from observed legitimate traffic and response time, not guessed now.

### Owner-facing trade-off summary

| Choice | What it honestly buys now | Residual/failure mode | Forward cost |
| --- | --- | --- | --- |
| **B — recommended for MVP** | Durable cross-instance source quota; stops naive/single-source sustained storage growth; no shared global budget for an attacker to exhaust | Distributed sources multiply allowance without bound; shared-IP/header mistakes can block or evade; relies on alert-to-deny response | Retained as first layer of C; C later is one additional global limiter + policy/tests |
| **C — valid if owner prioritizes a numeric bound now** | Chosen aggregate bound on admitted objects even across distributed sources | Attacker can deliberately exhaust it and disable images for every visitor until reset; requires threshold/reset policy before traffic evidence | Slightly more code now; avoids the accepted distributed residual |

The owner can still choose C. My recommendation for B rests on present consequence, optional-upload
fallback, low volume, and a tested one-day operational response—not on the studio being too small to
be attacked.

## Response 2

Status → `awaiting-owner`. Findings 2 answers the round-2 question cleanly and, importantly,
**validates the owner's own instinct**: B now, C behind explicit triggers, and B is *incremental*
toward C — not a throwaway patch. This directly resolves the "don't bolt on premature patches" worry
that made the owner hesitate.

### Usable now (safe to build a decision on)

- **Recommendation = B for the MVP** (durable per-IP fixed-window quota), C deferred behind named
  triggers (Findings 2 §6). Grounded in the actual threat model (unlaunched, private bucket, low
  volume, worst case = cost not data), not a SAAS one.
- **B is incremental, not throwaway** (§3, repo-derived): every primitive B builds — durable Redis
  client, limiter-before-`formData()`, `429`/`Retry-After`, fail-mode, provisioning — is *reused* by
  C. C later just adds a *second* limiter keyed `upload:global`. No B component is removed. This is
  the key answer to the owner's premature-patch worry: **choosing B now costs nothing forward.**
- **The owner's "stop + slow alert, react in a day" posture works with B** (§4) — but only as the
  full chain: B rejects over-quota before Storage + a WAF deny rule (method+path, no redeploy) + a
  real alert recipient + **a drill the owner has actually run once**. "A dashboard exists" ≠ a
  response plan. This gives a *time* bound (react within a day), not a *bytes/money* bound.
- **Minimal honest B shape is specified** (§5), enough to cut a bounded task file: per-IP key (never
  per-session — `clientSubmissionId` is caller-chosen); durable fixed window; suggested **60 admitted
  uploads / IP / 24h** (vs 5–20 real requests *per week* — huge headroom); **fail-closed** for upload
  (a `503` retryable, never fall back to the leaky in-memory limiter); keep the existing 20/10-min
  limiter only as a documented non-security speed bump.

### Corrections to my earlier framing (Codex flagged, I accept)

- **B does NOT "never block legitimate visitors"** — I oversold it. Any IP key can group visitors
  behind carrier/office NAT; a generous threshold makes false blocks *unlikely*, not impossible. C's
  failure mode is still worse (attacker exhausts the shared budget → everyone loses upload).
- **"Single user" = single *studio/tenant*, not a private endpoint.** `/api/upload` is public and
  unauthenticated regardless of tenant count — the proportionality argument is about *blast radius*
  (narrow: 4 MB objects, private bucket, optional images that don't block submit), not about the site
  being "too small to attack."

### Must be confirmed during implementation (completion obligations, not blockers to deciding B)

- **The `x-forwarded-for` trust gap is a real must-fix** (§5, repo-verified): `src/bff/rateLimit.ts:68-75`
  trusts the first hop; the repo can't prove Vercel sanitizes it. If a caller can mint a fresh header
  like it mints a fresh UUID, B is defeated. The task must either establish the correct
  Vercel-controlled header from current docs + live-test spoofing, or use an edge-owned key. This is
  a task completion obligation, not a reason to delay the B decision.
- Alert delivery, WAF deny drill, provisioning, spend settings = owner-debt (CO-5 pattern), not
  `pnpm qg`-certifiable.
- The two unverified hard-cap facts (Upstash/Supabase physical stop) are **C's problem** — not needed
  for B. Correctly deferred.

### What the owner decides now

Only one real decision remains, plus two confirmations:

1. **Accept B for the MVP** (per-IP durable fixed-window quota) with C deferred behind the §6
   triggers — **the recommended path** — or override to C now.
2. **Confirm the starting threshold** — 60/IP/24h as recommended, or name another number.
3. **Confirm the fail-closed trade** — when the durable store is down, `/api/upload` returns a
   retryable `503` and does *not* keep writing (images become temporarily unavailable, but the text
   request still submits — FS §4.5). This is the right call for a private low-volume site; just
   confirm you accept it.

On the owner's yes, a Claude session: (a) corrects the dead KV/Pro-fork framing across the five docs
(Findings 1 §4 — Vercel KV no longer exists), (b) files the `## Outcome` into PROJECT_DECISIONS.md
(B chosen, C's triggers recorded), and (c) **cuts the Item 10 task file** with the §5 shape + the
completion obligations above.

### Русское резюме для владельца

**Codex рекомендует твой же вариант — и снял твоё главное сомнение.**

- **Рекомендация: B для MVP** — простой durable-лимит на IP (60 загрузок с одного IP в сутки — при
  твоих 5–20 заявках в *неделю* это огромный запас), а жёсткий C — позже, по чётким триггерам (§6:
  распределённая атака, рост трат выше порога, если больше не сможешь реагировать за день, выход на
  рынок/SAAS).
- **Твоё «не лепить наперёд» — снято.** Codex показал (по коду): B **не выбрасывается** при переходе
  к C. Всё, что строит B (общий счётчик, лимит до записи в хранилище, 429, поведение при сбое),
  **переиспользуется** в C — C потом просто добавляет *второй* глобальный счётчик. То есть выбрать B
  сейчас — это шаг к C, а не заплатка мимо.
- **Твоя логика «просто стоп + алерт, реагирую за день» работает** — но только целиком: B режет до
  хранилища + правило WAF на `POST /api/upload` (без передеплоя) + реальный получатель алерта + **ты
  один раз прогнал это учебно**. Это даёт потолок *по времени реакции*, не по деньгам.
- **Честная поправка:** я раньше сказал «B никогда не мешает клиентам» — это преувеличение. За одним
  IP могут сидеть несколько людей (офис/оператор), при большом пороге ложная блокировка *маловероятна*,
  но не невозможна. У C отказ хуже: атакующий исчерпал общий бюджет → загрузка отваливается у всех.

**Что решить (по сути одно + два подтверждения):**
1. **Берём B для MVP** (рекомендация) — или всё же C сейчас?
2. **Порог** — 60/IP/сутки, или другое число?
3. **Подтверди fail-closed:** если счётчик недоступен — `/api/upload` отвечает «повторите позже»
   (`503`) и НЕ пишет дальше; картинки временно недоступны, но текстовая заявка всё равно
   отправляется. Для приватного малонагруженного сайта это правильно — просто подтверди.

После твоего «да»: правлю мёртвую KV/Pro-развилку в пяти доках, вношу `## Outcome` (B выбран, триггеры
C записаны) и **режу task-файл Item 10** по форме из §5. Один must-fix уже зашит в задачу: проверить,
можно ли доверять IP-заголовку на Vercel (иначе бот подделает IP как подделывает UUID) — это внутри
задачи, не блокер решения.

## Outcome

**Owner decided 2026-07-22.** Recommendation accepted.

1. **Item 10 `/api/upload` control = Option B** — a durable per-IP fixed-window quota (Upstash-backed
   application limiter, Findings 1 Option B / Findings 2 §5). Option C (global circuit-breaker) is
   **deferred behind the Findings 2 §6 triggers**, not scheduled to a stage.
2. **Threshold = 60 admitted uploads / IP / 24h**, as a named server constant (not an env var) with
   rationale + tests. Retunable later without a migration.
3. **Fail-closed confirmed** — if the durable limiter is unavailable, `/api/upload` returns a
   retryable `503` and does **not** write; images become temporarily unavailable but the text request
   still submits (FS §4.5). No fallback to the leaky in-memory limiter.
4. The **submit honeypot** half (`/api/request`, FS §4.5) is unchanged — free, no dependency, part of
   the same Item 10 task.

**Landed in durable docs (this closes the thread):**

- **PROJECT_DECISIONS.md** — the reframing entry's §2 rewritten from the dead "if Pro → KV" fork to
  the B decision + C's deferral triggers (this is the owner-decision case that lets the mechanism be
  recorded here, per Research-Thread rules).
- **Task file cut** — `docs/project/tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md`, `status: ready`,
  carrying the Findings 2 §5 shape (per-IP key, fixed 60/24h, fail-closed) + honeypot, and the
  completion obligations (the `x-forwarded-for` trust live-check; alert delivery; WAF deny drill;
  provisioning; spend settings as owner-debt; fixing the three stale in-code "real ceiling" comments).
- **Stale KV/Pro claims corrected** across PROJECT_PRODUCTION_READINESS.md, PROJECT_BACKLOG.md,
  STAGE_6_IMPLEMENTATION_PLAN.md, and the STRAT brief (Findings 1 §4 — Vercel KV no longer exists;
  Pro is a terms-only decision, not the limiter fork).
- **PROJECT_STAGE_LOG.md** — dated entry for the decision + task cut.

Both delegation buffers (`.request.md`, `.answer.md`) deleted on close; their content is folded into
Findings 1/2. Thread moved to `docs/project/research/done/`.
