Purpose
Living implementation plan for Stage 6 (public website), cutting the reviewed UX blueprint into
sequenced, scoped work. Not a decision record and not a task file — decisions live in
PROJECT_DECISIONS.md, executable scope lives in `docs/project/tasks/`.

Scope
Stage 6 public-website implementation only. Admin-side and pre-launch DevOps items are tracked
elsewhere (PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_PRODUCTION_READINESS.md).

Audience
STRAT sessions on Stage 6 (read this first, alongside the STRAT brief) and anyone orienting on
where the stage stands. Updated by STRAT sessions as tasks are created/completed — not
overwritten each session like the brief; this is the durable plan, the brief is the pointer to
"what's next right now."

---

## How to use this document

1. Each item below is one unit of implementation work, in dependency order.
2. A STRAT session picks the next unblocked item(s), writes one detailed task file per item
   (`docs/project/tasks/STAGE_6_TASK_<NN>_<slug>.md`, per `docs/framework/templates/
   STAGE_TASK_TEMPLATE.md`), sets it `ready` after developer approval, and updates this
   document's status column.
3. Do not create task files for items far in the future — write one (or, if genuinely
   parallelizable, a small number) at a time, close to when work on them will actually start.
   Re-verify the item's assumptions against the repo before writing its task file; blueprint
   decisions were reviewed once but the shipped code moves.
4. Status values: `not started` / `task ready` / `in progress` / `done` (task file moved to
   `tasks/done/`) / `blocked` (on what).

---

## Source of truth for every item

