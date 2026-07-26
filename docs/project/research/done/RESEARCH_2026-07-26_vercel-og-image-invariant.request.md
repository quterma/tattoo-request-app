# External research request: Next 16.2.10 / Vercel E777 for static OG image under `[locale]`

Research this as a current, source-backed technical investigation. Browse the web and inspect the
exact Next.js `v16.2.10` source (prefer the official Next.js repository/tag, official docs,
Vercel/Next changelog and issue tracker). Do not answer from memory. Link every externally
verifiable claim to a primary source; distinguish confirmed source behavior from inference. Search
open and closed issues/PRs as well as release notes. If no public issue exists, say so and list the
queries/areas checked. Do not propose repository edits; return evidence and options for another
agent to normalize into a research thread.

## Failure to explain

A Vercel deployment of a Next.js App Router application fails after `next build`:

```text
Build error occurred
Error: Invariant: failed to find source route /[locale]/opengraph-image.jpg
  for prerender /[locale]/opengraph-image.jpg
```

Local `pnpm build` on the identical commit exits 0, but its route table contains the suspicious
entry:

```text
○ /-/opengraph-image.jpg
```

instead of `/en/opengraph-image.jpg`.

Versions:

```json
{
  "next": "16.2.10",
  "next-intl": "4.13.1",
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

The app uses Turbopack and Vercel's Next build adapter. There is one locale:

```ts
export const defaultLocale = "en" as const
export const locales = [defaultLocale] as const

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
})
```

The file-based metadata assets are:

```text
app/[locale]/opengraph-image.jpg
app/[locale]/opengraph-image.alt.txt
```

The dynamic segment layout has no `generateStaticParams` in the failing tree. Its metadata is
generated but does not explicitly declare `openGraph.images`:

```ts
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: "app",
  })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: studio.name,
      type: "website",
      locale: "en_US",
    },
    robots: { index: false, follow: false },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

Locale routing is handled by `proxy.ts` / `next-intl` middleware:

```ts
export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
}
```

Thus `.jpg` paths are excluded from the proxy matcher.

## Reproduced evidence

On a clean local build of the failing tree:

- `.next/app-path-routes-manifest.json` contains
  `"/[locale]/opengraph-image.jpg/route": "/[locale]/opengraph-image.jpg"`;
- `.next/prerender-manifest.json` has only `/_global-error`, `/_not-found`, and `/icon.svg`;
- the OG image is absent from that prerender manifest;
- `.next/server/app/[locale]/opengraph-image.jpg` retains the literal dynamic segment;
- the root `app/icon.svg` is correctly prerendered.

The Vercel-only exception is present in
`next/dist/build/adapter/build-complete.js`. The relevant logic, paraphrased from the installed
`16.2.10` package, classifies static metadata with `isStaticMetadataFile(normalizedPage)`, tests
whether it occurs in `prerenderManifest.routes`, and later resolves a source route through
`pageOutputMap` / `appOutputMap`. If the parent output is missing and `allowMissing` is false, it
throws error code `E777` with the message above.

The installed `16.2.10` package also has a metadata route loader
(`next/dist/build/webpack/loaders/next-metadata-route-loader.js`) that emits
`generateStaticParams`; determine precisely when and how that generated function participates in
static-path generation for a static image below a dynamic segment.

## Controlled experiments already performed

All edits below were reverted after clean builds:

1. Adding this to `app/[locale]/layout.tsx` had no effect:

   ```ts
   export function generateStaticParams() {
     return routing.locales.map((locale) => ({ locale }))
   }
   ```

   The route remained `/-/opengraph-image.jpg`; the image remained absent from the prerender
   manifest.

2. Adding `export const dynamicParams = false` alongside it also had no effect.

3. Moving both image and `.alt.txt` to `app/` changed the route to
   `○ /opengraph-image.jpg`, added it to the prerender manifest, and removed the literal dynamic
   segment from the output path. However, `curl /en` then emitted no `og:image` tag at all.

4. Proxy interference was ruled out by its dotted-path exclusion and the generated middleware
   manifest.

Before moving the asset, `/en` emitted `og:image`, `og:image:type`, and
`og:image:width=1200`. The sidecar supplied the alt text.

## Questions to answer

1. Trace the intended Next `16.2.10` mechanism from static metadata file discovery through the
   generated metadata route, segment/static-param collection, prerender manifest, and build
   adapter. Is a static `opengraph-image.jpg` below `[locale]` supported when the parent segment
   has no user `generateStaticParams`? If not, what documented invariant is violated?

2. If parent `generateStaticParams` is intended to make it work, explain from exact source why the
   experiment above did not populate the metadata route or prerender manifest. Check whether this
   is specific to static image files, Turbopack, Next 16.2.x, root params, metadata loader output,
   or the adapter.

3. Is `E777` in this scenario a known Next/Vercel defect or regression? Find relevant issues, PRs,
   commits, changelog/release notes, or confirmed reproductions for all of:

   - `E777`;
   - `failed to find source route ... for prerender`;
   - `opengraph-image` below a dynamic segment;
   - the `/-/opengraph-image.jpg` local build output;
   - static metadata route skipping/reconciliation in `build-complete.js`.

   State affected and fixed versions if established. Do not infer a fixed version merely because
   a later release exists.

4. Evaluate these fixes and name what each one restores or loses:

   - keep the static file below `[locale]` and correctly prerender the segment;
   - move the static file to `app/` and explicitly set `openGraph.images` from
     `generateMetadata`;
   - replace it with `app/[locale]/opengraph-image.tsx`;
   - upgrade, downgrade, or pin Next if a specific regression/fix is confirmed.

   For explicit `openGraph.images`, show the exact typed Next metadata shape needed to preserve
   URL, MIME type, width `1200`, height `630`, and alt text. Confirm whether a root file-convention
   asset URL such as `/opengraph-image.jpg` is safely addressable through `metadataBase`, and
   whether the `.alt.txt` sidecar contributes anything once `images` is explicit.

5. Identify other metadata conventions with the same failure shape. In particular distinguish:
   icons/apple icons, `robots`, `sitemap`, manifest, and code-generated image metadata routes.

6. Recommend a durable local/CI guard that catches this before Vercel. Determine whether the
   adapter reconciliation can be invoked locally through a supported command/API, or whether a
   manifest/route-table invariant check is the safer guard. Specify exact files/fields and avoid
   relying only on human inspection of `/-/`.

## Required answer format

- Source-backed mechanism, with exact file/function links at tag `v16.2.10`.
- Known-issue/regression search result, with primary-source links.
- A comparison table of viable fixes and trade-offs.
- A proposed local guard precise enough to implement.
- Explicit confidence/unknowns; label every inference.
