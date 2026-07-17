export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  UPLOAD_EXPIRED: "UPLOAD_EXPIRED",
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
  contactMethod: "contactMethod",
  contactValue: "contactValue",
  eligibility: "eligibility",
  uploadHandles: "uploadHandles",
} as const

export type RequestField = (typeof REQUEST_FIELDS)[keyof typeof REQUEST_FIELDS]

/** Fields for the selection-time single-file upload endpoint (POST /api/upload). */
export const UPLOAD_FIELDS = {
  clientSubmissionId: "clientSubmissionId",
  category: "category",
  file: "file",
} as const

export type UploadField = (typeof UPLOAD_FIELDS)[keyof typeof UPLOAD_FIELDS]
