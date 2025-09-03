/**
 * Analytics Beacon Integration for VirtoCommerce Frontend
 *
 * This plugin provides a Vue.js wrapper for the Analytics Beacon global API.
 * The beacon is now loaded as a pure JavaScript file (like Google Analytics).
 */

import type { App } from 'vue';

// Analytics Beacon global API is defined in the Google Analytics module

// Track initialization status
let isBeaconInitialized = false;

export interface IAnalyticsBeaconOptions {
  ga4MeasurementId: string;
  debug?: boolean;
  environment?: 'development' | 'staging' | 'production';
  currency?: string;
  businessType?: 'b2b' | 'b2c';

  // Enhanced content detection
  customContentDetectors?: {
    product?: () => boolean;
    category?: () => boolean;
    searchResults?: () => boolean;
  };

  // SPA timing options
  enablePolling?: boolean;
  pollingInterval?: number;
  enableInputTracking?: boolean;

  // Privacy settings
  respectDnt?: boolean;
  anonymizeIp?: boolean;
}

/**
 * Vue plugin to install the Analytics Beacon
 *
 * NOTE: The beacon is now integrated through the Google Analytics module.
 * This plugin is kept for backward compatibility and manual initialization.
 */
const analyticsBeaconPlugin = {
  install(app: App, options: IAnalyticsBeaconOptions) {
    if (!options.ga4MeasurementId) {
      // eslint-disable-next-line no-console
      console.error('[Analytics Beacon] GA4 Measurement ID is required');
      return;
    }

    // Add global properties for manual tracking
    app.config.globalProperties.$analyticsBeacon = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      getStatus: () => (window.AnalyticsBeacon as any)?.getStatus() || null,
      isReady: () => !!window.AnalyticsBeacon,
      initialize: () => initializeAnalyticsBeacon(options)
    };
  }
};

// Export as named export instead of default
export { analyticsBeaconPlugin };

// Remove unused function as it's now handled by the main function below

/**
 * Load Analytics Beacon script dynamically
 */
function loadBeaconScript(isDevelopment = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = isDevelopment
      ? 'http://localhost:8080/analytics-beacon.js'  // Development server for live debugging
      : '/static/analytics-beacon.min.js'; // Production minified version
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Analytics Beacon script: ${script.src}`));

    document.head.appendChild(script);
  });
}

/**
 * Standalone initialization function for non-Vue environments
 */
export async function initializeAnalyticsBeacon(options: IAnalyticsBeaconOptions): Promise<boolean> {
  if (!options.ga4MeasurementId) {
    // eslint-disable-next-line no-console
    console.error('[Analytics Beacon] GA4 Measurement ID is required');
    return false;
  }

  if (isBeaconInitialized) {
    return true;
  }

  try {
    // Load the beacon script if not already loaded
    if (!window.AnalyticsBeacon) {
      await loadBeaconScript(options.environment === 'development');
    }

    if (!window.AnalyticsBeacon) {
      throw new Error('Analytics Beacon script failed to load');
    }

    // Initialize the beacon with VirtoCommerce-specific config
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    await (window.AnalyticsBeacon as any).init({
      ga4MeasurementId: options.ga4MeasurementId,
      debug: options.debug ?? (options.environment !== 'production'),
      environment: options.environment || 'development',
      currency: options.currency || 'USD',
      businessType: options.businessType || 'b2c',

      // Content detection - use custom if provided, otherwise default VirtoCommerce
      customContentDetectors: options.customContentDetectors || {
        searchResults: () => document.querySelector('[data-name="search-results"]') != null,
        category: () => document.querySelector('[data-name="category-page"]') != null,
        product: () => document.querySelector('[data-name="product-details"]') != null
      },

      // SPA timing options - use provided values or sensible defaults
      enablePolling: options.enablePolling ?? true,
      pollingInterval: options.pollingInterval ?? 500,
      enableInputTracking: options.enableInputTracking ?? true,

      // Privacy settings
      respectDnt: options.respectDnt,
      anonymizeIp: options.anonymizeIp
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window.AnalyticsBeacon as any).start();
    isBeaconInitialized = true;
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Analytics Beacon] Failed to initialize:', error);
    return false;
  }
}
