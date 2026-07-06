export type AuthLogReason = "auth_request_rejected" | "rate_limited" | "unknown"

interface AuthErrorLike {
  status?: number
}

/**
 * Classifies a Supabase Auth error using only the stable `status` field.
 * `code`/`message` are not used — both are looser/less stable across
 * Supabase Auth versions and could carry incidental detail we don't want
 * to log (see AuthApiError vs AuthUnknownError in @supabase/auth-js).
 */
function classifyAuthError(error: unknown): AuthLogReason {
  const status = (error as AuthErrorLike | null | undefined)?.status

  if (status === 400 || status === 401 || status === 422) return "auth_request_rejected"
  if (status === 429) return "rate_limited"
  return "unknown"
}

/**
 * Logs a failed auth operation with only an operation name and a safe
 * classified reason — never email, password, token, code, verifier,
 * session/user payload, callback URL/query string, or the raw Supabase
 * error message.
 */
export function logAuthFailure(
  operation: string,
  error: unknown,
  level: "warn" | "error" = "warn",
): void {
  const reason = classifyAuthError(error)
  const context = { operation, reason }

  if (level === "error") {
    console.error("[auth] operation failed", context)
  } else {
    console.warn("[auth] operation failed", context)
  }
}
