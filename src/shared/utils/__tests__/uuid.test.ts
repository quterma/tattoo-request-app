import { describe, it, expect } from "vitest"
import { isUuid } from "../uuid"

describe("isUuid", () => {
  it("returns true for a valid UUID", () => {
    expect(isUuid("9f3b1c2a-1111-4a2b-8c3d-abcdef123456")).toBe(true)
  })

  it("returns false for a non-UUID string", () => {
    expect(isUuid("not-a-uuid")).toBe(false)
  })

  it("returns false for a malformed UUID-like string", () => {
    expect(isUuid("9f3b1c2a-1111-4a2b-8c3d-abcdef12345")).toBe(false)
  })

  it("returns false for an empty string", () => {
    expect(isUuid("")).toBe(false)
  })
})
