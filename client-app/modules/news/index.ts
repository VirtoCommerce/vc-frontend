import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const { isEnabled } = useModuleSettings(MODULE_ID);

const NewsArticle = () => import("./pages/news-article.vue");
const NewsArticles = () => import("./pages/news-articles.vue");

const route: RouteRecordRaw = {
  path: "/news",
  children: [
    {
      path: "",
      name: "NewsArticles",
      component: NewsArticles,
    },
    {
      path: ":articleId",
      name: "NewsArticle",
      component: NewsArticle,
      props: true,
    },
  ],
};

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("NewsArticles", route);
    void loadModuleLocale(i18n, "news");
  }
}
