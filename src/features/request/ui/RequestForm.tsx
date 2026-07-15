"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/shared/api"
import { getContactGroupError, getFieldError, getValidationKeyMessage } from "../lib/errors"
import {
  AGE_THRESHOLD,
  COLOR_OPTIONS,
  MAX_FILES_PER_FIELD,
  PLACEMENT_OPTIONS,
  SIZE_OPTIONS,
} from "../config"
import {
  getClientSubmissionId,
  invalidateUploadedSlots,
  resetDraft,
  useRequestDraft,
} from "../store"
import type { RequestFormData, RequestFormInput } from "../types"
import { requestFormSchema } from "../validation"
import { Button } from "./Button"
import { CheckboxInput } from "./CheckboxInput"
import { SelectInput } from "./SelectInput"
import { TextInput } from "./TextInput"
import { TextareaInput } from "./TextareaInput"
import { UploadCategoryInput } from "./UploadCategoryInput"

type SubmitStatus = "idle" | "submitting" | "success" | "error"

export function RequestForm() {
  const t = useTranslations("request")

  const draft = useRequestDraft()
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [referenceCode, setReferenceCode] = useState<string | null>(null)
  const [uploadHandlesError, setUploadHandlesError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      clientName: "",
      ideaDescription: "",
      placement: "",
      size: "",
      color: "",
      budget: "",
      email: "",
      phone: "",
      contactOther: "",
      eligibility: undefined,
    },
  })

  const [email, phone, contactOther] = useWatch({ control, name: ["email", "phone", "contactOther"] })
  useEffect(() => {
    if (errors.contactOther?.message && (email || phone || contactOther)) {
      clearErrors("contactOther")
    }
  }, [email, phone, contactOther, errors.contactOther?.message, clearErrors])

  // Submit waits for any in-flight upload to settle: a file the visitor watched
  // uploading must not be silently dropped. A failed upload still never blocks
  // submission (FS §4.5) — it resolves to "failed" and is skipped.
  const hasUploadingSlot = draft.slots.some((slot) => slot.status === "uploading")

  async function onSubmit(data: RequestFormData) {
    setStatus("submitting")
    setUploadHandlesError(null)

    try {
      const formData = new FormData()
      const f = REQUEST_FIELDS

      formData.append(f.clientSubmissionId, getClientSubmissionId())
      formData.append(f.clientName, data.clientName)
      formData.append(f.ideaDescription, data.ideaDescription)
      formData.append(f.placement, data.placement)
      formData.append(f.size, data.size)
      formData.append(f.color, data.color)
      formData.append(f.eligibility, String(data.eligibility))

      if (data.budget) formData.append(f.budget, data.budget)
      if (data.email) formData.append(f.email, data.email)
      if (data.phone) formData.append(f.phone, data.phone)
      if (data.contactOther) formData.append(f.contactOther, data.contactOther)

      for (const slot of draft.slots) {
        if (slot.status === "uploaded" && slot.handle) {
          formData.append(f.uploadHandles, slot.handle)
        }
      }

      const res = await fetch("/api/request", { method: "POST", body: formData })
      const response = await res.json()

      if (response.ok === true) {
        setReferenceCode(response.referenceCode ?? null)
        setStatus("success")
        resetDraft()
      } else if (response.error?.code === API_ERROR_CODES.VALIDATION_ERROR) {
        const fieldErrors = response.error.fieldErrors as Record<string, string[]>

        // uploadHandles is not a rendered form control, so setError() on it would be
        // invisible — the visitor would press Submit and see nothing happen. The handles
        // the form holds are dead (expired TTL or otherwise unadoptable), so surface it as
        // a recoverable state instead: flip the uploaded slots back to `failed` (their
        // per-file Retry re-uploads the retained File and mints a fresh handle) and show a
        // message saying what to do.
        const uploadError = fieldErrors[REQUEST_FIELDS.uploadHandles]?.[0]
        if (uploadError) {
          invalidateUploadedSlots(uploadError)
          setUploadHandlesError(uploadError)
          setStatus("idle")
          return
        }

        const fields = Object.keys(fieldErrors) as (keyof RequestFormInput)[]
        if (fields.length > 0) {
          for (const field of fields) {
            const message = fieldErrors[field]?.[0]
            if (message) setError(field, { message })
          }
          setStatus("idle")
        } else {
          setStatus("error")
        }
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const placementOptions = PLACEMENT_OPTIONS.map((v) => ({
    value: v,
    label: t(`placementOptions.${v}`),
  }))

  const sizeOptions = SIZE_OPTIONS.map((v) => ({
    value: v,
    label: t(`sizeOptions.${v}`),
  }))

  const colorOptions = COLOR_OPTIONS.map((v) => ({
    value: v,
    label: t(`colorOptions.${v}`),
  }))

  const err = (field: keyof RequestFormInput) => getFieldError(field, errors, t)
  const contactGroupError = getContactGroupError(errors, t)

  if (status === "success") {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border p-6">
        <p className="text-lg font-semibold text-foreground">{t("successTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("successMessage")}</p>
        {referenceCode && (
          <p className="text-sm font-mono text-foreground">
            {t("successReferenceCode", { referenceCode })}
          </p>
        )}
      </div>
    )
  }

  const isSubmitting = status === "submitting"
  const uploadHint = `${t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })} ${t("uploadFormatsHint")}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Client name */}
      <TextInput
        id="clientName"
        label={t("clientNameLabel")}
        placeholder={t("clientNamePlaceholder")}
        error={err("clientName")}
        {...register("clientName")}
      />

      {/* Idea */}
      <TextareaInput
        id="ideaDescription"
        label={t("ideaDescriptionLabel")}
        placeholder={t("ideaDescriptionPlaceholder")}
        hint={t("ideaDescriptionHint")}
        error={err("ideaDescription")}
        {...register("ideaDescription")}
      />

      {/* Placement */}
      <SelectInput
        id="placement"
        label={t("placementLabel")}
        placeholder={t("placementPlaceholder")}
        options={placementOptions}
        error={err("placement")}
        {...register("placement")}
      />

      {/* Reference uploads — three categories (FS §4.2 fields 5–7). The motivation-card
          copy (FS Appendix A.1) is added in Item 3; this ships the upload plumbing. */}
      <UploadCategoryInput
        id="upload-artist_work"
        category="artist_work"
        label={t("uploads.artistWorkLabel")}
        buttonText={t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })}
        hint={uploadHint}
        uploadingLabel={t("uploads.uploadingLabel")}
        errorMessage={(errorKey) => getValidationKeyMessage(errorKey, t)}
        retryLabel={t("uploads.retryLabel")}
        removeFileLabel={(fileName) => t("uploads.removeFile", { fileName })}
        maxFilesWarning={t("uploads.maxFilesWarning", { maxFiles: MAX_FILES_PER_FIELD })}
      />
      <UploadCategoryInput
        id="upload-inspiration"
        category="inspiration"
        label={t("uploads.inspirationLabel")}
        buttonText={t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })}
        hint={uploadHint}
        uploadingLabel={t("uploads.uploadingLabel")}
        errorMessage={(errorKey) => getValidationKeyMessage(errorKey, t)}
        retryLabel={t("uploads.retryLabel")}
        removeFileLabel={(fileName) => t("uploads.removeFile", { fileName })}
        maxFilesWarning={t("uploads.maxFilesWarning", { maxFiles: MAX_FILES_PER_FIELD })}
      />
      <UploadCategoryInput
        id="upload-placement_photo"
        category="placement_photo"
        label={t("uploads.placementPhotoLabel")}
        buttonText={t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })}
        hint={uploadHint}
        uploadingLabel={t("uploads.uploadingLabel")}
        errorMessage={(errorKey) => getValidationKeyMessage(errorKey, t)}
        retryLabel={t("uploads.retryLabel")}
        removeFileLabel={(fileName) => t("uploads.removeFile", { fileName })}
        maxFilesWarning={t("uploads.maxFilesWarning", { maxFiles: MAX_FILES_PER_FIELD })}
      />

      {/* Size */}
      <SelectInput
        id="size"
        label={t("sizeLabel")}
        placeholder={t("sizePlaceholder")}
        options={sizeOptions}
        error={err("size")}
        {...register("size")}
      />

      {/* Color */}
      <SelectInput
        id="color"
        label={t("colorLabel")}
        placeholder={t("colorPlaceholder")}
        options={colorOptions}
        error={err("color")}
        {...register("color")}
      />

      {/* Budget */}
      <TextInput
        id="budget"
        label={t("budgetLabel")}
        placeholder={t("budgetPlaceholder")}
        hint={t("budgetHint")}
        error={err("budget")}
        {...register("budget")}
      />

      {/* Contact */}
      <div className="flex flex-col gap-4 rounded-md border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">{t("contactSectionTitle")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t("contactSectionHint")}</p>
          {contactGroupError && (
            <p className="text-xs text-destructive mt-1">{contactGroupError}</p>
          )}
        </div>
        <TextInput
          id="email"
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          type="email"
          error={err("email")}
          {...register("email")}
        />
        <TextInput
          id="phone"
          label={t("phoneLabel")}
          placeholder={t("phonePlaceholder")}
          type="tel"
          error={err("phone")}
          {...register("phone")}
        />
        <TextInput
          id="contactOther"
          label={t("contactOtherLabel")}
          placeholder={t("contactOtherPlaceholder")}
          error={err("contactOther")}
          {...register("contactOther")}
        />
      </div>

      {/* Eligibility (18+/for-self, FS §4.2 field 11). Full rebuild — copy with rendered
          AGE_THRESHOLD + privacy statement — lands in Block B′. */}
      <CheckboxInput
        id="eligibility"
        label={t("eligibilityLabel", { ageThreshold: AGE_THRESHOLD })}
        error={err("eligibility")}
        {...register("eligibility")}
      />

      {/* The server rejected this submit's upload handles (expired or unadoptable). The
          affected slots have been flipped back to `failed` above, so each shows its own
          Retry control; this line tells the visitor what happened and what to do. */}
      {uploadHandlesError && (
        <p role="alert" className="text-sm text-destructive">
          {getValidationKeyMessage(uploadHandlesError, t)}
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {t("errorMessage")}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting || hasUploadingSlot}>
        {isSubmitting ? t("submitButtonLoading") : t("submitButton")}
      </Button>
    </form>
  )
}
