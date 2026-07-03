import { Page, Section } from "@/shared/ui"
import { RequestListSkeleton } from "@/features/admin/ui"

export default function AdminRequestsLoading() {
  return (
    <Page>
      <Section>
        <RequestListSkeleton />
      </Section>
    </Page>
  )
}
