import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

// TODO: https://virtocommerce.atlassian.net/browse/VCST-235
export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      define: {
        location: {},
        WebSocket: {},
      },
    }),
  ),
);
