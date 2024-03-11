import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { useAuth } from "@/core/composables/useAuth";
import type { Plugin } from "vue";

export const authPlugin: Plugin = {
  install: () => {
    const { isExpired, headers, refresh } = useAuth();

    const { onRequest } = useGlobalInterceptors();
    onRequest.value.push(async (_, request) => {
      if (isExpired()) {
        await refresh();
      }

      if (request && headers.value.Authorization) {
        request.headers = { ...request.headers, ...headers.value };
      }
    });
  },
};
