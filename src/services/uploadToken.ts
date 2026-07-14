import "server-only"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { config } from "@/config"
import { UPLOAD_CATEGORIES } from "./storage"
import type { FileType } from "./storage"

/**
 * Opaque upload handles.
 *
 * A handle is the ONLY thing a public visitor holds as a reference to a file they
 * uploaded before their request exists. It is encrypted, not merely signed, for two
 * independent reasons:
 *
 * 1. Integrity — the handle carries the storage path the SERVER chose. If a visitor
 *    could forge or edit one, they could attach an arbitrary object (or another
 *    session's object) to their request. AES-GCM's auth tag makes that impossible.
 * 2. Confidentiality — a signed-but-readable token would put a raw storage path in
 *    the browser, which PROJECT_ARCHITECTURE.md forbids (storage paths never leave
 *    src/services/). Encryption keeps the path server-only even though the client
 *    physically holds the bytes.
 *
 * The embedded clientSubmissionId is the ownership check: adoption at submit time
 * requires it to equal the clientSubmissionId being submitted, so a file uploaded
 * under someone else's session id yields a handle that session never possesses.
 */

const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12
const AUTH_TAG_BYTES = 16
const KEY_BYTES = 32

/** A handle older than this is refused at adoption; its object becomes an orphan. */
export const UPLOAD_HANDLE_TTL_SECONDS = 2 * 60 * 60

export interface UploadTokenPayload {
  /** clientSubmissionId this file was uploaded under. */
  csid: string
  /** Upload category (FS §4.2 fields 5–7). */
  cat: FileType
  /** Server-chosen storage path. Never exposed in plaintext to the client. */
  path: string
  originalName: string
  mimeType: string
  size: number
  /** Issued-at, unix seconds. */
  iat: number
}

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey

  const key = Buffer.from(config.upload.tokenSecret, "base64")
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `UPLOAD_TOKEN_SECRET must decode to ${KEY_BYTES} bytes, got ${key.length}`,
    )
  }

  cachedKey = key
  return key
}

export function mintUploadHandle(payload: UploadTokenPayload): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ])

  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]).toString("base64url")
}

function isUploadTokenPayload(value: unknown): value is UploadTokenPayload {
  if (typeof value !== "object" || value === null) return false
  const p = value as Record<string, unknown>

  return (
    typeof p.csid === "string" &&
    typeof p.cat === "string" &&
    (UPLOAD_CATEGORIES as readonly string[]).includes(p.cat) &&
    typeof p.path === "string" &&
    p.path.length > 0 &&
    typeof p.originalName === "string" &&
    typeof p.mimeType === "string" &&
    typeof p.size === "number" &&
    Number.isFinite(p.size) &&
    typeof p.iat === "number" &&
    Number.isFinite(p.iat)
  )
}

/**
 * Decrypts and validates a handle. Returns null for anything that is not an
 * intact, well-formed handle this deployment minted — tampered, truncated,
 * garbage, or encrypted under a different key. Never throws: a malformed handle
 * is untrusted public input, not an exceptional condition.
 *
 * Does NOT check expiry or session ownership — that is the caller's job
 * (see bff/adoptUploads.ts), which knows which clientSubmissionId is being
 * submitted.
 */
export function readUploadHandle(handle: string): UploadTokenPayload | null {
  try {
    const raw = Buffer.from(handle, "base64url")
    if (raw.length <= IV_BYTES + AUTH_TAG_BYTES) return null

    const iv = raw.subarray(0, IV_BYTES)
    const ciphertext = raw.subarray(IV_BYTES, raw.length - AUTH_TAG_BYTES)
    const authTag = raw.subarray(raw.length - AUTH_TAG_BYTES)

    const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(authTag)

    // Throws if the auth tag does not verify — i.e. the handle was tampered with.
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
      "utf8",
    )

    const parsed: unknown = JSON.parse(plaintext)
    return isUploadTokenPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function isUploadHandleExpired(
  payload: UploadTokenPayload,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  return nowSeconds - payload.iat > UPLOAD_HANDLE_TTL_SECONDS
}
