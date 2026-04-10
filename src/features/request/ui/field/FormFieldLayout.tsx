import type { ReactNode } from "react"
import { FieldError } from "./FieldError"
import { FieldHint } from "./FieldHint"
import { FieldLabel } from "./FieldLabel"

type FormFieldLayoutProps = {
  label?: string
  hint?: string
  error?: string
  htmlFor?: string
  footer?: ReactNode
  children: ReactNode
}

export function FormFieldLayout({ label, hint, error, htmlFor, footer, children }: FormFieldLayoutProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
      {children}
      {hint && !error && <FieldHint>{hint}</FieldHint>}
      {error && <FieldError>{error}</FieldError>}
      {footer}
    </div>
  )
}
