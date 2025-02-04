import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { apolloWebSocketConnectionParams } from "@/core/api/graphql/config/interceptors";
import { WEBSOCKETS_ENDPOINT_TIMEOUT, WEBSOCKETS_ENDPOINT_URL } from "@/core/api/graphql/consts";

export const wsLink = new GraphQLWsLink(
  createClient({
    url: WEBSOCKETS_ENDPOINT_URL,
    lazy: true,
    shouldRetry: () => true,
    connectionAckWaitTimeout: WEBSOCKETS_ENDPOINT_TIMEOUT,
    connectionParams: apolloWebSocketConnectionParams,
  }),
);
