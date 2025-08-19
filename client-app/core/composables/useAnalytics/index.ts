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
    // Check if any tracker allows debug mode in development
    const hasDebugEnabledTracker = Array.from(trackers).some(tracker =>
      tracker.meta?.allowDebugInDevelopment === true
    );

    if (IS_DEVELOPMENT && !hasDebugEnabledTracker) {
      Logger.debug("useAnalytics, can't track event in development mode");
      return;
    }

    trackers.forEach((tracker) => {
      const handler = tracker.events[event];
      if (handler) {
        try {
          const result = handler(...args);
          if (result && typeof result.catch === 'function') {
            result.catch((error: unknown) => {
              Logger.error(`useAnalytics, async error in event: "${event}" in tracker ${tracker.meta?.name}.`, error);
            });
          }
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
