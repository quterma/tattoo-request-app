import { describe, it, expect, beforeEach } from "vitest"
import { __resetRateLimitForTests, checkRateLimit, clientIpFromHeaders } from "../rateLimit"

beforeEach(() => __resetRateLimitForTests())

describe("checkRateLimit", () => {
  it("allows up to the limit within a window, then blocks", () => {
    const now = 1000
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("k", 3, 10_000, now).allowed).toBe(true)
    }
    const blocked = checkRateLimit("k", 3, 10_000, now)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it("resets after the window elapses", () => {
    checkRateLimit("k", 1, 10_000, 1000)
    expect(checkRateLimit("k", 1, 10_000, 1000).allowed).toBe(false)
    expect(checkRateLimit("k", 1, 10_000, 12_000).allowed).toBe(true)
  })

  it("tracks keys independently", () => {
    expect(checkRateLimit("a", 1, 10_000, 1000).allowed).toBe(true)
    expect(checkRateLimit("a", 1, 10_000, 1000).allowed).toBe(false)
    expect(checkRateLimit("b", 1, 10_000, 1000).allowed).toBe(true)
  })
})

describe("clientIpFromHeaders", () => {
  it("prefers x-vercel-forwarded-for (not overwritable by a proxy on top of Vercel)", () => {
    const h = new Headers({
      "x-vercel-forwarded-for": "10.0.0.1, 5.6.7.8",
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "9.9.9.9",
    })
    expect(clientIpFromHeaders(h)).toBe("10.0.0.1")
  })

  it("takes the first hop of x-forwarded-for when the vercel header is absent", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })
    expect(clientIpFromHeaders(h)).toBe("1.2.3.4")
  })

  it("falls back to x-real-ip then a constant", () => {
    expect(clientIpFromHeaders(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9")
    expect(clientIpFromHeaders(new Headers())).toBe("unknown")
  })

  it("degrades a blank/whitespace-only header to the shared unknown bucket", () => {
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "   " }))).toBe("unknown")
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "  , 5.6.7.8" }))).toBe("unknown")
  })

  it("collapses a malformed (non-IP) source to the shared unknown bucket, not a per-value key", () => {
    // Two distinct garbage values must NOT become two independent buckets (per-value bypass).
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "garbage-a" }))).toBe("unknown")
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "garbage-b" }))).toBe("unknown")
  })

  it("accepts a valid IPv6 address", () => {
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1")
  })
})
