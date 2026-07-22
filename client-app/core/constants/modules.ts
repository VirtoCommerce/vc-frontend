export const MODULE_ID_PUSH_MESSAGES = "VirtoCommerce.PushMessages";
export const MODULE_ID_XRECOMMEND = "VirtoCommerce.XRecommend";
export const XRECOMMEND_ENABLED_KEY = "XRecommend.RecommendationsEnabled";

export const APP_INSIGHTS_MODULE_ID = "VirtoCommerce.ApplicationInsights";
export const APP_INSIGHTS_ENABLE_STATE = "ApplicationInsights.EnableTracking";
export const APP_INSIGHTS_INSTRUMENTATION_KEY = "ApplicationInsights.InstrumentationKey";

export const MODULE_XAPI_KEYS = {
  MODULE_ID: "VirtoCommerce.Xapi",
  SUPPORT_PHONE_NUMBER: "Frontend.SupportPhoneNumber",
  PAGE_TITLE_WITH_STORE_NAME: "Frontend.PageTitleWithStoreName",
  PAGE_TITLE_STORE_NAME_ALIGN: "Frontend.PageTitleStoreNameAlign",
  PAGE_TITLE_DIVIDER: "Frontend.PageTitleDivider",
  CATALOG_MENU_LINK_LIST_NAME: "Frontend.CatalogMenuLinkListName",
  CATALOG_EMPTY_CATEGORIES_ENABLED: "Frontend.CatalogEmptyCategoriesEnabled",
  CONTINUE_SHOPPING_LINK: "Frontend.ContinueShoppingLink",
} as const;

/**
 * Per-store brand identity, published as schema.org Organization / Open Graph data.
 * Registered by vc-module-x-frontend against the `Store` type, all public.
 */
export const MODULE_XFRONTEND_KEYS = {
  MODULE_ID: "VirtoCommerce.XFrontend",
  BRAND_PROFILE_DESCRIPTION: "XFrontend.BrandProfile.Description",
  BRAND_PROFILE_SAME_AS: "XFrontend.BrandProfile.SameAs",
  BRAND_PROFILE_TAGLINE: "XFrontend.BrandProfile.Tagline",
  BRAND_PROFILE_LOGO_URL: "XFrontend.BrandProfile.LogoUrl",
  BRAND_PROFILE_SHARE_IMAGE_URL: "XFrontend.BrandProfile.ShareImageUrl",
  BRAND_PROFILE_CONTACT_PHONE: "XFrontend.BrandProfile.ContactPhone",
  BRAND_PROFILE_FOUNDING_DATE: "XFrontend.BrandProfile.FoundingDate",
} as const;

export const MODULE_ID_SHIPPING = "VirtoCommerce.Shipping";
export const BOPIS_MAP_ENABLED_KEY = "Shipping.Bopis.GoogleMaps.Enabled";
export const BOPIS_MAP_API_KEY = "Shipping.Bopis.GoogleMaps.ApiKey";

export const MODULE_ID_XPICKUP = "VirtoCommerce.XPickup";
export const XPICKUP_ENABLED_KEY = "XPickup.Enabled";

export const MODULE_ID_VIRTOPAGES = "VirtoCommerce.Pages";
export const VIRTOPAGES_ENABLED_KEY = "VirtoPages.Enable";

export const INTENT_SEARCH_MODULE_ID = "VirtoCommerce.IntentSearch";
export const INTENT_SEARCH_ENABLED_KEY = "IntentSearch.Enabled";

export const LOYALTY_MODULE_ID = "VirtoCommerce.Loyalty";
export const LOYALTY_ENABLED_KEY = "Loyalty.Enable";
export const LOYALTY_MODE_KEY = "Loyalty.Mode";
export const LOYALTY_CURRENCY_KEY = "Loyalty.Currency";
export const LOYALTY_MISSIONS_ENABLED_KEY = "Loyalty.Missions.Enable";

export const MODULE_ID_MARKETING_EXPERIENCE_API = "VirtoCommerce.MarketingExperienceApi";
