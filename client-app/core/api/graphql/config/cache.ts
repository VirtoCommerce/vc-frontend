import { InMemoryCache } from "@apollo/client/core";

const typesWithDisabledCache = [
  "ApproveQuoteResultType",
  "AuthorizePaymentResultType",
  "BulkWishlistType",
  "Category",
  "ContactConnection",
  "ContactType",
  "CountryType",
  "CustomerOrderConnection",
  "CustomerOrderType",
  "CustomIdentityResultType",
  "FileUploadOptionsFragment",
  "FulfillmentCenterConnection",
  "FulfillmentCenterType",
  "IdentityResultType",
  "InitializePaymentResultType",
  "MemberAddressConnection",
  "MemberAddressType",
  "MenuLinkListType",
  "MenuLinkType",
  "Organization",
  "ProductAssociation",
  "ProductConnection",
  "QuoteConnection",
  "QuoteType",
  "RequestRegistrationType",
  "SearchResultsType",
  "UserType",
  "WishlistConnection",
  "WishlistType",
];

const typesWithDisabledCacheSettings = typesWithDisabledCache.reduce(
  (acc, type) => {
    acc[type] = {
      keyFields: false,
    };
    return acc;
  },
  {} as Record<string, { keyFields: false }>,
);

export const cache = new InMemoryCache({
  typePolicies: {
    ...typesWithDisabledCacheSettings,
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
    Query: {
      fields: {
        pushMessages: {
          merge(existing, incoming) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
  },
});
