import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { useAuth } from "@/core/composables/useAuth";
import type { Plugin } from "vue";

export const authPlugin: Plugin = {
  install: () => {
    const { expired, headers, refresh } = useAuth();

    const { onRequest } = useGlobalInterceptors();
    onRequest.value.push(async (_, request) => {
      if (expired.value) {
        await refresh();
      }

      if (request) {
        request.headers = { ...request.headers, ...headers.value };
      }
    });
  },
};
