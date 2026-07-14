import {
  isUploadHandleExpired,
  readUploadHandle,
  storagePrefixForSubmission,
} from "@/services"
import type { UploadedFile } from "@/services"
import { MAX_FILES_PER_FIELD, MAX_FILES_TOTAL } from "@/features/request/config"
import { VALIDATION_KEYS as K } from "@/features/request/validation"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/shared/api"
import type { ValidationErrorResult } from "./request"

export type AdoptUploadsResult =
  | { ok: true; files: UploadedFile[] }
  | ValidationErrorResult

function handleError(key: string): ValidationErrorResult {
  return {
    ok: false,
    error: {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      fieldErrors: { [REQUEST_FIELDS.uploadHandles]: [key] },
      formErrors: [],
    },
  }
}

/**
 * Verifies and adopts exactly the files uploaded during THIS submission's session.
 *
 * The security contract (task acceptance criterion): the final request persists only
 * files that were uploaded under the same clientSubmissionId. Each handle is an
 * encrypted, server-minted token — unforgeable — and carries the clientSubmissionId
 * it was minted for. That embedded id, checked against the id being submitted, is the
 * ownership check: a file uploaded under a different session yields a handle the
 * submitting session never possesses, so it can never be adopted. Adoption is by
 * token, never by listing a storage prefix.
 *
 * A bad handle rejects the WHOLE submit (400) rather than being silently dropped: a
 * server-minted handle can only fail these checks if it was tampered with, replayed
 * across sessions, or expired, and silently dropping would make images the visitor
 * believed were attached vanish. This is not the FS §4.5 "per-file upload failure
 * never blocks submission" case — that concerns upload failures; a legitimate client
 * never sends a bad handle.
 */
export function adoptUploadHandles(
  handles: string[],
  clientSubmissionId: string,
  studioId: string,
): AdoptUploadsResult {
  if (handles.length === 0) return { ok: true, files: [] }

  if (handles.length > MAX_FILES_TOTAL) {
    return handleError(K.UPLOAD_TOO_MANY)
  }

  const expectedPrefix = `${storagePrefixForSubmission(studioId, clientSubmissionId)}/`
  const byPath = new Map<string, UploadedFile>()
  const perCategory = new Map<string, number>()

  for (const handle of handles) {
    const payload = readUploadHandle(handle)

    // Unforgeable check: tampered, truncated, garbage, or wrong-key handles.
    if (!payload) return handleError(K.UPLOAD_INVALID)

    // Ownership check: the handle must have been minted for THIS session.
    if (payload.csid !== clientSubmissionId) return handleError(K.UPLOAD_INVALID)

    if (isUploadHandleExpired(payload)) return handleError(K.UPLOAD_EXPIRED)

    // Defence in depth: the server chose this path at upload time; it must sit under
    // the studio+session prefix. (Redundant given the csid check, but cheap.)
    if (!payload.path.startsWith(expectedPrefix)) return handleError(K.UPLOAD_INVALID)

    // Duplicate handle → same object; adopt once, not twice.
    if (byPath.has(payload.path)) continue

    const nextCount = (perCategory.get(payload.cat) ?? 0) + 1
    if (nextCount > MAX_FILES_PER_FIELD) return handleError(K.UPLOAD_TOO_MANY)
    perCategory.set(payload.cat, nextCount)

    byPath.set(payload.path, {
      storagePath: payload.path,
      originalName: payload.originalName,
      mimeType: payload.mimeType,
      size: payload.size,
      type: payload.cat,
    })
  }

  const files = [...byPath.values()]
  if (files.length > MAX_FILES_TOTAL) return handleError(K.UPLOAD_TOO_MANY)

  return { ok: true, files }
}
