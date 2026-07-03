import { getTranslations, getLocale } from "next-intl/server"
import { Page } from "@/shared/ui"
import { Link } from "@/shared/i18n"

export default async function AdminRequestNotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: "admin" })

  return (
    <Page>
      <h1 className="text-lg font-semibold text-foreground">{t("requestNotFoundTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("requestNotFoundMessage")}</p>
      <Link
        href="/admin"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
      >
        {t("backToRequests")}
      </Link>
    </Page>
  )
}
