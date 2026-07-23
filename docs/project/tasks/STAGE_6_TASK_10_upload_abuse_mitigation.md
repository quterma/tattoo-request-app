# Task: Stage 6 — Abuse mitigation, both public endpoints (Item 10)

## Status

`done` (code + live verification) · created 2026-07-22 · implemented 2026-07-22 · live-verified
2026-07-23 · decided via `research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md`
(closed 2026-07-22) · PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation"

Commits: `d5e8ae3` (implementation), `9da4433` (post-consensus amend review).
Reviews (all `consensus`, in `reviews/done/`): `REVIEW_2026-07-22_stage6-item10-upload-abuse-mitigation.md`
(5 should-fix + 1 nit, all applied), `REVIEW_2026-07-22_stage6-item10-postconsensus-amend.md`
(no findings), `REVIEW_2026-07-23_stage6-item10-co2-live-verification.md` (2 should-fix, both
discharged with new live evidence).

**CO-4 remains open as pre-release owner-debt** — tracked in `STAGE_6_STRAT_BRIEF.md` → "Owner
pre-deploy actions" and PROJECT_PRODUCTION_READINESS.md. It does not gate this task's code, but the
launch blocker in PROJECT_PRODUCTION_READINESS.md is not fully closed until CO-4 is done.

## Execution

- Executor: `claude` or `codex`. **Not decision-free** — touches a public unauthenticated write
  surface + adds a paid dependency; the shape is fully specified below, but the `x-forwarded-for`
  live-check (CO-1) requires judgment against real Vercel behavior. If delegated: `Executor: codex`,
  `Reviewer: claude`.
- Baseline: **the commit that introduces this task file** — executor derives it; stops only if its
  Allowed Write Surface moved/dirtied.
- Reviewer: `claude` + **mandatory independent Codex cross-review to consensus** (touches source +
  a security boundary — AI_CROSS_REVIEW.md).
- Allowed Write Surface: `src/bff/rateLimit.ts` (and/or a new `src/bff/uploadQuota.ts`),
  `app/api/upload/route.ts`, `app/api/request/route.ts` (honeypot field only), `src/bff/request.ts`
  or the request-validation module (honeypot check), `src/config/index.ts` (new env wiring),
  `.env.example`, `package.json` + lockfile (the Upstash dependency), the request-form UI only if the
  honeypot needs a hidden field (`src/features/request/ui/RequestForm.tsx`), tests for all the above,
  PROJECT_* reporting docs.
- May touch dependencies: **yes** (Upstash — pre-approved by the decision). Migrations / generated
  files: **no**. Shared docs beyond reporting: no.

## How to run (session settings)

- Model: Sonnet or Opus (security-sensitive; not trivial). Or delegate to Codex.
- Start mode: Plan mode. The plan must state the `x-forwarded-for` decision (CO-1) explicitly before
  coding.

## Context (read before any work)

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **The decision this implements:** PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation"
   (§2 mechanism, §3 obligations). The full option analysis + provenance is in
   `research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md` (Findings 1 §1–2 verify the
   hole; Findings 2 §5 is the exact B shape this task follows).
3. **The hole (verified):** `/api/upload` is public + unauthenticated. `clientSubmissionId` is
   caller-chosen (a bot mints a fresh UUID per upload → the 12-object session cap bounds only an
   honest session), and `src/bff/rateLimit.ts` is in-memory / per-instance on Vercel (not a
   cross-instance bound). Exposure is storage growth / cost, not data (bucket private, 4 MB cap,
   real-image-only). This is the PROJECT_BACKLOG.md "Unbounded automated storage growth" blocker.
4. **Shipped code — read it:**
   - `app/api/upload/route.ts` — the endpoint; current ordering (rate-limit → Content-Length →
     `formData()` → validate → count → upload → mint handle) is the correct insertion point; the
     durable check goes first, before `formData()`.
   - `src/bff/rateLimit.ts` — the in-memory limiter + `clientIpFromHeaders` (the `x-forwarded-for`
     trust is the CO-1 must-fix); the three stale "real ceiling" comments to fix live here + in
     `app/api/request/route.ts` + `app/api/upload/route.ts`.
   - `src/config/index.ts` — the `requireEnv` server-only env pattern to extend for Upstash creds.
   - `src/features/request/lib/upload.ts` — `xhrUpload` already treats `429`/5xx as retryable
     transport failure; `UploadCategoryInput.tsx` shows Retry/Remove — so a fail-closed `503` degrades
     gracefully (image marked failed, retryable, does not block submit — FS §4.5).
   - `app/api/request/route.ts` + the request validation — where the submit honeypot field is checked.

