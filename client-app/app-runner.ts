import { createHead } from "@unhead/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { apolloClient, getStore } from "@/core/api/graphql";
import { useCurrency, useThemeContext, useGoogleAnalytics, useWhiteLabeling, useNavigations } from "@/core/composables";
import { useHotjar } from "@/core/composables/useHotjar";
import { useLanguages } from "@/core/composables/useLanguages";
import { IS_DEVELOPMENT } from "@/core/constants";
import { setGlobals } from "@/core/globals";
import { authPlugin, configPlugin, contextPlugin, permissionsPlugin } from "@/core/plugins";
import { extractHostname, getBaseUrl, Logger } from "@/core/utilities";
import { createI18n } from "@/i18n";
import { createRouter } from "@/router";
import { useUser } from "@/shared/account";
import ProductBlocks from "@/shared/catalog/components/product";
import { useWebPushNotifications } from "@/shared/push-messages/composables/useWebPushNotifications";
import { templateBlocks } from "@/shared/static-content";
import { uiKit } from "@/ui-kit";
import App from "./App.vue";
import type { StoreResponseType } from "./core/api/graphql/types";
// eslint-disable-next-line no-restricted-exports
export default async () => {
  const appSelector = "#app";
  const appElement = document.querySelector<HTMLElement | SVGElement>(appSelector);

  if (!appElement) {
    return Logger.debug(`The element with the selector "${appSelector}" was not found.`);
  }

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

  app.use(authPlugin);

  const { fetchUser, user } = useUser();
  const { themeContext, fetchThemeContext } = useThemeContext();
  const { currentLocale, currentLanguage, supportedLocales, setLocale, fetchLocaleMessages } = useLanguages();
  const { currentCurrency } = useCurrency();
  const { init: initializeGoogleAnalytics } = useGoogleAnalytics();
  const { init: initializeHotjar } = useHotjar();
  const { init: initializeWebPushNotifications } = useWebPushNotifications();
  const { fetchMenus } = useNavigations();
  const { themePresetName, fetchWhiteLabelingSettings } = useWhiteLabeling();

  const fallback = {
    locale: "en",
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  const store = (await getStore(
    IS_DEVELOPMENT ? extractHostname(import.meta.env.APP_BACKEND_URL as string) : window.location.hostname,
  )) as StoreResponseType;

  if (!store) {
    throw new Error("Can't get store");
  }

  await Promise.all([fetchThemeContext(store), fetchUser(), fallback.setMessage()]);

  initializeGoogleAnalytics();
  void initializeHotjar();

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
    organizationId: user.value?.contact?.organizationId,
    cultureName: currentLanguage.value.cultureName,
    currencyCode: currentCurrency.value.code,
  });

  await fetchMenus();

  /**
   * Other settings
   */
  await setLocale(i18n, currentLocale.value);

  await fetchWhiteLabelingSettings();
  void initializeWebPushNotifications(); // need to be called after white labeling settings are fetched

  if (themePresetName.value) {
    await fetchThemeContext(store, themePresetName.value);
  }

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value.settings);
  app.use(uiKit);

  const referrer = document.referrer?.replace(/\/$/, "");
  const ep = document.location.search
    ?.substring(1)
    .split("?")
    .map((x) => x.split("="))
    .find((x) => x[0] === "ep")?.[1]
    ?.replace(/\/$/, "");

  if (referrer && ep && referrer === ep) {
    const builderPreviewPlugin = (await import("@/builder-preview/builder-preview.plugin").catch(Logger.error))
      ?.default;
    if (builderPreviewPlugin) {
      app.use(builderPreviewPlugin, { router, builderOrigin: ep });
    }
  }

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.mount(appElement);
};
