import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

function _useGlobalInterceptors() {
  const onRequest = ref<
    ((input: string | URL | Request, init?: RequestInit | AxiosRequestConfig) => Promise<void> | void)[]
  >([]);
  const onResponse = ref<((response: Response | AxiosResponse) => Promise<void> | void)[]>([]);

  return {
    onRequest,
    onResponse,
  };
}

export const useGlobalInterceptors = createGlobalState(_useGlobalInterceptors);
