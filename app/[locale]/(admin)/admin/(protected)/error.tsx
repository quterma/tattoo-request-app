"use client"

import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("admin")

  return (
    <Page>
      <Section>
        <h1 className="text-lg font-semibold text-foreground">{t("requestListErrorTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("requestListErrorMessage")}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t("requestListRetry")}
        </button>
      </Section>
    </Page>
  )
}
