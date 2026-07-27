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
| 5 | Home rebuild (block order; About folded into Hero; Featured Work = **4** placeholder images; 5-step Mini Process; Good Fit + price teasers deep-linking into Process) | Item 2, **Item 6** (teasers link into its sections) | **done** (`a4cbf31`, 2026-07-24; Codex consensus in 9 rounds; task in `tasks/done/`). Deleted the false "20+ years in … tattoo art" claim. CO-2 (mobile-viewport read-through) → PROJECT_BACKLOG.md, discharged in the visual pass / Item 13 | PROJECT_DECISIONS.md — Home page; `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md` |
| 6 | Process page **content rewrite** (FS §3.2 canonical content) + request-form intro (FS §4.1) + `footer.studio`/`INSTAGRAM_HANDLE`/`__meta_TODO` copy swaps. Shipped the approved copy: Overview, Good Fit, Pricing, **Booking & Deposit before Design & Sketch**, Touch-ups, Age (18+, minors → Instagram DM), Languages, Payment, 7-question FAQ (incl. the Preparation/Aftercare links) | Item 2 | **done** (`5eb7855`, 2026-07-24; Codex cross-review consensus, 4 rounds; task in `tasks/done/`). CO-3 (artist copy pass) open by design; CO-2's mobile-viewport half folded into the visual pass | PROJECT_DECISIONS.md — Process page; FS §3.2/§4.1/§5; `research/done/RESEARCH_2026-07-23_stage6-public-copy-positioning.md` |
| 7 | Location polish — **split by owner decision 2026-07-18/19**: (a) **map embed** = `STAGE_6_TASK_07_location_map_embed.md` (**done**); (b) **studio photos** stay as the shipped placeholder squares, a **pre-deploy swap** (real photos a few days out). Address is real (Herzl 100), provider is fixed (Google Maps iframe). | Item 2 | **map half: done** (2026-07-19, `docs/project/tasks/done/STAGE_6_TASK_07_location_map_embed.md`; Codex cross-review consensus, keyless-endpoint risk owner-accepted as-is); **photo half: deferred to pre-deploy swap** (asset, not code) | PROJECT_DECISIONS.md — Location page |
| 8 | Preparation / Aftercare split (two routes from the current combined `aftercare` page; drop policies links; **footer discovery links added**; no cross-link) | Item 2 | **done** (`5714233`, Codex-built + Claude-reviewed to consensus 2026-07-18; `pnpm qg` green, 375 tests; task in `tasks/done/`). **Note:** its `en.json` split was swept into Item 4's commit `94ef19b` by the shared-index hazard (df70cae-style misattribution) — content intact, documented in the stage log + task verdict, no history rewrite (owner call). | PROJECT_DECISIONS.md — Preparation/Aftercare in-product discovery |
| 9 | Reference-code format (6-char uppercase alphanumeric, excludes O/0/I/1) | Item 3 (generated at submit) | **done + LIVE** (2026-07-17; folded into Item 3 — Block R `5de9329`, migration `20260715124427` applied; live codes verified 6-char, no O/0/I/1) | FS §4.6; PROJECT_DECISIONS.md — Stage 6 note under Reference Code Decision |
| 10 | Abuse mitigation, **both endpoints** (submit honeypot; **`/api/upload` durable control**: Option B — durable per-IP Upstash quota, 60/IP/24h, fail-closed; C (global breaker) deferred behind triggers) | Item 1 (shares the endpoints) | **done + LIVE** (`d5e8ae3`, live-verified 2026-07-23; 3 cross-reviews to consensus). **CO-4 (alert + WAF drill + spend caps) remains owner pre-release debt** — the PRODUCTION_READINESS launch blocker is not fully closed until it is done | FS §4.5; PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation"; `tasks/done/STAGE_6_TASK_10_upload_abuse_mitigation.md` |
| 11 | Public error/404 UX polish (localized 404, public error boundary) | — | **done** (2026-07-19, `tasks/done/STAGE_6_TASK_11_public_error_404.md`) — root 404 localized directly (single-locale project, no locale-tier file — the task's own two-tier recommendation was disproved live and revised in-plan); `app/[locale]/(public)/error.tsx` added, inherits the public shell, retries via `unstable_retry()`; Codex cross-review reached consensus in 2 rounds | PROJECT_BACKLOG.md; PROJECT_DECISIONS.md — "Public 404 / error boundary (Item 11)" |
| 12 | Favicon / OG / basic SEO | — | **done** (2026-07-20, `a37e7eb`, `tasks/done/STAGE_6_TASK_12_favicon_og_seo.md`; Codex consensus 4 rounds) — `generateMetadata` in `[locale]/layout.tsx` (title+template, description, openGraph, `robots: noindex` until launch, `metadataBase` via `VERCEL_PROJECT_PRODUCTION_URL`); `app/[locale]/opengraph-image.tsx` (dynamic `next/og`, no dep) + `app/icon.svg` placeholder; stock `favicon.ico` removed. All interim copy/assets flagged `__meta_TODO`. **Owner pre-deploy debt** (was CO-5): Vercel system-var checkbox + live OG-origin check — tracked in STAGE_6_STRAT_BRIEF.md, not IMPL scope | PROJECT_IMPLEMENTATION_PLAN.md — Stage 6 |
| 13 | Final FS §6 acceptance sweep (all 13 criteria) + mobile QA. **Browser capability named 2026-07-26:** `pnpm shot` (headless Chromium via `playwright`), delivered by `tasks/TOOLING_TASK_02_playwright_screenshots.md` — the requirement below is satisfied, and the executor records the captures as evidence in the task itself. Physical-device checks are explicitly NOT part of it (Stage 7 / PROJECT_PRODUCTION_READINESS.md). *Original note, kept for the record: "when cutting this task, name the browser capability its executor will use (there is no Playwright/Puppeteer/Cypress in `package.json`; the 'manual browser check' is unexecutable until the tool is named)".* | Items 1–10, 14, **16, 18** — all done | **task ready** (`STAGE_6_TASK_13_acceptance_sweep.md`, cut 2026-07-27) — **the only open item; it closes the stage.** Folds in the Item 17 pre-release re-review (PROJECT_BACKLOG.md). **Scoping decision recorded in the task file:** the `__asset_TODO` sweep is a **launch** gate, not a stage-closure gate — none of FS §6's thirteen criteria mentions assets, and treating placeholders as a closure condition would deadlock the stage against real photography that Stage 7 is supposed to run *after* Stage 6 closes | FS §6; `reviews/done/REVIEW_2026-07-17_impl-brief-channel.md` (round 2, finding 2) |
| 14 | **Placement → required free-text** (Select over fixed body areas → a typed area description) — a product reversal raised during Task 03 Block A′, deliberately kept out of it | Item 3 (rebuilds the field Block A′ shipped) | **done** (`552c8af`, 2026-07-18; Codex cross-review to consensus in 5 rounds; task in `tasks/done/STAGE_6_TASK_09_placement_freetext.md` — note the item/file number mismatch is deliberate and long-standing: Item 14 ↔ `TASK_09`) | FS §4.2 field 2 (2026-07-17 amendment, supersedes the 2026-07-15 "Other removed" one) |
| 15 | **Preparation/Aftercare discovery moves from the global footer to the Process FAQ** — removes the two footer links, amends **PRD §5 + FS §2** together (PRD §9 change control), appends a dated amendment to the 2026-07-14 decision. Reverses part of that decision at owner request 2026-07-23 | **Item 6** (creates the replacement FAQ links — removing the footer first would leave zero discovery) | **done** (`da3000c`, 2026-07-24; Codex consensus in 4 rounds; task in `tasks/done/`) | PROJECT_DECISIONS.md — "Preparation/Aftercare in-product discovery (2026-07-14)" + its 2026-07-23 amendment; PRD §5; FS §2 |
| 16 | **Placeholder visual assets** — owner-generated placeholders: studio interiors (3), Featured Work (4), OG image (1200×630), plus the favicon. All marked `__asset_TODO` and added to the pre-deploy sweep | Items 6, 5 (OG copy + Featured Work slots) | **done** (`fad01c7`, 2026-07-26; two rounds, both cross-reviewed to consensus, 7 rounds combined; task in `tasks/done/`). **Mid-task pivot:** the favicon moved from Claude-drawn SVG options to the same owner-generation loop as the other categories, then was hand-vectorized into `app/icon.svg` (PROJECT_DECISIONS.md §5 amendment). 9 `__asset_TODO` markers in the tree; OG generator replaced by a static `opengraph-image.jpg` + `.alt.txt` sidecar | PROJECT_PRODUCTION_READINESS.md — Pre-Deploy Content Swaps (canonical marker list); Item 13 sweep must fail while any `__asset_TODO` remains |
| 17 | **Studio data → one config + placeholder-marker consolidation** — `src/config/studio.ts` becomes the single source for non-translated, per-studio values (name, handle, Instagram URL, address); removes the handle duplication between `form.ts` and `en.json` (the drift Item 6 had to fix by hand) and de-hardcodes the address from `location/page.tsx`; folds three placeholder markers into one discoverable convention. Prices/policy text stay in i18n (woven into sentences) | Items 6, 5 (both hold large `en.json` edits) | **done** (`c7ba5e2`, 2026-07-25; task in `tasks/done/`). `src/config/` split into `env.ts` (server-only) + `studio.ts` (client-safe) + barrel. **Its cross-review exited at 9 rounds by owner decision, not on a clean round** — a pre-release re-review is filed in PROJECT_BACKLOG.md and is a natural companion to Item 13 | PROJECT_DECISIONS.md — Service Layer Decisions (keep it plain: constants module, not a CMS) |
| 18 | **Visual consistency pass** — one design-token system (today `tokens.css`'s raw hex and the shadcn/oklch `:root` set coexist: two greys, two borders, two link treatments), spacing rhythm moved into the `Page`/`Section`/`Container`/`Stack` primitives (`Section`'s default is overridden at 30 of 36 call sites), one heading scale, dead CSS removed, Home hero given its missing background image + a contrast fix, and every public route verified at 320/375/768/1280. **Consistency only — no new palette, fonts, layout or art direction** (that is Stage 7) | Items 5, 6, 16 (needs the shipped pages and assets to be visible); `TOOLING_TASK_02` (the `pnpm shot` capability) | **done** (2026-07-26/27; task in `tasks/done/`). Two checkpointed blocks, each cross-reviewed to consensus at round 1: **A** — one token system (oklch survives), `Section`/`Page` density variants, typed `Stack` gaps, dead tokens gone, heading scale as a rem-breakpoint step (`43aa0da`); **B** — flow margins and all 41 `mb-*` counters removed atomically, every call site migrated, form UI, oversized-file copy + its real root cause (`shrink-0` in a non-wrapping row), 24 captures at four widths (`4a60585`). Hero shipped out of order (`5a406bd`), the tenth `__asset_TODO`. **CO-1 discharged Items 5 and 6's mobile-viewport obligations for real, not by re-routing.** Two accessibility constraints are now load-bearing: link/focus stay `#2563eb` (`--ring` is 2.32:1, below WCAG 2.2 SC 1.4.11) and the heading scale is a step, not `clamp()` (a `vw` term suppresses browser zoom to ~186% instead of 200%, SC 1.4.4) | PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design (2026-07-26)"; PROJECT_BACKLOG.md — Home mobile-viewport CO-2 gap, oversized-file error copy |

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
   control. **Folded into Item 10**, whose scope grew accordingly. **Reframed as a layer + mechanism
   decided 2026-07-22** (STRAT + Codex research): **Option B — a durable per-IP Upstash quota**
   (60/IP/24h, fail-closed), replacing the per-instance limiter; the global circuit-breaker (C, the
   only bound against a *distributed* caller) is deferred behind triggers; B is C's first layer, not a
   throwaway. The old "KV vs Upstash forks on Pro" framing is **dead** — Vercel KV no longer exists,
   Pro is terms-only. **Shipped + live-verified 2026-07-23** (`d5e8ae3`;
   `tasks/done/STAGE_6_TASK_10_upload_abuse_mitigation.md`); **CO-4 (alert + WAF drill + spend caps)
   remains owner pre-release debt**, so the PRODUCTION_READINESS launch blocker is not fully closed.
   Full record: PROJECT_DECISIONS.md — "Stage 6 Item 10 — abuse mitigation";
   `research/done/RESEARCH_2026-07-21_stage6-item10-abuse-mitigation.md`.
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
- **[RESOLVED 2026-07-23 — kept for history.] Items 6, 7 and 8 were blocked on the owner, not on
  code.** All three cleared: Item 8's questions were answered (2026-07-14), Item 7 split (map shipped,
  photos became a pre-deploy swap), and Item 6's copy was produced by the 2026-07-23 research +
  owner-approval round rather than authored by the artist — Items 6 and 5 are now `ready`. The
  original note follows. **Item 8's Q1 was the cheapest of them to clear** — it is a
  decision, not an asset to produce.
