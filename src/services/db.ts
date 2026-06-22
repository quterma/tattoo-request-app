import { supabase } from "./supabase"
import type { UploadedFile } from "./storage"

export interface CreatedRequest {
  id: string
  referenceCode: string
}

interface CreateRequestParams {
  clientSubmissionId: string
  clientName: string | undefined
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
    p_client_submission_id: params.clientSubmissionId,
    p_client_name: params.clientName ?? null,
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
