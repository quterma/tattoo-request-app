import { parsePhoneNumberFromString } from "libphonenumber-js/max"
import type { ContactMethod } from "../config"

/**
 * Per-method normalization + validation for the five-method contact model (FS §4.2 fields
 * 10a–e; PROJECT_DECISIONS.md — "Stage 6 Contact Model" + "Contact-validation amendment").
 *
 * Each normalizer takes the raw entered string and returns either the value to PERSIST (already
 * normalized: `@` stripped, phone in E.164) or null when invalid. The raw entered value is kept
 * by the caller — FS §3.4 requires the Success echo to show the value **as entered**, while
 * persistence needs it normalized.
 *
 * Rules are research-established, not invented (research/done/RESEARCH_2026-07-16_contact-model-
 * validation-and-decomposition.md); the phone behavior below is verified against the installed
 * libphonenumber-js version by this module's tests, not assumed from the docs.
 */

/** Strips surrounding whitespace and exactly one optional leading "@". */
function stripHandle(raw: string): string {
  const trimmed = raw.trim()
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed
}

/**
 * Instagram: 1–30 chars over letters/digits/dot/underscore (FS §4.2 field 10d).
 *
 * Deliberately NO dot-position rules (no leading/trailing/consecutive-dot checks): the research
 * found no authoritative Meta grammar for them, so enforcing them would add unverified rules
 * whose only effect is rejecting real handles.
 */
const INSTAGRAM_RE = /^[A-Za-z0-9._]{1,30}$/

export function normalizeInstagram(raw: string): string | null {
  const handle = stripHandle(raw)
  return INSTAGRAM_RE.test(handle) ? handle : null
}

/**
 * Telegram: 5–32 chars over letters/digits/underscore, never starting with a digit
 * (FS §4.2 field 10e, corrected 2026-07-16).
 *
 * NOT the Instagram shape — Telegram forbids dots and 1–4-char names and rejects a digit-first
 * username. A leading underscore is permitted: no rule prohibiting one was found, and the
 * stricter letter-first form would risk rejecting a real handle.
 */
const TELEGRAM_RE = /^(?![0-9])[A-Za-z0-9_]{5,32}$/

export function normalizeTelegram(raw: string): string | null {
  const handle = stripHandle(raw)
  return TELEGRAM_RE.test(handle) ? handle : null
}

/**
 * Phone / WhatsApp: any valid Israeli number (geographic, mobile, or recognized 07 range —
 * not mobile-only), normalized to E.164.
 *
 * The `country === "IL"` check is load-bearing, not decoration: `isValid()` alone accepts a
 * well-formed foreign number (a US "+1 202 555 0100" parses valid), which the artist could not
 * reach under an Israel-only reply model. Verified against the installed version in the tests.
 */
export function normalizeIsraeliPhone(raw: string): string | null {
  const parsed = parsePhoneNumberFromString(raw.trim(), "IL")
  if (!parsed || parsed.country !== "IL" || !parsed.isValid()) return null
  return parsed.number
}

/** Email is normalized only by trimming; format validation stays with the schema (RFC-basic). */
export function normalizeEmail(raw: string): string {
  return raw.trim()
}

/**
 * Normalizes a contact value for the chosen method. Returns null when the value is invalid for
 * that method. Email returns the trimmed value — its RFC-basic check belongs to the schema, so
 * this never rejects an email.
 */
export function normalizeContactValue(method: ContactMethod, raw: string): string | null {
  switch (method) {
    case "whatsapp":
    case "phone":
      return normalizeIsraeliPhone(raw)
    case "instagram":
      return normalizeInstagram(raw)
    case "telegram":
      return normalizeTelegram(raw)
    case "email":
      return normalizeEmail(raw)
  }
}
