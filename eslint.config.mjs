import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            "next/*",
            "next/**",
            "react/*",
            "react-dom/*",
            "next-intl/*",
            // Published entry point, not a reach into internals: libphonenumber-js exposes
            // ./max in its package exports map. The `max` metadata (not the default `min`) is
            // required for the strict isValid() the contact model depends on — see
            // PROJECT_DECISIONS.md, "Contact-validation amendment".
            "libphonenumber-js/*",
            "@tailwindcss/*",
            "eslint/*",
            "eslint-config-next/*",
            "**/shared/i18n/*",
            "**/shared/i18n/messages/*",
            "**/shared/ui",
            "**/shared/utils",
            "**/shared/api",
            "**/features/*/ui",
            "**/features/*/ui/**",
            "**/features/*/lib/**",
            "**/features/*/validation",
            "**/features/*/validation/**",
            "**/features/*/types",
            "**/features/*/config",
            "**/features/*/config/**",
            "@hookform/resolvers/*",
            "zod/v3",
            "zod/v4",
            "zod/v4/*",
            "yet-another-react-lightbox/*",
            "yet-another-react-lightbox/**",
            "**/services/supabaseAuth",
            "**/services/auth",
            "**/services/authLog",
            // Server-only secrets module, kept out of `@/config`'s barrel so importing the
            // barrel's studio.ts (client-safe) never drags `server-only` into a client bundle —
            // same reason services/supabaseAuth is separate from services/index.ts.
            "**/config/env",
            "@testing-library/jest-dom/*",
            "@vitejs/plugin-react",
            "vitest/*",
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])

export default eslintConfig
