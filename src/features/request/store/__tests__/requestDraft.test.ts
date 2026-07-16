import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  __resetDraftStoreForTests,
  addSlot,
  getClientSubmissionId,
  getFields,
  getSnapshot,
  invalidateUploadedSlots,
  removeSlot,
  resetDraft,
  setFields,
  updateSlot,
} from "../requestDraft"
import type { UploadSlot } from "../requestDraft"

function makeSlot(id: string): UploadSlot {
  return {
    slotId: id,
    category: "artist_work",
    file: new File(["x"], `${id}.jpg`, { type: "image/jpeg" }),
    fileName: `${id}.jpg`,
    previewUrl: `blob:${id}`,
    status: "uploading",
    progress: 0,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock")
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  __resetDraftStoreForTests()
})

describe("requestDraft store", () => {
  it("keeps clientSubmissionId stable across snapshots (not regenerated per read)", () => {
    const first = getClientSubmissionId()
    expect(getClientSubmissionId()).toBe(first)
    expect(getSnapshot().clientSubmissionId).toBe(first)
  })

  it("getSnapshot returns a referentially stable object when nothing changed", () => {
    const a = getSnapshot()
    const b = getSnapshot()
    expect(a).toBe(b)
  })

  it("returns a new snapshot object on mutation (React Compiler / useSyncExternalStore)", () => {
    const before = getSnapshot()
    addSlot(makeSlot("s1"))
    expect(getSnapshot()).not.toBe(before)
  })

  it("resetDraft mints a fresh clientSubmissionId and clears slots", () => {
    const original = getClientSubmissionId()
    addSlot(makeSlot("s1"))
    resetDraft()
    expect(getClientSubmissionId()).not.toBe(original)
    expect(getSnapshot().slots).toEqual([])
  })

  it("removeSlot revokes the object URL", () => {
    const slot = makeSlot("s1")
    addSlot(slot)
    removeSlot("s1")
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(slot.previewUrl)
    expect(getSnapshot().slots).toEqual([])
  })

  it("updateSlot patches only the targeted slot", () => {
    addSlot(makeSlot("s1"))
    addSlot(makeSlot("s2"))
    updateSlot("s1", { status: "uploaded", handle: "h1", progress: 100 })
    const slots = getSnapshot().slots
    expect(slots.find((s) => s.slotId === "s1")?.status).toBe("uploaded")
    expect(slots.find((s) => s.slotId === "s2")?.status).toBe("uploading")
  })

  // The server rejected the submit's handles (expired/unadoptable). Without this, the visitor
  // is stuck: dead handles, a failing submit, and nothing on screen offering a way out.
  describe("invalidateUploadedSlots", () => {
    it("flips uploaded slots back to failed, dropping the dead handle and keeping the File", () => {
      addSlot(makeSlot("s1"))
      updateSlot("s1", { status: "uploaded", handle: "dead-handle", progress: 100 })

      invalidateUploadedSlots("upload_expired")

      const slot = getSnapshot().slots[0]
      expect(slot.status).toBe("failed")
      expect(slot.errorKey).toBe("upload_expired")
      expect(slot.handle).toBeUndefined()
      // A dead-handle rejection is recoverable → transport, so Retry is offered.
      expect(slot.failureKind).toBe("transport")
      // Retry re-uploads this File, so it must survive.
      expect(slot.file).toBeInstanceOf(File)
    })

    it("leaves slots that were not uploaded untouched", () => {
      addSlot(makeSlot("uploading-slot"))
      addSlot(makeSlot("failed-slot"))
      updateSlot("failed-slot", { status: "failed", errorKey: "upload_invalid" })

      invalidateUploadedSlots("upload_expired")

      const slots = getSnapshot().slots
      expect(slots.find((s) => s.slotId === "uploading-slot")?.status).toBe("uploading")
      expect(slots.find((s) => s.slotId === "failed-slot")?.errorKey).toBe("upload_invalid")
    })
  })

  // D-Blueprint 5(a): entered text/select values persist across a client-side navigation
  // away and back, and are cleared on a successful submit.
  describe("field persistence", () => {
    it("starts with an empty fields bag", () => {
      expect(getFields()).toEqual({})
    })

    it("setFields persists values and getFields reads them back", () => {
      setFields({ clientName: "Alex", ideaDescription: "a dragon" })
      expect(getFields()).toEqual({ clientName: "Alex", ideaDescription: "a dragon" })
      expect(getSnapshot().fields).toEqual({ clientName: "Alex", ideaDescription: "a dragon" })
    })

    it("setFields replaces the whole bag (the form owns the complete set)", () => {
      setFields({ clientName: "Alex", email: "a@b.com" })
      setFields({ clientName: "Alex" })
      expect(getFields()).toEqual({ clientName: "Alex" })
    })

    it("emits a new snapshot object on a fields write", () => {
      const before = getSnapshot()
      setFields({ clientName: "Alex" })
      expect(getSnapshot()).not.toBe(before)
    })

    it("preserves fields across slot mutations", () => {
      setFields({ clientName: "Alex" })
      addSlot(makeSlot("s1"))
      expect(getFields()).toEqual({ clientName: "Alex" })
    })

    it("resetDraft clears persisted fields (successful submit)", () => {
      setFields({ clientName: "Alex", email: "a@b.com" })
      resetDraft()
      expect(getFields()).toEqual({})
    })
  })
})
