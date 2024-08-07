import { ref } from "vue";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { MutateFunction } from "@vue/apollo-composable";

const DEFAULT_MAX_LENGTH = 10;

export function useMutationBatcher<TResult, TVariables extends unknown[]>(
  mutation: MutateFunction<TResult, TVariables>,
  options: { debounce?: number; maxLength?: number } = {},
) {
  const { debounce = DEFAULT_DEBOUNCE_IN_MS, maxLength = DEFAULT_MAX_LENGTH } = options;

  const overflowed = ref(false);

  const batch: TVariables = [] as unknown[] as TVariables;
  let abortController: AbortController | null = null;
  let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

  function add(...args: TVariables[number][]) {
    clearPreviousDebounce();
    batch.push(args);

    if (batch.length >= maxLength) {
      overflowed.value = true;
    }

    abortController = new AbortController();

    debounceTimeoutId = setTimeout(async () => {
      try {
        await executeBatch();
      } catch (error) {
        handleError(error);
      } finally {
        resetBatchState();
      }
    }, debounce);
  }

  function clearPreviousDebounce() {
    if (abortController) {
      abortController.abort();
    }
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
  }

  async function executeBatch() {
    if (batch.length === 0) {
      return;
    }

    await mutation(batch, {
      context: { signal: abortController!.signal },
    });

    batch.length = 0;
  }

  function handleError(error: unknown) {
    if ((error as Error).name !== "AbortError") {
      throw error;
    }
  }

  function resetBatchState() {
    overflowed.value = false;
    abortController = null;
  }

  return {
    overflowed,
    add,
  };
}
