# Review: Stage 6 Item 2 — site-wide shell (nav, footer, CTA, `policies` → `process`)

Status: `awaiting-review`
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
