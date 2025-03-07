import { createHead } from "@unhead/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { getEpParam, isPreviewMode as isPageBuilderPreviewMode } from "@/builder-preview/utils";
import { apolloClient, getStore } from "@/core/api/graphql";
import { useCurrency, useThemeContext, useWhiteLabeling, useNavigations } from "@/core/composables";
import { useHotjar } from "@/core/composables/useHotjar";
import { useLanguages } from "@/core/composables/useLanguages";
import { FALLBACK_LOCALE, IS_DEVELOPMENT } from "@/core/constants";
import { setGlobals } from "@/core/globals";
import { applicationInsightsPlugin, authPlugin, configPlugin, contextPlugin, permissionsPlugin } from "@/core/plugins";
import { extractHostname, getBaseUrl, Logger } from "@/core/utilities";
import { createI18n } from "@/i18n";
import { init as initModuleBackInStock } from "@/modules/back-in-stock";
import { init as initCustomerReviews } from "@/modules/customer-reviews";
import { init as initializeGoogleAnalytics } from "@/modules/google-analytics";
import { initialize as initializePurchaseRequests } from "@/modules/purchase-requests";
import { init as initPushNotifications } from "@/modules/push-messages";
import { init as initModuleQuotes } from "@/modules/quotes";
import { builderIoConsoleWarnings } from "@/pages/matcher/builderIo/consoleWarnings";
import { createRouter } from "@/router";
import { useUser } from "@/shared/account";
import ProductBlocks from "@/shared/catalog/components/product";
import { templateBlocks } from "@/shared/static-content";
import { uiKit } from "@/ui-kit";
import { getLocales as getUIKitLocales } from "@/ui-kit/utilities/getLocales";
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

  const { fetchUser, user, twoLetterContactLocale } = useUser();
  const { themeContext, addPresetToThemeContext, setThemeContext } = useThemeContext();
  const {
    detectLocale,
    currentLanguage,
    supportedLocales,
    initLocale,
    fetchLocaleMessages,
    getLocaleFromUrl,
    pinedLocale,
    mergeLocales,
  } = useLanguages();
  const { currentCurrency } = useCurrency();
  const { init: initializeHotjar } = useHotjar();
  const { fetchMenus } = useNavigations();
  const { themePresetName, fetchWhiteLabelingSettings } = useWhiteLabeling();

  const fallback = {
    locale: FALLBACK_LOCALE,
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  const storePromise = getStore(
    IS_DEVELOPMENT ? extractHostname(import.meta.env.APP_BACKEND_URL as string) : window.location.hostname,
  ) as Promise<StoreResponseType>;

  const [store] = await Promise.all([storePromise, fetchUser(), fallback.setMessage()]);

  if (!store) {
    alert("Related store not found. Please contact your site administrator.");
    throw new Error("Store not found. Check graphql request, GetStore query");
  }

  setThemeContext(store);

  // priority rule: pinedLocale > contactLocale > urlLocale > storeLocale
  const twoLetterAppLocale = detectLocale([
    pinedLocale.value,
    twoLetterContactLocale.value,
    getLocaleFromUrl(),
    themeContext.value.defaultLanguage.twoLetterLanguageName,
  ]);

  /**
   * Creating plugin instances
   */
  const head = createHead();
  const i18n = createI18n(twoLetterAppLocale, currentCurrency.value.code, fallback);
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
    userName: user.value.userName,
    organizationId: user.value?.contact?.organizationId,
    cultureName: currentLanguage.value.cultureName,
    currencyCode: currentCurrency.value.code,
  });

  /**
   * Other settings
   */

  await Promise.all([
    initLocale(i18n, twoLetterAppLocale),
    fetchMenus(),
    fetchWhiteLabelingSettings(),
    addPresetToThemeContext(themePresetName.value || themeContext.value.defaultPresetName),
  ]);

  void initPushNotifications(router, i18n);
  void initModuleQuotes(router, i18n);
  void initModuleBackInStock(router, i18n);
  void initCustomerReviews(i18n);
  void initializePurchaseRequests(router, i18n);
  void initializeGoogleAnalytics();
  void initializeHotjar();

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value);

  const UIKitMessages = await getUIKitLocales(FALLBACK_LOCALE, currentLanguage.value?.twoLetterLanguageName);
  mergeLocales(i18n, currentLanguage.value?.twoLetterLanguageName, UIKitMessages.messages);
  if (currentLanguage.value?.twoLetterLanguageName !== FALLBACK_LOCALE) {
    mergeLocales(i18n, FALLBACK_LOCALE, UIKitMessages.fallbackMessages);
  }
  app.use(uiKit);

  app.use(applicationInsightsPlugin);

  const builderOrigin = getEpParam();
  if (builderOrigin && isPageBuilderPreviewMode(builderOrigin)) {
    const builderPreviewPlugin = (await import("@/builder-preview/builder-preview.plugin").catch(Logger.error))
      ?.default;
    if (builderPreviewPlugin) {
      app.use(builderPreviewPlugin, { router, builderOrigin });
    }
  }

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.config.warnHandler = (msg, _, trace) => {
    // to remove builder.io warnings
    if (builderIoConsoleWarnings.some((warning) => msg.includes(warning))) {
      return;
    }
    Logger.warn(msg, trace);
  };

  app.mount(appElement);
};
