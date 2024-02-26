import { shallowRef, unref } from "vue";
import { globals } from "../globals";

enum HTTP_ERRORS {
  NO_CONTENT = 204,
  FORBIDDEN = 403,
  SERVER_ERROR = 500,
}

/**
 * @deprecated Use useGlobalInterceptors instead
 */
let innerRequestEnricher: (x: Headers) => Headers = (x) => x;

/**
 * @deprecated Use useFetch from "@/core/api/common" instead
 */
export function useFetch() {
  const data = shallowRef<unknown | undefined>();
  const error = shallowRef<Error | undefined>();
  const statusCode = shallowRef<number | null>();

  function innerFetch<TResult, TPayload = unknown>(
    url: string,
    method = "GET",
    payload?: TPayload,
    contentType: string | null = "application/json",
  ): Promise<TResult> {
    const headers = new Headers();
    if (contentType) {
      headers.append("Content-Type", contentType);
    }

    innerRequestEnricher(headers);

    const body = contentType === "application/json" && payload ? JSON.stringify(payload) : (payload as BodyInit);
    const reqInit: RequestInit = { headers, method, body };
    const request = new Request(unref(url), reqInit);

    return new Promise((resolve, reject) => {
      fetch(request)
        .then((result) => {
          statusCode.value = result.status;

          if (result.status === HTTP_ERRORS.NO_CONTENT) {
            return null;
          }

          return result.json();
        })
        .then((result) => {
          data.value = result;
          resolve(result);
        })
        .catch((e) => {
          error.value = e;

          switch (statusCode.value) {
            case HTTP_ERRORS.SERVER_ERROR:
              globals.router.push({ name: "InternalError" });
              break;

            case HTTP_ERRORS.FORBIDDEN:
              globals.router.push({ name: "NoAccess" });
              break;

            default:
              break;
          }
          reject(e);
        });
    });
  }

  function enrichRequest(requestEnricher: (x: Headers) => Headers) {
    innerRequestEnricher = requestEnricher;
  }

  return {
    data,
    error,
    statusCode,
    innerFetch,
    enrichRequest,
  };
}
