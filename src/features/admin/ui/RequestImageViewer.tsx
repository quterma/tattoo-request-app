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
