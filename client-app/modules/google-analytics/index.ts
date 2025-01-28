import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";
import { sendEvent } from "./utils";
import type { TrackerEventsType } from "@/core/types/analytics";

const { currentCurrency } = useCurrency();

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
const TRACKER_NAME = "google-analytics";
type ExtendEventsType = (sendEventFunction: typeof sendEvent) => TrackerEventsType;

export async function init({ extendEvents }: { extendEvents?: ExtendEventsType } = {}): Promise<void> {
  const { getModuleSettings, hasModuleSettings } = useModuleSettings(MODULE_ID);
  const { trackId, isEnabled } = getModuleSettings(GOOGLE_ANALYTICS_SETTINGS_MAPPING);

  if (!canUseDOM || !trackId || !hasModuleSettings || !isEnabled || IS_DEVELOPMENT) {
    return;
  }
  useScriptTag(`https://www.googletagmanager.com/gtag/js?id=${trackId}`);
  const { addTracker } = useAnalytics();
  const { events } = await import("./events");
  addTracker({
    meta: {
      name: TRACKER_NAME,
    },
    events: {
      ...events,
      ...extendEvents?.(sendEvent),
    },
  });
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
