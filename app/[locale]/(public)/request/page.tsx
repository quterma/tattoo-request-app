import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"
import { RequestForm } from "@/features/request/ui"

export default function RequestPage() {
  const t = useTranslations("request")

  return (
    <Page>
      <Section>
        <h1>{t("title")}</h1>
        <RequestForm />
      </Section>
    </Page>
  )
}
