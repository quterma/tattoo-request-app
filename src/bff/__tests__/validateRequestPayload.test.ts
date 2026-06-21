import { describe, it, expect } from "vitest"
import { API_ERROR_CODES, validateRequestPayload } from "../request"
import type { ParsedRequestPayload } from "../request"

function makeFile(name = "photo.png"): File {
  return new File(["x"], name, { type: "image/png" })
}

const validPayload: ParsedRequestPayload = {
  clientSubmissionId: "550e8400-e29b-41d4-a716-446655440000",
  ideaDescription: "A detailed dragon tattoo on the sleeve",
  placement: "arm",
  size: "medium",
  color: "black",
  consent: true,
  email: "client@example.com",
  budget: undefined,
  phone: undefined,
  contactOther: undefined,
  referenceImages: [makeFile("ref.png")],
  placementImages: [makeFile("place.png")],
}

describe("validateRequestPayload – success", () => {
  it("returns ok:true for a valid payload", () => {
    const result = validateRequestPayload(validPayload)

    expect(result.ok).toBe(true)
  })

  it("returns parsed data on success", () => {
    const result = validateRequestPayload(validPayload)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.ideaDescription).toBe(validPayload.ideaDescription)
      expect(result.data.placement).toBe("arm")
    }
  })
})

describe("validateRequestPayload – validation errors", () => {
  it("returns ok:false with VALIDATION_ERROR when ideaDescription is missing", () => {
    const payload = { ...validPayload, ideaDescription: "" }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR)
      expect(result.error.fieldErrors).toBeDefined()
      expect(result.error.formErrors).toBeDefined()
    }
  })

  it("returns fieldErrors.ideaDescription when description is too short", () => {
    const payload = { ...validPayload, ideaDescription: "short" }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.ideaDescription).toContain("idea_too_short")
    }
  })

  it("returns fieldErrors.placement when placement is invalid", () => {
    const payload = { ...validPayload, placement: "" }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.placement).toBeDefined()
    }
  })

  it("returns fieldErrors.contactOther with contact_required when no contact provided", () => {
    const payload = {
      ...validPayload,
      email: undefined,
      phone: undefined,
      contactOther: undefined,
    }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.contactOther).toContain("contact_required")
    }
  })

  it("returns fieldErrors.consent when consent is not true", () => {
    const payload = {
      ...validPayload,
      consent: undefined as unknown as true,
    }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.consent).toBeDefined()
    }
  })

  it("returns fieldErrors.referenceImages when referenceImages is empty", () => {
    const payload = { ...validPayload, referenceImages: [] }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.referenceImages).toBeDefined()
    }
  })
})

describe("validateRequestPayload – error contract shape", () => {
  it("error result matches contract shape", () => {
    const payload = { ...validPayload, ideaDescription: "" }
    const result = validateRequestPayload(payload)

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: expect.any(Object),
        formErrors: expect.any(Array),
      },
    })
  })

  it("success result matches contract shape", () => {
    const result = validateRequestPayload(validPayload)

    expect(result).toMatchObject({
      ok: true,
      data: expect.any(Object),
    })
  })
})
