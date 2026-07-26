# Investigation result

## Executive finding

The failure is best characterized as an **adapter-visible inconsistency in Next.js 16.2.10’s handling of a static metadata route beneath an App Router dynamic segment**:

- Next discovers `app/[locale]/opengraph-image.jpg` and compiles it as an App Route.
- Because it is a physical image file, the metadata loader emits only a force-static `GET`; it does **not** emit its own `generateStaticParams`.
- The route must therefore obtain `{ locale: "en" }` from the normal parent-segment static-param pipeline.
- In the reproduced Turbopack build, that does not happen: the route is represented as `/-/opengraph-image.jpg`, remains absent from `prerender-manifest.json`, and retains `[locale]` in its server output.
- The Vercel adapter hook then sees a purported static metadata route that was not reconciled into a concrete prerender. It keeps an App Route output for the dynamic source, later tries to associate the concrete prerender with that source, cannot find a matching parent output, and throws E777.

**Confirmed:** the loader and adapter behavior above is visible in the exact `v16.2.10` source.

**Inference:** the missing propagation of the layout’s `generateStaticParams` into this static metadata entry is a Next/Turbopack build-pipeline defect, not an application-level violation demonstrated by the supplied tree. The controlled experiment is exactly what should have supplied `locale`.

I did not find a public issue or PR that establishes an affected/fixed version for this exact `/-/opengraph-image.jpg` + E777 reproduction. Therefore an upgrade or downgrade cannot currently be recommended as a source-confirmed fix.

---

# 1. Source-backed mechanism in `v16.2.10`

## 1.1 File discovery

Next recognizes the following as metadata files:

- `icon`
- `apple-icon`
- `opengraph-image`
- `twitter-image`
- `robots`
- `sitemap`
- `manifest`

The static-metadata matcher explicitly includes `opengraph-image` and its supported image extensions. ([GitHub][1])

The resulting application route is normalized from:

```text
/[locale]/opengraph-image.jpg/route
```

to:

```text
/[locale]/opengraph-image.jpg
```

That agrees with the supplied `app-path-routes-manifest.json`.

## 1.2 What the metadata loader generates for a physical JPEG

For a static image file, `next-metadata-route-loader` enters `getStaticAssetRouteCode`. It:

1. reads the asset into a buffer at build time;
2. determines the MIME type;
3. emits a `GET`;
4. returns the image buffer;
5. exports `dynamic = "force-static"`.

The generated module does **not** export `generateStaticParams`. ([GitHub][2])

The relevant branch selection is:

```ts
if (isDynamicRouteExtension === "1") {
  // robots.ts, sitemap.ts, opengraph-image.tsx, etc.
} else {
  code = await getStaticAssetRouteCode(...)
}
```

A `.jpg` goes through the static-asset branch. ([GitHub][2])

### Important correction to the premise

The loader-generated `generateStaticParams` found in the installed package is not for an ordinary static JPEG.

It is generated for a code-based image route only when the source module exports `generateImageMetadata`. That function creates values for the synthetic `__metadata_id__` parameter. ([GitHub][2])

For a single `opengraph-image.tsx` without `generateImageMetadata`, the loader emits a `GET` wrapper but no loader-generated `generateStaticParams`. ([GitHub][2])

Therefore:

```text
app/[locale]/opengraph-image.jpg
```

depends entirely on the parent `[locale]` segment to provide `locale`.

## 1.3 How parent static params are intended to propagate

The App Router static-path builder walks all route segments in order. For each segment exporting `generateStaticParams`, it calls the function and merges its output with accumulated parent params:

```ts
nextParams.push({ ...parentParams, ...item })
```

Segments without `generateStaticParams` are simply skipped while the current accumulated params continue down the route. ([GitHub][3])

Consequently, for an entry whose segment chain is conceptually:

```text
root
[locale] layout
opengraph-image.jpg route
```

a layout export returning:

```ts
;[{ locale: "en" }]
```

