import { createHead } from "@unhead/vue/client";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { apolloClient, getPageContext, initializeApplication } from "@/core/api/graphql";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import {
  useCurrency,
  useDarkMode,
  useModules,
  useThemeContext,
  useNavigations,
  useWhiteLabeling,
} from "@/core/composables";
import { useHotjar } from "@/core/composables/useHotjar";
import { useLanguages } from "@/core/composables/useLanguages";
import { DEFAULT_NOTIFICATION_DURATION, FALLBACK_LOCALE, IS_DEVELOPMENT } from "@/core/constants";
import { setGlobals } from "@/core/globals";
import { registerLocaleLoader } from "@/core/locale-loaders";
import {
  applicationInsightsPlugin,
  authPlugin,
  configPlugin,
  contextPlugin,
  extensionPointsPlugin,
  permissionsPlugin,
} from "@/core/plugins";
import { extractHostname, Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { createI18n } from "@/i18n";
import { init as initModuleBackInStock } from "@/modules/back-in-stock";
import { init as initCustomerReviews } from "@/modules/customer-reviews";
import { startFederatedModules } from "@/modules/federated/bootstrap";
import { init as initializeGoogleAnalytics } from "@/modules/google-analytics";
import { init as initLoyalty } from "@/modules/loyalty";
import { init as initNews } from "@/modules/news";
import { initialize as initializePurchaseRequests } from "@/modules/purchase-requests";
import { init as initPushNotifications } from "@/modules/push-messages";
import { init as initModuleQuotes } from "@/modules/quotes";
import { init as initSalesRep } from "@/modules/sales-rep";
import { init as initSkyflow } from "@/modules/skyflow";
import { BUILDER_IO_TRACE_MARKER, consoleIgnoredErrors } from "@/pages/matcher/builderIo/console-ignored-errors";
import { isPreviewMode as isBuilderIoPreviewMode } from "@/plugins/builder-io-preview/utils";
import { getPreviewBootOptions as getPageBuilderPreviewBoot } from "@/plugins/builder-preview/utils";
import { createRouter } from "@/router";
import { applyUcpHandoffBuyer, restoreUcpHandoffCart } from "@/router/routes/ucp-handoff";
import { useUser } from "@/shared/account";
import ProductBlocks from "@/shared/catalog/components/product";
import { useNotifications } from "@/shared/notification";
import { templateBlocks } from "@/shared/static-content";
import { uiKit } from "@/ui-kit";
import { setDefaultIconVariant } from "@/ui-kit/utilities";
import { getLocales as getUIKitLocales } from "@/ui-kit/utilities/getLocales";
import App from "./App.vue";
import type { PageContextResponseType } from "./core/api/graphql/types";

async function getUcpHandoffUserId(): Promise<string | undefined> {
  const ucpSession = new URL(globalThis.location.href).searchParams.get("ucp_session");

  if (!ucpSession) {
    return;
  }

  try {
    const { buyerId } = await restoreUcpHandoffCart(ucpSession);
    applyUcpHandoffBuyer(buyerId);
    return buyerId;
  } catch (error) {
    Logger.warn("Failed to pre-restore UCP handoff session", error);
  }
}

/** The preview plugins are optional: a failed load leaves the app booting without them. */
function reportOptionalChunkFailure(error: unknown): undefined {
  ignoreChunkLoadFailure(error);
  Logger.error("Failed to load an optional plugin chunk.", error);

  return undefined;
}

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
    supportedLanguages,
    applyLocale,
    fetchLocaleMessages,
    mergeLocalesMessages,
    resolveLocale,
    normalizeToSupportedCulture,
    getUrlWithoutPossibleLocale,
    resolvePossibleLocale,
  } = useLanguages();
  const { currentCurrency } = useCurrency();
  const { init: initializeHotjar } = useHotjar();
  const { fetchCatalogMenu } = useNavigations();
  const { themePresetName, setWhiteLabelingSettings } = useWhiteLabeling();
  const { setActivePreset } = useDarkMode();
  const { setModules, outdatedModules } = useModules();
  const notifications = useNotifications();

  const fallback = {
    locale: FALLBACK_LOCALE,
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  // get initialization query parameters
  const pathname = globalThis.location.pathname;
  const pageBuilderPreview = getPageBuilderPreviewBoot();
  const possibleCultureName = pageBuilderPreview.cultureName ?? resolvePossibleLocale(pathname);
  const permalink = getPermalink(pathname, getUrlWithoutPossibleLocale);

  const domain = IS_DEVELOPMENT
    ? extractHostname(import.meta.env.APP_BACKEND_URL as string)
    : globalThis.location.hostname;
  const userId = (await getUcpHandoffUserId()) ?? savedUserId.value;

  try {
    const initialStore = await initializeApplication(domain);
    setModules(initialStore?.settings?.modules);
  } catch (e) {
    Logger.warn("Failed to verify backend module versions", e);
  }

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

  // A preview boot carries the edited page's language; tolerate short/differently-cased values
  // ("fr", "fr-fr") instead of silently falling back to the store default (VCST-5219).
  const currentCultureName = normalizeToSupportedCulture(pageBuilderPreview.cultureName) ?? resolveLocale();
  const isDefaultLocaleInUse = defaultStoreCulture.value === currentCultureName;

  // Plural rules must be registered for every locale key messages can resolve under — full
  // culture names (global messages) and two-letter codes (module/ui-kit messages) alike.
  const pluralRuleLocales = supportedLanguages.value.flatMap((language) => [
    language.cultureName,
    language.twoLetterLanguageName,
  ]);

  const i18n = createI18n(currentCultureName, currentCurrency.value.code, fallback, pluralRuleLocales);

  // The UI kit loads its locale bundles through the shared locale-loader seam, so boot and any
  // runtime locale switch (e.g. builder preview, VCST-5219) share one copy of this logic.
  registerLocaleLoader("ui-kit", async (i18nInstance, language) => {
    const uiKitMessages = await getUIKitLocales(FALLBACK_LOCALE, language.twoLetterLanguageName);
    mergeLocalesMessages(i18nInstance, language.twoLetterLanguageName, uiKitMessages.messages);
    if (language.twoLetterLanguageName !== FALLBACK_LOCALE) {
      mergeLocalesMessages(i18nInstance, FALLBACK_LOCALE, uiKitMessages.fallbackMessages);
    }
  });

  await applyLocale(i18n, currentCultureName, { rewriteUrl: pageBuilderPreview.useLocalePrefix });

  const router = createRouter({
    base: pageBuilderPreview.useLocalePrefix && !isDefaultLocaleInUse ? currentMaybeShortLocale.value : "",
  });

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

  seedSlugInfoCache({
    slugInfo: pageContext.slugInfo,
    permalink,
    userId: user.value.id,
    storeId: themeContext.value.storeId,
    cultureName: currentLanguage.value.cultureName,
    previewCultureName: pageBuilderPreview.cultureName,
    resolvedCultureName: currentCultureName,
  });

  /**
   * Other settings
   */

  setWhiteLabelingSettings(whiteLabelingSetting);
  await addPresetToThemeContext(themePresetName.value ?? themeContext.value.defaultPresetName);
  setActivePreset(themeContext.value.activePresetName ?? themeContext.value.defaultPresetName);

  // Transitional: `icon_variant` eases client migration to outline; slated for removal (outline-only default).
  setDefaultIconVariant(themeContext.value.settings.icon_variant ?? "outline");

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
  void initSalesRep(router, i18n);
  void initSkyflow(router, i18n);

  // Module Federation host: load federated plugins if APP_MODULES_FEDERATION_ENABLED is on.
  // Awaited before app.use(router) so plugin routes exist for the first navigation.
  const federatedModulesReady = startFederatedModules();

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(permissionsPlugin);
  app.use(extensionPointsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value);

  app.use(uiKit);

  app.use(applicationInsightsPlugin, { router });

  if (pageBuilderPreview.isActive) {
    const builderPreviewPlugin = (
      await import("@/plugins/builder-preview/builder-preview.plugin").catch(reportOptionalChunkFailure)
    )?.default;
    if (builderPreviewPlugin) {
      app.use(builderPreviewPlugin, { router });
    }
  }

  if (isBuilderIoPreviewMode()) {
    const builderIoPreviewPlugin = (
      await import("@/plugins/builder-io-preview/builder-io-preview.plugin").catch(reportOptionalChunkFailure)
    )?.default;
    if (builderIoPreviewPlugin) {
      app.use(builderIoPreviewPlugin, { router });
    }
  }

  // Federated plugin routes must exist before the router is installed. Never rejects.
  await federatedModulesReady;

  // router must be registered after all plugins because some of them are using router.beforeEach to protect routes or add functionality before route changes, and we want to make sure that those are registered before we start using the router
  app.use(router);

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.config.warnHandler = (message, _, traceDetails) => {
    // to remove builder.io warnings
    if (consoleIgnoredErrors.some((err) => message?.includes(err) && traceDetails?.includes(BUILDER_IO_TRACE_MARKER))) {
      return;
    }

    Logger.warn(message, traceDetails);
  };

  app.mount(appElement);

  notifyOutdatedModules(outdatedModules.value, i18n.global.t, notifications);
};

