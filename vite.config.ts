import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";
import graphqlPlugin from "@rollup/plugin-graphql";

// https://vitejs.dev/config/
export default async ({ mode }: ConfigEnv): Promise<UserConfigExport> => {
  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return defineConfig({
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
      rollupOptions: {
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
  });
};
