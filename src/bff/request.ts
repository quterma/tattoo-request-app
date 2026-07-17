import { requestFormSchema } from "@/features/request/validation"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/shared/api"

export interface ParsedRequestPayload {
  clientSubmissionId: string
  clientName: string
  ideaDescription: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  contactMethod: string
  contactValue: string
  eligibility: true | undefined
  uploadHandles: string[]
}

export interface ValidationErrorResult {
  ok: false
  error: {
    code: typeof API_ERROR_CODES.VALIDATION_ERROR
    fieldErrors: Record<string, string[]>
    formErrors: string[]
  }
}

export interface ValidationSuccessResult {
  ok: true
  data: ReturnType<typeof requestFormSchema.parse>
}

export type ValidationResult = ValidationSuccessResult | ValidationErrorResult

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ClientSubmissionIdErrorReason = "missing" | "invalid"

const CLIENT_SUBMISSION_ID_ERROR_MESSAGES: Record<ClientSubmissionIdErrorReason, string> = {
  missing: "clientSubmissionId is missing",
  invalid: "clientSubmissionId is not a valid UUID v4",
} as const

export class ClientSubmissionIdError extends Error {
  readonly reason: ClientSubmissionIdErrorReason

  constructor(reason: ClientSubmissionIdErrorReason) {
    super(CLIENT_SUBMISSION_ID_ERROR_MESSAGES[reason])
    this.name = "ClientSubmissionIdError"
    this.reason = reason
  }
}

export function parseRequestFormData(formData: FormData): ParsedRequestPayload {
  const f = REQUEST_FIELDS

  const clientSubmissionId = (formData.get(f.clientSubmissionId) as string | null) ?? ""
  if (!clientSubmissionId) throw new ClientSubmissionIdError("missing")
  if (!UUID_REGEX.test(clientSubmissionId)) throw new ClientSubmissionIdError("invalid")

  return {
    clientSubmissionId,
    clientName: (formData.get(f.clientName) as string | null) ?? "",
    ideaDescription: formData.get(f.ideaDescription) as string,
    placement: formData.get(f.placement) as string,
    size: formData.get(f.size) as string,
    color: formData.get(f.color) as string,
    budget: (formData.get(f.budget) as string | null) ?? undefined,
    contactMethod: (formData.get(f.contactMethod) as string | null) ?? "",
    contactValue: (formData.get(f.contactValue) as string | null) ?? "",
    eligibility: formData.get(f.eligibility) === "true" ? true : undefined,
    uploadHandles: formData.getAll(f.uploadHandles).filter((v): v is string => typeof v === "string"),
  }
}

export function validateRequestPayload(payload: ParsedRequestPayload): ValidationResult {
  const result = requestFormSchema.safeParse(payload)

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten()
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: fieldErrors as Record<string, string[]>,
        formErrors,
      },
    }
  }

  return { ok: true, data: result.data }
}
