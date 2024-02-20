import { createFetch } from "@vueuse/core";
import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { errorHandler, toServerError } from "@/core/api/common/utils";

const { onRequest, onResponse } = useGlobalInterceptors();

export const useFetch = createFetch({
  options: {
    beforeFetch: (context) => {
      if (onRequest.value.length) {
        onRequest.value.forEach((intercept) => intercept(context.url, context.options));
      }

      return context;
    },
    afterFetch: (context) => {
      if (onResponse.value.length) {
        onResponse.value.forEach((intercept) => intercept(context.response));
      }

      return context;
    },
    onFetchError: (context) => {
      errorHandler(toServerError(context.error, context.response?.status));

      return context;
    },
  },
});
