import { resolve } from "path";
import graphql from "@rollup/plugin-graphql";
import { loadConfigFromFile, mergeConfig, splitVendorChunkPlugin } from "vite";
import type { StorybookViteConfig } from "@storybook/builder-vite";
import type { PropItem } from "react-docgen-typescript";

const storybookConfig: StorybookViteConfig = {
  stories: ["../client-app/**/*.stories.@(ts|tsx|mdx)"],
  staticDirs: ["../client-app/public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
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
    disableTelemetry: true,
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
