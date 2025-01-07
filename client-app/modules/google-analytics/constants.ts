export const DEBUG_PREFIX = "[GA]";

export const MODULE_ID = "VirtoCommerce.GoogleEcommerceAnalytics";

export const GOOGLE_ANALYTICS_SETTINGS_MAPPING = {
  "GoogleAnalytics4.MeasurementId": "trackId",
  "GoogleAnalytics4.EnableTracking": "isEnabled",
} as const;

export const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
