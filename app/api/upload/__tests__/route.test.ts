import { describe, it, expect, vi, beforeEach } from "vitest"

const {
  mockValidateSingleFile,
  mockCheckRateLimit,
  mockCheckUploadQuota,
  mockCountObjects,
  mockUploadRequestFile,
  mockMintUploadHandle,
} = vi.hoisted(() => ({
  mockValidateSingleFile: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockCheckUploadQuota: vi.fn(),
  mockCountObjects: vi.fn(),
  mockUploadRequestFile: vi.fn(),
  mockMintUploadHandle: vi.fn(),
}))

vi.mock("@/bff", () => ({
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  validateSingleFile: mockValidateSingleFile,
  checkRateLimit: mockCheckRateLimit,
  checkUploadQuota: mockCheckUploadQuota,
  clientIpFromHeaders: () => "1.2.3.4",
}))

vi.mock("@/services", () => ({
  countObjectsForSubmission: mockCountObjects,
  uploadRequestFile: mockUploadRequestFile,
  mintUploadHandle: mockMintUploadHandle,
}))

vi.mock("@/config", () => ({
  config: { app: { deploymentStudioId: "2617c7d8-23bb-4269-ab2e-fd104c3d12b8" } },
}))

import { POST } from "../route"

const STUDIO = "2617c7d8-23bb-4269-ab2e-fd104c3d12b8"
const CSID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"

function jpeg(sizeBytes = 1024): File {
  const bytes = new Uint8Array(sizeBytes)
  bytes.set([0xff, 0xd8, 0xff, 0xe0], 0)
  return new File([bytes], "photo.jpg", { type: "image/jpeg" })
}

function makeReq(
  parts: { clientSubmissionId?: string; category?: string; file?: File },
  headers: Record<string, string> = {},
): Request {
  const fd = new FormData()
  if (parts.clientSubmissionId !== undefined)
    fd.append("clientSubmissionId", parts.clientSubmissionId)
  if (parts.category !== undefined) fd.append("category", parts.category)
  if (parts.file !== undefined) fd.append("file", parts.file)
  return {
    headers: new Headers(headers),
    formData: vi.fn().mockResolvedValue(fd),
  } as unknown as Request
}

async function call(req: Request) {
  const res = await POST(req)
  return { status: res.status, body: await res.json() }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCheckUploadQuota.mockResolvedValue({ ok: true, kind: "allowed" })
  mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 })
  mockValidateSingleFile.mockResolvedValue({ ok: true })
  mockCountObjects.mockResolvedValue(0)
  mockUploadRequestFile.mockResolvedValue({
    storagePath: `${STUDIO}/${CSID}/artist_work/abc.jpg`,
    originalName: "photo.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    type: "artist_work",
  })
  mockMintUploadHandle.mockReturnValue("opaque-handle")
})

describe("POST /api/upload", () => {
  it("uploads a valid file and returns an opaque handle", async () => {
    const { status, body } = await call(
      makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() }),
    )
    expect(status).toBe(200)
    expect(body).toEqual({ ok: true, handle: "opaque-handle" })
    expect(mockUploadRequestFile).toHaveBeenCalledWith(
      expect.any(File),
      "artist_work",
      STUDIO,
      CSID,
    )
  })

  it("returns 429 from the durable quota, before formData(), without touching storage", async () => {
    mockCheckUploadQuota.mockResolvedValue({ ok: false, kind: "quota", retryAfterSeconds: 3600 })
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const req = makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() })

    const res = await POST(req)

    expect(res.status).toBe(429)
    expect(res.headers.get("Retry-After")).toBe("3600")
    // Durable check runs FIRST — the body is never even parsed, and nothing is written.
    expect(req.formData).not.toHaveBeenCalled()
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("category=upload"))
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("reason=quota"))
    warnSpy.mockRestore()
  })

  it("fails CLOSED with 503 and no storage write when the quota store is unavailable", async () => {
    mockCheckUploadQuota.mockResolvedValue({ ok: false, kind: "unavailable" })
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const req = makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() })

    const res = await POST(req)

    expect(res.status).toBe(503)
    // No fallback to the in-memory limiter, no body parse, no write.
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(req.formData).not.toHaveBeenCalled()
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("category=upload"))
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("reason=unavailable"))
    warnSpy.mockRestore()
  })

  it("returns 429 from the in-memory burst shield after the durable quota admitted", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 42 })
    const { status } = await call(
      makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() }),
    )
    expect(status).toBe(429)
    expect(mockCheckUploadQuota).toHaveBeenCalled()
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
  })

  it("rejects an oversized Content-Length before buffering the body", async () => {
    const req = makeReq(
      { clientSubmissionId: CSID, category: "artist_work", file: jpeg() },
      { "content-length": String(50 * 1024 * 1024) },
    )
    const { status } = await call(req)
    expect(status).toBe(400)
    expect(req.formData).not.toHaveBeenCalled()
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
  })

  it("rejects an invalid clientSubmissionId", async () => {
    const { status } = await call(
      makeReq({ clientSubmissionId: "not-a-uuid", category: "artist_work", file: jpeg() }),
    )
    expect(status).toBe(400)
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
  })

  it("returns 400 and does not upload when validation fails", async () => {
    mockValidateSingleFile.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", fieldErrors: {}, formErrors: ["file"] },
    })
    const { status } = await call(
      makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() }),
    )
    expect(status).toBe(400)
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
  })

  it("rejects when the per-session object cap is reached, without uploading", async () => {
    mockCountObjects.mockResolvedValue(12)
    const { status } = await call(
      makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() }),
    )
    expect(status).toBe(400)
    expect(mockUploadRequestFile).not.toHaveBeenCalled()
  })

  it("never logs the storage path or the handle", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    await call(makeReq({ clientSubmissionId: CSID, category: "artist_work", file: jpeg() }))
    const logged = [...logSpy.mock.calls, ...errSpy.mock.calls].flat().map(String).join(" ")
    expect(logged).not.toContain("abc.jpg")
    expect(logged).not.toContain("opaque-handle")
    logSpy.mockRestore()
    errSpy.mockRestore()
  })
})
