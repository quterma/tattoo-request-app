import { createSupabaseAuthClient } from "./supabaseAuth"
import type { CookieHandler } from "./supabaseAuth"
import { supabase } from "./supabase"

export type AuthFailureReason = "unauthenticated" | "unauthorized"

export type AuthResult =
  | { ok: true; userId: string; studioId: string }
  | { ok: false; reason: AuthFailureReason }

export async function getAuthenticatedStudioMember(
  cookies: CookieHandler,
): Promise<AuthResult> {
  const authClient = createSupabaseAuthClient(cookies)

  const { data: userData, error: authError } = await authClient.auth.getUser()

  if (authError) throw new Error(`Auth session check failed: ${authError.message}`)

  if (!userData.user) return { ok: false, reason: "unauthenticated" }

  const userId = userData.user.id

  const { data: membership, error: dbError } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (dbError) throw new Error(`Studio membership lookup failed: ${dbError.message}`)

  if (!membership) return { ok: false, reason: "unauthorized" }

  return { ok: true, userId, studioId: membership.studio_id as string }
}
