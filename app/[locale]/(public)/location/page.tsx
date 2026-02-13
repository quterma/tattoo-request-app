import { useTranslations } from "next-intl"
import { Page, Section } from "@/shared/ui"

export default function LocationPage() {
  const t = useTranslations("nav")

  return (
    <Page>
      <Section>
        <h1>{t("location")}</h1>
      </Section>
    </Page>
  )
}
