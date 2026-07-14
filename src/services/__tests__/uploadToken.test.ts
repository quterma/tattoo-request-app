import { describe, it, expect, vi } from "vitest"

// A fixed 32-byte base64 key so tests are deterministic. Must live inside vi.hoisted:
// vi.mock is hoisted above normal imports/consts, so a plain top-level const would not
// yet be initialized when the mock factory runs.
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

import {
  isUploadHandleExpired,
  mintUploadHandle,
  readUploadHandle,
  UPLOAD_HANDLE_TTL_SECONDS,
} from "../uploadToken"
import type { UploadTokenPayload } from "../uploadToken"

const STUDIO = "2617c7d8-23bb-4269-ab2e-fd104c3d12b8"
const CSID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"

function payload(overrides: Partial<UploadTokenPayload> = {}): UploadTokenPayload {
  return {
    csid: CSID,
    cat: "artist_work",
    path: `${STUDIO}/${CSID}/artist_work/abc.jpg`,
    originalName: "photo.jpg",
    mimeType: "image/jpeg",
    size: 12345,
    iat: Math.floor(Date.now() / 1000),
    ...overrides,
  }
}

describe("uploadToken", () => {
  it("round-trips a payload through mint → read", () => {
    const p = payload()
    const handle = mintUploadHandle(p)
    expect(readUploadHandle(handle)).toEqual(p)
  })

  it("produces a different handle for the same payload each time (random IV)", () => {
    const p = payload()
    expect(mintUploadHandle(p)).not.toBe(mintUploadHandle(p))
  })

  it("the handle bytes do not contain the plaintext storage path", () => {
    const p = payload()
    const handle = mintUploadHandle(p)
    const raw = Buffer.from(handle, "base64url").toString("latin1")
    // The studio id and category folder must not appear in cleartext.
    expect(raw).not.toContain(STUDIO)
    expect(raw).not.toContain("artist_work")
  })

  it("returns null for a tampered handle (flipped byte fails the auth tag)", () => {
    const raw = Buffer.from(mintUploadHandle(payload()), "base64url")
    raw[raw.length - 1] ^= 0xff // corrupt the auth tag
    expect(readUploadHandle(raw.toString("base64url"))).toBeNull()
  })

  it("returns null for garbage input", () => {
    expect(readUploadHandle("not-a-real-handle")).toBeNull()
    expect(readUploadHandle("")).toBeNull()
    expect(readUploadHandle(Buffer.from("short").toString("base64url"))).toBeNull()
  })

  it("flags an expired handle by iat", () => {
    const old = payload({ iat: Math.floor(Date.now() / 1000) - UPLOAD_HANDLE_TTL_SECONDS - 1 })
    expect(isUploadHandleExpired(old)).toBe(true)
    expect(isUploadHandleExpired(payload())).toBe(false)
  })
})
