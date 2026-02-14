import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"

export default function PoliciesPage() {
  const t = useTranslations("nav")

  return (
    <Page>
      <Section>
        <h1>{t("policies")}</h1>
      </Section>
    </Page>
  )
}
