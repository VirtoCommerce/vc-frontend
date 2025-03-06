import { createGlobalState } from "@vueuse/core";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities/logger";
import type { AnalyticsEventNameType, AnalyticsEventMapType, TrackerType } from "@/core/types/analytics";

function _useAnalytics() {
  const trackers: Set<TrackerType> = new Set();

  function addTracker(tracker: TrackerType): void {
    trackers.add(tracker);
  }

  function analytics<E extends AnalyticsEventNameType>(event: E, ...args: AnalyticsEventMapType[E]): void {
    if (IS_DEVELOPMENT) {
      Logger.debug("useAnalytics, can't track event in development mode");
      return;
    }
    trackers.forEach((tracker) => {
      const handler = tracker.events[event];
      if (handler) {
        try {
          void handler(...args);
        } catch (error) {
          Logger.error(`useAnalytics, error calling event: "${event}" in tracker ${tracker.meta?.name}.`, error);
        }
      } else {
        Logger.warn(`useAnalytics, unsupported event: "${event}" in tracker ${tracker.meta?.name}.`);
      }
    });
  }

  return {
    addTracker,
    analytics,
  };
}

export const useAnalytics = createGlobalState(_useAnalytics);
