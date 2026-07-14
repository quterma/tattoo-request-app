import { useSyncExternalStore } from "react"
import { getSnapshot, subscribe } from "./requestDraft"
import type { RequestDraftState } from "./requestDraft"

/**
 * Subscribes a component to the module-level request-draft store. Server snapshot is
 * the same reference so SSR/hydration is stable (the store starts empty on the client
 * anyway; the form is a client component).
 */
export function useRequestDraft(): RequestDraftState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
