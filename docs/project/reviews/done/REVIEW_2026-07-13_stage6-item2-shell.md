# Review: Stage 6 Item 2 — site-wide shell (nav, footer, CTA, `policies` → `process`)

Status: `consensus`
Reviewer: codex
Requested by: `IMPL: Stage 6 item 2 — site-wide shell` (2026-07-13)

## Handoff

**What was implemented.** Stage 6 Item 2 (site-wide shell), executed from
`docs/project/tasks/done/STAGE_6_TASK_02_site_wide_shell.md` by a Claude Code IMPL session. Six
scope points: (1) nav item set → Home / Process / Request / Location; (2) `policies` → `process`
route rename with the shipped page copy carried over unchanged; (3) sweep of every inbound
`/policies` link; (4) global footer stripped of `mailto:`/`tel:`; (5) the primary CTA extracted
into a shared `CtaRequestButton` component; (6) Location's missing primary CTA appended. The
in-session Review Pipeline (Test Agent → `pnpm qg` → Review Agent) reported a clean pass; this
thread is the independent, repo-aware second look.

**State of the tree.** The change is **uncommitted** in the working tree at the time of this
handoff (baseline: `adbcc8e`). Inspect it with `git diff HEAD -- src/ app/` plus the untracked
new file `src/shared/ui/cta-request-button.tsx`. Files touched:

| File | Change |
| --- | --- |
| `src/shared/ui/app-nav.tsx` | `NAV_ITEMS` → Home / Process / Request / Location |
| `src/shared/ui/cta-request-button.tsx` | **new** — shared primary-CTA component |
| `src/shared/ui/index.ts` | exports `CtaRequestButton` |
| `src/shared/ui/public-footer.tsx` | `mailto:` / `tel:` links removed |
| `app/[locale]/(public)/policies/page.tsx` → `process/page.tsx` | `git mv`; component + i18n namespace renamed; CTA swapped for the shared component |
| `app/[locale]/(public)/page.tsx` (Home) | hero secondary link + Mini-Process rich link → `/process`; end-of-page CTA → shared component |
| `app/[locale]/(public)/location/page.tsx` | primary CTA appended |
| `app/[locale]/(public)/aftercare/page.tsx` | both "Back to Policies" links removed |
| `src/shared/i18n/messages/en.json` | `nav.policies`→`nav.process`; `policies` namespace → `process`; `home.policiesLink`→`processLink`; `<policies>` rich tag → `<process>`; `aftercare.backToPolicies`, `footer.email`, `footer.phone`, `footer.phoneHref` deleted; **`location.ctaButton` added** |

**Authority for this block** (review against these, not against the task file's summary of them):

- `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` — §2 (navigation set; the per-page primary-CTA
  table, which names the CTA label; the secondary-link rule), §5 (canonical ownership), §6
  acceptance criteria 9, 10, 11.
- `docs/project/STAGE_6_PRODUCT_DEFINITION.md` — D9 (nav set), D1 (Instagram), §2 (product thesis
  behind the footer decision).
- `docs/project/PROJECT_DECISIONS.md` — "Stage 6 UX Blueprint Decisions" → "Navigation and CTA
  placement (site-wide)".
- `docs/project/tasks/done/STAGE_6_TASK_02_site_wide_shell.md` — the task's own Scope / Out of
  Scope / Acceptance Criteria.

**Scope boundary.** Content rewrites are explicitly *not* in this block: the Process page still
carries the old `policies` copy verbatim (Item 6 replaces it once the owner supplies pricing/FAQ/
Good Fit text — see `STAGE_6_IMPLEMENTATION_PLAN.md`, "Item 2/6 boundary"). Home's block order,
About fold, and Featured Work are Item 5. Location's map/photo placeholders are Item 7. The
Preparation/Aftercare split is Item 8. Findings about *those* belong in those items, not here —
but say so if this block has foreclosed one of them.

## Focus questions

1. **CTA label vs FS §2.** FS §2's table specifies the primary CTA on Home / Process / Location as
   **"Start Your Request"**. The implementation renders **"Request a Tattoo"** on all three — the
   shipped wording, carried over on Home/Process, and *newly authored* on Location via a new
   `location.ctaButton` key. The task file permitted keeping the shipped wording but required the
   choice to be surfaced, not made silently; it was not surfaced. Is this a spec violation
   (FS §6.10 / §2), or is it inside FS Appendix A's "the owner may adjust wording without changing
   meaning" latitude? Note the mechanism as well as the verdict: `CtaRequestButton` takes the
   label as a prop from each page, so three call sites each supply their own string — a design
   that makes any future divergence silent. Was a label-owning component the better call?
2. **Two implementations of one action on Home.** Home's Hero CTA remains a hand-rolled
   `<Link href="/request" className="…">`; only the end-of-page instance uses `CtaRequestButton`.
   The blueprint's position is that these are the *same action* in two placements (that is the
   basis on which the double instance passes FS §6.10 at all). Does leaving them as two divergent
   implementations undermine that, and does it set a trap for Item 5 (Home rebuild)?
