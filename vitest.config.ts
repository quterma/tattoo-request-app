import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
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
