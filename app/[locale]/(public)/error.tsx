"use client"

import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"
import { Link } from "@/shared/i18n"

export default function PublicError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  unstable_retry: () => void
}) {
  const t = useTranslations("error")

  return (
    <Page>
      <Section>
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("body")}</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={unstable_retry}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
          >
            {t("backHome")}
          </Link>
        </div>
      </Section>
    </Page>
  )
}
