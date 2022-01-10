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
    assetsDir: "./",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  server: {
    proxy: {
      "/storefrontapi": "https://st-storefront.dev.govirto.com",
      "/xapi": "https://st-storefront.dev.govirto.com",
    },
  },
});
