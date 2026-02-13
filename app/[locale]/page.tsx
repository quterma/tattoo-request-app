import { useTranslations } from "next-intl"
import { Page, Section, Stack } from "@/shared/ui"

export default function Home() {
  const t = useTranslations("app")

  return (
    <Page>
      <Section>
        <Stack>
          <h1>{t("title")}</h1>
          <p className="text-muted">{t("description")}</p>
        </Stack>
      </Section>
    </Page>
  )
}
