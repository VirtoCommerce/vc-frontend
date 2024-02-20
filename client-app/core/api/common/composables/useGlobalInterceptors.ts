import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";

function _useGlobalInterceptors() {
  const onRequest = ref<((...args: Parameters<typeof fetch>) => void)[]>([]);
  const onResponse = ref<((response: Awaited<ReturnType<typeof fetch>>) => void)[]>([]);

  return {
    onRequest,
    onResponse,
  };
}

export const useGlobalInterceptors = createGlobalState(_useGlobalInterceptors);
