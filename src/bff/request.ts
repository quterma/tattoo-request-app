import { requestFormSchema } from "@/features/request/validation"

export interface ParsedRequestPayload {
  ideaDescription: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  email: string | undefined
  phone: string | undefined
  contactOther: string | undefined
  consent: true
  referenceImages: File[]
  placementImages: File[]
}

export interface ValidationErrorResult {
  ok: false
  error: {
    code: "VALIDATION_ERROR"
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
  return {
    ideaDescription: formData.get("ideaDescription") as string,
    placement: formData.get("placement") as string,
    size: formData.get("size") as string,
    color: formData.get("color") as string,
    budget: (formData.get("budget") as string | null) ?? undefined,
    email: (formData.get("email") as string | null) ?? undefined,
    phone: (formData.get("phone") as string | null) ?? undefined,
    contactOther: (formData.get("contactOther") as string | null) ?? undefined,
    consent: formData.get("consent") === "true" ? true : (undefined as unknown as true),
    referenceImages: formData.getAll("referenceImages") as File[],
    placementImages: formData.getAll("placementImages") as File[],
  }
}

export function validateRequestPayload(payload: ParsedRequestPayload): ValidationResult {
  const result = requestFormSchema.safeParse(payload)

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten()
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: fieldErrors as Record<string, string[]>,
        formErrors,
      },
    }
  }

  return { ok: true, data: result.data }
}
