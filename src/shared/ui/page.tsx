import type { ComponentProps } from "react"
import { cn } from "../utils"
import { Container } from "./container"

type PageProps = ComponentProps<"main">

export function Page({ className, children, ...props }: PageProps) {
  return (
    <main className={cn("min-h-screen py-8 sm:py-12", className)} {...props}>
      <Container>{children}</Container>
    </main>
  )
}
