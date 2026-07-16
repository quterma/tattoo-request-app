import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { API_ERROR_CODES } from "@/shared/api"
import { RequestForm } from "../ui/RequestForm"
import { __resetDraftStoreForTests, addSlot, updateSlot } from "../store"
import type { UploadSlot } from "../store"
import messages from "@/shared/i18n/messages/en.json"

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => {
    return (key: string, params?: Record<string, unknown>) => {
      const parts = key.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = ns === "request" ? messages.request : messages
      for (const part of parts) {
        value = value?.[part]
      }
      if (typeof value === "string" && params) {
        return value.replace(/\{(\w+)\}/g, (_: string, k: string) =>
          String(params[k] ?? `{${k}}`),
        )
      }
      return typeof value === "string" ? value : key
    }
  },
}))

function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  return {
    async fill() {
      await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")

      await user.type(
        screen.getByRole("textbox", { name: /describe your idea/i }),
        "A dragon on my arm, very detailed and colorful",
      )

      // Uploads are optional (FS §4.2) and go through /api/upload via XHR, which jsdom
      // does not drive; this suite exercises the submit path, so no files are added.

      await user.selectOptions(screen.getByRole("combobox", { name: /placement/i }), "arm")
      await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
      await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black-and-grey")

      await user.type(screen.getByRole("textbox", { name: /email/i }), "user@example.com")

      await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))
    },
  }
}

describe("RequestForm – submission flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
  })

  afterEach(() => {
    cleanup()
  })

  it("calls fetch with POST and FormData on valid submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0001" }),
    })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("/api/request")
    expect(options.method).toBe("POST")
    expect(options.body).toBeInstanceOf(FormData)
  })

  it("includes required fields in the submitted FormData", async () => {
    let capturedFormData: FormData | undefined

    const mockFetch = vi.fn().mockImplementation((_url: string, options: RequestInit) => {
      capturedFormData = options.body as FormData
      return Promise.resolve({ json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0002" }) })
    })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(capturedFormData).toBeDefined()
    expect(capturedFormData!.get("clientSubmissionId")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(capturedFormData!.get("clientName")).toBe("Alex")
    expect(capturedFormData!.get("ideaDescription")).toContain("dragon")
    expect(capturedFormData!.get("placement")).toBe("arm")
    expect(capturedFormData!.get("size")).toBe("medium")
    expect(capturedFormData!.get("color")).toBe("black-and-grey")
    expect(capturedFormData!.get("email")).toBe("user@example.com")
    expect(capturedFormData!.get("eligibility")).toBe("true")
  })

  it("does not submit when required fields are missing", async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("shows success block and hides form after successful submission", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0003" }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(/request sent/i)).toBeInTheDocument()
    expect(screen.getByText(/REQ-2026-0003/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /send request/i })).not.toBeInTheDocument()
  })

  it("shows error message and keeps form visible on API failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: false }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("shows error message and keeps form visible on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("focuses the first server-flagged field in DOM order (FS §4.5: scrolled AND focused)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            // idea comes before email in DOM order — idea must get focus.
            fieldErrors: { email: ["email_invalid"], ideaDescription: ["idea_too_short"] },
            formErrors: [],
          },
        }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    await screen.findByText(/at least 20 characters/i)
    expect(screen.getByRole("textbox", { name: /describe your idea/i })).toHaveFocus()
  })

  it("maps server fieldErrors to RHF field errors via setError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: { ideaDescription: ["idea_too_short"] },
            formErrors: [],
          },
        }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument()
  })

  it("maps a max-length server fieldError to its i18n message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: { budget: ["budget_too_long"] },
            formErrors: [],
          },
        }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/budget must be 50 characters or less/i)).toBeInTheDocument()
  })

  // REGRESSION GUARD: uploadHandles is not a rendered control, so routing its error through
  // RHF's setError would be invisible — the visitor would press Submit and see nothing happen.
  it("surfaces an expired-upload-handle error as a visible, actionable message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: { uploadHandles: ["upload_expired"] },
            formErrors: [],
          },
        }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/timed out while the form was open/i)).toBeInTheDocument()
    // The form stays usable so the visitor can retry the uploads and resend.
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("shows generic error when VALIDATION_ERROR has no fieldErrors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          ok: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            fieldErrors: {},
            formErrors: ["something went wrong"],
          },
        }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("allows retry after validation error with fieldErrors", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            ok: false,
            error: {
              code: API_ERROR_CODES.VALIDATION_ERROR,
              fieldErrors: { ideaDescription: ["idea_too_short"] },
              formErrors: [],
            },
          }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0004" }),
      })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/request sent/i)).toBeInTheDocument()
  })

  it("clears error message and re-enables retry on subsequent submission", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: false }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0005" }) })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.getByText(/request sent/i)).toBeInTheDocument()
  })
})

