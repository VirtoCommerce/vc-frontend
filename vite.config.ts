import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