- **Item 9 is folded into Item 3** (owner decision 2026-07-14 — same submit endpoint). **Item 10 is
  NOT folded in:** after the Item 1 Codex review it grew from a small honeypot/rate-limit item into a
  pre-launch blocker, was reframed as a layer, and its mechanism was **decided 2026-07-22** (Option B —
  durable per-IP Upstash quota; C deferred). It stays a separate item and must not be pulled into
  Item 3. **Done + live-verified 2026-07-23** — `tasks/done/STAGE_6_TASK_10_upload_abuse_mitigation.md`.
- Items 11/12 are low-risk, can slot in anywhere there's idle capacity; they don't block or get
  blocked by anything else. **They are the only items cuttable right now without owner content** —
  everything else waits on Item 3 (→ Item 4) or on owner-supplied copy/photos (5/6/7).
- Item 13 is the stage-closing gate — do not start it until 1–10 are done.
- **Remaining execution order — as of 2026-07-27, only Item 13 is left.** `TOOLING_TASK_02` (done,
  `599069f`) and Item 18 (done, `43aa0da` / `5a406bd` / `4a60585`) both landed as planned. Item 13
  is cut and `ready`; running it is the last Stage 6 work.
- **One unplanned item ran inside this sequence and is worth remembering:** a production deploy
  failure surfaced during Item 18 — a static metadata asset (`opengraph-image.jpg`) under the
  dynamic `[locale]` segment built clean locally and was rejected by Vercel's post-build adapter.
  Fixed by moving it to the app root with an explicit `openGraph.images` descriptor, plus a sixth
  gate step (`pnpm check:metadata`) verified by reintroducing the bug. See PROJECT_DECISIONS.md —
  "OG image lives at the app root with an explicit descriptor". **Consequence for Item 13: a green
  `pnpm qg` is closer to "deployable" than it was, but is still not proof of it** — Vercel's adapter
  cannot run in this environment.

---

## Stage 6 / Stage 7 boundary (2026-07-26)

Stage 6 no longer owns visual design. The scope line that authorized "design system refinement …
across both public and admin surfaces" was narrowed to **consistency on the public website**, and
two exit criteria ("visual and interaction quality is consistently high", "mobile experience is
polished") moved verbatim to a newly created **Stage 7 — Visual Design**, which runs before public
launch and after real photography exists.

Full reasoning: PROJECT_DECISIONS.md — "Stage 6 / Stage 7 boundary — consistency vs visual design
(2026-07-26)". Stage definitions: PROJECT_IMPLEMENTATION_PLAN.md — Stage 6, Stage 7.

**Consequence for anyone planning work here:** if a proposed change would read to an observer as
"design" — a colour choice, a font, a layout idea, art direction — it belongs to Stage 7 and must
be filed, not implemented. Item 18's task file states this as a scope boundary and the reviewers
enforce it.

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
