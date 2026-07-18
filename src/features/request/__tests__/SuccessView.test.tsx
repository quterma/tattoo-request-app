import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { StrictMode, type ComponentProps } from "react"
import { render, screen, cleanup } from "@testing-library/react"
import messages from "@/shared/i18n/messages/en.json"
import { SuccessView } from "../ui/SuccessView"
import { __resetDraftStoreForTests, getSnapshot, setSuccess } from "../store"

const replace = vi.fn()
const push = vi.fn()

vi.mock("@/shared/i18n", () => ({
  useRouter: () => ({ replace, push }),
  Link: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a href={`/en${href}`} {...props} />
  ),
}))

// Same flat resolver as the RequestForm suite: dot-path lookup into the `request` namespace with
// {param} interpolation, so the assertions read the real Appendix A.2 copy.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const parts = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages.request
    for (const part of parts) value = value?.[part]
    if (typeof value === "string" && params) {
      return value.replace(/\{(\w+)\}/g, (_: string, k: string) => String(params[k] ?? `{${k}}`))
    }
    return typeof value === "string" ? value : key
  },
}))

const payload = {
  referenceCode: "REQ-2026-0001",
  contactMethod: "email",
  contactValue: "user@example.com",
}

describe("SuccessView – gate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetDraftStoreForTests()
  })
  afterEach(() => cleanup())

  it("redirects Home and renders nothing when the store is empty (direct open / no submission)", () => {
    const { container } = render(<SuccessView />)
    expect(replace).toHaveBeenCalledWith("/")
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the six items from the payload, then leaves the store empty (one-time read)", () => {
    setSuccess(payload)
    render(<SuccessView />)

    // 1. confirmation, 2. reference code, 3. 48-hour expectation
    expect(screen.getByText(messages.request.success.confirmationTitle)).toBeInTheDocument()
    expect(screen.getByText(/REQ-2026-0001/)).toBeInTheDocument()
    expect(screen.getByText(messages.request.success.responseExpectation)).toBeInTheDocument()
    // 4. contact echo — method label (reused from the form's own options) + value as entered
    expect(screen.getByText(`${messages.request.contactMethodOptions.email}:`)).toBeInTheDocument()
    expect(screen.getByText("user@example.com")).toBeInTheDocument()
    // 5. the A.2 channel note for the entered method
    expect(screen.getByText(messages.request.success.channelNotes.email)).toBeInTheDocument()
    // 6. single primary CTA
    expect(screen.getByRole("link", { name: messages.request.success.backToHome })).toBeInTheDocument()

    // The read is one-time: the store is cleared after render.
    expect(getSnapshot().success).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })

  it("shows the value unmasked and renders the note matching the entered method", () => {
    setSuccess({ referenceCode: "K7M4XP", contactMethod: "instagram", contactValue: "@masha" })
    render(<SuccessView />)

    expect(screen.getByText("@masha")).toBeInTheDocument()
    expect(screen.getByText(messages.request.success.channelNotes.instagram)).toBeInTheDocument()
    // Not another method's note.
    expect(screen.queryByText(messages.request.success.channelNotes.email)).not.toBeInTheDocument()
  })

  // The exact blueprint trap: React strict-mode double-invokes the mount effect. The `consumed`
  // ref must make the second run a no-op so it neither self-redirects (store is empty by then)
  // nor loses the captured payload.
  it("survives React strict-mode double-invoke: shows the payload, never self-redirects", () => {
    setSuccess(payload)
    render(
      <StrictMode>
        <SuccessView />
      </StrictMode>,
    )

    expect(screen.getByText(/REQ-2026-0001/)).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(getSnapshot().success).toBeNull()
  })

  // A revisit (payload already consumed) must redirect.
  it("redirects on a second mount after the payload was consumed", () => {
    setSuccess(payload)
    const first = render(<SuccessView />)
    expect(replace).not.toHaveBeenCalled()
    first.unmount()

    render(<SuccessView />)
    expect(replace).toHaveBeenCalledWith("/")
  })

  // bfcache guard: a back-forward-cache restore re-runs no mount, so `pageshow` with
  // `persisted: true` must re-run the gate. By then the payload is consumed → redirect.
  it("redirects on a persisted pageshow restore (bfcache guard)", () => {
    setSuccess(payload)
    render(<SuccessView />)
    expect(replace).not.toHaveBeenCalled()

    const event = new Event("pageshow") as PageTransitionEvent
    Object.defineProperty(event, "persisted", { value: true })
    window.dispatchEvent(event)

    expect(replace).toHaveBeenCalledWith("/")
  })
})
