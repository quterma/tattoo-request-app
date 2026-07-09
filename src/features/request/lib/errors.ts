import type { useTranslations } from "next-intl"
import type { FieldErrors } from "react-hook-form"
import type { RequestFormInput } from "../types"
import { VALIDATION_KEYS } from "../validation"
import type { ValidationKey } from "../validation"

type T = ReturnType<typeof useTranslations<"request">>

const MESSAGE_TO_I18N_KEY: Record<ValidationKey, string> = {
  client_name_required: "errors.clientNameRequired",
  client_name_too_short: "errors.clientNameTooShort",
  client_name_too_long: "errors.clientNameTooLong",
  idea_required: "errors.ideaDescriptionRequired",
  idea_too_short: "errors.ideaDescriptionTooShort",
  idea_too_long: "errors.ideaDescriptionTooLong",
  reference_images_required: "errors.referenceImagesRequired",
  reference_images_too_many: "errors.referenceImagesTooMany",
  placement_required: "errors.placementRequired",
  placement_images_required: "errors.placementImagesRequired",
  placement_images_too_many: "errors.placementImagesTooMany",
  size_required: "errors.sizeRequired",
  color_required: "errors.colorRequired",
  budget_too_long: "errors.budgetTooLong",
  email_invalid: "errors.emailInvalid",
  phone_too_long: "errors.phoneTooLong",
  contact_other_too_long: "errors.contactOtherTooLong",
  consent_required: "errors.consentRequired",
  contact_required: "errors.atLeastOneContactRequired",
  file_type_invalid: "errors.fileTypeInvalid",
  file_too_large: "errors.fileTooLarge",
}

export function getFieldError(
  field: keyof RequestFormInput,
  errors: FieldErrors<RequestFormInput>,
  t: T,
): string | undefined {
  const message = errors[field]?.message
  if (!message) return undefined
  // contact_required is rendered once as the shared contact-group error (see
  // getContactGroupError below), never as this field's own inline error.
  if (message === VALIDATION_KEYS.CONTACT_REQUIRED) return undefined
  const key = MESSAGE_TO_I18N_KEY[message as ValidationKey]
  return key ? t(key as Parameters<T>[0]) : undefined
}

export function getContactGroupError(
  errors: FieldErrors<RequestFormInput>,
  t: T,
): string | undefined {
  if (errors.contactOther?.message !== VALIDATION_KEYS.CONTACT_REQUIRED) return undefined
  return t("errors.atLeastOneContactRequired")
}
