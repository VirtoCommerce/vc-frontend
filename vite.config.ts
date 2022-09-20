import { defineConfig, loadEnv, UserConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import graphql from "@rollup/plugin-graphql";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return {
    envPrefix: "APP_",
    plugins: [
      vue(),
      graphql(),
      checker({
        vueTsc: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client-app"),
      },
    },
    base: mode === "production" ? "/themes/assets/" : "/",
    build: {
      outDir: "assets",
      assetsDir: "./",
      emptyOutDir: true,
      watch: mode === "development" ? {} : null,
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "index.html"),
          builder: path.resolve(__dirname, "builder-preview.html"),
        },
        output: {
          entryFileNames: "[name].js",
          assetFileNames: "[name][extname]",
        },
      },
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"],
    },
    publicDir: "./client-app/public",
    server: {
      port: 3000,
      proxy: {
        "/storefrontapi": `${process.env.APP_BACKEND_URL}`,
        "/xapi": `${process.env.APP_BACKEND_URL}`,
      },
    },
  };
});
