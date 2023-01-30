import { computed } from "vue";
import {
  LocationAsRelativeRaw,
  LocationQueryValue,
  LocationQueryValueRaw,
  RouteQueryAndHash,
  useRouter,
} from "vue-router";

export interface UseRouteQueryParamOptions<T = LocationQueryValue | LocationQueryValue[]> {
  defaultValue?: T;
  validator?(queryValue: NonNullable<T>): boolean;
  // @default push
  updateMethod?: "push" | "replace";
  // @default true
  removeFalsyValue?: boolean;
  // @default true
  removeNullishValue?: boolean;
  // @default true
  removeDefaultValue?: boolean;
}

export function useRouteQueryParam<T = NonNullable<LocationQueryValue> | NonNullable<LocationQueryValue>[]>(
  key: string,
  options: UseRouteQueryParamOptions<T> = {}
) {
  const {
    validator,
    defaultValue,
    updateMethod = "push",
    removeFalsyValue = true,
    removeNullishValue = true,
    removeDefaultValue = true,
  } = options;

  const router = useRouter();

  return {
    queryParam: computed<T>({
      get() {
        const queryValue = router.currentRoute.value.query[key] as T | null;

        const fallbackValue = defaultValue ?? ((Array.isArray(queryValue) ? [] : "") as T);

        let value = queryValue ?? fallbackValue;

        if (queryValue && validator) {
          value = validator(queryValue) ? queryValue : fallbackValue;
        }

        return value;
      },

      async set(value) {
        const { hash, params, query } = router.currentRoute.value;
        const newLocation: Required<RouteQueryAndHash & Pick<LocationAsRelativeRaw, "params">> = {
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
          newLocation.query[key] = value as LocationQueryValueRaw | LocationQueryValueRaw[];
        }

        const mustBeDone = router.currentRoute.value.fullPath !== router.resolve(newLocation).fullPath;

        if (mustBeDone) {
          await router[updateMethod](newLocation);
        }
      },
    }),
  };
}
