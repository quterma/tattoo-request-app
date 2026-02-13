import type { ComponentProps } from "react"
import { cn } from "../utils"

type StackProps = ComponentProps<"div"> & {
  direction?: "vertical" | "horizontal"
  gap?: string
}

export function Stack({
  className,
  direction = "vertical",
  gap = "gap-4",
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
