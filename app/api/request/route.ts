import { NextResponse } from "next/server"
import {
  API_ERROR_CODES,
  ClientSubmissionIdError,
  parseRequestFormData,
  validateFiles,
  validateRequestPayload,
} from "@/bff"
import { uploadRequestFiles } from "@/services"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const payload = parseRequestFormData(formData)

    const validation = validateRequestPayload(payload)
    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 })
    }

    const fileValidation = validateFiles(payload)
    if (!fileValidation.ok) {
      return NextResponse.json(fileValidation, { status: 400 })
    }

    await uploadRequestFiles(
      { referenceImages: payload.referenceImages, placementImages: payload.placementImages },
      payload.clientSubmissionId,
    )

    const requestId = crypto.randomUUID()
    return NextResponse.json({ ok: true, requestId })
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
    return NextResponse.json(
      { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
      { status: 500 },
    )
  }
}
