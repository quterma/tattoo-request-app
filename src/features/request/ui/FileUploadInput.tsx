import { useState, type ChangeEvent } from "react"
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
  maxFilesWarning: string
  removeFileLabel: (fileName: string) => string
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
  maxFilesWarning,
  removeFileLabel,
}: FileUploadInputProps) {
  const [showMaxFilesWarning, setShowMaxFilesWarning] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const combined = [...value, ...selected].slice(0, maxFiles)
    setShowMaxFilesWarning(value.length + selected.length > maxFiles)
    onChange(combined)
    e.target.value = ""
  }

  function handleRemove(index: number) {
    setShowMaxFilesWarning(false)
    onChange(value.filter((_, i) => i !== index))
  }

  const fileList =
    value.length > 0 ? (
      <ul className="flex flex-col gap-0.5">
        {value.map((file, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              aria-label={removeFileLabel(file.name)}
              className="shrink-0 text-destructive hover:underline"
            >
              &times;
            </button>
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
      {showMaxFilesWarning && (
        <p role="alert" className="text-xs text-muted-foreground">
          {maxFilesWarning}
        </p>
      )}
    </FormFieldLayout>
  )
}
