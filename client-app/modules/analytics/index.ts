import { useEventListener } from "@vueuse/core";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { canUseDOM } from "@/core/utilities/analytics/environment";
import { createAnalyticsEvents } from "@/core/utilities/analytics/events";
import { DEBUG_PREFIX, ENABLED_KEY, MODULE_ID, SESSION_START_EVENT, TRACKER_NAME } from "./constants";
import { trackPageViews } from "./page-views";
import { useAnalyticsQueue } from "./queue";
import { getSession } from "./session";
import type { Router } from "vue-router";

export function init(router: Router): void {
  const { isEnabled } = useModuleSettings(MODULE_ID);

  if (!canUseDOM || IS_DEVELOPMENT || !isEnabled(ENABLED_KEY)) {
    return;
  }

  const { capture, flush } = useAnalyticsQueue();

  if (getSession().isNew) {
    capture(SESSION_START_EVENT);
  }

  useAnalytics().addTracker({
    meta: { name: TRACKER_NAME },
    // A sign-in is recorded by the platform itself, so the one the bus reports is not parked for the next page.
    events: createAnalyticsEvents({ send: capture, deferLogin: () => undefined, debugPrefix: DEBUG_PREFIX }),
  });

  trackPageViews(router, capture);

  // `visibilitychange` is the last event a mobile browser reliably fires; `pagehide` covers a desktop tab being closed.
  useEventListener(window, "pagehide", flush);
  useEventListener(document, "visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
    }
  });
}
