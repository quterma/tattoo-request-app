"use client"

import { useActionState } from "react"
import type { LoginResult } from "./actions"

type Props = {
  action: (prev: LoginResult, formData: FormData) => Promise<LoginResult>
  googleAction: () => Promise<void>
}

export function LoginForm({ action, googleAction }: Props) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(action, null)

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form action={googleAction}>
        <button
          type="submit"
          className="w-full rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
        >
          Google
        </button>
      </form>
    </div>
  )
}
