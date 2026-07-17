import { supabase } from "./supabase"
import type { UploadedFile } from "./storage"

export interface CreatedRequest {
  id: string
  referenceCode: string
}

export const REQUEST_STATUS_OPTIONS = [
  "new",
  "active",
  "booked",
  "completed",
  "rejected",
] as const

export type RequestStatus = (typeof REQUEST_STATUS_OPTIONS)[number]

function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUS_OPTIONS as readonly string[]).includes(value)
}

export interface AdminRequestListItem {
  id: string
  referenceCode: string
  clientName: string
  placement: string
  size: string
  color: string
  status: RequestStatus
  createdAt: string
}

interface RequestListRow {
  id: string
  reference_code: string
  client_name: string
  placement: string
  size: string
  color: string
  status: string
  created_at: string
}

function mapRequestListRow(row: RequestListRow): AdminRequestListItem {
  if (!isRequestStatus(row.status)) {
    throw new Error(`Unknown request status: ${row.status}`)
  }

  return {
    id: row.id,
    referenceCode: row.reference_code,
    clientName: row.client_name,
    placement: row.placement,
    size: row.size,
    color: row.color,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function listRequestsForStudio(studioId: string): Promise<AdminRequestListItem[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("id, reference_code, client_name, placement, size, color, status, created_at")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`DB list query failed: ${error.message}`)
  }

  return (data as RequestListRow[]).map(mapRequestListRow)
}

/** Internal — DB-owned file record. Never leaves src/services/ (storagePath is raw). */
interface RequestFileDbRecord {
  id: string
  storagePath: string
  originalName: string
  type: string
  mimeType: string
  size: number
}

/** Internal — DB-owned request detail shape. Never leaves src/services/. */
interface RequestDetailDbRecord {
  id: string
  referenceCode: string
  clientName: string
  description: string
  placement: string
  size: string
  color: string
  budget: string | null
  // The five contact columns; exactly one is non-null per request (FS §4.2 field 9).
  email: string | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  telegram: string | null
  consent: boolean
  status: RequestStatus
  createdAt: string
  files: RequestFileDbRecord[]
}

interface RequestFileRow {
  id: string
  storage_path: string
  original_name: string
  type: string
  mime_type: string
  size: number
}

interface RequestDetailRow {
  id: string
  reference_code: string
  client_name: string
  description: string
  placement: string
  size: string
  color: string
  budget: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  telegram: string | null
  consent: boolean
  status: string
  created_at: string
  request_files: RequestFileRow[]
}

function mapRequestDetailRow(row: RequestDetailRow): RequestDetailDbRecord {
  if (!isRequestStatus(row.status)) {
    throw new Error(`Unknown request status: ${row.status}`)
  }

  return {
    id: row.id,
    referenceCode: row.reference_code,
    clientName: row.client_name,
    description: row.description,
    placement: row.placement,
    size: row.size,
    color: row.color,
    budget: row.budget,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    telegram: row.telegram,
    consent: row.consent,
    status: row.status,
    createdAt: row.created_at,
    files: row.request_files.map((file) => ({
      id: file.id,
      storagePath: file.storage_path,
      originalName: file.original_name,
      type: file.type,
      mimeType: file.mime_type,
      size: file.size,
    })),
  }
}

/**
 * Returns request detail scoped to a studio, or null if the request does not exist
 * or belongs to a different studio — both cases are indistinguishable by design.
 * Internal DB record only; storagePath and other raw fields must not cross src/services/.
 */
export async function getRequestForStudio(
  studioId: string,
  requestId: string,
): Promise<RequestDetailDbRecord | null> {
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, reference_code, client_name, description, placement, size, color, budget, email, phone, whatsapp, instagram, telegram, consent, status, created_at, request_files(id, storage_path, original_name, type, mime_type, size)",
    )
    .eq("id", requestId)
    .eq("studio_id", studioId)
    .maybeSingle()

  if (error) {
    throw new Error(`DB detail query failed: ${error.message}`)
  }

  if (!data) return null

  return mapRequestDetailRow(data as RequestDetailRow)
}

/**
 * Updates a request's status, scoped to a studio in one query.
 * Returns false if 0 rows matched (missing request or cross-studio request —
 * both cases indistinguishable by design, matching getRequestForStudio).
 * Throws on Supabase infrastructure error.
 */
export async function updateRequestStatusForStudio(
  studioId: string,
  requestId: string,
  status: RequestStatus,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId)
    .eq("studio_id", studioId)
    .select("id")

  if (error) {
    throw new Error(`DB status update failed: ${error.message}`)
  }

  return (data as { id: string }[]).length > 0
}

export async function getRequestByClientSubmissionId(
  clientSubmissionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("requests")
    .select("reference_code")
    .eq("client_submission_id", clientSubmissionId)
    .maybeSingle()

  if (error) {
    throw new Error(`DB lookup failed: ${error.message}`)
  }

  return data ? (data as { reference_code: string }).reference_code : null
}

/** The five reply channels (FS §4.2 field 9). Mirrors the request feature's ContactMethod. */
export type ContactMethodName = "whatsapp" | "email" | "instagram" | "telegram" | "phone"

/**
 * Exactly one method with its normalized value — the five-column model's invariant expressed so
 * TypeScript cannot represent a zero- or multi-method request. The adapter below fans it out to
 * the five nullable RPC params; callers never assemble those by hand.
 */
export interface RequestContact {
  method: ContactMethodName
  /** Already normalized for persistence (E.164 / @-stripped) — see features/request/lib/contact.ts. */
  value: string
}

interface CreateRequestParams {
  studioId: string
  clientSubmissionId: string
  clientName: string
  description: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  contact: RequestContact
  consent: true
  files: UploadedFile[]
}

export async function createRequest(params: CreateRequestParams): Promise<CreatedRequest> {
  const { data, error } = await supabase.rpc("create_request", {
    p_studio_id: params.studioId,
    p_client_submission_id: params.clientSubmissionId,
    p_client_name: params.clientName,
    p_description: params.description,
    p_placement: params.placement,
    p_size: params.size,
    p_color: params.color,
    p_budget: params.budget ?? null,
    // Fan the one chosen method out to the five nullable columns: exactly one is non-null, which
    // the DB CHECK also enforces. Doing it here (not in callers) is what keeps the invariant.
    p_email: params.contact.method === "email" ? params.contact.value : null,
    p_phone: params.contact.method === "phone" ? params.contact.value : null,
    p_whatsapp: params.contact.method === "whatsapp" ? params.contact.value : null,
    p_instagram: params.contact.method === "instagram" ? params.contact.value : null,
    p_telegram: params.contact.method === "telegram" ? params.contact.value : null,
    p_consent: params.consent,
    p_files: params.files.map((f) => ({
      type: f.type,
      storagePath: f.storagePath,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: f.size,
    })),
  })

  if (error) {
    throw new Error(`DB insert failed: ${error.message}`)
  }

  return {
    id: (data as { id: string; referenceCode: string }).id,
    referenceCode: (data as { id: string; referenceCode: string }).referenceCode,
  }
}
