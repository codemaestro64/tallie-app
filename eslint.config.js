import js from "@eslint/js";
import ts from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import nodePlugin from "eslint-plugin-node";

export default ts.config(
  {
    ignores: ["dist/**", "node_modules/**", "drizzle/**"],
  },

  js.configs.recommended,
  ...ts.configs.recommended,
  prettierRecommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2026,
        sourceType: "module",
      },
    },
    plugins: {
      node: nodePlugin,
    },
    rules: {
      "prettier/prettier": ["error", { semi: false }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "node/no-missing-import": "off",
    },
  }
);