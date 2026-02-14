import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"
import { Container, InstagramIcon } from "@/shared/ui"

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
    </main>
  )
}
