import { computed } from "vue";
import { AppInsightsPlugin } from "vue3-application-insights";
import type { IThemeContext } from "../types";
import type { App, Plugin } from "vue";
import type { AppInsightsPluginOptions } from "vue3-application-insights";

export const applicationInsightsPlugin: Plugin = {
  install: (app: App, themeContext: IThemeContext) => {
    const MODULE_KEYS = {
      ID: "VirtoCommerce.ApplicationInsights",
      ENABLE_STATE: "ApplicationInsights.EnableTracking",
      INSTRUMENTATION_KEY: "ApplicationInsights.InstrumentationKey",
    };

    const moduleSettings = computed(() =>
      themeContext.storeSettings.modules?.find((module) => module.moduleId === MODULE_KEYS.ID),
    );
    const moduleEnabled = computed(
      () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.ENABLE_STATE)?.value,
    );
    const instrumentationKey = computed(
      () => moduleSettings.value?.settings?.find((item) => item.name === MODULE_KEYS.INSTRUMENTATION_KEY)?.value,
    );

    if (moduleEnabled.value && typeof instrumentationKey.value === "string" && instrumentationKey.value) {
      const options: AppInsightsPluginOptions = {
        appInsightsConfig: {
          config: {
            instrumentationKey: instrumentationKey.value,
          },
        },
        trackAppErrors: true,
        trackInitialPageView: true,
      };

      app.use(AppInsightsPlugin, options);
    }
  },
};
