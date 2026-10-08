export enum CartValidationErrors {
  ALL_LINE_ITEMS_UNSELECTED = "ALL_LINE_ITEMS_UNSELECTED",
  LOYALTY_INSUFFICIENT_BALANCE = "LOYALTY_INSUFFICIENT_BALANCE",
  LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED = "LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED",
  LOYALTY_PAYMENT_METHOD_NOT_ALLOWED = "LOYALTY_PAYMENT_METHOD_NOT_ALLOWED",
  PRODUCT_QTY_CHANGED = "PRODUCT_QTY_CHANGED",
  PRODUCT_MIN_QTY = "PRODUCT_MIN_QTY",
  PRODUCT_MAX_QTY = "PRODUCT_MAX_QTY",
  PRODUCT_MIN_MAX_QTY = "PRODUCT_MIN_MAX_QTY",
  PRODUCT_EXACT_QTY = "PRODUCT_EXACT_QTY",
  PRODUCT_MIN_QTY_NOT_AVAILABLE = "PRODUCT_MIN_QTY_NOT_AVAILABLE",
  PRODUCT_PACK_SIZE_LIMIT = "PRODUCT_PACK_SIZE_LIMIT",
  LINE_ITEM_LIMIT = "LINE_ITEM_LIMIT",
}

export const LOYALTY_VALIDATION_ERROR_CODES = [
  CartValidationErrors.LOYALTY_INSUFFICIENT_BALANCE,
  CartValidationErrors.LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED,
  CartValidationErrors.LOYALTY_PAYMENT_METHOD_NOT_ALLOWED,
] as const;

/** Line-item error codes about the entered quantity. */
export const QUANTITY_VALIDATION_ERROR_CODES = [
  CartValidationErrors.PRODUCT_QTY_CHANGED,
  CartValidationErrors.PRODUCT_MIN_QTY,
  CartValidationErrors.PRODUCT_MAX_QTY,
  CartValidationErrors.PRODUCT_MIN_MAX_QTY,
  CartValidationErrors.PRODUCT_EXACT_QTY,
  CartValidationErrors.PRODUCT_MIN_QTY_NOT_AVAILABLE,
  CartValidationErrors.PRODUCT_PACK_SIZE_LIMIT,
  CartValidationErrors.LINE_ITEM_LIMIT,
] as const;

/**
 * Maps each loyalty validation error code (as returned on `cart.validationErrors[]`)
 * to its full-length i18n message key, used by the Place Order guard toast (VCST-5365 AC-6).
 */
export const LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS: Record<string, string> = {
  [CartValidationErrors.LOYALTY_INSUFFICIENT_BALANCE]: "common.messages.loyalty_insufficient_balance",
  [CartValidationErrors.LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED]:
    "common.messages.loyalty_only_point_products_not_allowed",
  [CartValidationErrors.LOYALTY_PAYMENT_METHOD_NOT_ALLOWED]: "common.messages.loyalty_payment_method_not_allowed",
};

/**
 * Compact variants of the loyalty messages, shown next to the "Total in {loyaltyCurrency}" block where
 * space is tight. Used by the inline cart/checkout alert.
 */
export const LOYALTY_VALIDATION_ERROR_COMPACT_MESSAGE_KEYS: Record<string, string> = {
  [CartValidationErrors.LOYALTY_INSUFFICIENT_BALANCE]: "common.messages.loyalty_insufficient_balance_compact",
  [CartValidationErrors.LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED]:
    "common.messages.loyalty_only_point_products_not_allowed_compact",
  [CartValidationErrors.LOYALTY_PAYMENT_METHOD_NOT_ALLOWED]:
    "common.messages.loyalty_payment_method_not_allowed_compact",
};
