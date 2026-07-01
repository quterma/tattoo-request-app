"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"

export type ResetPasswordResult = { error: string } | null

export async function resetPasswordAction(
  locale: string,
  _prev: ResetPasswordResult,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return { error: "Please fill in both password fields." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const cookieStore = await cookies()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options)
      }
    },
  })

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "Could not update password. Please try again." }
  }

  await supabase.auth.signOut()

  redirect(`/${locale}/admin/login?reset=success`)
}
