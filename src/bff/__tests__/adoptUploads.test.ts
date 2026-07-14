import { describe, it, expect, vi } from "vitest"

// Must live inside vi.hoisted — vi.mock is hoisted above normal top-level consts.
const { TEST_SECRET } = vi.hoisted(() => ({
  TEST_SECRET: Buffer.alloc(32, 7).toString("base64"),
}))

vi.mock("@/config", () => ({
  config: {
    upload: { tokenSecret: TEST_SECRET },
    supabase: { url: "https://example.supabase.co", secretKey: "test-secret-key" },
    app: { deploymentStudioId: "2617c7d8-23bb-4269-ab2e-fd104c3d12b8" },
  },
}))

import { mintUploadHandle } from "@/services"
import type { FileType, UploadTokenPayload } from "@/services"
import { adoptUploadHandles } from "../adoptUploads"

const STUDIO = "2617c7d8-23bb-4269-ab2e-fd104c3d12b8"
const CSID_A = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
const CSID_B = "aaaaaaaa-58cc-4372-a567-0e02b2c3d479"

function handleFor(
  csid: string,
  cat: FileType,
  suffix: string,
  overrides: Partial<UploadTokenPayload> = {},
): string {
  return mintUploadHandle({
    csid,
    cat,
    path: `${STUDIO}/${csid}/${cat}/${suffix}.jpg`,
    originalName: `${suffix}.jpg`,
    mimeType: "image/jpeg",
    size: 1000,
    iat: Math.floor(Date.now() / 1000),
    ...overrides,
  })
}

describe("adoptUploadHandles — security", () => {
  it("rejects a handle minted for a different clientSubmissionId (the ownership check)", () => {
    const handle = handleFor(CSID_B, "artist_work", "x")
    const result = adoptUploadHandles([handle], CSID_A, STUDIO)
    expect(result.ok).toBe(false)
  })

  it("rejects a tampered handle (auth-tag failure)", () => {
    const raw = Buffer.from(handleFor(CSID_A, "artist_work", "x"), "base64url")
    raw[raw.length - 1] ^= 0xff
    const result = adoptUploadHandles([raw.toString("base64url")], CSID_A, STUDIO)
    expect(result.ok).toBe(false)
  })

  it("rejects an expired handle with the upload_expired key", () => {
    const handle = handleFor(CSID_A, "artist_work", "x", {
      iat: Math.floor(Date.now() / 1000) - 3 * 60 * 60,
    })
    const result = adoptUploadHandles([handle], CSID_A, STUDIO)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.uploadHandles).toEqual(["upload_expired"])
    }
  })

  it("rejects a handle whose path prefix does not match the studio+session", () => {
    const handle = handleFor(CSID_A, "artist_work", "x", {
      path: `other-studio/${CSID_A}/artist_work/x.jpg`,
    })
    const result = adoptUploadHandles([handle], CSID_A, STUDIO)
    expect(result.ok).toBe(false)
  })

  it("rejects garbage strings without throwing", () => {
    expect(() => adoptUploadHandles(["not-a-handle", ""], CSID_A, STUDIO)).not.toThrow()
    const result = adoptUploadHandles(["not-a-handle"], CSID_A, STUDIO)
    expect(result.ok).toBe(false)
  })
})

describe("adoptUploadHandles — limits and dedupe", () => {
  it("accepts zero handles (uploads are optional)", () => {
    const result = adoptUploadHandles([], CSID_A, STUDIO)
    expect(result).toEqual({ ok: true, files: [] })
  })

  it("adopts valid handles into UploadedFile records", () => {
    const handles = [
      handleFor(CSID_A, "artist_work", "a"),
      handleFor(CSID_A, "inspiration", "b"),
      handleFor(CSID_A, "placement_photo", "c"),
    ]
    const result = adoptUploadHandles(handles, CSID_A, STUDIO)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.files).toHaveLength(3)
      expect(result.files.map((f) => f.type).sort()).toEqual([
        "artist_work",
        "inspiration",
        "placement_photo",
      ])
    }
  })

  it("rejects more than 3 handles in one category", () => {
    const handles = [
      handleFor(CSID_A, "artist_work", "a"),
      handleFor(CSID_A, "artist_work", "b"),
      handleFor(CSID_A, "artist_work", "c"),
      handleFor(CSID_A, "artist_work", "d"),
    ]
    const result = adoptUploadHandles(handles, CSID_A, STUDIO)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors.uploadHandles).toEqual(["upload_too_many"])
    }
  })

  it("rejects more than 9 total handles", () => {
    const handles = Array.from({ length: 10 }, (_, i) =>
      handleFor(CSID_A, "artist_work", `x${i}`),
    )
    const result = adoptUploadHandles(handles, CSID_A, STUDIO)
    expect(result.ok).toBe(false)
  })

  it("dedupes two identical handles to one file", () => {
    const handle = handleFor(CSID_A, "artist_work", "same")
    const result = adoptUploadHandles([handle, handle], CSID_A, STUDIO)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.files).toHaveLength(1)
  })
})
