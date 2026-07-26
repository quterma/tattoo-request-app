import { useTranslations } from "next-intl"
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
    <Page density="tight">
      <Section density="tight">
        <h1>{t("title")}</h1>
      </Section>

      <Section density="tight">
        <p className="text-muted-foreground">{t("intro")}</p>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("aftercareInstructions")}</h2>
          <ul className="list-disc ps-5">
            {bullets("aftercareInstructionsItems")}
          </ul>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("healingTouchUps")}</h2>
          <ul className="list-disc ps-5">{bullets("healingTouchUpsItems")}</ul>
        </Stack>
      </Section>
    </Page>
  )
}
