import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getAuthenticatedStudioMember } from "@/services/auth"
import { listRequestsForStudio } from "@/services"
import { Page, Section } from "@/shared/ui"
import { RequestList } from "@/features/admin/ui"

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()
  const t = await getTranslations({ locale, namespace: "admin" })

  const result = await getAuthenticatedStudioMember({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  if (!result.ok && result.reason === "unauthenticated") {
    redirect(`/${locale}/admin/login`)
  }

  if (!result.ok) {
    return null
  }

  const requests = await listRequestsForStudio(result.studioId)

  return (
    <Page>
      <Section>
        <h1 className="text-xl font-semibold text-foreground">{t("requestListTitle")}</h1>
        <div className="mt-6">
          <RequestList requests={requests} locale={locale} t={t} />
        </div>
      </Section>
    </Page>
  )
}
