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

// errorCode values of createPunchoutRequisition (vc-module-punchout: PunchoutOrderMessageStatus, DefaultPunchoutHandler).
// Most of them fail the same way on a retry, so each one tells the buyer what to do instead.
export const REQUISITION_ERROR_MESSAGE_KEYS = {
  SessionNotFound: "punchout.errors.session_not_found",
  SessionExpired: "punchout.errors.session_expired",
  SessionReturned: "punchout.errors.session_returned",
  StoreNotConfigured: "punchout.errors.store_not_configured",
  ConfigurationError: "punchout.errors.configuration_error",
  MessageError: "punchout.errors.message_error",
  CartNotFound: "punchout.errors.cart_not_found",
  CartIsEmpty: "punchout.errors.cart_is_empty",
} as const;
export const REQUISITION_FAILED_MESSAGE_KEY = "punchout.errors.create_requisition_failed";

export type RequisitionErrorCodeType = keyof typeof REQUISITION_ERROR_MESSAGE_KEYS;

export function isKnownRequisitionErrorCode(code: string | undefined): code is RequisitionErrorCodeType {
  return !!code && Object.prototype.hasOwnProperty.call(REQUISITION_ERROR_MESSAGE_KEYS, code);
}
