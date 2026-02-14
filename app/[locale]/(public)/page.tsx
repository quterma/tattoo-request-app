import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { Container, InstagramIcon, Section, Stack } from "@/shared/ui"

export default function Home() {
  const t = useTranslations("home")
  const footer = useTranslations("footer")

  return (
    <main className="min-h-screen">
      <section className="relative flex min-h-[80vh] items-center justify-center">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-0 bg-black/50" />

        <Container className="relative z-10 py-16 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mb-8 max-w-md text-lg text-white/80">
            {t("tagline")}
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/request"
              className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              {t("requestButton")}
            </Link>
            <Link
              href="/policies"
              className="text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
            >
              {t("policiesLink")}
            </Link>
          </div>

          <a
            href={footer("instagramUrl")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("instagramLabel")}
            className="mt-8 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <InstagramIcon className="size-5" />
            <span>{t("instagramHandle")}</span>
          </a>
        </Container>
      </section>

      <Container>
        <Section className="py-4 sm:py-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="aspect-[4/5] rounded-lg bg-muted" />
            <div className="aspect-[4/5] rounded-lg bg-muted" />
            <div className="aspect-[4/5] rounded-lg bg-muted" />
          </div>
          <a
            href={footer("instagramUrl")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <InstagramIcon className="size-4" />
            <span>{t("seeMoreOnInstagram")}</span>
          </a>
        </Section>

        <Section className="py-4 sm:py-6">
          <Stack gap="gap-6">
            <h2 className="mb-1">{t("howItWorksTitle")}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="mb-1 font-semibold">1. {t("step1Title")}</p>
                <p className="mb-0 text-sm text-muted-foreground">
                  {t("step1Text")}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">2. {t("step2Title")}</p>
                <p className="mb-0 text-sm text-muted-foreground">
                  {t.rich("step2Text", {
                    policies: (chunks) => (
                      <Link
                        href="/policies"
                        className="underline underline-offset-2 transition-colors hover:text-foreground"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">3. {t("step3Title")}</p>
                <p className="mb-0 text-sm text-muted-foreground">
                  {t("step3Text")}
                </p>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="/request"
                className="inline-block rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                {t("requestButton")}
              </Link>
            </div>
          </Stack>
        </Section>

        <Section className="py-4 sm:py-6 text-center">
          <p className="mb-1 text-muted-foreground">{t("aboutLine1")}</p>
          <p className="mb-0 text-muted-foreground">{t("aboutLine2")}</p>
        </Section>
      </Container>
    </main>
  )
}