describe("RequestForm – contact group error UX", () => {
  const contactErrorText = /please provide at least one way to reach you/i

  function fillRequiredExceptContact(user: ReturnType<typeof userEvent.setup>) {
    return {
      async fill() {
        await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")

        await user.type(
          screen.getByRole("textbox", { name: /describe your idea/i }),
          "A dragon on my arm, very detailed and colorful",
        )
        await user.selectOptions(screen.getByRole("combobox", { name: /placement/i }), "arm")
        await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
        await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black-and-grey")
        await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))
      },
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    cleanup()
  })

  it("shows contact error after submitting with all contact fields empty", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredExceptContact(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(contactErrorText)).toBeInTheDocument()
  })

  it("clears contact error immediately when email is entered", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredExceptContact(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.getByText(contactErrorText)).toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: /email/i }), "a@b.com")

    expect(screen.queryByText(contactErrorText)).not.toBeInTheDocument()
  })

  it("clears contact error immediately when phone is entered", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredExceptContact(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.getByText(contactErrorText)).toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: /phone/i }), "+1234")

    expect(screen.queryByText(contactErrorText)).not.toBeInTheDocument()
  })

  it("clears contact error immediately when other contact is entered", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredExceptContact(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.getByText(contactErrorText)).toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: /other/i }), "@telegram")

    expect(screen.queryByText(contactErrorText)).not.toBeInTheDocument()
  })

  it("restores contact error when all contact fields are cleared and form is resubmitted", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredExceptContact(user).fill()
    await user.type(screen.getByRole("textbox", { name: /email/i }), "a@b.com")
    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.queryByText(contactErrorText)).not.toBeInTheDocument()

    await user.clear(screen.getByRole("textbox", { name: /email/i }))
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(contactErrorText)).toBeInTheDocument()
  })
})

// D-Blueprint 5(a): entered values survive a client-side navigation away from Request and
// back. Modelled here as an unmount (leaving the page) + a fresh mount (returning), which is
// exactly what client-side routing does to this component; the module store outlives it.
describe("RequestForm – in-session field persistence", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => cleanup())

  it("restores entered text/select values after unmount and remount", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<RequestForm />)

    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")
    await user.type(
      screen.getByRole("textbox", { name: /describe your idea/i }),
      "A dragon on my arm, very detailed and colorful",
    )
    await user.selectOptions(screen.getByRole("combobox", { name: /placement/i }), "arm")
    await user.type(screen.getByRole("textbox", { name: /email/i }), "user@example.com")

    unmount()
    render(<RequestForm />)

    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveValue("Alex")
    expect(screen.getByRole("textbox", { name: /describe your idea/i })).toHaveValue(
      "A dragon on my arm, very detailed and colorful",
    )
    expect(screen.getByRole("combobox", { name: /placement/i })).toHaveValue("arm")
    expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue("user@example.com")
  })

  // D-Blueprint 5(a) covers ALL entered values, including the eligibility confirmation made
  // in the same live session — client-side navigation is not a new session.
  it("restores the eligibility checkbox after unmount and remount", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<RequestForm />)

    await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))
    expect(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i })).toBeChecked()

    unmount()
    render(<RequestForm />)

    expect(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i })).toBeChecked()
  })
})

