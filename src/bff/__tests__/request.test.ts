import { describe, it, expect } from "vitest"
import { parseRequestFormData } from "../request"

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

describe("parseRequestFormData", () => {
  it("parses required string fields", () => {
    const fd = makeFormData({
      ideaDescription: "A dragon tattoo",
      placement: "arm",
      size: "medium",
      color: "black",
      consent: "true",
    })

    const result = parseRequestFormData(fd)

    expect(result.ideaDescription).toBe("A dragon tattoo")
    expect(result.placement).toBe("arm")
    expect(result.size).toBe("medium")
    expect(result.color).toBe("black")
    expect(result.consent).toBe("true")
  })

  it("returns undefined for absent optional fields", () => {
    const fd = makeFormData({
      ideaDescription: "test",
      placement: "back",
      size: "large",
      color: "color",
      consent: "true",
    })

    const result = parseRequestFormData(fd)

    expect(result.budget).toBeUndefined()
    expect(result.email).toBeUndefined()
    expect(result.phone).toBeUndefined()
    expect(result.contactOther).toBeUndefined()
  })

  it("parses optional fields when present", () => {
    const fd = makeFormData({
      ideaDescription: "test",
      placement: "back",
      size: "large",
      color: "color",
      consent: "true",
      budget: "500",
      email: "test@example.com",
      phone: "+1234567890",
      contactOther: "telegram",
    })

    const result = parseRequestFormData(fd)

    expect(result.budget).toBe("500")
    expect(result.email).toBe("test@example.com")
    expect(result.phone).toBe("+1234567890")
    expect(result.contactOther).toBe("telegram")
  })

  it("returns empty arrays when no file entries are present", () => {
    const fd = makeFormData({
      ideaDescription: "test",
      placement: "arm",
      size: "small",
      color: "black",
      consent: "true",
    })

    const result = parseRequestFormData(fd)

    expect(result.referenceImages).toEqual([])
    expect(result.placementImages).toEqual([])
  })

  it("collects multiple file entries into arrays", () => {
    const fd = new FormData()
    fd.append("ideaDescription", "test")
    fd.append("placement", "arm")
    fd.append("size", "small")
    fd.append("color", "black")
    fd.append("consent", "true")

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
