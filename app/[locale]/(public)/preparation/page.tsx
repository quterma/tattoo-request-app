import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
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
    <Page density="tight">
      <Section density="tight">
        <h1>{t("title")}</h1>
      </Section>

      <Section density="tight">
        <p className="text-muted-foreground">{t("intro")}</p>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("beforeAppointment")}</h2>
          <ul className="list-disc ps-5">
            {bullets("beforeAppointmentItems")}
          </ul>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("tattooDay")}</h2>
          <ul className="list-disc ps-5">{bullets("tattooDayItems")}</ul>
          {/* Continues the last bullet's "explain next steps" into the page that owns them.
              Preparation stays appointment-prep only (FS §3.6): this carries no aftercare
              content, it points at it. */}
          <p className="text-muted-foreground">
            {t.rich("aftercareLink", {
              aftercare: (chunks) => <Link href="/aftercare">{chunks}</Link>,
            })}
          </p>
        </Stack>
      </Section>
    </Page>
  )
}
