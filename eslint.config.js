import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "proyecto-template/**",
      "skills/**",
      "services/pulse-mcp/**",
      "src/components/**",
      "src/pages/**",
      "src/hooks/**",
      "src/lib/**",
      "src/services/**",
      "src/utils/**",
      "src/types/**",
      "src/config/performance.ts",
      "supabase/functions/github-token-exchange/**",
      "tailwind.config.ts"
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
    },
  }
);
