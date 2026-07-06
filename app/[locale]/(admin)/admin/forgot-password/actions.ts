"use server"

import { cookies, headers } from "next/headers"
import { createSupabaseAuthClient, getRequestOrigin } from "@/services/supabaseAuth"
import { logAuthFailure } from "@/services/authLog"

export type ForgotPasswordResult = { sent: true } | { error: string }

export async function forgotPasswordAction(
  locale: string,
  _prev: ForgotPasswordResult | null,
  formData: FormData,
): Promise<ForgotPasswordResult> {
  const email = formData.get("email") as string

  const cookieStore = await cookies()
  const headerList = await headers()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options)
      }
    },
  })

  const origin = getRequestOrigin(headerList)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-callback?locale=${locale}`,
  })

  if (error) {
    logAuthFailure("forgot_password", error)
  }

  return { sent: true }
}
