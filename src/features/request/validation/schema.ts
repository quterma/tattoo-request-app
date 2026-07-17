import { z } from "zod/v3"
import {
  COLOR_OPTIONS,
  MAX_FILES_TOTAL,
  OFFERED_CONTACT_METHODS,
  PLACEMENT_OPTIONS,
  SIZE_OPTIONS,
} from "../config"
import type { ContactMethod } from "../config"
import { normalizeContactValue } from "../lib/contact"
import { VALIDATION_KEYS as K } from "./validationKeys"

/**
 * A pure abuse guard on a public write surface, NOT a product rule: no legitimate contact value
 * (RFC-max email 254, Telegram 32, Instagram 30, E.164 15) comes close. It exists only so an
 * unbounded string cannot be posted; every real bound is the method's own.
 */
const CONTACT_VALUE_MAX_BYTES = 320

/** The message shown when a value fails its method's own rule (FS §4.2 fields 10a–e). */
const CONTACT_VALUE_ERROR: Record<Exclude<ContactMethod, "email">, string> = {
  whatsapp: K.PHONE_INVALID,
  phone: K.PHONE_INVALID,
  instagram: K.INSTAGRAM_INVALID,
  telegram: K.TELEGRAM_INVALID,
}

export const requestFormSchema = z
  .object({
    clientName: z
      .string({ required_error: K.CLIENT_NAME_REQUIRED })
      .trim()
      .min(2, { message: K.CLIENT_NAME_TOO_SHORT })
      .max(30, { message: K.CLIENT_NAME_TOO_LONG }),
    ideaDescription: z
      .string({ required_error: K.IDEA_REQUIRED })
      .trim()
      .min(20, { message: K.IDEA_TOO_SHORT })
      .max(1000, { message: K.IDEA_TOO_LONG }),
    placement: z
      .string()
      .refine((v) => (PLACEMENT_OPTIONS as readonly string[]).includes(v) && v !== "", {
        message: K.PLACEMENT_REQUIRED,
      }),
    // Opaque upload handles (services/uploadToken.ts). Uploads are optional
    // (FS §4.2 fields 5–7); the per-category cap and ownership binding are
    // enforced server-side in bff/adoptUploads.ts, not here. The overall
    // ceiling is a cheap guard against an oversized payload.
    uploadHandles: z
      .array(z.string())
      .max(MAX_FILES_TOTAL, { message: K.UPLOAD_TOO_MANY })
      .optional(),
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
      .max(50, { message: K.BUDGET_TOO_LONG })
      .optional()
      .transform((v) => v?.trim() || undefined),
    /**
     * The chosen reply channel (FS §4.2 field 9). Validated against the studio's OFFERED set,
     * not just the five-value enum: a method this studio disabled must not be submittable by a
     * crafted request.
     */
    contactMethod: z.string().refine((v) => (OFFERED_CONTACT_METHODS as readonly string[]).includes(v), {
      message: K.CONTACT_METHOD_REQUIRED,
    }),
    /**
     * The one revealed value field (FS §4.2 fields 10a–e). Held **as entered** — no transform.
     *
     * Deliberate: the resolver hands this object to the form's onSubmit, and FS §3.4 requires the
     * Success echo to show the value the visitor typed. Normalization (`@`-strip, E.164) happens
     * at the persistence boundary via lib/contact.ts, so raw and normalized both stay available.
     *
     * Length is NOT capped here. Each method owns its own bound (Instagram ≤30, Telegram ≤32,
     * phone via libphonenumber, email via RFC-basic), and a shared cap would enforce a product
     * rule the FS does not state — it would reject a long-but-valid email address (FS §4.2 field
     * 10a specifies RFC-basic validation and nothing more) with an error the visitor cannot act
     * on. The only bound here is a payload guard, far above any legitimate value.
     */
    contactValue: z.string().max(CONTACT_VALUE_MAX_BYTES, { message: K.CONTACT_VALUE_INVALID }),
    eligibility: z.custom<true>((v) => v === true, { message: K.ELIGIBILITY_REQUIRED, fatal: false }),
  })
  .superRefine((data, ctx) => {
    // Exactly one method with exactly one value (the five-column model's invariant, held here
    // and again by a DB CHECK). The value's per-method rule lives in lib/contact.ts so the form,
    // the BFF and the persistence layer cannot drift apart.
    if (!(OFFERED_CONTACT_METHODS as readonly string[]).includes(data.contactMethod)) return

    const method = data.contactMethod as ContactMethod
    const raw = data.contactValue.trim()

    if (raw === "") {
      ctx.addIssue({ code: "custom", path: ["contactValue"], message: K.CONTACT_VALUE_REQUIRED })
      return
    }

    // Email keeps its RFC-basic check here; the other methods are validated by their normalizer
    // (which returns null for an unusable value).
    if (method === "email") {
      if (!z.string().email().safeParse(raw).success) {
        ctx.addIssue({ code: "custom", path: ["contactValue"], message: K.EMAIL_INVALID })
      }
      return
    }

    if (normalizeContactValue(method, raw) === null) {
      ctx.addIssue({
        code: "custom",
        path: ["contactValue"],
        message: CONTACT_VALUE_ERROR[method],
      })
    }
  })
