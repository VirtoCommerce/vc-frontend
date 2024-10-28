import { resolve } from "path";
import { loadConfigFromFile, mergeConfig, splitVendorChunkPlugin } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

const storybookConfig: StorybookConfig = {
  stories: ["../client-app/**/*.stories.ts"],
  staticDirs: [{ from: "../storybook-styles/dist", to: "/assets" }],
  addons: [
    "@storybook/addon-viewport",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-actions",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "storybook-i18n",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  async viteFinal(storybookViteConfig, options) {
    const isDevelopment = options.configType === "DEVELOPMENT";
    const { config: viteConfig } = (await loadConfigFromFile(
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
      envPrefix: viteConfig.envPrefix,
      plugins: [splitVendorChunkPlugin()],
      resolve: viteConfig.resolve,
      define: viteConfig.define,
      build: {
        cssCodeSplit: false,
        reportCompressedSize: false,
      },
      optimizeDeps: viteConfig.optimizeDeps,
    });
  },
  docs: {
    autodocs: true,
  },
};
export default storybookConfig;
