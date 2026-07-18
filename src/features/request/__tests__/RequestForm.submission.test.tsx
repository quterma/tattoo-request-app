import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { API_ERROR_CODES } from "@/shared/api"
import { RequestForm } from "../ui/RequestForm"
import { __resetDraftStoreForTests, addSlot, getFields, getSnapshot, updateSlot } from "../store"
import type { UploadSlot } from "../store"
import messages from "@/shared/i18n/messages/en.json"

// This suite drives many full form fill-ins through userEvent; even with `{ delay: null }` it is
// the heaviest file in the repo, and under the parallel run its first tests can occasionally miss
// the default 5s per-test timeout purely from CPU contention (not logic). Raise the file-level
// timeout so the suite is deterministic under load.
vi.setConfig({ testTimeout: 20000 })

// The submit flow now navigates to /success via the i18n router; mock it so success asserts the
// navigation + store payload rather than an inline success block (removed in Task 04).
const push = vi.fn()
vi.mock("@/shared/i18n", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}))

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

      await user.type(screen.getByRole("textbox", { name: /placement/i }), "arm")
      await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
      await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black-and-grey")

      await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "email")
      await user.type(screen.getByRole("textbox", { name: /^email$/i }), "user@example.com")

      await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))
    },
  }
}

describe("RequestForm – submission flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    push.mockClear()
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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
    expect(capturedFormData!.get("contactMethod")).toBe("email")
    expect(capturedFormData!.get("contactValue")).toBe("user@example.com")
    expect(capturedFormData!.get("eligibility")).toBe("true")
  })

  it("does not submit when required fields are missing", async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("blocks submit and focuses Placement when every other required field is valid but Placement is empty", async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")
    await user.type(
      screen.getByRole("textbox", { name: /describe your idea/i }),
      "A dragon on my arm, very detailed and colorful",
    )
    // Placement deliberately left empty.
    await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
    await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black-and-grey")
    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "email")
    await user.type(screen.getByRole("textbox", { name: /^email$/i }), "user@example.com")
    await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(await screen.findByText(/please enter a placement/i)).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /placement/i })).toHaveFocus()
  })

  it("stores the success payload (raw entered values + code) and navigates to /success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0003" }),
    }))

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    await waitFor(() => expect(push).toHaveBeenCalledWith("/success"))
    // Payload carries the returned code + the contact method/value exactly as entered (FS §3.4).
    expect(getSnapshot().success).toEqual({
      referenceCode: "REQ-2026-0003",
      contactMethod: "email",
      contactValue: "user@example.com",
    })
    // The field bag is cleared on a successful submit so returning to Request shows an empty form.
    expect(getFields()).toEqual({})
  })

  // REGRESSION GUARD (Codex review 2026-07-18, finding 1): a malformed `{ ok: true }` without a
  // usable string code must NOT trigger the destructive success transition (resetDraft + read-once
  // /success). It takes the technical-failure path instead, keeping the form + data for retry.
  it("treats ok:true without a usable reference code as a technical failure (no reset, no nav)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true }), // no referenceCode
    }))

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    // Surfaced as a technical failure; nothing was reset or navigated.
    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    expect(getSnapshot().success).toBeNull()
    // Data preserved for retry.
    expect(getFields().clientName).toBe("Alex")
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("clears the form on success: a fresh mount after submit shows empty fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0006" }),
    }))

    const user = userEvent.setup({ delay: null })
    const { unmount } = render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/success"))

    unmount()
    render(<RequestForm />)

    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveValue("")
    expect(screen.getByRole("textbox", { name: /describe your idea/i })).toHaveValue("")
    expect(screen.getByRole("combobox", { name: /contact method/i })).toHaveValue("")
  })

  it("shows error message and keeps form visible on API failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: false }),
    }))

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send request/i })).toBeInTheDocument()
  })

  it("shows error message and keeps form visible on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network failure")))

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/at least 20 characters/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))

    await waitFor(() => expect(push).toHaveBeenCalledWith("/success"))
  })

  it("clears error message and re-enables retry on subsequent submission", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: false }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, referenceCode: "REQ-2026-0005" }) })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByRole("alert")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    await waitFor(() => expect(push).toHaveBeenCalledWith("/success"))
  })
})


