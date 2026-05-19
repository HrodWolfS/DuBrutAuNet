import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import tsParser from "@typescript-eslint/parser";

// Restrict Next.js/TS web rules to non-mobile files so ESLint can still
// lint mobile/** files without the "file ignored" warning.
function excludeMobile(configs) {
  return configs.map((config) => {
    const keys = Object.keys(config);
    if (keys.length === 1 && keys[0] === "ignores") return config;
    return {
      ...config,
      ignores: [...(config.ignores ?? []), "mobile/**"],
    };
  });
}

const eslintConfig = [
  ...excludeMobile(coreWebVitals),
  ...excludeMobile(typescript),
  // Minimal config for React Native / Expo mobile files — TypeScript parser, no Next.js rules
  {
    files: ["mobile/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {},
  },
];

export default eslintConfig;
