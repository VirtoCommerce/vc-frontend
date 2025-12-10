import { createHead } from "@unhead/vue/client";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { apolloClient, getPageContext } from "@/core/api/graphql";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import { useCurrency, useThemeContext, useNavigations, useWhiteLabeling } from "@/core/composables";
import { useHotjar } from "@/core/composables/useHotjar";
import { useLanguages } from "@/core/composables/useLanguages";
import { FALLBACK_LOCALE, IS_DEVELOPMENT } from "@/core/constants";
import { setGlobals } from "@/core/globals";
import {
  applicationInsightsPlugin,
  authPlugin,
  configPlugin,
  contextPlugin,
  extensionPointsPlugin,
  permissionsPlugin,
} from "@/core/plugins";
import { extractHostname, Logger } from "@/core/utilities";
import { createI18n } from "@/i18n";
import { init as initModuleBackInStock } from "@/modules/back-in-stock";
import { init as initCustomerReviews } from "@/modules/customer-reviews";
import { init as initializeGoogleAnalytics } from "@/modules/google-analytics";
import { init as initLoyalty } from "@/modules/loyalty";
import { init as initNews } from "@/modules/news";
import { initialize as initializePurchaseRequests } from "@/modules/purchase-requests";
import { init as initPushNotifications } from "@/modules/push-messages";
import { init as initModuleQuotes } from "@/modules/quotes";
import { BUILDER_IO_TRACE_MARKER, consoleIgnoredErrors } from "@/pages/matcher/builderIo/console-ignored-errors";
import { isPreviewMode as isBuilderIoPreviewMode } from "@/plugins/builder-io-preview/utils";
import { getEpParam, isPreviewMode as isPageBuilderPreviewMode } from "@/plugins/builder-preview/utils";
import { createRouter } from "@/router";
import { useUser } from "@/shared/account";
import ProductBlocks from "@/shared/catalog/components/product";
import { templateBlocks } from "@/shared/static-content";
import { uiKit } from "@/ui-kit";
import { getLocales as getUIKitLocales } from "@/ui-kit/utilities/getLocales";
import App from "./App.vue";
import type { PageContextResponseType } from "./core/api/graphql/types";

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

  const { setUser, user, isAuthenticated, savedUserId } = useUser();
  const { themeContext, addPresetToThemeContext, setThemeContext } = useThemeContext();
  const {
    currentLanguage,
    currentMaybeShortLocale,
    defaultStoreCulture,
    initLocale,
    fetchLocaleMessages,
    mergeLocalesMessages,
    resolveLocale,
    getUrlWithoutPossibleLocale,
    resolvePossibleLocale,
  } = useLanguages();
  const { currentCurrency } = useCurrency();
  const { init: initializeHotjar } = useHotjar();
  const { fetchCatalogMenu } = useNavigations();
  const { themePresetName, setWhiteLabelingSettings } = useWhiteLabeling();

  const fallback = {
    locale: FALLBACK_LOCALE,
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  // get initialization query parameters
  const pathname = globalThis.location.pathname;
  const possibleCultureName = resolvePossibleLocale(pathname);
  const permalink = getPermalink(pathname, getUrlWithoutPossibleLocale);

  const domain = IS_DEVELOPMENT
    ? extractHostname(import.meta.env.APP_BACKEND_URL as string)
    : globalThis.location.hostname;
  const userId = savedUserId.value;

  const getPageContextPromise = getPageContext({
    domain: domain,
    userId: userId,
    permalink: permalink,
    cultureName: possibleCultureName,
  }) as Promise<PageContextResponseType>;

  const [pageContext] = await Promise.all([getPageContextPromise, fallback.setMessage()]);

  const store = pageContext.store;
  const userResult = pageContext.user;
  const whiteLabelingSetting = pageContext.whiteLabelingSettings;

  if (!store) {
    alert("Related store not found. Please contact your site administrator.");
    throw new Error("Store not found. Check graphql request, PageContext query");
  }

  if (!userResult) {
    alert("Error fetching user. Please contact your site administrator.");
    throw new Error("Error fetching user. Check graphql request, PageContext query");
  }

  setThemeContext(store);
  setUser(userResult);

  /**
   * Creating plugin instances
   */
  const head = createHead();

  const currentCultureName = resolveLocale();
  const isDefaultLocaleInUse = defaultStoreCulture.value === currentCultureName;

  const i18n = createI18n(currentCultureName, currentCurrency.value.code, fallback);
  await initLocale(i18n, currentCultureName);

  const router = createRouter({ base: isDefaultLocaleInUse ? "" : currentMaybeShortLocale.value });

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

  // Seed Apollo cache with initial slugInfo from pageContext to avoid the first network call
  try {
    const baseVariables = {
      userId: user.value.id,
      storeId: themeContext.value.storeId,
      cultureName: currentLanguage.value.cultureName,
    } as const;

    apolloClient.writeQuery({
      query: GetSlugInfoDocument,
      variables: { ...baseVariables, permalink },
      data: { slugInfo: pageContext.slugInfo },
    });
  } catch (e) {
    Logger.warn("Failed to seed slugInfo into Apollo cache", e as Error);
  }

  /**
   * Other settings
   */

  setWhiteLabelingSettings(whiteLabelingSetting);
  await addPresetToThemeContext(themePresetName.value ?? themeContext.value.defaultPresetName);

  if (isAuthenticated.value || themeContext.value.storeSettings.anonymousUsersAllowed) {
    void fetchCatalogMenu();
  }

  void initPushNotifications(router, i18n);
  void initModuleQuotes(router, i18n);
  void initModuleBackInStock(router, i18n);
  void initCustomerReviews(i18n);
  void initializePurchaseRequests(router, i18n);
  void initializeGoogleAnalytics();
  void initializeHotjar();
  void initNews(router, i18n);
  void initLoyalty(router, i18n);

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(extensionPointsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value);

  const UIKitMessages = await getUIKitLocales(FALLBACK_LOCALE, currentLanguage.value?.twoLetterLanguageName);
  mergeLocalesMessages(i18n, currentLanguage.value?.twoLetterLanguageName, UIKitMessages.messages);
  if (currentLanguage.value?.twoLetterLanguageName !== FALLBACK_LOCALE) {
    mergeLocalesMessages(i18n, FALLBACK_LOCALE, UIKitMessages.fallbackMessages);
  }
  app.use(uiKit);

  app.use(applicationInsightsPlugin);

  const builderOrigin = getEpParam();
  if (builderOrigin && isPageBuilderPreviewMode(builderOrigin)) {
    const builderPreviewPlugin = (await import("@/plugins/builder-preview/builder-preview.plugin").catch(Logger.error))
      ?.default;
    if (builderPreviewPlugin) {
      app.use(builderPreviewPlugin, { router, builderOrigin });
    }
  }

  if (isBuilderIoPreviewMode()) {
    const builderIoPreviewPlugin = (
      await import("@/plugins/builder-io-preview/builder-io-preview.plugin").catch(Logger.error)
    )?.default;
    if (builderIoPreviewPlugin) {
      app.use(builderIoPreviewPlugin, { router });
    }
  }

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.config.warnHandler = (msg, _, trace) => {
    // to remove builder.io warnings
    if (consoleIgnoredErrors.some((err) => msg.includes(err) && trace.includes(BUILDER_IO_TRACE_MARKER))) {
      return;
    }

    Logger.warn(msg, trace);
  };

  app.mount(appElement);
};

function getPermalink(permalink: string, getUrlWithoutPossibleLocale: (fullPath: string) => string) {
  permalink = getUrlWithoutPossibleLocale(permalink);
  permalink = permalink === "/" ? "/" : permalink.replace(/^\/+/, "");
  return permalink;
}
