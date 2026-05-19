import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// mobile/** is a separate Expo/React Native project with its own TS compiler.
// Exclude it entirely from the root Next.js ESLint config to avoid
// "File ignored because outside of base path" warnings.
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
  // Global ignore so ESLint never even opens mobile files
  { ignores: ["mobile/**"] },
  ...excludeMobile(coreWebVitals),
  ...excludeMobile(typescript),
];

export default eslintConfig;
