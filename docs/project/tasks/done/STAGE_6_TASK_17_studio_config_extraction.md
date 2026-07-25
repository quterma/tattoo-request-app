# Task: Stage 6 — extract studio data to a single config + consolidate placeholder markers (Item 17)

## Status

`done` · created 2026-07-23 · owner decision 2026-07-23 (raised during the Item 6 plan review) ·
closed 2026-07-25. Cross-review ran 9 rounds; all findings accepted and applied. The loop was
**ended by owner decision, not by a confirming clean round** — Rounds 4–9 produced no
production-code finding, only self-inflicted reporting-doc churn. Residual risk accepted; a
re-review before release is filed in `PROJECT_BACKLOG.md` ("Re-review Item 17 before release").
Thread: `reviews/done/REVIEW_2026-07-25_stage6-item17-studio-config-extraction.md`.
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
  **Extended during implementation (owner-approved 2026-07-25, in-session — see
  PROJECT_STAGE_LOG.md's 2026-07-25 entry for the discovery that forced it):** new
  `src/config/env.ts` (the pre-existing secrets `config` object, split out so the client-safe
  `studio` barrel export doesn't drag `server-only` into client bundles); `eslint.config.mjs` (one
  allowlist entry, `**/config/env`, matching the existing `**/services/supabaseAuth` precedent);
  the 5 modules that read `config` and switched their import path accordingly
  (`src/services/supabase.ts`, `src/services/uploadToken.ts`, `src/bff/uploadQuota.ts`,
  `app/api/request/route.ts`, `app/api/upload/route.ts`); `app/[locale]/layout.tsx` and
  `app/[locale]/opengraph-image.tsx` (Codex Review 1 Finding 1 — two bare studio-name identity
  literals that needed to move to `studio.name`); `docs/files-structure.md` (mechanical,
  `pnpm structure` output). **Further extended (owner-approved 2026-07-25, Round 2):**
  `src/features/admin/config/index.ts` — comment-only fix, corrects a stale `@/config` reference
  (the file has no studio value; Codex Review 1 Finding 5 caught the comment describing the
  pre-split import chain). `app/[locale]/layout.tsx` (comment only, 2 spots), `app/icon.svg` —
  repointing the in-code `__meta_TODO` pre-deploy-swap comments from `STAGE_6_STRAT_BRIEF.md` to
  `PROJECT_PRODUCTION_READINESS.md` (Codex Review 2 Finding 3 — CO-2's combined grep is
  documented in READINESS, not the brief; the in-code pointers had to agree). The brief itself is
  STRAT-only and left untouched — its own stale content (separate-grep convention, a reference to
  the now-removed `INSTAGRAM_HANDLE`) is flagged as deferred STRAT work in
  `PROJECT_STAGE_LOG.md`'s 2026-07-25 entry, not fixed by this IMPL session. **Further extended
  (owner-approved 2026-07-25, Round 3):** `src/features/request/config/index.ts` — mechanical
  fallout of removing `INSTAGRAM_HANDLE` from `form.ts` (Scope §2); the barrel's re-export list
  had to drop the same name (Codex Review 3 Finding 2).
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
   documented convention — a single combined grep (`grep -rn "__meta_TODO\|__intro_TODO\|__asset_TODO" app/ src/ public/`)
   with a one-line note per marker category — and record it in **`PROJECT_PRODUCTION_READINESS.md`**
   (a durable pre-release doc, and in this task's write surface as a `PROJECT_*` reporting doc). The
   goal the owner named: find every placeholder without remembering which grep to run.
   - **Do NOT put it in `STAGE_6_STRAT_BRIEF.md`** (corrected 2026-07-24 during plan review). The
     brief is STRAT-only (outside the executor's write surface — the exact conflict Item 5's CO-3
     hit) *and* it is overwritten each STRAT session, so a durable convention does not belong there.
     The brief may later carry a one-line pointer to the READINESS doc — that pointer is a STRAT
     session's job, not this task's.
   - Renaming the three markers into one prefix is **out of scope** — they are embedded across ~15
     done tasks/reviews; the combined grep gives one-step discovery without that churn.
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
  exactly one authoritative place, with every consumer reading from it. Disposition: CLOSED.
  Evidence: `grep -rn "Masha Karda" app/ src/` and the same for `mashakarda_tattoo`/`Herzl 100`
  (2026-07-25, post Codex Review 1 fix) — `instagramHandle`/`instagramUrl`/`address` appear only in
  `src/config/studio.ts`; `name` appears in `src/config/studio.ts` plus three composite-sentence
  i18n keys (`app.title`, `app.titleTemplate`, `app.ogTitle`) that the task's Out-of-Scope boundary
  explicitly permits to stay in i18n. Codex Review 1 caught two remaining bare-identity consumers
  (`app.siteName` in `en.json`/`layout.tsx`'s `openGraph.siteName`, and the OG-image body literal in
  `opengraph-image.tsx`) that were not sentences and had to move to `studio.name` — fixed, re-grepped
  clean, re-verified live (`og:site_name` meta tag confirmed via curl).
- CO-2 — Placeholder discovery is one step: a single combined grep is documented in
  `PROJECT_PRODUCTION_READINESS.md` (NOT the STRAT brief — see Scope §4) and returns every pending
  pre-deploy swap. Disposition: **CLOSED for this task's own code** (the combined grep exists,
  documented, and every in-code/data pointer this session controls reaches it) **— OPEN pending
  STRAT-level follow-up** for two files outside this IMPL session's authority to edit:
  1. `docs/project/tasks/STAGE_6_TASK_16_placeholder_assets.md` (`draft`) still instructs its
     future executor to run the separate `__asset_TODO` grep and write the result into
     `STAGE_6_STRAT_BRIEF.md`'s "Pre-deploy swaps to track" — the superseded convention.
  2. `STAGE_6_STRAT_BRIEF.md` itself still documents separate `__meta_TODO`/`__asset_TODO` greps
     and references the now-removed `INSTAGRAM_HANDLE`.
  Until a STRAT session amends both, the repository still carries an executable path back to the
  conflicting convention (Codex Review 3/4). Filed as a canonical work item in
  `PROJECT_BACKLOG.md` ("Placeholder-marker convention: Item 16 and STRAT brief still teach the
  superseded grep") per AI_TASK_PROTOCOL.md — a Stage Log sentence alone is not a work item.
  Evidence for the closed half: "Pre-Deploy Content Swaps" section added to
  `PROJECT_PRODUCTION_READINESS.md`, combined grep `grep -rn "__meta_TODO\|__intro_TODO\|__asset_TODO"
  app/ src/ public/` documented with one line per marker category. Codex Review 2 caught that the
  in-code/data `__meta_TODO` pointers (all 5: `layout.tsx` x2, `opengraph-image.tsx`, `app/icon.svg`,
  `en.json`'s `app.__meta_TODO` value) still named `STAGE_6_STRAT_BRIEF.md`, which itself still
  described the superseded separate-grep convention — following the pointer would not reach the
  new combined command. Fixed: all 5 repointed to `PROJECT_PRODUCTION_READINESS.md`; re-grepped
  (`grep -rn "STAGE_6_STRAT_BRIEF" app/ src/`) — zero remaining in-code/data references.
- CO-3 — Live check: /en, /en/process, /en/location and the footer still render the same values as
  before the extraction (this is a refactor — visible output must not change). Disposition: CLOSED.
  Evidence: `pnpm build && pnpm start` + `curl` against `/en`, `/en/process`, `/en/location`
  (2026-07-24 initial check; repeated 2026-07-25 after each of Review 1 through Review 5's fixes,
  5 repetitions total) — footer (name/address/Instagram URL), Home hero (name, Instagram link +
  handle span `@mashakarda_tattoo`), location page (address text, Google/Apple/Waze map links,
  embedded iframe query), and `og:site_name` meta tag all byte-identical to the pre-extraction
  values on every repetition.
```

## Review Granularity

`single` — mechanical extraction across a handful of files.

## Workflow (enforced)

Per CLAUDE.md + AI_REVIEW_PIPELINE.md: Test → `pnpm qg` → Review Agent → independent Codex
cross-review to consensus. Commit only on explicit owner approval.
