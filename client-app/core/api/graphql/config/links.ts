import { ApolloLink, HttpLink, from, split } from "@apollo/client/core";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import {
  apolloFetch,
  apolloWebSocketConnectionParams,
  apolloWebSocketConnectionCallback,
} from "@/core/api/graphql/config/interceptors";
import { HTTP_ENDPOINT_URL, WEBSOCKETS_ENDPOINT_URL } from "@/core/api/graphql/consts";

const httpLink = new HttpLink({ uri: HTTP_ENDPOINT_URL, fetch: apolloFetch });
const wsLink = new WebSocketLink(
  new SubscriptionClient(WEBSOCKETS_ENDPOINT_URL, {
    reconnect: true,
    timeout: 55000,
    connectionParams: apolloWebSocketConnectionParams,
    connectionCallback: apolloWebSocketConnectionCallback,
  }),
);

const sharedLink = from([
  removeTypenameFromVariables(),
  new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        test: "test",
      },
    });

    return forward(operation);
  }),
  errorHandlerLink,
]);

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
