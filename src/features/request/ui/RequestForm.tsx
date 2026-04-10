"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useController, useForm } from "react-hook-form"
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

export function RequestForm() {
  const t = useTranslations("request")

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  function onSubmit(data: RequestFormData) {
    console.log("RequestForm submitted:", data)
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
        hint={t("referenceImagesHint")}
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
        hint={t("placementImagesHint")}
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

      <Button type="submit" disabled={isSubmitting}>
        {t("submitButton")}
      </Button>
    </form>
  )
}