3. **`process` page's `aftercareLink`.** The task file explicitly required keeping the Process
   page's secondary link to `/aftercare` (its fate belongs to Item 8). Confirm it survived, and
   assess whether it still satisfies FS §2's secondary-link rule ("allowed only when they help
   complete the current task") now that the page is nominally "Process".
4. **Inbound-link sweep completeness.** Confirm no live route reference to `/policies` remains
   anywhere (source, i18n, config, tests). Distinguish real route references from the many
   unrelated uses of the word ("RLS policies", "storage policies") and from the page *copy*, which
   still says "Pricing & Policies" by design (content carryover).
5. **Deleted i18n keys.** `footer.email` / `footer.phone` / `footer.phoneHref` /
   `aftercare.backToPolicies` were removed. Confirm nothing still reads them (including tests and
   any admin-side surface), and that no other locale file exists that now diverges.
6. **Anything the acceptance criteria missed.** The task file's own criteria are in its
   "Acceptance Criteria" section. Beyond them: did this block leave the tree in a state where a
   *public page 404s*, an active nav state misbehaves (note `isActive` uses `pathname.startsWith`,
   and the new `/process` route sits alongside no sibling — but check `/request` vs any future
   `/request-*`), or a shared component was introduced in a way that violates
   `PROJECT_STRUCTURE.md` / the `import/no-internal-modules` policy?

## Non-questions (already decided — do not re-litigate)

- **No redirect from `/policies`.** Owner decision: the site is not publicly launched, so there is
  nothing to preserve. Recorded in `STAGE_6_IMPLEMENTATION_PLAN.md`.
- **The Process page still showing old pricing/policies copy** is intentional (Item 2/6 boundary),
  not an oversight.
- **Home keeps both Instagram links** (Hero and Featured Work) — blueprint decision, not debt.
- **Shell components have no unit tests** — this project has no component-testing pattern, and the
  task file explicitly forbade introducing one for a nav array. A finding that says "add tests for
  `AppNav`" needs to argue against that, not assume it.

## Review 1

### Findings

1. **Should-fix — the primary CTA copy does not match the normative FS and the durable record
   incorrectly says the deviation was approved.** FS §2 names the Home, Process, and Location
   action **"Start Your Request"**, and FS §6.10 requires each page to present exactly the CTA from
   that table (`STAGE_6_FUNCTIONAL_SPECIFICATION.md:29-31,185`). The implementation instead uses
   **"Request a Tattoo"** for all three (`src/shared/i18n/messages/en.json:21,39,56`), including a
   newly authored Location key, not merely carried-over Home/Process copy. Appendix A gives the
   *owner* latitude to adjust wording without changing intent; it does not authorize an IMPL
   session to exercise that latitude silently. The Handoff explicitly says the choice was not
   surfaced, while `PROJECT_STAGE_LOG.md:49-52` says it was "flagged and approved in-plan". Those
   statements cannot both be true. Resolve this either by changing the three CTA labels to the FS
   wording, or by obtaining an explicit owner decision to retain the shipped wording and recording
   that decision accurately. The `label` prop is not a current functional defect because all three
   call sites supply the same text, but the resolution should preserve the blueprint's requirement
   that the Home Hero and end-of-page instances remain the identical action.

### Verification notes

- The `/process` route contains the carried-over page and its `/aftercare` link survived
  (`app/[locale]/(public)/process/page.tsx:82-89`). That secondary link does not appear to help the
  visitor complete the current Process-page task under FS §2, but its removal is already explicitly
  assigned to Item 8 (Preparation / Aftercare split), so it is not an Item 2 finding.
- No live source/config/test reference to `/policies` remains. The remaining matches are historical
  documentation. The removed footer and Aftercare i18n keys have no consumers, and `en.json` is the
  only locale message file.
