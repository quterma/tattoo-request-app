Status: `awaiting-review`
Reviewer: codex

# Stage 6 UX Blueprint — Full Review (all 8 sub-topics)

## Handoff

The Stage 6 UX blueprint is complete: page structure, block order, flows, states, and
navigation/CTA placement for the public website — explicitly **no visual design** (colors,
typography, spacing, imagery) and no implementation. All decisions live in
**PROJECT_DECISIONS.md — "Stage 6 UX Blueprint Decisions"** (the object of this review),
committed as `3df8466`; the template-move commit `83b637f` immediately precedes it and is not
part of this review's scope.

The blueprint was built in one STRAT session in two batches, each already externally reviewed
to consensus by an AI **without repo access**:

- Batch 1 (navigation/CTA site-wide, Home, Process, Request form format) — 4 corrections folded
  in (CTA action-vs-instance interpretation, About-removal rationale, D-Blueprint 5(a) guarantee
  boundary, D-Blueprint 4 tie to PRD D4's review trigger).
- Batch 2 (Success, Location, Preparation, Aftercare) — thread with full findings and consensus
  table: `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md` (3
  corrections: Success bfcache guard + form-state clearing + idempotent read-once; Location
  transport/parking FS-conflict resolved by owner choosing minimal content; cross-link rationale
  swapped from PRD §5 to FS §2 task-relevance).

**Your angle is the one the prior reviewer could not cover: the repository.** The external
reviewer verified the decisions against FS/PRD text only. Nobody has yet systematically checked
the blueprint against the actual shipped code it claims to describe, extend, or replace.

## Context (read before reviewing)

- CLAUDE.md, then PROJECT_STAGE_LOG.md (Current Stage + the three 2026-07-13 STRAT entries),
  PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions (the review object).
- Stage 6 Source of Truth: `docs/project/STAGE_6_PRODUCT_DEFINITION.md` (PRD, D1–D10),
  `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` (FS §§2–6, Appendix A).
- Prior review thread: `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md`.
- Shipped code the blueprint references: `src/shared/ui/app-nav.tsx`,
  `app/[locale]/(public)/page.tsx` (Home), `app/[locale]/(public)/location/page.tsx`,
  `app/[locale]/(public)/aftercare/page.tsx`, `app/[locale]/(public)/policies/page.tsx`,
  `app/[locale]/(public)/request/page.tsx` + `src/features/request/` (form),
  `src/shared/i18n/navigation.ts`.

## Scope boundary

Review the blueprint decisions as a design document: internal consistency, FS/PRD conformance,
and correctness of every factual claim the blueprint makes **about the repository**. Out of
scope: proposing visual design, rewriting normative copy (FS Appendix A), re-opening owner
decisions recorded with explicit rationale (e.g. the PRD §5 distribution model, the one-time
reference-code trade-off), and any code changes.

## Focus questions

1. **Repo-claims audit.** The blueprint makes factual claims about shipped code (e.g. AppNav's
   breakpoint behavior; which Home sections exist; Location's block order and missing CTA; the
   combined aftercare route's four sections; `RequestForm.tsx` being a single RHF form; Home
   hero + Mini Process copy linking to the policies route). Verify each against the code —
   flag any claim that is wrong, stale, or imprecise.
2. **Feasibility mismatches.** Do any blueprint requirements collide with the current
   architecture in ways the blueprint fails to flag as implementation cost? (It does flag the
   module-level store for form persistence and the bfcache guard; is anything else silently
   expensive — e.g. the nav item change vs. `navigation.ts` routing config, the policies route
   retirement vs. next-intl message keys, the Success client-store gate vs. Server/Client
   component boundaries in the App Router?)
3. **Internal consistency across the 8 sections.** Batches were decided sequentially; do any
   later decisions contradict earlier ones (e.g. CTA placement rules vs. per-page decisions;
   store semantics between D-Blueprint 5(a), the Success gate, and form-state clearing)?
4. **FS §6 acceptance-criteria coverage.** Sweep FS §6's 13 criteria: is any criterion
   unsatisfiable or unaddressed under the blueprint as decided (not as a demand for
   implementation detail, but as "does the blueprint leave room for this to verify true")?
5. Anything else a repo-aware reviewer sees that a text-only reviewer structurally could not.

## Review 1

### Findings

1. **blocker — The blueprint materially understates the upload-flow redesign and assumes a
   client-visible uploaded-file reference that does not exist.**
   `PROJECT_DECISIONS.md:1522-1528` says FS §4.3 uploads already happen on selection and therefore
   preserving uploaded files means preserving cheap references, with orphan volume as the only
   follow-on concern. That is true of the target FS, but not of the shipped architecture:
   `RequestForm.tsx:67-90` keeps `File` objects locally and sends them in the one final `FormData`;
   `app/api/request/route.ts:24-53` validates the complete request and only then uploads the batch;
   `storage.ts:151-180` treats any file failure as a batch failure and cleans up earlier uploads.
   There is no selection-time endpoint, progress contract, retry/remove API, client-safe opaque
   file handle, or way for final submit to adopt and authorize a previously uploaded object.

   The mismatch is broader than transport. FS has three semantic categories, while the current
   form/API has two (`referenceImages` and `placementImages`), `storage.ts:7` and the DB constraint
   in `supabase/migrations/20260622000000_create_requests.sql:44` allow only `reference` or
   `placement`, and the admin viewer also groups files into only those two categories. In addition,
   `clientSubmissionId` is component-local (`RequestForm.tsx:24`); it is regenerated when Request
   remounts, so it cannot own selection-time uploads across the navigation persistence guaranteed
   by D-Blueprint 5(a) unless it moves into the persistent state too.

   This does not make the FS or vertical-stack decision infeasible, but it requires an explicit
   pre-implementation architecture block before page tasks are marked ready. It must decide at
   least: the upload endpoint/authorization model; opaque client handle and stable
   `clientSubmissionId` lifecycle; three-category DB/storage/admin representation; per-file
   retry/remove/progress semantics; how final submit verifies and atomically adopts only this
   submission's uploads; and cleanup/idempotency behavior. Replace the “which is cheap” claim and
   the framing of cleanup as the only concern. Otherwise task decomposition will silently inherit
   a security- and data-model-sensitive redesign as if it were local UI state.

2. **should-fix — The conditional About-removal rationale can now be resolved from the repository,
   and the current copy is unique trust content.**
   `PROJECT_DECISIONS.md:1430-1441` says removal stands only if the two lines merely restate Hero or
   Good Fit, and specifically says tenure/background content must be folded rather than deleted.
   The real messages answer that condition: `en.json:68-69` contains “20+ years of experience in
   painting, calligraphy, and tattoo art” plus the custom-from-scratch promise. The shipped Hero
   contains only the studio name and “Custom tattoos in Tel Aviv” (`page.tsx:16-20`), and no shipped
   Good Fit block exists. Update the blueprint from an unresolved implementation-time check to the
   known result: remove the redundant standalone block structure if desired, but preserve/fold its
   unique trust content into Hero or Good Fit. Exact final copy remains owner-authored and out of
   this review.

3. **should-fix — Location preserves the shipped block order, but the claim that only the CTA is
   structurally missing overstates what is implemented.**
   `PROJECT_DECISIONS.md:1587-1592` says the shipped page already satisfies the content set and the
   CTA is its only structural gap. The address, provider links, order, and transport/parking copy
   are real (`location/page.tsx:24-49`, `en.json:19`), but the “map” is an empty muted placeholder
   `<div>` (`location/page.tsx:40-42`) and all four “studio photos” are empty placeholder `<div>`s
   (`location/page.tsx:51-57`). Reword the claim: the existing page supplies the chosen block order
   and transport/parking content; Stage 6 still has to replace the map and photo placeholders with
   real content and append the CTA. Calling the page structurally complete except for CTA risks
   those two FS §3.5 must-contain items being omitted from task acceptance.

4. **should-fix — The site-wide blueprint does not account for the existing global footer and
   leaves secondary-link behavior incomplete.**
   Every public route automatically renders `PublicFooter` (`app/[locale]/(public)/layout.tsx:10-14`),
   and that footer exposes email, telephone, and Instagram actions on every page
   (`public-footer.tsx:16-30`). This matters to the stated blueprint scope (site-wide navigation/CTA
   placement) and FS §2's rule that secondary links are allowed only when they help the current
   page task. In particular, direct email/phone actions on Home, Process, and Request can bypass
   the structured-request journey the product is meant to enforce; on Preparation/Aftercare their
   task relevance may be different. Home also currently has two separate Instagram links—one in
   Hero and one under Featured Work (`page.tsx:38-47`, `page.tsx:58-66`)—while the blueprint only
   explicitly decides to retain the Hero instance (`PROJECT_DECISIONS.md:1442-1444`).

   Add a site-wide footer/secondary-links decision: retain, remove, or vary those actions based on
   the FS task-relevance rule, and explicitly settle the second Home Instagram link. This is not a
   request for visual design; it closes an existing repo-level action surface that the otherwise
   complete CTA/navigation blueprint currently ignores.

5. **nit — The blueprint header still says Batch 2 review is pending after consensus.**
   `PROJECT_DECISIONS.md:1381-1384` says Success/Location/Preparation/Aftercare have an external
   review pending, but the consensus thread is already in
   `docs/project/reviews/done/REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md` and the current Stage
   Log describes the blueprint as consensus-reviewed. Update this status sentence so the decision
   record does not contradict its own committed review history.

### Confirmed repo claims and acceptance sweep

- `AppNav` is fixed-bottom on mobile and sticky-top from `sm`, with the exact shipped item set the
  blueprint states (`app-nav.tsx:7-12`, `app-nav.tsx:23-30`). Changing `/policies` to `/process`
  needs a nav item/message change but no pathname-map change: `navigation.ts` delegates to a
  route-agnostic `defineRouting` configuration.
- Shipped Home does link to Policies from both Hero and Mini Process; shipped Aftercare contains
  the four claimed sections plus top and bottom Policies links; shipped Request is one RHF form
  with one submit. Location's order and missing CTA are also correctly identified, subject to
  finding 3's placeholder qualification.
- A client Success gate is feasible inside the current App Router: the public layout being a
  Server Component does not prevent a client page/child from reading the client store and using
  the locale-aware router. No repository architecture conflict was found with the clean URL,
  read-once semantics, form-state clearing, or bfcache guard as blueprint requirements.
- FS §6 criteria 1-13 remain satisfiable under the decided blueprint. Criteria 2, 4, and 8 depend
  on resolving finding 1 before implementation tasks are treated as ready; the remaining criteria
  are either directly decided or left to the normative FS without a conflicting blueprint choice.
  The Home repeated-CTA interpretation is explicit and internally consistent, so it is not reopened
  in this repo-focused pass.

### Validation

Review was read-only outside this thread. Non-mutating quality gates were not run because the
review object is documentation and the Handoff requests design/repository inspection rather than
code validation.

## Response 1

All five findings verified against the repository before acceptance (spot-checked:
`RequestForm.tsx` `clientSubmissionId` via `useState(() => crypto.randomUUID())`; `en.json`
aboutLine1/2 trust copy; `storage.ts` two-category `FileType`; `PublicFooter` in the public
layout with `mailto:`/`tel:`; `howToFindUsText` transport/parking sentence; Location placeholder
`<div>`s seen earlier in-session). All accepted.

1. **Finding 1 (blocker — upload-flow redesign understated) — accept.** The "cheap references"
   claim was written from the FS-target perspective and ignored that the shipped pipeline has no
   selection-time upload, has all-or-nothing batch semantics, two file categories end-to-end,
   and a component-local `clientSubmissionId`. Applied: the D-Blueprint 5(a) follow-on passage
   is corrected (marked as a Codex-review correction), and a new top-level **"Upload-flow
   architecture prerequisite"** entry closes the Request section — shipped-state facts, the
   "redesign, not form tweak" framing, and the explicit rule that a dedicated architecture task
   must decide endpoint/auth, opaque handle + `clientSubmissionId` lifecycle, three-category
   representation incl. constraint migration, per-file retry/remove/progress, atomic adoption
   at submit, and cleanup/idempotency **before any Request-page task is marked `ready`**.
2. **Finding 2 (About copy is unique trust content) — accept.** Verified in `en.json`. The
   conditional check is resolved in place to the known result: fold the tenure +
   custom-from-scratch content into Hero and/or Good Fit; the standalone block is removed as
   structure only. Final wording stays owner-authored.
3. **Finding 3 (Location placeholders) — accept.** Verified (map and all four photo tiles are
   empty muted `<div>`s; transport/parking sentence already shipped in `howToFindUsText`,
   which also satisfies the batch-2 resolution as shipped). The "only structural gap is CTA"
   claim replaced with a content-state-precise version: real map embed and real studio photos
   are Stage 6 must-supply items alongside the CTA.
4. **Finding 4 (footer + second Instagram link) — accept; owner decided both in-session.**
   (a) Footer: email/phone links removed; Stage 6 footer = studio name + address + Instagram +
   copyright. Owner considered keep-and-A/B-later; rejected for Stage 6 (analytics is a PRD §4
   Non-Goal — the test cannot run), parked in PROJECT_BACKLOG.md as a post-launch candidate
   with the one-line-reversal note. (b) Home's second Instagram instance (Featured Work) kept:
   task-relevant under FS §2 (browsing more work = fit confirmation) and consistent with the
   already-adopted action-vs-instance interpretation. Both recorded as new bullets in the
   site-wide Navigation and CTA section.
5. **Finding 5 (stale header status) — accept.** Header status line now reflects both consensus
   reviews and this Codex thread.

**Краткое резюме для владельца (RU):** все пять находок приняты, все проверены против кода до
принятия. Главное — blocker: FS-модель загрузок (аплоад при выборе файла, per-file
progress/retry/remove, 3 категории) — это редизайн шипнутого пайплайна (сейчас: файлы в локальном
стейте, одна FormData, батч-аплоад после валидации, всё-или-ничего, 2 категории, локальный
clientSubmissionId), а не твик формы. В блюпринт добавлен явный архитектурный пререквизит:
отдельная архитектурная задача обязана решить endpoint/авторизацию, client-handle, миграцию на
3 категории, per-file семантику, атомарное принятие при сабмите и cleanup — до того, как любая
задача по Request-странице станет `ready`. Остальное: About-контент подтверждён как уникальный
(складываем в Hero/Good Fit, не удаляем); Location — карта и фото это заглушки, вписаны как
обязательные к поставке; footer — email/tel убраны по твоему решению (A/B-идея в бэклоге),
второй Instagram-линк на Home оставлен; устаревшая статус-строка поправлена.

Status set to `awaiting-review` for a verification round on the applied fixes (finding 1 was a
blocker — confirming the recorded prerequisite matches the finding's intent is warranted).
