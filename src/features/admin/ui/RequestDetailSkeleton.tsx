export function RequestDetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-4">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-11 w-24 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="mt-6">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-16 w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
