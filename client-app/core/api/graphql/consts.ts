export const HTTP_ENDPOINT_URL = "/xapi/graphql";
export const WEBSOCKETS_ENDPOINT_URL = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${HTTP_ENDPOINT_URL}`;