// FS §4.5: a technical (network/server) failure preserves everything and reassures the
// visitor; the Instagram fallback (A.4) appears only after ≥2 consecutive failed submits.
describe("RequestForm – technical failure & Instagram fallback (FS §4.5 / A.4)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
  })
  afterEach(() => cleanup())

  const fallbackText = /message me directly on Instagram/i
  const preservedText = /your details are still here/i

  it("shows the 'details preserved' message but NOT the Instagram fallback after one failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(preservedText)).toBeInTheDocument()
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument()
  })

  it("shows the Instagram fallback after two consecutive failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))
    expect(screen.getByText(fallbackText)).toBeInTheDocument()
  })

  it("resets the failure counter after a success, so a later failure starts over", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, referenceCode: "K7M4XP" }) })
    vi.stubGlobal("fetch", mockFetch)
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i })) // fail 1
    await user.click(screen.getByRole("button", { name: /send request/i })) // success → resets

    expect(await screen.findByText(/request sent/i)).toBeInTheDocument()
  })

  it("does not count a validation rejection toward the fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            ok: false,
            error: {
              code: API_ERROR_CODES.VALIDATION_ERROR,
              fieldErrors: { ideaDescription: ["idea_too_short"] },
              formErrors: [],
            },
          }),
      }),
    )
    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    await user.click(screen.getByRole("button", { name: /send request/i }))

    // Two validation rejections must not surface the technical-failure fallback.
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument()
    expect(screen.queryByText(preservedText)).not.toBeInTheDocument()
  })
})

// Owner decision: the submit CTA accepts the click even while an upload is in flight, shows a
// sending state, waits for the upload to settle, then submits (files not dropped).
describe("RequestForm – click-to-wait for in-flight uploads", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    __resetDraftStoreForTests()
  })
  afterEach(() => cleanup())

  function uploadingSlot(): UploadSlot {
    return {
      slotId: "s1",
      category: "artist_work",
      file: new File(["x"], "a.jpg", { type: "image/jpeg" }),
      fileName: "a.jpg",
      previewUrl: "blob:mock",
      status: "uploading",
      progress: 10,
    }
  }

  it("does not POST until the in-flight upload settles, then includes its handle", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({ json: () => Promise.resolve({ ok: true, referenceCode: "K7M4XP" }) })
    vi.stubGlobal("fetch", mockFetch)

    addSlot(uploadingSlot())

    const user = userEvent.setup()
    render(<RequestForm />)
    await fillRequiredFields(user).fill()

    // The button is enabled (click accepted), and shows the waiting label while uploading.
    const button = screen.getByRole("button", { name: /waiting for images|send request/i })
    expect(button).not.toBeDisabled()
    await user.click(button)

    // The upload has not settled yet — no POST.
    expect(mockFetch).not.toHaveBeenCalled()

    // Upload completes → the waiter resolves → submit proceeds with the handle.
    updateSlot("s1", { status: "uploaded", progress: 100, handle: "h1" })

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    const body = mockFetch.mock.calls[0][1].body as FormData
    expect(body.getAll("uploadHandles")).toEqual(["h1"])
  })
})

// FS §4.2 field 1: "counter shown near limit" for the 1,000-char idea field.
describe("RequestForm – idea character counter", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
    vi.stubGlobal("fetch", vi.fn())
  })
  afterEach(() => cleanup())

  it("shows no counter for a short idea, and a counter near the limit", async () => {
    const user = userEvent.setup()
    render(<RequestForm />)

    const idea = screen.getByRole("textbox", { name: /describe your idea/i })
    await user.type(idea, "A short idea well under the limit")
    expect(screen.queryByText(/\/1000/)).not.toBeInTheDocument()

    // Jump near the limit without typing 900 chars one by one.
    fireEvent.change(idea, { target: { value: "a".repeat(950) } })
    expect(screen.getByText("950/1000")).toBeInTheDocument()
  })
})
