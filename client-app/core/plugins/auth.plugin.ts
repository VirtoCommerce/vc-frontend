import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { useAuth } from "@/core/composables/useAuth";
import type { Plugin } from "vue";

export const authPlugin: Plugin = {
  install: () => {
    const { isExpired, headers, refresh } = useAuth();

    const { onRequest } = useGlobalInterceptors();
    onRequest.value.push(async (_, init) => {
      if (isExpired()) {
        await refresh();
      }

      if (init && headers.value.Authorization) {
        if (init.headers) {
          Object.assign(init.headers, headers.value);
        } else {
          Object.assign(init, headers.value);
        }
      }
    });
  },
};
