import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { mainRoutes } from "@/router/routes";

export function createRouter(options: { base: string }) {
  const { base } = options;

  return _createRouter({
    routes: mainRoutes,
    history: createWebHistory(base),
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0, behavior: "smooth" };
    },
  });
}
