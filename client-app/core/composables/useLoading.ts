import { computed, unref } from "vue";
import type { MaybeRef } from "@vueuse/core";
import type { ComputedRef, Ref } from "vue";

export interface IHasLoading {
  loading: Readonly<Ref<boolean>>;
}

/**
 * Compute single loading from multiple loading sources
 *
 * @example
 * const { loadingFirst } = useFirstComposable();
 * const { loadingSecond } = useSecondComposable();
 * const loading = useLoading(loadingFirst, loadingSecond);
 */
export function useLoading(...args: MaybeRef<boolean>[]): ComputedRef<boolean> {
  return computed(() => args.some((item) => unref(item)));
}
