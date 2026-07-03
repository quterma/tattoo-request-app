import type { AdminRequestFile } from "../types"

type RequestImageCardProps = {
  file: AdminRequestFile
  unavailableLabel: string
}

export function RequestImageCard({ file, unavailableLabel }: RequestImageCardProps) {
  if (file.status === "unavailable") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-8 text-center">
        <span className="text-sm text-muted-foreground">{unavailableLabel}</span>
        <span className="break-all text-xs text-muted-foreground">{file.originalName}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={file.signedUrl}
      alt={file.originalName}
      className="w-full rounded-lg border border-border"
    />
  )
}
