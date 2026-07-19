import { describe, it, expect, vi, afterEach } from "vitest"
import type { ComponentProps } from "react"
import { render, screen, cleanup, fireEvent } from "@testing-library/react"
import messages from "@/shared/i18n/messages/en.json"
import PublicError from "../error"

vi.mock("@/shared/i18n", () => ({
  Link: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a href={`/en${href}`} {...props} />
  ),
}))

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string, params?: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (messages as any)[namespace]?.[key]
    if (typeof value === "string" && params) {
      return value.replace(/\{(\w+)\}/g, (_: string, k: string) => String(params[k] ?? `{${k}}`))
    }
    return typeof value === "string" ? value : key
  },
}))

describe("PublicError", () => {
  afterEach(() => cleanup())

  it("calls unstable_retry() when the retry button is clicked", () => {
    const reset = vi.fn()
    const unstableRetry = vi.fn()
    render(<PublicError error={new Error("boom")} reset={reset} unstable_retry={unstableRetry} />)

    fireEvent.click(screen.getByRole("button", { name: messages.error.retry }))

    expect(unstableRetry).toHaveBeenCalledTimes(1)
    expect(reset).not.toHaveBeenCalled()
  })

  it("renders a link back home", () => {
    render(<PublicError error={new Error("boom")} reset={vi.fn()} unstable_retry={vi.fn()} />)

    expect(screen.getByRole("link", { name: messages.error.backHome })).toHaveAttribute("href", "/en/")
  })
})
