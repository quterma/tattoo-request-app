import type { InputHTMLAttributes, ReactNode } from "react"
import { forwardRef } from "react"
import { FieldError } from "./field/FieldError"

type CheckboxInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string
  label: ReactNode
  error?: string
}

export const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="flex items-start gap-2 cursor-pointer">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            {...props}
          />
          <span className="text-sm text-foreground">{label}</span>
        </label>
        {error && <FieldError>{error}</FieldError>}
      </div>
    )
  },
)
CheckboxInput.displayName = "CheckboxInput"
