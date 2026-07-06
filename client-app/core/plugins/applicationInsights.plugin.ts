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

const DEFAULT_READY_TIMEOUT_MS = 10_000;

// Settles once the readiness of AppInsights is known: with the instance when the SDK's
// onLoaded fires, or with undefined when install() finds AppInsights is not configured
// for the store. Boot-time services (e.g. the federated module loader) start BEFORE this
// plugin installs, and even after install the SDK's onLoaded fires asynchronously later -
// so a bare synchronous read of the instance would almost always be undefined at boot.
let resolveReady: (instance: ApplicationInsightsType | undefined) => void = () => {};
const readyPromise = new Promise<ApplicationInsightsType | undefined>((resolve) => {
  resolveReady = resolve;
});

/**
 * Serves non-component code that runs at boot, before the SDK has loaded (e.g. the
 * federated module loader) - the library's own useAppInsights() is inject()-based and
 * works only inside component setup. Resolves with the instance once it loads, or with
 * undefined when AppInsights is not configured for the store or does not load within
 * `timeoutMs` - telemetry stays best-effort and never hangs the caller.
 */
export async function getAppInsightsWhenReady(
  timeoutMs = DEFAULT_READY_TIMEOUT_MS,
): Promise<ApplicationInsightsType | undefined> {
  if (appInsightsInstance) {
    return appInsightsInstance;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => resolve(undefined), timeoutMs);
  });
  try {
    return await Promise.race([readyPromise, timeout]);
  } finally {
    clearTimeout(timer);
  }
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
            resolveReady(appInsights);
          },
        };

        app.use(AppInsightsPlugin, options);
        return;
      }
    }

    // Not configured for this store: unblock awaiting callers immediately.
    resolveReady(undefined);
  },
};
