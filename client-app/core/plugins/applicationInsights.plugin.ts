import { AppInsightsPlugin } from "vue3-application-insights";
import { useModuleSettings } from "../composables/useModuleSettings";
import {
  APP_INSIGHTS_ENABLE_STATE,
  APP_INSIGHTS_INSTRUMENTATION_KEY,
  APP_INSIGHTS_MODULE_ID,
} from "../constants/modules";
import type { App, Plugin } from "vue";
import type { Router } from "vue-router";
import type { AppInsightsPluginOptions } from "vue3-application-insights";

export interface IApplicationInsightsPluginOptions {
  router?: Router;
}

// The ApplicationInsights instance type, derived from the plugin's options so we don't
// depend on @microsoft/applicationinsights-web directly (it is a transitive dep).
export type ApplicationInsightsType = Parameters<NonNullable<AppInsightsPluginOptions["onLoaded"]>>[0];

let appInsightsInstance: ApplicationInsightsType | undefined;

/**
 * The library's own useAppInsights() is inject()-based and works only inside component
 * setup. This getter serves non-component code (boot-time services like the federated
 * module loader). Undefined until the plugin loads, or when AppInsights is not
 * configured for the store - callers must treat tracking as best-effort.
 */
export function getAppInsights(): ApplicationInsightsType | undefined {
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
          onLoaded: (appInsights) => {
            appInsightsInstance = appInsights;
          },
        };

        app.use(AppInsightsPlugin, options);
      }
    }
  },
};
