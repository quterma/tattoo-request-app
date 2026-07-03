"use client"

import { useTranslations } from "next-intl"
import { Page } from "@/shared/ui"
import { Link } from "@/shared/i18n"

export default function AdminRequestDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("admin")

  return (
    <Page>
      <h1 className="text-lg font-semibold text-foreground">{t("requestDetailErrorTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("requestDetailErrorMessage")}</p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t("requestDetailRetry")}
        </button>
        <Link
          href="/admin/requests"
          className="inline-flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
        >
          {t("backToRequests")}
        </Link>
      </div>
    </Page>
  )
}
