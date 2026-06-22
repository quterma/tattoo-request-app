export const VALIDATION_KEYS = {
  CLIENT_NAME_REQUIRED: "client_name_required",
  CLIENT_NAME_TOO_SHORT: "client_name_too_short",
  CLIENT_NAME_TOO_LONG: "client_name_too_long",
  IDEA_REQUIRED: "idea_required",
  IDEA_TOO_SHORT: "idea_too_short",
  REFERENCE_IMAGES_REQUIRED: "reference_images_required",
  PLACEMENT_REQUIRED: "placement_required",
  PLACEMENT_IMAGES_REQUIRED: "placement_images_required",
  SIZE_REQUIRED: "size_required",
  COLOR_REQUIRED: "color_required",
  EMAIL_INVALID: "email_invalid",
  CONSENT_REQUIRED: "consent_required",
  CONTACT_REQUIRED: "contact_required",
  FILE_TYPE_INVALID: "file_type_invalid",
  FILE_TOO_LARGE: "file_too_large",
} as const

export type ValidationKey = (typeof VALIDATION_KEYS)[keyof typeof VALIDATION_KEYS]
