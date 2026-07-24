"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import type { FieldErrors } from "react-hook-form"
import { API_ERROR_CODES, REQUEST_FIELDS } from "@/shared/api"
import { useRouter } from "@/shared/i18n"
import { getFieldError, getValidationKeyMessage } from "../lib/errors"
import {
  AGE_THRESHOLD,
  COLOR_OPTIONS,
  INSTAGRAM_HANDLE,
  MAX_FILES_PER_FIELD,
  OFFERED_CONTACT_METHODS,
  SIZE_OPTIONS,
} from "../config"
import type { ContactMethod } from "../config"
import {
  getClientSubmissionId,
  getFields,
  getSnapshot,
  invalidateUploadedSlots,
  resetDraft,
  setFields,
  setSuccess,
  subscribe,
  useRequestDraft,
} from "../store"
import type { RequestFormData, RequestFormInput } from "../types"
import { requestFormSchema } from "../validation"
import { Button } from "./Button"
import { CheckboxInput } from "./CheckboxInput"
import { SelectInput } from "./SelectInput"
import { TextInput } from "./TextInput"
import { TextareaInput } from "./TextareaInput"
import { UploadCategoryInput } from "./UploadCategoryInput"

type SubmitStatus = "idle" | "submitting" | "error"

const IDEA_MAX = 1000
// Show the character counter only once the visitor is near the limit (FS §4.2 "counter shown
// near limit"), not for the whole (usually short) entry.
const IDEA_COUNTER_THRESHOLD = 900

// Instagram fallback (FS §4.5 / A.4) appears only after this many consecutive failed submits.
const FALLBACK_AFTER_ATTEMPTS = 2

/** The revealed value field's input type per method (FS §4.2 fields 10a–e). */
const CONTACT_INPUT_TYPE: Record<ContactMethod, string> = {
  email: "email",
  phone: "tel",
  whatsapp: "tel",
  instagram: "text",
  telegram: "text",
}

function isContactMethod(v: string | undefined): v is ContactMethod {
  return !!v && (OFFERED_CONTACT_METHODS as readonly string[]).includes(v)
}

// The text/select/checkbox fields whose entered values persist across a client-side navigation
// away from Request and back (D-Blueprint 5(a): "all entered values"). Persisted as strings —
// eligibility as "true"/"" — in the module store's fields bag.
const PERSISTED_FIELDS = [
  "clientName",
  "ideaDescription",
  "placement",
  "size",
  "color",
  "budget",
  "contactMethod",
  "contactValue",
  "eligibility",
] as const

// DOM render order — used to scroll/focus the FIRST invalid field on a blocked submit
// (FS §4.5 / D-Blueprint 5(c)). Kept explicit so it tracks the visual block order. Placement
// sits in the Reference Uploads block (grouped with the placement photo, owner decision
// 2026-07-17 — STAGE_6_TASK_09), after Project Details. Name sits in the Contact block
// (FS §4.2 field 8), after the project fields.
const FIELD_ORDER: (keyof RequestFormInput)[] = [
  "ideaDescription",
  "size",
  "color",
  "budget",
  "placement",
  "clientName",
  "contactMethod",
  "contactValue",
  "eligibility",
]

function readPersistedDefaults(): Partial<RequestFormInput> {
  const saved = getFields()
  return {
    clientName: saved.clientName ?? "",
    ideaDescription: saved.ideaDescription ?? "",
    placement: saved.placement ?? "",
    size: saved.size ?? "",
    color: saved.color ?? "",
    budget: saved.budget ?? "",
    contactMethod: saved.contactMethod ?? "",
    contactValue: saved.contactValue ?? "",
    // A confirmation made earlier in the same live session is restored (D-Blueprint 5(a) —
    // all entered values); a fresh session starts unchecked.
    eligibility: saved.eligibility === "true" ? true : undefined,
  }
}

