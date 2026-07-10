import { NextResponse } from "next/server"
import {
  ClientSubmissionIdError,
  parseRequestFormData,
  validateFiles,
  validateRequestPayload,
} from "@/bff"
import { API_ERROR_CODES } from "@/shared/api"
import {
  cleanupRequestFiles,
  createRequest,
  getRequestByClientSubmissionId,
  uploadRequestFiles,
} from "@/services"
import { config } from "@/config"

function resolveStudioId(): string {
  return config.app.deploymentStudioId
}

// Postgres unique violation error code
const PG_UNIQUE_VIOLATION = "23505"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const payload = parseRequestFormData(formData)

    const validation = validateRequestPayload(payload)
    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 })
    }
    const data = validation.data

    const fileValidation = validateFiles(payload)
    if (!fileValidation.ok) {
      return NextResponse.json(fileValidation, { status: 400 })
    }

    const studioId = resolveStudioId()

    // Idempotency check: return existing request without uploading or inserting
    const existingReferenceCode = await getRequestByClientSubmissionId(payload.clientSubmissionId)
    if (existingReferenceCode !== null) {
      console.log(`[route] idempotent replay: ${existingReferenceCode}`)
      return NextResponse.json({ ok: true, referenceCode: existingReferenceCode })
    }

    const uploadedFiles = await uploadRequestFiles(
      { referenceImages: payload.referenceImages, placementImages: payload.placementImages },
      studioId,
      payload.clientSubmissionId,
    )

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
        files: uploadedFiles,
      })
      referenceCode = result.referenceCode
    } catch (dbErr) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr)

      // Race condition: concurrent request already inserted with same clientSubmissionId
      if (message.includes(PG_UNIQUE_VIOLATION) || message.includes("unique constraint")) {
        await cleanupRequestFiles(uploadedFiles.map((f) => f.storagePath))
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
        await cleanupRequestFiles(uploadedFiles.map((f) => f.storagePath))
      }

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
