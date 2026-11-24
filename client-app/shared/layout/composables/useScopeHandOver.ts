import { onBeforeUnmount, toValue, watch } from "vue";
import { useSearchScore } from "./useSearchScore";
import type { MaybeRefOrGetter } from "vue";

/**
 * Holds the search scope the leaving page set while `isWaiting`, so its slot stays until the page taking it over has
 * rendered. Released after that render or when the caller unmounts.
 */
export function useScopeHandOver(isWaiting: MaybeRefOrGetter<boolean>): void {
  const { isCategoryScope, isScopePending, holdScope } = useSearchScore();

  let releaseScope: (() => void) | undefined;

  // Pre flush: the leaving category still has its scope; immediate: a route hand-over.
  watch(
    () => toValue(isWaiting),
    (waiting) => {
      if (waiting && (isCategoryScope.value || isScopePending.value) && !releaseScope) {
        releaseScope = holdScope();
      }
    },
    { immediate: true },
  );

  // Post flush: the next page has rendered; a category holds or prepares the scope itself.
  watch(
    () => toValue(isWaiting),
    (waiting) => {
      if (!waiting) {
        releaseScope?.();
        releaseScope = undefined;
      }
    },
    { flush: "post" },
  );

  onBeforeUnmount(() => {
    releaseScope?.();
  });
}
