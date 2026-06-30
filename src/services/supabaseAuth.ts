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
