import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/incident/new-incident-form.tsx"],
    rules: {
      // This is an App Router-only route; the legacy pages-router navigation rule does not apply here.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    files: ["components/admin/moderation-action-panel.tsx"],
    rules: {
      // This panel intentionally synchronizes its controlled editing state when the server-fetched incident changes.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
