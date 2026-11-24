import { merge } from "lodash-es";
import { initialExtensionRegistry } from "./initialExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

const INITIAL_EXTENSION_NAMES = Object.fromEntries(
  Object.entries(initialExtensionRegistry).map(([key, entries]) => [
    key,
    Object.fromEntries(Object.keys(entries).map((name) => [name, name])),
  ]),
);

/**
 * The names a caller may reference. Declared as its own literal so a name that is NOT here is a
 * COMPILE error: `INITIAL_EXTENSION_NAMES` comes out of `Object.fromEntries`, whose index signature
 * made `EXTENSION_NAMES.<category>.<anything>` type-check as `string` and evaluate to `undefined` —
 * the README's own `mobileMenu.myCustomers` example registered an extension under the literal string
 * "undefined", with nothing anywhere to point at.
 *
 * The built-in entry names stay in the merged VALUE for compatibility but are deliberately not in
 * this type: nothing references them, and a plugin's own id belongs to the plugin, not here. Need
 * one? Add it above, so there is a single visible source.
 */
const CUSTOM_EXTENSION_NAMES = {
  productCard: {
    cardButton: "card-button",
  },
  productPage: {
    sidebarButton: "sidebar-button",
    /** Replaces the default add-to-cart controls when `sidebarButton` does not apply (e.g. Subscribe & Save). */
    purchaseOptions: "purchase-options",
    variationItemButton: "variation-item-button",
    /**
     * Replaces a variation row's add-to-cart (variations table and list) when `variationItemButton` does not apply,
     * the way `purchaseOptions` follows `sidebarButton` for a simple product (e.g. Subscribe & Save per variation).
     */
    variationPurchaseOptions: "variation-purchase-options",
  },
  paymentPage: {
    paymentMethods: "payment-methods",
  },
  orderPaymentPage: {
    paymentMethods: "payment-methods",
  },
  orderDetails: {
    actions: "actions",
    /** Above the order's line items, under the title (e.g. "Placed automatically by your subscription"). */
    notice: "notice",
  },
  /** Next to the order number in Order history (table row and mobile card). */
  orderListItem: {
    badge: "badge",
  },
  sharedList: {
    provenanceNote: "provenance-note",
  },
  cartLineItem: {
    details: "details",
    /** Next to "Save for later" on the cart line (Subscribe). */
    actions: "actions",
  },
  /** Under an order line in Order history, as `cartLineItem.details` in the cart (Subscribed). */
  orderLineItem: {
    details: "details",
  },
  checkoutReview: {
    beforePlaceOrder: "before-place-order",
  },
  checkout: {
    placeOrder: "place-order",
  },
} as const;

export const EXTENSION_NAMES: typeof CUSTOM_EXTENSION_NAMES = merge(
  {},
  INITIAL_EXTENSION_NAMES,
  CUSTOM_EXTENSION_NAMES,
);

export const EXTENSION_CATEGORIES = {
  headerMenu: "headerMenu",
  mobileMenu: "mobileMenu",
  accountMenu: "accountMenu",
  mobileHeader: "mobileHeader",
  topHeaderStatus: "topHeaderStatus",
  productCard: "productCard",
  productPage: "productPage",
  productActions: "productActions",
  paymentPage: "paymentPage",
  orderPaymentPage: "orderPaymentPage",
  cartPayment: "cartPayment",
  orderDetails: "orderDetails",
  orderListItem: "orderListItem",
  sharedList: "sharedList",
  cartLineItem: "cartLineItem",
  orderLineItem: "orderLineItem",
  checkoutReview: "checkoutReview",
  checkout: "checkout",
  addCardForm: "addCardForm",
  identityProviders: "identityProviders",
  signInMethods: "signInMethods",
  pageBuilderSection: "pageBuilderSection",
  accountSecurity: "accountSecurity",
  companyInfo: "companyInfo",
} as const satisfies { [C in ExtensionCategoryType]: C };
