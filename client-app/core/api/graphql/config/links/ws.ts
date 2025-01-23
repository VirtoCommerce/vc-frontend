import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { apolloWebSocketConnectionParams } from "@/core/api/graphql/config/interceptors";
import { WEBSOCKETS_ENDPOINT_URL, WEBSOCKETS_ENDPOINT_TIMEOUT } from "@/core/api/graphql/consts";

export const wsLink = new WebSocketLink(
  new SubscriptionClient(WEBSOCKETS_ENDPOINT_URL, {
    lazy: true,
    reconnect: true,
    timeout: WEBSOCKETS_ENDPOINT_TIMEOUT,
    connectionParams: apolloWebSocketConnectionParams,
  }),
);
