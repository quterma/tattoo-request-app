"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"

export type ResetPasswordResult = { error: string } | null

export async function resetPasswordAction(
  locale: string,
  _prev: ResetPasswordResult,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  const t = await getTranslations({ locale, namespace: "admin" })

  if (!password || !confirmPassword) {
    return { error: t("resetPasswordFieldsRequired") }
  }

  if (password !== confirmPassword) {
    return { error: t("resetPasswordMismatch") }
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
    return { error: t("resetPasswordFailed") }
  }

  await supabase.auth.signOut()

  redirect(`/${locale}/admin/login?reset=success`)
}
