import { useGlobalInterceptors } from "@/core/api/common";

export const apolloFetch = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  return async (input: string | Request | URL, init?: RequestInit) => {
    await Promise.all(onRequest.value.map((intercept) => intercept(input, init)));
    const response = await fetch(input, init);
    await Promise.all(onResponse.value.map((intercept) => intercept(response)));
    return response;
  };
})();
