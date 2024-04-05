export const HTTP_ENDPOINT_URL = "/graphql";
export const WEBSOCKETS_ENDPOINT_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${HTTP_ENDPOINT_URL}`;
export const WEBSOCKETS_ENDPOINT_TIMEOUT = 55 * 1000; // 55 seconds
