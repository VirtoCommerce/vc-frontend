import { useGlobalInterceptors } from "@/core/api/common";
import { WEBSOCKETS_ENDPOINT_URL } from "@/core/api/graphql/consts";

export const apolloFetch = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  return async (input: string | Request | URL, init?: RequestInit) => {
    await Promise.all(onRequest.value.map((intercept) => intercept(input, init)));
    const response = await fetch(input, init);
    await Promise.all(onResponse.value.map((intercept) => intercept(response)));
    return response;
  };
})();

export const apolloWebSocketConnectionParams = (() => {
  const { onRequest } = useGlobalInterceptors();

  return async () => {
    const init = {};
    await Promise.all(onRequest.value.map((intercept) => intercept(WEBSOCKETS_ENDPOINT_URL, init)));
    return init;
  };
})();
