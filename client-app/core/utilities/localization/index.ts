import type { RouteLocationAsRelativeGeneric, RouteLocationRaw } from "vue-router";

export function updateRouteWithLocale(route: RouteLocationRaw, locale?: string | null) {
  // TODO: handle external links

  if (typeof route === "string") {
    // TODO: add locale to path
    return {
      path: route,
    };
  }

  const routeAsRelativeGeneric = route as RouteLocationAsRelativeGeneric;

  return {
    ...routeAsRelativeGeneric,
    params: {
      ...routeAsRelativeGeneric.params,
      locale: locale ?? "",
    },
  };
}
