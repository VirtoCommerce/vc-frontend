import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { apolloWebSocketConnectionParams } from "@/core/api/graphql/config/interceptors";
import { WEBSOCKETS_ENDPOINT_TIMEOUT, WEBSOCKETS_ENDPOINT_URL, WEBSOCKETS_KEEP_ALIVE } from "@/core/api/graphql/consts";

export const wsLink = new GraphQLWsLink(
  createClient({
    url: WEBSOCKETS_ENDPOINT_URL,
    lazy: true,
    shouldRetry: () => true,
    connectionAckWaitTimeout: WEBSOCKETS_ENDPOINT_TIMEOUT,
    connectionParams: apolloWebSocketConnectionParams,
    keepAlive: WEBSOCKETS_KEEP_ALIVE,
    on: {
      connecting: () => {
        console.info("[WebSocket] Connecting... Attempting to establish connection.");
      },
      opened: (_) => {
        const socket = _ as WebSocket;
        console.info("[WebSocket] Connection opened successfully.", {
          url: socket.url,
          protocol: socket.protocol,
        });
      },
      closed: (_) => {
        const closeEvent = _ as CloseEvent;
        console.warn("[WebSocket] Connection closed.", {
          code: closeEvent.code,
          reason: closeEvent.reason || "No reason provided",
          wasClean: closeEvent.wasClean,
        });
      },
      error: (err) => {
        console.error("[WebSocket] An error occurred.", err);
      },
    },
  }),
);
