import { createGlobalState } from "@vueuse/core";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import type { AnalyticsEventNameType, IAnalyticsEventMap, TackerType } from "../types/analytics";

function _useAnalytics() {
  const trackers: TackerType[] = [];

  function addTracker(tracker: TackerType): void {
    trackers.push(tracker);
  }

  function analytics<E extends AnalyticsEventNameType>(event: E, ...args: IAnalyticsEventMap[E]): void {
    if (IS_DEVELOPMENT) {
      Logger.debug(`${useAnalytics.name}, can't track event in development mode`);
      return;
    }
    trackers.forEach((tracker) => {
      const handler = tracker[event];
      if (handler) {
        handler(...args);
      } else {
        Logger.warn(`${useAnalytics.name}, unsupported event: "${event}" in tracker.`);
      }
    });
  }

  return {
    addTracker,
    analytics,
  };
}

export const useAnalytics = createGlobalState(_useAnalytics);
