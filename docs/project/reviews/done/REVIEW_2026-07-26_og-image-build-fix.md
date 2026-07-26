Status: `consensus` · round 1, no disputed findings
Reviewer: codex
Requested by: IMPL: Stage 6 Item 18 — Vercel OG-image build fix (out-of-band hotfix)

## Handoff

**Process note first, because it affects what this review is for.** This block was committed
**before** its cross-review — the wrong order. AI_TASK_PROTOCOL.md requires an independent review to
consensus before a code block's commit is proposed; this session went from the research findings
straight to implementation, self-verification, and a commit. The owner ruled the recovery: review
now, **before the push**, which has not happened. So the commit exists but nothing is published —
the review still lands ahead of the only irreversible step.

Reviewed object: commit **`ba448a1`**, currently `HEAD`, **unpushed** (`origin/main` is at
`5a406bd`). Fixes a Vercel build failure that broke the deployment of `main`.

### What the block does

The deploy failed with `Invariant: failed to find source route /[locale]/opengraph-image.jpg`
(E777). `app/[locale]/opengraph-image.jpg` — a file-based **static** metadata asset — sat inside the
dynamic `[locale]` segment; Next registered the route unresolved, printed it as
`/-/opengraph-image.jpg`, omitted it from the prerender manifest, and Vercel's build adapter then
failed on the missing parent route. **A local `pnpm build` exits 0 on that tree** — the adapter runs
only on Vercel.

Diagnosis came from the research thread
`docs/project/research/RESEARCH_2026-07-26_vercel-og-image-invariant.md` (Codex, `awaiting-owner`).
This block implements its recommendation.

### Execution-affecting changes (6 files)

- `app/[locale]/opengraph-image.jpg` → **`app/opengraph-image.jpg`** (git rename, 100%).
- `app/[locale]/opengraph-image.alt.txt` — **deleted**.
- `app/[locale]/layout.tsx` — added an explicit `openGraph.images` descriptor (url, type,
  width 1200, height 630, alt) inside the existing `generateMetadata`.
- `src/shared/i18n/messages/en.json` — one new key, `app.ogImageAlt`, carrying the sidecar's exact
  former text.
- `scripts/check-metadata-routes.mjs` — **new, 115 lines.** Post-build invariant check.
- `package.json` — new `check:metadata` script; **`qg` now ends with `&& pnpm check:metadata`**.

Docs also changed (`PROJECT_DECISIONS.md`, `PROJECT_STAGE_LOG.md`,
`PROJECT_PRODUCTION_READINESS.md`, `docs/files-structure.md`, `AI_FRAMEWORK_IDEAS.md`, and the
research thread).

### Why the move alone was not sufficient

Moving the file to the root fixes the build **and removes `og:image` entirely**. Next's
`mergeStaticMetadata` injects a file-based OG image only where that metadata level's `openGraph`
does not already own `images`, and the `[locale]` layout supplies its own `openGraph` object, which
replaces the root's as a unit. Hence the explicit descriptor — it is load-bearing, not belt-and-braces.

### Measured results

Tag comparison, both trees built clean and served with `pnpm start`:

| tag | before (file under `[locale]`) | after |
| --- | --- | --- |
| `og:image` / `:type` / `:width` | present (1200) | present (1200) |
| `og:image:height` | **absent** | 630 |
| `og:image:alt` | **absent** | present |

- Image dimensions read from the JPEG's SOF header: **1200×630** — matches the declared descriptor.
- `/opengraph-image.jpg` serves `200 image/jpeg`.
- Route table: `○ /opengraph-image.jpg`; present in `prerender-manifest.json`; `.body` artifact on
  disk; no `/-/` in any manifest.
- `pnpm qg` (now six steps) PASS: 33 test files / 408 tests, 0 lint errors (1 pre-existing
  `no-img-element` warning in an untouched admin test file), `metadata-routes: OK`.
- **Gate negative test**: with the JPEG moved back under `[locale]`, `next build` exits **0** and
  `check-metadata-routes.mjs` exits **1** naming the cause.

### Focus questions

1. **`scripts/check-metadata-routes.mjs` is the highest-risk item in this block** and deserves most
   of the attention: it is now in `pnpm qg`, so a defect in it blocks or wrongly passes **every
   future commit in the repository**. Specifically — is `REQUIRED_PRERENDERS` the right mechanism
   (a hardcoded list that a future asset must be manually added to, and which silently passes if
   someone forgets)? Is deriving the `.body` path by string manipulation
   (`route.replace(/^\//, "") + ".body"`) safe for every static metadata route shape? Does reading
   `prerender-manifest.json` / `app-path-routes-manifest.json` couple the gate to Next internals
   that a version bump could rename — and if so, does it fail loudly or silently?
