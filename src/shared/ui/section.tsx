import type { ComponentProps } from "react"
import { cn } from "../utils"

type SectionProps = ComponentProps<"section">

export function Section({ className, ...props }: SectionProps) {
  return <section className={cn("py-6 sm:py-8", className)} {...props} />
}
