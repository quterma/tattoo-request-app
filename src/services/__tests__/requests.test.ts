import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockGetRequestForStudio, mockCreateSignedRequestFileUrl } = vi.hoisted(() => ({
  mockGetRequestForStudio: vi.fn(),
  mockCreateSignedRequestFileUrl: vi.fn(),
}))

vi.mock("../db", () => ({
  getRequestForStudio: mockGetRequestForStudio,
}))

vi.mock("../storage", () => ({
  createSignedRequestFileUrl: mockCreateSignedRequestFileUrl,
}))

import { getAdminRequestDetail } from "../requests"

const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
const REQUEST_ID = "req-uuid-1"
const STORAGE_PATH = `${STUDIO_ID}/sub-id/artist_work/abc.jpg`

const baseDbDetail = {
  id: REQUEST_ID,
  referenceCode: "REQ-2026-0001",
  clientName: "Alex",
  description: "A wolf on my forearm",
  placement: "forearm",
  size: "medium",
  color: "black",
  budget: "500-800",
  email: "alex@example.com",
  phone: null,
  contactOther: null,
  consent: true,
  status: "new" as const,
  createdAt: "2026-07-01T10:00:00.000Z",
  files: [
    {
      id: "file-uuid-1",
      storagePath: STORAGE_PATH,
      originalName: "ref.jpg",
      type: "artist_work",
      mimeType: "image/jpeg",
      size: 512000,
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getAdminRequestDetail", () => {
  it("returns null when the DB detail lookup returns null", async () => {
    mockGetRequestForStudio.mockResolvedValue(null)

    const result = await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(result).toBeNull()
    expect(mockCreateSignedRequestFileUrl).not.toHaveBeenCalled()
  })

  it("calls getRequestForStudio with studioId and requestId", async () => {
    mockGetRequestForStudio.mockResolvedValue({ ...baseDbDetail, files: [] })

    await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(mockGetRequestForStudio).toHaveBeenCalledWith(STUDIO_ID, REQUEST_ID)
  })

  it("returns all files as available when all signings succeed", async () => {
    mockGetRequestForStudio.mockResolvedValue(baseDbDetail)
    mockCreateSignedRequestFileUrl.mockResolvedValue("https://signed.example/reference-01.jpg")

    const result = await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(result?.files).toEqual([
      {
        status: "available",
        id: "file-uuid-1",
        originalName: "ref.jpg",
        type: "artist_work",
        signedUrl: "https://signed.example/reference-01.jpg",
      },
    ])
  })

  it("marks only the failing file unavailable when one of several fails", async () => {
    mockGetRequestForStudio.mockResolvedValue({
      ...baseDbDetail,
      files: [
        { ...baseDbDetail.files[0], id: "file-ok", storagePath: "path/ok.jpg" },
        { ...baseDbDetail.files[0], id: "file-fail", storagePath: "path/fail.jpg" },
      ],
    })
    mockCreateSignedRequestFileUrl.mockImplementation(async (path: string) => {
      if (path === "path/fail.jpg") throw new Error("Object not found")
      return "https://signed.example/ok.jpg"
    })

    const result = await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(result?.files).toEqual([
      {
        status: "available",
        id: "file-ok",
        originalName: "ref.jpg",
        type: "artist_work",
        signedUrl: "https://signed.example/ok.jpg",
      },
      { status: "unavailable", id: "file-fail", originalName: "ref.jpg", type: "artist_work" },
    ])
  })

  it("does not reject the whole detail result when a file signing fails", async () => {
    mockGetRequestForStudio.mockResolvedValue(baseDbDetail)
    mockCreateSignedRequestFileUrl.mockRejectedValue(new Error("Object not found"))

    await expect(getAdminRequestDetail(STUDIO_ID, REQUEST_ID)).resolves.not.toThrow()
  })

  it("logs a safe reason and fileId on signing failure, never the storagePath", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})
    mockGetRequestForStudio.mockResolvedValue(baseDbDetail)
    mockCreateSignedRequestFileUrl.mockRejectedValue(new Error("Object not found"))

    await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(consoleWarn).toHaveBeenCalledWith("[requests] file signing failed", {
      fileId: "file-uuid-1",
      reason: "not_found",
    })

    const loggedCalls = consoleWarn.mock.calls.flat()
    for (const arg of loggedCalls) {
      expect(JSON.stringify(arg)).not.toContain(STORAGE_PATH)
    }

    consoleWarn.mockRestore()
  })

  it.each([
    ["Object not found", "not_found"],
    ["permission denied for bucket", "permission_denied"],
    ["unauthorized request", "permission_denied"],
    ["unexpected network failure", "unknown"],
  ] as const)("classifies signing error '%s' as reason '%s'", async (message, reason) => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})
    mockGetRequestForStudio.mockResolvedValue(baseDbDetail)
    mockCreateSignedRequestFileUrl.mockRejectedValue(new Error(message))

    await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(consoleWarn).toHaveBeenCalledWith(
      "[requests] file signing failed",
      expect.objectContaining({ reason }),
    )

    consoleWarn.mockRestore()
  })

  it("never includes storagePath in the returned AdminRequestDetail", async () => {
    mockGetRequestForStudio.mockResolvedValue(baseDbDetail)
    mockCreateSignedRequestFileUrl.mockResolvedValue("https://signed.example/reference-01.jpg")

    const result = await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(JSON.stringify(result)).not.toContain("storagePath")
    expect(JSON.stringify(result)).not.toContain(STORAGE_PATH)
  })

  it("maps non-file detail fields through unchanged", async () => {
    mockGetRequestForStudio.mockResolvedValue({ ...baseDbDetail, files: [] })

    const result = await getAdminRequestDetail(STUDIO_ID, REQUEST_ID)

    expect(result).toMatchObject({
      id: REQUEST_ID,
      referenceCode: "REQ-2026-0001",
      clientName: "Alex",
      description: "A wolf on my forearm",
      placement: "forearm",
      size: "medium",
      color: "black",
      budget: "500-800",
      email: "alex@example.com",
      phone: null,
      contactOther: null,
      consent: true,
      status: "new",
      createdAt: "2026-07-01T10:00:00.000Z",
    })
  })

  it("propagates DB errors instead of swallowing them", async () => {
    mockGetRequestForStudio.mockRejectedValue(new Error("DB detail query failed: connection timeout"))

    await expect(getAdminRequestDetail(STUDIO_ID, REQUEST_ID)).rejects.toThrow(
      "DB detail query failed",
    )
  })
})
