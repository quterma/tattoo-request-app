import type { AdminRequestFile } from "../types"
import { RequestImageCard } from "./RequestImageCard"

type RequestImageGroupProps = {
  title: string
  files: AdminRequestFile[]
  unavailableLabel: string
}

export function RequestImageGroup({ title, files, unavailableLabel }: RequestImageGroupProps) {
  if (files.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">
        {files.map((file) => (
          <RequestImageCard key={file.id} file={file} unavailableLabel={unavailableLabel} />
        ))}
      </div>
    </section>
  )
}
