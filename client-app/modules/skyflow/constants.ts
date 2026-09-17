export const MODULE_ID_SKYFLOW = "VirtoCommerce.Skyflow";

export const SKYFLOW_PAYMENT_TYPE_NAME = "SkyflowPaymentMethod";

// Registration key core doesn't need to know — core reads only the generic `paymentPage` /
// `orderPaymentPage` / `cartPayment` extension point categories, not who registered into them.
export const SKYFLOW_PAYMENT_EXTENSION = "skyflow-payment-method";
