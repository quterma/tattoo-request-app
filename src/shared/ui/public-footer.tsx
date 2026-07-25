"use client"

import { useTranslations } from "next-intl"
import { studio } from "@/config"
import { Container } from "./container"
import { InstagramIcon } from "./icons"

export function PublicFooter() {
  const t = useTranslations("footer")

  return (
    <footer className="border-t border-border py-6">
      <Container>
        <div className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground">
          <p className="mb-0 font-semibold text-foreground">{studio.name}</p>
          <p className="mb-0">{studio.address}</p>
          <div className="flex items-center gap-3">
            <a
              href={studio.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-4" />
            </a>
          </div>
          <p className="mb-0 mt-3 text-xs">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </Container>
    </footer>
  )
}
