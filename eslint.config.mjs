import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable this rule globally
      "@typescript-eslint/no-unused-vars": [
        "warn", // Change unused vars to warnings instead of errors
        { vars: "all", args: "none", ignoreRestSiblings: true },
      ],
      "react-hooks/exhaustive-deps": "warn", // Ensure react hooks dependencies are monitored but not errors
    },
  },
];

export default eslintConfig;
