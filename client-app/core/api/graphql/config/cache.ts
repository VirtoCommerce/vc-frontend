import { InMemoryCache } from "@apollo/client/core";

export const cache = new InMemoryCache({
  typePolicies: {
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
    CouponType: {
      keyFields: ["code"],
    },
    CurrencyType: {
      merge: true,
    },
    LineItemType: {
      fields: {
        validationErrors: {
          merge: false,
        },
      },
    },
    MoneyType: {
      merge: true,
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
    ValidationErrorType: {
      keyFields: ["errorCode", "objectId", "objectType"],
    },
  },
});
