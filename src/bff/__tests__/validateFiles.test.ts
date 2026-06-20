import { describe, it, expect } from "vitest"
import { API_ERROR_CODES, REQUEST_FIELDS } from "../request"
import { validateFiles } from "../validateFiles"

const MB = 1024 * 1024

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes)
  return new File([content], name, { type })
}

const validJpeg = () => makeFile("photo.jpg", "image/jpeg", 1 * MB)
const validPng = () => makeFile("photo.png", "image/png", 1 * MB)
const validWebp = () => makeFile("photo.webp", "image/webp", 1 * MB)
const validHeic = () => makeFile("photo.heic", "image/heic", 1 * MB)
const validHeif = () => makeFile("photo.heif", "image/heif", 1 * MB)

describe("validateFiles", () => {
  it("passes with all allowed mime types", () => {
    for (const file of [validJpeg(), validPng(), validWebp(), validHeic(), validHeif()]) {
      const result = validateFiles({
        referenceImages: [file],
        placementImages: [validJpeg()],
      })
      expect(result.ok).toBe(true)
    }
  })

  it("returns file_type_invalid for disallowed mime type on referenceImages", () => {
    const result = validateFiles({
      referenceImages: [makeFile("doc.pdf", "application/pdf", 1 * MB)],
      placementImages: [validJpeg()],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[REQUEST_FIELDS.referenceImages]).toEqual(["file_type_invalid"])
      expect(result.error.fieldErrors[REQUEST_FIELDS.placementImages]).toBeUndefined()
    }
  })

  it("returns file_type_invalid for disallowed mime type on placementImages", () => {
    const result = validateFiles({
      referenceImages: [validJpeg()],
      placementImages: [makeFile("virus.exe", "application/octet-stream", 1 * MB)],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[REQUEST_FIELDS.placementImages]).toEqual(["file_type_invalid"])
      expect(result.error.fieldErrors[REQUEST_FIELDS.referenceImages]).toBeUndefined()
    }
  })

  it("returns file_too_large when a file exceeds 10 MB", () => {
    const result = validateFiles({
      referenceImages: [makeFile("huge.jpg", "image/jpeg", 11 * MB)],
      placementImages: [validJpeg()],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[REQUEST_FIELDS.referenceImages]).toEqual(["file_too_large"])
    }
  })

  it("reports error on the first invalid file in a field, stops checking further files", () => {
    const result = validateFiles({
      referenceImages: [
        makeFile("bad.gif", "image/gif", 1 * MB),
        makeFile("also-bad.pdf", "application/pdf", 1 * MB),
      ],
      placementImages: [validJpeg()],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[REQUEST_FIELDS.referenceImages]).toEqual(["file_type_invalid"])
    }
  })

  it("reports errors on both fields when both have invalid files", () => {
    const result = validateFiles({
      referenceImages: [makeFile("bad.pdf", "application/pdf", 1 * MB)],
      placementImages: [makeFile("huge.jpg", "image/jpeg", 15 * MB)],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.fieldErrors[REQUEST_FIELDS.referenceImages]).toEqual(["file_type_invalid"])
      expect(result.error.fieldErrors[REQUEST_FIELDS.placementImages]).toEqual(["file_too_large"])
    }
  })

  it("passes when file size is exactly 10 MB", () => {
    const result = validateFiles({
      referenceImages: [makeFile("exact.jpg", "image/jpeg", 10 * MB)],
      placementImages: [validJpeg()],
    })
    expect(result.ok).toBe(true)
  })

  it("passes with empty file arrays", () => {
    const result = validateFiles({
      referenceImages: [],
      placementImages: [],
    })
    expect(result.ok).toBe(true)
  })

  it("uses VALIDATION_ERROR code and empty formErrors on failure", () => {
    const result = validateFiles({
      referenceImages: [makeFile("bad.pdf", "application/pdf", 1 * MB)],
      placementImages: [],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR)
      expect(result.error.formErrors).toEqual([])
    }
  })
})
