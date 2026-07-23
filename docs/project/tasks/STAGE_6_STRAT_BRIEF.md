Purpose
STRAT Next-Session Brief for Stage 6 — the pickup point for the next STRAT session on this
stage. See docs/framework/AI_TASK_PROTOCOL.md — STRAT Next-Session Brief for the convention
this file follows (overwritten each session, committed immediately, pointers not prose).

Scope
Stage 6 strategic work only. Not a product document — see STAGE_6_PRODUCT_DEFINITION.md /
STAGE_6_FUNCTIONAL_SPECIFICATION.md for that.

Audience
AI agents and the developer, at the start of the next STRAT: Stage 6 session.

---

## Session summary

This session took the **Item 10** topic, ran a Codex research thread to consensus, and **closed it
with an owner decision**: Item 10's `/api/upload` control = **Option B (durable per-IP Upstash quota,
60/IP/24h, fail-closed)**, with the global circuit-breaker (C) deferred behind triggers. The research
killed the old "KV vs Upstash forks on Pro" premise (Vercel KV no longer exists). **Item 10's task
file is now cut** (`STAGE_6_TASK_10_upload_abuse_mitigation.md`, `ready`) — so every Stage 6 item is
either done or cut. The stage's dominant blocker is now **owner content** (Process/Home copy per the
content brief) — entirely owner-gated, not code-gated.

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | **done + LIVE** (`480c721`) |
| 2 — Site-wide shell | **done** (`e833398`) |
| 3 — Request form rebuild | **done + LIVE** (2026-07-17) |
| 4 — Success page | **done** (`94ef19b`, 2026-07-18) |
| 5 — Home rebuild | code-unblocked, no task file. **Content-blocked** — Good Fit + price-teaser + one-line intro are owner copy (same material as Item 6). |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing/FAQ/Good Fit). Artist copy requested via the content brief. |
| 7 — Location | **map half: done** (owner launched IMPL 2026-07-19 — verify it landed/committed); **photo half: pre-deploy swap** (placeholders stay). |
| 8 — Preparation/Aftercare split | **done** (`5714233`). |
| 9 — Reference-code format | **done + LIVE** (folded into Item 3) |
| 10 — Abuse mitigation | **decided + task cut this session** (`STAGE_6_TASK_10_upload_abuse_mitigation.md`, `ready`). Option B (durable per-IP Upstash quota, fail-closed) + honeypot. Pre-launch blocker until implemented. C (global breaker) deferred behind triggers. |
| 11 — 404/error boundary | **done** (`e213268`) — verify. |
| 12 — favicon/OG/SEO | **done** (`a37e7eb`, mechanism) — owner asset swaps + CO-5 remain (see debts). |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate. |
| 14 — Placement → free-text | **done** (`552c8af`) |

(Some rows above advanced since the prior brief — Items 7/11/12 show recent commits in the log.
**Re-verify each against `git log` / the board before acting.**)

## Decided (this session — 2026-07-22)

- **Item 10 `/api/upload` = Option B** — a durable per-IP fixed-window Upstash quota (**60/IP/24h**,
  named server constant), **fail-closed** (`503` on limiter-down, no write; `429`+`Retry-After` on
  breach), replacing the per-instance in-memory limiter. Structured `console.warn` on every 429/503
  (in-code) + a dashboard Firewall/Log alert (owner-debt) = how the owner learns it fired. **Option C
  (global circuit-breaker)** — the only bound against a *distributed* caller — **deferred behind
  triggers** (distributed spike / cost threshold / response-window loss / marketing reach / SaaS); B
  is C's first layer, not a throwaway. Record: PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse
  mitigation"; research `research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md`.
- **The "KV vs Upstash forks on Pro" premise is dead** — Vercel KV no longer exists (migrated to
  Upstash, Dec 2024); Pro is a **terms-only** decision (Hobby commercial restriction), not a limiter
  dependency. Stale claims corrected across the five docs.
- **Task cut:** `STAGE_6_TASK_10_upload_abuse_mitigation.md` (`ready`), with the must-fix
  `x-forwarded-for` trust check + owner-debt obligations baked in.

## Open

- **Owner content (the dominant long pole):** Process/Home copy per the content brief, plus the
  `en.json` placeholders `__intro_TODO` and `INSTAGRAM_HANDLE`. Nothing in code blocks 5/6 — only this.
- **Studio photos** — real images for Item 7's photo half (pre-deploy swap).
- **Vercel Pro decision** (PROJECT_PRODUCTION_READINESS.md) — still open, but **no longer an Item 10
  gate** (terms-only; Item 10 is decided independently).

## Task files

