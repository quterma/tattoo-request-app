import { NextResponse } from "next/server"
import {
  MAX_FILE_SIZE_BYTES,
  checkRateLimit,
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

// Best-effort per-IP throttle. Honest about what this is NOT: the limiter is in-memory and
// Vercel is multi-instance, so a distributed caller gets some multiple of this. It blunts a
// naive script; it does not bound a determined one. See PROJECT_DECISIONS.md — Stage 6
// Upload-Flow Architecture, §1 (abuse model) for the accepted residual risk.
const UPLOAD_RATE_LIMIT = 20
const UPLOAD_RATE_WINDOW_MS = 10 * 60 * 1000

// Bounds the objects one clientSubmissionId can accumulate (9 allowed + slack for retries
// that leave a timed-out-but-written object). NOTE: clientSubmissionId is caller-chosen, so
// an automated caller can simply mint a fresh UUID per upload and never approach this cap —
// it bounds an honest session, not a hostile one, and is NOT a defence against bucket-filling.
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

export async function POST(req: Request) {
  try {
    const rate = checkRateLimit(
      `upload:${clientIpFromHeaders(req.headers)}`,
      UPLOAD_RATE_LIMIT,
      UPLOAD_RATE_WINDOW_MS,
    )
    if (!rate.allowed) {
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

    // Hard cap per session — the real defence against bucket-filling replay.
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
