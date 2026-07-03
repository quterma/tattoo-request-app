import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import type { ComponentProps } from "react"
import { RequestList } from "../ui/RequestList"
import type { AdminRequestListItem } from "../types"
import messages from "@/shared/i18n/messages/en.json"

vi.mock("@/shared/i18n", () => ({
  Link: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a href={`/en${href}`} {...props} />
  ),
}))

function makeT() {
  const fn = (key: string) => {
    const parts = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages.admin
    for (const part of parts) {
      value = value?.[part]
    }
    return typeof value === "string" ? value : key
  }
  fn.has = (key: string) => {
    const parts = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages.admin
    for (const part of parts) {
      value = value?.[part]
    }
    return typeof value === "string"
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fn as any
}

const request: AdminRequestListItem = {
  id: "9f3b1c2a-1111-4a2b-8c3d-abcdef123456",
  referenceCode: "REQ-2026-0007",
  clientName: "Alex Doe",
  placement: "arm",
  size: "medium",
  color: "black",
  status: "new",
  createdAt: "2026-06-30T12:00:00.000Z",
}

describe("RequestList", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders one card per request", () => {
    render(<RequestList requests={[request]} locale="en" t={makeT()} />)
    expect(screen.getByText("REQ-2026-0007")).toBeInTheDocument()
    expect(screen.getAllByRole("link")).toHaveLength(1)
  })

  it("renders an empty-state message when there are no requests", () => {
    render(<RequestList requests={[]} locale="en" t={makeT()} />)
    expect(screen.getByText(messages.admin.requestListEmpty)).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
