"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { getAuthenticatedStudioMember } from "@/services/auth"
import { REQUEST_STATUS_OPTIONS, updateRequestStatusForStudio } from "@/services"
import type { RequestStatus, UpdateRequestStatusResult } from "@/features/admin/types"

function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUS_OPTIONS as readonly string[]).includes(value)
}

export async function updateRequestStatusAction(
  locale: string,
  requestId: string,
  _prev: UpdateRequestStatusResult | null,
  formData: FormData,
): Promise<UpdateRequestStatusResult> {
  const t = await getTranslations({ locale, namespace: "admin" })
  const cookieStore = await cookies()

  const result = await getAuthenticatedStudioMember({
    getAll: () => cookieStore.getAll(),
    setAll: () => {},
  })

  if (!result.ok) {
    return { ok: false, error: t("requestStatusUpdateFailed") }
  }

  const status = formData.get("status")

  if (typeof status !== "string" || !isRequestStatus(status)) {
    return { ok: false, error: t("requestStatusUpdateFailed") }
  }

  const updated = await updateRequestStatusForStudio(result.studioId, requestId, status)

  if (!updated) {
    return { ok: false, error: t("requestStatusUpdateNotFound") }
  }

  revalidatePath(`/${locale}/admin/requests/${requestId}`)
  revalidatePath(`/${locale}/admin/requests`)

  return { ok: true }
}
