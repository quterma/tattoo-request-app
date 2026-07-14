import { VALIDATION_KEYS as K } from "@/features/request/validation"
import { API_ERROR_CODES, UPLOAD_FIELDS } from "@/shared/api"
import { MAX_FILE_SIZE_BYTES, UPLOAD_CATEGORIES } from "@/features/request/config"
import type { ValidationErrorResult } from "./request"

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

// The per-file ceiling is defined once in the shared feature config (both the client and this
// server-side validator enforce it — see the comment there); re-exported for the BFF's consumers.
export { MAX_FILE_SIZE_BYTES }

export type FileValidationResult = { ok: true } | ValidationErrorResult

function fieldError(field: string, key: string): ValidationErrorResult {
  return {
    ok: false,
    error: {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: { [field]: [key] },
      formErrors: [],
    },
  }
}

const ascii = (head: Uint8Array, start: number, text: string): boolean =>
  [...text].every((ch, i) => head[start + i] === ch.charCodeAt(0))

function isJpeg(head: Uint8Array): boolean {
  return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
}

function isPng(head: Uint8Array): boolean {
  return (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  )
}

function isWebp(head: Uint8Array): boolean {
  return ascii(head, 0, "RIFF") && ascii(head, 8, "WEBP")
}

function isHeicOrHeif(head: Uint8Array): boolean {
  if (!ascii(head, 4, "ftyp")) return false
  const brand = String.fromCharCode(head[8], head[9], head[10], head[11])
  return ["heic", "heix", "mif1", "heif", "hevc", "msf1"].includes(brand)
}

/**
 * Magic-byte sniff of the first bytes of a file, checked against the file's OWN
 * declared Content-Type — not "is this any allowed format". The declared type is
 * attacker-controlled on a public endpoint, so the MIME allowlist alone would let a
 * .js/.svg/zip through by lying about its type; checking against "any allowed format"
 * would still let a PNG through mislabeled as image/jpeg (harmless for storage, but
 * defeats the point of tying the check to the claim). Confirms the bytes are actually
 * the specific format the caller claimed.
 */
function matchesDeclaredMimeType(head: Uint8Array, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return isJpeg(head)
    case "image/png":
      return isPng(head)
    case "image/webp":
      return isWebp(head)
    case "image/heic":
    case "image/heif":
      return isHeicOrHeif(head)
    default:
      return false
  }
}

/**
 * Reads a File's bytes across runtimes with inconsistent File support: the Node/Next
 * runtime implements File.arrayBuffer() directly, but jsdom's File (used under
 * vitest) implements neither arrayBuffer() nor stream() — only FileReader, which both
 * environments support. Response(file).arrayBuffer() was tried and rejected: under
 * vitest it resolves to text-decoded (UTF-8 mangled) bytes, not the raw bytes.
 */
async function readHead(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Validates one file for the selection-time upload endpoint: category, MIME
 * allowlist, size ceiling, and magic bytes. Public unauthenticated input, so every
 * check is enforced server-side regardless of what the client claims.
 */
export async function validateSingleFile(
  file: File,
  category: string,
): Promise<FileValidationResult> {
  if (!(UPLOAD_CATEGORIES as readonly string[]).includes(category)) {
    return fieldError(UPLOAD_FIELDS.category, K.UPLOAD_TYPE_INVALID)
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return fieldError(UPLOAD_FIELDS.file, K.UPLOAD_TYPE_INVALID)
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return fieldError(UPLOAD_FIELDS.file, K.UPLOAD_TOO_LARGE)
  }

  if (file.size === 0) {
    return fieldError(UPLOAD_FIELDS.file, K.UPLOAD_TYPE_INVALID)
  }

  const head = new Uint8Array(await readHead(file)).subarray(0, 12)
  if (!matchesDeclaredMimeType(head, file.type)) {
    return fieldError(UPLOAD_FIELDS.file, K.UPLOAD_TYPE_INVALID)
  }

  return { ok: true }
}
