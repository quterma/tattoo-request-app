import { describe, it, expect, vi, beforeEach } from "vitest"

// ── hoisted mocks ──────────────────────────────────────────────────────────

const {
  mockParseRequestFormData,
  mockValidateRequestPayload,
  mockAdoptUploadHandles,
  mockCheckRateLimit,
  mockCreateRequest,
  mockGetRequestByClientSubmissionId,
  mockCleanupRequestFiles,
} = vi.hoisted(() => ({
  mockParseRequestFormData: vi.fn(),
  mockValidateRequestPayload: vi.fn(),
  mockAdoptUploadHandles: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCreateRequest: vi.fn(),
  mockGetRequestByClientSubmissionId: vi.fn(),
  mockCleanupRequestFiles: vi.fn(),
}))

vi.mock("@/bff", () => ({
  ClientSubmissionIdError: class ClientSubmissionIdError extends Error {
    constructor(msg: string) {
      super(msg)
      this.name = "ClientSubmissionIdError"
    }
  },
  parseRequestFormData: mockParseRequestFormData,
  validateRequestPayload: mockValidateRequestPayload,
  adoptUploadHandles: mockAdoptUploadHandles,
  checkRateLimit: mockCheckRateLimit,
  clientIpFromHeaders: () => "1.2.3.4",
}))

vi.mock("@/services", () => ({
  createRequest: mockCreateRequest,
  getRequestByClientSubmissionId: mockGetRequestByClientSubmissionId,
  cleanupRequestFiles: mockCleanupRequestFiles,
}))

vi.mock("@/config/env", () => ({
  config: {
    app: { deploymentStudioId: "a1b2c3d4-0000-4000-8000-000000000001" },
  },
}))

// ── helpers ────────────────────────────────────────────────────────────────

import { POST } from "../route"

const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
const CLIENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"

const basePayload = {
  clientSubmissionId: CLIENT_ID,
  clientName: "Alex",
  ideaDescription: "A wolf",
  placement: "forearm",
  size: "medium",
  color: "black-and-grey",
  budget: undefined,
  contactMethod: "email",
  contactValue: "client@example.com",
  eligibility: true as const,
  uploadHandles: ["handle-a"],
}

const adoptedFiles = [
  {
    type: "artist_work" as const,
    storagePath: `${STUDIO_ID}/${CLIENT_ID}/artist_work/abc.jpg`,
    originalName: "ref.jpg",
    mimeType: "image/jpeg",
    size: 512000,
  },
]

function makeRequest(formData: FormData = new FormData()): Request {
  return {
    headers: new Headers(),
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as Request
}

async function callPost(formData?: FormData): Promise<{ status: number; body: unknown }> {
  const res = await POST(makeRequest(formData))
  const body = await res.json()
  return { status: res.status, body }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 })
  mockParseRequestFormData.mockReturnValue(basePayload)
  mockValidateRequestPayload.mockReturnValue({ ok: true, data: basePayload })
  mockAdoptUploadHandles.mockReturnValue({ ok: true, files: adoptedFiles })
  mockGetRequestByClientSubmissionId.mockResolvedValue(null)
  mockCreateRequest.mockResolvedValue({ id: "db-uuid", referenceCode: "REQ-2026-0001" })
  mockCleanupRequestFiles.mockResolvedValue(undefined)
})

// ── normal flow ────────────────────────────────────────────────────────────