## Goal

Close the pre-launch storage-abuse hole on `/api/upload` with a **durable, non-caller-resettable**
per-IP quota, and add an invisible honeypot to the submit endpoint — both invisible to legitimate
visitors, no CAPTCHA (FS §4.5).

## Scope

### A. `/api/upload` durable per-IP quota (Option B)

1. Add the Upstash Redis client + `@upstash/ratelimit` (server-only), with credentials wired through
   `src/config/index.ts`'s `requireEnv` pattern and documented in `.env.example`. Marketplace vs
   native Upstash is a provisioning choice (owner) — it does not change this code shape.
2. A **durable fixed-window** limiter: **60 admitted uploads / IP / 24h**, a named server constant
   with rationale + tests (NOT an env var — changing it is a code/behavior decision; creds are env).
   Keyed on the platform-derived client IP, prefixed with studio/deployment so staging/production
   cannot collide. Missing/invalid source → one shared `unknown` bucket, never silently no-limit.
3. Called **first in the route, before `formData()`**. On breach: `429` + `Retry-After` (existing
   shape). On limiter **unavailable**: **fail-closed** — a retryable `503`, and **do not** write and
   **do not** fall back to the in-memory limiter. Add a rate-limit-specific message if the current
   generic "images could not be attached; press Retry" would wrongly invite immediate retries across
   a 24h window — must not claim Retry will succeed before reset.
4. Keep the existing 20/10-min in-memory limiter only as a documented **non-security best-effort
   burst shield** (not a fallback boundary). Fix its + the two other stale "real ceiling" comments.
5. **Observability (owner ask):** structured `console.warn` on every 429 and 503 — source key,
   category, reason — visible in Vercel logs. No new code layer; the active email/webhook alert is a
   dashboard Firewall/Log alert (owner-debt, CO-4). **Do NOT** write a synthetic admin request row —
   explicitly rejected (same storage/row growth the control exists to stop; new public DB write path).

### B. `/api/request` submit honeypot

6. A hidden form field a human never fills; a filled value on the server → silently reject as spam
   (a normal-looking success or a benign error — do not reveal it is a honeypot). Invisible, no
   CAPTCHA (FS §4.5). No dependency.

## Out of Scope

- **Option C (global circuit-breaker)** — deferred behind the triggers in PROJECT_DECISIONS.md §2 /
  research Findings 2 §6. No global counter, global reset UI/runbook, or hard-spend-cap *claim* here.
- Bot-challenge / WAF *code* (WAF is dashboard owner-debt, not code).
- Orphaned-object cleanup (separate PROJECT_BACKLOG.md item).
- Any change to the 4 MB ceiling, MIME/magic-byte checks, handle model, or adoption caps.

## Completion obligations

