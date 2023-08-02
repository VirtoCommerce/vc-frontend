import { setup } from "@storybook/vue3";
import { vOnClickOutside } from "@vueuse/components";
import { maska } from "maska";
import { vueRouter } from "storybook-vue3-router";
import { setLocale as setLocaleForYup } from "yup";
import { useLanguages } from "../client-app/core/composables";
import { setGlobals } from "../client-app/core/globals";
import { configPlugin } from "../client-app/core/plugins";
import { createI18n } from "../client-app/i18n";
import * as UIKitComponents from "../client-app/ui-kit/components";
import type { IThemeConfig } from "../client-app/core/types";
import type { I18n } from "../client-app/i18n";
import type { Preview } from "@storybook/vue3";
import "../client-app/assets/styles/main.scss";

const i18n: I18n = createI18n("en", "USD");

setGlobals({ i18n });

setup(async (app) => {
  const settings: IThemeConfig = await import("../config/settings_data.json");
  const themeSettings = settings.presets[settings.current as string];

  const { setLocale } = useLanguages();

  await setLocale(i18n, "en");

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  app.use(i18n);

  app.use(configPlugin, themeSettings);

  // Directives
  app.directive("mask", maska);
  app.directive("onClickOutside", vOnClickOutside);

  // Components
  // Register UI Kit components globally
  Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));
});

const preview: Preview = {
  decorators: [vueRouter()],
  parameters: {
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
  },
};

export default preview;
