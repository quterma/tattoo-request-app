import type { AdminRequestFile } from "../types"
import { RequestImageCard } from "./RequestImageCard"

type RequestImageGroupProps = {
  title: string
  files: AdminRequestFile[]
  unavailableLabel: string
  onImageClick?: (fileId: string) => void
}

export function RequestImageGroup({
  title,
  files,
  unavailableLabel,
  onImageClick,
}: RequestImageGroupProps) {
  if (files.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">
        {files.map((file) => (
          <RequestImageCard
            key={file.id}
            file={file}
            unavailableLabel={unavailableLabel}
            onClick={onImageClick ? () => onImageClick(file.id) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