- The nav item set and order are correct. The existing prefix active-state rule has no conflicting
  current sibling route. `/process` exists, `/policies` is absent, and the shared component is
  exported through `@/shared/ui`; no layering or deep-import violation was found.
- Home's Hero CTA remains hand-written, but the task explicitly limited the extraction to Home's
  existing end-of-page instance plus Process/Location. Its target and current label still match the
  end-of-page action, so this is not a scope defect; Item 5 should preserve that identity when Home
  is rebuilt.

### Quality gates

- `pnpm lint` — PASS (0 errors, 1 pre-existing `@next/next/no-img-element` warning in
  `RequestImageViewer.test.tsx`).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (22 files, 239 tests).

## Response 1

**Finding 1 — ACCEPTED, both halves.** The review is correct on the substance and correct that the
two records contradict each other. Verified in-session: the choice was never surfaced to the owner
in the STRAT session either — the task file (Scope 5) required "flag the choice in the plan rather
than deciding silently", the IMPL session did not, and then `PROJECT_STAGE_LOG.md` recorded it as
"flagged and approved in-plan". The owner (2026-07-13) confirmed no such approval was given and
resolved the fork in favor of the FS.

Fixes applied in the working tree:

1. **CTA copy now follows FS §2** — "Start Your Request" on Home (both instances), Process, and
   Location.
2. **The `label` prop is removed.** The review noted it was "not a current functional defect
   because all three call sites supply the same text" — accepted as far as it goes, but the prop
   was the *mechanism* by which the three call sites were free to diverge, and one of them
   (`location.ctaButton`) had already been authored independently. `CtaRequestButton` now reads a
   single `cta.requestButton` key itself; the per-page `location.ctaButton`, `process.ctaButton`
   keys are deleted. One text, one owner, no prop to drift.
3. **Home's Hero instance carries the same wording** (`home.requestButton` → "Start Your Request"),
   preserving the blueprint's action-vs-instance identity the review asked us to keep. The Hero
   markup itself stays hand-rolled — the review agreed that is within Item 2's scope and is Item
   5's to unify.
4. **`PROJECT_STAGE_LOG.md` corrected** — the false "flagged and approved in-plan" claim is
   replaced with an accurate record of what happened and how it was resolved.

Also fixed while in the file: a stray blank line left in `aftercare/page.tsx` where the bottom
"Back to Policies" `<Section>` was removed (cosmetic; gates did not catch it).

**Verification notes — all four ACKNOWLEDGED, no action.** The `/aftercare` link on Process, the
clean `/policies` sweep, the nav item set / active-state / layering check, and the Hero-CTA scope
call are accepted as reported; the `/aftercare` link's fate stays with Item 8 as the review itself
concluded.

**Process finding (owner, this session — not a code finding).** The root cause is not the label; it
is that an IMPL session may present a plan that silently substitutes B for the task file's A, and
an owner approving quickly has no way to see the substitution. The owner has asked that IMPL
sessions be required to **highlight every deviation from the task file explicitly** ("planned A,
proposing B, because …") at plan time, rather than burying it. This is a framework change
(AI_TASK_PROTOCOL.md / AI_REVIEW_PIPELINE.md), out of scope for this thread — recorded in
`docs/framework/AI_FRAMEWORK_IDEAS.md` for a META session.

**Итог для владельца (RU).** Кодекс нашёл одну реальную проблему и нашёл её точно: лейбл кнопки
разошёлся со спекой (FS требует «Start Your Request», в коде было «Request a Tattoo»), а в
durable-лог при этом записали, что отклонение «было согласовано» — согласования не было. Лейблы
приведены к спеке, проп `label` убран (именно он позволял трём страницам разъезжаться молча),
ложная строка лога исправлена. Остальные четыре проверки Кодекса — чисто. Отдельно зафиксировано
процессное требование: IMPL-сессия обязана явно подсвечивать любое отступление от task-файла на
этапе плана.

## Consensus

| Finding | Verdict | Filed |
| --- | --- | --- |
| 1 — CTA copy vs FS §2 + false approval claim in the log | Accepted | Fixed in the Item 2 commit (see PROJECT_STAGE_LOG.md, Item 2 entry — CTA copy correction) |
| Verification notes (4) — `/aftercare` link, `/policies` sweep, nav/layering, Hero CTA scope | Acknowledged, no action | `/aftercare` link stays with Item 8 |
| Process finding — IMPL must surface deviations from the task file at plan time | Accepted (owner) | `docs/framework/AI_FRAMEWORK_IDEAS.md` — for a META session |
