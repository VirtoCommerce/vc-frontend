import { setup } from "@storybook/vue3";
import { vueRouter } from "storybook-vue3-router";
import { useLanguages } from "../client-app/core/composables/useLanguages";
import { setGlobals } from "../client-app/core/globals";
import { createI18n } from "../client-app/i18n";
import { uiKit } from "../client-app/ui-kit";
import type { IThemeConfig, IThemeConfigPreset } from "../client-app/core/types";
import type { I18n } from "../client-app/i18n";
import type { Preview } from "@storybook/vue3";
import settingsData from "../client-app/config/settings_data.json";

import "../storybook-styles/swiper.scss";
import "../storybook-styles/utilities.scss";
import { useFetch } from "../client-app/core/api/common";
const i18n: I18n = createI18n("en", "USD");

setGlobals({ i18n });

async function configureThemeSettings() {
  const themeConfig = settingsData as IThemeConfig;

  let preset;

  if (typeof themeConfig.current === "string") {
    const presetFileName = themeConfig.current.toLowerCase().replace(" ", "-");
    const { data: data_ } = await useFetch(`/config/presets/${presetFileName}.json`).get().json<IThemeConfigPreset>();
    preset = data_.value;
  } else {
    preset = themeConfig.current;
  }

  const styleElement = document.createElement("style");
  styleElement.innerText = ":root {";
  Object.entries(preset).forEach(([key, value]) => {
    styleElement.innerText += `--${key.replace(/_/g, "-")}: ${value};`;
  });
  styleElement.innerText += "}";
  document.head.prepend(styleElement);
}

async function configureI18N() {
  const { initLocale } = useLanguages();

  await initLocale(i18n, "en");
}

setup((app) => {
  configureThemeSettings();

  configureI18N();
  app.use(i18n);

  app.use(uiKit);
});

const preview: Preview = {
  decorators: [vueRouter()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    options: {
      storySort: {
        order: ["*", "Components", ["Atoms", "Molecules", "Organisms", "Templates", "Pages"]],
      },
    },
  },
};

export default preview;
