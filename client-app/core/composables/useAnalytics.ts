import { createGlobalState } from "@vueuse/core";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { AnalyticsEventNameType, IAnalyticsEventMap, TackerType } from "../types/analytics";

function _useAnalytics() {
  const trackers: Set<TackerType> = new Set();

  function addTracker(tracker: TackerType): void {
    trackers.add(tracker);
  }

  function analytics<E extends AnalyticsEventNameType>(event: E, ...args: IAnalyticsEventMap[E]): void {
    if (IS_DEVELOPMENT) {
      Logger.debug("useAnalytics, can't track event in development mode");
      return;
    }
    trackers.forEach((tracker) => {
      const handler = tracker[event];
      if (handler) {
        try {
          handler(...args);
        } catch (error) {
          Logger.error(`useAnalytics, error calling event: "${event}" in tracker.`, error);
        }
      } else {
        Logger.warn(`useAnalytics, unsupported event: "${event}" in tracker.`);
      }
    });
  }

  return {
    addTracker,
    analytics,
  };
}

export const useAnalytics = createGlobalState(_useAnalytics);
