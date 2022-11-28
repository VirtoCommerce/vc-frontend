import path from "path";
import { defineConfig, loadEnv, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import graphql from "@rollup/plugin-graphql";
import checker from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";

const getProxy = (target, options = {}) => {
  const dontTrustSelfSignedCertificate = false;
  return {
    target,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
};

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
      mkcert({ hosts: ["localhost", "127.0.0.1"] }),
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
    define: {
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
    },
    build: {
      outDir: "assets",
      assetsDir: "./",
      emptyOutDir: true,
      sourcemap: "hidden",
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
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"],
    },
    publicDir: "./client-app/public",
    server: {
      port: 3000,
      https: true,
      proxy: {
        "^/(xapi|storefrontapi)": getProxy(`${process.env.APP_BACKEND_URL}`),
        // For login on behalf
        "^/account/impersonate/.+": getProxy(`${process.env.APP_BACKEND_URL}`, {
          autoRewrite: true,
        }),
      },
    },
  };
});
