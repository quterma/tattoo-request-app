export type { AdminRequestListItem, RequestStatus, AdminRequestDetail, AdminRequestFile } from "@/services"

export type UpdateRequestStatusResult = { ok: true } | { ok: false; error: string }
