import { NextResponse } from "next/server"
import {
  MAX_FILE_SIZE_BYTES,
  checkRateLimit,
  checkUploadQuota,
  clientIpFromHeaders,
  validateSingleFile,
} from "@/bff"
import {
  countObjectsForSubmission,
  mintUploadHandle,
  uploadRequestFile,
} from "@/services"
import type { FileType } from "@/services"
import { API_ERROR_CODES, UPLOAD_FIELDS } from "@/shared/api"
import { config } from "@/config"

// Selection-time single-file upload. Public and unauthenticated: a file is stored
// before the request row exists, and the caller gets back an opaque encrypted handle
// (never a storage path). Final adoption at POST /api/request verifies the handle was
// minted for the same session (see bff/adoptUploads.ts).

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Best-effort in-memory burst shield, NOT the security boundary. The limiter is in-memory
// and Vercel is multi-instance, so a distributed caller gets some multiple of this — it
// blunts a naive burst in front of the durable quota, nothing more. The cross-instance,
// non-caller-resettable bound is checkUploadQuota (bff/uploadQuota.ts); this runs after it.
const UPLOAD_RATE_LIMIT = 20
const UPLOAD_RATE_WINDOW_MS = 10 * 60 * 1000

// Bounds the objects one clientSubmissionId can accumulate (9 allowed + slack for retries
// that leave a timed-out-but-written object). NOTE: clientSubmissionId is caller-chosen, so
// an automated caller can mint a fresh UUID per upload and never approach this cap — it bounds
// an honest session, not a hostile one. The durable per-IP quota (checkUploadQuota) is what
// bounds a hostile caller across instances; this cap is not that defence.
const MAX_OBJECTS_PER_SUBMISSION = 12

// Reject an oversized body before buffering it. Kept under Vercel's 4.5 MB platform limit:
// a larger body is rejected at the edge before this handler runs, so accepting one here
// would be a lie. Slack over MAX_FILE_SIZE_BYTES covers multipart framing only.
const MAX_BODY_BYTES = MAX_FILE_SIZE_BYTES + 256 * 1024

function validationError(field: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: { code: API_ERROR_CODES.VALIDATION_ERROR, fieldErrors: {}, formErrors: [field] },
    },
    { status: 400 },
  )
}

function serverError(): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
    { status: 500 },
  )
}

// Fail-closed response when the durable quota store is unreachable: a retryable 503 with
// NO storage write. The image is marked failed on the client (retryable — see lib/upload.ts
// keyForStatus), the text request still submits (FS §4.5). We do NOT fall back to the
// in-memory limiter here — that would reopen the cross-instance hole this control closes.
function serviceUnavailable(): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
    { status: 503 },
  )
}

export async function POST(req: Request) {
  try {
    // Durable per-IP quota FIRST — before formData(), before the in-memory shield. This is the
    // cross-instance, non-caller-resettable bound (bff/uploadQuota.ts). Structured console.warn
    // on every 429/503 so an upload spike is visible in Vercel logs (the active dashboard
    // Firewall/Log alert is owner-debt). The warn contract is category + source + reason; never
    // the storage path or handle. category is a fixed literal (the body is not read here).
    const sourceKey = clientIpFromHeaders(req.headers)
    const quota = await checkUploadQuota(sourceKey)
    if (quota.kind === "quota") {
      console.warn(`[upload] quota exceeded: category=upload source=${sourceKey} reason=quota`)
      return NextResponse.json(
        { ok: false, error: { code: API_ERROR_CODES.RATE_LIMITED } },
        { status: 429, headers: { "Retry-After": String(quota.retryAfterSeconds) } },
      )
    }
    if (quota.kind === "unavailable") {
      console.warn(`[upload] quota store unavailable: category=upload source=${sourceKey} reason=unavailable`)
      return serviceUnavailable()
    }

    // In-memory burst shield — best-effort only, runs after the durable quota admitted.
    const rate = checkRateLimit(
      `upload:${sourceKey}`,
      UPLOAD_RATE_LIMIT,
      UPLOAD_RATE_WINDOW_MS,
    )
    if (!rate.allowed) {
      console.warn(`[upload] burst-shield limited: category=upload source=${sourceKey} reason=burst`)
      return NextResponse.json(
        { ok: false, error: { code: API_ERROR_CODES.RATE_LIMITED } },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    const contentLength = Number(req.headers.get("content-length") ?? "0")
    if (contentLength > MAX_BODY_BYTES) {
      return validationError(UPLOAD_FIELDS.file)
    }

    const formData = await req.formData()

    const clientSubmissionId = formData.get(UPLOAD_FIELDS.clientSubmissionId)
    const category = formData.get(UPLOAD_FIELDS.category)
    const file = formData.get(UPLOAD_FIELDS.file)

    if (typeof clientSubmissionId !== "string" || !UUID_V4.test(clientSubmissionId)) {
      return validationError(UPLOAD_FIELDS.clientSubmissionId)
    }
    if (typeof category !== "string") {
      return validationError(UPLOAD_FIELDS.category)
    }
    if (!(file instanceof File)) {
      return validationError(UPLOAD_FIELDS.file)
    }

    const fileValidation = await validateSingleFile(file, category)
    if (!fileValidation.ok) {
      return NextResponse.json(fileValidation, { status: 400 })
    }

    const studioId = config.app.deploymentStudioId

    // Hard cap per HONEST session (clientSubmissionId is caller-chosen, so a bot mints a fresh
    // one and never approaches this — the durable per-IP quota above is what bounds a hostile
    // caller; this only bounds an honest session's accidental replay/retry accumulation).
    const existingCount = await countObjectsForSubmission(studioId, clientSubmissionId)
    if (existingCount >= MAX_OBJECTS_PER_SUBMISSION) {
      return validationError(UPLOAD_FIELDS.file)
    }

    const uploaded = await uploadRequestFile(
      file,
      category as FileType,
      studioId,
      clientSubmissionId,
    )

    const handle = mintUploadHandle({
      csid: clientSubmissionId,
      cat: uploaded.type,
      path: uploaded.storagePath,
      originalName: uploaded.originalName,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      iat: Math.floor(Date.now() / 1000),
    })

    // Never log the storage path or the handle.
    return NextResponse.json({ ok: true, handle })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[upload] unexpected failure:", message)
    return serverError()
  }
}
