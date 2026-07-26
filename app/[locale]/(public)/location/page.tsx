import Image from "next/image"
import { useTranslations } from "next-intl"
import { studio } from "@/config"
import { CtaRequestButton, Page, Section, Stack } from "@/shared/ui"

const addressQuery = encodeURIComponent(studio.address)

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
    <Page density="tight">
      <Section density="tight">
        <h1>{t("title")}</h1>
      </Section>

      <Section density="tight">
        <p className="text-muted-foreground">{studio.address}</p>

        {/* `mt-4` (16px), not a Stack gap: the outgoing render collapsed the paragraph's 1em flow
            margin with the grid's `mt-3` to 16px, and 16px is not in `StackGap`. */}
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

      <Section density="tight">
        <iframe
          src={`https://maps.google.com/maps?q=${addressQuery}&output=embed`}
          title={t("mapTitle")}
          loading="lazy"
          className="aspect-video w-full rounded-md border-0"
        />
      </Section>

      <Section density="tight">
        <Stack gap="gap-1.5">
          <h2>{t("howToFindUs")}</h2>
          <p className="text-muted-foreground">{t("howToFindUsText")}</p>
        </Stack>
      </Section>

      <Section density="tight">
        <Stack gap="gap-3">
          <h2>{t("studioPhotos")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* __asset_TODO: Studio interior placeholder 1 of 3, AI-generated — see TASK_16 */}
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <Image
                src="/images/studio-1.jpg"
                alt={t("studioPhotoAlt1")}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* __asset_TODO: Studio interior placeholder 2 of 3, AI-generated — see TASK_16 */}
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <Image
                src="/images/studio-2.jpg"
                alt={t("studioPhotoAlt2")}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* __asset_TODO: Studio interior placeholder 3 of 3, AI-generated — see TASK_16 */}
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <Image
                src="/images/studio-3.jpg"
                alt={t("studioPhotoAlt3")}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Stack>
      </Section>

      <Section density="tight" className="text-center">
        <CtaRequestButton />
      </Section>
    </Page>
  )
}
