export type {
  AdminRequestListItem,
  RequestStatus,
  AdminRequestContact,
  AdminRequestDetail,
  AdminRequestFile,
} from "@/services"

export type UpdateRequestStatusResult = { ok: true } | { ok: false; error: string }
