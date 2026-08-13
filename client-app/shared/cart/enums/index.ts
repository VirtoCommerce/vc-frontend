export enum CartValidationErrors {
  ALL_LINE_ITEMS_UNSELECTED = "ALL_LINE_ITEMS_UNSELECTED",
  LOYALTY_INSUFFICIENT_BALANCE = "LOYALTY_INSUFFICIENT_BALANCE",
  LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED = "LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED",
  LOYALTY_PAYMENT_METHOD_NOT_ALLOWED = "LOYALTY_PAYMENT_METHOD_NOT_ALLOWED",
}

export const LOYALTY_VALIDATION_ERROR_CODES = [
  CartValidationErrors.LOYALTY_INSUFFICIENT_BALANCE,
  CartValidationErrors.LOYALTY_ONLY_POINT_PRODUCTS_NOT_ALLOWED,
  CartValidationErrors.LOYALTY_PAYMENT_METHOD_NOT_ALLOWED,
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
