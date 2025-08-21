import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants/environment";
import { useUser } from "@/shared/account";
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";
import {
  sendEvent as sendEventFunction,
  productToGtagItem as productToGtagItemFunction,
  lineItemToGtagItem as lineItemToGtagItemFunction,
} from "./utils";
import type { InitOptionsType } from "./types";

// Analytics Beacon Integration
declare global {
  interface IWindow extends Window {
    AnalyticsBeacon?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

// Set to true to enable analytics events in development mode
// Set to false to only send events in production
const DEBUG_MODE = true;
const { currentCurrency } = useCurrency();
const { isAuthenticated, user } = useUser();

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
const TRACKER_NAME = "google-analytics";

export async function init({ extendEvents, extendConfig, extendSet }: InitOptionsType = {}): Promise<void> {
  const { getModuleSettings, hasModuleSettings } = useModuleSettings(MODULE_ID);
  const { trackId, isEnabled } = getModuleSettings(GOOGLE_ANALYTICS_SETTINGS_MAPPING);

  if (!canUseDOM || !trackId || !hasModuleSettings || !isEnabled) {
    return;
  }
  useScriptTag(`https://www.googletagmanager.com/gtag/js?id=${trackId}`);
  const { addTracker } = useAnalytics();
  const { events } = await import("./events");
  addTracker({
    meta: {
      name: TRACKER_NAME,
      allowDebugInDevelopment: DEBUG_MODE,
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
    debug_mode: DEBUG_MODE,
    currency: currentCurrency.value.code,
    user_id: isAuthenticated.value ? user.value.id : undefined,
    ...extendConfig,
  };

  window.gtag("js", new Date());

  if (extendSet) {
    window.gtag("set", extendSet);
  }

  window.gtag("config", String(trackId), config);

  // Initialize Analytics Beacon for automatic event detection
  initAnalyticsBeacon(String(trackId));
}

/**
 * Initialize the Analytics Beacon for automatic event detection
 */
function initAnalyticsBeacon(trackingId: string): void {
  // Use development version in dev mode for live debugging
  const scriptPath = IS_DEVELOPMENT
    ? "http://localhost:8080/dist/analytics-beacon.js"
    : "/static/analytics-beacon.min.js";

  if (DEBUG_MODE) {
    // eslint-disable-next-line no-console
    console.log(`[GA] Loading Analytics Beacon from: ${scriptPath}`);
  }

  // Load the analytics beacon script
  useScriptTag(scriptPath, () => {
    // Script loaded, initialize the beacon
    const windowWithBeacon = window as IWindow;

    if (windowWithBeacon.AnalyticsBeacon) {
      windowWithBeacon.AnalyticsBeacon.init({
        trackingId: trackingId,
        debug: DEBUG_MODE,
        confidenceThreshold: 0.7,

        // VirtoCommerce-specific selectors
        selectors: {
          search: {
            forms: ['.search-form', 'form[action*="search"]'],
            inputs: ['input[type="search"]', 'input[name="q"]', '.search-input'],
            results: ['.search-results', '.product-list'],
            resultItems: ['.product-card', '.product-item']
          },
          products: {
            cards: ['.product-card', '.product-item', '.product-tile'],
            details: ['.product-details', '.product-info'],
            names: ['.product-name', '.product-title', 'h1'],
            prices: ['.price', '.product-price', '.price-current'],
            links: ['a[href*="/product"]', '.product-link']
          },
          cart: {
            addButtons: ['.add-to-cart', '.btn-add-cart', 'button:contains("Add to Cart")'],
            removeButtons: ['.remove-item', '.cart-remove'],
            clearButtons: ['.clear-cart'],
            cartPage: ['.cart-page', '.shopping-cart']
          },
          checkout: {
            beginButtons: ['.checkout-btn', 'button:contains("Checkout")'],
            steps: ['.checkout-step'],
            forms: ['.checkout-form']
          }
        },

        // Privacy settings
        respectDoNotTrack: true,
        anonymizeIp: true,
        cookieConsent: false,

        // Rate limiting
        maxEventsPerMinute: 100
      });

      if (DEBUG_MODE) {
        // eslint-disable-next-line no-console
        console.log('[GA] Analytics Beacon initialized successfully');
      }
    } else if (DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.warn('[GA] Analytics Beacon not available after script load');
    }
  }, { defer: true });
}
