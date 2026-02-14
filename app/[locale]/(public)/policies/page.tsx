import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { Page, Section, Stack } from "@/shared/ui"

export default function PoliciesPage() {
  const t = useTranslations("policies")

  return (
    <Page>
      <Section>
        <h1>{t("title")}</h1>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("fees")}</h2>
          <p className="text-muted-foreground">{t("feesText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("pricingStandards")}</h2>
          <p className="text-muted-foreground">{t("pricingStandardsText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("deposits")}</h2>
          <p className="text-muted-foreground">{t("depositsText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("designPolicy")}</h2>
          <p className="text-muted-foreground">{t("designPolicyText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("touchUps")}</h2>
          <p className="text-muted-foreground">{t("touchUpsText")}</p>
        </Stack>
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("faq")}</h2>
          <p className="text-muted-foreground">{t("faqText")}</p>
        </Stack>
      </Section>

      <Section className="text-center">
        <Stack gap="gap-4" className="items-center">
          <Link
            href="/request"
            className="inline-block rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            {t("ctaButton")}
          </Link>
          <Link
            href="/aftercare"
            className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
          >
            {t("aftercareLink")}
          </Link>
        </Stack>
      </Section>
    </Page>
  )
}
