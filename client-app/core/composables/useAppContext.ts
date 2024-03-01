import type { IAppContext } from "../types";

export function useAppContext(): IAppContext {
  // todo replace with store query
  return {
    storeSettings: {
      anonymousAccessEnabled: true,
      googleAnalyticsEnabled: true,
    },
  };
}
