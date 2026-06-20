"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useController, useForm } from "react-hook-form"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/bff"
import { getContactGroupError, getFieldError } from "../lib/errors"
import { COLOR_OPTIONS, MAX_FILES_PER_FIELD, PLACEMENT_OPTIONS, SIZE_OPTIONS } from "../config"
import type { RequestFormData, RequestFormInput } from "../types"
import { requestFormSchema } from "../validation"
import { Button } from "./Button"
import { CheckboxInput } from "./CheckboxInput"
import { FileUploadInput } from "./FileUploadInput"
import { SelectInput } from "./SelectInput"
import { TextInput } from "./TextInput"
import { TextareaInput } from "./TextareaInput"

type SubmitStatus = "idle" | "submitting" | "success" | "error"

export function RequestForm() {
  const t = useTranslations("request")

  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [requestId, setRequestId] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      ideaDescription: "",
      referenceImages: [],
      placement: "",
      placementImages: [],
      size: "",
      color: "",
      budget: "",
      email: "",
      phone: "",
      contactOther: "",
      consent: undefined,
    },
  })

  const referenceImages = useController({ name: "referenceImages", control })
  const placementImages = useController({ name: "placementImages", control })

  async function onSubmit(data: RequestFormData) {
    setStatus("submitting")

    try {
      const formData = new FormData()
      const f = REQUEST_FIELDS

      formData.append(f.ideaDescription, data.ideaDescription)
      formData.append(f.placement, data.placement)
      formData.append(f.size, data.size)
      formData.append(f.color, data.color)
      formData.append(f.consent, String(data.consent))

      if (data.budget) formData.append(f.budget, data.budget)
      if (data.email) formData.append(f.email, data.email)
      if (data.phone) formData.append(f.phone, data.phone)
      if (data.contactOther) formData.append(f.contactOther, data.contactOther)

      for (const file of data.referenceImages) {
        formData.append(f.referenceImages, file)
      }
      for (const file of data.placementImages) {
        formData.append(f.placementImages, file)
      }

      const res = await fetch("/api/request", { method: "POST", body: formData })
      const response = await res.json()

      if (response.ok && response.requestId) {
        setRequestId(response.requestId)
        setStatus("success")
      } else if (response.error?.code === API_ERROR_CODES.VALIDATION_ERROR) {
        const fieldErrors = response.error.fieldErrors as Record<string, string[]>
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
        {requestId && (
          <p className="text-sm font-mono text-foreground">
            {t("successRequestId", { requestId })}
          </p>
        )}
      </div>
    )
  }

  const isSubmitting = status === "submitting"

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Idea */}
      <TextareaInput
        id="ideaDescription"
        label={t("ideaDescriptionLabel")}
        placeholder={t("ideaDescriptionPlaceholder")}
        hint={t("ideaDescriptionHint")}
        error={err("ideaDescription")}
        {...register("ideaDescription")}
      />

      {/* Reference images */}
      <FileUploadInput
        id="referenceImages"
        label={t("referenceImagesLabel")}
        hint={`${t("referenceImagesHint")} ${t("uploadFormatsHint")}`}
        buttonText={t("uploadButtonText", { maxFiles: MAX_FILES_PER_FIELD })}
        error={err("referenceImages")}
        value={referenceImages.field.value ?? []}
        onChange={referenceImages.field.onChange}
        maxFiles={MAX_FILES_PER_FIELD}
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

      {/* Placement images */}
      <FileUploadInput
        id="placementImages"
        label={t("placementImagesLabel")}
        hint={`${t("placementImagesHint")} ${t("uploadFormatsHint")}`}
        buttonText={t("uploadButtonText", { maxFiles: MAX_FILES_PER_FIELD })}
        error={err("placementImages")}
        value={placementImages.field.value ?? []}
        onChange={placementImages.field.onChange}
        maxFiles={MAX_FILES_PER_FIELD}
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
          {...register("phone")}
        />
        <TextInput
          id="contactOther"
          label={t("contactOtherLabel")}
          placeholder={t("contactOtherPlaceholder")}
          {...register("contactOther")}
        />
      </div>

      {/* Consent */}
      <CheckboxInput
        id="consent"
        label={t("consentLabel")}
        error={err("consent")}
        {...register("consent")}
      />

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {t("errorMessage")}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("submitButtonLoading") : t("submitButton")}
      </Button>
    </form>
  )
}
