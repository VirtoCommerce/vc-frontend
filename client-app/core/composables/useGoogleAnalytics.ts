import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables/useCurrency";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { globals } from "../globals";

const MODULE_ID = "VirtoCommerce.GoogleEcommerceAnalytics";
const IS_ENABLED_KEY = "GoogleAnalytics4.EnableTracking";

const { getModuleSettings, hasModuleSettings, isEnabled } = useModuleSettings(MODULE_ID);

const { currentCurrency } = useCurrency();
const { currencyCode } = globals;

type GoogleAnalyticsMethodsType = ReturnType<
  typeof import("@virto-commerce/front-modules-google-ecommerce-analytics").useGoogleAnalyticsModule
>;
let googleAnalyticsMethods: Omit<GoogleAnalyticsMethodsType, "initModule">;

export function useGoogleAnalytics() {
  async function init(): Promise<void> {
    if (hasModuleSettings && isEnabled(IS_ENABLED_KEY)) {
      try {
        const { useGoogleAnalyticsModule } = await import("@virto-commerce/front-modules-google-ecommerce-analytics");
        const { initModule, ...methods } = useGoogleAnalyticsModule();

        initModule({
          getModuleSettings,
          isDevelopment: IS_DEVELOPMENT,
          logger: Logger,
          useScriptTag,
          currentCurrency,
          currencyCode,
        });
        googleAnalyticsMethods = methods;
      } catch (e) {
        Logger.error(useGoogleAnalytics.name, e);
      }
    }
  }

  return {
    init,
    ...googleAnalyticsMethods,
  };
}
