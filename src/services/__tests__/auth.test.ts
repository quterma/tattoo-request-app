import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock("../supabaseAuth", () => ({
  createSupabaseAuthClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock("../supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}))

import { getAuthenticatedStudioMember } from "../auth"
import type { CookieHandler } from "../supabaseAuth"

const cookies: CookieHandler = {
  getAll: () => [],
  setAll: () => {},
}

const USER_ID = "user-uuid-1111"
const STUDIO_ID = "studio-uuid-2222"

function makeChain(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })
  mockFrom.mockReturnValue({ select })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getAuthenticatedStudioMember", () => {
  it("returns ok:true with userId and studioId when authenticated and member exists", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    makeChain({ data: { studio_id: STUDIO_ID }, error: null })

    const result = await getAuthenticatedStudioMember(cookies)

    expect(result).toEqual({ ok: true, userId: USER_ID, studioId: STUDIO_ID })
    expect(mockFrom).toHaveBeenCalledWith("studio_members")
  })

  it("returns ok:false reason:unauthorized when authenticated but no membership row", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    makeChain({ data: null, error: null })

    const result = await getAuthenticatedStudioMember(cookies)

    expect(result).toEqual({ ok: false, reason: "unauthorized" })
  })

  it("returns ok:false reason:unauthenticated when no session user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const result = await getAuthenticatedStudioMember(cookies)

    expect(result).toEqual({ ok: false, reason: "unauthenticated" })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it("returns ok:false reason:unauthenticated when Supabase returns AuthSessionMissingError", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
    })

    const result = await getAuthenticatedStudioMember(cookies)

    expect(result).toEqual({ ok: false, reason: "unauthenticated" })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it("throws when Supabase auth returns an unexpected infrastructure error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthUnknownError", message: "JWT expired" },
    })

    await expect(getAuthenticatedStudioMember(cookies)).rejects.toThrow("Auth session check failed")
  })

  it("throws when DB membership lookup fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    makeChain({ data: null, error: { message: "connection refused" } })

    await expect(getAuthenticatedStudioMember(cookies)).rejects.toThrow(
      "Studio membership lookup failed",
    )
  })

  it("propagates the original infrastructure error message", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    })
    makeChain({ data: null, error: { message: "connection refused" } })

    await expect(getAuthenticatedStudioMember(cookies)).rejects.toThrow("connection refused")
  })
})
