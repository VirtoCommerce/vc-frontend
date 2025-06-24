export const HTTP_ENDPOINT_URL = "/graphql";
export const WEBSOCKETS_ENDPOINT_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${HTTP_ENDPOINT_URL}`;
export const WEBSOCKETS_ENDPOINT_TIMEOUT = 55 * 1000; // 55 seconds
export const WEBSOCKETS_KEEP_ALIVE = 30 * 1000; // 30 seconds
export const DEFAULT_REQUEST_TIMEOUT = 60 * 1000;
export const ROOT_QUERY_CACHE_ID = "ROOT_QUERY";
