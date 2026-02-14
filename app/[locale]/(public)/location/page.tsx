import { useTranslations } from "next-intl"
import { Page, Section, Stack } from "@/shared/ui"

const MAP_LINKS = [
  {
    labelKey: "googleMaps",
    href: "https://maps.google.com/?q=Herzl+100+Tel+Aviv",
  },
  {
    labelKey: "appleMaps",
    href: "https://maps.apple.com/?q=Herzl+100+Tel+Aviv",
  },
  { labelKey: "waze", href: "https://waze.com/ul?q=Herzl+100+Tel+Aviv" },
] as const

export default function LocationPage() {
  const t = useTranslations("location")

  return (
    <Page>
      <Section>
        <h1>{t("title")}</h1>
      </Section>

      <Section>
        <p className="text-muted-foreground">{t("address")}</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {MAP_LINKS.map(({ labelKey, href }) => (
            <a
              key={labelKey}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-border px-3 py-2 text-center text-sm transition-colors hover:bg-muted"
            >
              {t(labelKey)}
            </a>
          ))}
        </div>
      </Section>

      <Section>
        <div className="aspect-video w-full rounded-md bg-muted" />
      </Section>

      <Section>
        <Stack gap="gap-2">
          <h2>{t("howToFindUs")}</h2>
          <p className="text-muted-foreground">{t("howToFindUsText")}</p>
        </Stack>
      </Section>

      <Section>
        <h2>{t("studioPhotos")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="aspect-video rounded-md bg-muted" />
          ))}
        </div>
      </Section>
    </Page>
  )
}
