/**
 * Best-effort, in-memory, per-key fixed-window rate limiter.
 *
 * Honest limitation: on Vercel's multi-instance serverless runtime this counter is
 * per-instance, so a determined attacker spreading load across warm instances gets
 * some multiple of the configured limit. It is a speed bump against naive scripts and
 * accidental floods, not a wall — appropriate for a single-artist site taking ~5–20
 * requests/week. Durable limiting (Upstash/Vercel KV) is tracked in PROJECT_BACKLOG,
 * gated on observed abuse. The real ceilings on abuse are the per-session object cap
 * and the per-file size/MIME limits, not this.
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
 * Extracts the client IP from a request. Vercel sets `x-forwarded-for`; the first
 * hop is the real client. Falls back to a constant so a missing header degrades to a
 * shared bucket rather than throwing (fail-closed-ish: everyone shares one limit).
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") ?? "unknown"
}
