import { defaultLocale, locales } from "./config"

const supportedLocales = new Set<string>(locales)

export function hasSupportedLocalePrefix(pathname: string): boolean {
  const firstSegment = pathname.split("/")[1] ?? ""
  return supportedLocales.has(firstSegment)
}

export function withDefaultLocalePrefix(pathname: string): string {
  return `/${defaultLocale}${pathname}`
}