describe("POST /api/request — normal flow", () => {
  it("returns { ok: true, referenceCode } on successful creation", async () => {
    const { status, body } = await callPost()
    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0001" })
  })

  it("adopts upload handles before createRequest", async () => {
    await callPost()
    expect(mockAdoptUploadHandles).toHaveBeenCalledBefore(mockCreateRequest as never)
  })

  it("passes the submitted clientSubmissionId and studioId to adoptUploadHandles", async () => {
    await callPost()
    expect(mockAdoptUploadHandles).toHaveBeenCalledWith(["handle-a"], CLIENT_ID, STUDIO_ID)
  })

  it("passes adopted files to createRequest", async () => {
    await callPost()
    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({ studioId: STUDIO_ID, files: adoptedFiles }),
    )
  })

  // REGRESSION GUARD: the wire/field name is `eligibility`, but it persists into the legacy
  // `consent` boolean column (no migration). This is the only seam where the new contract
  // intentionally renames before the unchanged RPC/DB contract — assert the bridge holds.
  it("maps eligibility to the legacy consent column on createRequest", async () => {
    await callPost()
    expect(mockCreateRequest).toHaveBeenCalledWith(expect.objectContaining({ consent: true }))
  })

  // The schema holds contactValue AS ENTERED (FS §3.4's Success echo needs it); the route is
  // where it becomes the stored form. Persisting the raw value would break click-to-WhatsApp.
  it.each([
    ["whatsapp", "054-555-5555", "+972545555555"],
    ["phone", "+972 54 555 5555", "+972545555555"],
    ["instagram", "@masha.tattoo", "masha.tattoo"],
    ["telegram", "@masha_tattoo", "masha_tattoo"],
    ["email", " client@example.com ", "client@example.com"],
  ])("normalizes a %s value before persisting it", async (contactMethod, raw, normalized) => {
    const payload = { ...basePayload, contactMethod, contactValue: raw }
    mockParseRequestFormData.mockReturnValue(payload)
    mockValidateRequestPayload.mockReturnValue({ ok: true, data: payload })

    await callPost()

    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({ contact: { method: contactMethod, value: normalized } }),
    )
  })

  it("succeeds with zero uploads (uploads are optional)", async () => {
    mockParseRequestFormData.mockReturnValue({ ...basePayload, uploadHandles: [] })
    mockValidateRequestPayload.mockReturnValue({
      ok: true,
      data: { ...basePayload, uploadHandles: [] },
    })
    mockAdoptUploadHandles.mockReturnValue({ ok: true, files: [] })

    const { status } = await callPost()
    expect(status).toBe(200)
    expect(mockCreateRequest).toHaveBeenCalledWith(expect.objectContaining({ files: [] }))
  })
})

// ── rate limiting ────────────────────────────────────────────────────────────

describe("POST /api/request — rate limiting", () => {
  it("returns 429 and does not create a request when over the limit", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 30 })
    const { status } = await callPost()
    expect(status).toBe(429)
    expect(mockCreateRequest).not.toHaveBeenCalled()
  })
})

// ── adoption failures ────────────────────────────────────────────────────────

describe("POST /api/request — upload adoption", () => {
  it("returns 400 and never creates a request when a handle is invalid", async () => {
    mockAdoptUploadHandles.mockReturnValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors: { uploadHandles: ["upload_invalid"] }, formErrors: [] },
    })
    const { status } = await callPost()
    expect(status).toBe(400)
    expect(mockCreateRequest).not.toHaveBeenCalled()
  })
})

// ── idempotency — replay ───────────────────────────────────────────────────

describe("POST /api/request — idempotent replay", () => {
  it("returns existing referenceCode and does not create when clientSubmissionId exists", async () => {
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0042")
    const { status, body } = await callPost()
    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0042" })
    expect(mockCreateRequest).not.toHaveBeenCalled()
  })

  // REGRESSION GUARD: the idempotency lookup must run BEFORE handle adoption. A submit that
  // succeeded but whose response was lost is retried later — possibly past the handles' TTL.
  // Adopting first would 400 that replay instead of returning its reference code, breaking
  // the very guarantee this route exists to provide. An already-persisted request needs no
  // adoption: its request_files rows are already written, so nothing new is persisted and the
  // ownership property is not at stake.
  it("replays successfully even when the handles have since expired (adoption is not reached)", async () => {
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0042")
    mockAdoptUploadHandles.mockReturnValue({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { uploadHandles: ["upload_expired"] },
        formErrors: [],
      },
    })

    const { status, body } = await callPost()

    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0042" })
    expect(mockAdoptUploadHandles).not.toHaveBeenCalled()
  })
})

// ── race-condition fallback ────────────────────────────────────────────────

