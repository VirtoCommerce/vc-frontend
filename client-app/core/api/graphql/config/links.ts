import { HttpLink, from, split } from "@apollo/client/core";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { apolloFetch } from "@/core/api/graphql/config/interceptors";
import { API_URL } from "@/core/api/graphql/consts";

const httpLink = new HttpLink({ uri: API_URL, fetch: apolloFetch });
const wsLink = new WebSocketLink(
  new SubscriptionClient(`wss://${location.host}${API_URL}`, { reconnect: true, timeout: 60000 }),
);

const sharedLink = from([removeTypenameFromVariables(), errorHandlerLink]);

export const deprecatedLink = from([sharedLink, httpLink]);

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
//         removeTypenameLink
//                  ↓
//          errorHandlerLink
//          ↓               ↓
// (conditional links) → httpLink
export const link = from([
  sharedLink,
  // Add conditional links here
  cartLink,
  // Send only subscriptions through web sockets
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink,
  ),
]);
