import { describe, expect, it } from "vitest"
import { hasSupportedLocalePrefix, withDefaultLocalePrefix } from "../localePath"

describe("hasSupportedLocalePrefix", () => {
  it("returns true for a supported locale prefix", () => {
    expect(hasSupportedLocalePrefix("/en/foo/bar")).toBe(true)
    expect(hasSupportedLocalePrefix("/en/admin/requests")).toBe(true)
  })

  it("returns false for a missing locale prefix", () => {
    expect(hasSupportedLocalePrefix("/foo/bar")).toBe(false)
    expect(hasSupportedLocalePrefix("/admin/requests")).toBe(false)
    expect(hasSupportedLocalePrefix("/")).toBe(false)
  })

  it("returns false for an invalid locale-like first segment", () => {
    expect(hasSupportedLocalePrefix("/ff/admin/request")).toBe(false)
  })
})

describe("withDefaultLocalePrefix", () => {
  it("preserves both path segments when prefixing /foo/bar", () => {
    expect(withDefaultLocalePrefix("/foo/bar")).toBe("/en/foo/bar")
  })

  it("prefixes /admin/requests without dropping the first segment", () => {
    expect(withDefaultLocalePrefix("/admin/requests")).toBe("/en/admin/requests")
  })

  it("prefixes an invalid locale-like first segment instead of treating it as a locale", () => {
    expect(withDefaultLocalePrefix("/ff/admin/request")).toBe("/en/ff/admin/request")
  })

  it("prefixes the root path", () => {
    expect(withDefaultLocalePrefix("/")).toBe("/en/")
  })
})
