/* eslint-disable no-restricted-imports */
import { useAxios as _useAxios } from "@vueuse/integrations/useAxios.mjs";
import { default as axios } from "axios";
/* eslint-enable no-restricted-imports */
import { useGlobalInterceptors } from "@/core/api/common/composables/useGlobalInterceptors";
import { errorHandler, toServerError } from "@/core/api/common/utils";
import type { AxiosError } from "axios";

export const useAxios = (() => {
  const { onRequest, onResponse } = useGlobalInterceptors();

  axios.interceptors.request.use(
    async (config) => {
      await Promise.all(onRequest.value.map((intercept) => intercept(config.url!, config)));
      return config;
    },
    (error: AxiosError) => {
      errorHandler(toServerError(error?.cause, undefined));
      return Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    async (response) => {
      await Promise.all(onResponse.value.map((intercept) => intercept(response)));
      return response;
    },
    (error: AxiosError) => {
      errorHandler(toServerError(error?.cause, error?.response?.status));
      return Promise.reject(error);
    },
  );

  return _useAxios;
})();
