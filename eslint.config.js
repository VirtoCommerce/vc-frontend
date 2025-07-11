import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import sonarjs from "eslint-plugin-sonarjs";
import sortExportAll from "eslint-plugin-sort-export-all";
import sortExports from "eslint-plugin-sort-exports";
import storybook from "eslint-plugin-storybook";
import tailwindcss from "eslint-plugin-tailwindcss";
import vue from "eslint-plugin-vue";
import vuejsAccessibility from "eslint-plugin-vuejs-accessibility";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/",
      "dist/",
      ".certificates/",
      "artifacts/",
      "storybook-static/",
      "storybook-styles/dist/",
      "client-app/public/fcm-service-worker-v1.1.js",
      ".deployment/",
      ".github/",
      ".husky/",
      ".vscode/",
      ".yarn/",
      "assets/",
      "content/",
      "client-app/modules/**/api/graphql/types.ts",
      "client-app/core/api/graphql/**/types.ts",
      "coverage/",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.worker,
        Accept: "readonly",
      },
    },
    plugins: {
      import: importPlugin,
      "sort-export-all": sortExportAll,
      "sort-exports": sortExports,
      tailwindcss,
      "vuejs-accessibility": vuejsAccessibility,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...vue.configs["flat/recommended"],

  sonarjs.configs.recommended,
  {
    plugins: {
      "sort-export-all": sortExportAll,
    },
    rules: {
      "sort-export-all/sort-export-all": "warn",
    },
  },
  ...tailwindcss.configs["flat/recommended"],
  vuejsAccessibility.configs["flat/recommended"],
  storybook.configs["flat/recommended"],

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: [
          "./tsconfig.app.json",
          "./tsconfig.vitest.json",
          "./tsconfig.storybook.json",
          "./tsconfig.node.json",
        ],
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "no-undef": "off",
    },
  },

  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
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
      "@typescript-eslint/no-unsafe-enum-comparison": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "import/consistent-type-specifier-style": "warn",
      "import/no-cycle": "error",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "unknown", "parent", "sibling", "index", "object", "type"],
          pathGroups: [
            { pattern: "**/*.scss", group: "type", position: "after" },
            { pattern: "**/*.vue", group: "type", position: "after" },
          ],
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
      "vue/block-order": ["warn", { order: ["template", "script[setup]", "style:not([scoped])", "style[scoped]"] }],
      "vue/custom-event-name-casing": [
        "warn",
        "camelCase",
        {
          ignores: ["/^[a-z]+:[a-z]+(?:[A-Z][a-z]+)*$/u"],
        },
      ],
      "vue/define-emits-declaration": "warn",
      "vue/define-macros-order": ["warn", { order: ["defineOptions", "defineEmits", "defineProps", "defineSlots"] }],
      "vue/define-props-declaration": ["warn", "type-based"],
      "vue/html-button-has-type": "warn",
      "vue/no-multiple-objects-in-class": "warn",
      "vue/no-required-prop-with-default": "warn",
      "vue/no-static-inline-styles": "warn",
      "vue/no-setup-props-reactivity-loss": "error",
      "vue/no-useless-v-bind": "warn",
      "vue/padding-line-between-blocks": "warn",
      "vue/padding-lines-in-component-definition": "warn",
      "vue/prefer-define-options": "warn",
      "vue/require-emit-validator": "warn",
      "vuejs-accessibility/click-events-have-key-events": "warn",
      "vuejs-accessibility/no-static-element-interactions": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "sonarjs/no-duplicate-string": "off",
      "tailwindcss/no-custom-classname": "off",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vuejs-accessibility/form-control-has-label": "off",
      "vuejs-accessibility/label-has-for": "off",
    },
  },

  {
    files: ["**/*.ts"],
    ignores: ["./*.js", "./*.ts", "**/components/**/index.ts", "*.stories.ts", "shims-*.d.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@apollo/client",
              message: "@apollo/client is for React only. Please import from @apollo/client/* or @vue/apollo-composable",
            },
            {
              name: "@vueuse/core",
              importNames: ["useFetch"],
              message: "Please import useFetch from @/core/api/common instead",
            },
            {
              name: "@vueuse/integrations/useAxios.mjs",
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

  {
    // Disable type-aware linting on JS/CJS files.
    files: ["**/*.js", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  prettier,
);
