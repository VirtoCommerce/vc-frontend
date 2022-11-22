import { createApp, Plugin } from "vue";
import { createHead } from "@vueuse/head";
import { setLocale as setLocaleForYup } from "yup";
import { maska } from "maska";
import { createI18n } from "@/i18n";
import { createRouter } from "@/router";
import { graphqlClient } from "@/xapi";
import {
  configPlugin,
  contextPlugin,
  getBaseUrl,
  Logger,
  permissionsPlugin,
  useCurrency,
  useLanguages,
  useThemeContext,
} from "@/core";
import { setGlobalVariables } from "@/core/globals";
import { useUser } from "@/shared/account";
import App from "./App.vue";
import * as UIKitComponents from "@/ui-kit/components";
import { templateBlocks } from "@/shared/static-content";
import ProductBlocks from "@/shared/catalog/components/product";

// Workaround before Nuxt3 migration, will be deleted later.
window.useNuxtApp = () => {
  return {
    $graphqlClient: graphqlClient,
  };
};

export default async (getPlugins: (options: any) => { plugin: Plugin; options: any }[] = () => []) => {
  const appSelector = "#app";
  const appElement = document.querySelector<HTMLElement | SVGElement>(appSelector);

  if (!appElement) {
    return Logger.debug(`The element with the selector "${appSelector}" was not found.`);
  }

  const { fetchUser } = useUser();
  const { themeContext, fetchThemeContext } = useThemeContext();
  const { currentLocale, currentLanguage, supportedLocales, setLocale } = useLanguages();
  const { currentCurrency } = useCurrency();

  /**
   * Fetching required app data
   */
  await Promise.all([fetchThemeContext(), fetchUser()]);

  /**
   * Creating plugin instances
   */
  const head = createHead();
  const i18n = createI18n();
  const router = createRouter({ base: getBaseUrl(supportedLocales.value) });

  /**
   * Setting global variables
   */
  setGlobalVariables({
    i18n,
    router,
    storeId: themeContext.value.storeId,
    catalogId: themeContext.value.catalogId,
    userId: themeContext.value.userId,
    cultureName: currentLanguage.value.cultureName,
    currencyCode: currentCurrency.value.code,
  });

  /**
   * Other settings
   */
  await setLocale(i18n, currentLocale.value);

  setLocaleForYup({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  /**
   * Create and mount application
   */
  const app = createApp(App, {
    /**
     * Passing data-* attributes to the application props
     */
    ...appElement.dataset,
  });

  // Plugins
  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(permissionsPlugin);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value!.settings);

  const plugins = getPlugins({ router });
  plugins.forEach(({ plugin, options }) => app.use(plugin, options));

  // Directives
  app.directive("mask", maska);

  // Components
  // Register UI Kit components globally
  Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));

  // Register Page builder components globally
  Object.entries(templateBlocks).forEach(([name, component]) => app.component(name, component));

  // Register Page builder product components globally
  Object.entries(ProductBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.mount(appElement);
};
