import { useScriptTag } from "@vueuse/core";
import { useCurrency } from "@/core/composables";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { IS_DEVELOPMENT } from "@/core/constants/environment";
import { useUser } from "@/shared/account";
// Analytics Beacon will be loaded as a script and available globally
import { MODULE_ID, GOOGLE_ANALYTICS_SETTINGS_MAPPING } from "./constants";
import {
  sendEvent as sendEventFunction,
  productToGtagItem as productToGtagItemFunction,
  lineItemToGtagItem as lineItemToGtagItemFunction,
} from "./utils";
import type { InitOptionsType } from "./types";

// Analytics Beacon global API
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    AnalyticsBeacon?: {
      version: string;
      init(config: {
        ga4MeasurementId: string;
        debug?: boolean;
        environment?: 'development' | 'staging' | 'production';
        currency?: string;
        businessType?: 'b2b' | 'b2c';
        respectDnt?: boolean;
        anonymizeIp?: boolean;
      }): Promise<void>;
      start(): void;
      stop(): void;
      destroy(): void;
      getStatus(): Record<string, unknown>;
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

// Analytics Beacon status tracking
let beaconInitialized = false;

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
    window.dataLayer?.push(arguments);
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

  // Initialize our new Analytics Beacon for automatic event detection
  await initModernAnalyticsBeacon(String(trackId));
}

/**
 * Initialize Analytics Beacon for automatic event detection
 */
async function initModernAnalyticsBeacon(trackingId: string): Promise<void> {
  if (beaconInitialized) {
    logDebug('[GA] Analytics Beacon already initialized');
    return;
  }

  try {
    logDebug('[GA] Loading Analytics Beacon script...');
    await loadAndInitializeBeacon(trackingId);
    beaconInitialized = true;
  } catch (error) {
    logError('[GA] Failed to initialize Analytics Beacon:', error);
    beaconInitialized = false;
  }
}

/**
 * Load script and initialize beacon
 */
async function loadAndInitializeBeacon(trackingId: string): Promise<void> {
  // Use development server in dev mode for live debugging
  const scriptUrl = IS_DEVELOPMENT
    ? 'http://localhost:8080/analytics-beacon.js'  // Served from dev server root
    : '/static/analytics-beacon.min.js';

  await loadAnalyticsBeaconScript(scriptUrl);

  if (!window.AnalyticsBeacon) {
    throw new Error('AnalyticsBeacon not available after script load');
  }

  logDebug('[GA] Initializing Analytics Beacon version:', window.AnalyticsBeacon.version);

  await window.AnalyticsBeacon.init({
    ga4MeasurementId: trackingId,
    debug: DEBUG_MODE,
    environment: IS_DEVELOPMENT ? 'development' : 'production',
    currency: currentCurrency.value.code,
    businessType: 'b2c',
    respectDnt: true,
    anonymizeIp: true
  });

  window.AnalyticsBeacon.start();
  logDebug('[GA] Analytics Beacon initialized successfully:', window.AnalyticsBeacon.getStatus());
}

/**
 * Load Analytics Beacon script dynamically
 */
function loadAnalyticsBeaconScript(scriptUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      logDebug('[GA] Analytics Beacon script loaded successfully');
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load Analytics Beacon script: ${scriptUrl}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Debug logging helper
 */
function logDebug(message: string, ...args: unknown[]): void {
  if (DEBUG_MODE) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
}

/**
 * Error logging helper
 */
function logError(message: string, ...args: unknown[]): void {
  if (DEBUG_MODE) {
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  }
}
