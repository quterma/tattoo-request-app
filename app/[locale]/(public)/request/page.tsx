import { useTranslations } from "next-intl"
import { Page, Section, Stack } from "@/shared/ui"
import { RequestForm } from "@/features/request/ui"

export default function RequestPage() {
  const t = useTranslations("request")

  return (
    <Page>
      <Section>
        {/* The Stack supplies the title→form spacing the removed `h1` flow margin used to give
            (TASK_18 scope item 5). Without it the two are bare siblings and render flush. */}
        <Stack gap="gap-3">
          <h1>{t("title")}</h1>
          <RequestForm />
        </Stack>
      </Section>
    </Page>
  )
}
