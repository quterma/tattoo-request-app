import "server-only"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { config } from "@/config"

/**
 * Durable, non-caller-resettable per-IP quota for POST /api/upload.
 *
 * This is the real cross-instance bound the in-memory bff/rateLimit.ts limiter cannot
 * provide: the count lives in Upstash Redis, shared across every Vercel instance, keyed
 * on the platform-derived client IP (see clientIpFromHeaders — Vercel overwrites the
 * source header at the edge, so the key cannot be spoofed the way a clientSubmissionId
 * can). It bounds one source; it does not bound the number of sources (a distributed
 * caller multiplies the allowance) — an accepted residual per PROJECT_DECISIONS.md,
 * "Stage 6 Item 10 — abuse mitigation" §2. The global circuit-breaker (Option C) is
 * explicitly deferred.
 */

// 60 admitted uploads / IP / 24h. A named server constant, NOT an env var: changing it
// is a behavior decision (retunable in code without a migration), while the store
// credentials are environment. Real traffic is ~5–20 requests *per week*, each carrying
// a handful of images — so 60/day/IP is large headroom for any legitimate visitor
// (including several sharing one NAT/office IP) while still bounding a single-source bot.
export const UPLOAD_QUOTA_LIMIT = 60
export const UPLOAD_QUOTA_WINDOW = "24 h" as const

// Fail-closed deadline for a single store round-trip. The SDK's own `timeout` is disabled
// (below) because it fails OPEN (admits the request when Redis is slow). This deadline is the
// opposite: a store call that has not settled within it is treated as "unavailable" (→ 503, no
// write). It bounds a *stalled* (never-rejecting) fetch — a black-holed connection — that a
// try/catch alone cannot catch. Comfortably above normal REST latency, well under Vercel's
// Function limit so we, not the platform, own the timeout and emit the 503 + warn signal.
const QUOTA_STORE_DEADLINE_MS = 3000

export type UploadQuotaResult =
  | { ok: true; kind: "allowed" }
  | { ok: false; kind: "quota"; retryAfterSeconds: number }
  | { ok: false; kind: "unavailable" }

// Lazily constructed module singleton — one Redis connection + limiter reused across
// invocations on a warm instance. Constructed on first use (not at import) so a config
// or network problem surfaces as a fail-closed "unavailable" from checkUploadQuota
// rather than a throw at module load.
let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit {
  if (ratelimit) return ratelimit
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: config.upstash.redisUrl,
      token: config.upstash.redisToken,
    }),
    limiter: Ratelimit.fixedWindow(UPLOAD_QUOTA_LIMIT, UPLOAD_QUOTA_WINDOW),
    // Prefix the keys so nothing else keying on the same IP in a shared Upstash database can
    // collide: the studio AND the deployment environment. Without the env dimension a preview/
    // staging deploy serving the same studio would consume the production bucket for the same IP.
    // VERCEL_ENV is "production" | "preview" | "development"; absent (local) → "local".
    prefix: `upload-quota:${config.app.deploymentStudioId}:${process.env.VERCEL_ENV ?? "local"}`,
    // Disable the SDK's default 5s timeout (it defaults to 5000 and races a "success:true"
    // response when Redis is slow/unreachable — i.e. it fails OPEN). timeout:0 removes that
    // race (`if (this.timeout > 0)` in the SDK), so limit() awaits the real call. We impose our
    // OWN fail-CLOSED deadline in checkUploadQuota instead. This control MUST fail closed: on an
    // unreachable store the route returns 503 and writes nothing, never a silent admit.
    timeout: 0,
  })
  return ratelimit
}

/**
 * Consumes one unit of the caller's durable quota.
 *
 * Fail-closed on every failure mode: a rejection (construction, network, Redis error) OR a
 * stalled call that never settles within QUOTA_STORE_DEADLINE_MS both resolve to `unavailable`
 * — the caller must NOT write on that result and must NOT fall back to the in-memory limiter.
 * A clean breach resolves to `quota` with a Retry-After in seconds.
 */
export async function checkUploadQuota(sourceKey: string): Promise<UploadQuotaResult> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    // Race the store call against our own deadline: a hung fetch (never rejects) would otherwise
    // leave limit() pending until Vercel kills the Function, bypassing the 503 path entirely.
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("quota store deadline exceeded")), QUOTA_STORE_DEADLINE_MS)
    })
    const { success, reset } = await Promise.race([getRatelimit().limit(sourceKey), deadline])
    if (success) return { ok: true, kind: "allowed" }
    // `reset` is a Unix timestamp in ms for the window edge.
    const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { ok: false, kind: "quota", retryAfterSeconds }
  } catch {
    return { ok: false, kind: "unavailable" }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Test-only: drop the memoized limiter so a test can re-mock the store. */
export function __resetUploadQuotaForTests(): void {
  ratelimit = null
}
