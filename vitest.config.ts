import { fileURLToPath } from "node:url";
import path from "path";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config.js";

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        environment: "jsdom",
        exclude: [...configDefaults.exclude, "client-app/e2e/*"],
        root: fileURLToPath(new URL("./", import.meta.url)),
        // Without an explicit tsconfig, vitest spawns `tsc --noEmit` from the repo root with no
        // `-p`, so it inherits the root tsconfig — `{"files": []}` with project references, which
        // --noEmit does not follow. Zero files were checked and every .test-d.ts reported green
        // regardless of content. The Build step's `vue-tsc --build` caught them; the step named
        // after typing did not.
        typecheck: { tsconfig: "./tsconfig.typecheck.json" },
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
