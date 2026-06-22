import { NextResponse } from "next/server"
import {
  API_ERROR_CODES,
  ClientSubmissionIdError,
  parseRequestFormData,
  validateFiles,
  validateRequestPayload,
} from "@/bff"
import { createRequest, uploadRequestFiles } from "@/services"
import { supabase } from "@/services"

const BUCKET = "request-images"

async function cleanupStorageFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  console.log(`[route] cleanup: deleting ${paths.length} file(s) after DB failure`, paths)
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) {
    console.error("[route] cleanup failed:", error.message)
  } else {
    console.log("[route] cleanup succeeded")
  }
}

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

    const uploadedFiles = await uploadRequestFiles(
      { referenceImages: payload.referenceImages, placementImages: payload.placementImages },
      payload.clientSubmissionId,
    )

    let result: { id: string; referenceCode: string }
    try {
      result = await createRequest({
        clientSubmissionId: payload.clientSubmissionId,
        clientName: payload.clientName,
        description: payload.ideaDescription,
        placement: payload.placement,
        size: payload.size,
        color: payload.color,
        budget: payload.budget,
        email: payload.email,
        phone: payload.phone,
        contactOther: payload.contactOther,
        // consent is guaranteed true by validateRequestPayload above
        consent: payload.consent as true,
        files: uploadedFiles,
      })
    } catch (dbErr) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.error("[route] DB insert failed:", message)
      await cleanupStorageFiles(uploadedFiles.map((f) => f.storagePath))
      return NextResponse.json(
        { ok: false, error: { code: API_ERROR_CODES.SERVER_ERROR } },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, referenceCode: result.referenceCode })
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
