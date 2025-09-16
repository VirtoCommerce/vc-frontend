import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier/recommended";
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

const tsconfigRootDir = import.meta.dirname;
const tsconfigs = {
  app: "./tsconfig.app.json",
  node: "./tsconfig.node.json",
  storybook: "./tsconfig.storybook.json",
  vitest: "./tsconfig.vitest.json",
  examples: "./examples/tsconfig.json",
};

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
      ".history/",
    ],
  },

  // Base configurations
  js.configs.recommended,
  sonarjs.configs.recommended,
  ...storybook.configs["flat/recommended"],
  ...vuejsAccessibility.configs["flat/recommended"],
  ...tailwindcss.configs["flat/recommended"],
  ...tseslint.configs.recommendedTypeChecked,
  ...vue.configs["flat/recommended"],

  // General configuration for all files
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
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
    rules: {
      // General rules
      // Error-level rules
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-enum-comparison": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      curly: "error",
      "import/no-cycle": "error",
      "import/no-unresolved": "error",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
      "vue/block-lang": ["error", { script: { lang: "ts" } }],
      "vue/no-duplicate-attr-inheritance": "error",
      "vue/no-irregular-whitespace": "error",
      "vue/no-setup-props-reactivity-loss": "error",
      "vue/prefer-prop-type-boolean-first": "error",
      "vue/prefer-true-attribute-shorthand": "error",
      "vue/v-for-delimiter-style": "error",
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

      // Warning-level rules
      "@typescript-eslint/consistent-type-imports": ["warn", { disallowTypeAnnotations: false }],
      "@typescript-eslint/naming-convention": [
        "warn",
        { selector: "interface", format: ["PascalCase"], prefix: ["I"] },
        { selector: "typeAlias", format: ["PascalCase"], suffix: ["Type"] },
      ],
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "import/consistent-type-specifier-style": "warn",
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
      "sort-export-all/sort-export-all": "warn",
      "vue/block-order": ["warn", { order: ["template", "script[setup]", "style:not([scoped])", "style[scoped]"] }],
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
      "vue/no-useless-v-bind": "warn",
      "vue/padding-line-between-blocks": "warn",
      "vue/padding-lines-in-component-definition": "warn",
      "vue/prefer-define-options": "warn",
      "vue/require-emit-validator": "warn",
      "vuejs-accessibility/click-events-have-key-events": "warn",
      "vuejs-accessibility/no-static-element-interactions": "warn",

      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "sonarjs/array-callback-without-return": "warn",
      "sonarjs/deprecation": "warn",
      "sonarjs/different-types-comparison": "warn",
      "sonarjs/function-return-type": "warn",
      "sonarjs/no-ignored-exceptions": "warn",
      "sonarjs/no-nested-assignment": "warn",
      "sonarjs/no-os-command-from-path": "warn",
      "sonarjs/no-selector-parameter": "warn",
      "sonarjs/prefer-regexp-exec": "warn",
      "sonarjs/slow-regex": "warn",
      "sonarjs/todo-tag": "warn",
      "sonarjs/void-use": "warn",

      // Disabled rules
      "@typescript-eslint/no-non-null-assertion": "off",
      "sonarjs/no-duplicate-string": "off",
      "tailwindcss/no-custom-classname": "off",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vuejs-accessibility/form-control-has-label": "off",
      "vuejs-accessibility/label-has-for": "off",
    },
  },

  // Type-aware configuration for application files
  {
    files: ["client-app/**/*.ts", "client-app/**/*.vue"],
    ignores: ["client-app/**/*.test.ts", "client-app/**/*.spec.ts", "**/*.stories.ts"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: tsconfigs.app,
        tsconfigRootDir,
        extraFileExtensions: [".vue"],
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigs.app,
        },
      },
    },
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

  // Type-aware configuration for test files
  {
    files: ["client-app/**/*.test.ts", "client-app/**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        project: tsconfigs.vitest,
        tsconfigRootDir,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigs.vitest,
        },
      },
    },
    rules: {
      "sonarjs/assertions-in-tests": "off",
    },
  },

  // Configuration for Storybook files
  {
    files: [".storybook/preview.ts", "**/*.stories.ts"],
    languageOptions: {
      parserOptions: {
        project: tsconfigs.storybook,
        tsconfigRootDir,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigs.storybook,
        },
      },
    },
    rules: {
      "storybook/no-renderer-packages": "off",
    },
  },

  // Type-aware configuration for Node.js scripts and config files
  {
    files: ["*.config.js", "*.config.ts", "scripts/**/*.ts", ".storybook/main.ts"],
    languageOptions: {
      parserOptions: {
        project: tsconfigs.node,
        tsconfigRootDir,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigs.node,
        },
      },
    },
    rules: {
      "no-console": "off",
    },
  },

  // Type-aware configuration for examples files
  {
    files: ["examples/**/*.ts", "examples/**/*.vue"],
    languageOptions: {
      parserOptions: {
        project: tsconfigs.examples,
        tsconfigRootDir,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: tsconfigs.examples,
        },
      },
    },
  },

  // Specific overrides
  {
    files: ["**/*.vue"],
    rules: {
      "no-undef": "off",
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
    files: ["**/*.js", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Prettier must be last
  prettierPlugin,
);
