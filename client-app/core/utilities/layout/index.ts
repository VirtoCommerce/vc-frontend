import type { RouteLocationNormalizedLoaded, Layout } from "vue-router";

export function getLayout(route: RouteLocationNormalizedLoaded): Layout {
  return route.meta?.layout ?? "Main";
}
