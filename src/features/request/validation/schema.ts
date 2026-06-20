import { z } from "zod/v3"
import { COLOR_OPTIONS, MAX_FILES_PER_FIELD, PLACEMENT_OPTIONS, SIZE_OPTIONS } from "../config"
import { VALIDATION_KEYS as K } from "./validationKeys"

export const requestFormSchema = z
  .object({
    ideaDescription: z
      .string({ required_error: K.IDEA_REQUIRED })
      .min(10, { message: K.IDEA_TOO_SHORT }),
    referenceImages: z
      .array(z.instanceof(File))
      .min(1, { message: K.REFERENCE_IMAGES_REQUIRED })
      .max(MAX_FILES_PER_FIELD),
    placement: z
      .string()
      .refine((v) => (PLACEMENT_OPTIONS as readonly string[]).includes(v) && v !== "", {
        message: K.PLACEMENT_REQUIRED,
      }),
    placementImages: z
      .array(z.instanceof(File))
      .min(1, { message: K.PLACEMENT_IMAGES_REQUIRED })
      .max(MAX_FILES_PER_FIELD),
    size: z
      .string()
      .refine((v) => (SIZE_OPTIONS as readonly string[]).includes(v) && v !== "", {
        message: K.SIZE_REQUIRED,
      }),
    color: z
      .string()
      .refine((v) => (COLOR_OPTIONS as readonly string[]).includes(v) && v !== "", {
        message: K.COLOR_REQUIRED,
      }),
    budget: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    email: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined)
      .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
        message: K.EMAIL_INVALID,
      }),
    phone: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    contactOther: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    consent: z.custom<true>((v) => v === true, { message: K.CONSENT_REQUIRED, fatal: false }),
  })
  .superRefine((data, ctx) => {
    const hasContact =
      data.email !== undefined || data.phone !== undefined || data.contactOther !== undefined

    if (!hasContact) {
      ctx.addIssue({
        code: "custom",
        path: ["contactOther"],
        message: K.CONTACT_REQUIRED,
      })
    }
  })
