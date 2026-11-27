import { getSlugRoutePermalink } from "@/shared/layout/composables/usePageLayout";
import { getPagePath } from "./page-path";
import { getRoutePageType, resolveSlugPageType } from "./page-type";
import type { CaptureOptionsType, CaptureType } from "./types";
import type { RouteLocationNormalizedGeneric, Router } from "vue-router";

/** Sent after the navigation: only then is the route resolved, and the view can say which page it was. */
export function trackPageViews(router: Router, capture: CaptureType): void {
  let sendPendingView: (() => void) | undefined;

  function sendPageView(route: RouteLocationNormalizedGeneric): void {
    // A slug page left before its type came back was still viewed: it goes out untyped, ahead of the next view.
    sendPendingView?.();

    // Fixed now: a view that waits for its type is sent when the visitor may already be on another page.
    const viewed: CaptureOptionsType = { path: getPagePath(router, route.path), occurredAt: new Date() };

    function capturePageView(pageType: string | undefined): void {
      capture("$pageview", { route_name: route.name ? String(route.name) : undefined, page_type: pageType }, viewed);
    }

    const routePageType = getRoutePageType(route);
    const permalink = getSlugRoutePermalink(route);
    if (routePageType !== undefined || permalink === undefined) {
      capturePageView(routePageType);
      return;
    }

    let isSent = false;
    function send(pageType?: string): void {
      if (isSent) {
        return;
      }
      isSent = true;
      sendPendingView = undefined;
      capturePageView(pageType);
    }

    sendPendingView = () => send();
    void resolveSlugPageType(permalink).then(send);
  }

  router.afterEach((to, _from, failure) => {
    if (!failure) {
      sendPageView(to);
    }
  });
}
