import Image from "next/image"
import { useTranslations } from "next-intl"
import { studio } from "@/config"
import { Link } from "@/shared/i18n"
import {
  Container,
  CtaRequestButton,
  InstagramIcon,
  Section,
  Stack,
} from "@/shared/ui"

const STEP_KEYS = [1, 2, 3, 4, 5] as const

export default function Home() {
  const t = useTranslations("home")

  return (
    <main className="min-h-screen">
      <section className="relative flex min-h-[80vh] items-center justify-center">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-0 bg-black/50" />

        <Container className="relative z-10 py-16 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {studio.name}
          </h1>
          <p className="mx-auto mb-3 max-w-md text-lg text-white/80">
            {t("heroSpecialization")}
          </p>
          <p className="mx-auto mb-8 max-w-md text-sm text-white/70">
            {t("heroTagline")}
          </p>

          <div className="flex flex-col items-center gap-4">
            <CtaRequestButton />
          </div>

          <a
            href={studio.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("instagramLabel")}
            className="mt-8 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <InstagramIcon className="size-5" />
            <span>@{studio.instagramHandle}</span>
          </a>
        </Container>
      </section>

      <Container>
        <Section className="py-4 sm:py-6">
          <h2 className="mb-3">{t("featuredWorkTitle")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* __asset_TODO: Featured Work placeholder 1 of 4, AI-generated — see TASK_16 */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/featured-1.jpg"
                alt={t("featuredWorkAlt1")}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* __asset_TODO: Featured Work placeholder 2 of 4, AI-generated — see TASK_16 */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/featured-2.jpg"
                alt={t("featuredWorkAlt2")}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* __asset_TODO: Featured Work placeholder 3 of 4, AI-generated — see TASK_16 */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/featured-3.jpg"
                alt={t("featuredWorkAlt3")}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* __asset_TODO: Featured Work placeholder 4 of 4, AI-generated — see TASK_16 */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/featured-4.jpg"
                alt={t("featuredWorkAlt4")}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <a
            href={studio.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <InstagramIcon className="size-4" />
            <span>{t("seeMoreOnInstagram")}</span>
          </a>
        </Section>

        <Section className="py-4 sm:py-6">
          <Stack gap="gap-2">
            <p className="mb-0 text-muted-foreground">{t("goodFitTeaserText")}</p>
            <Link
              href="/process#good-fit"
              className="text-sm underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {t("goodFitTeaserLink")}
            </Link>
          </Stack>
        </Section>

        <Section className="py-4 sm:py-6">
          <Stack gap="gap-6">
            <h2 className="mb-1">{t("howItWorksTitle")}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEP_KEYS.map((step) => (
                <p key={step} className="mb-0 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {step}. {t(`step${step}Title`)}
                  </span>{" "}
                  — {t(`step${step}Text`)}
                </p>
              ))}
            </div>
          </Stack>
        </Section>

        <Section className="py-4 sm:py-6">
          <Stack gap="gap-2">
            <p className="mb-0 text-muted-foreground">{t("priceTeaserText")}</p>
            <Link
              href="/process#pricing"
              className="text-sm underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {t("priceTeaserLink")}
            </Link>
          </Stack>
        </Section>

        <Section className="py-4 sm:py-6 text-center">
          <CtaRequestButton />
        </Section>
      </Container>
    </main>
  )
}
