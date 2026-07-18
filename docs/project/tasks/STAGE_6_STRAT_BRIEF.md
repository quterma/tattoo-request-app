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

Items 4 and 8 landed `done`. This session then **cut every remaining code-only item** — Item 7 (map
embed), Item 11 (public 404 + error boundary), Item 12 (favicon/OG/SEO) — all now `ready`, and the
owner **launched Item 7's IMPL**. It also produced an owner-facing **content brief** (artifact,
Russian) telling the artist exactly what copy to write — that copy is the stage's dominant blocker
now. With this, the only un-cut item is Item 10 (needs an owner mechanism decision first), and
everything else is either `ready`, in flight, or owner-gated (content/assets).

## State of the board — verify before trusting this

| Item | State |
| --- | --- |
| 1 — Upload-flow architecture | **done + LIVE** (`480c721`) |
| 2 — Site-wide shell | **done** (`e833398`) |
| 3 — Request form rebuild | **done + LIVE** (2026-07-17) |
| 4 — Success page | **done** (`94ef19b`, 2026-07-18) |
| 5 — Home rebuild | code-unblocked, no task file. **Content-blocked** — Good Fit + price-teaser + one-line intro are owner copy (same material as Item 6). |
| 6 — Process content | code-unblocked, **content-blocked** on owner copy (pricing/FAQ/Good Fit). Artist copy requested via the content brief. |
| 7 — Location | **map half: task ready** (`STAGE_6_TASK_07_location_map_embed.md`); **photo half: pre-deploy swap** (placeholders stay). |
| 8 — Preparation/Aftercare split | **done** (`5714233`, Codex + Claude-review, 2026-07-18). Its en.json split sits in `94ef19b` (shared-index misattribution — documented, no rewrite). |
| 9 — Reference-code format | **done + LIVE** (folded into Item 3) |
| 10 — Abuse mitigation | not started, **PRE-LAUNCH BLOCKER** (`/api/upload` durable quota — new paid dependency; **mechanism is an open owner decision**). |
| 11 — 404/error boundary | **task ready** (`STAGE_6_TASK_11_public_error_404.md`) — outside FS scope, no content needed; one in-plan choice (how to localize the root 404). |
| 12 — favicon/OG/SEO | **task ready** (`STAGE_6_TASK_12_favicon_og_seo.md`) — mechanism buildable now; final title/description/OG-image/favicon are **owner assets** (pre-deploy swap). |
| 13 — FS §6 acceptance sweep | not started; stage-closing gate. |
| 14 — Placement → free-text | **done** (`552c8af`) |

## Decided (this session — 2026-07-18/19)

- **Item 7 split** (owner): studio photos stay as placeholder squares → real photos are a
  pre-deploy asset swap, not a code blocker; the address is real (Herzl 100); map provider fixed to
  a **keyless Google Maps iframe**. So Item 7's code work = the map embed only (`STAGE_6_TASK_07`).
- **Content brief produced** for the artist (artifact) — most Process copy already exists (Stages 0–5)
  and only needs confirming; the genuinely-new pieces are Good Fit, the one-line home intro, the form
  Introduction, and the Instagram handle. That copy unblocks Items 6 and 5.

## Open

- **Item 10's mechanism** — Upstash/Vercel KV vs a server-issued upload capability vs platform
  protection. Owner call, new **paid dependency**. Pre-launch blocker. Needs a STRAT session to lay
  out the options and get the owner's pick before it can be cut.
- **Owner content (the dominant long pole):** the Process/Home copy per the content brief, plus the
  `en.json` placeholders `__intro_TODO` and `INSTAGRAM_HANDLE`. Nothing in code blocks 5/6 — only this.
- **Studio photos** — real images for Item 7's photo half (pre-deploy swap).

## Task files

- `STAGE_6_TASK_07_location_map_embed.md` — `ready` (map embed; claude **or codex**). **Owner is
  launching its IMPL now.**
- `STAGE_6_TASK_11_public_error_404.md` — `ready` (claude **or codex**).
- `STAGE_6_TASK_12_favicon_og_seo.md` — `ready` (claude **or codex**; mechanism now, owner assets pre-deploy).
- Items 1/2/3/4/8/9/14 in `tasks/done/`. Nothing in `draft`.
- Non-Stage-6, unrelated: `META_TASK_01_framework_consolidation.md`, `TOOLING_TASK_01_project_status_command.md`.

## Next topic

Everything code-only is now cut and `ready` (7 map, 11, 12). What remains for a STRAT session:

1. **Item 10 — the one un-cut item, and it needs a STRAT topic first.** It can't be cut until the
   owner picks the durable-quota mechanism (Upstash/Vercel KV vs a server-issued upload capability
   vs platform protection — a **new paid dependency**). A STRAT session should lay out those options
   with trade-offs/cost and get the owner's decision, then cut it. Pre-launch blocker.
2. **Turn owner content into Items 6 → 5.** When the artist returns copy (per the content brief),
   cut Item 6 (Process rewrite), which also unblocks Item 5 (Home). This is the stage's long pole and
   is entirely owner-gated, not code-gated.
3. **Pre-deploy swaps to track** (assets, not tasks): real studio photos (Item 7 photo half), real
   favicon + OG image + final metadata copy (Item 12), and the `en.json` placeholders
   `__intro_TODO` / `INSTAGRAM_HANDLE`.

After 5/6 land and 7/10/11/12 are done, and the pre-deploy swaps are in: **Item 13** (FS §6
acceptance sweep + manual mobile QA) closes the stage.

## In flight right now

- **Item 7 (map) — IMPL launched by the owner** this session. When it returns, it owns its own
  review loop to consensus + commit. Its `en.json`/page changes are small; still, if any other
  session writes public docs at the same time, sequence them (the standing hazard below).

## Standing hazard (recurring — worth watching)

The shared git index / shared PROJECT_* docs have now caused **two** commit misattributions this
stage (`da6861f`, and Item 8's en.json into `94ef19b`). Both were content-safe and documented, but
it recurs whenever two sessions are live on overlapping files. An `open` META note is filed
(AI_FRAMEWORK_IDEAS.md) alongside the earlier one about `PROJECT_STAGE_LOG.md` outgrowing a single
read. Not urgent; deferred while limit goes to development. Until then: **do not run two sessions
writing the same file at once — sequence them.**

Re-verify every assumption in this brief against the repo before acting on it.
