import { loadModuleLocale } from "../utils";
import type { I18n } from "@/i18n";
import type { Router, RouteRecordRaw } from "vue-router";

const NewsArticle = () => import("./pages/news-article.vue");
const NewsArticles = () => import("./pages/news-articles.vue");

const route: RouteRecordRaw = {
  path: "/news",
  children: [
    { path: "", name: "NewsArticles", component: NewsArticles },
    {
      path: ":articleId",
      name: "NewsArticle",
      component: NewsArticle,
      props: true,
    },
  ],
};

export function init(router: Router, i18n: I18n) {
  router.addRoute("NewsArticles", route);
  void loadModuleLocale(i18n, "news");
}
