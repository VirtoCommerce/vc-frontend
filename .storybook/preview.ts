import { setup } from "@storybook/vue3";
import { vueRouter } from "storybook-vue3-router";
import { useLanguages } from "../client-app/core/composables";
import { setGlobals } from "../client-app/core/globals";
import { configPlugin } from "../client-app/core/plugins";
import { createI18n } from "../client-app/i18n";
import { uiKit } from "../client-app/ui-kit";
import type { IThemeConfig } from "../client-app/core/types";
import type { I18n } from "../client-app/i18n";
import type { Preview } from "@storybook/vue3";
import type { App } from "vue";
import "../client-app/assets/styles/main.scss";

const i18n: I18n = createI18n("en", "USD");

setGlobals({ i18n });

async function configureThemeSettings(app: App) {
  const settings: IThemeConfig = await import("../config/settings_data.json");
  const themeSettings = settings.presets[settings.current as string];

  app.use(configPlugin, themeSettings);
}

async function configureI18N() {
  const { setLocale } = useLanguages();

  await setLocale(i18n, "en");
}

setup((app) => {
  configureThemeSettings(app);

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
