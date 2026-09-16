// Region and block ids repeat across surfaces — region ids are fixed, and `orders` is registered on
// both the dashboard and the customer profile — so normalizing them makes
// `SalesRepLayoutRegion:statistics` and `SalesRepLayoutBlock:orders` one entity for every scope, and
// whichever surface loads second overwrites the first. `keyFields: false` stores them inline under the
// root field instead, which Apollo already keys by arguments.
import type { TypePolicies } from "@apollo/client/core";

export const layoutTypePolicies: TypePolicies = {
  SalesRepLayoutRegion: { keyFields: false },
  SalesRepLayoutBlock: { keyFields: false },
};
