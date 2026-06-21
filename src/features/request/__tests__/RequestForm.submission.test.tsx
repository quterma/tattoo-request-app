import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { API_ERROR_CODES } from "@/bff"
import { RequestForm } from "../ui/RequestForm"
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
      await user.type(
        screen.getByRole("textbox", { name: /describe your idea/i }),
        "A dragon on my arm, very detailed and colorful",
      )

      const refFile = new File(["ref"], "ref.png", { type: "image/png" })
      const placeFile = new File(["place"], "place.png", { type: "image/png" })

      const [refInput, placeInput] = document.querySelectorAll('input[type="file"]')
      await user.upload(refInput as HTMLElement, refFile)
      await user.upload(placeInput as HTMLElement, placeFile)

      await user.selectOptions(screen.getByRole("combobox", { name: /placement/i }), "arm")
      await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
      await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black")

      await user.type(screen.getByRole("textbox", { name: /email/i }), "user@example.com")

      await user.click(screen.getByRole("checkbox", { name: /pricing/i }))
    },
  }
}

describe("RequestForm – submission flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("calls fetch with POST and FormData on valid submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, requestId: "abc-123" }),
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
      return Promise.resolve({ json: () => Promise.resolve({ ok: true, requestId: "xyz" }) })
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
    expect(capturedFormData!.get("ideaDescription")).toContain("dragon")
    expect(capturedFormData!.get("placement")).toBe("arm")
    expect(capturedFormData!.get("size")).toBe("medium")
    expect(capturedFormData!.get("color")).toBe("black")
    expect(capturedFormData!.get("email")).toBe("user@example.com")
    expect(capturedFormData!.get("consent")).toBe("true")
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
      json: () => Promise.resolve({ ok: true, requestId: "req-999" }),
    }))

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(screen.getByText(/request sent/i)).toBeInTheDocument()
    expect(screen.getByText(/req-999/)).toBeInTheDocument()
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
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument()
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
        json: () => Promise.resolve({ ok: true, requestId: "req-after-fix" }),
      })
    vi.stubGlobal("fetch", mockFetch)

    const user = userEvent.setup()
    render(<RequestForm />)

    await fillRequiredFields(user).fill()
    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /send request/i }))

    expect(await screen.findByText(/request sent/i)).toBeInTheDocument()
  })

  it("clears error message and re-enables retry on subsequent submission", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: false }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ok: true, requestId: "req-retry" }) })
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
        await user.type(
          screen.getByRole("textbox", { name: /describe your idea/i }),
          "A dragon on my arm, very detailed and colorful",
        )
        const refFile = new File(["ref"], "ref.png", { type: "image/png" })
        const placeFile = new File(["place"], "place.png", { type: "image/png" })
        const [refInput, placeInput] = document.querySelectorAll('input[type="file"]')
        await user.upload(refInput as HTMLElement, refFile)
        await user.upload(placeInput as HTMLElement, placeFile)
        await user.selectOptions(screen.getByRole("combobox", { name: /placement/i }), "arm")
        await user.selectOptions(screen.getByRole("combobox", { name: /size/i }), "medium")
        await user.selectOptions(screen.getByRole("combobox", { name: /color/i }), "black")
        await user.click(screen.getByRole("checkbox", { name: /pricing/i }))
      },
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks()
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
