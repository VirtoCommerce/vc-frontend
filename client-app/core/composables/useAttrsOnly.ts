import { pickBy } from "lodash";
import { computed, useAttrs } from "vue";
import type { ComputedRef } from "vue";

export function useAttrsOnly(): ComputedRef<Record<string, unknown>> {
  const attrs = useAttrs();
  return computed(() => pickBy(attrs, (_, attr) => !/^on[A-Z].*/.test(attr)));
}
