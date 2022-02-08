import { computed } from "vue";
import { LocationQueryValue, useRouter } from "vue-router";
import { Dictionary, UseRouteQueryParamOptions } from "@core/types";

export default function useRouteQueryParam<T = LocationQueryValue | LocationQueryValue[]>(
  key: string,
  options: UseRouteQueryParamOptions<T> = {}
) {
  const {
    validator,
    defaultValue,
    updateMethod = "push",
    removeFalsyValues = false,
    removeNullishValues = true,
    removeDefaultValues = false,
  } = options;

  const router = useRouter();

  return computed<T>({
    get() {
      const queryValue = router.currentRoute.value.query[key];
      let value = queryValue || defaultValue;

      if (validator) {
        value = validator(queryValue) ? queryValue : defaultValue;
      }

      return value as T;
    },

    set(value) {
      const query: Dictionary = { ...router.currentRoute.value.query };

      if (
        (removeFalsyValues && !value) ||
        (removeNullishValues && value === null) ||
        (removeDefaultValues && value === defaultValue)
      ) {
        delete query[key];
      } else {
        query[key] = value;
      }

      if (router.currentRoute.value.fullPath !== router.resolve({ query }).fullPath) {
        router[updateMethod]({ query });
      }
    },
  });
}
