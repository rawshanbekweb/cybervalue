import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // These standalone browser scripts intentionally share top-level bindings.
    files: ["public/lessons/*/*.js"],
    languageOptions: { sourceType: "script" },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern:
            "^(esc|callout|table|panel|point|stack|expandLessons|updateFoundationStep|foundationSlides)$",
          argsIgnorePattern: "^_$",
          caughtErrors: "none",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "src/generated/**",
    "next-env.d.ts",
    ".local/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
