/* eslint-disable no-restricted-imports */
import { useAxios as _useAxios } from "@vueuse/integrations/useAxios";
import { default as axios } from "axios";
/* eslint-enable no-restricted-imports */
import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { errorHandler, toServerError } from "@/core/api/common/utils";
import type { AxiosError } from "axios";

export const useAxios = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  axios.interceptors.request.use(
    (config) => {
      onRequest.value.forEach((intercept) => intercept(config.url!, config));
      return config;
    },
    (error: AxiosError | undefined) => {
      errorHandler(toServerError(error?.config?.url, undefined));
      return Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    (response) => {
      onResponse.value.forEach((intercept) => intercept(response));
      return response;
    },
    (error: AxiosError | undefined) => {
      errorHandler(toServerError(error?.config?.url, error?.response?.status));
      return Promise.reject(error);
    },
  );

  return _useAxios;
})();
