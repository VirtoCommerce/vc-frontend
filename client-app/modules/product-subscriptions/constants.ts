export const MODULE_ID = "VirtoCommerce.ProductSubscription";
export const ENABLED_KEY = "ProductSubscription.Enabled";

/** Type name of the backend's mock stored-card payment method (development, demos and CI only). */
export const MOCK_PAYMENT_TYPE_NAME = "MockStoredCardPaymentMethod";
export const MOCK_PAYMENT_CODE = "MockStoredCardPaymentMethod";

/** Test cards understood by the mock payment method. Never real card ranges. */
export const MOCK_TEST_CARDS = [
  { number: "4000000000004242", key: "success" },
  { number: "4000000000003220", key: "three_ds_on_save" },
  { number: "4000000000003184", key: "three_ds_on_renewal" },
  { number: "4000000000009995", key: "insufficient_funds" },
  { number: "4000000000000069", key: "expired" },
  { number: "5100000000000021", key: "recurring_cancelled" },
] as const;

export const THREE_DS_ON_SAVE_LAST4 = "3220";
export const THREE_DS_ON_RENEWAL_LAST4 = "3184";

/** Session flag set when the customer accepted subscription terms at checkout; read by the payment step. */
export const SUBSCRIPTION_CHECKOUT_STORAGE_KEY = "vc-product-subscription-checkout";

/** Renewal states that need the customer: shown under "Needs your attention". */
export const ATTENTION_RENEWAL_STATES: ReadonlySet<string> = new Set([
  "ReviewRequired",
  "PaymentActionRequired",
  "RetryScheduled",
  "Failed",
]);

export const SUBSCRIPTIONS_ROUTE_NAME = "ProductSubscriptions";
export const SUBSCRIPTION_DETAILS_ROUTE_NAME = "ProductSubscriptionDetails";
export const PAYMENT_METHODS_ROUTE_NAME = "SavedPaymentMethods";
