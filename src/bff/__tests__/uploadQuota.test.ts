import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ── hoisted mocks ──────────────────────────────────────────────────────────

const { mockLimit, mockFixedWindow, RatelimitCtor, RedisCtor } = vi.hoisted(() => {
  const mockLimit = vi.fn()
  const mockFixedWindow = vi.fn(() => ({ __algo: "fixedWindow" }))
  // Ratelimit constructor captures the options it was given and exposes limit().
  const RatelimitCtor = vi.fn(function (this: Record<string, unknown>, opts: unknown) {
    this.opts = opts
    this.limit = mockLimit
  }) as unknown as { new (opts: unknown): unknown; fixedWindow: typeof mockFixedWindow }
  RatelimitCtor.fixedWindow = mockFixedWindow
  const RedisCtor = vi.fn(function (this: Record<string, unknown>, opts: unknown) {
    this.opts = opts
  })
  return { mockLimit, mockFixedWindow, RatelimitCtor, RedisCtor }
})

vi.mock("@upstash/ratelimit", () => ({ Ratelimit: RatelimitCtor }))
vi.mock("@upstash/redis", () => ({ Redis: RedisCtor }))
vi.mock("@/config", () => ({
  config: {
    app: { deploymentStudioId: "studio-xyz" },
    upstash: { redisUrl: "https://redis.example", redisToken: "tok" },
  },
}))

import {
  UPLOAD_QUOTA_LIMIT,
  UPLOAD_QUOTA_WINDOW,
  checkUploadQuota,
  __resetUploadQuotaForTests,
} from "../uploadQuota"

beforeEach(() => {
  vi.clearAllMocks()
  __resetUploadQuotaForTests()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("upload quota constants", () => {
  it("is 60 admitted uploads over a 24h window (named server constant, not env)", () => {
    expect(UPLOAD_QUOTA_LIMIT).toBe(60)
    expect(UPLOAD_QUOTA_WINDOW).toBe("24 h")
  })
})

describe("checkUploadQuota — construction", () => {
  it("builds a fixedWindow limiter keyed under a studio-scoped prefix with the timeout disabled", async () => {
    mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 1000 })
    await checkUploadQuota("1.2.3.4")

    expect(mockFixedWindow).toHaveBeenCalledWith(60, "24 h")
    const opts = (RatelimitCtor as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as {
      prefix: string
      timeout: unknown
    }
    // Prefix isolates studio AND environment on the same IP. No VERCEL_ENV in the test env → "local".
    expect(opts.prefix).toBe("upload-quota:studio-xyz:local")
    // timeout:0 disables the SDK's default 5s race (which fails OPEN); this control fails CLOSED.
    expect(opts.timeout).toBe(0)
  })

  it("includes the deployment environment in the prefix so preview and production do not collide", async () => {
    const prev = process.env.VERCEL_ENV
    process.env.VERCEL_ENV = "preview"
    try {
      mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 1000 })
      await checkUploadQuota("1.2.3.4")
      const opts = (RatelimitCtor as unknown as { mock: { calls: unknown[][] } }).mock
        .calls[0][0] as { prefix: string }
      // Same studio ID, different environment → a distinct bucket namespace.
      expect(opts.prefix).toBe("upload-quota:studio-xyz:preview")
    } finally {
      if (prev === undefined) delete process.env.VERCEL_ENV
      else process.env.VERCEL_ENV = prev
    }
  })

  it("reuses a single limiter instance across calls (module singleton)", async () => {
    mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 1000 })
    await checkUploadQuota("1.2.3.4")
    await checkUploadQuota("5.6.7.8")
    expect(RatelimitCtor).toHaveBeenCalledTimes(1)
  })
})

describe("checkUploadQuota — outcomes", () => {
  it("admits when the store reports success", async () => {
    mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 5000 })
    const r = await checkUploadQuota("1.2.3.4")
    expect(r).toEqual({ ok: true, kind: "allowed" })
    expect(mockLimit).toHaveBeenCalledWith("1.2.3.4")
  })

  it("returns a quota breach with Retry-After derived from reset (ms → ceil seconds)", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(1_000_000))
    mockLimit.mockResolvedValue({ success: false, reset: 1_000_000 + 4200 })
    const r = await checkUploadQuota("1.2.3.4")
    expect(r).toEqual({ ok: false, kind: "quota", retryAfterSeconds: 5 })
  })

  it("floors Retry-After at 1 second even when reset is already past", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2_000_000))
    mockLimit.mockResolvedValue({ success: false, reset: 1_999_000 })
    const r = await checkUploadQuota("1.2.3.4")
    expect(r).toEqual({ ok: false, kind: "quota", retryAfterSeconds: 1 })
  })

  it("fails CLOSED (unavailable) when limit() rejects — no throw escapes", async () => {
    mockLimit.mockRejectedValue(new Error("redis down"))
    const r = await checkUploadQuota("1.2.3.4")
    expect(r).toEqual({ ok: false, kind: "unavailable" })
  })

  it("fails CLOSED (unavailable) when the store call STALLS and never settles", async () => {
    vi.useFakeTimers()
    // A hung fetch: limit() never resolves nor rejects. Without our own deadline this would
    // leave the Function pending until the platform kills it, bypassing the 503 path.
    mockLimit.mockReturnValue(new Promise(() => {}))
    const pending = checkUploadQuota("1.2.3.4")
    // Advance past QUOTA_STORE_DEADLINE_MS (3000).
    await vi.advanceTimersByTimeAsync(3100)
    await expect(pending).resolves.toEqual({ ok: false, kind: "unavailable" })
  })
})
