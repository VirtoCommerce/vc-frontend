import { fileURLToPath } from "node:url";
import path from "path";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        environment: "jsdom",
        exclude: [...configDefaults.exclude, "client-app/e2e/*"],
        root: fileURLToPath(new URL("./", import.meta.url)),
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          exclude: [
            "node_modules/",
            "client-app/e2e/*",
            "**/*.d.ts",
            "**/*.test.ts",
            "**/*.spec.ts",
            "**/types.ts",
            "**/index.ts",
          ],
          include: ["client-app/**/*.ts", "client-app/**/*.vue"],
        },
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "client-app"),
        },
      },
    }),
  ),
);
