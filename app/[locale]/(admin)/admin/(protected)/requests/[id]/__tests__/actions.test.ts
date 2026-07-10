import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { MockInstance } from "vitest"

// ── hoisted mocks ──────────────────────────────────────────────────────────

const { mockGetAuthenticatedStudioMember, mockUpdateRequestStatusForStudio, mockRevalidatePath } =
  vi.hoisted(() => ({
    mockGetAuthenticatedStudioMember: vi.fn(),
    mockUpdateRequestStatusForStudio: vi.fn(),
    mockRevalidatePath: vi.fn(),
  }))

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock("@/services/auth", () => ({
  getAuthenticatedStudioMember: mockGetAuthenticatedStudioMember,
}))

vi.mock("@/services", () => ({
  REQUEST_STATUS_OPTIONS: ["new", "active", "booked", "completed", "rejected"],
  updateRequestStatusForStudio: mockUpdateRequestStatusForStudio,
}))

import { updateRequestStatusAction } from "../actions"

// ── helpers ────────────────────────────────────────────────────────────────

const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
const REQUEST_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
const INVALID_REQUEST_ID = "not-a-uuid'; DROP TABLE requests;--"

function makeFormData(status: string): FormData {
  const formData = new FormData()
  formData.set("status", status)
  return formData
}

let consoleWarnSpy: MockInstance

beforeEach(() => {
  vi.clearAllMocks()
  consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  mockGetAuthenticatedStudioMember.mockResolvedValue({ ok: true, studioId: STUDIO_ID })
  mockUpdateRequestStatusForStudio.mockResolvedValue(true)
})

afterEach(() => {
  consoleWarnSpy.mockRestore()
})

// ── invalid requestId (UUID validation) ────────────────────────────────────

describe("updateRequestStatusAction — invalid requestId", () => {
  it("returns the not-found result without calling the service layer", async () => {
    const result = await updateRequestStatusAction(
      "en",
      INVALID_REQUEST_ID,
      null,
      makeFormData("active"),
    )

    expect(result).toEqual({ ok: false, error: "requestStatusUpdateNotFound" })
    expect(mockUpdateRequestStatusForStudio).not.toHaveBeenCalled()
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("logs an expected warning that never contains the raw requestId", async () => {
    await updateRequestStatusAction("en", INVALID_REQUEST_ID, null, makeFormData("active"))

    expect(consoleWarnSpy).toHaveBeenCalledWith("[admin] status update rejected", {
      operation: "update_request_status",
      reason: "invalid_request_id",
    })
    const loggedArgs = consoleWarnSpy.mock.calls.flat().map((arg) => JSON.stringify(arg))
    expect(loggedArgs.join(" ")).not.toContain("not-a-uuid")
  })

  it("rejects a malformed UUID-like value before the status check", async () => {
    const result = await updateRequestStatusAction(
      "en",
      "f47ac10b-58cc-4372-a567-0e02b2c3d47", // one char short
      null,
      makeFormData("definitely-not-a-status"),
    )

    expect(result).toEqual({ ok: false, error: "requestStatusUpdateNotFound" })
    expect(mockUpdateRequestStatusForStudio).not.toHaveBeenCalled()
  })
})

// ── valid requestId (guard does not over-reject) ───────────────────────────

describe("updateRequestStatusAction — valid requestId", () => {
  it("passes a valid UUID through to the service layer and succeeds", async () => {
    const result = await updateRequestStatusAction("en", REQUEST_ID, null, makeFormData("active"))

    expect(result).toEqual({ ok: true })
    expect(mockUpdateRequestStatusForStudio).toHaveBeenCalledWith(STUDIO_ID, REQUEST_ID, "active")
  })
})
