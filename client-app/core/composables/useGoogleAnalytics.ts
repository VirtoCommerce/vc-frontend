import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables/useCurrency";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";

const MODULE_ID = "VirtoCommerce.GoogleEcommerceAnalytics";
const IS_ENABLED_KEY = "GoogleAnalytics4.EnableTracking";

const { getModuleSettings, hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID);

const { currentCurrency } = useCurrency();
const { currencyCode } = globals;

type GoogleAnalyticsMethodsType = Omit<
  ReturnType<typeof import("@virto-commerce/front-modules-google-ecommerce-analytics").useGoogleAnalyticsModule>,
  "initModule"
>;
type MethodNamesType = keyof GoogleAnalyticsMethodsType;
type MethodArgsType = unknown[];
type MethodQueueEntryType = {
  method: MethodNamesType;
  args: MethodArgsType;
};

// needs to queue methods until the module is initialized
const methodsQueue: Array<MethodQueueEntryType> = [];

let googleAnalyticsMethods: GoogleAnalyticsMethodsType = new Proxy({} as GoogleAnalyticsMethodsType, {
  get(target, prop) {
    if (prop !== "init") {
      return (...args: MethodArgsType) => {
        methodsQueue.push({ method: prop as MethodNamesType, args });
      };
    }
    return Reflect.get(target, prop) as { init: () => Promise<void> };
  },
});

export function useGoogleAnalytics() {
  async function init(): Promise<void> {
    if (hasModuleSettings && isEnabled(IS_ENABLED_KEY)) {
      try {
        const module = await import("../../../../vc-module-front-google-ecommerce-analytics/dist");
        const { useGoogleAnalyticsModule } = module.default || module;
        const { initModule, ...methods } = useGoogleAnalyticsModule();

        initModule({
          getModuleSettings,
          isDevelopment: false,
          logger: Logger,
          useScriptTag,
          currentCurrency,
          currencyCode,
        });
        googleAnalyticsMethods = methods;
        // it there are any methods in the queue, execute them, then clear the queue
        if (methodsQueue.length) {
          methodsQueue.forEach(({ method, args }) => {
            (googleAnalyticsMethods[method] as (...args: MethodArgsType) => void)(...args);
          });
          methodsQueue.length = 0;
        }
      } catch (e) {
        Logger.error(useGoogleAnalytics.name, e);
      }
    }
  }

  return Object.assign(googleAnalyticsMethods, { init });
}
