const SKELETON_CARD_COUNT = 5

export function RequestListSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <li key={index} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-14 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
        </li>
      ))}
    </ul>
  )
}
