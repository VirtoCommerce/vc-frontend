import { resolve } from "path";
import { loadConfigFromFile, mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

const storybookConfig: StorybookConfig = {
  stories: ["../client-app/**/*.stories.ts"],
  staticDirs: [{ from: "../storybook-styles/dist", to: "/assets" }],
  addons: ["@storybook/addon-links", "@storybook/addon-a11y", "@storybook/addon-docs", "@chromatic-com/storybook"],
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
      resolve: config.resolve,
      define: config.define,
      build: {
        cssCodeSplit: false,
        reportCompressedSize: false,
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes("node_modules")) {
                return "vendor";
              }
            },
          },
        },
      },
      optimizeDeps: config.optimizeDeps,
    });
  },
  docs: {},
};

export default storybookConfig;
