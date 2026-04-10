import type { SelectHTMLAttributes } from "react"
import { forwardRef } from "react"
import { FormFieldLayout } from "./field/FormFieldLayout"

type SelectOption = { value: string; label: string }

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, options, placeholder, error, id, ...props }, ref) => {
    return (
      <FormFieldLayout label={label} error={error} htmlFor={id}>
        <select
          ref={ref}
          id={id}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormFieldLayout>
    )
  },
)
SelectInput.displayName = "SelectInput"
