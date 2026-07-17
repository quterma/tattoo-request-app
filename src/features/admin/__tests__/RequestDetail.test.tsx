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
  color: "black-and-grey",
  budget: "$300",
  contacts: [{ method: "whatsapp" as const, value: "+972545555555" }],
  consent: true,
  status: "new",
  createdAt: "2026-06-30T12:00:00.000Z",
  files: [
    {
      status: "available",
      id: "file-1",
      originalName: "reference-01.jpg",
      type: "artist_work",
      signedUrl: "https://storage.example.com/signed/reference-01.jpg?token=abc",
    },
    {
      status: "unavailable",
      id: "file-2",
      originalName: "placement-01.jpg",
      type: "placement_photo",
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
    expect(screen.getByText("Black & grey")).toBeInTheDocument()
    expect(screen.getByText("$300")).toBeInTheDocument()
  })

  it.each([
    ["email", "alex@example.com", "Email", "mailto:alex@example.com"],
    ["phone", "+972545555555", "Call", "tel:+972545555555"],
    ["whatsapp", "+972545555555", "WhatsApp", "https://wa.me/972545555555"],
  ] as const)("renders a %s quick action linking to the right target", (method, value, name, href) => {
    render(
      <RequestDetail
        request={{ ...baseRequest, contacts: [{ method, value }] }}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByRole("link", { name })).toHaveAttribute("href", href)
  })

  // Only the provided method appears — an empty method takes no space on the card
  // (PROJECT_DECISIONS.md — "Stage 6 Contact Model").
  it("renders only the provided contact method, not the absent ones", () => {
    render(
      <RequestDetail
        request={{ ...baseRequest, contacts: [{ method: "instagram", value: "masha" }] }}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByText("masha")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Email" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Call" })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument()
  })

  // A handle is not a URL: guessing a profile link from it would fabricate a destination.
  it("renders an Instagram/Telegram handle as plain text, not a link", () => {
    render(
      <RequestDetail
        request={{ ...baseRequest, contacts: [{ method: "telegram", value: "masha_t" }] }}
        locale="en"
        t={makeT()}
        updateStatusAction={noopUpdateStatusAction}
      />,
    )

    expect(screen.getByText("masha_t")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "masha_t" })).not.toBeInTheDocument()
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
