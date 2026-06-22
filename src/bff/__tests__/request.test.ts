import { describe, it, expect } from "vitest"
import { parseRequestFormData, ClientSubmissionIdError } from "../request"

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v)
    } else {
      fd.append(key, value)
    }
  }
  return fd
}

function baseFields(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    clientSubmissionId: VALID_UUID,
    clientName: "Alex",
    ideaDescription: "A dragon tattoo",
    placement: "arm",
    size: "medium",
    color: "black",
    consent: "true",
    ...overrides,
  }
}

describe("parseRequestFormData", () => {
  it("parses required string fields", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.ideaDescription).toBe("A dragon tattoo")
    expect(result.placement).toBe("arm")
    expect(result.size).toBe("medium")
    expect(result.color).toBe("black")
    expect(result.consent).toBe(true)
  })

  it("parses clientSubmissionId", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.clientSubmissionId).toBe(VALID_UUID)
  })

  it("parses clientName", () => {
    const fd = makeFormData(baseFields({ clientName: "Jordan" }))

    const result = parseRequestFormData(fd)

    expect(result.clientName).toBe("Jordan")
  })

  it("returns empty string for absent clientName", () => {
    const fields = baseFields()
    delete (fields as Record<string, string>).clientName
    const fd = makeFormData(fields)

    const result = parseRequestFormData(fd)

    expect(result.clientName).toBe("")
  })

  it("returns undefined for absent optional fields", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.budget).toBeUndefined()
    expect(result.email).toBeUndefined()
    expect(result.phone).toBeUndefined()
    expect(result.contactOther).toBeUndefined()
  })

  it("parses optional fields when present", () => {
    const fd = makeFormData(
      baseFields({
        budget: "500",
        email: "test@example.com",
        phone: "+1234567890",
        contactOther: "telegram",
      }),
    )

    const result = parseRequestFormData(fd)

    expect(result.budget).toBe("500")
    expect(result.email).toBe("test@example.com")
    expect(result.phone).toBe("+1234567890")
    expect(result.contactOther).toBe("telegram")
  })

  it("returns empty arrays when no file entries are present", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.referenceImages).toEqual([])
    expect(result.placementImages).toEqual([])
  })

  it("collects multiple file entries into arrays", () => {
    const fd = new FormData()
    for (const [k, v] of Object.entries(baseFields())) fd.append(k, v)

    const file1 = new File(["a"], "ref1.png", { type: "image/png" })
    const file2 = new File(["b"], "ref2.png", { type: "image/png" })
    const file3 = new File(["c"], "place1.png", { type: "image/png" })

    fd.append("referenceImages", file1)
    fd.append("referenceImages", file2)
    fd.append("placementImages", file3)

    const result = parseRequestFormData(fd)

    expect(result.referenceImages).toHaveLength(2)
    expect(result.referenceImages[0].name).toBe("ref1.png")
    expect(result.referenceImages[1].name).toBe("ref2.png")
    expect(result.placementImages).toHaveLength(1)
    expect(result.placementImages[0].name).toBe("place1.png")
  })
})

describe("parseRequestFormData – consent conversion", () => {
  it('converts consent "true" string to boolean true', () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.consent).toBe(true)
  })

  it("returns undefined-like value when consent is absent", () => {
    const fd = makeFormData(baseFields({ consent: "false" }))
    fd.delete("consent")

    const result = parseRequestFormData(fd)

    expect(result.consent).not.toBe(true)
  })
})

describe("parseRequestFormData – clientSubmissionId validation", () => {
  it("throws ClientSubmissionIdError when clientSubmissionId is missing", () => {
    const fields = baseFields()
    delete (fields as Record<string, string>).clientSubmissionId
    const fd = makeFormData(fields)

    expect(() => parseRequestFormData(fd)).toThrowError(ClientSubmissionIdError)
    expect(() => parseRequestFormData(fd)).toThrow("missing")
  })

  it("throws ClientSubmissionIdError when clientSubmissionId is not a valid UUID v4", () => {
    const fd = makeFormData(baseFields({ clientSubmissionId: "not-a-uuid" }))

    expect(() => parseRequestFormData(fd)).toThrowError(ClientSubmissionIdError)
    expect(() => parseRequestFormData(fd)).toThrow("not a valid UUID")
  })

  it("throws ClientSubmissionIdError for UUID v1 (wrong version)", () => {
    const fd = makeFormData(
      baseFields({ clientSubmissionId: "550e8400-e29b-11d4-a716-446655440000" }),
    )

    expect(() => parseRequestFormData(fd)).toThrowError(ClientSubmissionIdError)
  })

  it("accepts a valid UUID v4", () => {
    const fd = makeFormData(baseFields({ clientSubmissionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479" }))

    const result = parseRequestFormData(fd)

    expect(result.clientSubmissionId).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479")
  })
})
