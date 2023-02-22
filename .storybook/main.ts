import { resolve } from "path";
import graphql from "@rollup/plugin-graphql";
import type { StorybookViteConfig } from "@storybook/builder-vite";
import type { PropItem } from "react-docgen-typescript";
import { loadConfigFromFile, mergeConfig, splitVendorChunkPlugin } from "vite";

const storybookConfig: StorybookViteConfig = {
  stories: ["../client-app/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../client-app/public"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions", "@storybook/addon-links"],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop: PropItem) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  framework: "@storybook/vue3",
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    // storyStoreV7: true, // NOTE: When enabled, `viewMode: "docs"` does not work.
  },
  async viteFinal(storybookViteConfig, options) {
    const isDevelopment = options.configType === "DEVELOPMENT";
    const { config } = (await loadConfigFromFile(
      isDevelopment ? { command: "serve", mode: "development" } : { command: "build", mode: "production" },
      resolve(__dirname, "../vite.config.ts")
    ))!;

    return mergeConfig(storybookViteConfig, {
      plugins: [graphql(), splitVendorChunkPlugin()],
      build: {
        cssCodeSplit: false,
        reportCompressedSize: false,
        rollupOptions: {
          external: [/\/static\/.*/],
        },
      },
      envPrefix: config.envPrefix,
      resolve: config.resolve,
      define: config.define,
      optimizeDeps: config.optimizeDeps,
    });
  },
};

export default storybookConfig;
