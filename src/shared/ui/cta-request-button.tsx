import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n"

export function CtaRequestButton() {
  const t = useTranslations("cta")

  return (
    <Link
      href="/request"
      className="inline-block rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
    >
      {t("requestButton")}
    </Link>
  )
}
