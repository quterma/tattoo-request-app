"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createSupabaseAuthClient, getRequestOrigin } from "@/services/supabaseAuth"

export type LoginResult = { error: string } | null

export async function loginAction(
  locale: string,
  _prev: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = await cookies()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options)
      }
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const t = await getTranslations({ locale, namespace: "admin" })
    return { error: t("loginInvalidCredentials") }
  }

  redirect(`/${locale}/admin`)
}

export async function googleLoginAction(locale: string): Promise<void> {
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?locale=${locale}`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    redirect(`/${locale}/admin/login?error=oauth`)
  }

  redirect(data.url)
}
