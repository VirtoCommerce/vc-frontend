import { useScriptTag } from "@vueuse/core";
import { watch } from "vue";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants";
import { globals } from "@/core/globals";
import { useUser } from "@/shared/account";
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";
import { buildUserProperties, userPropertiesKey } from "./user-properties";
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
  const { trackId, isEnabled, gtmContainerId } = getModuleSettings(GOOGLE_ANALYTICS_SETTINGS_MAPPING);

  if (!canUseDOM || !hasModuleSettings || !isEnabled || IS_DEVELOPMENT) {
    return;
  }

  // Initialize dataLayer for GTM/GA4
  window.dataLayer = window.dataLayer || [];

  window.gtag = function gtag() {
    // is not working with rest
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Initialize GTM if GTMContainerId is provided (loaded before GA4)
  if (gtmContainerId) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

    // Inject GTM head script
    useScriptTag(`https://www.googletagmanager.com/gtm.js?id=${gtmContainerId}`);
  }

  const usesDataLayerVariables = Boolean(gtmContainerId);

  // Before the `config` call below, not after: properties set afterwards miss the initial page_view, and
  // GA never backfills an event that went out untagged.
  applyUserProperties(usesDataLayerVariables);

  // Login, organization switch and impersonation all end in a full navigation, so this looks redundant —
  // but `setUser` also replaces the user in place when another tab signs in (userReloadEvent -> fetchUser),
  // and a one-shot read would keep tagging every later event with the previous identity.
  watch(userPropertiesKey, () => applyUserProperties(usesDataLayerVariables));

  // Register analytics event tracker (works for both GTM-only and GA4)
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

  // Initialize GA4 if trackId is provided
  if (trackId) {
    useScriptTag(`https://www.googletagmanager.com/gtag/js?id=${trackId}`);

    const config = {
      debugMode: DEBUG_MODE,
      currency: currentCurrency.value.code,
      user_id: isAuthenticated.value ? user.value.id : undefined,
      language: globals.cultureName,
      ...extendConfig,
    };

    window.gtag("js", new Date());

    if (extendSet) {
      window.gtag("set", extendSet);
    }

    window.gtag("config", String(trackId), config);
  }
}

/**
 * Tags every subsequent event with the customer identity, so GA4 reports can be filtered down to one
 * account — `user_id` alone cannot, it is the User-ID feature and not a reportable dimension.
 *
 * Called unconditionally, including for an anonymous visitor: the payload always carries every property,
 * and skipping the call would leave the previous identity in place instead of clearing it.
 */
function applyUserProperties(pushToDataLayer: boolean): void {
  const userProperties = buildUserProperties();

  window.gtag("set", "user_properties", userProperties);

  // GTM reads the data layer, not gtag's internal state, and a GTM-only store configures no measurement id
  // — so without this it never reaches the `config` branch and never sees the identity at all.
  if (pushToDataLayer) {
    window.dataLayer.push({ ...userProperties });
  }
}
