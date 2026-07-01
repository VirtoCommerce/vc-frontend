const path = require("path");
const baseConfig = require("../../tailwind.config");

// Inherit the host's design system (colors, spacing, typography, breakpoints via
// CSS custom properties) so the plugin's utilities match the host 1:1, but scan
// ONLY the plugin's own sources. This is the "shared Tailwind preset for plugins"
// pattern — an external plugin would import the preset from `@vc-frontend/core`.
module.exports = {
  ...baseConfig,
  content: [path.resolve(__dirname, "index.html"), path.resolve(__dirname, "src/**/*.{vue,js,ts}")],
};
