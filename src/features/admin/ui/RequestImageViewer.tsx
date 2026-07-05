"use client"

import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import type { AdminRequestFile } from "../types"
import { RequestImageGroup } from "./RequestImageGroup"

type RequestImageViewerProps = {
  referenceFiles: AdminRequestFile[]
  placementFiles: AdminRequestFile[]
  referenceImagesTitle: string
  placementImagesTitle: string
  unavailableLabel: string
  closeLabel: string
}

// Viewer sizing/zoom tuning — see PROJECT_DECISIONS.md, Minimal Image Viewer / Zoom, for the
// full root-cause explanation. No image dimensions exist in the DTO (Stage 4B never tracked
// width/height), so small source images (e.g. a 64x64 test upload) would otherwise open at
// their tiny native pixel size with no useful zoom.
//
// - VIEWER_IMAGE_MAX_DIMENSION: a declared slide width/height ceiling (not a real/forced size).
//   YARL's Zoom plugin computes its max-zoom rect from Math.max(slide.width, ..., naturalWidth) —
//   without this, zoom math is relative to the tiny native size and stays uselessly small. Real
//   photos already exceed this value, so it has no effect on normal-sized images.
// - VIEWER_MAX_ZOOM_PIXEL_RATIO: multiplies against the fitted display size (see imageProps
//   below) to give roughly 2x zoom from a useful fit-to-screen size, not from the raw image.
// - viewerImageProps: the actual fix for initial display size. YARL's ImageSlide only ever
//   applies max-width/max-height (a ceiling, never forcing an <img> to grow past its natural
//   size) — carousel.imageProps is the one officially-typed lever for overriding the image
//   element's own style, merged last into that same style object. Setting width/height: 100%
//   makes the image fill its slide box; imageFit: "contain" (below) then preserves aspect ratio
//   with no crop, upscaling small images to a useful size (blur is accepted, not avoided).
const VIEWER_IMAGE_MAX_DIMENSION = 4096
const VIEWER_MAX_ZOOM_PIXEL_RATIO = 2
const viewerImageProps = {
  style: {
    width: "100%",
    height: "100%",
  },
}

export function RequestImageViewer({
  referenceFiles,
  placementFiles,
  referenceImagesTitle,
  placementImagesTitle,
  unavailableLabel,
  closeLabel,
}: RequestImageViewerProps) {
  const [open, setOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  const availableFiles = [...referenceFiles, ...placementFiles].filter(
    (file) => file.status === "available",
  )
  const slides = availableFiles.map((file) => ({
    src: file.signedUrl,
    alt: file.originalName,
    width: VIEWER_IMAGE_MAX_DIMENSION,
    height: VIEWER_IMAGE_MAX_DIMENSION,
  }))

  function openViewerAt(fileId: string) {
    const index = availableFiles.findIndex((file) => file.id === fileId)
    if (index === -1) return
    setInitialIndex(index)
    setOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <RequestImageGroup
          title={referenceImagesTitle}
          files={referenceFiles}
          unavailableLabel={unavailableLabel}
          onImageClick={openViewerAt}
        />
        <RequestImageGroup
          title={placementImagesTitle}
          files={placementFiles}
          unavailableLabel={unavailableLabel}
          onImageClick={openViewerAt}
        />
      </div>

      {open ? (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={slides}
          index={initialIndex}
          plugins={[Zoom]}
          carousel={{ imageFit: "contain", imageProps: viewerImageProps }}
          zoom={{ maxZoomPixelRatio: VIEWER_MAX_ZOOM_PIXEL_RATIO }}
          controller={{ closeOnBackdropClick: true }}
          render={{
            buttonPrev: availableFiles.length > 1 ? undefined : () => null,
            buttonNext: availableFiles.length > 1 ? undefined : () => null,
          }}
          labels={{ Close: closeLabel }}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.95)" } }}
        />
      ) : null}
    </>
  )
}
