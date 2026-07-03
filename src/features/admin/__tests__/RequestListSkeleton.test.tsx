import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { RequestListSkeleton } from "../ui/RequestListSkeleton"

describe("RequestListSkeleton", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders a data-free placeholder list hidden from assistive tech", () => {
    const { container } = render(<RequestListSkeleton />)
    const list = container.querySelector("ul")
    expect(list).toHaveAttribute("aria-hidden", "true")
    expect(list?.children.length).toBeGreaterThan(0)
  })
})
