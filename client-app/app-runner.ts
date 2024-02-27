import { createHead } from "@unhead/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { apolloClient } from "@/core/api/graphql/client";
import { useCurrency } from "@/core/composables/useCurrency";
import { useLanguages } from "@/core/composables/useLanguages";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { setGlobals } from "@/core/globals";
import { configPlugin, contextPlugin, permissionsPlugin } from "@/core/plugins";
import { getBaseUrl, Logger } from "@/core/utilities";
import { createI18n } from "@/i18n";
import { createRouter } from "@/router";
import { useUser } from "@/shared/account/composables/useUser";
import ProductBlocks from "@/shared/catalog/components/product";
import { templateBlocks } from "@/shared/static-content";
import { uiKit } from "@/ui-kit";
import App from "./App.vue";

// eslint-disable-next-line no-restricted-exports
export default async () => {
  const appSelector = "#app";
  const appElement = document.querySelector<HTMLElement | SVGElement>(appSelector);

  if (!appElement) {
    return Logger.debug(`The element with the selector "${appSelector}" was not found.`);
  }

  const { fetchUser, user } = useUser();
  const { themeContext, fetchThemeContext } = useThemeContext();
  const { currentLocale, currentLanguage, supportedLocales, setLocale, fetchLocaleMessages } = useLanguages();
  const { currentCurrency } = useCurrency();

  const fallback = {
    locale: "en",
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  /**
   * Fetching required app data
   */
  await Promise.all([fetchThemeContext(), fetchUser(), fallback.setMessage()]);

  /**
   * Creating plugin instances
   */
  const head = createHead();
  const i18n = createI18n(currentLanguage.value.twoLetterLanguageName, currentCurrency.value.code, fallback);
  const router = createRouter({ base: getBaseUrl(supportedLocales.value) });

  /**
   * Setting global variables
   */
  setGlobals({
    i18n,
    router,
    storeId: themeContext.value.storeId,
    catalogId: themeContext.value.catalogId,
    userId: user.value.id,
    cultureName: currentLanguage.value.cultureName,
    currencyCode: currentCurrency.value.code,
  });

  /**
   * Other settings
   */
  await setLocale(i18n, currentLocale.value);

  /**
   * Create and mount application
   */
  const app = createApp(
    {
      setup() {
        provide(DefaultApolloClient, apolloClient);
      },
      render: () => h(App),
    },
    {
      /**
       * Passing data-* attributes to the application props
       */
      ...appElement.dataset,
    },
  );

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value!.settings);
  app.use(uiKit);

  if (window?.frameElement?.getAttribute("data-view-mode") === "page-builder") {
    const builderPreviewPlugin = (await import("@/builder-preview/builder-preview.plugin").catch(Logger.error))
      ?.default;
    if (builderPreviewPlugin) {
      app.use(builderPreviewPlugin, { router });
    }
  }

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.mount(appElement);
};
