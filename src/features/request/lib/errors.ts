import type { useTranslations } from "next-intl"
import type { FieldErrors } from "react-hook-form"
import type { RequestFormInput } from "../types"

type T = ReturnType<typeof useTranslations<"request">>

const MESSAGE_TO_I18N_KEY: Record<string, string> = {
  idea_required: "errors.ideaDescriptionRequired",
  idea_too_short: "errors.ideaDescriptionTooShort",
  reference_images_required: "errors.referenceImagesRequired",
  placement_required: "errors.placementRequired",
  placement_images_required: "errors.placementImagesRequired",
  size_required: "errors.sizeRequired",
  color_required: "errors.colorRequired",
  email_invalid: "errors.emailInvalid",
  consent_required: "errors.consentRequired",
  contact_required: "errors.atLeastOneContactRequired",
}

export function getFieldError(
  field: keyof RequestFormInput,
  errors: FieldErrors<RequestFormInput>,
  t: T,
): string | undefined {
  const message = errors[field]?.message
  if (!message) return undefined
  const key = MESSAGE_TO_I18N_KEY[message]
  return key ? t(key as Parameters<T>[0]) : undefined
}

export function getContactGroupError(
  errors: FieldErrors<RequestFormInput>,
  t: T,
): string | undefined {
  if (errors.contactOther?.message !== "contact_required") return undefined
  return t("errors.atLeastOneContactRequired")
}
