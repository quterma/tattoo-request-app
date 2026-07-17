import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import type { ComponentProps } from "react"
import { RequestCard } from "../ui/RequestCard"
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

const baseRequest: AdminRequestListItem = {
  id: "9f3b1c2a-1111-4a2b-8c3d-abcdef123456",
  referenceCode: "REQ-2026-0007",
  clientName: "Alex Doe",
  placement: "arm",
  size: "medium",
  color: "black-and-grey",
  status: "new",
  createdAt: "2026-06-30T12:00:00.000Z",
}

describe("RequestCard", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders reference code, client name, placement/size/color, and status as text", () => {
    render(<RequestCard request={baseRequest} locale="en" t={makeT()} />)

    expect(screen.getByText("REQ-2026-0007")).toBeInTheDocument()
    expect(screen.getByText("Alex Doe")).toBeInTheDocument()
    expect(screen.getByText(/Arm/)).toBeInTheDocument()
    expect(screen.getByText(/Medium \(5–10 cm\)/)).toBeInTheDocument()
    expect(screen.getByText(/Black/)).toBeInTheDocument()
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("links to the UUID detail route", () => {
    render(<RequestCard request={baseRequest} locale="en" t={makeT()} />)

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute(
      "href",
      "/en/admin/requests/9f3b1c2a-1111-4a2b-8c3d-abcdef123456",
    )
  })

  it("falls back to the raw value for an unrecognized placement/size/color", () => {
    const request: AdminRequestListItem = {
      ...baseRequest,
      placement: "unknown-placement",
      size: "unknown-size",
      color: "unknown-color",
    }
    render(<RequestCard request={request} locale="en" t={makeT()} />)

    expect(screen.getByText(/unknown-placement/)).toBeInTheDocument()
    expect(screen.getByText(/unknown-size/)).toBeInTheDocument()
    expect(screen.getByText(/unknown-color/)).toBeInTheDocument()
  })

  it("formats the created date in a locale-aware way, not by slicing the ISO string", () => {
    render(<RequestCard request={baseRequest} locale="en" t={makeT()} />)

    expect(screen.getByText(/Jun 30, 2026/)).toBeInTheDocument()
    expect(screen.queryByText("2026-06-30T12:00:00.000Z")).not.toBeInTheDocument()
  })
})
