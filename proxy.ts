import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import {
  hasSupportedLocalePrefix,
  routing,
  withDefaultLocalePrefix,
} from "@/shared/i18n"
import { createSupabaseAuthClient } from "@/services/supabaseAuth"

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response: NextResponse

  if (hasSupportedLocalePrefix(pathname)) {
    response = intlMiddleware(request) as NextResponse
  } else {
    const url = request.nextUrl.clone()
    url.pathname = withDefaultLocalePrefix(pathname)
    return NextResponse.redirect(url)
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
