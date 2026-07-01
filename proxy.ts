import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { defaultLocale, locales, routing } from "@/shared/i18n"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"

const intlMiddleware = createMiddleware(routing)

const supportedLocales = new Set<string>(locales)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1] ?? ""

  let response: NextResponse

  if (supportedLocales.has(firstSegment)) {
    response = intlMiddleware(request) as NextResponse
  } else if (firstSegment !== "") {
    const rest = pathname.slice(firstSegment.length + 1)
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${rest}`
    return NextResponse.redirect(url)
  } else {
    response = intlMiddleware(request) as NextResponse
  }

  // Refresh the Supabase SSR session cookie if it is close to expiry.
  // getUser() is a no-op when no session exists.
  const supabase = createSupabaseAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll: (toSet) => {
      toSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    },
  })

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
}
