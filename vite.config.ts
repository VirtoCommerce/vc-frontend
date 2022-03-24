import { defineConfig, loadEnv } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import graphqlPlugin from "@rollup/plugin-graphql";
import pluginI18n from "@intlify/vite-plugin-vue-i18n";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return {
    envPrefix: "APP_",
    plugins: [
      vue(),
      graphqlPlugin(),
      pluginI18n({
        globalSFCScope: false,
        include: path.resolve(__dirname, "./locales/**"),
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client-app"),
        "@core": path.resolve(__dirname, "./client-app/core"),
      },
    },
    base: mode === "production" ? "/themes/assets/" : "/",
    build: {
      outDir: "assets",
      assetsDir: "./",
      emptyOutDir: true,
      rollupOptions: {
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
      proxy: {
        "/storefrontapi": `${process.env.APP_BACKEND_URL}`,
        "/xapi": `${process.env.APP_BACKEND_URL}`,
      },
    },
  };
});
