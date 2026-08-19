import { merge } from "lodash-es";
import { initialExtensionRegistry } from "./initialExtensionRegistry";

const INITIAL_EXTENSION_NAMES = Object.fromEntries(
  Object.entries(initialExtensionRegistry).map(([key, entries]) => [
    key,
    Object.fromEntries(Object.keys(entries).map((name) => [name, name])),
  ]),
);

export const EXTENSION_NAMES = merge({}, INITIAL_EXTENSION_NAMES, {
  productCard: {
    cardButton: "card-button",
  },
  productPage: {
    sidebarButton: "sidebar-button",
    variationItemButton: "variation-item-button",
  },
  paymentPage: {
    paymentMethods: "payment-methods",
    skyflowPaymentMethod: "skyflow-payment-method",
  },
  orderPaymentPage: {
    paymentMethods: "payment-methods",
    skyflowPaymentMethod: "skyflow-payment-method",
  },
  sharedList: {
    provenanceNote: "provenance-note",
  },
});
