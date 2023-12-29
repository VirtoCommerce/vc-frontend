import { InMemoryCache } from "@apollo/client/core";

export const cache = new InMemoryCache({
  typePolicies: {
    PaymentMethodType: {
      keyFields: ["code"],
    },
    ValidationErrorType: {
      keyFields: ["errorCode", "objectId", "objectType"],
    },
  },
});
