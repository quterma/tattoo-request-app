import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { defaultLocale, locales, routing } from "@/shared/i18n"

const intlMiddleware = createMiddleware(routing)

const supportedLocales = new Set<string>(locales)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1] ?? ""

  if (supportedLocales.has(firstSegment)) {
    return intlMiddleware(request)
  }

  if (firstSegment !== "") {
    const rest = pathname.slice(firstSegment.length + 1)
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${rest}`
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
