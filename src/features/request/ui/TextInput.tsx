import type { InputHTMLAttributes } from "react"
import { forwardRef } from "react"
import { FormFieldLayout } from "./field/FormFieldLayout"

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  hint?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    return (
      <FormFieldLayout label={label} hint={hint} error={error} htmlFor={id}>
        <input
          ref={ref}
          id={id}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          {...props}
        />
      </FormFieldLayout>
    )
  },
)
TextInput.displayName = "TextInput"