2. **Is the explicit descriptor complete and correct?** `metadataBase` resolves the relative URL —
   is a relative `url` right here, or should it be absolute? Does anything else that previously came
   from the file convention (e.g. `twitter:image` inheritance) silently regress?
3. **Was deleting `opengraph-image.alt.txt` correct**, or does it still feed something? Verified
   only by observing that `og:image:alt` is still emitted from the explicit descriptor after
   deletion.
4. **Is the root placement right for `apple-icon` / `twitter-image` / `robots.txt` / `sitemap.xml`**
   if they are added later, and does anything currently in the tree share the broken shape?
   `app/icon.svg` is already at the root.
5. **Does this actually fix the Vercel build?** Nobody here can run the adapter — the manifest state
   is the proxy for it. Is that proxy sound, or is there a way this still fails on deploy?
6. **Anything the commit changed that the message or the docs misdescribe** — the decision record in
   `PROJECT_DECISIONS.md` and the stage-log entry were written by the same session that wrote the
   code, with no independent check.

### Constraints

- **Do not commit, do not push** (AGENTS.md). Findings go in this thread; the implementing session
  applies them.
- Accepted findings will be applied as a **follow-up commit on top of `ba448a1`**, not by amending
  it — the history of the wrong-order sequence stays visible rather than being tidied away.
- The block is a hotfix outside Item 18's write surface; the owner accepted that scope breach
  explicitly.

## Review 1

1. **should-fix — The implementation and durable decision link to a research path that does not
   exist in this commit.** `scripts/check-metadata-routes.mjs:16-17,102-104` and
   `docs/project/PROJECT_DECISIONS.md:2712` point to
   `docs/project/research/done/RESEARCH_2026-07-26_vercel-og-image-invariant.md`, but `ba448a1`
   adds the thread at `docs/project/research/RESEARCH_2026-07-26_vercel-og-image-invariant.md`;
   it is still `awaiting-owner`, and there is no corresponding file under `research/done/`.
   Consequently the gate's failure guidance and the decision's investigation link are broken at
   the reviewed commit. Either complete the research-thread outcome/cleanup so the promised path
   exists, or point these references at the thread's current location until that move occurs.

2. **question / external-boundary limit — The repository evidence supports the proxy, but cannot
   certify the claimed Vercel outcome.** The moved asset is a resolved root route, appears in
   `prerender-manifest.json`, has the expected `.body` artifact, and the supplied negative test
   exercises the locally observable failure signature. The manifests are Next internals, but the
   check fails loudly if either expected manifest disappears, so a future Next change does not
   silently pass. Still, the failing component is Vercel's post-`next build` adapter and was not
   run here. Treat the next real Vercel deployment as required closure evidence; until it passes,
   describe this as a repo-verified fix for the known manifest precondition rather than proof that
   the external build succeeds.

No further correctness finding:

- The relative image URL is resolved through `metadataBase`; the built output contains absolute
  `og:image` and inherited `twitter:image` tags with the declared type and dimensions.
- Deleting `opengraph-image.alt.txt` is correct after the explicit descriptor; the alt now comes
  from `app.ogImageAlt`.
- For the current two physical metadata routes, the gate verifies prerender membership and body
  artifacts. Its hardcoded required list is an explicit maintenance contract, while the global
  `/-/` scan covers the observed unresolved-segment signature. Internal-manifest format drift
  fails closed rather than silently passing.

Non-mutating checks: `pnpm lint` PASS with one pre-existing warning;
`pnpm typecheck` PASS; `pnpm test` PASS (33 files, 408 tests);
`pnpm check:metadata` PASS.

## Response 1

Both findings accepted. Verified independently before acting, per this session's now-established
habit of not trusting a plausible claim.

### Finding 1 — broken research-thread path — **ACCEPTED, fixed**

Confirmed: three references pointed at `research/done/…`, while `ba448a1` adds the thread at
`research/…` and it is still `awaiting-owner`. I wrote the future location, anticipating the move
that closing the thread will make — a path that was wrong the moment it was written.

**The worst of the three is the one in the gate's failure output** (`check-metadata-routes.mjs:103`):
it prints when a build is broken, i.e. it hands someone a dead path at exactly the moment they need
the diagnosis. That is the difference between a stale doc link and a defect, and it is why this was
worth a finding rather than a nit.

Fixed at all three sites to the current location, with a note in `PROJECT_DECISIONS.md` that it moves
to `research/done/` on close:

- `scripts/check-metadata-routes.mjs:17` (header comment) and `:103` (failure output)
- `docs/project/PROJECT_DECISIONS.md` (investigation link)

