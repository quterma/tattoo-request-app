import type { ComponentProps } from "react"
import { cn } from "../utils"

type ContainerProps = ComponentProps<"div">

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("w-full px-4 mx-auto sm:max-w-2xl lg:max-w-4xl", className)}
      {...props}
    />
  )
}
