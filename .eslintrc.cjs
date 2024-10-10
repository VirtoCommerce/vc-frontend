/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    node: true,
    worker: true,
  },
  extends: [
    "eslint:recommended", // See rules: https://eslint.org/docs/latest/rules/
    "plugin:vue/vue3-recommended", // See rules: https://eslint.vuejs.org/rules
    "plugin:@typescript-eslint/recommended-type-checked", // See rules: https://typescript-eslint.io/rules/
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    "@vue/prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:sort-export-all/recommended",
    "plugin:sonarjs/recommended-legacy",
    "plugin:tailwindcss/recommended", // See rules: https://github.com/francoismassart/eslint-plugin-tailwindcss#supported-rules
    "plugin:vuejs-accessibility/recommended", // See rules: https://github.com/vue-a11y/eslint-plugin-vuejs-accessibility/tree/main/docs
    "plugin:storybook/recommended", // See rules: https://github.com/storybookjs/eslint-plugin-storybook/tree/main/docs/rules
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    project: ["./tsconfig.vitest.json", "./tsconfig.app.json", "./tsconfig.node.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: ["vue", "import", "sort-exports", "sort-export-all", "@typescript-eslint", "sonarjs", "vuejs-accessibility"],
  rules: {
    /**
     * Errors
     */
    "@typescript-eslint/no-shadow": "error",
    curly: "error",
    "import/no-unresolved": "error",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "vue/block-lang": ["error", { script: { lang: "ts" } }],
    "vue/prefer-prop-type-boolean-first": "error",
    "vue/prefer-true-attribute-shorthand": "error",
    "vue/v-for-delimiter-style": "error",
    "vue/no-duplicate-attr-inheritance": "error",
    "vue/no-irregular-whitespace": "error",
    "vue/valid-define-options": "error",
    "vuejs-accessibility/anchor-has-content": [
      "error",
      {
        accessibleChildren: ["i", "img", "VcIcon"],
        accessibleDirectives: ["t"],
      },
    ],
    "vuejs-accessibility/heading-has-content": [
      "error",
      {
        components: ["VcTypography"],
        accessibleDirectives: ["t"],
      },
    ],

    /**
     * Warnings
     */
    "@typescript-eslint/consistent-type-imports": ["warn", { disallowTypeAnnotations: false }],
    "@typescript-eslint/naming-convention": [
      "warn",
      { selector: "interface", format: ["PascalCase"], prefix: ["I"] },
      { selector: "typeAlias", format: ["PascalCase"], suffix: ["Type"] },
    ],
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          arguments: false,
        },
      },
    ],
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-enum-comparison": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "import/consistent-type-specifier-style": "warn",
    "import/no-cycle": "error",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "unknown", "parent", "sibling", "index", "object", "type"],
        pathGroups: [{ pattern: "**/*.vue", group: "type", position: "after" }],
        alphabetize: { order: "asc", orderImportKind: "asc" },
        "newlines-between": "never",
      },
    ],
    "no-console": "warn",
    "vue/component-api-style": "warn",
    "vue/component-name-in-template-casing": [
      "warn",
      "PascalCase",
      {
        registeredComponentsOnly: false,
        ignores: [
          "/^custom-/",
          "keep-alive",
          "component",
          "transition",
          "transition-group",
          "teleport",
          "suspense",
          "router-view",
          "router-link",
          "i18n-t",
        ],
      },
    ],
    "vue/component-tags-order": [
      "warn",
      { order: ["template", "script:not([setup])", "script[setup]", "style:not([scoped])", "style[scoped]"] },
    ],
    "vue/custom-event-name-casing": [
      "warn",
      "camelCase",
      {
        ignores: ["/^[a-z]+:[a-z]+(?:[A-Z][a-z]+)*$/u"], // Example: $emit('change:itemQuantity', $event)
      },
    ],
    "vue/define-emits-declaration": "warn",
    "vue/define-macros-order": ["warn", { order: ["defineOptions", "defineEmits", "defineProps", "defineSlots"] }],
    "vue/define-props-declaration": ["warn", "type-based"],
    "vue/html-button-has-type": "warn",
    "vue/no-multiple-objects-in-class": "warn",
    "vue/no-required-prop-with-default": "warn",
    "vue/no-static-inline-styles": "warn",
    "vue/no-setup-props-reactivity-loss": "warn",
    "vue/no-useless-v-bind": "warn",
    "vue/padding-line-between-blocks": "warn",
    "vue/padding-lines-in-component-definition": "warn",
    "vue/prefer-define-options": "warn",
    "vue/require-emit-validator": "warn",
    "vuejs-accessibility/click-events-have-key-events": "warn",
    "vuejs-accessibility/no-static-element-interactions": "warn",

    /**
     * Disabled
     */
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/unbound-method": "off",
    "sonarjs/no-duplicate-string": "off",
    "tailwindcss/no-custom-classname": "off",
    "vue/multi-word-component-names": "off",
    "vue/require-default-prop": "off",
    "vuejs-accessibility/form-control-has-label": "off",
    "vuejs-accessibility/label-has-for": "off",
  },
  overrides: [
    // Fix import of ts types in .vue files
    {
      files: ["*.vue"],
      rules: {
        "no-undef": "off",
      },
    },
    {
      files: ["*.ts"],
      excludedFiles: ["./*.js", "./*.ts", "**/components/**/index.ts", "*.stories.ts", "shims-*.d.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@apollo/client",
                message:
                  "@apollo/client is for React only. Please import from @apollo/client/* or @vue/apollo-composable",
              },
              {
                name: "@vueuse/core",
                importNames: ["useFetch"],
                message: "Please import useFetch from @/core/api/common instead",
              },
              {
                name: "@vueuse/integrations/useAxios",
                importNames: ["useAxios"],
                message: "Please import useAxios from @/core/api/common instead",
              },
              {
                name: "axios",
                importNames: ["default"],
                message: "Please use useAxios from @/core/api/common instead",
              },
            ],
          },
        ],
        "no-restricted-exports": [
          "warn",
          {
            restrictDefaultExports: {
              direct: true,
              named: true,
              defaultFrom: true,
              namedFrom: true,
              namespaceFrom: true,
            },
          },
        ],
      },
    },
    {
      files: ["**/components/**/index.ts"],
      rules: {
        "padding-line-between-statements": ["warn", { blankLine: "never", prev: "export", next: "export" }],
        "sort-exports/sort-exports": "warn",
      },
    },
    {
      files: ["client-app/ui-kit/*"],
      rules: {
        "no-console": ["off", { allow: ["warn", "error"] }],
      },
    },
    {
      files: ["scripts/*"],
      rules: {
        "no-console": "off",
      },
    },
  ],
  globals: {
    /**
     * Accept.js (Authorize.net)
     * @link https://developer.authorize.net/api/reference/features/acceptjs.html
     */
    Accept: "readonly",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.vitest.json", "./tsconfig.app.json", "./tsconfig.node.json"],
      },
      node: true,
    },
  },
};
