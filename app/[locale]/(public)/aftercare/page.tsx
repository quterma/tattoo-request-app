import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { Page, Section, Stack } from "@/shared/ui"

export default function AftercarePage() {
  const t = useTranslations("aftercare")

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
        <Link
          href="/policies"
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
        >
          {t("backToPolicies")}
        </Link>
        <h1 className="mt-3">{t("title")}</h1>
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

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("aftercareInstructions")}</h2>
          <ul className="list-disc ps-5">
            {bullets("aftercareInstructionsItems")}
          </ul>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("healingTouchUps")}</h2>
          <ul className="list-disc ps-5">{bullets("healingTouchUpsItems")}</ul>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Link
          href="/policies"
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
        >
          {t("backToPolicies")}
        </Link>
      </Section>
    </Page>
  )
}
