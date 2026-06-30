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
}
