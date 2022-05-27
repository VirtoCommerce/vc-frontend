import { shallowRef, unref } from "vue";
import { useRouter } from "vue-router";

enum HTTP_ERRORS {
  NO_CONTENT = 204,
  FORBIDDEN = 403,
  SERVER_ERROR = 500,
}

export default function useFetch() {
  const data = shallowRef<unknown | undefined>();
  const error = shallowRef<Error | undefined>();
  const statusCode = shallowRef<number | null>();
  const router = useRouter();

  function innerFetch<TResult, TBody = unknown>(url: string, method = "GET", body?: TBody): Promise<TResult> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const reqInit: RequestInit = { headers, method, body: body ? JSON.stringify(body) : null };

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
              router.push({
                name: "InternalError",
              });
              break;
            case HTTP_ERRORS.FORBIDDEN:
              router.push({
                name: "NoAccess",
              });
              break;
            default:
              break;
          }
          reject(e);
        });
    });
  }

  return {
    data,
    error,
    statusCode,
    innerFetch,
  };
}
