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
| 1 | Upload-flow architecture (endpoint/auth model, opaque client handle + `clientSubmissionId` lifecycle, 3-category DB/Storage/admin representation, per-file retry/remove/progress, atomic adopt-at-submit, cleanup/idempotency) | — | **done** (`STAGE_6_TASK_01_upload_flow_architecture.md`, moved to `tasks/done/`) | PROJECT_DECISIONS.md — "Stage 6 Upload-Flow Architecture" |
| 2 | Site-wide shell (nav item set → Home/Process/Request/Location; footer strips `mailto:`/`tel:`; shared CTA-at-end-of-page component; `policies` → `process` route rename **with content carried over as-is**; inbound-link sweep; Location's missing CTA pulled forward) | — | **done** (`STAGE_6_TASK_02_site_wide_shell.md`, moved to `tasks/done/`) | PROJECT_DECISIONS.md — Navigation and CTA placement |
| 3 | Request form rebuild (field model → FS §4.2, states, single-scroll format, upload card stack + motivation cards, required in-session persistence incl. clearing on submit, **Item 9 reference-code folded in**, upload-card UX fixes from the Item 1 live check) | Item 1 | **done + LIVE** (2026-07-17) — built/reviewed in 4 checkpointed blocks (`5de9329`, `4721dcd`, `7eaa7ac`, `050260a`, `0b38243`); both migrations applied and verified live; CO-1 e2e passed (5 methods + an upload per category). Task in `tasks/done/`. | PROJECT_DECISIONS.md — Request page — form format |
| 4 | Success page (new route; client store gate incl. bfcache guard; contact echo; one-time read; **rewires the submit flow from inline success → store + redirect**) | Item 3 (shares the persistence store) | **done** (2026-07-18, `tasks/done/STAGE_6_TASK_04_success_page.md`). `/success` gated route + `consumeSuccess()` one-time read (strict-mode-safe via `consumedRef`) + `pageshow` bfcache guard; submit rewired to `resetDraft → setSuccess → push("/success")`. Codex cross-review to consensus (`reviews/done/REVIEW_2026-07-18_stage6_success_page.md`, 2 findings applied). CO-1/CO-2 owner-verified live; automated e2e deferred to backlog. | PROJECT_DECISIONS.md — Success page |
| 5 | Home rebuild (block order; About folded into Hero/Good Fit, not deleted; footer/Instagram decisions already covered by Item 2) | Item 2 | not started | PROJECT_DECISIONS.md — Home page |
| 6 | Process page **content rewrite** (the route itself is delivered by Item 2 with the old `policies` copy carried over; Item 6 replaces that copy with the FS §3.2 canonical content: Overview, Good Fit, Design Process, Pricing, Booking Policy, FAQ, in blueprint block order) | Item 2 | not started, **content-blocked** — needs owner-authored copy (pricing, FAQ, Good Fit text) | PROJECT_DECISIONS.md — Process page |
| 7 | Location polish — **split by owner decision 2026-07-18/19**: (a) **map embed** = `STAGE_6_TASK_07_location_map_embed.md` (**done**); (b) **studio photos** stay as the shipped placeholder squares, a **pre-deploy swap** (real photos a few days out). Address is real (Herzl 100), provider is fixed (Google Maps iframe). | Item 2 | **map half: done** (2026-07-19, `docs/project/tasks/done/STAGE_6_TASK_07_location_map_embed.md`; Codex cross-review consensus, keyless-endpoint risk owner-accepted as-is); **photo half: deferred to pre-deploy swap** (asset, not code) | PROJECT_DECISIONS.md — Location page |
| 8 | Preparation / Aftercare split (two routes from the current combined `aftercare` page; drop policies links; **footer discovery links added**; no cross-link) | Item 2 | **done** (`5714233`, Codex-built + Claude-reviewed to consensus 2026-07-18; `pnpm qg` green, 375 tests; task in `tasks/done/`). **Note:** its `en.json` split was swept into Item 4's commit `94ef19b` by the shared-index hazard (df70cae-style misattribution) — content intact, documented in the stage log + task verdict, no history rewrite (owner call). | PROJECT_DECISIONS.md — Preparation/Aftercare in-product discovery |
| 9 | Reference-code format (6-char uppercase alphanumeric, excludes O/0/I/1) | Item 3 (generated at submit) | **done + LIVE** (2026-07-17; folded into Item 3 — Block R `5de9329`, migration `20260715124427` applied; live codes verified 6-char, no O/0/I/1) | FS §4.6; PROJECT_DECISIONS.md — Stage 6 note under Reference Code Decision |
| 10 | Abuse mitigation, **both endpoints** (honeypot on submit; **a non-caller-resettable control on `/api/upload` — now a pre-launch blocker**, see below) | Item 1 (shares the endpoints) | not started — **scope grew after the Item 1 Codex review** | FS §4.5; PROJECT_BACKLOG.md — "Unbounded automated storage growth"; PROJECT_DECISIONS.md — Stage 6 Upload-Flow Architecture §1 |
| 11 | Public error/404 UX polish (localized 404, public error boundary) | — | **task ready** (`STAGE_6_TASK_11_public_error_404.md`) — outside FS scope; no content needed; one in-plan choice (404-localization approach) | PROJECT_BACKLOG.md; PROJECT_STAGE_LOG.md 2026-07-09 Fix Pass 2 entry |
| 12 | Favicon / OG / basic SEO | — | **task ready** (`STAGE_6_TASK_12_favicon_og_seo.md`) — **mechanism buildable now; final title/description/OG-image/favicon are owner assets** (pre-deploy swap, same content brief as 5/6) | PROJECT_IMPLEMENTATION_PLAN.md — Stage 6 |
| 13 | Final FS §6 acceptance sweep (all 13 criteria) + manual mobile QA | Items 1–10, 14 | not started | FS §6 |
| 14 | **Placement → required free-text** (Select over fixed body areas → a typed area description) — a product reversal raised during Task 03 Block A′, deliberately kept out of it | Item 3 (rebuilds the field Block A′ shipped) | **task ready** (`STAGE_6_TASK_09_placement_freetext.md`; promoted 2026-07-17). FS §4.2 field 2 already amended by STRAT — the executor implements against it, no FS work first. | FS §4.2 field 2 (2026-07-17 amendment, supersedes the 2026-07-15 "Other removed" one) |

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

**Item 8 open questions — RESOLVED (owner, 2026-07-14).** Item 8 was briefly `blocked` on three
questions a STRAT session surfaced when the previous brief's "fully unblocked" claim did not
survive repo verification. All three are now decided (full record: PROJECT_DECISIONS.md —
"Preparation/Aftercare in-product discovery, 2026-07-14"), and the task file
`STAGE_6_TASK_08_preparation_aftercare_split.md` is `ready`.

- **Q1 — how are Preparation/Aftercare reached? → two global-footer links** (Preparation,
  Aftercare) as fallback discovery; artist-sent direct URL stays the primary path. This **reversed
  the batch-2 "direct URL only / accepted risk" stance and amended PRD §5 and FS §2** (PRD §9
  change control — the spec was edited first, then the task cut against it). It also resolved the
  deferred-from-Item-2 fate of `process.aftercareLink`: **removed** (discovery is the footer's job
  now; a fit-deciding Process reader's task is not served by an aftercare link, FS §2).
- **Q2 — the boundary bullet** ("After the tattoo…") **stays in Preparation, copy unchanged** — it
  describes the in-studio day, within FS §3.6's appointment-preparation scope.
- **Q3 — intro copy** owner-supplied: `preparation.intro` / `aftercare.intro` (exact strings in
  PROJECT_DECISIONS.md and the task file).

Everything else about Item 8 was already verified ready: `/aftercare` is a single self-contained
page with no outbound links and no test coverage, absent from the nav, splitting cleanly along
existing i18n keys (`beforeAppointment*` + `tattooDay*` → Preparation; `aftercareInstructions*` +
`healingTouchUps*` → Aftercare). The task is delegated to Codex (`Executor: codex`).

---

## ✅ Item 1 migration applied and verified live (2026-07-14) — was a blocker, now cleared

Item 1's DB migration (`20260714025850_three_upload_categories.sql`) is applied to the remote
database and verified end-to-end. The live constraint name matched (`request_files_type_check`), so
the silent-failure trap did not fire; the constraint is now the three-category CHECK, the 21 test
rows were backfilled, and Local == Remote. `UPLOAD_TOKEN_SECRET` is set in Vercel (Production) and a
real submit with an image in each of the three categories persisted and rendered correctly in the
admin viewer. Full record: PROJECT_STAGE_LOG.md, 2026-07-14 "Item 1 is now LIVE". **Item 1 is done
in every sense; Item 3 can be planned and verified against a working database.**

---

## Open items left by Item 1 (owner-decided, not Item 1's tail — added 2026-07-14)

Item 1 is **done** (implemented, independently reviewed, review closed at consensus; migration
applied and verified live — see the section above). Beyond that, it left two questions that belong
to **no item** and are the owner's to decide, plus one nit that belongs to Item 3. Recorded here so
a STRAT session planning the next block does not have to reconstruct them from the review thread.
(The Item 3 nit — submit CTA disabled during upload vs. the "Sending…" wait state — is now folded
into Item 3's scope; see `STAGE_6_TASK_03_request_form_rebuild.md`.)

1. **Client-side image compression — needs research, then a decision.** The per-file limit is
   **4 MB**, forced by Vercel's 4.5 MB Function request-body ceiling (FS §4.3 was amended 10 MB →
   4 MB by owner decision). FS permits client-side compression, which would remove the ceiling for
   the visitor entirely; Stage 6 does **not** implement it — an oversized file is rejected with a
   clear message. Residual risk: a high-resolution phone photo (48 MP JPEG, unconverted HEIC) can
   exceed 4 MB. Open questions (compress only over-limit files? what output parameters? HEIC, which
   browsers cannot decode?) are in PROJECT_BACKLOG.md. **Not blocking anything** — the form works
   and complies with FS without it.
2. **Unbounded automated storage growth on `/api/upload` — PRE-LAUNCH BLOCKER.** The endpoint's
   stated abuse ceiling does not exist: `clientSubmissionId` is caller-chosen, so a bot mints a
   fresh UUID per upload and never hits the per-session object cap, and the in-memory per-IP limiter
   is per-instance on Vercel. Objects are still size-capped and must be real images, and the bucket
   is private — so the exposure is storage cost, not data. Closing it needs one non-caller-resettable
   control (durable rate limiting via Upstash/Vercel KV — a new paid dependency; a server-issued
   upload capability with a durable quota; or platform-level protection). **Folded into Item 10**,
   whose scope grew accordingly. Full record: PROJECT_BACKLOG.md.
3. **Item 3 inherits one UI nit:** the submit CTA is currently *disabled* while an upload is in
   flight, whereas PROJECT_DECISIONS.md describes accepting the click and showing a "Sending…" wait
   state. Behavior is correct (a *failed* upload never blocks submit, per FS §4.5) — the wording and
   the UI simply disagree, and Item 3 owns the form's UX.

---

## Sequencing notes (not a rigid schedule)

- **Item 1 blocks Item 3 blocks Item 4.** This is the critical path — the upload redesign is
  also the single most architecturally risky piece (public unauthenticated upload surface).
  **Item 1 is done (2026-07-14); Items 3 and 4 are unblocked.**
- **Item 2 (done) unblocked 5/6/7/8 in code** — all four content pages needed the nav/footer shell
  to exist first. Code-unblocked is not the same as ready to cut: 6 and 7 are content/asset-blocked
  and 8 is blocked on the three owner questions above.
- **Items 6, 7 and 8 are blocked on the owner, not on code** — Process copy (pricing, FAQ, Good
  Fit text), Location studio photos, and Item 8's Q1–Q3. The owner should be producing these in
  parallel with Items 1/3/4, so they aren't the long pole when their turn comes. **Item 8's Q1 is
  the cheapest of them to clear and the one that unlocks a whole parallel work stream** — it is a
  decision, not an asset to produce.
- **Item 9 is folded into Item 3** (owner decision 2026-07-14 — same submit endpoint). **Item 10 is
  NOT folded in:** after the Item 1 Codex review it grew from a small honeypot/rate-limit item into a
  pre-launch blocker (the `/api/upload` durable-quota gap needs a non-caller-resettable control — a
  new paid dependency). It stays a separate item and must not be pulled into Item 3.
- Items 11/12 are low-risk, can slot in anywhere there's idle capacity; they don't block or get
  blocked by anything else. **They are the only items cuttable right now without owner content** —
  everything else waits on Item 3 (→ Item 4) or on owner-supplied copy/photos (5/6/7).
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
