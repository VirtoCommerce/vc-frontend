import { createFetch } from "@vueuse/core";
import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { errorHandler, toServerError } from "@/core/api/common/utils";

export const useFetch = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  return createFetch({
    combination: "overwrite",
    options: {
      beforeFetch: async (context) => {
        await Promise.all(onRequest.value.map((intercept) => intercept(context.url, context.options)));
        return context;
      },
      afterFetch: async (context) => {
        await Promise.all(onResponse.value.map((intercept) => intercept(context.response)));
        return context;
      },
      onFetchError: (context) => {
        errorHandler(toServerError(context.error, context.response?.status));
        return context;
      },
    },
  });
})();
