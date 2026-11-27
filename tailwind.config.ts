import { uiKitPreset } from "./client-app/ui-kit/tailwind-preset.js";
import type { Config } from "tailwindcss";

module.exports = {
  // tw-elements' plugin brings its own `theme.screens`, colours and shadows, and a plugin's theme beats
  // the presets of the config that lists it. Listed in a preset before the kit's, it loses to the kit.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- tw-elements ships no types for its plugin
  presets: [{ plugins: [require("tw-elements/dist/plugin.cjs")] }, uiKitPreset],

  content: [
    "./index.html",
    "./client-app/**/*.{vue,js,ts,jsx,tsx}",
    // Generated GraphQL types (1+ MiB, 25k-char lines) trigger catastrophic backtracking in the
    // Tailwind class extractor regex, adding tens of seconds to every cold dev start and build.
    // Codegen output cannot contain real class names.
    "!./client-app/**/api/graphql/**/types.ts",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],

  safelist: ["lg:inline"],

  // Only `extend`: a key set directly under `theme` replaces the preset's whole scale. A design-system
  // scale goes into the ui-kit preset (`client-app/ui-kit/tailwind-preset.ts`).
  theme: {
    extend: {
      maxHeight: {
        "screen-60": "60vh",
        "screen-75": "75vh",
      },
    },
  },
} satisfies Config;
