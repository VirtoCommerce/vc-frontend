import { AppInsightsPlugin } from "vue3-application-insights";
import { useModuleSettings } from "../composables/useModuleSettings";
import {
  APP_INSIGHTS_ENABLE_STATE,
  APP_INSIGHTS_INSTRUMENTATION_KEY,
  APP_INSIGHTS_MODULE_ID,
} from "../constants/modules";
import type { App, Plugin } from "vue";
import type { Router } from "vue-router";
import type { AppInsightsPluginOptions, useAppInsights } from "vue3-application-insights";

export interface IApplicationInsightsPluginOptions {
  router?: Router;
}

let appInsightsInstance: ReturnType<typeof useAppInsights> | undefined;

/** For code outside component setup (e.g. Apollo links), where `useAppInsights` has nothing to inject from. */
export function getAppInsights(): ReturnType<typeof useAppInsights> | undefined {
  return appInsightsInstance;
}

export const applicationInsightsPlugin: Plugin<[IApplicationInsightsPluginOptions?]> = {
  install: (app: App, pluginOptions?: IApplicationInsightsPluginOptions) => {
    const { getSettingValue, isEnabled } = useModuleSettings(APP_INSIGHTS_MODULE_ID);

    if (isEnabled(APP_INSIGHTS_ENABLE_STATE)) {
      const instrumentationKey = getSettingValue(APP_INSIGHTS_INSTRUMENTATION_KEY) as string;

      if (instrumentationKey) {
        const options: AppInsightsPluginOptions = {
          appInsightsConfig: {
            config: {
              instrumentationKey,
            },
          },
          router: pluginOptions?.router,
          trackAppErrors: true,
          trackInitialPageView: true,
          onLoaded: (instance) => {
            appInsightsInstance = instance;
          },
        };

        app.use(AppInsightsPlugin, options);
      }
    }
  },
};
