import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"

export default function RequestPage() {
  const t = useTranslations("nav")

  return (
    <Page>
      <Section>
        <h1>{t("request")}</h1>
      </Section>
    </Page>
  )
}
