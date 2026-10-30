import { watch } from "vue";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { canUseDOM } from "@/core/utilities/analytics/environment";
import { lineItemToAnalyticsItem, productToAnalyticsItem } from "@/core/utilities/analytics/items";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { useUser } from "@/shared/account";
import { capture, flushPendingCaptures, markUnavailable, setClient } from "./client";
import { DEBUG_PREFIX, DEFAULT_API_HOST, MODULE_ID, POSTHOG_SETTINGS_MAPPING, TRACKER_NAME } from "./constants";
import { events } from "./events";
import { applyIdentity, identityKey } from "./identity";
import { trackPageViews } from "./page-views";
import { sendPendingLogin } from "./pending-login";
import type { InitOptionsType } from "./types";
import type { PostHog } from "posthog-js";
import type { Router } from "vue-router";

export async function init(router: Router, { extendEvents }: InitOptionsType = {}): Promise<void> {
  const { getModuleSettings, hasModuleSettings } = useModuleSettings(MODULE_ID);
  const { isEnabled, projectToken, apiHost, isAutocaptureEnabled, isSessionRecordingEnabled } =
    getModuleSettings(POSTHOG_SETTINGS_MAPPING);

  if (!canUseDOM || !hasModuleSettings.value || isEnabled !== true || !projectToken || IS_DEVELOPMENT) {
    return;
  }

  // The SDK chunk is the slow part. The tracker and the router hook go up before it lands — captures are kept in
  // `client` until then — so events and page views of the first render are not lost on a direct page load.
  const sdkPromise: Promise<PostHog | undefined> = import("posthog-js")
    .then((sdk) => sdk.default)
    .catch((e: unknown) => {
      ignoreChunkLoadFailure(e);
      Logger.error(DEBUG_PREFIX, "SDK load failed", e);
      return undefined;
    });

  const { addTracker } = useAnalytics();
  addTracker({
    meta: {
      name: TRACKER_NAME,
    },
    events: {
      ...events,
      ...extendEvents?.({ capture, productToAnalyticsItem, lineItemToAnalyticsItem }),
    },
  });

  trackPageViews(router);

  const posthog = await sdkPromise;
  if (!posthog) {
    markUnavailable();
    return;
  }

  posthog.init(String(projectToken), {
    api_host: typeof apiHost === "string" && apiHost ? apiHost : DEFAULT_API_HOST,
    autocapture: isAutocaptureEnabled === true,
    // Page views are sent by the router hook, once the route is resolved. Page leaves stay on: the SDK ties their
    // default to its own page-view capture, and Web Analytics builds duration and bounce rate on them.
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    // Anonymous visitors cost no person profile; one is created by `identify` on sign-in.
    person_profiles: "identified_only",
    disable_session_recording: isSessionRecordingEnabled !== true,
  });
  setClient(posthog);

  // TODO(VCST-6629): a consent gate — `opt_out_capturing()` until the visitor agrees — once the theme has one.

  // Immediate, so the first page view and a pending login go out under this page's identity. Watched after that:
  // `setUser` replaces the user in place when another tab signs in.
  watch(identityKey, applyIdentity, { immediate: true });
  flushPendingCaptures();

  // Last, after the identity above: the new user's, when this is the page a sign-in landed on.
  const { isAuthenticated } = useUser();
  sendPendingLogin(isAuthenticated.value);
}
