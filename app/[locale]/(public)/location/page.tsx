import { useTranslations } from "next-intl"
import { Page, Section, Stack } from "@/shared/ui"

const addressQuery = encodeURIComponent("Herzl 100, Tel Aviv, Israel")

const MAP_LINKS = [
  {
    labelKey: "googleMaps",
    href: `https://maps.google.com/?q=${addressQuery}`,
  },
  { labelKey: "appleMaps", href: `https://maps.apple.com/?q=${addressQuery}` },
  { labelKey: "waze", href: `https://waze.com/ul?q=${addressQuery}` },
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

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {MAP_LINKS.map(({ labelKey, href }) => (
            <a
              key={labelKey}
              href={href}
              className="rounded-md border border-border px-2 py-2 text-center text-sm leading-tight break-words transition-colors hover:bg-muted sm:px-3"
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