```text
- CO-1 — MUST-FIX, external boundary: the durable quota key must be a trustworthy source identifier.
  Disposition: **DONE.** Resolved in-plan from current Vercel request-headers docs (2025-12-13):
  Vercel overwrites `x-forwarded-for` at the edge and does not forward external IPs ("to prevent IP
  spoofing"); a custom XFF needs the Enterprise Trusted Proxy add-on, unused here. `clientIpFromHeaders`
  prefers `x-vercel-forwarded-for` (not overwritable by a proxy on top of Vercel), then XFF first hop,
  then `x-real-ip`, then `unknown`; the token must be IPv4/IPv6-shaped, so a malformed value collapses
  to the shared `unknown` bucket instead of minting a per-value key. **Live-verified 2026-07-23:** with
  a source already at 429, forged `x-forwarded-for` (1.1.1.1, 8.8.8.8, 203.0.113.77) and forged
  `x-vercel-forwarded-for` (198.51.100.5) all returned the SAME 429 with the same window — no fresh
  bucket minted.
- CO-2 — Live: confirm the durable limiter shares state across instances; the 61st upload from one IP
  in 24h is refused; an independent IP is unaffected; a limiter-down condition yields 503 with NO
  storage write. Disposition: **DONE — live-verified 2026-07-23 against production**
  (`reviews/done/REVIEW_2026-07-23_stage6-item10-co2-live-verification.md`, consensus):
  - happy path: upload + submit + visible in admin;
  - limiter-down: garbage `UPSTASH_REDIS_REST_TOKEN` + redeploy → **503**, **no Storage object
    written**, text request still submitted;
  - refusal: **429** with a 24h-window `Retry-After` (39235 → 37964 s, monotonically decreasing),
    identified as our own branch by the `[upload] quota exceeded: category=upload source=… reason=quota`
    log. The 429 surfaced at batch request #20 because the window already held ~41 admitted checks —
    i.e. ~the 61st of the window. (The burst shield cannot produce this: its window is 10 min, so its
    `Retry-After` is bounded by 600 s.)
  - cross-instance/deployment durability: the 429 state **survived a redeploy performed after the
    bucket was already blocked** (counter lives in Redis, not process memory);
  - independent source: an upload from a different real egress (phone on cellular, Wi-Fi off)
    **succeeded** while the first source stayed blocked.
- CO-3 — New dependency + env vars. Disposition: **DONE.** `@upstash/ratelimit` + `@upstash/redis`
  added, documented in `.env.example`, wired via `requireEnv`. Provisioned 2026-07-23: Upstash Redis
  (Free, **Frankfurt**, eviction **OFF** — eviction would silently drop a live counter),
  `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` set in Vercel **Production**. Vercel Function
  Region moved to **fra1** to sit with Redis (Supabase is `eu-north-1`). Note: the Marketplace
  integration also auto-created unused `KV_*` / `REDIS_URL` vars — left in place deliberately (see
  pre-release cleanup below). Preview env intentionally not set: the project has no preview deploys in
  practice and `UPLOAD_TOKEN_SECRET` follows the same existing pattern.
- CO-4 — Owner-debt (deploy-time, NOT certified by pnpm qg): (1) a Vercel Firewall/Log alert on the
  429/503 signal, with a real recipient, tested once; (2) a WAF method+path Deny drill on
  POST /api/upload (the real kill-switch — dashboard, no redeploy), performed once; (3) Upstash
  provisioning; (4) Vercel + Supabase spend safeguards configured. Disposition: **(3) DONE** (see
  CO-3); **(1), (2), (4) OPEN — deferred to pre-release by owner decision 2026-07-23.** Rationale:
  Vercel alerts and WAF require **Pro**, which the owner will decide on anyway before launch (Hobby
  forbids commercial use); until the site is publicly announced the deployment is effectively a test
  deployment, so a throwaway external-monitor workaround was explicitly rejected (it cannot see a 429
  spike, only total outage, and would itself consume quota). Tracked in `STAGE_6_STRAT_BRIEF.md` →
  "Owner pre-deploy actions" and PROJECT_PRODUCTION_READINESS.md.
- CO-5 — Stale comments corrected so the withdrawn claim is not reintroduced from source.
  Disposition: **DONE.** All three named comments fixed, plus a fourth the first pass missed (the
  inline "real defence against bucket-filling replay" at the per-session count check) and the
  `rateLimit.ts` ordering claim ("in front of" → runs after the durable check) — both caught by the
  Codex cross-review.
```

A green `pnpm qg` certifies the code tree, not the deployed control — CO-1/CO-2/CO-4 need the real
boundary (AI_TASK_PROTOCOL.md — Completion Obligations).

## Follow-ups raised during live verification (2026-07-23) — NOT part of this task

Observed by the owner while running CO-2; filed here so they are not lost. Neither blocks this task.

1. **503 upload copy is not actionable enough (owner observation).** During the fail-closed test the
   UI showed `upload_invalid`: *"Your images could not be attached. Press Retry on each one, then send
   again — nothing else you typed was lost."* It reads as a hard error and does **not** tell the
   visitor the one thing that matters — the request **can be submitted without images**. The 429 path
   already got a clearer message in this task (`upload_rate_limited`); the 503/transient path did not.
   Rare, but it hits every visitor at once when the store is down. Needs a copy change checked against
   FS §4.5 (and the PRD if wording is normative) — hence a task, not a hotfix.
2. **Pre-release env cleanup** (also listed in the STRAT brief): remove the unused Marketplace-created
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` / `KV_REST_API_READ_ONLY_TOKEN` / `KV_URL` / `REDIS_URL`
   from the Vercel project (verify a deploy still boots afterwards), and decide whether `UPSTASH_*` +
   `UPLOAD_TOKEN_SECRET` should also exist in **Preview** (today they are Production-only, so any
   future preview deploy fails on `/api/upload`).

## Review Granularity

`multi` — a paid dependency on a security-sensitive public write surface, plus a fail-mode and an
external-header trust decision. Cross-review to consensus is mandatory.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → Quality Gates (`pnpm qg`) → Review Agent → mandatory
independent Codex cross-review to consensus. Propose commit only after consensus **and** with the
CO dispositions honestly recorded (owner-debt COs point at the STRAT brief, they do not gate `done`
falsely). Commit only with explicit owner approval.
