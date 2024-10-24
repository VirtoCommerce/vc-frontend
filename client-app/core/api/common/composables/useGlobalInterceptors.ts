import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { ConnectionParams } from "subscriptions-transport-ws";

function _useGlobalInterceptors() {
  const onRequest = ref<
    ((
      input: string | URL | Request,
      init?: RequestInit | AxiosRequestConfig | ConnectionParams,
    ) => Promise<void> | void)[]
  >([]);
  const onResponse = ref<((response: Response | AxiosResponse) => Promise<void> | void)[]>([]);

  console.log(onResponse.value);

  return {
    onRequest,
    onResponse,
  };
}

export const useGlobalInterceptors = createGlobalState(_useGlobalInterceptors);
