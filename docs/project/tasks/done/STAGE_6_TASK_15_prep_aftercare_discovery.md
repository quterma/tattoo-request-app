# Task: Stage 6 — move Preparation/Aftercare discovery from the footer to Process (Item 15)

## Status

`done` · created 2026-07-23 · owner decision 2026-07-23 · **reverses part of the 2026-07-14
decision** — requires a PRD §5 + FS §2 amendment (PRD §9 change control), see below.
Implementation complete, independent Codex cross-review reached consensus after 4 rounds
(`reviews/done/REVIEW_2026-07-24_stage6-item15-prep-aftercare-discovery.md`), all CO-1/CO-2/CO-3
CLOSED with reproducible evidence, `pnpm qg` green in full. Not yet committed — pending owner
approval per CLAUDE.md Workflow.
**Sequence:** run **after** Item 6 (`STAGE_6_TASK_06_process_content.md`), which creates the
replacement discovery path (the Preparation/Aftercare links in the Process FAQ). Removing the footer
links before that would leave the pages with no in-product discovery at all.

## Execution

- Executor: `claude` or `codex`. Small, but it **amends two governing documents** — the doc edit is
  the risky half, not the code. If delegated: `Executor: codex`, `Reviewer: claude`.
- Baseline: Item 6's commit.
- Reviewer: `claude` + independent Codex cross-review to consensus (touches source + governing docs).
- Allowed Write Surface: `src/shared/ui/public-footer.tsx`, `src/shared/i18n/messages/en.json`
  (footer link labels), `docs/project/STAGE_6_PRODUCT_DEFINITION.md` (§5),
  `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` (§2), `docs/project/PROJECT_DECISIONS.md`
  (amend the 2026-07-14 entry — append, do not rewrite history), tests, PROJECT_* reporting docs.
  **Extended 2026-07-24 (owner approval, Codex cross-review Round 3):** `docs/files-structure.md` —
  precedent `STAGE_6_TASK_02_site_wide_shell.md` / Item 5's resolution — the mandatory `pnpm structure`
  regenerates it as a byproduct of this task's own review-thread file existing; it cannot be excluded
  from the surface without leaving the mandatory gate permanently unrunnable for this task.
- May touch dependencies / migrations: **no**.

## Context

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **What is being reversed.** On 2026-07-14 (Item 8 Q1) the owner decided Preparation/Aftercare are
   reached by **artist-sent direct URL (primary)** + **two links in the global footer** (fallback
   discovery), and this amended PRD §5 and FS §2. Record: PROJECT_DECISIONS.md —
   "Preparation/Aftercare in-product discovery (2026-07-14)". At that time `process.aftercareLink`
   was deliberately **removed**, on the argument that a Process reader deciding "are we a fit" is not
   served by an aftercare link.
3. **Why it changes now (owner, 2026-07-23).** The footer is the wrong home for them: it should carry
   Instagram + studio identity only. Process is the natural place — and Item 6's new FAQ answer
   ("How do I prepare — and what about healing?") gives them a contextual, well-placed home rather
   than the bare link that was rejected in July. The 2026-07-14 concern is satisfied: the links sit
   at the *end* of Process, inside an FAQ the fit-deciding reader can skip.
4. The artist-sent direct URL remains the **primary** path in both the old and new decision — only
   the in-product fallback moves.

## Scope

1. **Remove** the Preparation and Aftercare links from `public-footer.tsx` (and their i18n keys if
   unused elsewhere). Footer keeps: studio name, address, Instagram, copyright.
2. **Amend FS §2** — the sentence currently reads that these pages are reached "by the artist-sent
   direct URL (primary path) and by two links in the global footer as in-product fallback discovery
   (PRD §5)". Replace the footer clause with the Process FAQ as the fallback path. Keep the existing
   guarantee that they are **not** primary navigation and do not become a fifth/sixth nav item.
3. **Amend PRD §5** correspondingly — both documents must move together (a field/contract change that
   syncs only one leaves a desync that review catches late).
4. **Append to PROJECT_DECISIONS.md** — extend the 2026-07-14 entry with a dated 2026-07-23
   amendment recording what changed and why. Do not delete or rewrite the original decision text.
5. Verify no other inbound link to `/preparation` or `/aftercare` was relying on the footer.

## Out of Scope

- Adding these pages to primary navigation — **still forbidden** (PRD D9: nav is exactly
  Home/Process/Request/Location).
- A page CTA to Preparation/Aftercare.
- The Process FAQ links themselves (delivered by Item 6).
- Push/Telegram notification delivery of these URLs — post-launch (Telegram is a PRD Non-Goal for
  the initial release); noted by the owner as a future channel, not this task.

## Completion obligations

```text
- CO-1 — Discovery is never zero: confirm Item 6 shipped the Process FAQ links BEFORE this task's
  footer removal lands (check the live/built page, not just the task file). Disposition: CLOSED —
  confirmed via `pnpm build && pnpm start`, `curl http://localhost:3000/en/process`: rendered HTML
  contains `href="/en/preparation"` and `href="/en/aftercare"` inside the FAQ answer. Source location:
  `app/[locale]/(public)/process/page.tsx:100-103` (`t.rich("faqItems.4.a", ...)`). Same live fetch
  confirmed the rendered `<footer>` now contains only studio name, address, Instagram link, and
  copyright — no `/preparation`/`/aftercare` links remain there.
- CO-2 — PRD §5 and FS §2 both amended in the same commit, mutually consistent, and neither still
  describes footer links. Disposition: CLOSED — `STAGE_6_PRODUCT_DEFINITION.md` §5 and
  `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §2 both amended to name the Process FAQ as the fallback
  path; both retain artist-sent URL as primary and "not primary navigation" guarantee.
- CO-3 — No orphaned i18n keys or dead links to /preparation, /aftercare. Disposition: CLOSED —
  `footer.preparation`/`footer.aftercare` removed from `en.json`; grep across `app/` + `src/`
  (runtime code only, excluding docs/task files which intentionally discuss these strings) confirms
  the removed footer keys have no runtime consumers and the only remaining `/preparation`/
  `/aftercare` link usages are the two Process FAQ links.
```

## Review Granularity

`single` — one component + coordinated doc amendments.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Commit only on explicit owner approval.
