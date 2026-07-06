"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"
import { logAuthFailure } from "@/services/authLog"

export async function logoutAction(locale: string): Promise<void> {
  const cookieStore = await cookies()

  const supabase = createSupabaseAuthClient({
    getAll: () => cookieStore.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        cookieStore.set(name, value, options)
      }
    },
  })

  const { error } = await supabase.auth.signOut()

  if (error) {
    logAuthFailure("logout", error, "warn")
  }

  redirect(`/${locale}/admin/login`)
}
