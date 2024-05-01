import { createHead, useHead } from "@unhead/vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApp, h, provide } from "vue";
import { apolloClient } from "@/core/api/graphql";
import {
  useCurrency,
  useLanguages,
  useThemeContext,
  useGoogleAnalytics,
  useHotjar,
  useWhiteLabeling,
  useNavigations,
} from "@/core/composables";
import { setGlobals } from "@/core/globals";
import { authPlugin, configPlugin, contextPlugin, permissionsPlugin } from "@/core/plugins";
import { getBaseUrl, Logger } from "@/core/utilities";
import { createI18n } from "@/i18n";
import { createRouter } from "@/router";
import { useUser } from "@/shared/account";
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
  const { init: initHotjar } = useHotjar();
  const { fetchMenus } = useNavigations();
  const { favIcons, themePresetName, fetchWhiteLabelingSettings } = useWhiteLabeling();

  const fallback = {
    locale: "en",
    message: {},
    async setMessage() {
      this.message = await fetchLocaleMessages(this.locale);
    },
  };

  await fallback.setMessage();
  await fetchThemeContext();
  await fetchUser();

  initializeGoogleAnalytics();
  initHotjar();

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

  if (themePresetName.value) {
    await fetchThemeContext(themePresetName.value);
  }

  useHead({
    link: favIcons.value?.length
      ? favIcons.value
      : [
          {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/static/icons/favicon-16x16.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/static/icons/favicon-32x32.png",
          },
          {
            rel: "manifest",
            href: "/static/manifest.json",
          },
        ],
  });

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value.settings);
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
