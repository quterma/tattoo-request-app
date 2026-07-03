import { Page } from "@/shared/ui"
import { RequestDetailSkeleton } from "@/features/admin/ui"

export default function AdminRequestDetailLoading() {
  return (
    <Page>
      <RequestDetailSkeleton />
    </Page>
  )
}
