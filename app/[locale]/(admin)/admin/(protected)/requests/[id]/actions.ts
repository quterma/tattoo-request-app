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
    console.warn("[admin] status update rejected", { operation: "update_request_status", requestId, reason: "invalid_status" })
    return { ok: false, error: t("requestStatusUpdateFailed") }
  }

  let updated: boolean
  try {
    updated = await updateRequestStatusForStudio(result.studioId, requestId, status)
  } catch {
    console.error("[admin] status update failed", { operation: "update_request_status", requestId, reason: "unknown" })
    return { ok: false, error: t("requestStatusUpdateFailed") }
  }

  if (!updated) {
    console.warn("[admin] status update rejected", { operation: "update_request_status", requestId, reason: "not_found" })
    return { ok: false, error: t("requestStatusUpdateNotFound") }
  }

  revalidatePath(`/${locale}/admin/requests/${requestId}`)
  revalidatePath(`/${locale}/admin/requests`)

  return { ok: true }
}
