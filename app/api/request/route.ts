import { NextResponse } from "next/server"
import {
  ClientSubmissionIdError,
  adoptUploadHandles,
  checkRateLimit,
  clientIpFromHeaders,
  parseRequestFormData,
  validateRequestPayload,
} from "@/bff"
import { API_ERROR_CODES } from "@/shared/api"
import { createRequest, getRequestByClientSubmissionId } from "@/services"
import { config } from "@/config"

function resolveStudioId(): string {
  return config.app.deploymentStudioId
}

// Postgres unique violation error code
const PG_UNIQUE_VIOLATION = "23505"

// Best-effort per-IP throttle. The real ceilings are the per-session object cap and
// per-file limits on /api/upload; this only blunts naive submit floods.
const SUBMIT_RATE_LIMIT = 5
const SUBMIT_RATE_WINDOW_MS = 10 * 60 * 1000

export async function POST(req: Request) {
  try {
    const rate = checkRateLimit(
      `request:${clientIpFromHeaders(req.headers)}`,
      SUBMIT_RATE_LIMIT,
      SUBMIT_RATE_WINDOW_MS,
    )
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: { code: API_ERROR_CODES.RATE_LIMITED } },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      )
    }

    const formData = await req.formData()
    const payload = parseRequestFormData(formData)

    const validation = validateRequestPayload(payload)
    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 })
    }
    const data = validation.data

    const studioId = resolveStudioId()

    // Idempotency check FIRST — before adopting handles.
    //
    // Ordering matters: an already-persisted request has its request_files rows written,
    // so a replay persists nothing new and does not need adoption to protect the ownership
    // property. Adopting first would make a legitimate replay fail whenever its handles have
    // since expired (TTL) — e.g. a submit that succeeded but whose response was lost, retried
    // hours later — returning 400 instead of the existing reference code and breaking the
    // idempotency guarantee this route exists to provide.
    const existingReferenceCode = await getRequestByClientSubmissionId(payload.clientSubmissionId)
    if (existingReferenceCode !== null) {
      console.log(`[route] idempotent replay: ${existingReferenceCode}`)
      return NextResponse.json({ ok: true, referenceCode: existingReferenceCode })
    }

    // Adopt exactly the files uploaded under this clientSubmissionId's session. A
    // tampered, expired, or cross-session handle rejects the whole submit (see
    // adoptUploadHandles) — a legitimate client never sends one.
    const adoption = adoptUploadHandles(payload.uploadHandles, payload.clientSubmissionId, studioId)
    if (!adoption.ok) {
      return NextResponse.json(adoption, { status: 400 })
    }

    let referenceCode: string
    try {
      const result = await createRequest({
        studioId,
        clientSubmissionId: payload.clientSubmissionId,
        clientName: data.clientName,
        description: data.ideaDescription,
        placement: data.placement,
        size: data.size,
        color: data.color,
        budget: data.budget,
        email: data.email,
        phone: data.phone,
        contactOther: data.contactOther,
        consent: data.consent,
        files: adoption.files,
      })
      referenceCode = result.referenceCode
    } catch (dbErr) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr)

      // Race condition: a concurrent submit already inserted with the same
      // clientSubmissionId. Do NOT delete the storage objects — under selection-time
      // upload they were uploaded before submit, and the winning request's
      // request_files rows point at these exact same paths. Deleting them here would
      // destroy the winner's live files. Just recover the existing referenceCode.
      if (message.includes(PG_UNIQUE_VIOLATION) || message.includes("unique constraint")) {
        try {
          const racedReferenceCode = await getRequestByClientSubmissionId(
            payload.clientSubmissionId,
          )
          if (racedReferenceCode !== null) {
            console.log(`[route] idempotent race recovered: ${racedReferenceCode}`)
            return NextResponse.json({ ok: true, referenceCode: racedReferenceCode })
          }
        } catch (lookupErr) {
          const lookupMessage = lookupErr instanceof Error ? lookupErr.message : String(lookupErr)
          console.error("[route] race recovery lookup failed:", lookupMessage)
        }
      } else {
        console.error("[route] DB insert failed:", message)
      }

      // On any non-recovered DB failure the uploaded files are left in place: the
      // visitor retries with the same handles → same paths → success.
      return NextResponse.json(
        { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, referenceCode })
  } catch (err) {
    if (err instanceof ClientSubmissionIdError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: { clientSubmissionId: [err.message] },
            formErrors: [],
          },
        },
        { status: 400 },
      )
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error("[route] unexpected submit failure:", message)
    return NextResponse.json(
      { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
      { status: 500 },
    )
  }
}
