import { getRequestForStudio } from "./db"
import type { RequestStatus } from "./db"
import { createSignedRequestFileUrl } from "./storage"

export type AdminRequestFileFailureReason = "not_found" | "permission_denied" | "unknown"

export type AdminRequestFile =
  | { status: "available"; id: string; originalName: string; type: string; signedUrl: string }
  | { status: "unavailable"; id: string; originalName: string; type: string }

export interface AdminRequestDetail {
  id: string
  referenceCode: string
  clientName: string
  description: string
  placement: string
  size: string
  color: string
  budget: string | null
  email: string | null
  phone: string | null
  contactOther: string | null
  consent: boolean
  status: RequestStatus
  createdAt: string
  files: AdminRequestFile[]
}

function classifySigningFailure(message: string): AdminRequestFileFailureReason {
  const lower = message.toLowerCase()
  if (lower.includes("not found") || lower.includes("does not exist")) return "not_found"
  if (lower.includes("permission") || lower.includes("denied") || lower.includes("unauthorized")) {
    return "permission_denied"
  }
  return "unknown"
}

async function signFile(file: {
  id: string
  storagePath: string
  originalName: string
  type: string
}): Promise<AdminRequestFile> {
  try {
    const signedUrl = await createSignedRequestFileUrl(file.storagePath)
    return { status: "available", id: file.id, originalName: file.originalName, type: file.type, signedUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const reason = classifySigningFailure(message)
    console.warn("[requests] file signing failed", { fileId: file.id, reason })
    return { status: "unavailable", id: file.id, originalName: file.originalName, type: file.type }
  }
}

/**
 * Composes DB detail + signed Storage URLs into the final admin-safe DTO.
 * Returns null if the request does not exist or belongs to a different studio
 * (both cases are indistinguishable — see getRequestForStudio).
 * Raw storagePath never leaves this module; a per-file signing failure only
 * marks that file unavailable, it does not fail the whole detail result.
 */
export async function getAdminRequestDetail(
  studioId: string,
  requestId: string,
): Promise<AdminRequestDetail | null> {
  const detail = await getRequestForStudio(studioId, requestId)

  if (!detail) return null

  const files = await Promise.all(detail.files.map(signFile))

  return {
    id: detail.id,
    referenceCode: detail.referenceCode,
    clientName: detail.clientName,
    description: detail.description,
    placement: detail.placement,
    size: detail.size,
    color: detail.color,
    budget: detail.budget,
    email: detail.email,
    phone: detail.phone,
    contactOther: detail.contactOther,
    consent: detail.consent,
    status: detail.status,
    createdAt: detail.createdAt,
    files,
  }
}
