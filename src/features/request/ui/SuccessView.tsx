"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/shared/i18n"
import { CONTACT_METHODS } from "../config"
import type { ContactMethod } from "../config"
import { consumeSuccess, getSnapshot } from "../store"
import type { SuccessPayload } from "../store"

function isContactMethod(v: string): v is ContactMethod {
  return (CONTACT_METHODS as readonly string[]).includes(v)
}

/**
 * Success page (FS §3.4). Renders the six required items in order from the module-store payload,
 * and enforces the gate: reachable only immediately after a successful submission.
 *
 * Access mechanics (PROJECT_DECISIONS.md — "Success page (FS §3.4)"):
 * - One-time read via consumeSuccess(): the payload is read and cleared in one call, so any
 *   revisit finds the store empty and redirects Home. The URL carries no data, so a reload drops
 *   the module state by nature ("refreshed → redirect Home" for free).
 * - Strict-mode safety: React double-invokes mount effects in dev. A `consumed` ref set
 *   synchronously before the read short-circuits the second run, so it neither reads the store
 *   again (which would now be empty → self-redirect) nor loses the captured payload.
 * - bfcache guard: a browser-back restore from the back-forward cache re-runs no mount effect, so
 *   we listen for `pageshow` and re-run the gate when the page was restored (`event.persisted`).
 */
export function SuccessView() {
  const t = useTranslations("request")
  const router = useRouter()

  // undefined = gate not yet resolved (render nothing, redirect imminent);
  // a payload = show it; the store is already cleared by consumeSuccess().
  const [payload, setPayload] = useState<SuccessPayload | undefined>(undefined)

  // Guards the one-time read against React strict-mode's double-invoked mount effect. Set
  // synchronously before the read so the second invocation does nothing — it cannot observe the
  // now-empty store and redirect, and cannot overwrite the captured payload. (Owner-mandated form:
  // a ref flag, not a read-back of `payload` state.)
  const consumedRef = useRef(false)

  useEffect(() => {
    if (consumedRef.current) return
    consumedRef.current = true

    const consumed = consumeSuccess()
    // Reading the module store's one-time payload into React state is an intentional mount-time
    // sync from an external system (the exact case react-hooks/set-state-in-effect exempts). It
    // must be an effect, not a render-phase read: consumeSuccess() clears the store, so doing it
    // during render would let strict-mode's double render consume-then-lose the payload — the
    // consumedRef guard confines it to a single run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (consumed) setPayload(consumed)
    else router.replace("/")
  }, [router])

  // bfcache guard: on a back-forward-cache restore, no mount runs, so re-check the store. By then
  // the payload has been consumed, so `getSnapshot().success` is null → redirect Home.
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted && !getSnapshot().success) router.replace("/")
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [router])

  if (!payload) return null

  // Reuse the form's own method labels (request.contactMethodOptions) so the echoed method name
  // stays identical to the select's when owner-authored wording changes — no second copy.
  const methodLabel = isContactMethod(payload.contactMethod)
    ? t(`contactMethodOptions.${payload.contactMethod}`)
    : payload.contactMethod
  const channelNote = isContactMethod(payload.contactMethod)
    ? t(`success.channelNotes.${payload.contactMethod}`)
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Confirmation — request received, no further action. */}
      <div className="flex flex-col gap-2">
        <h1>{t("success.confirmationTitle")}</h1>
        <p className="mb-0 text-muted-foreground">{t("success.confirmationBody")}</p>
      </div>

      {/* 2. Reference code (§4.6). */}
      <p className="mb-0 font-mono text-sm text-foreground">
        {t("success.referenceCode", { referenceCode: payload.referenceCode })}
      </p>

      {/* 3. Response expectation — reply within 48 hours (PRD D5). */}
      <p className="mb-0 text-foreground">{t("success.responseExpectation")}</p>

      {/* 4. Reply channel echo — rendered from data (method label + value as entered, unmasked),
          method-agnostic so a future method needs no change here. 5. The A.2 channel note. */}
      <div className="flex flex-col gap-2">
        <p className="mb-0 text-sm font-medium text-foreground">{t("success.contactEchoTitle")}</p>
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{methodLabel}:</dt>
            <dd className="mb-0 text-foreground">{payload.contactValue}</dd>
          </div>
        </dl>
        {channelNote && <p className="mb-0 text-sm text-muted-foreground">{channelNote}</p>}
      </div>

      {/* 6. Single primary CTA — Back to Home (FS §2). */}
      <div>
        <Link
          href="/"
          className="inline-block rounded-lg bg-foreground px-8 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          {t("success.backToHome")}
        </Link>
      </div>
    </div>
  )
}
