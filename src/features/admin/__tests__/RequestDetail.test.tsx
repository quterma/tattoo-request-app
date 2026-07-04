import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import type { ComponentProps } from "react"
import { RequestDetail } from "../ui/RequestDetail"
import type { AdminRequestDetail, UpdateRequestStatusResult } from "../types"
import messages from "@/shared/i18n/messages/en.json"

const noopUpdateStatusAction = async (): Promise<UpdateRequestStatusResult> => ({ ok: true })

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

const baseRequest: AdminRequestDetail = {
  id: "9f3b1c2a-1111-4a2b-8c3d-abcdef123456",
  referenceCode: "REQ-2026-0007",
  clientName: "Alex Doe",
  description: "A large black-and-grey wolf on the forearm.",
  placement: "arm",
  size: "medium",
  color: "black",
  budget: "$300",
  email: "alex@example.com",
  phone: "+15551234567",
  contactOther: "@alexdoe on Instagram",
  consent: true,
  status: "new",
  createdAt: "2026-06-30T12:00:00.000Z",
  files: [
    {
      status: "available",
      id: "file-1",
      originalName: "reference-01.jpg",
      type: "reference",
      signedUrl: "https://storage.example.com/signed/reference-01.jpg?token=abc",
    },
    {
      status: "unavailable",
      id: "file-2",
      originalName: "placement-01.jpg",
      type: "placement",
    },
  ],
}

describe("RequestDetail", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders core sections and fields", () => {
    render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByRole("heading", { level: 1, name: "REQ-2026-0007" })).toBeInTheDocument()
    expect(
      screen.getByText("New", { selector: "span" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Alex Doe")).toBeInTheDocument()
    expect(screen.getByText(/wolf on the forearm/)).toBeInTheDocument()
    expect(screen.getByText("Arm")).toBeInTheDocument()
    expect(screen.getByText("Medium (5–10 cm)")).toBeInTheDocument()
    expect(screen.getByText("Black")).toBeInTheDocument()
    expect(screen.getByText("$300")).toBeInTheDocument()
  })

  it("renders mailto/tel quick actions when email/phone are present", () => {
    render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:alex@example.com",
    )
    expect(screen.getByRole("link", { name: "Call" })).toHaveAttribute(
      "href",
      "tel:+15551234567",
    )
  })

  it("only renders present contact fields, and renders contactOther as plain text", () => {
    const request: AdminRequestDetail = {
      ...baseRequest,
      email: null,
      phone: null,
    }
    render(
      <RequestDetail
        request={request}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.queryByRole("link", { name: "Email" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Call" })).not.toBeInTheDocument()
    expect(screen.getByText("@alexdoe on Instagram")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "@alexdoe on Instagram" })).not.toBeInTheDocument()
  })

  it("renders an available image with a meaningful alt and its signed URL as src", () => {
    render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    const img = screen.getByAltText("reference-01.jpg")
    expect(img).toHaveAttribute(
      "src",
      "https://storage.example.com/signed/reference-01.jpg?token=abc",
    )
  })

  it("renders a same-width placeholder with filename for an unavailable image, not hidden", () => {
    render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByText("placement-01.jpg")).toBeInTheDocument()
    expect(screen.getByText("Image unavailable")).toBeInTheDocument()
  })

  it("never renders a raw storage path", () => {
    const { container } = render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )
    expect(container.innerHTML).not.toMatch(/storagePath|storage_path/i)
  })

  it("links back to the requests list", () => {
    render(
      <RequestDetail
        request={baseRequest}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    const backLink = screen.getByRole("link", { name: /back to requests/i })
    expect(backLink).toHaveAttribute("href", "/en/admin/requests")
  })
})
