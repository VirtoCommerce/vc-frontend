const path = require("path");

// Same pipeline as the host, but Tailwind is pinned to THIS plugin's config so it
// scans the plugin's own sources (not the host's) and its `@apply`/utility classes
// are generated. Without this, the plugin's `<style>` `@apply` rules are dropped
// and federated styling breaks (VCST-5159).
module.exports = {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    tailwindcss: { config: path.resolve(__dirname, "tailwind.config.cjs") },
    autoprefixer: {},
  },
};
