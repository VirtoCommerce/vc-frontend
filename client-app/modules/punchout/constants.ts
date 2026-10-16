export const MODULE_ID = "VirtoCommerce.Punchout";
export const ENABLED_KEY = "Punchout.Enabled";
export const PUNCHOUT_SESSION_STORAGE_KEY = "punchoutSession";
export const PUNCHOUT_MODE_LABEL_ID = "punchout-mode-label";
export const PUNCHOUT_GRANT_TYPE = "punchout";

// The procurement system collects these itself. To be read from the module settings once a store needs one of them.
export const PUNCHOUT_CHECKOUT_SECTIONS = {
  shipping: false,
  payment: false,
  comment: false,
} as const;
