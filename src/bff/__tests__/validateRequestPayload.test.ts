import { describe, it, expect } from "vitest"
import { API_ERROR_CODES } from "@/shared/api"
import { validateRequestPayload } from "../request"
import type { ParsedRequestPayload } from "../request"

const validPayload: ParsedRequestPayload = {
  clientSubmissionId: "550e8400-e29b-41d4-a716-446655440000",
  clientName: "Alex",
  ideaDescription: "A detailed dragon tattoo on the sleeve",
  placement: "arm",
  size: "medium",
  color: "black-and-grey",
  eligibility: true,
  contactMethod: "email",
  contactValue: "client@example.com",
  budget: undefined,
  uploadHandles: [],
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

  it("rejects a missing contact method", () => {
    const result = validateRequestPayload({ ...validPayload, contactMethod: "" })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.contactMethod).toContain("contact_method_required")
    }
  })

  // The server must not trust the client's method list: a method this studio disabled is
  // rejected even though it is one of the five known values.
  it("rejects a method outside the studio's offered set", () => {
    const result = validateRequestPayload({ ...validPayload, contactMethod: "carrier_pigeon" })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.contactMethod).toContain("contact_method_required")
    }
  })

  it("rejects an empty contact value", () => {
    const result = validateRequestPayload({ ...validPayload, contactValue: "   " })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.contactValue).toContain("contact_value_required")
    }
  })

  it.each([
    ["email", "not-an-email", "email_invalid"],
    ["whatsapp", "+1 202 555 0100", "phone_invalid"],
    ["phone", "not a phone", "phone_invalid"],
    ["instagram", "masha tattoo", "instagram_invalid"],
    ["telegram", "masha.tattoo", "telegram_invalid"],
  ])("rejects a value invalid for method %s", (contactMethod, contactValue, expected) => {
    const result = validateRequestPayload({ ...validPayload, contactMethod, contactValue })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.contactValue).toContain(expected)
    }
  })

  it.each([
    ["email", "client@example.com"],
    ["whatsapp", "054-555-5555"],
    ["phone", "+972 54 555 5555"],
    ["instagram", "@masha.tattoo"],
    ["telegram", "@masha_tattoo"],
  ])("accepts a valid value for method %s", (contactMethod, contactValue) => {
    const result = validateRequestPayload({ ...validPayload, contactMethod, contactValue })

    expect(result.ok).toBe(true)
    // Held AS ENTERED — normalization is the persistence boundary's job (FS §3.4).
    if (result.ok) expect(result.data.contactValue).toBe(contactValue)
  })

  it("returns fieldErrors.eligibility when eligibility is not true", () => {
    const payload = {
      ...validPayload,
      eligibility: undefined as unknown as true,
    }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.eligibility).toBeDefined()
    }
  })

  it("succeeds with zero upload handles (uploads are optional per FS §4.2)", () => {
    const result = validateRequestPayload({ ...validPayload, uploadHandles: [] })
    expect(result.ok).toBe(true)
  })

  it("returns fieldErrors.uploadHandles when more than 9 handles are provided", () => {
    const payload = { ...validPayload, uploadHandles: Array.from({ length: 10 }, (_, i) => `h${i}`) }
    const result = validateRequestPayload(payload)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.uploadHandles).toBeDefined()
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
