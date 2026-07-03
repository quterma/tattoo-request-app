import type { getTranslations } from "next-intl/server"
import type { AdminRequestListItem } from "../types"
import { RequestCard } from "./RequestCard"
import { EmptyState } from "./EmptyState"

type RequestListProps = {
  requests: AdminRequestListItem[]
  locale: string
  t: Awaited<ReturnType<typeof getTranslations>>
}

export function RequestList({ requests, locale, t }: RequestListProps) {
  if (requests.length === 0) {
    return <EmptyState message={t("requestListEmpty")} />
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((request) => (
        <li key={request.id}>
          <RequestCard request={request} locale={locale} t={t} />
        </li>
      ))}
    </ul>
  )
}
