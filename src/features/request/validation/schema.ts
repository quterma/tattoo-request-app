import { z } from "zod"
import { COLOR_OPTIONS, MAX_FILES_PER_FIELD, PLACEMENT_OPTIONS, SIZE_OPTIONS } from "../config"

export const requestFormSchema = z
  .object({
    ideaDescription: z.string().min(10),
    referenceImages: z.array(z.instanceof(File)).min(1).max(MAX_FILES_PER_FIELD),
    placement: z.enum(PLACEMENT_OPTIONS),
    placementImages: z.array(z.instanceof(File)).min(1).max(MAX_FILES_PER_FIELD),
    size: z.enum(SIZE_OPTIONS),
    color: z.enum(COLOR_OPTIONS),
    budget: z.string().optional().transform((v) => v?.trim() || undefined),
    email: z
      .string()
      .optional()
      .transform((v) => v?.trim() || undefined)
      .refine((v) => v === undefined || z.email().safeParse(v).success, {
        message: "invalid_email",
      }),
    phone: z.string().optional().transform((v) => v?.trim() || undefined),
    contactOther: z.string().optional().transform((v) => v?.trim() || undefined),
    consent: z.literal(true),
  })
  .superRefine((data, ctx) => {
    const hasContact = data.email !== undefined || data.phone !== undefined || data.contactOther !== undefined

    if (!hasContact) {
      ctx.addIssue({
        code: "custom",
        path: ["contactOther"],
        message: "at_least_one_contact_required",
      })
    }
  })
