import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { CtaRequestButton, Page, Section, Stack } from "@/shared/ui"

const RICH_TAGS = {
  b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
}

export default function ProcessPage() {
  const t = useTranslations("process")
  const faqItems = t.raw("faqItems") as { q: string; a: string }[]

  return (
    <Page className="py-4 sm:py-8">
      <Section className="py-2 sm:py-3">
        <h1>{t("title")}</h1>
        <p className="text-muted-foreground mt-2 mb-0">{t("overviewText")}</p>
      </Section>

      <Section id="good-fit" className="py-2 sm:py-3 scroll-mt-20">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("goodFit")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("goodFitText")}
          </p>
        </Stack>
      </Section>

      <Section id="pricing" className="py-2 sm:py-3 scroll-mt-20">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("pricing")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("pricingText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("booking")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t.rich("bookingText", RICH_TAGS)}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("design")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("designText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("touchUps")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("touchUpsText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("age")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("ageText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("languages")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("languagesText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("payment")}</h2>
          <p className="whitespace-pre-line text-muted-foreground mb-0">
            {t("paymentText")}
          </p>
        </Stack>
      </Section>

      <Section className="py-2 sm:py-3">
        <Stack gap="gap-1.5">
          <h2 className="mb-1">{t("faq")}</h2>
          <Stack gap="gap-3">
            {faqItems.map((item, index) => (
              <div key={item.q}>
                <p className="mb-1 font-semibold">{item.q}</p>
                <p className="text-muted-foreground mb-0">
                  {t.rich(`faqItems.${index}.a`, {
                    prep: (chunks) => <Link href="/preparation">{chunks}</Link>,
                    aftercare: (chunks) => <Link href="/aftercare">{chunks}</Link>,
                  })}
                </p>
              </div>
            ))}
          </Stack>
        </Stack>
      </Section>

      <Section className="py-3 sm:py-3 text-center">
        <Stack gap="gap-5" className="items-center">
          <CtaRequestButton />
        </Stack>
      </Section>
    </Page>
  )
}
