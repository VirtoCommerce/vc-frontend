import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import { ROUTES } from "./routes/constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const { isEnabled } = useModuleSettings(MODULE_ID);

const NewsArticle = () => import(/* webpackChunkName: "news" */ "./pages/news-article.vue");
const NewsArticles = () => import(/* webpackChunkName: "news" */ "./pages/news-articles.vue");

const route: RouteRecordRaw = {
  path: `/${ROUTES.LINK_SEGMENT}`,
  children: [
    {
      path: ":tag?",
      name: ROUTES.ARTICLES.NAME,
      component: NewsArticles,
      props: true,
    },
    {
      path: ":articleId",
      name: ROUTES.ARTICLE.NAME,
      component: NewsArticle,
      props: true,
    },
  ],
};

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute(ROUTES.ARTICLES.NAME, route);
    void loadModuleLocale(i18n, "news");
  }
}
