import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Post-build invariant check for file-based static metadata routes.
 *
 * Why this exists: a local `next build` exits 0 on a tree that Vercel refuses to deploy. When a
 * static metadata asset (opengraph-image, icon, apple-icon, twitter-image, robots.txt, sitemap.xml,
 * manifest.webmanifest) sits below an unresolved dynamic segment, Next registers the route with the
 * literal segment (`/[locale]/opengraph-image.jpg`), prints it as `/-/opengraph-image.jpg`, and
 * omits it from the prerender manifest. `next build` tolerates that; Vercel's build adapter
 * (`build/adapter/build-complete.js`) then fails with
 * `Invariant: failed to find source route ... (E777)`.
 *
 * This happened on 2026-07-26 and broke a deploy. See
 * `docs/project/research/done/RESEARCH_2026-07-26_vercel-og-image-invariant.md`.
 *
 * The check reads only build output — no browser, no server, no network — so it stays inside
 * `pnpm qg`'s headless-free contract.
 */

const DIST_DIR = ".next"

// Static metadata routes that must be fully resolved and prerendered after a build.
// Add an entry when a new file-based metadata asset is introduced.
const REQUIRED_PRERENDERS = ["/opengraph-image.jpg", "/icon.svg"]

const PLACEHOLDER_SEGMENT = "/-/"

function readJson(relPath) {
  const full = resolve(DIST_DIR, relPath)
  if (!existsSync(full)) {
    throw new Error(
      `${relPath} not found. Run \`pnpm build\` before this check (looked in ${DIST_DIR}/).`,
    )
  }
  return JSON.parse(readFileSync(full, "utf-8"))
}

export function checkMetadataRoutes() {
  const errors = []

  const prerender = readJson("prerender-manifest.json")
  const appRoutes = readJson("app-path-routes-manifest.json")
  const prerendered = Object.keys(prerender.routes ?? {})

  // 1. Every required static metadata route is actually prerendered.
  for (const route of REQUIRED_PRERENDERS) {
    if (!prerendered.includes(route)) {
      errors.push(
        `${route} is missing from prerender-manifest.json. ` +
          `A static metadata asset below an unresolved dynamic segment produces exactly this, ` +
          `and Vercel fails it with E777 even though \`next build\` exits 0.`,
      )
    }
  }

  // 2. Its build artifact exists on disk under the resolved path.
  for (const route of REQUIRED_PRERENDERS) {
    if (!prerendered.includes(route)) continue
    const body = resolve(DIST_DIR, "server/app", `${route.replace(/^\//, "")}.body`)
    if (!existsSync(body)) {
      errors.push(`${route} is prerendered but its .body artifact is missing at ${body}.`)
    }
  }

  // 3. No manifest entry carries the unresolved-segment placeholder.
  for (const [key, value] of Object.entries(appRoutes)) {
    const printed = `${key} -> ${value}`
    if (key.includes(PLACEHOLDER_SEGMENT) || String(value).includes(PLACEHOLDER_SEGMENT)) {
      errors.push(
        `app-path-routes-manifest.json contains an unresolved segment: ${printed}. ` +
          `This is the '/-/' placeholder Next emits when it cannot resolve a dynamic segment.`,
      )
    }
  }
  for (const route of prerendered) {
    if (route.includes(PLACEHOLDER_SEGMENT)) {
      errors.push(`prerender-manifest.json contains an unresolved segment: ${route}.`)
    }
  }

  return errors
}

function main() {
  let errors
  try {
    errors = checkMetadataRoutes()
  } catch (error) {
    console.error(`metadata-routes: ${error.message}`)
    process.exit(1)
  }

  if (errors.length > 0) {
    console.error("metadata-routes: FAIL")
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    console.error(
      "\nThis tree builds locally but will fail to deploy. See " +
        "docs/project/research/done/RESEARCH_2026-07-26_vercel-og-image-invariant.md",
    )
    process.exit(1)
  }

  console.log(
    `metadata-routes: OK (${REQUIRED_PRERENDERS.length} static metadata routes resolved and prerendered)`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
