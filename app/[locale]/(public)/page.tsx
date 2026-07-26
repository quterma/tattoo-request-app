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
        {/* __asset_TODO: Home hero background placeholder, AI-generated — see TASK_18 */}
        <div className="absolute inset-0 bg-muted">
          <Image
            src="/images/hero.jpg"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Scrim: white/70 body copy over the darkest-scrim result measures 5.60:1 at the
            image's brightest region — above WCAG AA's 4.5:1 for body text. */}
        <div className="absolute inset-0 bg-black/50" />

        <Container className="relative z-10 py-16 text-center">
          {/* `.text-display` replaces the hero's former `text-4xl sm:text-5xl`, putting the hero on
              the shared type scale instead of opting out of it. Font-size is identical at both ends
              (2.25rem / 3rem); line-height is not — the utilities carried 2.5rem/1, `.text-display`
              carries 1.1, so the single-line studio name's line box grows ~4.8px at ≥40rem.
              The copy block is a Stack (gap-3 = the former `mb-3`s). The outer 32px rhythm stays a
              raw flex container: 32px is not in `StackGap`, and Block A established that union from
              actual Stack call sites — widening it for one hero would undo that. */}
          <div className="flex flex-col items-center gap-8">
            <Stack gap="gap-3" className="items-center">
              <h1 className="text-display font-bold tracking-tight text-white">
                {studio.name}
              </h1>
              <p className="max-w-md text-lg text-white/80">
                {t("heroSpecialization")}
              </p>
              <p className="max-w-md text-sm text-white/70">{t("heroTagline")}</p>
            </Stack>

            <CtaRequestButton />

            <a
              href={studio.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("instagramLabel")}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <InstagramIcon className="size-5" />
              <span>@{studio.instagramHandle}</span>
            </a>
          </div>
        </Container>
      </section>

      <Container>
        <Section density="normal">
          <Stack gap="gap-3">
            <h2>{t("featuredWorkTitle")}</h2>
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
            {/* The Stack's gap-3 (12px) + mt-1 (4px) = the 16px this link rendered before. The
                h2→grid gap above it is 12px, and one Stack cannot carry two different gaps. */}
            <a
              href={studio.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <InstagramIcon className="size-4" />
              <span>{t("seeMoreOnInstagram")}</span>
            </a>
          </Stack>
        </Section>

        <Section density="normal">
          <Stack gap="gap-2">
            <p className="text-muted-foreground">{t("goodFitTeaserText")}</p>
            <Link
              href="/process#good-fit"
              className="text-sm underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {t("goodFitTeaserLink")}
            </Link>
          </Stack>
        </Section>

        <Section density="normal">
          <Stack gap="gap-6">
            <h2>{t("howItWorksTitle")}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STEP_KEYS.map((step) => (
                <p key={step} className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {step}. {t(`step${step}Title`)}
                  </span>{" "}
                  — {t(`step${step}Text`)}
                </p>
              ))}
            </div>
          </Stack>
        </Section>

        <Section density="normal">
          <Stack gap="gap-2">
            <p className="text-muted-foreground">{t("priceTeaserText")}</p>
            <Link
              href="/process#pricing"
              className="text-sm underline underline-offset-2 transition-colors hover:text-foreground"
            >
              {t("priceTeaserLink")}
            </Link>
          </Stack>
        </Section>

        <Section density="normal" className="text-center">
          <CtaRequestButton />
        </Section>
      </Container>
    </main>
  )
}
