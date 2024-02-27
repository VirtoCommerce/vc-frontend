import { ApolloLink, split } from "@apollo/client/core";
import { FULL_CART_MUTATION_NAMES, SHORT_CART_MUTATION_NAMES } from "@/core/api/graphql/cart/consts";
import { cartChangedEvent, useBroadcast } from "@/shared/broadcast";

const broadcastOperationNames = SHORT_CART_MUTATION_NAMES.concat(FULL_CART_MUTATION_NAMES);

export const broadcastLink = split(
  (operation) => broadcastOperationNames.includes(operation.operationName),
  new ApolloLink((operation, forward) => {
    const broadcast = useBroadcast();
    broadcast.emit(cartChangedEvent);
    return forward(operation);
  }),
);
