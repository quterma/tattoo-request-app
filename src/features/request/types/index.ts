import type { z } from "zod"
import type { requestFormSchema } from "../validation"

export type RequestFormData = z.infer<typeof requestFormSchema>
