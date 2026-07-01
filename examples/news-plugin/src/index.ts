import "./styles.css";
import { useModuleSettings, globals } from "@vc-frontend/core";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import { loadNewsLocale } from "./load-locale";
import { ROUTES } from "./routes/constants";
import type { RouteRecordRaw } from "vue-router";

const { isEnabled } = useModuleSettings(MODULE_ID);

const NewsArticle = () => import(/* webpackChunkName: "news" */ "./pages/news-article.vue");
const NewsArticles = () => import(/* webpackChunkName: "news" */ "./pages/news-articles.vue");

const route: RouteRecordRaw = {
  path: `/${ROUTES.LINK_SEGMENT}`,
  children: [
    {
      path: "",
      name: ROUTES.ARTICLES.NAME,
      component: NewsArticles,
    },
    {
      path: "tag/:tag?",
      name: ROUTES.ARTICLES_BY_TAG.NAME,
      component: NewsArticles,
      props: true,
    },
    {
      path: "author/:authorId/:tag?",
      name: ROUTES.ARTICLES_BY_AUTHOR.NAME,
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

// No args: a plugin binds to the host's live instances through the shared
// `@vc-frontend/core` facade (here `globals.router` / `globals.i18n`) instead of
// receiving them, so the host↔plugin contract is a plain `init()` lifecycle hook.
export function init() {
  if (isEnabled(ENABLED_KEY)) {
    globals.router.addRoute(ROUTES.ARTICLES.NAME, route);
    void loadNewsLocale();
  }
}
