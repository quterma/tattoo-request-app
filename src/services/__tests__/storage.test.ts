import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRemove = vi.fn()
const mockUpload = vi.fn()
const mockCreateSignedUrl = vi.fn()
const mockList = vi.fn()

vi.mock("../supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        createSignedUrl: mockCreateSignedUrl,
        list: mockList,
      })),
    },
  },
}))

import {
  BUCKET,
  countObjectsForSubmission,
  createSignedRequestFileUrl,
  uploadRequestFile,
} from "../storage"

const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
const CLIENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
const MB = 1024 * 1024

function makeFile(name: string, type = "image/jpeg", size = 1 * MB): File {
  return new File([new Uint8Array(size)], name, { type })
}

const UUID_NAME = /[0-9a-f-]{36}\.\w+$/i

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe("uploadRequestFile", () => {
  it("uploads one file and returns a typed record under the category prefix", async () => {
    mockUpload.mockResolvedValue({ error: null })

    const result = await uploadRequestFile(
      makeFile("ref.jpg"),
      "artist_work",
      STUDIO_ID,
      CLIENT_ID,
    )

    expect(result).toMatchObject({
      originalName: "ref.jpg",
      mimeType: "image/jpeg",
      type: "artist_work",
    })
    expect(result.storagePath.startsWith(`${STUDIO_ID}/${CLIENT_ID}/artist_work/`)).toBe(true)
    expect(result.storagePath).toMatch(UUID_NAME)
  })

  it("derives the storage extension from MIME type, not the original filename", async () => {
    mockUpload.mockResolvedValue({ error: null })

    const result = await uploadRequestFile(
      makeFile("photo.jpg", "image/webp"),
      "inspiration",
      STUDIO_ID,
      CLIENT_ID,
    )

    expect(result.storagePath.endsWith(".webp")).toBe(true)
    expect(result.originalName).toBe("photo.jpg")
  })

  it("uses a non-deterministic filename (no positional index) so concurrent uploads never collide", async () => {
    mockUpload.mockResolvedValue({ error: null })

    const a = await uploadRequestFile(makeFile("x.jpg"), "artist_work", STUDIO_ID, CLIENT_ID)
    const b = await uploadRequestFile(makeFile("x.jpg"), "artist_work", STUDIO_ID, CLIENT_ID)

    expect(a.storagePath).not.toBe(b.storagePath)
  })

  it("retries on a transient error and succeeds", async () => {
    vi.useFakeTimers()
    mockUpload
      .mockResolvedValueOnce({ error: { message: "network error" } })
      .mockResolvedValueOnce({ error: null })

    const promise = uploadRequestFile(makeFile("ref.jpg"), "artist_work", STUDIO_ID, CLIENT_ID)
    await vi.runAllTimersAsync()
    await promise

    expect(mockUpload).toHaveBeenCalledTimes(2)
  })

  it("retries up to MAX_RETRIES on transient errors, then throws", async () => {
    vi.useFakeTimers()
    mockUpload.mockResolvedValue({ error: { message: "timeout error" } })

    const rejectPromise = expect(
      uploadRequestFile(makeFile("ref.jpg"), "artist_work", STUDIO_ID, CLIENT_ID),
    ).rejects.toThrow()
    await vi.runAllTimersAsync()
    await rejectPromise

    expect(mockUpload).toHaveBeenCalledTimes(3)
  })

  it("does not retry non-transient errors", async () => {
    mockUpload.mockResolvedValue({ error: { message: "The object already exists" } })

    await expect(
      uploadRequestFile(makeFile("ref.jpg"), "artist_work", STUDIO_ID, CLIENT_ID),
    ).rejects.toThrow()

    expect(mockUpload).toHaveBeenCalledTimes(1)
  })
})

describe("countObjectsForSubmission", () => {
  it("sums object counts across all category prefixes", async () => {
    mockList
      .mockResolvedValueOnce({ data: [{}, {}], error: null }) // artist_work
      .mockResolvedValueOnce({ data: [{}], error: null }) // inspiration
      .mockResolvedValueOnce({ data: [], error: null }) // placement_photo

    const total = await countObjectsForSubmission(STUDIO_ID, CLIENT_ID)
    expect(total).toBe(3)
  })

  it("throws when a Storage list call errors", async () => {
    mockList.mockResolvedValue({ data: null, error: { message: "boom" } })
    await expect(countObjectsForSubmission(STUDIO_ID, CLIENT_ID)).rejects.toThrow("Storage list failed")
  })
})

describe("createSignedRequestFileUrl", () => {
  const STORAGE_PATH = `${STUDIO_ID}/${CLIENT_ID}/artist_work/abc.jpg`

  it("calls createSignedUrl with the path and 3600s expiry", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/abc.jpg" },
      error: null,
    })
    await createSignedRequestFileUrl(STORAGE_PATH)
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(STORAGE_PATH, 3600)
  })

  it("uses the request-images bucket", async () => {
    const { supabase } = await import("../supabase")
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/abc.jpg" },
      error: null,
    })
    await createSignedRequestFileUrl(STORAGE_PATH)
    expect(supabase.storage.from).toHaveBeenCalledWith(BUCKET)
  })

  it("returns the signed URL", async () => {
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example/abc.jpg" },
      error: null,
    })
    expect(await createSignedRequestFileUrl(STORAGE_PATH)).toBe("https://signed.example/abc.jpg")
  })

  it("throws with the supabase error message when signing fails", async () => {
    mockCreateSignedUrl.mockResolvedValue({ data: null, error: { message: "Object not found" } })
    await expect(createSignedRequestFileUrl(STORAGE_PATH)).rejects.toThrow("Object not found")
  })
})
