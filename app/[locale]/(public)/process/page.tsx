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
    <Page density="tight">
      <Section density="tight">
        <Stack gap="gap-2">
          <h1>{t("title")}</h1>
          <p className="text-muted-foreground">{t("overviewText")}</p>
        </Stack>
      </Section>

      <Section id="good-fit" density="tight" className="scroll-mt-20">
        <Stack gap="gap-1.5">
          <h2>{t("goodFit")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("goodFitText")}
          </p>
        </Stack>
      </Section>

      <Section id="pricing" density="tight" className="scroll-mt-20">
        <Stack gap="gap-1.5">
          <h2>{t("pricing")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("pricingText")}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("booking")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t.rich("bookingText", RICH_TAGS)}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("design")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("designText")}
          </p>
        </Stack>
      </Section>

      <Section id="touch-ups" density="tight" className="scroll-mt-20">
        <Stack gap="gap-1.5">
          <h2>{t("touchUps")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("touchUpsText")}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("age")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("ageText")}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("languages")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("languagesText")}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("payment")}</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {t("paymentText")}
          </p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("faq")}</h2>
          <Stack gap="gap-3">
            {faqItems.map((item, index) => (
              <Stack key={item.q} gap="gap-1.5">
                <p className="font-semibold">{item.q}</p>
                <p className="text-muted-foreground">
                  {t.rich(`faqItems.${index}.a`, {
                    prep: (chunks) => <Link href="/preparation">{chunks}</Link>,
                    aftercare: (chunks) => <Link href="/aftercare">{chunks}</Link>,
                  })}
                </p>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Section>

      <Section density="tight" className="text-center">
        <Stack gap="gap-5" className="items-center">
          <CtaRequestButton />
        </Stack>
      </Section>
    </Page>
  )
}
