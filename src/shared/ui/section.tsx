import type { ComponentProps } from "react"
import { cn } from "../utils"

/* Vertical rhythm, as a small named set. Named `density` rather than `variant` so it cannot be
   mistaken for a hook for future colour/style variants — those belong to Stage 7.
   `loose` is the default because it is what today's bare call sites render; the 3 admin ones among
   them are outside every block's write surface and must not shift. Block B moves the content
   sections to `tight` and Home to `normal`.

   There is deliberately no entry for `py-3 sm:py-3` (2 centred CTA sections, on Process and
   Location): it sits between `tight` and `normal` and differs from `tight` by 4px at mobile only,
   so Block B maps both to `tight`. Named in the approved plan; a fourth variant for a 4px delta on
   two elements would be the "open className free-for-all" this set exists to replace. */
const SECTION_DENSITY = {
  tight: "py-2 sm:py-3",
  normal: "py-4 sm:py-6",
  loose: "py-6 sm:py-8",
} as const

export type SectionDensity = keyof typeof SECTION_DENSITY

type SectionProps = ComponentProps<"section"> & {
  density?: SectionDensity
}

export function Section({
  className,
  density = "loose",
  ...props
}: SectionProps) {
  // `className` stays last so Block B's not-yet-removed py-* overrides still win via tailwind-merge.
  return (
    <section className={cn(SECTION_DENSITY[density], className)} {...props} />
  )
}
