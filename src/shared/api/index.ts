export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

export const REQUEST_FIELDS = {
  clientSubmissionId: "clientSubmissionId",
  clientName: "clientName",
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
