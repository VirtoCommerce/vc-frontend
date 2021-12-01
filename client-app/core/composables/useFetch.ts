import { shallowRef, unref } from "vue";
import { useRouter } from "vue-router";

export function useFetch(url: MaybeRef<string>) {
  const data = shallowRef<T | undefined>();
  const error = shallowRef<Error | undefined>();
  const statusCode = shallowRef<number | null>();
  const router = useRouter();

  fetch(unref(url))
    .then((result) => {
      statusCode.value = result.status;
      return result.json();
    })
    .then((result) => {
      data.value = result;
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
    });

  return {
    data,
    error,
    statusCode,
  };
}
