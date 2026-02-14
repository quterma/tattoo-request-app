import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { Page, Section, Stack } from "@/shared/ui"

export default function AftercarePage() {
  const t = useTranslations("aftercare")

  return (
    <Page>
      <Section>
        <Link
          href="/policies"
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
        >
          {t("backToPolicies")}
        </Link>
        <h1 className="mt-4">{t("title")}</h1>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("beforeAppointment")}</h2>
          <p className="text-muted-foreground">{t("beforeAppointmentText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("tattooDay")}</h2>
          <p className="text-muted-foreground">{t("tattooDayText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("aftercareInstructions")}</h2>
          <p className="text-muted-foreground">
            {t("aftercareInstructionsText")}
          </p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("healingTouchUps")}</h2>
          <p className="text-muted-foreground">{t("healingTouchUpsText")}</p>
        </Stack>
      </Section>
    </Page>
  )
}
