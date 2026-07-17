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
    color: "black-and-grey",
    contactMethod: "email",
    contactValue: "client@example.com",
    eligibility: "true",
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
    expect(result.color).toBe("black-and-grey")
    expect(result.eligibility).toBe(true)
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

  it("returns undefined for an absent budget", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.budget).toBeUndefined()
  })

  it("parses the budget when present", () => {
    const fd = makeFormData(baseFields({ budget: "500" }))

    const result = parseRequestFormData(fd)

    expect(result.budget).toBe("500")
  })

  it("parses the chosen contact method and its value", () => {
    const fd = makeFormData(baseFields({ contactMethod: "telegram", contactValue: "@masha_t" }))

    const result = parseRequestFormData(fd)

    expect(result.contactMethod).toBe("telegram")
    // Parsed as entered — normalization happens at the persistence boundary (FS §3.4).
    expect(result.contactValue).toBe("@masha_t")
  })

  it("defaults an absent contact method/value to empty strings (the schema then rejects)", () => {
    const fields = baseFields()
    delete (fields as Record<string, string>).contactMethod
    delete (fields as Record<string, string>).contactValue

    const result = parseRequestFormData(makeFormData(fields))

    expect(result.contactMethod).toBe("")
    expect(result.contactValue).toBe("")
  })

  it("returns an empty array when no upload handles are present", () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.uploadHandles).toEqual([])
  })

  it("collects multiple upload handles into an array", () => {
    const fd = makeFormData({
      ...baseFields(),
      uploadHandles: ["handle-a", "handle-b", "handle-c"],
    })

    const result = parseRequestFormData(fd)

    expect(result.uploadHandles).toEqual(["handle-a", "handle-b", "handle-c"])
  })
})

describe("parseRequestFormData – eligibility conversion", () => {
  it('converts eligibility "true" string to boolean true', () => {
    const fd = makeFormData(baseFields())

    const result = parseRequestFormData(fd)

    expect(result.eligibility).toBe(true)
  })

  it("returns undefined-like value when eligibility is absent", () => {
    const fd = makeFormData(baseFields({ eligibility: "false" }))
    fd.delete("eligibility")

    const result = parseRequestFormData(fd)

    expect(result.eligibility).not.toBe(true)
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
