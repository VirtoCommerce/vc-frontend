import { getRoutePageType, getSlugPermalink, resolveSlugPageType } from "./page-type";
import type { CaptureType } from "./types";
import type { RouteLocationNormalizedGeneric, Router } from "vue-router";

/**
 * A page view is sent after the navigation, not on `pushState`: only then the route is resolved and the view can say
 * which page it was.
 */
export function trackPageViews(router: Router, capture: CaptureType): void {
  let isInitialViewSent = false;
  let sendPendingView: (() => void) | undefined;

  function capturePageView(route: RouteLocationNormalizedGeneric, pageType: string | undefined): void {
    capture("$pageview", {
      route_name: route.name ? String(route.name) : undefined,
      page_type: pageType,
    });
  }

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

  // The module starts while the initial navigation may already be over, and `afterEach` would then never see it.
  void router.isReady().then(() => {
    if (!isInitialViewSent) {
      isInitialViewSent = true;
      sendPageView(router.currentRoute.value);
    }
  });
}
