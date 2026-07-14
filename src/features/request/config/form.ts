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

export const SIZE_OPTIONS = ["small", "medium", "large", "extra-large"] as const

export const COLOR_OPTIONS = ["black", "color", "mixed"] as const

export const PLACEMENT_OPTIONS = [
  "arm",
  "leg",
  "back",
  "chest",
  "ribs",
  "neck",
  "hand",
  "foot",
  "other",
] as const

export type SizeOption = (typeof SIZE_OPTIONS)[number]
export type ColorOption = (typeof COLOR_OPTIONS)[number]
export type PlacementOption = (typeof PLACEMENT_OPTIONS)[number]
