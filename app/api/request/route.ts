import { NextResponse } from "next/server"
import { parseRequestFormData, validateRequestPayload } from "@/bff"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const payload = parseRequestFormData(formData)
    const validation = validateRequestPayload(payload)

    if (!validation.ok) {
      return NextResponse.json(validation, { status: 400 })
    }

    const requestId = crypto.randomUUID()
    return NextResponse.json({ ok: true, requestId })
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR" } },
      { status: 500 },
    )
  }
}
