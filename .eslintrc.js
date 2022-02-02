module.exports = {
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ["**/*.{es,umd}.js"],
  plugins: ["import"],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    '@vue/eslint-config-typescript',
    "plugin:import/recommended",
    "plugin:import/typescript",
    "@vue/prettier",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "vue/script-setup-uses-vars": "error",
    "import/no-unresolved": "error",
    "vue/multi-word-component-names": "off"
  },
  overrides: [
    // Fix no-used-vars when importing ts types in .vue files
    {
      files: ["*.vue"],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error'
      }
    }
  ],
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly"
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      }
    }
  }
};
