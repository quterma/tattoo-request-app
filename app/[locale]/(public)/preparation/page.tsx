import { useTranslations } from "next-intl"
import { Page, Section, Stack } from "@/shared/ui"

export default function PreparationPage() {
  const t = useTranslations("preparation")

  const bullets = (key: string) =>
    t(key)
      .split("\n")
      .map((item, i) => (
        <li key={i} className="text-muted-foreground">
          {item}
        </li>
      ))

  return (
    <Page className="py-4 sm:py-8">
      <Section className="py-2 sm:py-3">
        <h1>{t("title")}</h1>
      </Section>

      <Section className="py-2 sm:py-3">
        <p className="mb-0 text-muted-foreground">{t("intro")}</p>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("beforeAppointment")}</h2>
          <ul className="list-disc ps-5">
            {bullets("beforeAppointmentItems")}
          </ul>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("tattooDay")}</h2>
          <ul className="list-disc ps-5">{bullets("tattooDayItems")}</ul>
        </Stack>
      </Section>
    </Page>
  )
}
