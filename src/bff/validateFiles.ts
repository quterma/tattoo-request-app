import { VALIDATION_KEYS as K } from "@/features/request/validation"
import { API_ERROR_CODES, REQUEST_FIELDS } from "./request"
import type { ValidationErrorResult } from "./request"

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export type FileValidationResult =
  | { ok: true }
  | ValidationErrorResult

export function validateFiles(files: {
  referenceImages: File[]
  placementImages: File[]
}): FileValidationResult {
  const fieldErrors: Record<string, string[]> = {}

  const fields = [
    { name: REQUEST_FIELDS.referenceImages, files: files.referenceImages },
    { name: REQUEST_FIELDS.placementImages, files: files.placementImages },
  ] as const

  for (const { name, files: fieldFiles } of fields) {
    for (const file of fieldFiles) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        fieldErrors[name] = [K.FILE_TYPE_INVALID]
        break
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        fieldErrors[name] = [K.FILE_TOO_LARGE]
        break
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: { code: API_ERROR_CODES.VALIDATION_ERROR, fieldErrors, formErrors: [] },
    }
  }

  return { ok: true }
}
