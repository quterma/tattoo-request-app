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
  /**
   * Only set when status is "failed". Distinguishes a transient transport failure
   * (network/server — retrying can succeed → Retry shown) from a validation rejection
   * (over-size / wrong format — retrying is futile → remove-only). FS §4.3 (amended
   * 2026-07-14): retry is a transport-only affordance.
   */
  failureKind?: "transport" | "validation"
}

export interface SuccessPayload {
  referenceCode: string
  contactMethod: string
  contactValue: string
}

/**
 * Entered text/select field values, persisted so they survive a client-side navigation
 * away from Request and back (D-Blueprint 5(a)). A plain string→string bag rather than the
 * typed form shape on purpose: the store must not depend on the form's schema types (which
 * change per block — contacts in Block C), and every persisted control is a string or a
 * checkbox. Uploads live in `slots`; this covers everything else the visitor typed.
 */
export type DraftFields = Record<string, string>

export interface RequestDraftState {
  clientSubmissionId: string
  slots: UploadSlot[]
  fields: DraftFields
  success: SuccessPayload | null
}

function createInitialState(): RequestDraftState {
  return {
    clientSubmissionId: crypto.randomUUID(),
    slots: [],
    fields: {},
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

/** Snapshot of the persisted field values (D-Blueprint 5(a)). Empty on a fresh session. */
export function getFields(): DraftFields {
  return state.fields
}

/**
 * Persists the entered field values so they survive a client-side navigation away and back.
 * Replaces the whole bag (the form owns the complete set and writes it on change). Does not
 * touch slots or success. Cleared by resetDraft() on a successful submit.
 */
export function setFields(fields: DraftFields): void {
  setState({ ...state, fields })
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
        ? {
            ...slot,
            status: "failed",
            progress: 0,
            handle: undefined,
            errorKey,
            // Recoverable: the retained File can be re-uploaded to mint a fresh handle.
            failureKind: "transport",
          }
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

/**
 * One-time read of the success payload for the Success page (FS §3.4). Returns the payload and
 * clears it from the store in the same call, so a second read (a revisit, or React strict-mode's
 * double-invoked mount effect) finds nothing — which the Success gate turns into a redirect Home.
 * Centralizing the read-then-clear here keeps the clear atomic and testable, rather than spread
 * across a component effect. The caller must guard against invoking it twice on one real mount
 * (a `consumed` ref) so the payload it captured is not lost to strict-mode's second run.
 */
export function consumeSuccess(): SuccessPayload | null {
  const payload = state.success
  if (payload) setState({ ...state, success: null })
  return payload
}

/** Test-only: force the store back to a fresh initial state. */
export function __resetDraftStoreForTests(): void {
  for (const slot of state.slots) URL.revokeObjectURL(slot.previewUrl)
  state = createInitialState()
  emit()
}
