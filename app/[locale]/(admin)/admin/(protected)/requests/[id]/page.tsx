import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getAuthenticatedStudioMember } from "@/services/auth"
import { getAdminRequestDetail } from "@/services"
import { isUuid } from "@/shared/utils"
import { Page } from "@/shared/ui"
import { RequestDetail } from "@/features/admin/ui"
import { updateRequestStatusAction } from "./actions"

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
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

  if (!isUuid(id)) {
    notFound()
  }

  const request = await getAdminRequestDetail(result.studioId, id)

  if (!request) {
    notFound()
  }

  const boundUpdateStatusAction = updateRequestStatusAction.bind(null, locale, id)

  return (
    <Page>
      <RequestDetail
        request={request}
        locale={locale}
        t={t}
        updateStatusAction={boundUpdateStatusAction}
      />
    </Page>
  )
}
