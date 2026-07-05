import { describe, it, expect, afterEach, vi } from "vitest"
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react"
import { RequestImageViewer } from "../ui/RequestImageViewer"
import type { AdminRequestFile } from "../types"

vi.mock("yet-another-react-lightbox/styles.css", () => ({}))
vi.mock("yet-another-react-lightbox/plugins/zoom", () => ({ default: "zoom-plugin" }))
type MockLightboxProps = {
  open: boolean
  index: number
  slides: { src: string; alt: string; width?: number; height?: number }[]
  close: () => void
  carousel?: { imageFit?: string; imageProps?: { style?: { width?: string; height?: string } } }
  zoom?: { maxZoomPixelRatio?: number }
}

const { mockLightboxProps } = vi.hoisted(() => ({
  mockLightboxProps: { current: null as MockLightboxProps | null },
}))

vi.mock("yet-another-react-lightbox", () => ({
  default: (props: MockLightboxProps) => {
    mockLightboxProps.current = props
    const { open, index, slides, close } = props
    if (!open) return null
    const current = slides[index]
    return (
      <div role="dialog" aria-label="image-viewer">
        <button type="button" onClick={close}>
          close
        </button>
        <img src={current.src} alt={current.alt} width={current.width} height={current.height} />
        <span data-testid="slide-count">{slides.length}</span>
      </div>
    )
  },
}))

const referenceFiles: AdminRequestFile[] = [
  {
    status: "available",
    id: "ref-1",
    originalName: "reference-01.jpg",
    type: "reference",
    signedUrl: "https://storage.example.com/signed/reference-01.jpg?token=abc",
  },
  {
    status: "unavailable",
    id: "ref-2",
    originalName: "reference-02.jpg",
    type: "reference",
  },
]

const placementFiles: AdminRequestFile[] = [
  {
    status: "available",
    id: "placement-1",
    originalName: "placement-01.jpg",
    type: "placement",
    signedUrl: "https://storage.example.com/signed/placement-01.jpg?token=xyz",
  },
]

function renderViewer() {
  return render(
    <RequestImageViewer
      referenceFiles={referenceFiles}
      placementFiles={placementFiles}
      referenceImagesTitle="Reference images"
      placementImagesTitle="Placement images"
      unavailableLabel="Image unavailable"
      closeLabel="Close"
    />,
  )
}

describe("RequestImageViewer", () => {
  afterEach(() => {
    cleanup()
  })

  it("does not render the viewer dialog until an available image is clicked", () => {
    renderViewer()
    expect(screen.queryByRole("dialog", { name: "image-viewer" })).not.toBeInTheDocument()
  })

  it("opens the viewer at the clicked reference image", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /reference-01\.jpg/i }))

    const dialog = screen.getByRole("dialog", { name: "image-viewer" })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByAltText("reference-01.jpg")).toHaveAttribute(
      "src",
      "https://storage.example.com/signed/reference-01.jpg?token=abc",
    )
  })

  it("opens the viewer at the clicked placement image, at the correct combined index", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /placement-01\.jpg/i }))

    const dialog = screen.getByRole("dialog", { name: "image-viewer" })
    expect(within(dialog).getByAltText("placement-01.jpg")).toHaveAttribute(
      "src",
      "https://storage.example.com/signed/placement-01.jpg?token=xyz",
    )
  })

  it("builds the combined slide set as reference images first, then placement images", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /reference-01\.jpg/i }))

    expect(screen.getByTestId("slide-count")).toHaveTextContent("2")
  })

  it("does not include unavailable files in the slide set and renders them as non-interactive", () => {
    renderViewer()

    expect(screen.getByText("reference-02.jpg")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /reference-02\.jpg/i })).not.toBeInTheDocument()
  })

  it("closes the viewer when close is triggered", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /reference-01\.jpg/i }))
    expect(screen.getByRole("dialog", { name: "image-viewer" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "close" }))
    expect(screen.queryByRole("dialog", { name: "image-viewer" })).not.toBeInTheDocument()
  })

  it("gives every slide a large fixed width/height so small images are not clamped to their native pixel size", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /reference-01\.jpg/i }))

    const dialog = screen.getByRole("dialog", { name: "image-viewer" })
    const img = within(dialog).getByAltText("reference-01.jpg")
    expect(img).toHaveAttribute("width", "4096")
    expect(img).toHaveAttribute("height", "4096")
  })

  it("configures the carousel and zoom plugin for fit-to-screen initial sizing with 2x zoom", () => {
    renderViewer()
    fireEvent.click(screen.getByRole("button", { name: /reference-01\.jpg/i }))

    expect(mockLightboxProps.current?.carousel).toMatchObject({
      imageFit: "contain",
      imageProps: { style: { width: "100%", height: "100%" } },
    })
    expect(mockLightboxProps.current?.zoom).toMatchObject({ maxZoomPixelRatio: 2 })
  })
})