`docs/project/STAGE_6_PRODUCT_DEFINITION.md` (PRD), `docs/project/
STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS), and `docs/project/PROJECT_DECISIONS.md` — "Stage 6 UX
Blueprint Decisions" (all 8 sub-topics, consensus-reviewed by an external AI in two batches and
by Codex with repo access — see that section's header for the review-thread pointers). No task
file may contradict these without first escalating a PRD/FS/blueprint change.

---

## Items

| # | Item | Depends on | Status | Blueprint ref |
| --- | --- | --- | --- | --- |
| 1 | Upload-flow architecture (endpoint/auth model, opaque client handle + `clientSubmissionId` lifecycle, 3-category DB/Storage/admin representation, per-file retry/remove/progress, atomic adopt-at-submit, cleanup/idempotency) | — | **task ready** (`STAGE_6_TASK_01_upload_flow_architecture.md`) | PROJECT_DECISIONS.md — Request page, "Upload-flow architecture prerequisite" (Codex blocker finding) |
| 2 | Site-wide shell (nav item set → Home/Process/Request/Location; footer strips `mailto:`/`tel:`; shared CTA-at-end-of-page component; `policies` → `process` route rename **with content carried over as-is**; inbound-link sweep; Location's missing CTA pulled forward) | — | **done** (`STAGE_6_TASK_02_site_wide_shell.md`, moved to `tasks/done/`) | PROJECT_DECISIONS.md — Navigation and CTA placement |
| 3 | Request form rebuild (field model, states, single-scroll format, upload card stack, required in-session persistence incl. clearing on submit) | Item 1 | not started | PROJECT_DECISIONS.md — Request page — form format |
| 4 | Success page (new route; client store gate incl. bfcache guard; contact echo; one-time read) | Item 3 (shares the persistence store) | not started | PROJECT_DECISIONS.md — Success page |
| 5 | Home rebuild (block order; About folded into Hero/Good Fit, not deleted; footer/Instagram decisions already covered by Item 2) | Item 2 | not started | PROJECT_DECISIONS.md — Home page |
| 6 | Process page **content rewrite** (the route itself is delivered by Item 2 with the old `policies` copy carried over; Item 6 replaces that copy with the FS §3.2 canonical content: Overview, Good Fit, Design Process, Pricing, Booking Policy, FAQ, in blueprint block order) | Item 2 | not started, **content-blocked** — needs owner-authored copy (pricing, FAQ, Good Fit text) | PROJECT_DECISIONS.md — Process page |
| 7 | Location polish (real map embed + real studio photos replacing placeholders) — the missing CTA is pulled forward into Item 2 | Item 2 | not started, **asset-blocked** — needs real studio photos | PROJECT_DECISIONS.md — Location page |
| 8 | Preparation / Aftercare split (two routes from the current combined `aftercare` page; drop policies links; no cross-link) | Item 2 | not started | PROJECT_DECISIONS.md — Preparation page / Aftercare page |
| 9 | Reference-code format (6-char uppercase alphanumeric, excludes O/0/I/1) | Item 3 (generated at submit) | not started | FS §4.6; PROJECT_DECISIONS.md — Stage 6 note under Reference Code Decision |
| 10 | Abuse mitigation on the submit endpoint (honeypot and/or rate limiting, invisible to legitimate visitors, no CAPTCHA) | Item 1 (shares the endpoint) | not started | FS §4.5 |
| 11 | Public error/404 UX polish (localized 404, public error boundary) | — | not started, pre-existing backlog item | PROJECT_BACKLOG.md; PROJECT_STAGE_LOG.md 2026-07-09 Fix Pass 2 entry |
| 12 | Favicon / OG / basic SEO | — | not started | PROJECT_IMPLEMENTATION_PLAN.md — Stage 6 |
| 13 | Final FS §6 acceptance sweep (all 13 criteria) + manual mobile QA | Items 1–10 | not started | FS §6 |

**Not itemized separately, folded into the items above:** the "policies inbound-link check" and
the `policies` → `process` route rename (both in Item 2 — see the Item 2/6 boundary decision
below).

**Item 2/6 boundary — owner decision, STRAT 2026-07-13.** Item 2 performs the `policies` →
`process` route rename **and carries the shipped policies copy over unchanged**; Item 6 later
replaces that copy with the FS §3.2 canonical content. The alternatives were rejected: leaving
the rename in Item 6 would point the new nav at a 404 for as long as Item 6 stays content-blocked
on owner-authored copy, and shipping a stub `/process` would take the site's only pricing/FAQ
content offline in the meantime. Carrying the content over keeps the site coherent at every
commit and costs Item 6 nothing — it rewrites a page at a route that already exists. Item 2 also
pulls forward the one Location line that belongs to the site-wide CTA pattern (Location has no
primary CTA today, FS §2's table says it must), so the pattern is not left half-applied behind
the asset-blocked Item 7.

**No redirect from the old `/policies` URL** (same decision): the site is not publicly launched
(PROJECT_PRODUCTION_READINESS.md — production environment setup still open), so there are no
external inbound links or index entries to preserve; a permanent redirect for a URL nobody has is
debt. Revisit only if the owner has already shared `/policies` links publicly.

---

## Sequencing notes (not a rigid schedule)

- **Item 1 blocks Item 3 blocks Item 4.** This is the critical path — the upload redesign is
  also the single most architecturally risky piece (public unauthenticated upload surface).
- **Item 2 is small and unblocks 5/6/7/8** (all four content pages depend on the nav/footer
  shell existing first, even though their own content work can be drafted in parallel).
- **Items 6 and 7 are content/asset-blocked, not code-blocked** — the owner should be
  producing/collecting Process copy (pricing, FAQ, Good Fit text) and Location studio photos in
  parallel with Items 1/3/4, so they aren't the long pole when their turn comes.
- **Item 9 and 10 are small** and can be folded into Item 3's task file instead of standing
  alone, at the next STRAT session's discretion, since they touch the same submit endpoint.
- Items 11/12 are low-risk, can slot in anywhere there's idle capacity; they don't block or get
  blocked by anything else.
- Item 13 is the stage-closing gate — do not start it until 1–10 are done.

---

## Model/session guidance for this stage's remaining work

Per `docs/framework/AI_TASK_PROTOCOL.md` — Session Settings Guidance: STRAT sessions cutting task
files and resolving open design questions → highest-reasoning tier (Opus while Fable's usage
cost is a constraint, per owner decision 2026-07-13; Fable reserved for genuine architecture
forks, e.g. if Item 1's design space turns out contested). IMPL sessions executing an already-
scoped task file → Sonnet (well-scoped work, per protocol default). Codex stays a read-only
reviewer of completed blocks (`docs/framework/AI_CROSS_REVIEW.md`) — a broader delegation (e.g.
running `pnpm qg` and reporting results) is under META consideration, see
`docs/framework/AI_FRAMEWORK_IDEAS.md`, 2026-07-13 entry on Codex delegation scope.
