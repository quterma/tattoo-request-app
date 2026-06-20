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
    { name: "referenceImages", files: files.referenceImages },
    { name: "placementImages", files: files.placementImages },
  ] as const

  for (const { name, files: fieldFiles } of fields) {
    for (const file of fieldFiles) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        fieldErrors[name] = ["file_type_invalid"]
        break
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        fieldErrors[name] = ["file_too_large"]
        break
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors, formErrors: [] },
    }
  }

  return { ok: true }
}
