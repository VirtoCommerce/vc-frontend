import { capture } from "./client";
import { getRoutePageType, getSlugPermalink, resolveSlugPageType } from "./page-type";
import type { RouteLocationNormalizedGeneric, Router } from "vue-router";

/**
 * The SDK's own page-view capture is off: it fires on `pushState`, before the router has resolved the route, so the
 * event would carry no route name. Sent after each navigation instead, with the SDK adding `$current_url` as usual.
 */
export function trackPageViews(router: Router): void {
  let isInitialViewSent = false;
  let sendPendingView: (() => void) | undefined;

  function sendPageView(route: RouteLocationNormalizedGeneric): void {
    // A slug page left before its type came back was still viewed: it goes out untyped, ahead of the next view.
    sendPendingView?.();

    const routePageType = getRoutePageType(route);
    const permalink = getSlugPermalink(route);
    if (routePageType !== undefined || permalink === undefined) {
      capturePageView(route, routePageType);
      return;
    }

    let isSent = false;
    function send(pageType?: string): void {
      if (isSent) {
        return;
      }
      isSent = true;
      sendPendingView = undefined;
      capturePageView(route, pageType);
    }

    sendPendingView = () => send();
    void resolveSlugPageType(permalink).then(send);
  }

  router.afterEach((to, _from, failure) => {
    if (failure) {
      return;
    }

    isInitialViewSent = true;
    sendPageView(to);
  });

  // `init` awaits the SDK chunk, so the initial navigation may already be over when the hook above is registered.
  void router.isReady().then(() => {
    if (!isInitialViewSent) {
      isInitialViewSent = true;
      sendPageView(router.currentRoute.value);
    }
  });
}

function capturePageView(route: RouteLocationNormalizedGeneric, pageType: string | undefined): void {
  capture("$pageview", {
    route_name: route.name ? String(route.name) : undefined,
    page_type: pageType,
  });
}
