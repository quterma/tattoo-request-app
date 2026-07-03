import type { getTranslations } from "next-intl/server"
import { Link } from "@/shared/i18n"
import type { AdminRequestListItem } from "../types"

type RequestCardProps = {
  request: AdminRequestListItem
  locale: string
  t: Awaited<ReturnType<typeof getTranslations>>
}

function formatCreatedAt(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate))
}

export function RequestCard({ request, locale, t }: RequestCardProps) {
  const statusLabel = t.has(`statuses.${request.status}`)
    ? t(`statuses.${request.status}`)
    : request.status
  const placementLabel = t.has(`placementLabels.${request.placement}`)
    ? t(`placementLabels.${request.placement}`)
    : request.placement
  const sizeLabel = t.has(`sizeLabels.${request.size}`)
    ? t(`sizeLabels.${request.size}`)
    : request.size
  const colorLabel = t.has(`colorLabels.${request.color}`)
    ? t(`colorLabels.${request.color}`)
    : request.color

  return (
    <Link
      href={`/admin/requests/${request.id}`}
      className="block rounded-lg border border-border bg-background p-4 hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-muted-foreground">{request.referenceCode}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium">
          {statusLabel}
        </span>
      </div>
      <p className="mt-1 truncate text-base font-semibold text-foreground">{request.clientName}</p>
      <p className="mt-1 truncate text-sm text-muted-foreground">
        {placementLabel} · {sizeLabel} · {colorLabel}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatCreatedAt(request.createdAt, locale)}
      </p>
    </Link>
  )
}
