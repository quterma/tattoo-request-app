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
        "warn",
        {
          allow: [
            "next/*",
            "next/**",
            "react/*",
            "react-dom/*",
            "next-intl/*",
            "@tailwindcss/*",
            "eslint/*",
            "eslint-config-next/*",
            "**/shared/i18n/*",
            "@hookform/resolvers/*",
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
