import { merge } from "lodash-es";
import { initialExtensionRegistry } from "./initialExtensionRegistry";

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
    variationItemButton: "variation-item-button",
  },
  paymentPage: {
    paymentMethods: "payment-methods",
  },
  orderPaymentPage: {
    paymentMethods: "payment-methods",
  },
  sharedList: {
    provenanceNote: "provenance-note",
  },
} as const;

export const EXTENSION_NAMES: typeof CUSTOM_EXTENSION_NAMES = merge(
  {},
  INITIAL_EXTENSION_NAMES,
  CUSTOM_EXTENSION_NAMES,
);
