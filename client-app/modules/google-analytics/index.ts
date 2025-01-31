import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { useUser } from "@/shared/account";
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";
import {
  sendEvent as sendEventFunction,
  productToGtagItem as productToGtagItemFunction,
  lineItemToGtagItem as lineItemToGtagItemFunction,
} from "./utils";
import type { InitOptionsType } from "./types";

const DEBUG_MODE = true;
const { currentCurrency } = useCurrency();
const { isAuthenticated, user } = useUser();

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
const TRACKER_NAME = "google-analytics";

export async function init({ extendEvents, extendConfig, extendSet }: InitOptionsType = {}): Promise<void> {
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
      ...extendEvents?.({
        sendEvent: sendEventFunction,
        productToGtagItem: productToGtagItemFunction,
        lineItemToGtagItem: lineItemToGtagItemFunction,
      }),
    },
  });
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // is not working with rest
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  const config = {
    debugMode: DEBUG_MODE,
    currency: currentCurrency.value.code,
    user_id: isAuthenticated ? user.value.id : undefined,
    ...extendConfig,
  };

  window.gtag("js", new Date());

  if (extendSet) {
    window.gtag("set", extendSet);
  }

  window.gtag("config", String(trackId), config);
}
