// BFF (Backend-for-Frontend): Next.js Route Handlers orchestration layer
export { ClientSubmissionIdError, parseRequestFormData, validateRequestPayload } from "./request"
export type {
  ParsedRequestPayload,
  ValidationResult,
  ValidationErrorResult,
  ValidationSuccessResult,
} from "./request"
export { validateFiles } from "./validateFiles"
export type { FileValidationResult } from "./validateFiles"
