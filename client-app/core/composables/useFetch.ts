import { shallowRef, unref } from "vue";
import { useRouter } from "vue-router";
import { MaybeRef } from "../helpers/maybeRef";

export default function useFetch() {
  const data = shallowRef<unknown | undefined>();
  const error = shallowRef<Error | undefined>();
  const statusCode = shallowRef<number | null>();
  const router = useRouter();

  function innerFetch<TBody, TResult>(url: MaybeRef<string>, method = "POST", body?: TBody): Promise<TResult> {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const reqInit: RequestInit = { headers, method, body: body ? JSON.stringify(body) : null };

    const request = new Request(unref(url), reqInit);

    return new Promise((resolve, reject) => {
      fetch(request)
        .then((result) => {
          statusCode.value = result.status;

          if (result.status == 204) {
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
            case 500:
              router.push({
                name: "InternalError",
              });
              break;
            case 403:
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
