"use client"

import { useTranslations } from "next-intl"
import { Container } from "./container"

export function PublicFooter() {
  const t = useTranslations("footer")

  return (
    <footer className="border-t border-border py-6">
      <Container>
        <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground">
          <p className="mb-0 font-semibold text-foreground">{t("studio")}</p>
          <p className="mb-0">{t("address")}</p>
          <a href={`mailto:${t("email")}`} className="text-sm">
            {t("email")}
          </a>
          <a href={`tel:${t("phone")}`} className="text-sm">
            {t("phone")}
          </a>
          <p className="mb-0 mt-3 text-xs">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </Container>
    </footer>
  )
}
