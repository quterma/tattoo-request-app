import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"
import { defaultLocale, locales, type Locale } from "@/shared/i18n"

function isSupportedLocale(value: string | null): value is Locale {
  return locales.includes(value as Locale)
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const requestedLocale = searchParams.get("locale")
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/admin/login?error=oauth`)
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/admin/login?error=oauth`)
  }

  return NextResponse.redirect(`${origin}/${locale}/admin`)
}
