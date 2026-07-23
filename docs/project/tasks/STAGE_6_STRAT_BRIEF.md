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

Item 10 was decided (Codex research → owner pick: **Option B**, durable per-IP Upstash quota,
60/IP/24h, fail-closed), **implemented and LIVE-VERIFIED on production 2026-07-23** (`d5e8ae3`,
3 cross-reviews to consensus; task in `tasks/done/`). The research killed the old "KV vs Upstash forks
on Pro" premise (Vercel KV no longer exists). **All Stage 6 code work is now done** — every item is
shipped except **5 and 6, which are pure content**, and **13** (the stage-closing acceptance sweep,
which cannot start before 5/6). The stage's only remaining blocker is **owner content + owner
pre-release debts** — entirely owner-gated, not code-gated.

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
| 10 — Abuse mitigation | **done + LIVE** (`d5e8ae3`, live-verified 2026-07-23, 3 cross-reviews to consensus; task in `tasks/done/`). Option B durable per-IP Upstash quota (60/IP/24h, fail-closed) + honeypot. **CO-4 (alert + WAF drill + spend caps) = owner pre-release debt** — launch blocker not fully closed until done. C (global breaker) deferred behind triggers. |
| 11 — 404/error boundary | **done** (`e213268`) — verify. |
| 12 — favicon/OG/SEO | **done** (`a37e7eb`, mechanism) — owner asset swaps + CO-5 remain (see debts). |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate. |
| 14 — Placement → free-text | **done** (`552c8af`) |

(Some rows above advanced since the prior brief — Items 7/11/12 show recent commits in the log.
**Re-verify each against `git log` / the board before acting.**)

## Decided (2026-07-22, shipped 2026-07-23)

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
- **Shipped 2026-07-23** — `d5e8ae3`, task now in `tasks/done/`. CO-1/2/3/5 discharged with live
  evidence (forged IP headers mint no fresh bucket; 429 with a 24h window survived a redeploy; an
  independent egress unaffected; limiter-down → 503 with no Storage write). **CO-4 (alert + WAF drill
  + spend caps) deferred to pre-release owner-debt** — all three are Pro-gated, bundled with the Pro
  decision.

## Open

- **Owner content (the dominant long pole):** Process/Home copy per the content brief, plus the
  `en.json` placeholders `__intro_TODO` and `INSTAGRAM_HANDLE`. Nothing in code blocks 5/6 — only this.
- **Studio photos** — real images for Item 7's photo half (pre-deploy swap).
- **Vercel Pro decision** (PROJECT_PRODUCTION_READINESS.md) — still open, but **no longer an Item 10
  gate** (terms-only; Item 10 is decided independently).

## Task files

- Items 1/2/3/4/7/8/9/**10**/11/12/14 all in `tasks/done/` — **no open Stage 6 task file remains**.
- Items 5, 6 and 13 never had task files: 5/6 are content-blocked (cut them when copy arrives), 13 is
  the stage-closing sweep.
- Nothing in `draft`.
- Non-Stage-6, unrelated: `META_TASK_01_framework_consolidation.md`, `TOOLING_TASK_01_project_status_command.md`.

## Open research threads (report these — anti-rot duty, AI_CROSS_REVIEW.md)

- None open. `RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md` closed 2026-07-22 → `research/done/`.

## Next topic

**All Stage 6 code is shipped.** Nothing here is code-blocked — what remains is owner-gated:

1. **Turn owner content into Items 6 → 5.** When the artist returns copy (per the content brief), cut
   Item 6 (Process rewrite), which also unblocks Item 5 (Home). The stage's long pole; owner-gated.
2. **Pre-deploy swaps to track** (assets, not tasks): real studio photos (Item 7 photo half); real
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

