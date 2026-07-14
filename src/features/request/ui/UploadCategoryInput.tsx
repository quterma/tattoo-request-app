import { useRef, type ChangeEvent } from "react"
import { MAX_FILE_SIZE_BYTES, MAX_FILES_PER_FIELD } from "../config"
import type { UploadCategory } from "../config"
import { xhrUpload, UploadError } from "../lib/upload"
import {
  addSlot,
  getClientSubmissionId,
  removeSlot,
  updateSlot,
  useRequestDraft,
} from "../store"
import type { UploadSlot } from "../store"
import { VALIDATION_KEYS as K } from "../validation"
import { FormFieldLayout } from "./field/FormFieldLayout"

type UploadCategoryInputProps = {
  id: string
  category: UploadCategory
  label: string
  buttonText: string
  hint?: string
  uploadingLabel: string
  /** Translates a per-file validation key (e.g. upload_too_large) into a visitor-facing message. */
  errorMessage: (errorKey: string) => string
  retryLabel: string
  removeFileLabel: (fileName: string) => string
  maxFilesWarning: string
}

// Aborts are tracked per slot so remove-while-uploading cancels the in-flight request.
const controllers = new Map<string, AbortController>()

export function UploadCategoryInput({
  id,
  category,
  label,
  buttonText,
  hint,
  uploadingLabel,
  errorMessage,
  retryLabel,
  removeFileLabel,
  maxFilesWarning,
}: UploadCategoryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const draft = useRequestDraft()
  const slots = draft.slots.filter((slot) => slot.category === category)
  const atCapacity = slots.length >= MAX_FILES_PER_FIELD

  async function startUpload(slot: UploadSlot) {
    // Size is checked before the request leaves the browser, not only on the server: an
    // oversized body is rejected by the platform at the edge (Vercel's 4.5 MB request limit)
    // before our route can answer, so the visitor would otherwise wait out a doomed upload
    // and get an opaque failure. Lives here rather than in handleSelect so Retry is covered
    // by the same check.
    if (slot.file.size > MAX_FILE_SIZE_BYTES) {
      updateSlot(slot.slotId, { status: "failed", progress: 0, errorKey: K.UPLOAD_TOO_LARGE })
      return
    }

    const controller = new AbortController()
    controllers.set(slot.slotId, controller)

    try {
      const { handle } = await xhrUpload(slot.file, getClientSubmissionId(), category, {
        signal: controller.signal,
        onProgress: (percent) => updateSlot(slot.slotId, { progress: percent }),
      })
      updateSlot(slot.slotId, { status: "uploaded", progress: 100, handle, errorKey: undefined })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      const errorKey = err instanceof UploadError ? err.errorKey : K.UPLOAD_INVALID
      updateSlot(slot.slotId, { status: "failed", errorKey })
    } finally {
      controllers.delete(slot.slotId)
    }
  }

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const room = MAX_FILES_PER_FIELD - slots.length
    for (const file of selected.slice(0, Math.max(0, room))) {
      const slot: UploadSlot = {
        slotId: crypto.randomUUID(),
        category,
        file,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
        progress: 0,
      }
      addSlot(slot)
      void startUpload(slot)
    }
    e.target.value = ""
  }

  function handleRetry(slot: UploadSlot) {
    updateSlot(slot.slotId, { status: "uploading", progress: 0, errorKey: undefined })
    void startUpload({ ...slot, status: "uploading", progress: 0, errorKey: undefined })
  }

  function handleRemove(slot: UploadSlot) {
    controllers.get(slot.slotId)?.abort()
    controllers.delete(slot.slotId)
    removeSlot(slot.slotId)
  }

  const fileList =
    slots.length > 0 ? (
      <ul className="flex flex-col gap-2">
        {slots.map((slot) => (
          <li key={slot.slotId} className="flex items-center gap-2 text-xs text-muted-foreground">
            {/* FS §4.3: "Each image shows a thumbnail with a remove control." Rendered from the
                local File via an object URL — no signed URL is ever issued to a public visitor.
                Plain <img>, not next/image: the source is a blob: URL, which the image optimizer
                cannot process. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.previewUrl}
              alt=""
              className="size-10 shrink-0 rounded border border-border object-cover"
            />
            <span className="truncate">{slot.fileName}</span>
            {slot.status === "uploading" && (
              <span className="shrink-0" role="status">
                {uploadingLabel} {slot.progress}%
              </span>
            )}
            {slot.status === "failed" && (
              <>
                <span className="shrink-0 text-destructive" role="alert">
                  {errorMessage(slot.errorKey ?? K.UPLOAD_INVALID)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRetry(slot)}
                  className="shrink-0 hover:underline"
                >
                  {retryLabel}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => handleRemove(slot)}
              aria-label={removeFileLabel(slot.fileName)}
              className="shrink-0 text-destructive hover:underline"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    ) : null

  return (
    <FormFieldLayout label={label} hint={hint} htmlFor={id} footer={fileList}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="sr-only"
        onChange={handleSelect}
        disabled={atCapacity}
      />
      <label
        htmlFor={id}
        aria-disabled={atCapacity}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      >
        {buttonText}
      </label>
      {atCapacity && (
        <p role="alert" className="text-xs text-muted-foreground">
          {maxFilesWarning}
        </p>
      )}
    </FormFieldLayout>
  )
}
