import type { useTranslations } from "next-intl"
import type { FieldErrors } from "react-hook-form"
import type { RequestFormInput } from "../types"
import type { ValidationKey } from "../validation"

type T = ReturnType<typeof useTranslations<"request">>

const MESSAGE_TO_I18N_KEY: Record<ValidationKey, string> = {
  client_name_required: "errors.clientNameRequired",
  client_name_too_short: "errors.clientNameTooShort",
  client_name_too_long: "errors.clientNameTooLong",
  idea_required: "errors.ideaDescriptionRequired",
  idea_too_short: "errors.ideaDescriptionTooShort",
  idea_too_long: "errors.ideaDescriptionTooLong",
  placement_required: "errors.placementRequired",
  placement_too_long: "errors.placementTooLong",
  size_required: "errors.sizeRequired",
  color_required: "errors.colorRequired",
  budget_too_long: "errors.budgetTooLong",
  email_invalid: "errors.emailInvalid",
  eligibility_required: "errors.eligibilityRequired",
  contact_method_required: "errors.contactMethodRequired",
  contact_value_required: "errors.contactValueRequired",
  contact_value_invalid: "errors.contactValueInvalid",
  phone_invalid: "errors.phoneInvalid",
  instagram_invalid: "errors.instagramInvalid",
  telegram_invalid: "errors.telegramInvalid",
  upload_type_invalid: "errors.uploadTypeInvalid",
  upload_too_large: "errors.uploadTooLarge",
  upload_too_many: "errors.uploadTooMany",
  upload_expired: "errors.uploadExpired",
  upload_invalid: "errors.uploadInvalid",
  upload_rate_limited: "errors.uploadRateLimited",
}

export function getFieldError(
  field: keyof RequestFormInput,
  errors: FieldErrors<RequestFormInput>,
  t: T,
): string | undefined {
  const message = errors[field]?.message
  if (!message) return undefined
  const key = MESSAGE_TO_I18N_KEY[message as ValidationKey]
  return key ? t(key as Parameters<T>[0]) : undefined
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
