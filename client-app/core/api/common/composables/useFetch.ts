import { createFetch } from "@vueuse/core";
import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { errorHandler, toServerError } from "@/core/api/common/utils";

export const useFetch = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  return createFetch({
    options: {
      beforeFetch: (context) => {
        onRequest.value.forEach((intercept) => intercept(context.url, context.options));
        return context;
      },
      afterFetch: (context) => {
        onResponse.value.forEach((intercept) => intercept(context.response));
        return context;
      },
      onFetchError: (context) => {
        errorHandler(toServerError(context.error, context.response?.status));
        return context;
      },
    },
  });
})();
