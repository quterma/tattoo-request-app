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
 * renders it into the eligibility copy. Lives in this isomorphic feature config — NOT
 * `src/config` (which is `server-only` and cannot reach the client that renders the form).
 */
export const AGE_THRESHOLD = 18

/**
 * Instagram handle for the last-resort failure fallback (FS §4.5 / Appendix A.4), shown only
 * after ≥2 consecutive failed submits. Owner-configurable; isomorphic (rendered client-side).
 * PLACEHOLDER — owner must set the real handle in the Stage 6 content pass. Rendered without
 * a leading "@" (the copy adds it).
 */
export const INSTAGRAM_HANDLE = "your_studio"

export const SIZE_OPTIONS = ["small", "medium", "large", "extra-large", "not-sure"] as const

/** FS §4.2 field 4 (amended 2026-07-15, owner): two options only — Black & grey / Color. */
export const COLOR_OPTIONS = ["black-and-grey", "color"] as const

/**
 * FS §4.2 field 2 (amended 2026-07-15): concrete body areas only — the "Other"/free-text
 * option was removed by owner decision. No free-text placement anywhere.
 */
export const PLACEMENT_OPTIONS = [
  "arm",
  "leg",
  "back",
  "chest",
  "ribs",
  "neck",
  "hand",
  "foot",
] as const

export type SizeOption = (typeof SIZE_OPTIONS)[number]
export type ColorOption = (typeof COLOR_OPTIONS)[number]
export type PlacementOption = (typeof PLACEMENT_OPTIONS)[number]
