import { AppInsightsPlugin } from "vue3-application-insights";
import { useModuleSettings } from "../composables/useModuleSettings";
import {
  APP_INSIGHTS_ENABlE_STATE,
  APP_INSIGHTS_INSTRUMENTATION_KEY,
  APP_INSIGHTS_MODULE_ID,
} from "../constants/modules";
import type { App, Plugin } from "vue";
import type { AppInsightsPluginOptions } from "vue3-application-insights";

export const applicationInsightsPlugin: Plugin = {
  install: (app: App) => {
    const { getSettingValue, isEnabled } = useModuleSettings(APP_INSIGHTS_MODULE_ID);

    if (isEnabled(APP_INSIGHTS_ENABlE_STATE)) {
      const instrumentationKey = getSettingValue(APP_INSIGHTS_INSTRUMENTATION_KEY) as string;

      if (instrumentationKey) {
        const options: AppInsightsPluginOptions = {
          appInsightsConfig: {
            config: {
              instrumentationKey,
            },
          },
          trackAppErrors: true,
          trackInitialPageView: true,
        };

        app.use(AppInsightsPlugin, options);
      }
    }
  },
};
