import { createApp, Plugin } from "vue";
import { RouteRecordName } from "vue-router";
import maska from "maska";
import * as yup from "yup";
import { createHead } from "@vueuse/head";
import { setGlobalVariables } from "@/core/globals";
import { useCurrency, useLanguages, useThemeContext } from "@/core/composables";
import { configPlugin, contextPlugin } from "@/core/plugins";
import { useUser } from "@/shared/account";
import { createI18n } from "@/i18n";
import { createRouter } from "@/router";
import { getBaseUrl } from "@/core/utilities";
import App from "./App.vue";
import PageBuilderBlocks from "@/builder-preview/pages/blocks";
import * as components from "@/ui-kit/components";
import client from "@/xapi/graphql-client";

// Workaround before Nuxt3 migration, will be deleted later.
window.useNuxtApp = () => {
  return {
    $graphqlClient: client,
  };
};

export default async (getPlugins: (options: any) => { plugin: Plugin; options: any }[] = () => []) => {
  const { isAuthenticated, fetchUser } = useUser();
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

  yup.setLocale({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  router.beforeEach((to, _from, next) => {
    // Protect account routes
    if (!isAuthenticated.value && to.meta.requiresAuth) {
      return next({
        name: "SignIn",
        // save the location we were at to come back later
        query: { redirect: to.fullPath },
      });
    }

    // Make Dashboard the default Home page for authorized users
    if (isAuthenticated.value && Array<RouteRecordName>("Home", "SignIn", "SignUp").includes(to.name!)) {
      return next({ name: "Dashboard" });
    }

    return next();
  });

  /**
   * Create and mount application
   */
  const app = createApp(App);

  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(maska);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value!.settings);

  const plugins = getPlugins({ router });
  plugins.forEach(({ plugin, options }) => app.use(plugin, options));

  // Register UI Kit components globally
  Object.entries(components).forEach(([name, component]) => app.component(name, component));

  // Register Page builder components globally
  Object.entries(PageBuilderBlocks).forEach(([name, component]) => app.component(name, component));

  await router.isReady();

  app.mount("#app");
};
