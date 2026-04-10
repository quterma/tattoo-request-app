import type { ChangeEvent } from "react"
import { FormFieldLayout } from "./field/FormFieldLayout"

type FileUploadInputProps = {
  id: string
  label: string
  buttonText: string
  hint?: string
  error?: string
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

export function FileUploadInput({
  id,
  label,
  buttonText,
  hint,
  error,
  value,
  onChange,
  maxFiles = 3,
}: FileUploadInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    onChange(selected.slice(0, maxFiles))
    e.target.value = ""
  }

  const fileList =
    value.length > 0 ? (
      <ul className="flex flex-col gap-0.5">
        {value.map((file, i) => (
          <li key={i} className="text-xs text-muted-foreground truncate">
            {file.name}
          </li>
        ))}
      </ul>
    ) : null

  return (
    <FormFieldLayout label={label} hint={hint} error={error} htmlFor={id} footer={fileList}>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleChange}
      />
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
      >
        {buttonText}
      </label>
    </FormFieldLayout>
  )
}