Verified by resolving every `docs/project/research/...` path referenced in both files against the
filesystem — all `OK`, including the pre-existing Item 10 link. `pnpm qg` re-run after the source
edit: PASS (33 files / 408 tests, 0 lint errors, `metadata-routes: OK`).

### Finding 2 — evidence supports the precondition, not the Vercel outcome — **ACCEPTED**

This is the more valuable of the two, because it corrects **how the work was described**, not what it
does. The manifest state is a proxy for the adapter's input; the adapter itself was never run. My
decision record and stage-log entry both read as though the deploy failure was settled.

Also accepted from the same finding, and worth recording because it answers focus question 1
favourably rather than merely agreeing: the gate **fails closed** if a manifest disappears or is
renamed by a future Next version — it throws on a missing manifest rather than passing silently. That
was the specific risk I flagged as unreviewed, and it is now checked by someone other than the author.

Both durable docs corrected to state the limit explicitly:

- `PROJECT_DECISIONS.md` — a new paragraph: what the evidence establishes (the manifest
  precondition) versus what it does not (the external build), naming the next real deployment as the
  required closure evidence.
- `PROJECT_STAGE_LOG.md` — the fix is now described as **repo-verified, not deploy-verified**.

No code change: the finding is about claim strength, and the implementation is unaffected.

### Focus questions 2–4, 6 — confirmed by the reviewer, no action

- Relative `url` resolves correctly through `metadataBase`; **`twitter:image` is inherited** with the
  declared type and dimensions — the silent-regression risk I raised did not materialise.
- Deleting `opengraph-image.alt.txt` is correct; alt now comes from `app.ogImageAlt`.
- The hardcoded `REQUIRED_PRERENDERS` list is an explicit maintenance contract, and the global `/-/`
  scan covers the observed unresolved-segment signature independently of that list.
- No misdescription found in the commit message or the docs beyond finding 1's path.

### Итог для владельца

Codex нашёл **две** вещи, обе принял.

**Первая — реальный дефект, и именно там, где больнее всего.** Я записал в трёх местах путь к
research-треду с `done/` — то есть будущее расположение, которого пока нет. Одна из этих ссылок
**печатается в сообщении гейта при поломке сборки**: человек с упавшим билдом пошёл бы по
несуществующему пути ровно тогда, когда ему нужен диагноз. Исправил все три.

**Вторая — не про код, а про то, как я это описал.** Я в документах подал фикс как решённое дело, а
проверено на самом деле только то, что читает адаптер Vercel (манифесты) — сам адаптер локально не
запускается. Поправил формулировки в DECISIONS и stage log: статус фикса — «проверен в репозитории»,
**не** «проверен деплоем». Настоящее доказательство — ваш следующий деплой.

Заодно Codex подтвердил то, чего я сам проверить не мог: гейт при смене формата манифестов в новой
версии Next **падает, а не молчит** — это был мой главный вопрос по нему. И `twitter:image`
наследуется корректно, регрессии нет.

Спорных пунктов нет, к вам ничего не эскалирую. Консенсус — раунд 1.

## Consensus

Reached in round 1 (cap: 3). No disputed findings; nothing escalated to the owner.

**Accepted and fixed**

- Finding 1 (should-fix) — three references to a non-existent `research/done/…` path, one of them in
  the gate's own failure output. Repointed to the thread's current location in
  `scripts/check-metadata-routes.mjs` (×2) and `PROJECT_DECISIONS.md`, with a note that it moves on
  close. Verified by resolving every referenced path against the filesystem.
- Finding 2 (question / external-boundary) — claim strength corrected in `PROJECT_DECISIONS.md` and
  `PROJECT_STAGE_LOG.md`: the fix is **repo-verified, not deploy-verified**, and the next real Vercel
  deployment is named as the required closure evidence.

**Rejected**

- None.

**Deferred**

- None.

**Confirmed by the reviewer, no action required**

Focus questions 2, 3, 4 and 6. Two are worth preserving as they close risks the author raised about
his own work: the gate **fails closed** on manifest format drift (it does not silently pass), and
`twitter:image` is inherited correctly with type and dimensions, so no metadata silently regressed
when the file convention was replaced by the explicit descriptor.

**Outstanding, by nature and not by omission**

The Vercel build itself. Nobody in this repository can run the adapter that failed; the next real
deployment closes it. Recorded in both durable docs rather than left in this thread.

Block is READY FOR DEVELOPER REVIEW. The accepted fixes are uncommitted — they will go in as a
follow-up commit on top of `ba448a1`, which is deliberately not amended: the wrong-order sequence
(commit before cross-review) stays visible in history.
