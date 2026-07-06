import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { logAuthFailure } from "../authLog"

describe("logAuthFailure", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it("logs at warn level by default", () => {
    logAuthFailure("login", { status: 400 })

    expect(warnSpy).toHaveBeenCalledWith("[auth] operation failed", {
      operation: "login",
      reason: "auth_request_rejected",
    })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it("logs at error level when explicitly requested", () => {
    logAuthFailure("oauth_callback", { status: 500 }, "error")

    expect(errorSpy).toHaveBeenCalledWith("[auth] operation failed", {
      operation: "oauth_callback",
      reason: "unknown",
    })
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it.each([
    [400, "auth_request_rejected"],
    [401, "auth_request_rejected"],
    [422, "auth_request_rejected"],
    [429, "rate_limited"],
    [500, "unknown"],
    [undefined, "unknown"],
  ] as const)("classifies status %s as %s", (status, reason) => {
    logAuthFailure("login", { status })

    expect(warnSpy).toHaveBeenCalledWith("[auth] operation failed", { operation: "login", reason })
  })

  it("classifies a non-AuthError value (null) as unknown without throwing", () => {
    expect(() => logAuthFailure("logout", null, "warn")).not.toThrow()
    expect(warnSpy).toHaveBeenCalledWith("[auth] operation failed", {
      operation: "logout",
      reason: "unknown",
    })
  })

  it("never includes email, password, or the raw error message in the logged context", () => {
    logAuthFailure("login", { status: 400, message: "Invalid login credentials for user a@b.com" })

    const loggedContext = warnSpy.mock.calls[0]?.[1]
    expect(loggedContext).toEqual({ operation: "login", reason: "auth_request_rejected" })
  })
})
