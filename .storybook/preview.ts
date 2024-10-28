import { setup } from "@storybook/vue3";
import { vueRouter } from "storybook-vue3-router";
import { useLanguages } from "@/core/composables/useLanguages";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { configPlugin, contextPlugin } from "@/core/plugins";
import { createI18n } from "@/i18n";
import { uiKit } from "@/ui-kit";
import { defaultCurrency, defaultLanguage, store } from "./mocks";
import type { Preview } from "@storybook/vue3";
import "../storybook-styles/swiper.scss";
import "../storybook-styles/utilities.scss";

setup(async (app, storyContext) => {
  const { themeContext, fetchThemeContext } = useThemeContext();
  const { fallback, initLocale } = useLanguages();

  await Promise.all([fetchThemeContext(store), fallback.setMessage()]);

  const twoLetterLanguageName = storyContext?.globals.locale as string;
  const i18n = createI18n(twoLetterLanguageName, defaultCurrency.code, fallback);
  await initLocale(i18n, twoLetterLanguageName);

  app.use(i18n);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value);

  app.use(uiKit);
});

const preview: Preview = {
  decorators: [vueRouter()],
  initialGlobals: {
    locale: defaultLanguage.twoLetterLanguageName,
    locales: store.availableLanguages.reduce<Record<string, string>>((locales, availableLanguage) => {
      locales[availableLanguage.twoLetterLanguageName] = availableLanguage.nativeName;
      return locales;
    }, {}),
  },
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

// eslint-disable-next-line no-restricted-exports
export default preview;
