import { resolve } from "path";
import { loadConfigFromFile, mergeConfig, splitVendorChunkPlugin } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

const storybookConfig: StorybookConfig = {
  stories: ["../client-app/**/*.stories.ts"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  async viteFinal(storybookViteConfig, options) {
    const isDevelopment = options.configType === "DEVELOPMENT";
    const { config } = (await loadConfigFromFile(
      isDevelopment
        ? {
          command: "serve",
          mode: "development",
        }
        : {
          command: "build",
          mode: "production",
        },
      resolve(__dirname, "../vite.config.ts"),
    ))!;
    return mergeConfig(storybookViteConfig, {
      mode: "development",
      envPrefix: config.envPrefix,
      plugins: [splitVendorChunkPlugin()],
      resolve: config.resolve,
      define: config.define,
      build: {
        cssCodeSplit: false,
        reportCompressedSize: false,
      },
      optimizeDeps: config.optimizeDeps,
    });
  },
  docs: {
    autodocs: true,
  },
};
export default storybookConfig;
