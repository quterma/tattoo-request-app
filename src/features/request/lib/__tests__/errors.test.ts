import { describe, it, expect } from "vitest"
import messages from "@/shared/i18n/messages/en.json"
import { getValidationKeyMessage } from "../errors"
import { VALIDATION_KEYS as K } from "../../validation"

// Minimal stand-in for next-intl's `t` scoped to the "request" namespace: resolve a dotted key
// against messages.request, same traversal the app uses.
const t = ((key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages.request
  for (const part of key.split(".")) value = value?.[part]
  return typeof value === "string" ? value : key
}) as unknown as Parameters<typeof getValidationKeyMessage>[1]

describe("getValidationKeyMessage — upload rate-limit copy (Item 10)", () => {
  it("maps the 429 rate-limit key to a message that does NOT promise an immediate retry", () => {
    const msg = getValidationKeyMessage(K.UPLOAD_RATE_LIMITED, t)
    // Real message, not the raw key or the generic fallback.
    expect(msg).not.toBe(K.UPLOAD_RATE_LIMITED)
    expect(msg).not.toBe(t("errorMessage" as never))
    // The whole point of the finding: a 24h-window breach must not tell the visitor to press
    // Retry now. It must still make clear the request itself can be sent.
    expect(msg.toLowerCase()).not.toContain("press retry")
    expect(msg.toLowerCase()).toContain("send your request")
  })

  it("keeps the transient failure message (upload_invalid) distinct and retry-oriented", () => {
    const rateLimited = getValidationKeyMessage(K.UPLOAD_RATE_LIMITED, t)
    const transient = getValidationKeyMessage(K.UPLOAD_INVALID, t)
    expect(transient).not.toBe(rateLimited)
    expect(transient.toLowerCase()).toContain("press retry")
  })
})
