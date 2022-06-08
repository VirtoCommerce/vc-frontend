import { createApp, Plugin } from "vue";
import { RouteRecordName } from "vue-router";
import * as yup from "yup";
import { createHead } from "@vueuse/head";
import { useGlobalVariables, useLanguages, useThemeContext } from "@core/composables";
import { configPlugin, contextPlugin } from "@core/plugins";
import { useUser } from "@/shared/account";
import { useNavigations } from "@/shared/layout";
import { createI18n } from "@/i18n";
import { createRouter, getBaseUrl } from "@/router";
import App from "./App.vue";
import blocks from "@/builder-preview/pages/blocks";

/**
 * Global Styles
 */
import "@fortawesome/fontawesome-free/css/all.css";
import "@/assets/styles/main.scss";

export default async (getPlugins: (options: any) => { plugin: Plugin; options: any }[] = () => []) => {
  const globals = useGlobalVariables();
  const { isAuthenticated, fetchUser } = useUser();
  const { themeContext, fetchThemeContext } = useThemeContext();
  const { currentLocale, currentLanguage, supportedLocales, setLocale } = useLanguages();
  const { fetchMenus } = useNavigations();

  // Load app data
  await Promise.all([fetchThemeContext(), fetchUser()]);

  const head = createHead();
  const i18n = createI18n();
  const router = createRouter({ base: getBaseUrl(supportedLocales.value) });

  await setLocale(i18n, currentLocale.value!);

  fetchMenus(currentLanguage.value!.cultureName);

  yup.setLocale({
    mixed: {
      required: i18n.global.t("common.messages.required_field"),
    },
    string: {
      email: i18n.global.t("common.messages.email_is_not_correct"),
      max: ({ max }) => i18n.global.t("common.messages.max_length", { max }),
    },
  });

  router.beforeEach((to, from, next) => {
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

  // Setting global variables
  globals.i18n = i18n;
  globals.router = router;

  // Create and mount application
  const app = createApp(App);

  Object.keys(blocks).forEach((key) => app.component(key, blocks[key]));

  app.use(head);
  app.use(i18n);
  app.use(router);
  app.use(contextPlugin, themeContext.value);
  app.use(configPlugin, themeContext.value!.settings);

  const plugins = getPlugins({ router });
  plugins.forEach(({ plugin, options }) => app.use(plugin, options));

  await router.isReady();

  app.mount("#app");
};
