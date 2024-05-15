// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import path from "path";
import graphql from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/@rollup/plugin-graphql/dist/es/index.js";
import vue from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { visualizer } from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/vite/dist/node/index.js";
import { checker } from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/vite-plugin-checker/dist/esm/main.js";
import mkcert from "file:///C:/Users/maxim/Projects/vc-theme/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
var __vite_injected_original_dirname = "C:\\Users\\maxim\\Projects\\vc-theme";
var __vite_injected_original_import_meta_url = "file:///C:/Users/maxim/Projects/vc-theme/vite.config.ts";
function getProxy(target, options = {}) {
  const dontTrustSelfSignedCertificate = false;
  return {
    target,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options
  };
}
var vite_config_default = defineConfig(({ command, mode }) => {
  const isServe = command == "serve";
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_")
  };
  return {
    envPrefix: "APP_",
    base: isServe ? "/" : "/themes/assets/",
    publicDir: "./client-app/public",
    plugins: [
      isServe ? mkcert({
        force: true,
        savePath: path.resolve(__vite_injected_original_dirname, ".certificates"),
        keyFileName: "private.pem",
        certFileName: "public.pem"
      }) : void 0,
      vue(),
      graphql(),
      isServe ? checker({
        enableBuild: false,
        typescript: true,
        vueTsc: {
          tsconfigPath: path.resolve(__vite_injected_original_dirname, "tsconfig.app.json")
        },
        eslint: {
          lintCommand: "eslint client-app",
          dev: {
            overrideConfig: {
              cache: true,
              cacheLocation: "node_modules/.cache/.eslintcache",
              cwd: process.cwd(),
              extensions: ["js", "ts", "vue"],
              ignore: true,
              ignorePath: ".eslintignore",
              useEslintrc: true
            },
            logLevel: ["error"]
          }
        }
      }) : void 0,
      splitVendorChunkPlugin(),
      process.env.GENERATE_BUNDLE_MAP ? visualizer({
        filename: path.resolve(__vite_injected_original_dirname, "artifacts/bundle-map.html"),
        brotliSize: true,
        gzipSize: true,
        sourcemap: true
      }) : void 0
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./client-app", __vite_injected_original_import_meta_url))
      }
    },
    define: {
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false
    },
    build: {
      outDir: "assets",
      assetsDir: "./",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__vite_injected_original_dirname, "index.html")
        },
        output: {
          entryFileNames: "[name].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".svg")) {
              return "static/icons/flag-icons/[name].svg";
            }
            return "[name][extname]";
          },
          manualChunks: (id) => {
            if (id.includes("app-runner")) {
              return "app-runner";
            }
          }
        }
      }
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"]
    },
    server: {
      port: 3e3,
      proxy: {
        "^/api": getProxy(process.env.APP_BACKEND_URL),
        "^/(xapi|storefrontapi)": getProxy(process.env.APP_BACKEND_URL, { ws: true }),
        "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
        "^/cms-content": getProxy(process.env.APP_BACKEND_URL)
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtYXhpbVxcXFxQcm9qZWN0c1xcXFx2Yy10aGVtZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWF4aW1cXFxcUHJvamVjdHNcXFxcdmMtdGhlbWVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21heGltL1Byb2plY3RzL3ZjLXRoZW1lL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBncmFwaHFsIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1ncmFwaHFsXCI7XHJcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgeyBjaGVja2VyIH0gZnJvbSBcInZpdGUtcGx1Z2luLWNoZWNrZXJcIjtcclxuaW1wb3J0IG1rY2VydCBmcm9tIFwidml0ZS1wbHVnaW4tbWtjZXJ0XCI7XHJcbmltcG9ydCB0eXBlIHsgUHJveHlPcHRpb25zLCBVc2VyQ29uZmlnLCBQbHVnaW5PcHRpb24gfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuZnVuY3Rpb24gZ2V0UHJveHkodGFyZ2V0OiBQcm94eU9wdGlvbnNbXCJ0YXJnZXRcIl0sIG9wdGlvbnM6IE9taXQ8UHJveHlPcHRpb25zLCBcInRhcmdldFwiPiA9IHt9KTogUHJveHlPcHRpb25zIHtcclxuICBjb25zdCBkb250VHJ1c3RTZWxmU2lnbmVkQ2VydGlmaWNhdGUgPSBmYWxzZTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRhcmdldCxcclxuICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgIHNlY3VyZTogZG9udFRydXN0U2VsZlNpZ25lZENlcnRpZmljYXRlLFxyXG4gICAgLi4ub3B0aW9ucyxcclxuICB9O1xyXG59XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KTogVXNlckNvbmZpZyA9PiB7XHJcbiAgY29uc3QgaXNTZXJ2ZSA9IGNvbW1hbmQgPT0gXCJzZXJ2ZVwiO1xyXG5cclxuICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjYzODkwNDRcclxuICBwcm9jZXNzLmVudiA9IHtcclxuICAgIC4uLnByb2Nlc3MuZW52LFxyXG4gICAgLi4ubG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIkFQUF9cIiksXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGVudlByZWZpeDogXCJBUFBfXCIsXHJcbiAgICBiYXNlOiBpc1NlcnZlID8gXCIvXCIgOiBcIi90aGVtZXMvYXNzZXRzL1wiLFxyXG4gICAgcHVibGljRGlyOiBcIi4vY2xpZW50LWFwcC9wdWJsaWNcIixcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgaXNTZXJ2ZVxyXG4gICAgICAgID8gbWtjZXJ0KHtcclxuICAgICAgICAgICAgZm9yY2U6IHRydWUsXHJcbiAgICAgICAgICAgIHNhdmVQYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi5jZXJ0aWZpY2F0ZXNcIiksXHJcbiAgICAgICAgICAgIGtleUZpbGVOYW1lOiBcInByaXZhdGUucGVtXCIsXHJcbiAgICAgICAgICAgIGNlcnRGaWxlTmFtZTogXCJwdWJsaWMucGVtXCIsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgICB2dWUoKSxcclxuICAgICAgZ3JhcGhxbCgpIGFzIFBsdWdpbk9wdGlvbixcclxuICAgICAgaXNTZXJ2ZVxyXG4gICAgICAgID8gY2hlY2tlcih7XHJcbiAgICAgICAgICAgIGVuYWJsZUJ1aWxkOiBmYWxzZSxcclxuICAgICAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcclxuICAgICAgICAgICAgdnVlVHNjOiB7XHJcbiAgICAgICAgICAgICAgdHNjb25maWdQYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInRzY29uZmlnLmFwcC5qc29uXCIpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlc2xpbnQ6IHtcclxuICAgICAgICAgICAgICBsaW50Q29tbWFuZDogXCJlc2xpbnQgY2xpZW50LWFwcFwiLFxyXG4gICAgICAgICAgICAgIGRldjoge1xyXG4gICAgICAgICAgICAgICAgb3ZlcnJpZGVDb25maWc6IHtcclxuICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgIGNhY2hlTG9jYXRpb246IFwibm9kZV9tb2R1bGVzLy5jYWNoZS8uZXNsaW50Y2FjaGVcIixcclxuICAgICAgICAgICAgICAgICAgY3dkOiBwcm9jZXNzLmN3ZCgpLFxyXG4gICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBbXCJqc1wiLCBcInRzXCIsIFwidnVlXCJdLFxyXG4gICAgICAgICAgICAgICAgICBpZ25vcmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgIGlnbm9yZVBhdGg6IFwiLmVzbGludGlnbm9yZVwiLFxyXG4gICAgICAgICAgICAgICAgICB1c2VFc2xpbnRyYzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsb2dMZXZlbDogW1wiZXJyb3JcIl0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgOiB1bmRlZmluZWQsXHJcbiAgICAgIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4oKSxcclxuICAgICAgcHJvY2Vzcy5lbnYuR0VORVJBVEVfQlVORExFX01BUFxyXG4gICAgICAgID8gKHZpc3VhbGl6ZXIoe1xyXG4gICAgICAgICAgICBmaWxlbmFtZTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJhcnRpZmFjdHMvYnVuZGxlLW1hcC5odG1sXCIpLFxyXG4gICAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgICAgICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgICAgICAgfSkgYXMgUGx1Z2luT3B0aW9uKVxyXG4gICAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9jbGllbnQtYXBwXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAvLyBodHRwczovL3Z1ZS1pMThuLmludGxpZnkuZGV2L2d1aWRlL2FkdmFuY2VkL29wdGltaXphdGlvbi5odG1sI3JlZHVjZS1idW5kbGUtc2l6ZS13aXRoLWZlYXR1cmUtYnVpbGQtZmxhZ3NcclxuICAgICAgX19WVUVfSTE4Tl9GVUxMX0lOU1RBTExfXzogdHJ1ZSxcclxuICAgICAgX19WVUVfSTE4Tl9MRUdBQ1lfQVBJX186IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG91dERpcjogXCJhc3NldHNcIixcclxuICAgICAgYXNzZXRzRGlyOiBcIi4vXCIsXHJcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBpbnB1dDoge1xyXG4gICAgICAgICAgbWFpbjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5odG1sXCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJbbmFtZV0uanNcIixcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgY29kZSB3aWxsIG1vdmUgZmxhZy1pY29ucyBzdmcgZmlsZXMgdG8gc2VwYXJhdGUgZGlyZWN0b3J5IGR1cmluZyBidWlsZC5cclxuICAgICAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5lbmRzV2l0aChcIi5zdmdcIikpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gXCJzdGF0aWMvaWNvbnMvZmxhZy1pY29ucy9bbmFtZV0uc3ZnXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFwiW25hbWVdW2V4dG5hbWVdXCI7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcclxuICAgICAgICAgICAgLy8gRm9yY2UgYXBwLXJ1bm5lciB0byBoYXZlIHNlcGFyYXRlIGNodW5rIHRvIHRlbXBvcmFyZWx5IGVsaW1pbmF0ZSBjYXZlYXRzIG9mIGxpcXVpZC1iYXNlZCBoYXNoaW5nXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcImFwcC1ydW5uZXJcIikpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gXCJhcHAtcnVubmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgZXhjbHVkZTogW1wic3dpcGVyL3Z1ZVwiLCBcInN3aXBlci90eXBlc1wiXSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICBcIl4vYXBpXCI6IGdldFByb3h5KHByb2Nlc3MuZW52LkFQUF9CQUNLRU5EX1VSTCksXHJcbiAgICAgICAgXCJeLyh4YXBpfHN0b3JlZnJvbnRhcGkpXCI6IGdldFByb3h5KHByb2Nlc3MuZW52LkFQUF9CQUNLRU5EX1VSTCwgeyB3czogdHJ1ZSB9KSxcclxuICAgICAgICBcIl4vKGNvbm5lY3R8cmV2b2tlKS90b2tlblwiOiBnZXRQcm94eShwcm9jZXNzLmVudi5BUFBfQkFDS0VORF9VUkwpLFxyXG4gICAgICAgIFwiXi9jbXMtY29udGVudFwiOiBnZXRQcm94eShwcm9jZXNzLmVudi5BUFBfQkFDS0VORF9VUkwpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UixTQUFTLGVBQWUsV0FBVztBQUMvVCxPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sU0FBUztBQUNoQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGNBQWMsU0FBUyw4QkFBOEI7QUFDOUQsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sWUFBWTtBQVBuQixJQUFNLG1DQUFtQztBQUF3SSxJQUFNLDJDQUEyQztBQVVsTyxTQUFTLFNBQVMsUUFBZ0MsVUFBd0MsQ0FBQyxHQUFpQjtBQUMxRyxRQUFNLGlDQUFpQztBQUV2QyxTQUFPO0FBQUEsSUFDTDtBQUFBLElBQ0EsY0FBYztBQUFBLElBQ2QsUUFBUTtBQUFBLElBQ1IsR0FBRztBQUFBLEVBQ0w7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQWtCO0FBQzdELFFBQU0sVUFBVSxXQUFXO0FBRzNCLFVBQVEsTUFBTTtBQUFBLElBQ1osR0FBRyxRQUFRO0FBQUEs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
