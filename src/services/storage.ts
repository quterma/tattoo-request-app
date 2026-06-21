import { supabase } from "./supabase"

const BUCKET = "request-images"
const MAX_RETRIES = 3
const RETRY_BASE_MS = 200

export type FileType = "reference" | "placement"

export interface UploadedFile {
  storagePath: string
  originalName: string
  mimeType: string
  size: number
  type: FileType
}

interface FileToUpload {
  file: File
  type: FileType
  storagePath: string
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

function buildFileList(
  referenceImages: File[],
  placementImages: File[],
  clientSubmissionId: string,
): FileToUpload[] {
  const files: FileToUpload[] = []

  for (let i = 0; i < referenceImages.length; i++) {
    const file = referenceImages[i]
    const ext = extFromMime(file.type)
    const index = String(i + 1).padStart(2, "0")
    files.push({
      file,
      type: "reference",
      storagePath: `${clientSubmissionId}/reference/reference-${index}.${ext}`,
    })
  }

  for (let i = 0; i < placementImages.length; i++) {
    const file = placementImages[i]
    const ext = extFromMime(file.type)
    const index = String(i + 1).padStart(2, "0")
    files.push({
      file,
      type: "placement",
      storagePath: `${clientSubmissionId}/placement/placement-${index}.${ext}`,
    })
  }

  return files
}

async function uploadWithRetry(item: FileToUpload): Promise<void> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(item.storagePath, item.file, {
        contentType: item.file.type,
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

async function cleanupFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return

  console.log(`[storage] cleanup: deleting ${paths.length} file(s)`, paths)

  const { error } = await supabase.storage.from(BUCKET).remove(paths)

  if (error) {
    console.error("[storage] cleanup failed:", error.message)
  } else {
    console.log("[storage] cleanup succeeded")
  }
}

export async function uploadRequestFiles(
  files: { referenceImages: File[]; placementImages: File[] },
  clientSubmissionId: string,
): Promise<UploadedFile[]> {
  const fileList = buildFileList(files.referenceImages, files.placementImages, clientSubmissionId)

  const uploaded: string[] = []
  const results: UploadedFile[] = []

  for (const item of fileList) {
    try {
      await uploadWithRetry(item)
      uploaded.push(item.storagePath)
      results.push({
        storagePath: item.storagePath,
        originalName: item.file.name,
        mimeType: item.file.type,
        size: item.file.size,
        type: item.type,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[storage] upload failed for ${item.storagePath}:`, message)
      await cleanupFiles(uploaded)
      throw new Error(`File upload failed: ${message}`)
    }
  }

  return results
}