describe("POST /api/request — race-condition fallback", () => {
  it("recovers the existing referenceCode on a UNIQUE violation WITHOUT deleting files", async () => {
    mockCreateRequest.mockRejectedValue(
      new Error("DB insert failed: duplicate key value violates unique constraint"),
    )
    mockGetRequestByClientSubmissionId
      .mockResolvedValueOnce(null) // initial idempotency lookup
      .mockResolvedValueOnce("REQ-2026-0007") // race recovery lookup

    const { status, body } = await callPost()

    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0007" })
    // REGRESSION GUARD: the winning request's request_files rows point at these same
    // storage paths — deleting them here would destroy the winner's live files.
    expect(mockCleanupRequestFiles).not.toHaveBeenCalled()
  })

  it("returns 500 on a UNIQUE violation when recovery finds nothing, still no cleanup", async () => {
    mockCreateRequest.mockRejectedValue(
      new Error("DB insert failed: duplicate key value violates unique constraint"),
    )
    mockGetRequestByClientSubmissionId.mockResolvedValueOnce(null).mockResolvedValueOnce(null)

    const { status } = await callPost()
    expect(status).toBe(500)
    expect(mockCleanupRequestFiles).not.toHaveBeenCalled()
  })

  it("returns 500 on a generic DB failure WITHOUT deleting files (retry needs them)", async () => {
    mockCreateRequest.mockRejectedValue(new Error("DB insert failed: connection timeout"))

    const { status } = await callPost()
    expect(status).toBe(500)
    expect(mockGetRequestByClientSubmissionId).toHaveBeenCalledTimes(1)
    expect(mockCleanupRequestFiles).not.toHaveBeenCalled()
  })
})

// ── honeypot ────────────────────────────────────────────────────────────────

describe("POST /api/request — honeypot", () => {
  it("returns a benign, real-shaped success and never persists when the honeypot is filled", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const fd = new FormData()
    fd.append("website", "http://spam.example")

    const { status, body } = await callPost(fd)

    expect(status).toBe(200)
    // Real-shaped 6-char code from the ambiguity-free alphabet (no I/O/0/1) — indistinguishable
    // from a genuine reference code, so a bot gets no signal it was caught.
    expect(body).toMatchObject({ ok: true })
    const code = (body as { referenceCode: string }).referenceCode
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    // Nothing reaches parsing/adoption/DB — so the same clientSubmissionId can still submit later.
    expect(mockParseRequestFormData).not.toHaveBeenCalled()
    expect(mockAdoptUploadHandles).not.toHaveBeenCalled()
    expect(mockCreateRequest).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith("[route] honeypot filled: reason=honeypot")

    warnSpy.mockRestore()
  })

  it("treats a whitespace-only honeypot value as empty (normal flow proceeds)", async () => {
    const fd = new FormData()
    fd.append("website", "   ")

    const { status } = await callPost(fd)

    expect(status).toBe(200)
    expect(mockCreateRequest).toHaveBeenCalled()
  })

  it("proceeds normally when the honeypot field is absent/empty", async () => {
    const { status } = await callPost()
    expect(status).toBe(200)
    expect(mockCreateRequest).toHaveBeenCalled()
  })
})

// ── validation errors ──────────────────────────────────────────────────────

describe("POST /api/request — validation", () => {
  it("returns 400 on payload validation failure, without adopting or creating", async () => {
    mockValidateRequestPayload.mockReturnValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors: {}, formErrors: [] },
    })
    const { status } = await callPost()
    expect(status).toBe(400)
    expect(mockAdoptUploadHandles).not.toHaveBeenCalled()
    expect(mockCreateRequest).not.toHaveBeenCalled()
  })
})

// ── unexpected failures (outer catch) ──────────────────────────────────────

describe("POST /api/request — unexpected submit failure", () => {
  it("returns a generic 500 and logs only the error message, never the payload", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockParseRequestFormData.mockImplementation(() => {
      throw new Error("parse exploded")
    })

    const { status, body } = await callPost()

    expect(status).toBe(500)
    expect(body).toEqual({ ok: false, error: { code: "SERVER_ERROR" } })
    expect(consoleErrorSpy).toHaveBeenCalledWith("[route] unexpected submit failure:", "parse exploded")

    consoleErrorSpy.mockRestore()
  })
})