should leave `{ locale: "en" }` available when the metadata route itself has no static-param function.

The builder then records which pathname parameters were actually generated and uses that information to decide whether complete concrete paths can be prerendered. ([GitHub][3])

### Intended invariant

For a route to become a fully concrete build-time prerender, every dynamic pathname parameter must be supplied by the collected segment-level static params.

For this route, that means:

```text
locale must be present
```

There is no separate documented requirement that the metadata route itself export `generateStaticParams`; layouts are valid sources of static params in the normal App Router segment walk.

## 1.4 Why no parent `generateStaticParams` produces the observed shape

Without a user `generateStaticParams` above `[locale]`, no concrete locale is available.

A static file route can still be classified as force-static, but there is no concrete pathname to emit. That explains all of the original state:

- literal `[locale]` retained under `.next/server/app`;
- no `/en/opengraph-image.jpg` in `prerender-manifest.json`;
- route-table placeholder `/-/opengraph-image.jpg`;
- adapter later receiving an unresolved dynamic source route.

So, with **no parent `generateStaticParams`**, a build-time localized image cannot be completely prerendered. A runtime dynamic App Route would be conceptually possible, but the 16.2.10 adapter code simultaneously treats physical metadata files as static-file candidates. This mixed classification is the dangerous state.

## 1.5 Vercel adapter reconciliation and E777

`handleBuildComplete` is only run when a Next build adapter supplies `onBuildComplete`. It constructs application outputs and then hands those outputs to the adapter. ([GitHub][4])

While collecting App entries, the code identifies static metadata routes. It skips such an App Route only when the corresponding pathname exists in either:

```ts
prerenderManifest.routes
prerenderManifest.dynamicRoutes
```

including locale-prefixed variants from built-in Next i18n.

Because the supplied manifest has no OG route:

```ts
isStaticMetadataRoute === true
isPrerenderedMetadataRoute === false
```

The route therefore remains in `appOutputMap` as an App Route using its unresolved normalized pathname.

Later, prerender reconciliation calls `getParentOutput`. It normalizes the source route and searches:

```ts
pageOutputMap[normalizedSrcRoute] || appOutputMap[normalizedSrcRoute]
```

If neither exists and `allowMissing` is false, it throws:

```text
Invariant: failed to find source route ... for prerender ...
```

That is E777.

## Answer to Question 1

### Is a static JPEG below `[locale]` supported without parent static params?

**Not as a concrete build-time prerender.**

There is no value for `[locale]`, and the static JPEG module creates no params of its own.

What is questionable is not the absence of `/en/...` when no params exist. The questionable behavior is that the build produces a static-looking placeholder route and lets adapter reconciliation reach a contradictory state rather than:

- treating it consistently as a dynamic route;
- rejecting it earlier with a clear missing-param error; or
- successfully inheriting user params when they are supplied.

---

# 2. Why the layout `generateStaticParams` experiment should have worked but did not

The experiment added:

```ts
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

Based on `generateRouteStaticParams`, this should produce:

```ts
;[{ locale: "en" }]
```

at the `[locale]` segment, and those params should flow through the metadata route even though its generated route module has no `generateStaticParams`. ([GitHub][3])

Adding:

```ts
export const dynamicParams = false
```

does not generate missing values. It only restricts parameters outside the generated set and validates that required parameters are present. The static-path builder explicitly checks missing params when `dynamicParams: false`; it is not a substitute for param discovery. ([GitHub][3])

## Most likely explanation

**Inference, high confidence:** for this Turbopack-created physical metadata entry, the segment collection supplied to `buildAppStaticPaths` does not include the parent layout’s `generateStaticParams`, or the entry is bypassing the ordinary static-path build in a way that loses those params.

Evidence supporting that inference:

1. The generic segment walker would merge the layout result if the layout were present.
2. The loader does not override or erase `locale`; it simply has no function of its own.
3. The experiment did not merely fail to emit the prerender. It left the same `/-/` placeholder, indicating that the parent value was never incorporated.
4. `dynamicParams = false` also had no observable validation effect on the metadata route, reinforcing the possibility that the layout segment configuration was missing from that metadata entry’s collected segment chain.

## What is not established

I did not find source-backed evidence proving whether the omission originates specifically in:

- Turbopack entry construction;
- metadata-route loader integration;
- route segment collection;
- root-parameter handling;
- or an interaction introduced in 16.2.x.

The generic static-path code itself supports parent composition. The supplied reproduction points to the route-entry inputs to that code, not to the merge algorithm shown above.

## Is it caused by root params?

No direct evidence establishes that.

`[locale]` may be treated as a root parameter in a root dynamic layout, but the root-param-specific validation shown in `app.ts` primarily affects partial prerendering and fallback-shell generation. It does not explain why a direct `{locale: "en"}` result would disappear in a normal non-PPR complete route. ([GitHub][3])

## Is it adapter-only?

There are two separate defects or inconsistencies:

- **Before adapter:** local build already produces `/-/` and omits the route from the prerender manifest.
- **At adapter:** E777 turns that inconsistent local output into a deployment failure.

Therefore the adapter is where the fatal exception occurs, but it is not where the bad metadata-route state first appears.

---

# 3. Known issue / regression search

## Public records found

I found older primary-source issues involving file-convention Open Graph behavior, but none matches this failure exactly:

- `opengraph-image` failed inside route groups in an older App Router implementation; issue #48106 is closed. It concerns route groups and 404 behavior, not E777, `[locale]`, `/-/`, or Next 16.2.10. ([GitHub][5])
- Issue #49859 concerns an incorrect production hostname for a file-based OG URL. It is unrelated to prerender reconciliation. ([GitHub][6])
- Issue #49162 concerns `basePath`. It is not the dynamic-segment adapter failure here. ([GitHub][7])

The exact E777 message is present in the current error registry and `v16.2.10` source, but I found no indexed public issue tying it to localized static metadata. ([GitHub][8])

## Queries and areas checked

I searched the Next.js GitHub issue, discussion, PR and code indexes for combinations of:

```text
E777
"failed to find source route"
"failed to find source route" prerender
opengraph-image dynamic segment
opengraph-image [locale]
"/-/opengraph-image.jpg"
static metadata build-complete
static metadata adapter prerender
isStaticMetadataFile build-complete
"Skip static metadata routes only when they are prerendered"
Turbopack opengraph-image dynamic segment
```

I also inspected:

- exact `v16.2.10` metadata loader;
- exact `v16.2.10` App static-path builder;
- exact `v16.2.10` adapter reconciliation;
- metadata-route classifiers;
- official current metadata docs;
- older OG-image issues and discussions.

## Version conclusion

There is **no source-backed affected-version range or fixed version** for this exact reproduction.

Therefore:

- Do not claim 16.2.11 fixes it merely because 16.2.11 exists.
- Do not recommend downgrading to a particular version unless a controlled version matrix demonstrates that it eliminates both `/-/` and E777.
- Pinning 16.2.10 may preserve reproducibility but does not fix the deployment.

---

# 4. Fix comparison

| Option                                                                            | What it restores                                                                              | What it loses / risks                                                                                                                               | Assessment                                                                                                                             |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Keep `app/[locale]/opengraph-image.jpg` and make parent prerender work            | Automatic file-convention discovery, automatic dimensions/type, `.alt.txt`, locale-scoped URL | Currently blocked by the reproduced metadata-route param propagation problem; adding layout `generateStaticParams` did not fix it                   | Architecturally clean, but not dependable on this exact stack without proving a Next version/configuration where manifests are correct |
| Move image to `app/opengraph-image.jpg` and explicitly declare `openGraph.images` | Stable root image route plus deterministic OG tags for `/en`; avoids dynamic metadata route   | Metadata must be maintained explicitly; sidecar no longer supplies the explicit image object                                                        | Most durable immediate workaround                                                                                                      |
| Replace with `app/[locale]/opengraph-image.tsx`                                   | Code-generated image route; can receive `params`; can make locale-specific output             | Runtime/build image generation complexity, fonts/runtime constraints, larger failure surface; no `.alt.txt` automation for explicit metadata object | Good when the image genuinely varies by locale/content                                                                                 |
| Upgrade Next                                                                      | Potential upstream correction                                                                 | No confirmed fixed version; may introduce unrelated changes                                                                                         | Test in a version matrix, do not treat as established fix                                                                              |
| Downgrade Next                                                                    | May avoid a regression if demonstrated                                                        | No confirmed known-good version; loses fixes/features                                                                                               | Only after exact reproduction proves a known-good release                                                                              |
| Pin Next                                                                          | Reproducibility                                                                               | Preserves the bug                                                                                                                                   | Operational control, not remediation                                                                                                   |

## Recommended explicit metadata shape

With `metadataBase` already defined:

```ts
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),

    openGraph: {
      title: "…",
      description: "…",
      siteName: studio.name,
      type: "website",
      locale: "en_US",

      images: [
        {
          url: "/opengraph-image.jpg",
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Descriptive alternative text",
        },
      ],
    },
  }
}
```

Next’s metadata API accepts image descriptors containing URL, width, height and alt data, while file-convention OG images are otherwise discovered automatically. ([Next.js][9])

### Is `"/opengraph-image.jpg"` safely resolved through `metadataBase`?

Yes. With:

```ts
metadataBase: new URL(SITE_URL)
```

a root-relative metadata URL is resolved against that base and emitted as an absolute URL.

For example:

```text
metadataBase = https://example.com
url          = /opengraph-image.jpg
result       = https://example.com/opengraph-image.jpg
```

Using the root route is preferable here because the actual file-convention route after moving the file is `/opengraph-image.jpg`, not `/en/opengraph-image.jpg`.

### Does `.alt.txt` still contribute once `images` is explicit?

For the explicitly supplied image object, **no**.

The sidecar belongs to file-convention metadata discovery. Once the image descriptor itself contains:

```ts
alt: "..."
```

that value is the source for `og:image:alt`.

Leaving `app/opengraph-image.alt.txt` may still describe the root file-convention asset in contexts where Next independently resolves that convention, but it should not be relied on to mutate an explicit `openGraph.images` entry.

### Why moving the file alone removed the tag

Your result is consistent with metadata replacement behavior at the locale layout:

```ts
openGraph: {
  title,
  description,
  siteName,
  type,
  locale,
}
```

defines an `openGraph` object with no `images`. Nested metadata fields are not safely treated as deep-merged independent fragments across every metadata source. Explicitly including `images` removes that ambiguity.

---

# 5. Other conventions with a similar failure shape

## Static image metadata

The closest equivalents are:

```text
icon.png
icon.svg
apple-icon.png
opengraph-image.jpg
twitter-image.jpg
```

They use the static-asset loader branch and become force-static route handlers returning embedded buffers. ([GitHub][2])

Placed beneath an unresolved dynamic segment, they can theoretically encounter the same missing-concrete-path condition.

### Icons are not identical in practical scope

- A root `app/icon.svg` has no dynamic parameter and therefore prerenders correctly, matching your experiment.
- A segment-local icon below `[locale]` would share the same structural risk.
- Favicon conventions have additional root-location restrictions, so not every icon placement is equivalent.

## `robots` and `manifest`

Physical files such as:

```text
robots.txt
manifest.webmanifest
```

also use the static asset branch.

Code files such as:

```text
robots.ts
manifest.ts
```

use the dynamic text-route loader branch instead. The loader explicitly separates those cases. ([GitHub][2])

Thus a physical text metadata asset below a dynamic segment can share the concrete-param problem, while a code route has different execution and static/dynamic classification.

## `sitemap`

A physical `sitemap.xml` is a static asset.

A code `sitemap.ts` receives special handling:

- a single sitemap becomes one generated route;
- `generateSitemaps` creates synthetic metadata IDs and loader-generated static params.

This is analogous to `generateImageMetadata`, not to a physical JPEG. ([GitHub][2])

## Code-generated image routes

For:

```text
opengraph-image.tsx
twitter-image.tsx
icon.tsx
apple-icon.tsx
```

the source module is wrapped as an image Route Handler.

There are two cases:

1. No `generateImageMetadata`: one image route, no synthetic loader params.
2. With `generateImageMetadata`: the loader generates static params for `__metadata_id__`.

In both cases, ordinary pathname params such as `locale` still come from parent segments. The generated function only accounts for image IDs. ([GitHub][2])

---

# 6. Durable local / CI guard

## Can Vercel’s reconciliation be invoked locally through a supported API?

Not reliably.

`handleBuildComplete` runs only when an adapter is configured and exposes `onBuildComplete`. The API receives internal build outputs and manifests. ([GitHub][4])

The Vercel production adapter is not documented as a stable, directly invokable local validation command for application CI. Calling:

```text
next/dist/build/adapter/build-complete.js
```

directly would rely on an internal package path and internal arguments. That is not a durable supported interface.

A custom Next adapter could exercise the public adapter hook, but it would test your custom adapter integration rather than necessarily reproducing Vercel’s private deployment conversion exactly.

## Safer guard: assert manifest and artifact invariants

After `pnpm build`, run a script that reads:

```text
.next/app-path-routes-manifest.json
.next/prerender-manifest.json
.next/server/app-paths-manifest.json   // when present
.next/server/app/
```

### Required checks for this application

#### A. Source metadata route exists

In:

```text
.next/app-path-routes-manifest.json
```

assert:

```json
{
  "/[locale]/opengraph-image.jpg/route": "/[locale]/opengraph-image.jpg"
}
```

This confirms discovery but is not sufficient for success.

#### B. Concrete localized output exists

In:

```text
.next/prerender-manifest.json
```

require one of:

```ts
routes["/en/opengraph-image.jpg"]
dynamicRoutes["/[locale]/opengraph-image.jpg"]
```

depending on the intended design.

For the “fully prerender this one locale” design, require the first and reject the second as insufficient unless dynamic serving is deliberate.

#### C. No unresolved placeholder route

Reject build output containing:

```text
/-/opengraph-image.jpg
```

However, do not use this as the only test; formatting of the human route table is not an API.

#### D. No unresolved server artifact

Recursively inspect relevant manifest values and server output paths. Reject a physical metadata route whose only server location retains:

```text
/[locale]/opengraph-image.jpg
```

when the intended build contract is `/en/opengraph-image.jpg`.

#### E. Concrete body exists

For a prerendered static metadata route, check for the body artifact used by adapter reconciliation:

```text
.next/server/app/en/opengraph-image.jpg.body
```

or the exact path corresponding to the route in the prerender manifest.

The adapter itself looks for:

```ts
server/app/<normalized-route>.body
```

when converting a static metadata prerender into a static-file output.

#### F. HTML metadata integration

Start the production server locally after build and request:

```text
/en
```

Assert the final HTML contains:

```html
<meta property="og:image" content="https://.../opengraph-image.jpg" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="..." />
```

Then fetch the emitted image URL and assert:

```text
status = 200
content-type = image/jpeg
```

This catches the separate failure where the route exists but metadata composition omits the image.

## Suggested CI contract

For the root-file plus explicit-images workaround:

```text
1. Build exits 0.
2. prerender-manifest contains /opengraph-image.jpg.
3. server/app/opengraph-image.jpg.body exists.
4. /en HTML contains one expected absolute og:image URL.
5. That URL returns 200 image/jpeg.
6. No expected route or manifest value contains "/-/".
```

For the desired localized-file convention:

```text
1. Build exits 0.
2. app-path manifest discovers /[locale]/opengraph-image.jpg.
3. prerender-manifest contains /en/opengraph-image.jpg.
4. concrete .body exists for /en/opengraph-image.jpg.
5. no unresolved [locale] is the sole deployable metadata output.
6. /en references /en/opengraph-image.jpg and it returns 200.
```

---

# Recommendation

For the current deployment, the most defensible option is:

```text
app/opengraph-image.jpg
```

plus an explicit `openGraph.images` descriptor in `generateMetadata`.

It restores:

- a deterministic absolute image URL;
- MIME type;
- `1200 × 630`;
- explicit alt text;
- correct OG output on `/en`;
- a root metadata route that is already confirmed to enter the prerender manifest.

It gives up automatic locale-scoped file-convention metadata, but with one locale and one shared image that has no functional value.

Separately, preserve the failing tree as a minimal reproduction and test future Next versions against the manifest invariants above. Do not upgrade solely on the assumption that the next patch resolves E777.

# Confidence and unknowns

**High confidence**

- Physical JPEGs use the static asset loader and get no generated `generateStaticParams`.
- `generateImageMetadata` static params only generate `__metadata_id__`.
- Parent segment static params are designed to compose through descendant route segments.
- The adapter skips static metadata App Routes only when it finds matching prerender-manifest entries.
- E777 is thrown when adapter reconciliation cannot find the originating page/App output.
- Moving the file to root and explicitly declaring the image is structurally robust.

**Moderate-to-high confidence, inference**

- The layout’s `generateStaticParams` was omitted from, or not applied to, the Turbopack metadata route’s segment chain.
- The `/-/` route is a placeholder symptom of that missing concrete param.
- The Vercel adapter exposes rather than creates the original metadata-route inconsistency.

**Unknown**

- The first affected Next release.
- Whether Webpack mode on 16.2.10 reproduces it.
- Whether 16.2.11 or a canary release fixes it.
- Whether an unindexed/private Vercel issue already tracks this exact case.
- The exact Turbopack source function that drops or bypasses the parent segment without a standalone minimal repository and version/bundler matrix.

[1]: https://github.com/vercel/next.js/blob/v16.2.10/packages/next/src/lib/metadata/is-metadata-route.ts "next.js/packages/next/src/lib/metadata/is-metadata-route.ts at v16.2.10 · vercel/next.js · GitHub"
[2]: https://github.com/vercel/next.js/blob/v16.2.10/packages/next/src/build/webpack/loaders/next-metadata-route-loader.ts "next.js/packages/next/src/build/webpack/loaders/next-metadata-route-loader.ts at v16.2.10 · vercel/next.js · GitHub"
[3]: https://github.com/vercel/next.js/blob/v16.2.10/packages/next/src/build/static-paths/app.ts "next.js/packages/next/src/build/static-paths/app.ts at v16.2.10 · vercel/next.js · GitHub"
[4]: https://github.com/vercel/next.js/blob/v16.2.10/packages/next/src/build/adapter/build-complete.ts "next.js/packages/next/src/build/adapter/build-complete.ts at v16.2.10 · vercel/next.js · GitHub"
[5]: https://github.com/vercel/next.js/issues/48106?utm_source=chatgpt.com "[NEXT-1102] `opengraph-image` is 404 in route group ..."
[6]: https://github.com/vercel/next.js/issues/49859?utm_source=chatgpt.com "File-based Metadata - opengraph-image wrong URL #49859"
[7]: https://github.com/vercel/next.js/issues/49162?utm_source=chatgpt.com "[NEXT-1087] Next OpenGraph Image not working with basePath"
[8]: https://github.com/vercel/next.js/blob/canary/packages/next/errors.json?utm_source=chatgpt.com "next.js/packages/next/errors.json at canary · vercel ..."
[9]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image?utm_source=chatgpt.com "opengraph-image and twitter-image - Metadata Files"
