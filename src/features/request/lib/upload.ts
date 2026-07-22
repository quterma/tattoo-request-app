import { UPLOAD_FIELDS } from "@/shared/api"
import type { UploadCategory } from "../config"
import { VALIDATION_KEYS as K } from "../validation"

/**
 * Uploads one file to POST /api/upload via XMLHttpRequest.
 *
 * XHR, not fetch: fetch() has no upload-progress event, and FS §4.3 requires per-file
 * progress. XHR also gives abort() for the remove-while-uploading case. Returns the
 * opaque handle on success; rejects with a UploadError carrying an i18n key otherwise.
 */

export class UploadError extends Error {
  readonly errorKey: string
  /** Transport/429/5xx failures are worth a retry; 4xx validation failures are not. */
  readonly retryable: boolean

  constructor(errorKey: string, retryable: boolean) {
    super(errorKey)
    this.name = "UploadError"
    this.errorKey = errorKey
    this.retryable = retryable
  }
}

interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

function keyForStatus(status: number): { errorKey: string; retryable: boolean } {
  // 429 is the durable per-IP quota (a 24h window). Still retryable — the slot's Retry can
  // re-upload later and the text request submits regardless — but its message must NOT promise
  // an immediate retry will succeed, unlike the transient 5xx/network case (UPLOAD_INVALID).
  if (status === 429) return { errorKey: K.UPLOAD_RATE_LIMITED, retryable: true }
  if (status >= 500) return { errorKey: K.UPLOAD_INVALID, retryable: true }
  if (status === 400) return { errorKey: K.UPLOAD_TYPE_INVALID, retryable: false }
  return { errorKey: K.UPLOAD_INVALID, retryable: true }
}

export function xhrUpload(
  file: File,
  clientSubmissionId: string,
  category: UploadCategory,
  { onProgress, signal }: UploadOptions = {},
): Promise<{ handle: string }> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    const xhr = new XMLHttpRequest()
    const body = new FormData()
    body.append(UPLOAD_FIELDS.clientSubmissionId, clientSubmissionId)
    body.append(UPLOAD_FIELDS.category, category)
    body.append(UPLOAD_FIELDS.file, file)

    const onAbort = () => xhr.abort()
    signal?.addEventListener("abort", onAbort)

    const cleanup = () => signal?.removeEventListener("abort", onAbort)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      cleanup()
      let parsed: { ok?: boolean; handle?: string } | null = null
      try {
        parsed = JSON.parse(xhr.responseText)
      } catch {
        parsed = null
      }

      if (xhr.status === 200 && parsed?.ok === true && typeof parsed.handle === "string") {
        resolve({ handle: parsed.handle })
        return
      }

      const { errorKey, retryable } = keyForStatus(xhr.status)
      reject(new UploadError(errorKey, retryable))
    })

    xhr.addEventListener("error", () => {
      cleanup()
      reject(new UploadError(K.UPLOAD_INVALID, true))
    })

    xhr.addEventListener("abort", () => {
      cleanup()
      reject(new DOMException("Aborted", "AbortError"))
    })

    xhr.open("POST", "/api/upload")
    xhr.send(body)
  })
}
