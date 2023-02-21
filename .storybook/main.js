module.exports = {
  stories: [
    {
      directory: "../client-app/ui-kit/components/atoms/**",
      titlePrefix: "UI-kit/Atoms",
      files: "*.stories.ts",
    },
    {
      directory: "../client-app/ui-kit/components/molecules/**",
      titlePrefix: "UI-kit/Molecules",
      files: "*.stories.ts",
    },
    {
      directory: "../client-app/ui-kit/components/organisms/**",
      titlePrefix: "UI-kit/Organisms",
      files: "*.stories.ts",
    },
  ],
  staticDirs: ["../client-app/public"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: "@storybook/vue3",
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    storyStoreV7: true,
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};
