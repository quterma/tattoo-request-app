import { describe, it, expect } from "vitest"
import { requestFormSchema } from "../validation"

function makeFile(name = "photo.png"): File {
  return new File(["x"], name, { type: "image/png" })
}

const validBase = {
  ideaDescription: "A detailed dragon tattoo on the arm",
  referenceImages: [makeFile()],
  placement: "arm",
  placementImages: [makeFile()],
  size: "medium",
  color: "black",
  budget: "",
  email: "user@example.com",
  phone: "",
  contactOther: "",
  consent: true as const,
}

describe("requestFormSchema – required fields", () => {
  it("accepts a fully valid input", () => {
    const result = requestFormSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it("rejects when ideaDescription is missing", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ideaDescription: _, ...withoutIdea } = validBase
    const result = requestFormSchema.safeParse(withoutIdea)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("idea_required")
    }
  })

  it("rejects when ideaDescription is too short", () => {
    const result = requestFormSchema.safeParse({ ...validBase, ideaDescription: "short" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("idea_too_short")
    }
  })

  it("rejects when referenceImages is empty", () => {
    const result = requestFormSchema.safeParse({ ...validBase, referenceImages: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("reference_images_required")
    }
  })

  it("rejects when placement is empty string", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_required")
    }
  })

  it("rejects when placementImages is empty", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placementImages: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_images_required")
    }
  })

  it("rejects when size is empty string", () => {
    const result = requestFormSchema.safeParse({ ...validBase, size: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("size_required")
    }
  })

  it("rejects when color is empty string", () => {
    const result = requestFormSchema.safeParse({ ...validBase, color: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("color_required")
    }
  })

  it("rejects when consent is not true", () => {
    const result = requestFormSchema.safeParse({ ...validBase, consent: undefined })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("consent_required")
    }
  })
})

describe("requestFormSchema – contact group validation", () => {
  const noContact = {
    ...validBase,
    email: "",
    phone: "",
    contactOther: "",
  }

  it("rejects when all contact fields are empty", () => {
    const result = requestFormSchema.safeParse(noContact)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_required")
    }
  })

  it("shows contact_required even when consent is missing", () => {
    const result = requestFormSchema.safeParse({ ...noContact, consent: undefined })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_required")
      expect(messages).toContain("consent_required")
    }
  })

  it("shows contact_required on completely empty form submit", () => {
    const emptyForm = {
      ideaDescription: "",
      referenceImages: [],
      placement: "",
      placementImages: [],
      size: "",
      color: "",
      budget: "",
      email: "",
      phone: "",
      contactOther: "",
      consent: undefined,
    }
    const result = requestFormSchema.safeParse(emptyForm)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_required")
    }
  })

  it("accepts when only email is provided", () => {
    const result = requestFormSchema.safeParse({ ...noContact, email: "x@example.com" })
    expect(result.success).toBe(true)
  })

  it("accepts when only phone is provided", () => {
    const result = requestFormSchema.safeParse({ ...noContact, phone: "+79001234567" })
    expect(result.success).toBe(true)
  })

  it("accepts when only contactOther is provided", () => {
    const result = requestFormSchema.safeParse({ ...noContact, contactOther: "telegram" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email format", () => {
    const result = requestFormSchema.safeParse({ ...validBase, email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("email_invalid")
    }
  })
})

describe("requestFormSchema – file upload constraints", () => {
  it("rejects referenceImages exceeding max files", () => {
    const files = [makeFile(), makeFile(), makeFile(), makeFile()]
    const result = requestFormSchema.safeParse({ ...validBase, referenceImages: files })
    expect(result.success).toBe(false)
  })

  it("rejects placementImages exceeding max files", () => {
    const files = [makeFile(), makeFile(), makeFile(), makeFile()]
    const result = requestFormSchema.safeParse({ ...validBase, placementImages: files })
    expect(result.success).toBe(false)
  })
})

describe("requestFormSchema – optional field transforms", () => {
  it("transforms empty budget string to undefined", () => {
    const result = requestFormSchema.safeParse({ ...validBase, budget: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.budget).toBeUndefined()
    }
  })

  it("preserves non-empty budget value", () => {
    const result = requestFormSchema.safeParse({ ...validBase, budget: "500" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.budget).toBe("500")
    }
  })
})
