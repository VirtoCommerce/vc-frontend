import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

function _useGlobalInterceptors() {
  const onRequest = ref<((input: string | URL | Request, init?: RequestInit | AxiosRequestConfig) => void)[]>([]);
  const onResponse = ref<((response: Response | AxiosResponse) => void)[]>([]);

  return {
    onRequest,
    onResponse,
  };
}

export const useGlobalInterceptors = createGlobalState(_useGlobalInterceptors);
