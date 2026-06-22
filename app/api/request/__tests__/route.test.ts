import { describe, it, expect, vi, beforeEach } from "vitest"

// ── hoisted mocks ──────────────────────────────────────────────────────────

const {
  mockParseRequestFormData,
  mockValidateRequestPayload,
  mockValidateFiles,
  mockUploadRequestFiles,
  mockCreateRequest,
  mockGetRequestByClientSubmissionId,
  mockStorageRemove,
} = vi.hoisted(() => ({
  mockParseRequestFormData: vi.fn(),
  mockValidateRequestPayload: vi.fn(),
  mockValidateFiles: vi.fn(),
  mockUploadRequestFiles: vi.fn(),
  mockCreateRequest: vi.fn(),
  mockGetRequestByClientSubmissionId: vi.fn(),
  mockStorageRemove: vi.fn(),
}))

vi.mock("@/bff", () => ({
  API_ERROR_CODES: { VALIDATION_ERROR: "VALIDATION_ERROR", SERVER_ERROR: "SERVER_ERROR" },
  ClientSubmissionIdError: class ClientSubmissionIdError extends Error {
    constructor(msg: string) {
      super(msg)
      this.name = "ClientSubmissionIdError"
    }
  },
  parseRequestFormData: mockParseRequestFormData,
  validateRequestPayload: mockValidateRequestPayload,
  validateFiles: mockValidateFiles,
}))

vi.mock("@/services", () => ({
  uploadRequestFiles: mockUploadRequestFiles,
  createRequest: mockCreateRequest,
  getRequestByClientSubmissionId: mockGetRequestByClientSubmissionId,
  supabase: {
    storage: {
      from: vi.fn(() => ({ remove: mockStorageRemove })),
    },
  },
}))

// ── helpers ────────────────────────────────────────────────────────────────

import { POST } from "../route"

const CLIENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"

const basePayload = {
  clientSubmissionId: CLIENT_ID,
  clientName: "Alex",
  ideaDescription: "A wolf",
  placement: "forearm",
  size: "medium",
  color: "blackAndGrey",
  budget: undefined,
  email: "client@example.com",
  phone: undefined,
  contactOther: undefined,
  consent: true as const,
  referenceImages: [],
  placementImages: [],
}

const uploadedFiles = [
  {
    type: "reference" as const,
    storagePath: `${CLIENT_ID}/reference/reference-01.jpg`,
    originalName: "ref.jpg",
    mimeType: "image/jpeg",
    size: 512000,
  },
]

function makeRequest(): Request {
  return { formData: vi.fn().mockResolvedValue(new FormData()) } as unknown as Request
}

async function callPost(): Promise<{ status: number; body: unknown }> {
  const res = await POST(makeRequest())
  const body = await res.json()
  return { status: res.status, body }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockParseRequestFormData.mockReturnValue(basePayload)
  mockValidateRequestPayload.mockReturnValue({ ok: true })
  mockValidateFiles.mockReturnValue({ ok: true })
  mockGetRequestByClientSubmissionId.mockResolvedValue(null)
  mockUploadRequestFiles.mockResolvedValue(uploadedFiles)
  mockCreateRequest.mockResolvedValue({ id: "db-uuid", referenceCode: "REQ-2026-0001" })
  mockStorageRemove.mockResolvedValue({ error: null })
})

// ── normal flow ────────────────────────────────────────────────────────────

describe("POST /api/request — normal flow", () => {
  it("returns { ok: true, referenceCode } on successful creation", async () => {
    const { status, body } = await callPost()

    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0001" })
  })

  it("calls uploadRequestFiles before createRequest", async () => {
    await callPost()

    expect(mockUploadRequestFiles).toHaveBeenCalledBefore(mockCreateRequest as never)
  })
})

// ── idempotency — replay ───────────────────────────────────────────────────

describe("POST /api/request — idempotent replay", () => {
  it("returns existing referenceCode when clientSubmissionId already exists", async () => {
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0042")

    const { status, body } = await callPost()

    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0042" })
  })

  it("does not call uploadRequestFiles on replay", async () => {
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0042")

    await callPost()

    expect(mockUploadRequestFiles).not.toHaveBeenCalled()
  })

  it("does not call createRequest on replay", async () => {
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0042")

    await callPost()

    expect(mockCreateRequest).not.toHaveBeenCalled()
  })

  it("response shape is identical for replay and normal success", async () => {
    // Normal success
    const { body: normalBody } = await callPost()

    // Replay
    mockGetRequestByClientSubmissionId.mockResolvedValue("REQ-2026-0001")
    const { body: replayBody } = await callPost()

    expect(Object.keys(normalBody as object).sort()).toEqual(
      Object.keys(replayBody as object).sort(),
    )
  })
})

// ── race-condition fallback ────────────────────────────────────────────────

describe("POST /api/request — race-condition fallback", () => {
  it("cleans up uploaded files, fetches existing, returns success on UNIQUE violation", async () => {
    mockCreateRequest.mockRejectedValue(
      new Error("DB insert failed: duplicate key value violates unique constraint"),
    )
    mockGetRequestByClientSubmissionId
      .mockResolvedValueOnce(null) // initial lookup → not found
      .mockResolvedValueOnce("REQ-2026-0007") // race recovery lookup

    const { status, body } = await callPost()

    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, referenceCode: "REQ-2026-0007" })
    expect(mockStorageRemove).toHaveBeenCalledTimes(1)
  })

  it("returns 500 when UNIQUE violation but subsequent lookup finds nothing", async () => {
    mockCreateRequest.mockRejectedValue(
      new Error("DB insert failed: duplicate key value violates unique constraint"),
    )
    mockGetRequestByClientSubmissionId
      .mockResolvedValueOnce(null) // initial lookup → not found
      .mockResolvedValueOnce(null) // race recovery lookup → also not found

    const { status, body } = await callPost()

    expect(status).toBe(500)
    expect(body).toMatchObject({ ok: false, error: { code: "SERVER_ERROR" } })
  })

  it("returns 500 on non-unique DB errors without race recovery attempt", async () => {
    mockCreateRequest.mockRejectedValue(new Error("DB insert failed: connection timeout"))

    const { status, body } = await callPost()

    expect(status).toBe(500)
    expect(body).toMatchObject({ ok: false, error: { code: "SERVER_ERROR" } })
    // cleanup is called for any DB failure, but getRequestByClientSubmissionId
    // should only be called once (initial idempotency check, not race recovery)
    expect(mockGetRequestByClientSubmissionId).toHaveBeenCalledTimes(1)
  })
})

// ── validation errors ──────────────────────────────────────────────────────

describe("POST /api/request — validation", () => {
  it("returns 400 on payload validation failure", async () => {
    mockValidateRequestPayload.mockReturnValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors: {}, formErrors: [] },
    })

    const { status } = await callPost()

    expect(status).toBe(400)
    expect(mockUploadRequestFiles).not.toHaveBeenCalled()
  })

  it("returns 400 on file validation failure", async () => {
    mockValidateFiles.mockReturnValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors: {}, formErrors: [] },
    })

    const { status } = await callPost()

    expect(status).toBe(400)
    expect(mockUploadRequestFiles).not.toHaveBeenCalled()
  })
})
