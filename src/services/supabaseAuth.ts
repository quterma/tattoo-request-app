import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export type CookieHandler = {
  getAll: () => { name: string; value: string }[]
  setAll: (cookies: { name: string; value: string; options?: CookieOptions }[]) => void
}

export type HeaderHandler = {
  get: (name: string) => string | null
}

/**
 * Derives the request origin for use in redirectTo URLs (OAuth, password reset).
 * Prefers x-forwarded-host/proto, which Vercel and other reverse proxies set themselves
 * (not client-controlled in production) over the raw Host header, so this is safe for both
 * local dev (falls through to "host") and production.
 */
export function getRequestOrigin(headers: HeaderHandler): string {
  const forwardedHost = headers.get("x-forwarded-host")
  const host = forwardedHost ?? headers.get("host")
  const protocol = headers.get("x-forwarded-proto") ?? "https"
  return `${protocol}://${host}`
}

/**
 * Creates an SSR Supabase client scoped to a single request/response cycle.
 * Use for session identity checks only — not for DB or Storage operations.
 * Reads env vars directly to avoid pulling service_role config into middleware.
 */
export function createSupabaseAuthClient(cookies: CookieHandler) {
  return createServerClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_PUBLISHABLE_KEY"),
    { cookies },
  )
}
