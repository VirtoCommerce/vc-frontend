import { HttpLink, from, split } from "@apollo/client/core";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { apolloFetch, apolloWebSocketConnectionParams } from "@/core/api/graphql/config/interceptors";
import { HTTP_ENDPOINT_URL, WEBSOCKETS_ENDPOINT_URL, WEBSOCKETS_ENDPOINT_TIMEOUT } from "@/core/api/graphql/consts";

const httpLink = new HttpLink({ uri: HTTP_ENDPOINT_URL, fetch: apolloFetch });
const wsLink = new WebSocketLink(
  new SubscriptionClient(WEBSOCKETS_ENDPOINT_URL, {
    lazy: true,
    reconnect: true,
    timeout: WEBSOCKETS_ENDPOINT_TIMEOUT,
    connectionParams: apolloWebSocketConnectionParams,
  }),
);

const sharedLink = from([removeTypenameFromVariables(), errorHandlerLink]);

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
// removeTypenameLink
// ↓
// errorHandlerLink
// ↓
// (conditional links)
// ↓
// httpLink
export const link = from([
  sharedLink,
  // Add conditional links here
  cartLink,
  // Send only subscriptions through web sockets
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      // Disabled because importing this enums cause issues and graphql package will remove them at v17
      // https://virtocommerce.atlassian.net/browse/VCST-834
      // https://github.com/graphql/graphql-js/pull/3686
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    },
    wsLink,
    httpLink,
  ),
]);
