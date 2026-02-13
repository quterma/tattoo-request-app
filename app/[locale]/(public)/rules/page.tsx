import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"

export default function RulesPage() {
  const t = useTranslations("nav")

  return (
    <Page>
      <Section>
        <h1>{t("rules")}</h1>
      </Section>
    </Page>
  )
}
