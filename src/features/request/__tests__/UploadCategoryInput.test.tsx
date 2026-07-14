import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react"

const { mockXhrUpload } = vi.hoisted(() => ({ mockXhrUpload: vi.fn() }))

vi.mock("../lib/upload", async () => {
  const actual = await vi.importActual<typeof import("../lib/upload")>("../lib/upload")
  return { ...actual, xhrUpload: mockXhrUpload }
})

import { UploadCategoryInput } from "../ui/UploadCategoryInput"
import { UploadError } from "../lib/upload"
import { MAX_FILE_SIZE_BYTES } from "../config"
import { __resetDraftStoreForTests, getSnapshot } from "../store"

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function renderInput(category: "artist_work" | "inspiration" = "artist_work") {
  return render(
    <UploadCategoryInput
      id={`upload-${category}`}
      category={category}
      label="Artist work"
      buttonText="Choose images"
      uploadingLabel="Uploading"
      errorMessage={(key) => `error:${key}`}
      retryLabel="Retry"
      removeFileLabel={(n) => `Remove ${n}`}
      maxFilesWarning="Max reached"
    />,
  )
}

function pick(input: HTMLElement, ...files: File[]) {
  fireEvent.change(input, { target: { files } })
}

const jpeg = (name: string) => new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: "image/jpeg" })

/** A file whose reported size exceeds the 4 MB ceiling, without allocating 4 MB of memory. */
function oversizedJpeg(name: string): File {
  const file = jpeg(name)
  Object.defineProperty(file, "size", { value: MAX_FILE_SIZE_BYTES + 1 })
  return file
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock")
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  __resetDraftStoreForTests()
})

afterEach(() => cleanup())

describe("UploadCategoryInput", () => {
  it("uploads immediately on selection, without waiting for submit (FS §4.3)", async () => {
    mockXhrUpload.mockResolvedValue({ handle: "h1" })
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, jpeg("a.jpg"))

    expect(mockXhrUpload).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(getSnapshot().slots[0].status).toBe("uploaded")
      expect(getSnapshot().slots[0].handle).toBe("h1")
    })
  })

  it("isolates a per-file failure: other files stay uploaded (FS §4.5)", async () => {
    mockXhrUpload
      .mockResolvedValueOnce({ handle: "ok" })
      .mockRejectedValueOnce(new UploadError("upload_invalid", true))
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, jpeg("good.jpg"), jpeg("bad.jpg"))

    await waitFor(() => {
      const statuses = getSnapshot().slots.map((s) => s.status).sort()
      expect(statuses).toEqual(["failed", "uploaded"])
    })
  })

  it("retries a failed upload with the same file", async () => {
    const first = deferred<{ handle: string }>()
    mockXhrUpload.mockReturnValueOnce(first.promise)
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, jpeg("a.jpg"))
    first.reject(new UploadError("upload_invalid", true))

    await screen.findByText("error:upload_invalid")

    mockXhrUpload.mockResolvedValueOnce({ handle: "retry-ok" })
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))

    await waitFor(() => expect(getSnapshot().slots[0].status).toBe("uploaded"))
    expect(mockXhrUpload).toHaveBeenCalledTimes(2)
  })

  it("remove aborts an in-flight upload and calls no delete endpoint", async () => {
    const pending = deferred<{ handle: string }>()
    mockXhrUpload.mockReturnValue(pending.promise)
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, jpeg("a.jpg"))
    expect(getSnapshot().slots).toHaveLength(1)

    fireEvent.click(screen.getByRole("button", { name: /Remove a\.jpg/ }))

    // The abort signal passed to xhrUpload should now be aborted.
    const signal = mockXhrUpload.mock.calls[0][3].signal as AbortSignal
    expect(signal.aborted).toBe(true)
    expect(getSnapshot().slots).toHaveLength(0)
  })

  it("only shows slots for its own category", async () => {
    mockXhrUpload.mockResolvedValue({ handle: "h" })
    const { container } = renderInput("inspiration")

    pick(container.querySelector('input[type="file"]')!, jpeg("insp.jpg"))

    await waitFor(() => {
      expect(getSnapshot().slots[0].category).toBe("inspiration")
    })
    expect(within(container).getByText("insp.jpg")).toBeInTheDocument()
  })

  // FS §4.3: "Each image shows a thumbnail with a remove control."
  it("renders a thumbnail from the file's object URL", async () => {
    mockXhrUpload.mockResolvedValue({ handle: "h" })
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, jpeg("a.jpg"))

    await waitFor(() => expect(getSnapshot().slots).toHaveLength(1))
    const img = container.querySelector("img")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("src", "blob:mock")
  })

  it("rejects an oversized file before uploading, and shows why", async () => {
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, oversizedJpeg("huge.jpg"))

    await waitFor(() => expect(getSnapshot().slots[0].status).toBe("failed"))
    // Never hits the network: an oversized body dies at the platform edge anyway.
    expect(mockXhrUpload).not.toHaveBeenCalled()
    expect(getSnapshot().slots[0].errorKey).toBe("upload_too_large")
    expect(screen.getByText("error:upload_too_large")).toBeInTheDocument()
  })

  it("does not re-upload an oversized file on retry", async () => {
    const { container } = renderInput()

    pick(container.querySelector('input[type="file"]')!, oversizedJpeg("huge.jpg"))
    await waitFor(() => expect(getSnapshot().slots[0].status).toBe("failed"))

    fireEvent.click(screen.getByRole("button", { name: "Retry" }))

    await waitFor(() => expect(getSnapshot().slots[0].status).toBe("failed"))
    expect(mockXhrUpload).not.toHaveBeenCalled()
  })
})
