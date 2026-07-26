import { mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_BASE_URL = "http://localhost:3000"
const DEFAULT_ROUTES = [
  "/en",
  "/en/process",
  "/en/request",
  "/en/location",
  "/en/preparation",
  "/en/aftercare",
]
const WIDTHS = [320, 375, 768, 1280]
const VIEWPORT_HEIGHT = 800
const OUTPUT_DIR = "screenshots"

function parseArgs(argv) {
  const [baseUrl, ...routes] = argv
  return {
    baseUrl: baseUrl || DEFAULT_BASE_URL,
    routes: routes.length > 0 ? routes : DEFAULT_ROUTES,
  }
}

function routeSlug(url) {
  const trimmed = url.pathname.replace(/^\/+|\/+$/g, "")
  const slug = trimmed.replace(/\//g, "-").replace(/[^A-Za-z0-9_-]/g, "_")
  return slug || "root"
}

class UnreachableServerError extends Error {
  constructor(cause) {
    super(cause.message)
    this.cause = cause
  }
}

function isConnectionError(error) {
  return (
    error instanceof Error &&
    /ERR_CONNECTION_REFUSED|ECONNREFUSED|net::ERR_/i.test(error.message)
  )
}

function isMissingBrowserError(error) {
  return error instanceof Error && /Executable doesn't exist/i.test(error.message)
}

async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight
    const scrollHeight = () => document.documentElement.scrollHeight
    let position = 0
    while (position < scrollHeight()) {
      position += step
      window.scrollTo(0, position)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 150))
  })
}

async function captureRoute({ browser, baseUrl, route }) {
  const url = new URL(route, baseUrl)
  const slug = routeSlug(url)

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: VIEWPORT_HEIGHT },
    })
    const page = await context.newPage()

    try {
      try {
        await page.goto(url.toString(), { waitUntil: "load" })
      } catch (error) {
        throw isConnectionError(error) ? new UnreachableServerError(error) : error
      }
      await scrollThroughPage(page)

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      )
      const overflowNote = scrollWidth > width ? " OVERFLOW" : ""
      console.log(
        `${slug}-${width}: scrollWidth=${scrollWidth} (viewport ${width})${overflowNote}`,
      )

      const path = `${OUTPUT_DIR}/${slug}-${width}.png`
      await page.screenshot({ path, fullPage: true })
    } finally {
      await context.close()
    }
  }
}

export async function runScreenshots({ baseUrl, routes }) {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const { chromium } = await import("playwright")
  let browser
  try {
    browser = await chromium.launch()
  } catch (error) {
    if (isMissingBrowserError(error)) {
      console.error(
        "Playwright's Chromium browser is not installed. Run:\n" +
          "  pnpm exec playwright install chromium",
      )
      process.exitCode = 1
      return
    }
    throw error
  }

  try {
    for (const route of routes) {
      try {
        await captureRoute({ browser, baseUrl, route })
      } catch (error) {
        if (error instanceof UnreachableServerError) {
          console.error(
            `Could not reach ${baseUrl}${route}. Is the server running?\n` +
              "  Start it with: pnpm dev  (or pnpm build && pnpm start)",
          )
          process.exitCode = 1
          return
        }
        throw error
      }
    }
  } finally {
    await browser.close()
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  const { baseUrl, routes } = parseArgs(process.argv.slice(2))
  await runScreenshots({ baseUrl, routes })
}
