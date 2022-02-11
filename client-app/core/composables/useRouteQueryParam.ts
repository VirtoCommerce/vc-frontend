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
      const { hash, params, query } = router.currentRoute.value;
      const newLocation: Dictionary = {
        hash,
        params,
        query: {
          ...query,
        },
      };

      if (
        (removeFalsyValues && !value) ||
        (removeNullishValues && value === null) ||
        (removeDefaultValues && value === defaultValue)
      ) {
        delete newLocation.query[key];
      } else {
        newLocation.query[key] = value;
      }

      if (router.currentRoute.value.fullPath !== router.resolve(newLocation).fullPath) {
        router[updateMethod](newLocation);
      }
    },
  });
}
