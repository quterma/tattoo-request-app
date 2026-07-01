"use client"

import { useActionState } from "react"
import type { ForgotPasswordResult } from "./actions"

type Props = {
  action: (prev: ForgotPasswordResult | null, formData: FormData) => Promise<ForgotPasswordResult>
  showExpiredLinkError: boolean
}

const GENERIC_SENT_MESSAGE = "If an account with this email exists, a reset link has been sent."
const EXPIRED_LINK_MESSAGE = "Reset link has expired or is no longer valid. Request a new one below."

export function ForgotPasswordForm({ action, showExpiredLinkError }: Props) {
  const [state, formAction, pending] = useActionState<ForgotPasswordResult | null, FormData>(
    action,
    null,
  )

  if (state && "sent" in state) {
    return (
      <p role="status" className="text-sm text-foreground">
        {GENERIC_SENT_MESSAGE}
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {showExpiredLinkError && (
        <p role="alert" className="text-sm text-destructive">
          {EXPIRED_LINK_MESSAGE}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  )
}
