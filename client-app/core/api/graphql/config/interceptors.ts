import { useGlobalInterceptors } from "@/core/api/common";

const { onRequest, onResponse } = useGlobalInterceptors();

export const apolloFetch = async (input: string | Request | URL, init?: RequestInit) => {
  if (onRequest.value.length) {
    onRequest.value.forEach((intercept) => intercept(input, init));
  }

  const response = await fetch(input, init);

  if (onResponse.value.length) {
    onResponse.value.forEach((intercept) => intercept(response));
  }

  return response;
};
