import type { RequestStatus } from "@/services"

/**
 * UI-safe mirror of services/db.ts's REQUEST_STATUS_OPTIONS, for rendering the
 * status select in Client Components. Not re-exported from @/services because
 * that barrel's runtime exports transitively import the live Supabase client
 * (@/services/supabase -> @/config), which throws without real env vars —
 * unsafe to pull into UI/Client Components and their tests. The Server Action
 * still validates against the service-layer source of truth (REQUEST_STATUS_OPTIONS
 * in services/db.ts), so this duplication cannot become a security boundary.
 */
export const REQUEST_STATUS_OPTIONS: readonly RequestStatus[] = [
  "new",
  "active",
  "booked",
  "completed",
  "rejected",
]
