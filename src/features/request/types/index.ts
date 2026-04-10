import type { z } from "zod/v3"
import type { requestFormSchema } from "../validation"

export type RequestFormData = z.infer<typeof requestFormSchema>
export type RequestFormInput = z.input<typeof requestFormSchema>
