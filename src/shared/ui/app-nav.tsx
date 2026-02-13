"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/shared/i18n"
import { cn } from "../utils"

const links = [
  { href: "/", labelKey: "home" },
  { href: "/request", labelKey: "request" },
  { href: "/rules", labelKey: "rules" },
  { href: "/location", labelKey: "location" },
] as const

export function AppNav() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background",
        "pb-[env(safe-area-inset-bottom)]",
        "sm:sticky sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b",
      )}
    >
      <ul className="flex items-center justify-around px-4 py-2 sm:justify-center sm:gap-8">
        {links.map(({ href, labelKey }) => {
          const isActive = pathname === href

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block px-2 py-1 text-sm transition-colors",
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(labelKey)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
