import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import graphqlPlugin from "@rollup/plugin-graphql";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), graphqlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client-app"),
      "@core": path.resolve(__dirname, "./client-app/core"),
    },
  },
  build: {
    outDir: "assets/static/bundle",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "client-app/main.ts"),
      name: "theme",
      fileName: (format) => `theme.${format}.js`,
    },
  },
});
