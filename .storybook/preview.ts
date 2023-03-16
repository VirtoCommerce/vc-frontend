/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from "@storybook/vue3";
import vueRouter from "storybook-vue3-router";
import { createI18n } from "vue-i18n";
import * as UIKitComponents from "../client-app/ui-kit/components";
import SettingsData from "../config/settings_data.json";
import en from "../locales/en.json";

/* Project Styles */
import "../client-app/assets/styles/main.scss";

const i18n = createI18n({
  locale: "en",
  messages: {
    en,
  },
});

app.use(i18n);

/* Setting project CSS variables */
const settings =
  typeof SettingsData.current === "string"
    ? (<Record<string, any>>SettingsData).presets[SettingsData.current]
    : SettingsData.current;

Object.entries(settings)
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

export const decorators = [vueRouter()];
