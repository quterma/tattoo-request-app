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

interface CreateRequestParams {
  studioId: string
  clientSubmissionId: string
  clientName: string
  description: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  email: string | undefined
  phone: string | undefined
  contactOther: string | undefined
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
    p_email: params.email ?? null,
    p_phone: params.phone ?? null,
    p_contact_other: params.contactOther ?? null,
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
