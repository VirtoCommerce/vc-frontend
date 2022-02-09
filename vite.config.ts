import { defineConfig, loadEnv } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import graphqlPlugin from "@rollup/plugin-graphql";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return {
    envPrefix: "APP_",
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
    server: {
      proxy: {
        "/storefrontapi": `${process.env.APP_BACKEND_URL}`,
        "/xapi": `${process.env.APP_BACKEND_URL}`,
      },
    },
  };
});
