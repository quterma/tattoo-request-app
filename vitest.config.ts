import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      // server-only throws if imported outside a React Server Component. Under vitest
      // (jsdom) there is no RSC boundary, so alias it to a no-op; the server/client
      // split is enforced by Next at build time, not by tests.
      "server-only": resolve(__dirname, "src/shared/test/serverOnlyStub.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/shared/test/setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    passWithNoTests: true,
  },
})
