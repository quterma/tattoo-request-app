import { randomUUID } from "node:crypto"
import { supabase } from "./supabase"

export const BUCKET = "request-images"
const MAX_RETRIES = 3
const RETRY_BASE_MS = 200

/**
 * The three FS §4.2 upload categories (fields 5–7). Replaces the Stage 3
 * two-category set ("reference" | "placement") — see PROJECT_DECISIONS.md,
 * Stage 6 Upload-Flow Architecture. The DB CHECK constraint on
 * request_files.type mirrors these values exactly.
 */
export const UPLOAD_CATEGORIES = ["artist_work", "inspiration", "placement_photo"] as const

export type FileType = (typeof UPLOAD_CATEGORIES)[number]

export interface UploadedFile {
  storagePath: string
  originalName: string
  mimeType: string
  size: number
  type: FileType
}

function isTransientError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("fetch") ||
    lower.includes("econnreset") ||
    lower.includes("socket") ||
    lower.includes("etimedout") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("504")
  )
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
}

function extFromMime(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? "jpg"
}

/**
 * Storage path for one selection-time upload.
 *
 * The filename is a server-generated UUID, not a positional index. Selection-time
 * upload has no batch: files arrive one at a time and can be removed or retried out
 * of order, so a positional `${type}-01` name (the Stage 3 scheme) is racy — two
 * concurrent uploads both compute `-01` and, with upsert:false, one fails. A UUID is
 * collision-free by construction and retry-safe. The {studioId}/{clientSubmissionId}/
 * prefix convention is preserved (PROJECT_DECISIONS.md — Stage 5A Storage Model).
 */
function buildStoragePath(
  studioId: string,
  clientSubmissionId: string,
  category: FileType,
  mimeType: string,
): string {
  return `${studioId}/${clientSubmissionId}/${category}/${randomUUID()}.${extFromMime(mimeType)}`
}

export function storagePrefixForSubmission(
  studioId: string,
  clientSubmissionId: string,
): string {
  return `${studioId}/${clientSubmissionId}`
}

async function uploadWithRetry(file: File, storagePath: string): Promise<void> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

    if (!error) return

    const isTransient = isTransientError(error.message)

    if (!isTransient) {
      throw new Error(`Upload failed (non-transient): ${error.message}`)
    }

    lastError = new Error(error.message)

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_MS * 2 ** (attempt - 1)))
    }
  }

  throw lastError ?? new Error("Upload failed after retries")
}

/**
 * Uploads a single file at selection time, before the request row exists.
 *
 * One file per call, independent of every other file — a failure here affects only
 * this file (FS §4.5). The batch-with-cleanup model of Stages 3–5 is gone: nothing
 * is deleted on failure, because there is no batch to unwind and the visitor may
 * retry this file alone.
 */
export async function uploadRequestFile(
  file: File,
  category: FileType,
  studioId: string,
  clientSubmissionId: string,
): Promise<UploadedFile> {
  const storagePath = buildStoragePath(studioId, clientSubmissionId, category, file.type)

  await uploadWithRetry(file, storagePath)

  return {
    storagePath,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    type: category,
  }
}

/**
 * Counts objects already stored under one clientSubmissionId, across all categories.
 *
 * This is the hard cap behind the public upload endpoint: without it, a single
 * session id can be replayed indefinitely to fill the bucket. Storage `list` is not
 * recursive, so each category prefix is listed separately.
 */
export async function countObjectsForSubmission(
  studioId: string,
  clientSubmissionId: string,
): Promise<number> {
  const prefix = storagePrefixForSubmission(studioId, clientSubmissionId)

  const counts = await Promise.all(
    UPLOAD_CATEGORIES.map(async (category) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(`${prefix}/${category}`, { limit: 100 })

      if (error) throw new Error(`Storage list failed: ${error.message}`)

      return data?.length ?? 0
    }),
  )

  return counts.reduce((total, count) => total + count, 0)
}

/**
 * Best-effort removal of storage objects. Logs the outcome (file count only, no
 * paths) and never throws.
 *
 * NOTE: this is no longer called on the submit path. Under selection-time upload the
 * files exist before the request does, and on a submit failure the visitor retries
 * with the same handles pointing at the same paths — deleting them would destroy the
 * very files the retry needs (and, on the idempotency-race path, the winning
 * request's live files). It survives as the primitive for the future orphaned-object
 * cleanup job (PROJECT_BACKLOG.md).
 */
export async function cleanupRequestFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return

  console.log(`[storage] cleanup: deleting ${paths.length} file(s)`)

  const { error } = await supabase.storage.from(BUCKET).remove(paths)

  if (error) {
    console.error("[storage] cleanup failed:", error.message)
  } else {
    console.log("[storage] cleanup succeeded")
  }
}

const SIGNED_URL_EXPIRY_SECONDS = 3600

/**
 * Generates a short-lived signed URL for a private request-images file.
 * Admin-only access; storagePath must already be known to belong to the
 * caller's studio before this is invoked (see services/requests.ts).
 */
export async function createSignedRequestFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS)

  if (error) {
    throw new Error(`Signed URL creation failed: ${error.message}`)
  }

  return data.signedUrl
}
