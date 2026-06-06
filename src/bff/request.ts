export interface ParsedRequestPayload {
  ideaDescription: string
  placement: string
  size: string
  color: string
  budget: string | undefined
  email: string | undefined
  phone: string | undefined
  contactOther: string | undefined
  consent: "true"
  referenceImages: File[]
  placementImages: File[]
}

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
    consent: formData.get("consent") as "true",
    referenceImages: formData.getAll("referenceImages") as File[],
    placementImages: formData.getAll("placementImages") as File[],
  }
}
