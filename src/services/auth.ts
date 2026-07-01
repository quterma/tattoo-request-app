import { createSupabaseAuthClient } from "./supabaseAuth"
import type { CookieHandler } from "./supabaseAuth"
import { supabase } from "./supabase"

export type AuthFailureReason = "unauthenticated" | "unauthorized"

export type AuthResult =
  | { ok: true; userId: string; studioId: string }
  | { ok: false; reason: AuthFailureReason }

/**
 * Returns the current Supabase Auth user, or null if there is no session.
 * A missing session (AuthSessionMissingError) is expected and returns null;
 * any other error is an infrastructure failure and is rethrown.
 */
export async function getOptionalUser(cookies: CookieHandler) {
  const authClient = createSupabaseAuthClient(cookies)

  const { data, error } = await authClient.auth.getUser()

  if (error) {
    if (error.name === "AuthSessionMissingError") return null
    throw new Error(`Auth session check failed: ${error.message}`)
  }

  return data.user
}

export async function getAuthenticatedStudioMember(
  cookies: CookieHandler,
): Promise<AuthResult> {
  const user = await getOptionalUser(cookies)

  if (!user) return { ok: false, reason: "unauthenticated" }

  const userId = user.id

  const { data: membership, error: dbError } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (dbError) throw new Error(`Studio membership lookup failed: ${dbError.message}`)

  if (!membership) return { ok: false, reason: "unauthorized" }

  return { ok: true, userId, studioId: membership.studio_id as string }
}
