import { describe, it, expect } from "vitest"
import { getRequestOrigin, type HeaderHandler } from "../supabaseAuth"

function makeHeaders(values: Record<string, string>): HeaderHandler {
  return { get: (name: string) => values[name] ?? null }
}

describe("getRequestOrigin", () => {
  it("prefers x-forwarded-host and x-forwarded-proto when both are set (reverse proxy)", () => {
    const headers = makeHeaders({
      host: "internal:3000",
      "x-forwarded-host": "app.example.com",
      "x-forwarded-proto": "https",
    })

    expect(getRequestOrigin(headers)).toBe("https://app.example.com")
  })

  it("defaults protocol to https when x-forwarded-proto is absent", () => {
    const headers = makeHeaders({ "x-forwarded-host": "app.example.com" })

    expect(getRequestOrigin(headers)).toBe("https://app.example.com")
  })

  it("falls back to the host header when x-forwarded-host is absent", () => {
    const headers = makeHeaders({ host: "app.example.com" })

    expect(getRequestOrigin(headers)).toBe("https://app.example.com")
  })

  it("uses x-forwarded-proto http with the plain host header (local dev behind no proxy)", () => {
    const headers = makeHeaders({ host: "localhost:3000", "x-forwarded-proto": "http" })

    expect(getRequestOrigin(headers)).toBe("http://localhost:3000")
  })

  it("prefers x-forwarded-host over host when both are present", () => {
    const headers = makeHeaders({
      host: "0.0.0.0:3000",
      "x-forwarded-host": "tattoo-request-app.vercel.app",
      "x-forwarded-proto": "https",
    })

    expect(getRequestOrigin(headers)).toBe("https://tattoo-request-app.vercel.app")
  })
})
