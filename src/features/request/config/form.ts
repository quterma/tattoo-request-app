export const MAX_FILES_PER_FIELD = 3

export const MAX_FILES_TOTAL = 9

/**
 * Per-file size ceiling (FS §4.3, amended 2026-07-14 from 10 MB).
 *
 * Bounded by the platform, not by preference: Vercel Node Functions reject any request body
 * over 4.5 MB at the edge, before application code runs. Each file is uploaded in its own
 * request (one file per POST /api/upload), so this is per file, not per submission — 9 files
 * never sum against it. 4 MB leaves headroom for multipart framing.
 *
 * Lives in the shared feature config, not in the BFF, because both sides enforce it: the
 * client checks before sending (an oversized body dies at the edge with an opaque error) and
 * the server checks again because the client cannot be trusted.
 */
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024

/**
 * The three FS §4.2 upload categories (fields 5–7), in field order. Mirrors
 * services/storage.ts UPLOAD_CATEGORIES; kept here so the client feature layer
 * does not import the server-only services barrel.
 */
export const UPLOAD_CATEGORIES = ["artist_work", "inspiration", "placement_photo"] as const

export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number]

/**
 * Age-eligibility threshold (FS §4.2 field 11 / PRD D6). Owner-configurable; the form
 * renders it into the eligibility copy. Lives in this isomorphic feature config, not
 * `src/config` — it's request-feature behavior, not studio-identity data (see
 * PROJECT_DECISIONS.md — Stage 6 Contact Model, the same distinction drawn for
 * `OFFERED_CONTACT_METHODS`).
 */
export const AGE_THRESHOLD = 18

/**
 * The five contact methods (FS §4.2 field 9, amended 2026-07-15 — PROJECT_DECISIONS.md
 * "Stage 6 Contact Model"). Exactly one is chosen per request and reveals its one value field.
 * Phone and WhatsApp are deliberately separate: a phone number means "call me", a WhatsApp
 * number means "message me", and the artist wants to know which.
 */
export const CONTACT_METHODS = ["whatsapp", "email", "instagram", "telegram", "phone"] as const

export type ContactMethod = (typeof CONTACT_METHODS)[number]

/**
 * The methods THIS studio offers, in select order (owner decision 2026-07-16: WhatsApp, Email,
 * Instagram, Telegram, Phone; no default — the select opens on a placeholder).
 *
 * Per-studio configuration (Stage 6: code config, no admin UI — a post-release backlog item).
 * A studio may offer a subset by narrowing this array; the form renders from it and the server
 * validates the submitted method against it, so a disabled method cannot be submitted by a
 * crafted request.
 */
export const OFFERED_CONTACT_METHODS: readonly ContactMethod[] = [
  "whatsapp",
  "email",
  "instagram",
  "telegram",
  "phone",
]

export const SIZE_OPTIONS = ["small", "medium", "large", "extra-large", "not-sure"] as const

/** FS §4.2 field 4 (amended 2026-07-15, owner): two options only — Black & grey / Color. */
export const COLOR_OPTIONS = ["black-and-grey", "color"] as const

export type SizeOption = (typeof SIZE_OPTIONS)[number]
export type ColorOption = (typeof COLOR_OPTIONS)[number]
