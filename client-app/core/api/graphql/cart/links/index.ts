import { ApolloLink, from, split } from "@apollo/client/core";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { API_URL } from "@/core/api/graphql/consts";
import { OperationNames } from "@/core/api/graphql/types";
import { cartReloadEvent, useBroadcast } from "@/shared/broadcast";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { Operation } from "@apollo/client/core";

const queryNames = [
  OperationNames.Query.GetFullCart,
  OperationNames.Query.GetShortCart,
  // validateCoupon doesn't modify anything and should be a query
  OperationNames.Mutation.ValidateCoupon,
];

const mutationNames = [
  OperationNames.Mutation.AddBulkItemsCart,
  OperationNames.Mutation.AddCoupon,
  OperationNames.Mutation.AddGiftItems,
  OperationNames.Mutation.AddItemsCart,
  OperationNames.Mutation.AddItem,
  OperationNames.Mutation.AddOrUpdateCartPayment,
  OperationNames.Mutation.AddOrUpdateCartShipment,
  OperationNames.Mutation.ChangeCartComment,
  OperationNames.Mutation.ChangeFullCartItemQuantity,
  OperationNames.Mutation.ChangePurchaseOrderNumber,
  OperationNames.Mutation.ChangeShortCartItemQuantity,
  OperationNames.Mutation.ClearCart,
  OperationNames.Mutation.MergeCart,
  OperationNames.Mutation.RejectGiftItems,
  OperationNames.Mutation.RemoveCartItems,
  OperationNames.Mutation.RemoveCoupon,
  OperationNames.Mutation.RemoveShipment,
  OperationNames.Mutation.SelectCartItems,
  OperationNames.Mutation.UnselectCartItems,
  OperationNames.Mutation.ValidateCoupon,
];

const operationNames = queryNames.concat(mutationNames);

const broadcastLink = split(
  (operation) => mutationNames.includes(operation.operationName),
  new ApolloLink((operation, forward) => {
    const broadcast = useBroadcast();
    return forward(operation).map((data) => {
      broadcast.emit(cartReloadEvent);
      return data;
    });
  }),
);

// BatchHttpLink is used to batch multiple operations into one request
const batchLink = from([
  split(
    (operation) => operationNames.includes(operation.operationName),
    new BatchHttpLink({
      uri: API_URL,
      batchInterval: DEFAULT_DEBOUNCE_IN_MS,
      batchDebounce: true,
      // Workaround to load cart only once per batch
      // For example:
      // changeFullCartItemQuantity
      //   cart @skip (if: $skipQuery)
      // selectCartItems
      //   cart - only this cart will be loaded
      // Or:
      // shortCart @skip (if @skipQuery)
      // fullCart - only this query will be executed
      fetch: (input, init) => {
        if (init && typeof init.body == "string") {
          const operations = JSON.parse(init.body) as Operation[];
          operations
            .filter(canSkipQuery)
            .slice(0, -1)
            .forEach((operation) => {
              operation.variables.skipQuery = true;
            });
          init.body = JSON.stringify(operations);
        }
        return fetch(input, init);
      },
    }),
  ),
]);

function canSkipQuery(operation: Operation): operation is Operation & { variables: { skipQuery: boolean } } {
  return "skipQuery" in operation.variables;
}

export const cartLink = from([broadcastLink, batchLink]);