// FS §4.2 field 9: the method select reveals exactly one value field.
describe("RequestForm – contact method select", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    __resetDraftStoreForTests()
    vi.stubGlobal("fetch", vi.fn())
  })
  afterEach(() => cleanup())

  it("shows no value field until a method is chosen", () => {
    render(<RequestForm />)
    expect(screen.getByRole("combobox", { name: /contact method/i })).toHaveValue("")
    expect(screen.queryByLabelText(/whatsapp number|instagram handle|telegram username/i)).not.toBeInTheDocument()
  })

  it.each([
    ["whatsapp", /whatsapp number/i],
    ["email", /^email$/i],
    ["instagram", /instagram handle/i],
    ["telegram", /telegram username/i],
    ["phone", /phone number/i],
  ])("reveals exactly one value field for %s", async (method, labelRe) => {
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), method)

    expect(screen.getByLabelText(labelRe)).toBeInTheDocument()
    // Exactly one value input exists in the DOM at a time (FS §4.2, 10a–e).
    expect(document.querySelectorAll("#contactValue")).toHaveLength(1)
  })

  // Changing the method reinterprets the value — an email is not an Instagram handle.
  it("clears the value when the method changes", async () => {
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "email")
    await user.type(screen.getByLabelText(/^email$/i), "a@b.com")
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("a@b.com")

    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "instagram")

    expect(screen.getByLabelText(/instagram handle/i)).toHaveValue("")
  })

  it("blocks submit and shows the method's own message for an invalid value", async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal("fetch", mockFetch)
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")
    await user.type(
      screen.getByRole("textbox", { name: /describe your idea/i }),
      "A dragon on my arm, very detailed and colorful",
    )
    await user.type(screen.getByRole("textbox", { name: /placement/i }), "arm")
    await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
    await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black-and-grey")
    await user.click(screen.getByRole("checkbox", { name: /i confirm i am 18 or older/i }))

    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "telegram")
    // Valid Instagram, invalid Telegram — the exact case the 2026-07-16 correction exists for.
    await user.type(screen.getByLabelText(/telegram username/i), "masha.tattoo")
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/valid Telegram username/i)).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
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
    const user = userEvent.setup({ delay: null })
    const { unmount } = render(<RequestForm />)

    await user.type(screen.getByRole("textbox", { name: /your name/i }), "Alex")
    await user.type(
      screen.getByRole("textbox", { name: /describe your idea/i }),
      "A dragon on my arm, very detailed and colorful",
    )
    await user.type(screen.getByRole("textbox", { name: /placement/i }), "arm")
    await user.selectOptions(screen.getByRole("combobox", { name: /contact method/i }), "instagram")
    await user.type(screen.getByLabelText(/instagram handle/i), "@masha")

    unmount()
    render(<RequestForm />)

    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveValue("Alex")
    expect(screen.getByRole("textbox", { name: /describe your idea/i })).toHaveValue(
      "A dragon on my arm, very detailed and colorful",
    )
    expect(screen.getByRole("textbox", { name: /placement/i })).toHaveValue("arm")
    // The restored method must not trigger the clear-on-method-change effect (which would wipe
    // the value it just restored) — that is what the first-render guard protects.
    expect(screen.getByRole("combobox", { name: /contact method/i })).toHaveValue("instagram")
    expect(screen.getByLabelText(/instagram handle/i)).toHaveValue("@masha")
  })

  // D-Blueprint 5(a) covers ALL entered values, including the eligibility confirmation made
  // in the same live session — client-side navigation is not a new session.
  it("restores the eligibility checkbox after unmount and remount", async () => {
    const user = userEvent.setup({ delay: null })
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
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(preservedText)).toBeInTheDocument()
    expect(screen.queryByText(fallbackText)).not.toBeInTheDocument()
  })

  it("shows the Instagram fallback after two consecutive failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))
    const user = userEvent.setup({ delay: null })
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
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i })) // fail 1
    await user.click(screen.getByRole("button", { name: /send request/i })) // success → resets

    await waitFor(() => expect(push).toHaveBeenCalledWith("/success"))
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
    const user = userEvent.setup({ delay: null })
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

    const user = userEvent.setup({ delay: null })
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
    const user = userEvent.setup({ delay: null })
    render(<RequestForm />)

    const idea = screen.getByRole("textbox", { name: /describe your idea/i })
    await user.type(idea, "A short idea well under the limit")
    expect(screen.queryByText(/\/1000/)).not.toBeInTheDocument()

    // Jump near the limit without typing 900 chars one by one.
    fireEvent.change(idea, { target: { value: "a".repeat(950) } })
    expect(screen.getByText("950/1000")).toBeInTheDocument()
  })
})
