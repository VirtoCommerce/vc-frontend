module.exports = {
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ["**/*.{es,umd}.js"],
  plugins: ["vue", "import", "@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "@vue/prettier",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: {
      // Script parser for `<script>`
      js: "espree",

      // Script parser for `<script lang="ts">`
      ts: "@typescript-eslint/parser",

      // Script parser for vue directives (e.g. `v-if=` or `:attribute=`)
      // and vue interpolations (e.g. `{{variable}}`).
      // If not specified, the parser determined by `<script lang ="...">` is used.
      //"<template>": "espree",
    },
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "vue/script-setup-uses-vars": "error",
    "import/no-unresolved": "error",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "vue/multi-word-component-names": "off",
  },
  overrides: [
    // Fix no-used-vars when importing ts types in .vue files
    {
      files: ["*.vue"],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
      },
    },
  ],
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
