import type { ComponentProps } from "react"
import { cn } from "../utils"

/* The gaps actually in use, as raw Tailwind class strings rather than a semantic scale
   ("sm" | "md" | ...): all 18 call sites keep their current literal and compile unchanged, and
   `gap="gap-7"` now fails typecheck instead of silently working. That typo-safety is the point;
   the previous `gap?: string` caught nothing.

   NOTE: the old default `gap-4` is deliberately NOT in this union, and the default below changed
   to `gap-1.5`. `gap-4` was used by ZERO call sites — the primitive was advertising a value
   nothing wanted. This moves no pixel today (every call site passes an explicit gap), but it does
   mean a future bare <Stack> renders 6px, not 16px. Named in the approved Block A plan. */
export type StackGap = "gap-1.5" | "gap-2" | "gap-3" | "gap-5" | "gap-6"

type StackProps = ComponentProps<"div"> & {
  direction?: "vertical" | "horizontal"
  gap?: StackGap
}

export function Stack({
  className,
  direction = "vertical",
  gap = "gap-1.5",
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gap,
        className,
      )}
      {...props}
    />
  )
}
