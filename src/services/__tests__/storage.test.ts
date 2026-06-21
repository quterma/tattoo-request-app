import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRemove = vi.fn()
const mockUpload = vi.fn()

vi.mock("../supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
      })),
    },
  },
}))

import { uploadRequestFiles } from "../storage"

const CLIENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
const MB = 1024 * 1024

function makeFile(name: string, type = "image/jpeg", size = 1 * MB): File {
  return new File([new Uint8Array(size)], name, { type })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe("uploadRequestFiles", () => {
  it("uploads all files and returns typed records", async () => {
    mockUpload.mockResolvedValue({ error: null })

    const ref1 = makeFile("ref1.jpg")
    const ref2 = makeFile("ref2.png", "image/png")
    const place1 = makeFile("place1.jpg")

    const results = await uploadRequestFiles(
      { referenceImages: [ref1, ref2], placementImages: [place1] },
      CLIENT_ID,
    )

    expect(results).toHaveLength(3)

    expect(results[0]).toMatchObject({
      storagePath: `${CLIENT_ID}/reference/reference-01.jpg`,
      originalName: "ref1.jpg",
      mimeType: "image/jpeg",
      type: "reference",
    })
    expect(results[1]).toMatchObject({
      storagePath: `${CLIENT_ID}/reference/reference-02.png`,
      originalName: "ref2.png",
      mimeType: "image/png",
      type: "reference",
    })
    expect(results[2]).toMatchObject({
      storagePath: `${CLIENT_ID}/placement/placement-01.jpg`,
      originalName: "place1.jpg",
      type: "placement",
    })
  })

  it("derives storage extension from MIME type, not original filename", async () => {
    mockUpload.mockResolvedValue({ error: null })

    // filename has wrong/misleading extension — storage path must use MIME-derived ext
    const results = await uploadRequestFiles(
      {
        referenceImages: [
          makeFile("photo.jpg", "image/webp"),
          makeFile("img.jpg", "image/heic"),
          makeFile("pic.jpg", "image/heif"),
        ],
        placementImages: [makeFile("body.png", "image/jpeg")],
      },
      CLIENT_ID,
    )

    expect(results[0].storagePath).toBe(`${CLIENT_ID}/reference/reference-01.webp`)
    expect(results[0].originalName).toBe("photo.jpg")
    expect(results[1].storagePath).toBe(`${CLIENT_ID}/reference/reference-02.heic`)
    expect(results[2].storagePath).toBe(`${CLIENT_ID}/reference/reference-03.heif`)
    expect(results[3].storagePath).toBe(`${CLIENT_ID}/placement/placement-01.jpg`)
    expect(results[3].originalName).toBe("body.png")
  })

  it("returns empty array when no files provided", async () => {
    const results = await uploadRequestFiles({ referenceImages: [], placementImages: [] }, CLIENT_ID)

    expect(results).toEqual([])
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it("retries on transient error and succeeds", async () => {
    vi.useFakeTimers()

    mockUpload
      .mockResolvedValueOnce({ error: { message: "network error" } })
      .mockResolvedValueOnce({ error: null })

    const promise = uploadRequestFiles(
      { referenceImages: [makeFile("ref.jpg")], placementImages: [] },
      CLIENT_ID,
    )
    await vi.runAllTimersAsync()
    const results = await promise

    expect(mockUpload).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(1)
  })

  it("retries up to MAX_RETRIES times on transient errors, then throws", async () => {
    vi.useFakeTimers()

    mockUpload.mockResolvedValue({ error: { message: "timeout error" } })
    mockRemove.mockResolvedValue({ error: null })

    const rejectPromise = expect(
      uploadRequestFiles({ referenceImages: [makeFile("ref.jpg")], placementImages: [] }, CLIENT_ID),
    ).rejects.toThrow()

    await vi.runAllTimersAsync()
    await rejectPromise

    expect(mockUpload).toHaveBeenCalledTimes(3)
  })

  it("does not retry non-transient errors", async () => {
    mockUpload.mockResolvedValue({ error: { message: "The object already exists" } })
    mockRemove.mockResolvedValue({ error: null })

    await expect(
      uploadRequestFiles({ referenceImages: [makeFile("ref.jpg")], placementImages: [] }, CLIENT_ID),
    ).rejects.toThrow()

    expect(mockUpload).toHaveBeenCalledTimes(1)
  })

  it("cleans up already-uploaded files when a later file fails", async () => {
    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "The object already exists" } })
    mockRemove.mockResolvedValue({ error: null })

    await expect(
      uploadRequestFiles(
        { referenceImages: [makeFile("ref1.jpg"), makeFile("ref2.jpg")], placementImages: [] },
        CLIENT_ID,
      ),
    ).rejects.toThrow()

    expect(mockRemove).toHaveBeenCalledTimes(1)
    const removedPaths: string[] = mockRemove.mock.calls[0][0]
    expect(removedPaths).toHaveLength(1)
    expect(removedPaths[0]).toContain("reference-01.jpg")
  })

  it("logs cleanup failure without rethrowing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    mockUpload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "The object already exists" } })
    mockRemove.mockResolvedValue({ error: { message: "storage unavailable" } })

    await expect(
      uploadRequestFiles(
        { referenceImages: [makeFile("ref1.jpg"), makeFile("ref2.jpg")], placementImages: [] },
        CLIENT_ID,
      ),
    ).rejects.toThrow()

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("[storage] cleanup failed:"),
      "storage unavailable",
    )

    consoleError.mockRestore()
  })

  it("does not call cleanup when no files were uploaded before failure", async () => {
    mockUpload.mockResolvedValue({ error: { message: "The object already exists" } })

    await expect(
      uploadRequestFiles({ referenceImages: [makeFile("ref.jpg")], placementImages: [] }, CLIENT_ID),
    ).rejects.toThrow()

    expect(mockRemove).not.toHaveBeenCalled()
  })
})
