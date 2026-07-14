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
  upload_type_invalid: "errors.uploadTypeInvalid",
  upload_too_large: "errors.uploadTooLarge",
  upload_too_many: "errors.uploadTooMany",
  upload_expired: "errors.uploadExpired",
  upload_invalid: "errors.uploadInvalid",
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

/**
 * Translates a bare validation key that did not arrive through react-hook-form.
 *
 * The upload-handle errors (`upload_expired`, `upload_invalid`, …) belong to no rendered
 * form control — `uploadHandles` is a synthetic field carrying opaque tokens — so they
 * cannot be routed through getFieldError. Falls back to the generic submit error rather
 * than rendering a raw key if the server ever sends an unmapped one.
 */
export function getValidationKeyMessage(key: string, t: T): string {
  const i18nKey = MESSAGE_TO_I18N_KEY[key as ValidationKey]
  return i18nKey ? t(i18nKey as Parameters<T>[0]) : t("errorMessage")
}
