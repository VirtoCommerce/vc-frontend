import { useEventListener } from "@vueuse/core";
import { watch } from "vue";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { canUseDOM } from "@/core/utilities/analytics/environment";
import { createAnalyticsEvents } from "@/core/utilities/analytics/events";
import { getCustomerIdentity } from "@/core/utilities/analytics/identity";
import { useUser } from "@/shared/account/composables/useUser";
import { useAnalyticsQueue } from "./composables/useAnalyticsQueue";
import { DEBUG_PREFIX, ENABLED_KEY, MODULE_ID, SESSION_START_EVENT, TRACKER_NAME } from "./constants";
import { getPagePath } from "./page-path";
import { trackPageViews } from "./page-views";
import { getSession, startSessionFor } from "./session";
import type { Router } from "vue-router";

export function init(router: Router): void {
  const { isEnabled } = useModuleSettings(MODULE_ID);

  if (!canUseDOM || IS_DEVELOPMENT || !isEnabled(ENABLED_KEY)) {
    return;
  }

  const { capture, flush, setPagePathResolver } = useAnalyticsQueue();
  const resolvePagePath = (): string => getPagePath(router);

  setPagePathResolver(resolvePagePath);

  // Read on the page the visit lands on, also for a visitor whose events are not collected until they sign in:
  // by then the landing page, the referrer and the campaign are gone.
  getSession(resolvePagePath);

  // Watched, not read once: a sign-in in another tab replaces the user in place, without a reload.
  watch(
    () => {
      const identity = getCustomerIdentity(useUser());
      return identity ? `${identity.userId}|${identity.organizationId ?? ""}` : "";
    },
    (identityKey) => {
      if (startSessionFor(identityKey)) {
        capture(SESSION_START_EVENT);
      }
    },
    { immediate: true },
  );

  useAnalytics().addTracker({
    meta: { name: TRACKER_NAME },
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
