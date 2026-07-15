import { describe, it, expect } from "vitest"
import { requestFormSchema } from "../validation"

const validBase = {
  clientName: "Alex",
  ideaDescription: "A detailed dragon tattoo on the forearm",
  placement: "arm",
  size: "medium",
  color: "black-and-grey",
  budget: "",
  email: "user@example.com",
  phone: "",
  contactOther: "",
  eligibility: true as const,
}

describe("requestFormSchema – clientName", () => {
  it("rejects when clientName is missing", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clientName: _, ...without } = validBase
    const result = requestFormSchema.safeParse(without)
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("client_name_required")
    }
  })

  it("rejects when clientName is too short", () => {
    const result = requestFormSchema.safeParse({ ...validBase, clientName: "A" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("client_name_too_short")
    }
  })

  it("rejects when clientName is too long", () => {
    const result = requestFormSchema.safeParse({ ...validBase, clientName: "A".repeat(31) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("client_name_too_long")
    }
  })

  it("trims clientName before validation", () => {
    const result = requestFormSchema.safeParse({ ...validBase, clientName: "  A  " })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("client_name_too_short")
    }
  })

  it("accepts clientName at exactly 2 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, clientName: "Al" })
    expect(result.success).toBe(true)
  })

  it("accepts clientName at exactly 30 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, clientName: "A".repeat(30) })
    expect(result.success).toBe(true)
  })
})

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

  it("rejects when ideaDescription is under 20 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, ideaDescription: "a".repeat(19) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("idea_too_short")
    }
  })

  it("accepts ideaDescription at exactly 20 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, ideaDescription: "a".repeat(20) })
    expect(result.success).toBe(true)
  })

  it("rejects when ideaDescription exceeds 1000 characters", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      ideaDescription: "a".repeat(1001),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("idea_too_long")
    }
  })

  it("accepts ideaDescription at exactly 1000 characters", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      ideaDescription: "a".repeat(1000),
    })
    expect(result.success).toBe(true)
  })

  it("trims ideaDescription before the min check (whitespace-only is too short)", () => {
    const result = requestFormSchema.safeParse({ ...validBase, ideaDescription: " ".repeat(30) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("idea_too_short")
    }
  })

  it("returns the trimmed ideaDescription on success", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      ideaDescription: "  A detailed dragon on the forearm  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ideaDescription).toBe("A detailed dragon on the forearm")
    }
  })

  it("accepts a 1000-char idea wrapped in whitespace (trim happens before max)", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      ideaDescription: `  ${"a".repeat(1000)}  `,
    })
    expect(result.success).toBe(true)
  })

  it("accepts a valid input with zero uploads (uploads are optional)", () => {
    const result = requestFormSchema.safeParse({ ...validBase, uploadHandles: [] })
    expect(result.success).toBe(true)
  })

  it("rejects when placement is empty string", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_required")
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

  it("rejects when eligibility is not true", () => {
    const result = requestFormSchema.safeParse({ ...validBase, eligibility: undefined })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("eligibility_required")
    }
  })

  it("accepts each of the two color options", () => {
    for (const color of ["black-and-grey", "color"]) {
      const result = requestFormSchema.safeParse({ ...validBase, color })
      expect(result.success).toBe(true)
    }
  })

  it("rejects a color option no longer offered (black-only / not-sure)", () => {
    for (const color of ["black-only", "not-sure"]) {
      const result = requestFormSchema.safeParse({ ...validBase, color })
      expect(result.success).toBe(false)
    }
  })

  it("accepts size not-sure", () => {
    const result = requestFormSchema.safeParse({ ...validBase, size: "not-sure" })
    expect(result.success).toBe(true)
  })

  it("rejects a placement no longer offered (other)", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "other" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_required")
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

  it("shows contact_required even when eligibility is missing", () => {
    const result = requestFormSchema.safeParse({ ...noContact, eligibility: undefined })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_required")
      expect(messages).toContain("eligibility_required")
    }
  })

  it("shows contact_required on completely empty form submit", () => {
    const emptyForm = {
      clientName: "",
      ideaDescription: "",
      placement: "",
      size: "",
      color: "",
      budget: "",
      email: "",
      phone: "",
      contactOther: "",
      eligibility: undefined,
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

describe("requestFormSchema – upload handle constraints", () => {
  it("rejects more than 9 upload handles", () => {
    const handles = Array.from({ length: 10 }, (_, i) => `h${i}`)
    const result = requestFormSchema.safeParse({ ...validBase, uploadHandles: handles })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("upload_too_many")
    }
  })

  it("accepts up to 9 upload handles", () => {
    const handles = Array.from({ length: 9 }, (_, i) => `h${i}`)
    const result = requestFormSchema.safeParse({ ...validBase, uploadHandles: handles })
    expect(result.success).toBe(true)
  })
})

describe("requestFormSchema – contact/budget max-length constraints", () => {
  it("rejects budget exceeding 50 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, budget: "a".repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("budget_too_long")
    }
  })

  it("accepts budget at exactly 50 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, budget: "a".repeat(50) })
    expect(result.success).toBe(true)
  })

  it("rejects phone exceeding 50 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, phone: "1".repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("phone_too_long")
    }
  })

  it("rejects contactOther exceeding 50 characters", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      email: "",
      contactOther: "a".repeat(51),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_other_too_long")
    }
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
