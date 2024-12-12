import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";

const { currentCurrency } = useCurrency();

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);

export async function init(): Promise<void> {
  const { getModuleSettings, hasModuleSettings } = useModuleSettings(MODULE_ID);
  const { trackId, isEnabled } = getModuleSettings(GOOGLE_ANALYTICS_SETTINGS_MAPPING);

  if (!canUseDOM || !trackId || !hasModuleSettings || !isEnabled || IS_DEVELOPMENT) {
    return;
  }
  const { addTracker } = useAnalytics();
  const tracker = await import("./events");
  addTracker(tracker.analytics);
  useScriptTag(`https://www.googletagmanager.com/gtag/js?id=${trackId}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // is not working with rest
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", String(trackId), { debug_mode: true });
  window.gtag("set", { currency: currentCurrency.value.code });
}
