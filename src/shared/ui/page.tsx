import type { ComponentProps } from "react"
import { cn } from "../utils"
import { Container } from "./container"

/* Two variants because there are exactly two observed values. `normal` is the default: it is what
   today's 7 bare call sites render. Block B moves the 4 content pages to `tight`. */
const PAGE_DENSITY = {
  tight: "py-4 sm:py-8",
  normal: "py-8 sm:py-12",
} as const

export type PageDensity = keyof typeof PAGE_DENSITY

type PageProps = ComponentProps<"main"> & {
  density?: PageDensity
}

export function Page({
  className,
  density = "normal",
  children,
  ...props
}: PageProps) {
  // `className` stays last so Block B's not-yet-removed py-* overrides still win via tailwind-merge.
  return (
    <main
      className={cn("min-h-screen", PAGE_DENSITY[density], className)}
      {...props}
    >
      <Container>{children}</Container>
    </main>
  )
}
