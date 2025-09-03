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
        customContentDetectors?: {
          product?: () => boolean;
          category?: () => boolean;
          searchResults?: () => boolean;
        };
        enablePolling?: boolean;
        pollingInterval?: number;
        enableInputTracking?: boolean;
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
const DEBUG_MODE = false;
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

    // Ensure clean initialization with VirtoCommerce-specific configuration
  try {
    // Reinitialize to apply VirtoCommerce content detection configuration
    window.AnalyticsBeacon.destroy();
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch {
    logDebug('[GA] Initializing fresh beacon instance');
  }
  await window.AnalyticsBeacon.init({
    ga4MeasurementId: trackingId,
    debug: DEBUG_MODE,
    environment: IS_DEVELOPMENT ? 'development' : 'production',
    currency: currentCurrency.value.code,
    businessType: 'b2c',
    respectDnt: true,
    anonymizeIp: true,

    // VirtoCommerce-specific content detection for accurate page type identification
    customContentDetectors: {
            searchResults: () => {
        // Only detect actual search results pages, not pages with search UI elements
        const searchResults = document.querySelector('[data-name="search-results"]');
        const searchPage = document.querySelector('[data-name="search-page"]');

                // Additional verification: check for search term in URL or search containers with data
        const hasSearchTerm = window.location.search.includes('q=') ||
                             window.location.search.includes('search=') ||
                             window.location.pathname.includes('/search');
        const hasSearchContainer = document.querySelector('[data-search-term], [data-total-results]') != null;

        // Must have either explicit search containers OR URL search pattern + search UI
        const result = searchResults != null ||
                      searchPage != null ||
                      (hasSearchTerm && hasSearchContainer);

        if (result) {
          logDebug('✅ [FRONTEND DETECTOR] Search results detected:', {
            searchResults: !!searchResults,
            searchPage: !!searchPage,
            hasSearchTerm,
            hasSearchContainer,
            documentState: document.readyState
          });
        }

        return result;
      },
                  category: () => {
        // Primary VirtoCommerce category indicators
        const categoryPage = document.querySelector('[data-name="category-page"]');
        const catalogPage = document.querySelector('[data-name="catalog-page"]');
        const productsList = document.querySelector('[data-name="products-list"]');
        const productCards = document.querySelectorAll('[data-name="product-card"]');

        // Check for primary indicators first
        let result = categoryPage != null ||
                    catalogPage != null ||
                    productsList != null ||
                    (productCards.length > 1);

                // If no primary indicators, check for alternative patterns
        if (!result) {
          // Check for products with data attributes (alternative VirtoCommerce pattern)
          const productElements = document.querySelectorAll('[data-product], [class*="product-card"], [class*="product-item"]');
          const categoryElements = document.querySelectorAll('[class*="category"], [class*="catalog"]');
          const hasContentStructure = document.querySelector('main, .main-content, .content') != null;
          const hasHeading = document.querySelector('h1') != null;

          // Check if this is likely a category page based on URL pattern
          const categoryURLPattern = /\/([\w-]+)$/.test(window.location.pathname) &&
                                     !window.location.pathname.includes('/search') &&
                                     !window.location.pathname.includes('/product/') &&
                                     window.location.pathname !== '/';

          // Enhanced detection: looks like category if has products + structure + category URL, and definitely not search
          const hasProducts = productElements.length > 1 || productCards.length > 1;
          const notSearchPage = !window.location.search.includes('q=') &&
                               !window.location.pathname.includes('/search') &&
                               !document.querySelector('[data-name="search-page"], [data-name="search-results"]');

          result = hasProducts &&
                   (hasContentStructure || categoryElements.length > 0) &&
                   hasHeading &&
                   categoryURLPattern &&
                   notSearchPage;
        }

        // Only log when detection succeeds to reduce noise
        if (result) {
          const usedAlternative = !categoryPage && !catalogPage && !productsList && productCards.length <= 1;
          logDebug('✅ [FRONTEND DETECTOR] Category detected:', {
            primaryIndicators: !!(categoryPage || catalogPage || productsList),
            productCards: productCards.length,
            alternativeElements: document.querySelectorAll('[data-product], [class*="product"]').length,
            usedAlternativeDetection: usedAlternative,
            urlMatches: /\/([\w-]+)$/.test(window.location.pathname),
            documentState: document.readyState
          });
        }

        return result;
      },
      product: () => document.querySelector('[data-name="product-details"]') != null
    },

    // SPA support for dynamic content loading
    enablePolling: true,
    pollingInterval: 500,
    enableInputTracking: true
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
