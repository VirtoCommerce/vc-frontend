export const HTTP_ENDPOINT_URL = "/graphql";
export const WEBSOCKETS_ENDPOINT_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${HTTP_ENDPOINT_URL}`;
export const WEBSOCKETS_ENDPOINT_TIMEOUT = 55 * 1000; // 55 seconds
export const WEBSOCKETS_KEEP_ALIVE = 30 * 1000; // 30 seconds
export const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
export const ROOT_QUERY_CACHE_ID = "ROOT_QUERY";

export type ErrorNotificationsContextType = { suppressErrorNotifications?: boolean };

// Apollo operation context for an operation whose own component names the failure (an inline card error, an
// empty view, a not-found page): the global error handler then skips the generic error toast for it. Auth
// outcomes — sign-in redirect, locked user, expired password, no-access page — are navigation rather than
// notification, so they still apply.
export const SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT: ErrorNotificationsContextType = {
  suppressErrorNotifications: true,
};
