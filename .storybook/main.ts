import { resolve } from "path";
import { loadConfigFromFile, mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

function getVendorChunk(id: string): string | undefined {
  if (id.includes("node_modules")) {
    return "vendor";
  }
}

const storybookConfig: StorybookConfig = {
  stories: ["../client-app/**/*.stories.ts"],
  staticDirs: [{ from: "../storybook-styles/dist", to: "/assets" }],
  addons: ["@storybook/addon-links", "@storybook/addon-a11y", "@storybook/addon-docs", "storybook-addon-tag-badges"],
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
    // An MF host gets no `vendor` chunk, as in vite.config.ts. See
    // https://github.com/module-federation/vite#%EF%B8%8F-codesplitting-is-managed-by-the-plugin
    const isFederatedHost = config.define?.__MF_HOST__ === "true";
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
            manualChunks: isFederatedHost ? undefined : getVendorChunk,
          },
        },
      },
      optimizeDeps: config.optimizeDeps,
    });
  },
  docs: {},
};

export default storybookConfig;
