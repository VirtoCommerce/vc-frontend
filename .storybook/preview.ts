import { app } from "@storybook/vue3";
import * as UIKitComponents from "../client-app/ui-kit/components";
import SettingsData from "../config/settings_data.json";

/* Project Styles */
import "../client-app/assets/styles/main.scss";

/* Setting project CSS variables */
Object.entries(SettingsData.presets.Mercury)
  .filter(([key]) => /^color/.test(key))
  .forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, `${value}`);
  });

// Register UI Kit components
Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
  },
  options: {
    storySort: {
      order: ["*", "Components", ["Atoms", "Molecules", "Organisms", "Templates", "Pages"]],
    },
  },
  previewTabs: { "storybook/docs/panel": { index: -1 } },
  viewMode: "docs",
};
