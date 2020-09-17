module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: [ "vue", "import", "@typescript-eslint", "editorconfig" ],
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "@vue/typescript/recommended",
    "plugin:editorconfig/noconflict"
  ],
  rules: {
    "editorconfig/editorconfig": "error",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "vue/max-attributes-per-line": ["error", {
      "singleline": 2,
      "multiline": {
        "max": 1,
        "allowFirstLine": true
      }
    }],
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "never"
    }],
    "vue/html-self-closing": ["error", {
      "html": {
        "void": "never",
        "normal": "never",
        "component": "never"
      },
      "svg": "never",
      "math": "never"
    }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "unknown", "parent", "sibling", "index"],
      "pathGroups": [
        {
          "pattern": "vue*",
          "group": "external",
          "position": "before"
        },
        {
          "pattern": "{i18n,@core/**,@components/**,@init-app/**,@account/**,@catalog/**}",
          "group": "unknown",
          "position": "after"
        }
      ],
      "pathGroupsExcludedImportTypes": [],
      "newlines-between": "never",
      "alphabetize": {
        "order": "asc"
      }
    }],
    "no-prototype-builtins": "off",
    "comma-dangle": ["error", "never"],
    "quote-props": ["error", "as-needed", { "keywords": true, "unnecessary": true }]
  },
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        mocha: true
      }
    }
  ],
  settings: {
    "import/parsers": {
      "vue-eslint-parser": [".vue"]
    },
    "import/resolver": {
      typescript: {},
      node: {}
    }
  }
};
