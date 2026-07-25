import "server-only"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const config = {
  supabase: {
    url: requireEnv("SUPABASE_URL"),
    secretKey: requireEnv("SUPABASE_SECRET_KEY"),
  },
  app: {
    deploymentStudioId: requireEnv("DEPLOYMENT_STUDIO_ID"),
  },
  upload: {
    // 32 random bytes, base64 — encrypts the opaque upload handles returned to
    // the public client. Rotating it invalidates in-flight handles (blast radius
    // is the handle TTL). See services/uploadToken.ts.
    tokenSecret: requireEnv("UPLOAD_TOKEN_SECRET"),
  },
  upstash: {
    // Durable per-IP upload quota store (Upstash Redis REST). Server-only; the
    // durable, non-caller-resettable bound on POST /api/upload lives here — the
    // in-memory limiter is only a best-effort burst shield. See bff/uploadQuota.ts.
    redisUrl: requireEnv("UPSTASH_REDIS_REST_URL"),
    redisToken: requireEnv("UPSTASH_REDIS_REST_TOKEN"),
  },
}
