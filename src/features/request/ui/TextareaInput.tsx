import type { TextareaHTMLAttributes } from "react"
import { forwardRef } from "react"
import { FormFieldLayout } from "./field/FormFieldLayout"

type TextareaInputProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  error?: string
  hint?: string
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    return (
      <FormFieldLayout label={label} hint={hint} error={error} htmlFor={id}>
        <textarea
          ref={ref}
          id={id}
          rows={4}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
          {...props}
        />
      </FormFieldLayout>
    )
  },
)
TextareaInput.displayName = "TextareaInput"
