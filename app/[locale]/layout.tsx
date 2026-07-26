import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { studio } from "@/config"
import { routing } from "@/shared/i18n"
import "../globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

// `metadataBase` makes OG/asset paths (incl. the static opengraph-image — __asset_TODO,
// AI-generated, see TASK_16) absolute so social crawlers can fetch them. On Vercel we read the
// injected system variable
// VERCEL_PROJECT_PRODUCTION_URL (stable production domain, identical across preview + production
// deployments — Vercel documents this exact var for OG-image URLs); it is Vercel-provided, not a
// user-declared env var, so no new env config is added. Locally it falls back to localhost.
// INTERIM __meta_TODO: the real branded custom domain is the pre-deploy swap
// (PROJECT_PRODUCTION_READINESS.md — Pre-Deploy Content Swaps).
//
// NOTE: VERCEL_PROJECT_PRODUCTION_URL is only populated when the Vercel project's "Enable access to
// System Environment Variables" checkbox is ON (a dashboard setting). If it is OFF the fallback
// origin below is used and OG/asset URLs are unreachable — there is no in-code signal that reliably
// distinguishes that state at runtime (VERCEL, VERCEL_ENV, etc. sit behind the same toggle), so this
// is verified out-of-band as a pre-deploy obligation, task STAGE_6_TASK_12 CO-5, not guarded here.
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "app" })

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: studio.name,
      type: "website",
      locale: "en_US",
    },
    // INTERIM __meta_TODO: noindex until public launch. The app IS deployed for controlled
    // verification (PROJECT_DECISIONS.md §C — deployed, not publicly launched), but Home
    // (Item 5) content is still placeholder, so it must not be indexed yet. Flip to index:true
    // at public launch — see PROJECT_DECISIONS.md / PROJECT_PRODUCTION_READINESS.md.
    robots: { index: false, follow: false },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geist.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
