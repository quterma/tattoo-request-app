import { describe, it, expect } from "vitest"
import { requestFormSchema } from "../validation"

const validBase = {
  clientName: "Alex",
  ideaDescription: "A detailed dragon tattoo on the forearm",
  placement: "arm",
  size: "medium",
  color: "black-and-grey",
  budget: "",
  contactMethod: "email",
  contactValue: "user@example.com",
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

  it("accepts free-text placement not on the old fixed list", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      placement: "inner left forearm, wrapping toward the elbow",
    })
    expect(result.success).toBe(true)
  })

  it("rejects when placement is whitespace-only", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "   " })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_required")
    }
  })

  it("rejects placement exceeding 100 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "a".repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("placement_too_long")
    }
  })

  it("accepts placement at exactly 100 characters", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "a".repeat(100) })
    expect(result.success).toBe(true)
  })

  it("trims placement before validation", () => {
    const result = requestFormSchema.safeParse({ ...validBase, placement: "  arm  " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.placement).toBe("arm")
    }
  })
})

// FS §4.2 field 9 + 10a–e: one method, one value, validated per method.
describe("requestFormSchema – contact model", () => {
  it("rejects a missing method", () => {
    const result = requestFormSchema.safeParse({ ...validBase, contactMethod: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain("contact_method_required")
    }
  })

  // The offered set is per-studio config, and the schema validates against IT, not the bare
  // five-value enum — a method the studio disabled must not pass.
  it("rejects a method outside the offered set", () => {
    const result = requestFormSchema.safeParse({ ...validBase, contactMethod: "carrier_pigeon" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain("contact_method_required")
    }
  })

  it("rejects an empty or whitespace-only value", () => {
    for (const contactValue of ["", "   "]) {
      const result = requestFormSchema.safeParse({ ...validBase, contactValue })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.map((i) => i.message)).toContain("contact_value_required")
      }
    }
  })

  it.each([
    ["whatsapp", "054-555-5555"],
    ["phone", "+972 54 555 5555"],
    ["email", "x@example.com"],
    ["instagram", "@masha.tattoo"],
    ["telegram", "@masha_tattoo"],
  ])("accepts a valid %s value", (contactMethod, contactValue) => {
    const result = requestFormSchema.safeParse({ ...validBase, contactMethod, contactValue })
    expect(result.success).toBe(true)
  })

  it.each([
    ["email", "not-an-email", "email_invalid"],
    ["whatsapp", "+1 202 555 0100", "phone_invalid"],
    ["phone", "054", "phone_invalid"],
    ["instagram", "masha tattoo", "instagram_invalid"],
    ["telegram", "masha.tattoo", "telegram_invalid"],
    ["telegram", "mash", "telegram_invalid"],
  ])("rejects an invalid %s value with its own message", (contactMethod, contactValue, expected) => {
    const result = requestFormSchema.safeParse({ ...validBase, contactMethod, contactValue })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain(expected)
    }
  })

  // FS §3.4 needs the Success echo to show what the visitor typed, so the schema must NOT
  // transform the value — normalization happens at the persistence boundary.
  it("returns contactValue exactly as entered (no @-strip, no E.164)", () => {
    const result = requestFormSchema.safeParse({
      ...validBase,
      contactMethod: "instagram",
      contactValue: "@masha.tattoo",
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.contactValue).toBe("@masha.tattoo")
  })

  it("reports contact and eligibility problems together on an empty submit", () => {
    const result = requestFormSchema.safeParse({
      clientName: "",
      ideaDescription: "",
      placement: "",
      size: "",
      color: "",
      budget: "",
      contactMethod: "",
      contactValue: "",
      eligibility: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_method_required")
      expect(messages).toContain("eligibility_required")
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

  // REGRESSION GUARD: there is no shared length cap on contactValue — each method owns its own
  // bound. A shared cap would enforce a rule the FS does not state and reject this valid address
  // (FS §4.2 field 10a: RFC-basic validation, nothing more).
  it("accepts a long but RFC-valid email address", () => {
    const longEmail = `${"a".repeat(64)}@${"b".repeat(60)}.${"c".repeat(60)}.example.com`
    expect(longEmail.length).toBeGreaterThan(100)

    const result = requestFormSchema.safeParse({
      ...validBase,
      contactMethod: "email",
      contactValue: longEmail,
    })
    expect(result.success).toBe(true)
  })

  it("still guards against an unbounded payload on the public write surface", () => {
    const result = requestFormSchema.safeParse({ ...validBase, contactValue: "a".repeat(321) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("contact_value_invalid")
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
