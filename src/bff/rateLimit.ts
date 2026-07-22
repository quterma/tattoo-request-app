/**
 * Best-effort, in-memory, per-key fixed-window rate limiter — a burst shield, NOT a
 * security boundary.
 *
 * Honest limitation: on Vercel's multi-instance serverless runtime this counter is
 * per-instance, so a determined attacker spreading load across warm instances gets
 * some multiple of the configured limit. It blunts a naive script or accidental flood;
 * it does not bound a determined caller. The durable, non-caller-resettable bound on
 * POST /api/upload lives in bff/uploadQuota.ts (Upstash-backed, per-IP, fail-closed);
 * that durable check runs FIRST in the route and this limiter runs only after it, as a
 * fast in-process burst shield behind it.
 */

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets — for a Retry-After header. */
  retryAfterSeconds: number
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = windows.get(key)

  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    evictExpired(now)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/**
 * Lazy eviction of expired windows — no timer, so nothing keeps the process alive and
 * the map cannot grow unbounded across a long-lived instance. Runs only when a new
 * window is opened.
 */
function evictExpired(now: number): void {
  for (const [key, window] of windows) {
    if (now >= window.resetAt) windows.delete(key)
  }
}

/** Test-only: reset the shared window map between cases. */
export function __resetRateLimitForTests(): void {
  windows.clear()
}

/**
 * Extracts the platform-derived client IP used to key both limiters.
 *
 * On Vercel this is trustworthy for keying: Vercel overwrites `x-forwarded-for` at the
 * edge and does NOT forward externally-set values ("This restriction is in place to
 * prevent IP spoofing" — Vercel request-headers docs), so a caller cannot mint a fresh
 * bucket by setting the header, the way it can mint a fresh clientSubmissionId. A custom
 * X-Forwarded-For requires the Enterprise Trusted Proxy add-on, which this project does
 * not use.
 *
 * Preference order:
 *  1. `x-vercel-forwarded-for` — Vercel's proprietary copy; unlike x-forwarded-for it is
 *     NOT overwritten if a proxy is placed on top of Vercel, so it is the more robust key.
 *  2. `x-forwarded-for` (first hop) — identical value on the default topology.
 *  3. `x-real-ip` — identical fallback.
 *  4. `"unknown"` — every source-less OR malformed-source request shares one bucket, so a
 *     missing/garbage header degrades to a shared limit rather than silently disabling it or
 *     minting a per-value bucket.
 *
 * The extracted token must look like an IP before it is trusted as a key: a non-IP value
 * (two distinct garbage strings would otherwise become two independent buckets — a per-value
 * bypass) collapses to the shared `unknown` bucket. On the real Vercel topology the header is
 * always a valid IP; this is the invalid-source contract, defence-in-depth below that.
 */
const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/
// Broad IPv6 shape: hex groups and `:` (covers `::` compression and IPv4-mapped tails). Not a
// strict validator — enough to reject non-IP garbage without rejecting a real address.
const IPV6 = /^[0-9a-f:]+(?:\.\d{1,3}){0,3}$/i

function isIpLike(value: string): boolean {
  return (IPV4.test(value) || IPV6.test(value)) && value.length <= 45
}

export function clientIpFromHeaders(headers: Headers): string {
  const candidate =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-real-ip")
  if (candidate) {
    const first = candidate.split(",")[0].trim()
    if (first && isIpLike(first)) return first
  }
  return "unknown"
}
