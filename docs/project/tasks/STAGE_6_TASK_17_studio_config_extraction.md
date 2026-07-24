# Task: Stage 6 — extract studio data to a single config + consolidate placeholder markers (Item 17)

## Status

`ready` · created 2026-07-23 · owner decision 2026-07-23 (raised during the Item 6 plan review)
**Sequence:** run **after Items 6 and 5**, and **before the visual pass**. Items 6/5 hold large
`en.json` edits — doing this concurrently would collide on the same file. Doing it before the visual
pass means the visual work reads final values from one place instead of chasing duplicates.

## Execution

- Executor: `claude` or `codex` — mechanical extraction, no product decisions. If delegated:
  `Executor: codex`, `Reviewer: claude`.
- Baseline: Item 5's commit.
- Reviewer: `claude` + independent Codex cross-review to consensus (touches source).
- Allowed Write Surface: new `src/config/studio.ts`, `src/config/index.ts` (export),
  `src/shared/i18n/messages/en.json`, `src/features/request/config/form.ts`,
  `app/[locale]/(public)/location/page.tsx`, `src/shared/ui/public-footer.tsx` (if it renders studio
  values), any component reading the extracted values, tests, PROJECT_* reporting docs.
- May touch dependencies / migrations: **no**.

## Context

1. Mandatory Pre-task Sync per CLAUDE.md.
2. **The problem (owner-spotted 2026-07-23).** Studio-identity data is scattered across three
   places, and one value is duplicated in two of them:
   - `INSTAGRAM_HANDLE` — `src/features/request/config/form.ts` (a feature module)
   - **studio address** — hardcoded inline in `app/[locale]/(public)/location/page.tsx`
     (`"Herzl 100, Tel Aviv, Israel"`, inside the map URL)
   - studio name, Instagram handle, Instagram URL — `src/shared/i18n/messages/en.json`

   The handle exists in **both** `form.ts` and `en.json` — that duplication is exactly what produced
   the drift Item 6 had to fix by hand (`"your_studio"` vs the real handle). Fixing the values
   without removing the duplication guarantees it drifts again.
3. **The distinction this task establishes** (the reason it is worth doing, beyond tidiness):
   - **i18n = things that get translated** (sentences, labels, headings).
   - **Studio config = things that do NOT get translated but DO change per studio** (name, address,
     handle, URLs). These live in `en.json` today only because they happen to be strings. Adding
     Hebrew would force the address to be duplicated across three locale files despite being one
     value; adding a second studio would force forking `en.json` wholesale to change a handful of
     values.
4. Architectural boundary — **keep it plain** (PROJECT_DECISIONS.md — Service Layer Decisions: no
   provider abstractions, DI, or factories without a second real provider). This is one module of
   exported constants, not a CMS, not a theming system, not a multi-tenant resolver. Multi-studio
   customization remains post-MVP; this task only stops the bleeding.

## Scope

1. **Create `src/config/studio.ts`** — the single source for non-translated studio identity:
   - `name` (`"Masha Karda"`), `instagramHandle` (`"mashakarda_tattoo"`), `instagramUrl`,
   - `address` (the human-readable string used for display **and** the map query),
   - anything else found during the sweep that is studio-specific and untranslated.
   Server/client-safe (no `server-only` — the public pages are RSC but values are non-secret).
   Export via `src/config/index.ts` if that barrel exists for this purpose; do not create a new
   import convention.
2. **Remove the duplication.** `form.ts`'s `INSTAGRAM_HANDLE` re-exports from (or is replaced by)
   the studio config. `en.json`'s `instagramHandle` / `instagramUrl` / `footer.studio` /
   `home.title` stop holding studio identity where a component can read it from config instead —
   **but see the boundary in Out of Scope: sentences that embed the name stay in i18n.**
3. **De-hardcode the address** in `location/page.tsx` — build the map query from the config value.
4. **Consolidate placeholder markers.** Today three independent markers exist (`__meta_TODO`,
   `__intro_TODO`, `__asset_TODO`) and finding all pending swaps needs three greps. Produce one
   documented convention (single marker prefix, or one comment block listing every pending swap with
   its location) and point STAGE_6_STRAT_BRIEF.md's "Pre-deploy swaps to track" at it. The goal
   the owner named: find every placeholder without remembering which grep to run.
5. **Sweep for anything missed** — grep for other studio-specific literals in `app/` and `src/`
   (phone, email, coordinates, URLs) and fold them in or explicitly note why they stay.

## Out of Scope

- **Prices, deposit amounts, and policy text stay in i18n.** They are woven into sentences
  ("₪1,000 per hour, with a ₪2,000 minimum") — extracting them into config would either fragment the
  copy into string interpolation or duplicate the numbers. Deliberate boundary, not an oversight.
- CMS, admin-editable content, theming, or any multi-studio resolution mechanism (post-MVP).
- Client contact values in the admin UI (`mailto:`/`tel:` in `RequestDetail.tsx`) — those are per-
  request data from the DB, correctly not config.
- Any copy change. This task moves values; it does not re-word anything.

## Completion obligations

```text
- CO-1 — No studio value has two sources: grep confirms the handle, name, and address each appear in
  exactly one authoritative place, with every consumer reading from it. Disposition: OPEN.
- CO-2 — Placeholder discovery is one step: a single documented command/marker lists every pending
  pre-deploy swap, and the STRAT brief points at it. Disposition: OPEN.
- CO-3 — Live check: /en, /en/process, /en/location and the footer still render the same values as
  before the extraction (this is a refactor — visible output must not change). Disposition: OPEN.
```

## Review Granularity

`single` — mechanical extraction across a handful of files.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Commit only on explicit owner approval.