function notifyOutdatedModules(
  outdated: ReturnType<typeof useModules>["outdatedModules"]["value"],
  t: (key: string, params?: Record<string, unknown>) => string,
  notifications: ReturnType<typeof useNotifications>,
): void {
  if (!outdated.length) {
    return;
  }

  const MODULES_PREVIEW_LIMIT = 3;
  const modulesLines = outdated.map(
    ({ moduleId, expectedVersion, backendVersion }) => `${moduleId} ${expectedVersion} ≥ ${backendVersion}`,
  );
  const previewLines = modulesLines.slice(0, MODULES_PREVIEW_LIMIT);
  const hiddenCount = modulesLines.length - previewLines.length;
  const previewHtml = hiddenCount > 0 ? `${previewLines.join("<br>")}<br>…` : previewLines.join("<br>");

  notifications.error({
    group: "OutdatedBackendModules",
    singleInGroup: true,
    html: `${t("common.messages.outdated_backend_modules")}<br><br>${previewHtml}`,
    duration: DEFAULT_NOTIFICATION_DURATION,
    variant: "outline-dark",
    button: {
      text: t("common.buttons.copy_to_clipboard"),
      color: "secondary",
      variant: "outline",
      clickHandler: (notificationId: string) => {
        void navigator.clipboard.writeText(modulesLines.join("\n"));

        notifications.update(notificationId, {
          duration: 5000,
          type: "success",
          text: t("common.messages.copied_to_clipboard"),
          html: undefined,
          variant: "solid",
          button: undefined,
        });
      },
    },
  });
}