- Items 1/2/3/4/7/8/9/11/12/14 in `tasks/done/` (verify 7/11/12 moved after their commits).
- **Item 10 cut this session** — `STAGE_6_TASK_10_upload_abuse_mitigation.md` (`ready`, un-implemented).
- Nothing in `draft`.
- Non-Stage-6, unrelated: `META_TASK_01_framework_consolidation.md`, `TOOLING_TASK_01_project_status_command.md`.

## Open research threads (report these — anti-rot duty, AI_CROSS_REVIEW.md)

- None open. `RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md` closed 2026-07-22 → `research/done/`.

## Next topic

1. **Implement Item 10** — `STAGE_6_TASK_10_upload_abuse_mitigation.md` is `ready` and cuttable to an
   IMPL session any time (claude or codex). It adds an Upstash dependency + env vars, so it is the one
   remaining code item that touches infra; its owner-debt (alert drill, WAF deny drill, provisioning,
   spend safeguards) is deploy-time, tracked as task completion obligations.
2. **Turn owner content into Items 6 → 5.** When the artist returns copy (per the content brief), cut
   Item 6 (Process rewrite), which also unblocks Item 5 (Home). The stage's long pole; owner-gated.
3. **Pre-deploy swaps to track** (assets, not tasks): real studio photos (Item 7 photo half); real
   favicon + OG image + final metadata copy + branded custom domain + `robots` noindex→index flip
   (Item 12, marker `__meta_TODO` — `grep -rn __meta_TODO app/ src/`); `en.json` `__intro_TODO` /
   `INSTAGRAM_HANDLE`.

### Owner pre-deploy actions (debts carried by the owner, not IMPL work)

Checkable actions the owner performs at/around deploy time; OUT of the IMPL tasks' scope. A STRAT
session verifies these before the Item 13 acceptance sweep:

- [ ] **Vercel Pro decision** — the staging/production plan question in PROJECT_PRODUCTION_READINESS.md
  (likely needed for Hobby's commercial-use restriction). **No longer an Item 10 gate** (that fork was
  based on the now-dead Vercel KV premise). **Owner decision 2026-07-23: bundle it with the Item 10
  CO-4 items below and settle them together at pre-release** — Vercel alerts and WAF are Pro-gated, so
  doing them before the Pro call means building throwaway workarounds.
- [ ] **Item 10 CO-4 — abuse-control operational debt** (do together, right after the Pro decision;
  source: `tasks/STAGE_6_TASK_10_upload_abuse_mitigation.md`, live-verified 2026-07-23):
  - [ ] **Alert** on the `/api/upload` observability signal — the code already emits
    `[upload] quota exceeded: category=upload source=… reason=quota` and the matching
    `reason=unavailable` on 503. Configure a Vercel Firewall/Log alert with a **real recipient** and
    **trigger it once** to prove delivery. (Deliberately NOT done pre-Pro: the only free substitute is
    an external uptime monitor, which sees total outage but not a 429 spike — the actual abuse signal —
    and would consume the quota itself.)
  - [ ] **WAF deny drill** — method+path Deny on `POST /api/upload` via the dashboard (the real
    kill-switch: no redeploy needed). Perform once so it is known to work under pressure.
  - [ ] **Spend safeguards** — Vercel and Supabase spending caps/notifications configured. This is the
    physical money bound; Option B limits one source, not the number of sources.
  - [ ] **Env cleanup** — remove the unused Marketplace-created `KV_*` / `REDIS_URL` vars (confirm a
    deploy still boots), and decide whether `UPSTASH_REDIS_REST_*` + `UPLOAD_TOKEN_SECRET` belong in
    **Preview** (currently Production-only → any preview deploy 500s on `/api/upload`).
  - Already done (2026-07-23): Upstash provisioning (Free, Frankfurt, eviction off), env vars in
    Production, Vercel Function Region → `fra1`.
- [ ] **Item 12 CO-5 — Vercel system-env + live OG origin.** Turn ON the Vercel project's "Enable
  access to System Environment Variables" checkbox, then confirm the deployed `/en` renders an
  `og:image` on a public `https://` origin returning 200. Then flip `robots` `index:false`→`true` at
  launch. Source: `reviews/done/REVIEW_2026-07-20_stage6-item12-favicon-og-seo.md`; mechanism `a37e7eb`.
- [ ] **Item 12 / Items 5–7 asset + copy swaps** — see "Pre-deploy swaps to track" above.

After 5/6 land, 10 is **built** (task is cut + decided; implementation remains), and the pre-deploy
swaps are in: **Item 13** (FS §6 acceptance sweep + manual mobile QA) closes the stage.

## Standing hazard (recurring — worth watching)

The shared git index / shared PROJECT_* docs have caused commit misattributions this stage
(`da6861f`; Item 8's en.json into `94ef19b`). It recurs whenever two sessions are live on overlapping
files. **Do not run two sessions writing the same file at once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
