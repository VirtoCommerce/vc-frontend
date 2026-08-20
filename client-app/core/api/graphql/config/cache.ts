import { InMemoryCache } from "@apollo/client/core";
import type { TypePolicies } from "@apollo/client/core";

/**
 * The host's own type policies. Exported so `registerCacheTypePolicies` can seed its ownership map
 * from the same object the cache is built with — one source of truth, so a plugin cannot quietly
 * take over a typename the host normalizes.
 */
export const hostTypePolicies: TypePolicies = {
  CartType: {
    fields: {
      availableGifts: {
        merge: false,
      },
      availableShippingMethods: {
        merge: false,
      },
      availablePaymentMethods: {
        merge: false,
      },
      coupons: {
        merge: false,
      },
      discounts: {
        merge: false,
      },
      gifts: {
        merge: false,
      },
      items: {
        merge: false,
      },
      payments: {
        merge: false,
      },
      shipments: {
        merge: false,
      },
      validationErrors: {
        merge: false,
      },
    },
  },
  CartAddressType: {
    keyFields: false,
  },
  CouponType: {
    keyFields: ["code"],
  },
  CurrencyType: {
    merge: false,
  },
  LineItemType: {
    fields: {
      validationErrors: {
        merge: false,
      },
    },
  },
  MoneyType: {
    merge: false,
  },
  PaymentMethodType: {
    keyFields: ["code"],
  },
  Product: {
    fields: {
      properties: {
        merge: false,
      },
    },
  },
  Property: {
    keyFields: false,
  },
  ValidationErrorType: {
    keyFields: ["errorCode", "objectId", "objectType"],
  },
};

export const cache = new InMemoryCache({ typePolicies: hostTypePolicies });
