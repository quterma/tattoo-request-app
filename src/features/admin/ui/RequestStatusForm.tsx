"use client"

import { useActionState } from "react"
import { REQUEST_STATUS_OPTIONS } from "../config"
import type { RequestStatus, UpdateRequestStatusResult } from "../types"

type RequestStatusFormProps = {
  currentStatus: RequestStatus
  action: (
    prev: UpdateRequestStatusResult | null,
    formData: FormData,
  ) => Promise<UpdateRequestStatusResult>
  statusLabel: string
  statusOptionLabels: Record<RequestStatus, string>
  submitLabel: string
  submitLabelPending: string
  successMessage: string
}

export function RequestStatusForm({
  currentStatus,
  action,
  statusLabel,
  statusOptionLabels,
  submitLabel,
  submitLabelPending,
  successMessage,
}: RequestStatusFormProps) {
  const [state, formAction, pending] = useActionState<UpdateRequestStatusResult | null, FormData>(
    action,
    null,
  )

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <label htmlFor="status" className="sr-only">
        {statusLabel}
      </label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        disabled={pending}
        className="rounded-full border border-border px-2 py-0.5 text-xs font-medium disabled:opacity-50"
      >
        {REQUEST_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {statusOptionLabels[option]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? submitLabelPending : submitLabel}
      </button>

      {state && !state.ok && (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state && state.ok && (
        <p role="status" className="w-full text-sm text-foreground">
          {successMessage}
        </p>
      )}
    </form>
  )
}
