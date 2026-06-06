import { NextResponse } from "next/server"
import { parseRequestFormData } from "@/bff"

export async function POST(req: Request) {
  const formData = await req.formData()
  const payload = parseRequestFormData(formData)

  console.log("[POST /api/request] received payload:", {
    ...payload,
    referenceImages: payload.referenceImages.map((f) => f.name),
    placementImages: payload.placementImages.map((f) => f.name),
  })

  const requestId = crypto.randomUUID()

  return NextResponse.json({ ok: true, requestId })
}
