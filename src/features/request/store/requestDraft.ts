import type { UploadCategory } from "../config"

/**
 * Module-level draft store for the Request flow.
 *
 * Why a module singleton and not component state or React context: the store must
 * outlive RequestForm's mount so that uploaded files (and, in Item 3, entered values)
 * survive a client-side navigation away from Request and back — D-Blueprint 5(a). A
 * module is evaluated once and persists across client-side navigation by construction,
 * and dies on a full page reload — which is exactly D-Blueprint 5(a)'s guarantee
 * boundary (reload/eviction loss is accepted), with no invalidation code. It also
 * gives Item 4's Success gate its "refresh → redirect to Home" behavior for free.
 *
 * React Compiler note: every mutation replaces `state` with a new object so
 * getSnapshot() returns a referentially-stable value between writes. useSyncExternalStore
 * would otherwise loop forever.
 */

export type UploadSlotStatus = "uploading" | "uploaded" | "failed"

export interface UploadSlot {
  slotId: string
  category: UploadCategory
  file: File
  fileName: string
  previewUrl: string
  status: UploadSlotStatus
  progress: number
  handle?: string
  errorKey?: string
}

export interface SuccessPayload {
  referenceCode: string
  contactMethod: string
  contactValue: string
}

export interface RequestDraftState {
  clientSubmissionId: string
  slots: UploadSlot[]
  success: SuccessPayload | null
}

function createInitialState(): RequestDraftState {
  return {
    clientSubmissionId: crypto.randomUUID(),
    slots: [],
    success: null,
  }
}

let state: RequestDraftState = createInitialState()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function setState(next: RequestDraftState): void {
  state = next
  emit()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): RequestDraftState {
  return state
}

export function getClientSubmissionId(): string {
  return state.clientSubmissionId
}

export function addSlot(slot: UploadSlot): void {
  setState({ ...state, slots: [...state.slots, slot] })
}

export function updateSlot(slotId: string, patch: Partial<UploadSlot>): void {
  setState({
    ...state,
    slots: state.slots.map((slot) => (slot.slotId === slotId ? { ...slot, ...patch } : slot)),
  })
}

export function removeSlot(slotId: string): void {
  const slot = state.slots.find((s) => s.slotId === slotId)
  if (slot) URL.revokeObjectURL(slot.previewUrl)
  setState({ ...state, slots: state.slots.filter((s) => s.slotId !== slotId) })
}

/**
 * Marks every already-uploaded slot as failed, so its per-file Retry control reappears.
 *
 * Called when the server rejects the submit's upload handles (expired past their TTL, or
 * otherwise no longer adoptable). Without this the visitor is stuck: the handles the form
 * holds are dead, the submit keeps failing, and nothing on screen says why or offers a way
 * out. Each slot still holds its original File, so Retry re-uploads it and mints a fresh
 * handle — a recoverable state rather than a silent dead end.
 */
export function invalidateUploadedSlots(errorKey: string): void {
  setState({
    ...state,
    slots: state.slots.map((slot) =>
      slot.status === "uploaded"
        ? { ...slot, status: "failed", progress: 0, handle: undefined, errorKey }
        : slot,
    ),
  })
}

/**
 * Resets the draft after a successful submit: revokes all preview URLs, clears slots,
 * and mints a fresh clientSubmissionId so a second request in the same session is not
 * collapsed into the first by idempotency. Only called on success — a submit failure
 * must preserve entered data and uploaded files for retry (FS §4.5).
 */
export function resetDraft(): void {
  for (const slot of state.slots) URL.revokeObjectURL(slot.previewUrl)
  setState(createInitialState())
}

export function setSuccess(payload: SuccessPayload): void {
  setState({ ...state, success: payload })
}

/** Test-only: force the store back to a fresh initial state. */
export function __resetDraftStoreForTests(): void {
  for (const slot of state.slots) URL.revokeObjectURL(slot.previewUrl)
  state = createInitialState()
  emit()
}
