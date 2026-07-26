Status: `closed` · outcome filed 2026-07-26; Vercel deploy verified
Researcher: codex
Requested by: IMPL: Stage 6 Item 18 — Block A / hero wiring (session that hit the failure)

## Question

**The Vercel deployment of `main` fails at build. A local `pnpm build` of the same tree exits 0.
Why, and what is the correct fix?**

Deploy error, verbatim:

```
Build error occurred
Error: Invariant: failed to find source route /[locale]/opengraph-image.jpg
  for prerender /[locale]/opengraph-image.jpg
    at ignore-listed frames
```

The tree to analyse is `5a406bd` (current `origin/main` and current `HEAD`). **All investigation
edits described below have been reverted — the working tree is clean of them.** Only
`docs/framework/AI_FRAMEWORK_IDEAS.md` (a filed META proposal, unrelated) and
`docs/project/tasks/STAGE_6_STRAT_BRIEF.md` (owner's, untouched by this session) are modified.

## Where the bug is

`app/[locale]/opengraph-image.jpg` — a file-based static metadata asset sitting inside the **dynamic
`[locale]` segment**. Its sibling `opengraph-image.alt.txt` is in the same directory. The working
counter-example is `app/icon.svg`, which sits at the **app root** and prerenders correctly.

Relevant facts about the app:

- Next `16.2.10`, Turbopack, React 19.2.3, `next-intl` 4.13.1 via `createNextIntlPlugin`.
- **One locale only**: `src/shared/i18n/config.ts` → `locales = ["en"]`, `defaultLocale = "en"`.
- **No `generateStaticParams` anywhere in the repo** (verified by grep). Every `[locale]` page is
  dynamic (`ƒ`) in the build output.
- `openGraph` in `app/[locale]/layout.tsx` does **not** set `images` explicitly — the image is picked
  up purely by Next's file-name convention.
- Locale routing is handled by `proxy.ts` (`next-intl` middleware). Its matcher is
  `["/((?!api|auth|_next|_vercel|.*\\..*).*)"]` — paths containing a dot are excluded, so the
  `.jpg` route is **not** matched by the proxy.

## Local vs Vercel — measured, not assumed

**The bug does NOT fail the local build. It does fail on Vercel.**

| | local `pnpm build` (clean, `rm -rf .next`) | Vercel |
| --- | --- | --- |
| Exit code | **0** | **fails** |
| Symptom | route table prints `○ /-/opengraph-image.jpg` | `Invariant: failed to find source route …` |

So the defect is **present locally but silent** — it shows up only as the literal `-` where the
locale should be (`/-/opengraph-image.jpg` instead of `/en/opengraph-image.jpg`), which is easy to
read past. The gates (`pnpm qg`) pass on this tree.

Why the asymmetry, as far as this session traced it: the error string lives in
`node_modules/next/dist/build/adapter/build-complete.js`, i.e. the **build adapter Vercel invokes
after `next build`** — not in `next build` itself. Local builds never run that reconciliation step.
The relevant code path:

```js
// Skip static metadata routes only when they are prerendered.
const isStaticMetadataRoute = isStaticMetadataFile(normalizedPage);
const isPrerenderedMetadataRoute = prerenderManifest.routes[normalizedPage] || …
…
const getParentOutput = (srcRoute, childRoute, allowMissing) => {
  const parentOutput = pageOutputMap[normalizedSrcRoute] || appOutputMap[normalizedSrcRoute];
  if (!parentOutput && !allowMissing) {
    throw new Error(`Invariant: failed to find source route ${srcRoute} for prerender ${childRoute}`)
    // __NEXT_ERROR_CODE: "E777"
  }
}
```

Measured manifest state on a clean local build of `5a406bd`:

- `.next/app-path-routes-manifest.json` → `"/[locale]/opengraph-image.jpg/route": "/[locale]/opengraph-image.jpg"`
  — the route is registered **unresolved**, with the literal `[locale]`.
- `.next/prerender-manifest.json` → routes are `["/_global-error", "/_not-found", "/icon.svg"]`
  — **the OG image is absent**, while the root-level `icon.svg` is present.
- On disk: `.next/server/app/[locale]/opengraph-image.jpg` — literal `[locale]` in the path.

Reading those together: the asset is classified as a static metadata route but is **not** in the
prerender manifest, so the adapter does not skip it, then looks for its parent route and finds
nothing under `/[locale]/opengraph-image.jpg`. That is the invariant. **This chain is this session's
reconstruction and is exactly what needs independent checking** — it may be wrong or incomplete.

## What was already tried, and the measured result of each

All four were tested with a clean `rm -rf .next && pnpm build`, and **all have been reverted**.

1. **`generateStaticParams()` in `app/[locale]/layout.tsx`** returning `routing.locales.map(...)`.
   → **No effect.** Route still `/-/opengraph-image.jpg`; prerender manifest still lacks the asset.
2. **`export const dynamicParams = false`** alongside it.
   → **No effect.** Identical output.
3. **Moving both `opengraph-image.jpg` and `opengraph-image.alt.txt` to `app/` (root).**
   → **Fixes the build symptom**: route becomes `○ /opengraph-image.jpg`, it appears in the
   prerender manifest next to `icon.svg`, and `.next/server/app/opengraph-image.jpg` has no
   `[locale]` in its path. **But it breaks the metadata**: with the file at the root, `curl /en`
   returns **no `og:image` tag at all** (verified by diffing against the pre-change tree, which does
   emit `og:image`, `og:image:type`, `og:image:width=1200`). So this trades a broken deploy for a
   broken social preview — rejected as a fix, though it does confirm the dynamic segment is the
   trigger.
4. **Proxy interference** — ruled out: the matcher excludes dotted paths, and
   `middleware-manifest.json` shows empty `functions`/`middleware` for this route.

## What is being asked

1. **Verify or refute the mechanism above** against the Next 16.2.10 source. Specifically: is a
   file-based static metadata asset inside a dynamic segment *supposed* to prerender without
   `generateStaticParams`, and if `generateStaticParams` is the intended mechanism, **why did it not
   populate the prerender manifest here?** (A wrong-but-plausible mechanism is the main risk in this
   thread — three fixes were attempted off the back of it and none worked.)
2. **Is this a known Next 16 defect** (issue/changelog/release note for `E777`,
   `opengraph-image` in a dynamic segment, or the build adapter's metadata-route skip), or a
   misconfiguration in this repository? You have network access; this session deliberately did not
   search rather than guess further.
3. **Name the correct fix**, with the trade-offs stated. Candidates this session can see, none
   verified as correct:
   - keep the file in `[locale]` and make the segment genuinely prerenderable (what would that
     require, given `next-intl` + the proxy?);
   - move to root **and** declare `openGraph.images` explicitly in `generateMetadata` so the tag
     comes back (does that fully restore `og:image`, `:type`, `:width`, `:height`, and the
     `alt` currently supplied by `opengraph-image.alt.txt`?);
   - a code-generated `opengraph-image.tsx` instead of a static file;
   - a Next version change, if this is a regression.
4. **Whether anything else in the repo shares this shape** and would fail the same way later —
   e.g. if `icon.svg` were ever moved under `[locale]`, or if `sitemap`/`robots` are added there.
5. **How to make the failure visible locally**, so a green `pnpm qg` stops certifying a tree that
   cannot deploy. This is the durable half of the question — a fix that leaves the gates blind to
   the next occurrence only postpones it.

## Constraints

- **Do not commit and do not push** (AGENTS.md — hard rules). Findings go in this thread.
- The fix itself touches `app/[locale]/layout.tsx` and/or the OG asset location — **outside** Item
  18's write surface. The owner has already accepted the scope breach for the fix, but the
  implementing session is Claude Code's, not the researcher's.
- Note for context, not for action: `og:image` correctness matters here because the site is
  deployed-but-not-launched (`robots: noindex`), so the social preview is verified pre-launch.

## Findings 1

### 1. Mechanism: what is established, and what is still inference

**Verified against the repo and the installed Next `16.2.10` package:**

1. A physical `opengraph-image.jpg` goes through
   `next-metadata-route-loader.js#getStaticAssetRouteCode`. That generated module exports a
   force-static `GET`, but **does not export `generateStaticParams`**. The loader's generated
   `generateStaticParams` for image routes exists only for a code-based image module that exports
   `generateImageMetadata`; it generates the synthetic `__metadata_id__`, not ordinary pathname
   params such as `locale`. The premise that the static JPEG's loader might generate its own
   locale params is therefore refuted.
2. `build/static-paths/app.js#generateRouteStaticParams` is designed to carry params from a parent
   segment through descendants that have no `generateStaticParams`: it skips a segment without
   the function while preserving the accumulated params, and merges a segment's returned values
   with `nextParams.push({ ...parentParams, ...item })`.
3. Therefore, if the `[locale]` layout's tested function returning `{ locale: "en" }` were present
   in the metadata route's collected segment chain and that normal static-path path ran, the generic
   algorithm would preserve it. The measured unchanged `/-/` output means the value was not applied
   to this metadata entry.
4. The exact point at which it is lost is **not established**. The evidence narrows it to the
   metadata entry/segment collection or its invocation path, before the adapter; it does not prove
   which Turbopack function is defective. Calling this specifically a “Turbopack segment-chain
   omission” would be a high-confidence hypothesis, not a verified mechanism.
5. The local build is already internally inconsistent before Vercel acts: the route is registered
   as `/[locale]/opengraph-image.jpg`, printed as `/-/opengraph-image.jpg`, and omitted from the
   prerender manifest. Vercel's adapter exposes that state as a fatal error; it does not create the
   unresolved route.
6. `build/adapter/build-complete.js` skips a static metadata App Route only if the route (or a
   built-in `config.i18n` locale variant) exists in `prerenderManifest.routes` or
   `dynamicRoutes`. This project uses App Router middleware locale routing, not Next's built-in
   `config.i18n`, and the measured manifest has no matching entry, so the unresolved App Route is
   retained. Later, `getParentOutput` cannot find its normalized source route in `pageOutputMap` or
   `appOutputMap` and throws E777. Static metadata prerenders are otherwise converted to static
   files from `.next/server/app/<normalized route>.body`.

**External AI, unverified against the public indexes:** the external search found no issue, PR,
release note, or established affected/fixed version for this exact combination of E777,
`/-/opengraph-image.jpg`, and a static metadata file below `[locale]`. It found older unrelated
OG-image issues for route groups, hostname resolution, and `basePath`, none of which establishes a
fix here. Accordingly, there is no evidence-backed Next upgrade or downgrade target. A version
change is only an experiment until a matrix proves both the concrete manifest entry and Vercel
deployment.

**Conclusion on classification:** the no-`generateStaticParams` tree lacks a concrete locale for a
build-time prerender, but the attempted parent `generateStaticParams` should have supplied it under
the generic App Router algorithm and did not. The safest description is a **Next 16.2.10
metadata-route build-pipeline defect/inconsistency, fatal in the Vercel adapter**, with the exact
internal omission still unknown. The repository's proxy is not implicated.

### 2. Why moving the file to `app/` removed `og:image`

**Verified against the installed Next source and the repo's measured HTML:**

`resolve-metadata.js#mergeStaticMetadata` merges file-based Open Graph images at the current
metadata level only when that level's `openGraph` source does not explicitly own an `images`
property. However, the `[locale]` layout supplies a new `openGraph` object. The normal metadata
merge resolves that object as a unit; it does not deep-preserve a root layout's already-resolved
images. Thus the root file can prerender correctly while the descendant locale metadata replaces
the Open Graph object without an image. This explains the observed “deploy symptom fixed, tag
lost” result; it is not evidence that the root asset route itself is broken.

### 3. Options and trade-offs

| Option | Benefits | Costs / unresolved risk |
| --- | --- | --- |
| Keep the JPEG below `[locale]` and make parent static params work | Retains automatic locale-scoped file convention, dimensions/type discovery, and `.alt.txt` | Already failed with the intended parent `generateStaticParams`; exact Next defect is unresolved; not a dependable deployment fix on this stack |
| Move JPEG and `.alt.txt` to `app/`, and add an explicit `openGraph.images` object in the locale layout | Root route is measured to prerender; explicit metadata deterministically restores URL, type, dimensions, and alt; avoids the dynamic metadata route entirely | Duplicates metadata that the file convention otherwise derives; values must be kept in sync with asset replacements; the explicit object's `alt` is authoritative, not the sidecar |
| Replace the static file with `[locale]/opengraph-image.tsx` | Appropriate if content genuinely varies by locale; code route receives route params; can generate content dynamically | More runtime/build complexity, `ImageResponse` constraints, and a larger failure surface; without `generateImageMetadata` it still has no loader-generated locale params, so it must be proven on Vercel rather than assumed to bypass the defect |
| Upgrade/downgrade Next | May reveal a working version | No source-confirmed fixed or known-good version; requires an exact local/Vercel version matrix and regression review |

For the root-file workaround, the explicit typed shape is:

```ts
openGraph: {
  title: t("ogTitle"),
  description: t("ogDescription"),
  siteName: studio.name,
  type: "website",
  locale: "en_US",
  images: [
    {
      url: "/opengraph-image.jpg",
      type: "image/jpeg",
      width: 1200,
      height: 630,
      alt: "The same descriptive text currently stored in the sidecar",
    },
  ],
},
```

**Verified against the installed Next source:** Open Graph image URLs are resolved with
`metadataBase`; the descriptor supports URL, MIME type, width, height, and alt. Once `images` is
explicit, `mergeStaticMetadata` deliberately does not inject file-based images at that same level.
The explicit `alt` must therefore be treated as the source for `og:image:alt`; the sidecar cannot
be relied upon to enrich that object.

The choice remains the owner's, but with one locale and one shared image, the root file plus
explicit descriptor has the smallest unverified surface and is the only candidate already backed by
the successful root-route prerender experiment.

### 4. Other conventions sharing the structural risk

**Verified against the installed metadata loader/classifier:**

- Physical `icon`, `apple-icon`, `opengraph-image`, and `twitter-image` assets use the same static
  asset route branch. Moving `app/icon.svg` below `[locale]` would introduce the same unresolved
  pathname shape; keeping it at app root avoids it.
- Physical `robots.txt`, `manifest.webmanifest`, and `sitemap.xml` are also static metadata assets
  and should not be placed below an unresolved dynamic segment without a build/deploy proof.
- Code `robots.ts` and `manifest.ts` use the dynamic text-route branch, so they are not identical to
  the physical-file case.
- Code `sitemap.ts` with `generateSitemaps` and code image routes with
  `generateImageMetadata` receive generated params only for their synthetic metadata IDs. Ordinary
  dynamic pathname params such as `locale` still have to come from parent segments.

### 5. Durable local guard

**Verified against the installed adapter:** directly invoking
`next/dist/build/adapter/build-complete.js` would couple the project to an internal API and would
not reproduce Vercel's private adapter reliably. A post-build invariant check is the stable local
option.

For the root-file plus explicit-image approach, the gate should run after `next build` and assert:

1. `.next/prerender-manifest.json.routes["/opengraph-image.jpg"]` exists.
2. `.next/server/app/opengraph-image.jpg.body` exists (derive the exact body path from the
   prerender route rather than hard-coding it if the script is generalized).
3. No expected static metadata entry in `app-path-routes-manifest.json`, the prerender manifest, or
   relevant server artifact paths contains the placeholder segment `/-/`.
4. A production-server smoke check of `/en` contains exactly the expected absolute
   `og:image`, plus `og:image:type=image/jpeg`, width `1200`, height `630`, and non-empty alt.
5. Fetching that emitted URL returns `200` with `Content-Type: image/jpeg`.

For any future decision to restore the localized file convention, require instead:

1. discovery of `/[locale]/opengraph-image.jpg`;
2. a concrete `/en/opengraph-image.jpg` entry in the prerender manifest;
3. its concrete `.body` artifact;
4. no unresolved `[locale]` as the sole deployable output;
5. `/en` referencing the localized URL and that URL returning the expected image.

The manifest check catches the current adapter precursor without scraping the human route table;
the HTML/fetch check separately catches the already-demonstrated failure where the asset route is
healthy but metadata composition drops the tag.

## Response 1

Findings accepted. **Every load-bearing claim was re-verified locally before acting** — the thread's
own warning was that a plausible-but-wrong mechanism had already cost three failed fixes, so nothing
here was taken on assertion.

### What was verified, and what it showed

| Claim (Findings §) | Check run | Result |
| --- | --- | --- |
| §2 — root file + explicit `openGraph.images` restores the tag | moved assets to `app/`, added the descriptor, clean build, `curl /en` | **Confirmed, and better than baseline** — see below |
| §3 — proposed descriptor values `1200×630` | read the JPEG's SOF header directly | **Exact match**: image is 1200×630 |
| §2 — sidecar `.alt.txt` is not authoritative once `images` is explicit | deleted the sidecar, rebuilt, re-checked HTML | **Confirmed** — `og:image:alt` still emitted, sourced from `images[].alt` |
| §5 — a manifest-based post-build gate catches the precursor | wrote the gate, then **deliberately reintroduced the bug** | **Confirmed** — `next build` exits 0, gate exits 1 |

The tag comparison, measured on both trees:

| tag | before (file under `[locale]`) | after (root + explicit descriptor) |
| --- | --- | --- |
| `og:image` | present | present |
| `og:image:type` | present | present |
| `og:image:width` | 1200 | 1200 |
| `og:image:height` | **absent** | **630** |
| `og:image:alt` | **absent** | **present** |

So the fix is not a like-for-like restoration — it emits two tags the file convention never
produced. That was not predicted in the thread and is worth recording: the "duplicates what the
convention derives" cost in the §3 trade-off table is real, but the convention was deriving *less*
than the explicit object does.

### What was implemented

1. `app/[locale]/opengraph-image.jpg` → `app/opengraph-image.jpg`.
2. Explicit `openGraph.images` descriptor in `app/[locale]/layout.tsx` (url, type, width, height,
   alt), with `alt` sourced from a new `app.ogImageAlt` key in `en.json` carrying the sidecar's
   exact former text — so the rendered alt is unchanged.
3. `app/opengraph-image.alt.txt` **deleted** — verified redundant, not assumed.
4. New `scripts/check-metadata-routes.mjs`, wired into `pnpm qg` after `build` as
   `pnpm check:metadata`.

### On the durable guard (§5)

Implemented as the manifest half only — checks 1–3 of the five proposed. The HTML/fetch checks (4–5)
were **deliberately not** added to `pnpm qg`: they need a running production server, and
PROJECT_DECISIONS.md — "Named browser capability for visual verification" — fixed the constraint that
`pnpm qg` stays headless-free and fast. The manifest checks alone catch the precursor to the actual
deploy failure, which is the class that broke here; the metadata-composition failure (§2) is caught
instead by the fact that the descriptor is now explicit in source and reviewable in a diff.

The gate's negative test is the part worth trusting: with the JPEG moved back under `[locale]`,
`next build` still exits **0** while the gate exits **1** and names the cause. That is precisely the
blindness that let this reach Vercel.

### Not adopted

- **Next version change** — correctly identified as unbacked by evidence; no known-good target
  exists. Not attempted.
- **`opengraph-image.tsx` code route** — unnecessary at one locale and one shared image, and §3
  notes it would still need a Vercel proof rather than being assumed to bypass the defect.
- **Keeping the file under `[locale]`** — the option that already failed twice.

### Open, and honestly unresolved

The exact internal point where the locale param is lost remains **unidentified**, as Findings §1.4
states. The fix routes around the defect rather than repairing it. This matters for one future
decision: if a second locale is ever added, a single root-level OG image stops being correct, and
this workaround must be revisited rather than extended. §4's list of same-shape conventions
(`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, and `icon.svg` if it were ever moved) is
recorded in the Outcome so the constraint is discoverable without reopening this thread.

### Итог для владельца

Codex прав, и его версия проверена, а не принята на слово — я специально перепроверил каждое
утверждение, на котором держится фикс, потому что до этого трижды ошибся с правдоподобной, но
неверной гипотезой.

Что оказалось: перенос картинки в корень ломал `og:image` **не потому, что корневой маршрут плохой**,
а потому что дочерний layout целиком заменял объект `openGraph` — без картинки. Стоит задать `images`
явно — и тег возвращается. Причём **лучше, чем было**: появились `og:image:height` и `og:image:alt`,
которых при старой схеме не было вовсе.

Главное — теперь есть локальный гейт. Проверил его обратным тестом: вернул баг на место, `next build`
по-прежнему говорит «всё хорошо» (exit 0), а гейт падает и объясняет причину. Та слепота, из-за
которой поломка доехала до Vercel, закрыта.

Чего фикс НЕ делает: он обходит дефект Next, а не чинит его. Точное место, где теряется локаль, так и
не найдено — и если когда-нибудь появится второй язык, эту схему придётся пересматривать.

Status → `awaiting-owner`: остаётся ваше решение по деплою (пушить может только владелец).

## Outcome

**Closed 2026-07-26. The Vercel deployment succeeded** — this is the closure evidence Findings §1
and cross-review finding 2 both named as missing, and which nothing in this repository could
produce. The fix is now deploy-verified, not merely repo-verified.

**Filed durably** (this thread is the investigation record, not the source of truth):

- `PROJECT_DECISIONS.md` — "OG image lives at the app root with an explicit descriptor —
  decided 2026-07-26": the decision, why the explicit descriptor is load-bearing rather than
  belt-and-braces, and the constraint that this **routes around** a Next 16.2.10 defect instead of
  repairing it.
- `PROJECT_STAGE_LOG.md` — 2026-07-26 entry.
- `PROJECT_PRODUCTION_READINESS.md` — the OG asset's new path, plus the new obligation that the
  pre-deploy swap must update the explicit descriptor if the replacement is not 1200×630.
- `scripts/check-metadata-routes.mjs` — the durable guard (Findings §5), in `pnpm qg`.
- Cross-review of the implementation: `reviews/done/REVIEW_2026-07-26_og-image-build-fix.md`.

**What remains true and must not be lost:**

1. The exact internal point where the `locale` param is lost is **still unidentified** (Findings
   §1.4). Nobody repaired the defect; the arrangement avoids it.
2. **If a second locale is ever added**, one root-level OG image stops being correct and this
   arrangement must be revisited — not extended.
3. The same structural risk applies to every physical static metadata asset (`icon`, `apple-icon`,
   `twitter-image`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`): keep them at the app root
   unless a build **and** deploy proof exists (Findings §4).

Both (2) and (3) are recorded in PROJECT_DECISIONS.md so they are discoverable without reopening
this thread.
