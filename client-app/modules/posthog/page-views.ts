import { capture } from "./client";
import type { RouteLocationNormalizedGeneric, Router } from "vue-router";

/**
 * The SDK's own page-view capture is off: it fires on `pushState`, before the router has resolved the route, so the
 * event would carry no route name. Sent after each navigation instead, with the SDK adding `$current_url` as usual.
 */
export function trackPageViews(router: Router): void {
  let isInitialViewSent = false;

  router.afterEach((to, _from, failure) => {
    if (failure) {
      return;
    }

    isInitialViewSent = true;
    capturePageView(to);
  });

  // `init` awaits the SDK chunk, so the initial navigation may already be over when the hook above is registered.
  void router.isReady().then(() => {
    if (!isInitialViewSent) {
      isInitialViewSent = true;
      capturePageView(router.currentRoute.value);
    }
  });
}

function capturePageView(route: RouteLocationNormalizedGeneric): void {
  capture("$pageview", {
    route_name: route.name ? String(route.name) : undefined,
  });
}
