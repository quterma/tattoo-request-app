import { NextResponse } from "next/server"
import {
  ClientSubmissionIdError,
  adoptUploadHandles,
  checkRateLimit,
  clientIpFromHeaders,
  parseRequestFormData,
  validateRequestPayload,
} from "@/bff"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/shared/api"
import { normalizeContactValue } from "@/features/request/lib/contact"
import { createRequest, getRequestByClientSubmissionId } from "@/services"
import type { ContactMethodName } from "@/services"
import { config } from "@/config/env"

function resolveStudioId(): string {
  return config.app.deploymentStudioId
}

// Postgres unique violation error code
const PG_UNIQUE_VIOLATION = "23505"

// Best-effort in-memory burst shield, NOT a security boundary — it is per-instance on
// Vercel's multi-instance runtime, so it only blunts a naive submit burst. The durable
// bound against upload abuse lives on /api/upload (bff/uploadQuota.ts); this route's own
// spam defence is the honeypot below.
const SUBMIT_RATE_LIMIT = 5
const SUBMIT_RATE_WINDOW_MS = 10 * 60 * 1000

// Honeypot success code: same shape as a real reference_code — 6 chars from the
// ambiguity-free alphabet (no I/O/0/1), matching the DB generator in
// supabase/migrations/20260716184220_stage6_contact_model.sql. A spam submit gets a
// normal-looking success with a code of this exact shape, so a bot cannot distinguish it
// from a real one by inspecting the response. It is never written to the DB.
const REFERENCE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function synthReferenceCode(): string {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += REFERENCE_CODE_ALPHABET[Math.floor(Math.random() * REFERENCE_CODE_ALPHABET.length)]
  }
  return code
}

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

    // Honeypot (FS §4.5): a human never fills the hidden `website` field. A non-empty value
    // is spam — return a normal-looking success with a real-shaped reference code but persist
    // NOTHING, so the bot gets no signal it was caught. Read directly here (before parsing):
    // the field is deliberately absent from the validated payload/schema. Because nothing is
    // written, the same clientSubmissionId can still submit legitimately later. Structured
    // console.warn so the trip is visible in Vercel logs.
    const honeypot = formData.get(REQUEST_FIELDS.website)
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      console.warn("[route] honeypot filled: reason=honeypot")
      return NextResponse.json({ ok: true, referenceCode: synthReferenceCode() })
    }

    const payload = parseRequestFormData(formData)

    const validation = validateRequestPayload(payload)
    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 })
    }
    const data = validation.data

    // Normalize the contact value for storage. The schema validated it against its method's rule
    // (so null is unreachable here), but the check is explicit rather than a non-null assertion:
    // a future method whose normalizer is missed would otherwise silently persist a raw value.
    const contactMethod = data.contactMethod as ContactMethodName
    const normalizedContactValue = normalizeContactValue(contactMethod, data.contactValue.trim())
    if (normalizedContactValue === null) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: { contactValue: ["contact_value_invalid"] },
            formErrors: [],
          },
        },
        { status: 400 },
      )
    }

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
        // The schema holds contactValue AS ENTERED (FS §3.4's Success echo needs that);
        // normalization to the stored form (E.164 / @-stripped) happens here, at the
        // persistence boundary. The schema already proved the value is valid for its method,
        // so this cannot be null — the check keeps the type honest rather than trusting that.
        contact: { method: contactMethod, value: normalizedContactValue },
        // The eligibility confirmation (18+/for-self, FS §4.2 field 11) persists into the
        // existing `consent` boolean column — same semantics, no migration.
        consent: data.eligibility,
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
