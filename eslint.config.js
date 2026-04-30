import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "no-console": ["error", { "allow": ["warn", "error"] }]
    }
  },
  {
    ignores: [".next/**", "node_modules/**", "dist/**"]
  }
];
