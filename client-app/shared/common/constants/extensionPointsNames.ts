import merge from "lodash/merge";
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
  },
  orderPaymentPage: {
    paymentMethods: "payment-methods",
  },
});
