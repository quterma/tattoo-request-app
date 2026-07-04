import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RequestStatusForm } from "../ui/RequestStatusForm"
import type { UpdateRequestStatusResult } from "../types"

const statusOptionLabels = {
  new: "New",
  active: "Active",
  booked: "Booked",
  completed: "Completed",
  rejected: "Rejected",
}

const baseProps = {
  currentStatus: "new" as const,
  statusLabel: "Status",
  statusOptionLabels,
  submitLabel: "Update status",
  submitLabelPending: "Updating…",
  successMessage: "Status updated.",
}

describe("RequestStatusForm", () => {
  afterEach(() => {
    cleanup()
  })

  it("selects the current status initially", () => {
    render(<RequestStatusForm {...baseProps} currentStatus="booked" action={vi.fn()} />)

    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("booked")
  })

  it("renders all status options", () => {
    render(<RequestStatusForm {...baseProps} action={vi.fn()} />)

    expect(screen.getByRole("option", { name: "New" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Booked" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Completed" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Rejected" })).toBeInTheDocument()
  })

  it("shows a success message when the action resolves ok", async () => {
    const user = userEvent.setup()
    const action = vi.fn(async (): Promise<UpdateRequestStatusResult> => ({ ok: true }))

    render(<RequestStatusForm {...baseProps} action={action} />)

    await user.click(screen.getByRole("button", { name: "Update status" }))

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Status updated.")
    })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows the generic inline error when the action resolves not ok", async () => {
    const user = userEvent.setup()
    const action = vi.fn(
      async (): Promise<UpdateRequestStatusResult> => ({
        ok: false,
        error: "This request is no longer available.",
      }),
    )

    render(<RequestStatusForm {...baseProps} action={action} />)

    await user.click(screen.getByRole("button", { name: "Update status" }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("This request is no longer available.")
    })
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
