import { useGlobalInterceptors } from "@/core/api/common";

export const apolloFetch = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  return async (input: string | Request | URL, init?: RequestInit) => {
    onRequest.value.forEach((intercept) => intercept(input, init));
    const response = await fetch(input, init);
    onResponse.value.forEach((intercept) => intercept(response));
    return response;
  };
})();
