import { requestFormSchema } from "@/features/request/validation"

export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

export const REQUEST_FIELDS = {
  ideaDescription: "ideaDescription",
  placement: "placement",
  size: "size",
  color: "color",
  budget: "budget",
  email: "email",
  phone: "phone",
  contactOther: "contactOther",
  consent: "consent",
  referenceImages: "referenceImages",
  placementImages: "placementImages",
} as const

export type RequestField = (typeof REQUEST_FIELDS)[keyof typeof REQUEST_FIELDS]

export interface ParsedRequestPayload {
  ideaDescription: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  email: string | undefined
  phone: string | undefined
  contactOther: string | undefined
  consent: true | undefined
  referenceImages: File[]
  placementImages: File[]
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

export function parseRequestFormData(formData: FormData): ParsedRequestPayload {
  const f = REQUEST_FIELDS
  return {
    ideaDescription: formData.get(f.ideaDescription) as string,
    placement: formData.get(f.placement) as string,
    size: formData.get(f.size) as string,
    color: formData.get(f.color) as string,
    budget: (formData.get(f.budget) as string | null) ?? undefined,
    email: (formData.get(f.email) as string | null) ?? undefined,
    phone: (formData.get(f.phone) as string | null) ?? undefined,
    contactOther: (formData.get(f.contactOther) as string | null) ?? undefined,
    consent: formData.get(f.consent) === "true" ? true : undefined,
    referenceImages: formData.getAll(f.referenceImages) as File[],
    placementImages: formData.getAll(f.placementImages) as File[],
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