// Resolves once no slot is still uploading, so a click-to-submit made while an upload is in
// flight waits for it rather than dropping the file (owner decision — the CTA accepts the
// click and shows a sending state while uploads settle). A failed upload still never blocks
// submission (FS §4.5) — it is simply absent.
function waitForUploads(): Promise<void> {
  if (!getSnapshot().slots.some((s) => s.status === "uploading")) return Promise.resolve()
  return new Promise((resolve) => {
    const unsubscribe = subscribe(() => {
      if (!getSnapshot().slots.some((s) => s.status === "uploading")) {
        unsubscribe()
        resolve()
      }
    })
  })
}

export function RequestForm() {
  const t = useTranslations("request")
  const router = useRouter()

  const draft = useRequestDraft()
  // Honeypot (FS §4.5): a hidden, un-registered field a human never fills. Read from the DOM
  // via a ref at submit time (the form builds its FormData manually from RHF values, so an
  // un-registered input would otherwise never be sent). A bot auto-filling the visible-to-DOM
  // field trips the server check. Kept out of RHF/zod so it never affects validation.
  const honeypotRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [uploadHandlesError, setUploadHandlesError] = useState<string | null>(null)
  // Consecutive technical (network/server) failures — drives the A.4 Instagram fallback.
  const [failedAttempts, setFailedAttempts] = useState(0)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RequestFormInput, unknown, RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: readPersistedDefaults(),
  })

  // Persist entered values so they survive a client-side navigation away and back
  // (D-Blueprint 5(a)). Watch the persisted fields and mirror them into the module store;
  // resetDraft() clears them on a successful submit. The effect is keyed on the serialized
  // values (not the array identity useWatch returns each render), so it writes only on a real
  // value change — no write-per-render loop against the store it feeds.
  const watched = useWatch({ control, name: PERSISTED_FIELDS })
  const watchedKey = JSON.stringify(watched)
  useEffect(() => {
    const next: Record<string, string> = {}
    PERSISTED_FIELDS.forEach((key, i) => {
      const v = watched[i]
      // eligibility is a boolean; the rest are strings. Persist booleans as "true"/"".
      next[key] = typeof v === "boolean" ? (v ? "true" : "") : (v ?? "")
    })
    setFields(next)
    // watched is intentionally omitted: watchedKey already encodes its values, and including
    // the array (a fresh reference each render) would defeat the guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedKey])

  const [contactMethod, ideaValue] = useWatch({
    control,
    name: ["contactMethod", "ideaDescription"],
  })

  // Changing the method reinterprets the value (an email is not an Instagram handle), so the
  // value field is cleared on a real change — never on the first render, which would wipe a
  // value restored from the store (D-Blueprint 5(a)).
  const previousMethod = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (previousMethod.current !== undefined && previousMethod.current !== contactMethod) {
      setValue("contactValue", "")
      clearErrors("contactValue")
    }
    previousMethod.current = contactMethod
  }, [contactMethod, setValue, clearErrors])

  // FS §4.5 / D-Blueprint 5(c): on a blocked submit, smooth-scroll the FIRST invalid field
  // into view. Scroll, not a state change — the visitor keeps their place in the single scroll.
  function firstInvalid(invalidFields: (keyof RequestFormInput)[]): keyof RequestFormInput | undefined {
    const set = new Set(invalidFields)
    return FIELD_ORDER.find((field) => set.has(field))
  }

  function scrollToFirstError(invalidFields: (keyof RequestFormInput)[]) {
    const first = firstInvalid(invalidFields)
    if (!first) return
    // scrollIntoView is a browser API absent in jsdom; guard so tests (and any non-DOM
    // environment) don't throw.
    document.getElementById(first)?.scrollIntoView?.({ behavior: "smooth", block: "center" })
  }

  // Client-resolver path: RHF's shouldFocusError already focuses the first error; we add the
  // smooth scroll.
  function onInvalid(formErrors: FieldErrors<RequestFormInput>) {
    scrollToFirstError(Object.keys(formErrors) as (keyof RequestFormInput)[])
  }

  async function onSubmit(data: RequestFormData) {
    setStatus("submitting")
    setUploadHandlesError(null)

    // Wait for any in-flight upload the visitor watched to settle before building the payload,
    // so a file mid-upload at click time is not silently dropped.
    await waitForUploads()

    try {
      const formData = new FormData()
      const f = REQUEST_FIELDS

      formData.append(f.clientSubmissionId, getClientSubmissionId())
      formData.append(f.clientName, data.clientName)
      formData.append(f.ideaDescription, data.ideaDescription)
      formData.append(f.placement, data.placement)
      formData.append(f.size, data.size)
      formData.append(f.color, data.color)
      formData.append(f.eligibility, String(data.eligibility))
      // Sent as entered; the server normalizes for storage (FS §3.4 needs the raw form).
      formData.append(f.contactMethod, data.contactMethod)
      formData.append(f.contactValue, data.contactValue)

      if (data.budget) formData.append(f.budget, data.budget)

      // Honeypot: send whatever the hidden field holds (empty for a real visitor). A bot that
      // auto-filled it sends a non-empty value the server rejects as spam.
      formData.append(f.website, honeypotRef.current?.value ?? "")

      for (const slot of getSnapshot().slots) {
        if (slot.status === "uploaded" && slot.handle) {
          formData.append(f.uploadHandles, slot.handle)
        }
      }

      const res = await fetch("/api/request", { method: "POST", body: formData })
      const response = await res.json()

      // A usable reference code is required before the destructive success transition: resetDraft()
      // revokes previews, clears the field bag, and rotates clientSubmissionId, and /success is a
      // read-once page. `res.json()` is untyped, so a malformed `{ ok: true }` (missing/empty/
      // non-string code) must NOT take that path — it would strand the visitor on a Success page
      // showing an invalid code with nothing recoverable. Treat it as a technical failure instead,
      // preserving the same clientSubmissionId + form data for an idempotent retry.
      const referenceCode: unknown = response.referenceCode
      if (response.ok === true && typeof referenceCode === "string" && referenceCode.length > 0) {
        // Build the Success payload from the RAW entered values the client still holds (before any
        // server normalization) — the contact echo (FS §3.4 item 4) shows them as entered. Order
        // matters: resetDraft() mints a fresh state (which also nulls `success`), so setSuccess()
        // must run AFTER it, or the payload would be wiped. resetDraft() also clears the field bag,
        // so returning to Request in this session shows an empty form.
        const payload = {
          referenceCode,
          contactMethod: data.contactMethod,
          contactValue: data.contactValue,
        }
        setFailedAttempts(0)
        resetDraft()
        setSuccess(payload)
        router.push("/success")
      } else if (response.ok === true) {
        // Server claimed success but the response is unusable (no valid reference code). Nothing was
        // reset, so the retry path stays intact; surface it as a technical failure.
        setStatus("error")
        setFailedAttempts((n) => n + 1)
      } else if (response.error?.code === API_ERROR_CODES.VALIDATION_ERROR) {
        const fieldErrors = response.error.fieldErrors as Record<string, string[]>

        // uploadHandles is not a rendered form control, so setError() on it would be
        // invisible — the visitor would press Submit and see nothing happen. The handles
        // the form holds are dead (expired TTL or otherwise unadoptable), so surface it as
        // a recoverable state instead: flip the uploaded slots back to `failed` (their
        // per-file Retry re-uploads the retained File and mints a fresh handle) and show a
        // message saying what to do.
        const uploadError = fieldErrors[REQUEST_FIELDS.uploadHandles]?.[0]
        if (uploadError) {
          invalidateUploadedSlots(uploadError)
          setUploadHandlesError(uploadError)
          setStatus("idle")
          return
        }

        const fields = Object.keys(fieldErrors) as (keyof RequestFormInput)[]
        if (fields.length > 0) {
          // A validation rejection is not a technical failure — reset the fallback counter.
          setFailedAttempts(0)
          for (const field of fields) {
            const message = fieldErrors[field]?.[0]
            if (message) setError(field, { message })
          }
          setStatus("idle")
          // Focus + scroll the first server-flagged field in DOM order (FS §4.5: scrolled
          // AND focused). setError does not focus unless asked, and the RHF `errors` snapshot
          // is stale in this closure, so derive from the server field set.
          const first = firstInvalid(fields)
          if (first) {
            setFocus(first)
            scrollToFirstError(fields)
          }
        } else {
          setStatus("error")
          setFailedAttempts((n) => n + 1)
        }
      } else {
        setStatus("error")
        setFailedAttempts((n) => n + 1)
      }
    } catch {
      setStatus("error")
      setFailedAttempts((n) => n + 1)
    }
  }

  const sizeOptions = SIZE_OPTIONS.map((v) => ({
    value: v,
    label: t(`sizeOptions.${v}`),
  }))

  const colorOptions = COLOR_OPTIONS.map((v) => ({
    value: v,
    label: t(`colorOptions.${v}`),
  }))

  const contactMethodOptions = OFFERED_CONTACT_METHODS.map((v) => ({
    value: v,
    label: t(`contactMethodOptions.${v}`),
  }))

  const err = (field: keyof RequestFormInput) => getFieldError(field, errors, t)

  const isSubmitting = status === "submitting"
  const hasUploadingSlot = draft.slots.some((slot) => slot.status === "uploading")
  const uploadHint = `${t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })} ${t("uploadFormatsHint")}`

  const ideaLength = (ideaValue ?? "").length
  const ideaCounter =
    ideaLength >= IDEA_COUNTER_THRESHOLD ? t("ideaCounter", { count: ideaLength, max: IDEA_MAX }) : undefined

  // Submit CTA copy: the click is always accepted (the handler waits for in-flight uploads);
  // the label distinguishes "sending" from "waiting for uploads" so the button is never silent.
  const submitLabel = isSubmitting
    ? hasUploadingSlot
      ? t("submitButtonWaitingUploads")
      : t("submitButtonLoading")
    : t("submitButton")

  const uploadCards = [
    { category: "artist_work" as const, label: t("uploads.artistWorkLabel"), benefit: t("uploads.artistWorkBenefit") },
    { category: "inspiration" as const, label: t("uploads.inspirationLabel"), benefit: t("uploads.inspirationBenefit") },
    { category: "placement_photo" as const, label: t("uploads.placementPhotoLabel"), benefit: t("uploads.placementPhotoBenefit") },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-8">
      {/* Honeypot (FS §4.5): off-screen, not display:none (some bots skip hidden fields),
          aria-hidden + tabIndex=-1 + autoComplete=off so assistive tech and real keyboard users
          never reach it. Not registered with RHF; read via honeypotRef at submit. */}
      <input
        ref={honeypotRef}
        type="text"
        name={REQUEST_FIELDS.website}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />
      {/* Introduction (FS §4.1) */}
      <p className="text-sm text-muted-foreground">{t("introduction")}</p>

      {/* Idea block */}
      <section className="flex flex-col gap-6">
        <h2 className="text-base font-semibold text-foreground">{t("ideaBlockTitle")}</h2>
        <TextareaInput
          id="ideaDescription"
          label={t("ideaDescriptionLabel")}
          placeholder={t("ideaDescriptionPlaceholder")}
          hint={ideaCounter ?? t("ideaDescriptionHint")}
          error={err("ideaDescription")}
          maxLength={IDEA_MAX}
          {...register("ideaDescription")}
        />
      </section>

      {/* Project details block */}
      <section className="flex flex-col gap-6">
        <h2 className="text-base font-semibold text-foreground">{t("projectDetailsTitle")}</h2>
        <SelectInput
          id="size"
          label={t("sizeLabel")}
          placeholder={t("sizePlaceholder")}
          options={sizeOptions}
          error={err("size")}
          {...register("size")}
        />
        <SelectInput
          id="color"
          label={t("colorLabel")}
          placeholder={t("colorPlaceholder")}
          options={colorOptions}
          error={err("color")}
          {...register("color")}
        />
        <TextInput
          id="budget"
          label={t("budgetLabel")}
          placeholder={t("budgetPlaceholder")}
          hint={t("budgetHint")}
          error={err("budget")}
          {...register("budget")}
        />
      </section>

      {/* Reference Uploads block — three motivation cards (FS §4.2 fields 5–7, §4.4 / A.1),
          consuming Item 1's upload plumbing. The three uploads are optional; no requiredness is
          implied for THEM. Placement (FS §4.2 field 2, required free text) is this section's Block
          per the field table (amended 2026-07-18 to match the 2026-07-17 grouping decision) — it
          is required even though the uploads beside it are not. */}
      <section className="flex flex-col gap-6">
        <h2 className="text-base font-semibold text-foreground">{t("uploads.sectionTitle")}</h2>
        <TextInput
          id="placement"
          label={t("placementLabel")}
          placeholder={t("placementPlaceholder")}
          hint={t("placementHint")}
          error={err("placement")}
          {...register("placement")}
        />
        {uploadCards.map((card) => (
          <UploadCategoryInput
            key={card.category}
            id={`upload-${card.category}`}
            category={card.category}
            label={card.label}
            benefit={card.benefit}
            buttonText={t("uploads.buttonText", { maxFiles: MAX_FILES_PER_FIELD })}
            hint={uploadHint}
            uploadingLabel={t("uploads.uploadingLabel")}
            errorMessage={(errorKey) => getValidationKeyMessage(errorKey, t)}
            retryLabel={t("uploads.retryLabel")}
            removeFileLabel={(fileName) => t("uploads.removeFile", { fileName })}
            maxFilesWarning={t("uploads.maxFilesWarning", { maxFiles: MAX_FILES_PER_FIELD })}
          />
        ))}
      </section>

      {/* Contact block — Name (FS §4.2 field 8) lives here. The contact-method fields are
          UNCHANGED (the five-method model is Block C). */}
      <section className="flex flex-col gap-4 rounded-md border border-border p-4">
        <TextInput
          id="clientName"
          label={t("clientNameLabel")}
          placeholder={t("clientNamePlaceholder")}
          error={err("clientName")}
          {...register("clientName")}
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t("contactSectionTitle")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t("contactSectionHint")}</p>
        </div>
        <SelectInput
          id="contactMethod"
          label={t("contactMethodLabel")}
          placeholder={t("contactMethodPlaceholder")}
          options={contactMethodOptions}
          error={err("contactMethod")}
          {...register("contactMethod")}
        />
        {/* Exactly one value field exists in the DOM at a time (FS §4.2, 10a–e). One stable
            `contactValue` control rather than five registered names: five would retain hidden
            values that could be submitted. Its type/label/placeholder follow the method. */}
        {isContactMethod(contactMethod) && (
          <TextInput
            id="contactValue"
            label={t(`contactValueLabel.${contactMethod}`)}
            placeholder={t(`contactValuePlaceholder.${contactMethod}`)}
            type={CONTACT_INPUT_TYPE[contactMethod]}
            inputMode={contactMethod === "phone" || contactMethod === "whatsapp" ? "tel" : undefined}
            error={err("contactValue")}
            {...register("contactValue")}
          />
        )}
      </section>

      {/* Eligibility & Privacy block (FS §4.2 field 11 + §4.7 / A.3). */}
      <section className="flex flex-col gap-3">
        <CheckboxInput
          id="eligibility"
          label={t("eligibilityLabel", { ageThreshold: AGE_THRESHOLD })}
          error={err("eligibility")}
          {...register("eligibility")}
        />
        <p className="text-xs text-muted-foreground">{t("privacyStatement")}</p>
      </section>

      {/* The server rejected this submit's upload handles (expired or unadoptable). The
          affected slots have been flipped back to `failed` above, so each shows its own
          Retry control; this line tells the visitor what happened and what to do. */}
      {uploadHandlesError && (
        <p role="alert" className="text-sm text-destructive">
          {getValidationKeyMessage(uploadHandlesError, t)}
        </p>
      )}

      {/* Technical (network/server) failure: reassure that nothing was lost; after ≥2
          consecutive failures, additionally show the A.4 Instagram fallback (FS §4.5). */}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {failedAttempts >= FALLBACK_AFTER_ATTEMPTS
            ? t("errorInstagramFallback", { handle: INSTAGRAM_HANDLE })
            : t("errorDetailsPreserved")}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
