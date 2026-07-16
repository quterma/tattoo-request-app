import { describe, it, expect } from "vitest"
import {
  normalizeContactValue,
  normalizeEmail,
  normalizeInstagram,
  normalizeIsraeliPhone,
  normalizeTelegram,
} from "../lib/contact"

describe("normalizeInstagram (FS §4.2 field 10d)", () => {
  it("accepts letters, digits, dots and underscores, 1–30 chars", () => {
    for (const handle of ["masha", "masha_tattoo", "masha.tattoo", "masha__tattoo", "a", "a".repeat(30)]) {
      expect(normalizeInstagram(handle)).toBe(handle)
    }
  })

  it("strips exactly one leading @ and preserves case", () => {
    expect(normalizeInstagram("@Masha.Tattoo")).toBe("Masha.Tattoo")
  })

  it("rejects a second @, other punctuation, whitespace and non-ASCII", () => {
    for (const bad of ["@@masha", "masha-tattoo", "masha tattoo", "masha/tattoo", "машатату", "@", ""]) {
      expect(normalizeInstagram(bad)).toBeNull()
    }
  })

  it("rejects over 30 chars", () => {
    expect(normalizeInstagram("a".repeat(31))).toBeNull()
  })

  // Deliberate: no authoritative Meta grammar for dot positions was found, so these are NOT
  // rejected — enforcing invented rules would only reject real handles.
  it("accepts dot-position shapes we deliberately do not police", () => {
    for (const handle of [".masha", "masha.", "masha..tattoo"]) {
      expect(normalizeInstagram(handle)).toBe(handle)
    }
  })
})

describe("normalizeTelegram (FS §4.2 field 10e — Telegram's rule, NOT Instagram's)", () => {
  it("accepts 5–32 chars of letters/digits/underscore", () => {
    for (const handle of ["masha", "Masha_123", "masha__tattoo", "masha_", "a".repeat(32)]) {
      expect(normalizeTelegram(handle)).toBe(handle)
    }
  })

  it("strips exactly one leading @", () => {
    expect(normalizeTelegram("@masha_tattoo")).toBe("masha_tattoo")
  })

  it("permits a leading underscore (no rule prohibiting one was established)", () => {
    expect(normalizeTelegram("_masha")).toBe("_masha")
  })

  // The whole point of the 2026-07-16 correction: these are valid Instagram but invalid Telegram.
  it("rejects what the Instagram rule would have wrongly accepted", () => {
    expect(normalizeTelegram("masha.tattoo")).toBeNull() // dots are not allowed
    expect(normalizeTelegram("mash")).toBeNull() // under 5 chars
    expect(normalizeTelegram("1masha")).toBeNull() // digit-first
  })

  it("rejects hyphens, whitespace and over 32 chars", () => {
    for (const bad of ["masha-tattoo", "masha tattoo", "a".repeat(33), ""]) {
      expect(normalizeTelegram(bad)).toBeNull()
    }
  })
})

// These assert the behavior of the INSTALLED libphonenumber-js, which is the point: the rules
// came from an external, unverified pass, so they are proven here rather than assumed.
describe("normalizeIsraeliPhone (FS §4.2 fields 10b/10c)", () => {
  it("normalizes every accepted Israeli form to one identical E.164 value", () => {
    for (const form of [
      "054-555-5555",
      "0545555555",
      "054 555 5555",
      "+972 54 555 5555",
      "+972545555555",
      "972545555555",
      "00972 54 555 5555",
    ]) {
      expect(normalizeIsraeliPhone(form)).toBe("+972545555555")
    }
  })

  it("accepts a valid Israeli landline (the Phone method is not mobile-only)", () => {
    expect(normalizeIsraeliPhone("+972 2 566 5555")).toBe("+97225665555")
  })

  // REGRESSION GUARD: isValid() alone is not enough — a well-formed foreign number parses as
  // valid, so the country check is what keeps a US number out of an Israel-only reply model.
  it("rejects a valid foreign number", () => {
    expect(normalizeIsraeliPhone("+1 202 555 0100")).toBeNull()
  })

  it("rejects unparseable text, short codes and empty input", () => {
    for (const bad of ["not a phone", "054", "*1234", ""]) {
      expect(normalizeIsraeliPhone(bad)).toBeNull()
    }
  })
})

describe("normalizeEmail", () => {
  it("trims only — RFC-basic validation belongs to the schema", () => {
    expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com")
    // Not this module's job to reject; the schema does that.
    expect(normalizeEmail("not-an-email")).toBe("not-an-email")
  })
})

describe("normalizeContactValue dispatch", () => {
  it("routes each method to its normalizer", () => {
    expect(normalizeContactValue("whatsapp", "054-555-5555")).toBe("+972545555555")
    expect(normalizeContactValue("phone", "054-555-5555")).toBe("+972545555555")
    expect(normalizeContactValue("instagram", "@masha")).toBe("masha")
    expect(normalizeContactValue("telegram", "@masha_t")).toBe("masha_t")
    expect(normalizeContactValue("email", " a@b.com ")).toBe("a@b.com")
  })

  it("returns null when the value is invalid for the chosen method", () => {
    expect(normalizeContactValue("telegram", "masha.tattoo")).toBeNull()
    expect(normalizeContactValue("whatsapp", "+1 202 555 0100")).toBeNull()
  })
})