function getPermalink(permalink: string, getUrlWithoutPossibleLocale: (fullPath: string) => string): string {
  const resolvedPermalink = getUrlWithoutPossibleLocale(permalink) ?? "";

  if (!resolvedPermalink || resolvedPermalink === "/") {
    return resolvedPermalink;
  }

  return String(resolvedPermalink).replace(/^\/+/, "");
}

/**
 * Seeds the Apollo cache with the slugInfo already returned by pageContext, so the first navigation
 * doesn't repeat that network call.
 *
 * pageContext is fetched with the raw preview `cultureName`. When the app resolves to a different
 * culture — an unsupported value, or a short form like "fr" normalized to "fr-FR" — that slugInfo
 * belongs to another culture, so skip seeding rather than cache it under the wrong key (VCST-5219).
 */
function seedSlugInfoCache(params: {
  slugInfo: PageContextResponseType["slugInfo"];
  permalink: string;
  userId: string;
  storeId: string;
  cultureName: string;
  previewCultureName?: string;
  resolvedCultureName: string;
}) {
  const { slugInfo, permalink, userId, storeId, cultureName, previewCultureName, resolvedCultureName } = params;

  if (previewCultureName && previewCultureName !== resolvedCultureName) {
    return;
  }

  try {
    apolloClient.writeQuery({
      query: GetSlugInfoDocument,
      variables: { userId, storeId, cultureName, permalink },
      data: { slugInfo },
    });
  } catch (e) {
    Logger.warn("Failed to seed slugInfo into Apollo cache", e);
  }
}
