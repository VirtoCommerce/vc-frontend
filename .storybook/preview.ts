import { setup } from "@storybook/vue3-vite";
import { vueRouter } from "storybook-vue3-router";
import { setGlobals } from "../client-app/core/globals";
import { createI18n } from "../client-app/i18n";
import { uiKit } from "../client-app/ui-kit";
import UI_KIT_DEFAULT_MESSAGE from "../client-app/ui-kit/locales/en.json";
import type { IThemeConfigPreset } from "../client-app/core/types";
import type { I18n } from "../client-app/i18n";
import type { Preview } from "@storybook/vue3-vite";

import "../storybook-styles/swiper.scss";
import "../storybook-styles/utilities.scss";

const DEFAULT_LOCALE = "en";
const DEFAULT_CURRENCY = "USD";

const i18n: I18n = createI18n(DEFAULT_LOCALE, DEFAULT_CURRENCY);

async function configureThemeSettings() {
  const module = (await import(`@/assets/presets/default.json`)) as {
    default: IThemeConfigPreset;
  };
  const preset = module.default;

  if (preset) {
    const styleElement = document.createElement("style");
    styleElement.innerText = ":root {";
    Object.entries(preset).forEach(([key, value]) => {
      styleElement.innerText += `--${key.replace(/_/g, "-")}: ${value};`;
    });
    styleElement.innerText += "}";
    document.head.prepend(styleElement);
  }
}

function configureI18N() {
  i18n.global.setLocaleMessage(DEFAULT_LOCALE, UI_KIT_DEFAULT_MESSAGE);
}

setGlobals({ i18n });
configureI18N();

configureThemeSettings().catch(() => {
  // eslint-disable-next-line no-console
  console.error("Storybook theme setup error:");
});

setup((app) => {
  if (!app || typeof app.use !== "function") {
    return;
  }

  try {
    app.use(i18n);
    app.use(uiKit);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Storybook Vue setup error:", error);
  }
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

  tags: ["autodocs"],
};

export default preview;
