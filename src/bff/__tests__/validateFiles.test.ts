import { describe, it, expect } from "vitest"
import { API_ERROR_CODES, UPLOAD_FIELDS } from "@/shared/api"
import { MAX_FILE_SIZE_BYTES, validateSingleFile } from "../validateFiles"

const MB = 1024 * 1024

const MAGIC: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d],
  "image/webp": [
    0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ], // RIFF....WEBP
  "image/heic": [
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
  ], // ....ftypheic
}

/** Builds a file whose leading bytes match `magicType` and total size is `sizeBytes`. */
function makeFile(
  name: string,
  declaredType: string,
  sizeBytes: number,
  magicType: string = declaredType,
): File {
  const bytes = new Uint8Array(sizeBytes)
  const head = MAGIC[magicType]
  if (head) bytes.set(head, 0)
  return new File([bytes], name, { type: declaredType })
}

const CAT = "artist_work"

describe("validateSingleFile", () => {
  it("passes with each allowed mime type and matching magic bytes", async () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/heic"]) {
      const result = await validateSingleFile(makeFile(`photo`, type, 1 * MB), CAT)
      expect(result.ok).toBe(true)
    }
  })

  it("rejects an unknown category", async () => {
    const result = await validateSingleFile(makeFile("photo.jpg", "image/jpeg", 1 * MB), "nope")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[UPLOAD_FIELDS.category]).toEqual(["upload_type_invalid"])
    }
  })

  it("rejects a disallowed mime type", async () => {
    const result = await validateSingleFile(
      makeFile("doc.pdf", "application/pdf", 1 * MB),
      CAT,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[UPLOAD_FIELDS.file]).toEqual(["upload_type_invalid"])
    }
  })

  // Asserted against the constant, not a hardcoded number: the ceiling is bounded by the
  // hosting platform (Vercel rejects bodies over 4.5 MB at the edge) and may move again.
  it("rejects a file over the size ceiling", async () => {
    const result = await validateSingleFile(
      makeFile("huge.jpg", "image/jpeg", MAX_FILE_SIZE_BYTES + 1),
      CAT,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[UPLOAD_FIELDS.file]).toEqual(["upload_too_large"])
    }
  })

  it("passes at exactly the size ceiling", async () => {
    const result = await validateSingleFile(
      makeFile("exact.jpg", "image/jpeg", MAX_FILE_SIZE_BYTES),
      CAT,
    )
    expect(result.ok).toBe(true)
  })

  it("keeps the ceiling under Vercel's 4.5 MB request-body limit", () => {
    expect(MAX_FILE_SIZE_BYTES).toBeLessThan(4.5 * MB)
  })

  it("rejects a file that lies about its type (allowed mime, wrong magic bytes)", async () => {
    // Declares image/jpeg but the bytes are a PNG header — the magic sniff catches it.
    const result = await validateSingleFile(
      makeFile("fake.jpg", "image/jpeg", 1 * MB, "image/png"),
      CAT,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[UPLOAD_FIELDS.file]).toEqual(["upload_type_invalid"])
    }
  })

  it("rejects an empty file", async () => {
    const result = await validateSingleFile(new File([], "empty.jpg", { type: "image/jpeg" }), CAT)
    expect(result.ok).toBe(false)
  })

  it("uses VALIDATION_ERROR code and empty formErrors on failure", async () => {
    const result = await validateSingleFile(
      makeFile("bad.pdf", "application/pdf", 1 * MB),
      CAT,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR)
      expect(result.error.formErrors).toEqual([])
    }
  })
})
