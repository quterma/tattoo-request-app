import { z } from "zod/v3"
import { COLOR_OPTIONS, MAX_FILES_PER_FIELD, PLACEMENT_OPTIONS, SIZE_OPTIONS } from "../config"

export const requestFormSchema = z
  .object({
    ideaDescription: z
      .string({ required_error: "idea_required" })
      .min(10, { message: "idea_too_short" }),
    referenceImages: z
      .array(z.instanceof(File))
      .min(1, { message: "reference_images_required" })
      .max(MAX_FILES_PER_FIELD),
    placement: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(PLACEMENT_OPTIONS, { required_error: "placement_required" }),
    ),
    placementImages: z
      .array(z.instanceof(File))
      .min(1, { message: "placement_images_required" })
      .max(MAX_FILES_PER_FIELD),
    size: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(SIZE_OPTIONS, { required_error: "size_required" }),
    ),
    color: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(COLOR_OPTIONS, { required_error: "color_required" }),
    ),
    budget: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    email: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined)
      .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
        message: "email_invalid",
      }),
    phone: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    contactOther: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined),
    consent: z.literal(true, { errorMap: () => ({ message: "consent_required" }) }),
  })
  .superRefine((data, ctx) => {
    const hasContact =
      data.email !== undefined || data.phone !== undefined || data.contactOther !== undefined

    if (!hasContact) {
      ctx.addIssue({
        code: "custom",
        path: ["contactOther"],
        message: "contact_required",
      })
    }
  })
