import { computed } from "vue";
import { LocationQueryValue, useRouter } from "vue-router";
import { Dictionary, UseRouteQueryParamOptions } from "@core/types";

export default function useRouteQueryParam<T = LocationQueryValue | LocationQueryValue[]>(
  key: string,
  options: UseRouteQueryParamOptions<T> = {}
) {
  const {
    onChange,
    validator,
    defaultValue,
    updateMethod = "push",
    removeFalsyValue = true,
    removeNullishValue = true,
    removeDefaultValue = true,
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

    async set(value) {
      const { hash, params, query } = router.currentRoute.value;
      const newLocation: Dictionary = {
        hash,
        params,
        query: {
          ...query,
        },
      };

      if (
        (removeFalsyValue && !value) ||
        (removeNullishValue && value === null) ||
        (removeDefaultValue && value === defaultValue)
      ) {
        delete newLocation.query[key];
      } else {
        newLocation.query[key] = value;
      }

      const mustBeDone = router.currentRoute.value.fullPath !== router.resolve(newLocation).fullPath;
      let navigationFailure;

      if (mustBeDone) {
        navigationFailure = await router[updateMethod](newLocation);
      }

      if (onChange) {
        await onChange(value, mustBeDone && !navigationFailure);
      }
    },
  });
}
