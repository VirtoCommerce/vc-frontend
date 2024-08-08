import { mergeWith, uniqBy } from "lodash";
import { ref } from "vue";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { FetchResult } from "@apollo/client/core";
import type { MutateFunction } from "@vue/apollo-composable";

const DEFAULT_MAX_LENGTH = 10;

/**
 * @description Default merge strategy for batched mutation parameters.
 * @note This function mutates the first argument! https://lodash.com/docs/4.17.15#mergeWith
 */
function DEFAULT_MERGE_STRATEGY<TVariables>(a: TVariables, b: TVariables) {
  mergeWith(a, b, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return objValue.concat(srcValue);
    }
  });
}

/**
 * @description Merge strategy to ensure unique items based on a key or function.
 * @note This function mutates the first argument! https://lodash.com/docs/4.17.15#mergeWith
 */
export function getMergeStrategyUniqueBy<TVariables>(keyOrFn: string | ((...values: unknown[]) => unknown)) {
  return (a: TVariables, b: TVariables) => {
    mergeWith(a, b, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return uniqBy(objValue.concat(srcValue), keyOrFn);
      }
    });
  };
}

/**
 * @description Vue composable to batch Apollo Client mutations.
 * @param mutation - Apollo Client mutation function.
 * @param options - Options object with `debounce`, `maxLength`, and `merge` properties.
 * @param options.debounce - Debounce time in milliseconds. Default is {@link DEFAULT_DEBOUNCE_IN_MS}.
 * @param options.length - Maximum number of mutations to batch. Default is {@link DEFAULT_MAX_LENGTH}. After reaching this number, `overflowed` ref will be set to `true`.
 * @param options.merge - Function to merge two mutation parameters objects. See {@link DEFAULT_MERGE_STRATEGY} and {@link getMergeStrategyUniqueBy}
 * @returns Object with `overflowed` boolean ref and `add` function to add a new mutation to the batch.
 * @example ```ts
 * const { mutate: changeCartItemsQuantity, loading } = useChangeCartItemsQuantity();
 * const { overflowed, add } = useMutationBatcher(changeCartItemsQuantity);
 * const result = await add({ command { cartItems: [{ productId: "1", quantity: 1}] }});
 * ```
 */
export function useMutationBatcher<TData, TVariables>(
  mutation: MutateFunction<TData, TVariables>,
  options: {
    debounce?: number;
    maxLength?: number;
    merge?: (a: TVariables, b: TVariables) => void;
  } = {},
) {
  const { debounce = DEFAULT_DEBOUNCE_IN_MS, maxLength = DEFAULT_MAX_LENGTH, merge = DEFAULT_MERGE_STRATEGY } = options;

  const overflowed = ref(false);
  let abortController: AbortController | null = null;
  let batch: TVariables = {} as TVariables;
  let calledCount = 0;
  let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

  async function add(args: TVariables): Promise<FetchResult<TData> | null> {
    clearPreviousDebounce();
    merge(batch, args);
    calledCount += 1;

    if (calledCount >= maxLength) {
      overflowed.value = true;
    }
    return new Promise((resolve, reject) => {
      debounceTimeoutId = setTimeout(async () => {
        try {
          const result = await executeBatch();
          resolve(result);
          resetBatchState();
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            reject(error);
          }
        }
      }, debounce);
    });
  }

  function clearPreviousDebounce() {
    abortController?.abort();
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
  }

  async function executeBatch(): Promise<FetchResult<TData> | null> {
    abortController = new AbortController();
    return await mutation(batch, {
      context: { fetchOptions: { signal: abortController.signal } },
    });
  }

  function resetBatchState() {
    overflowed.value = false;
    abortController = null;
    batch = {} as TVariables;
    calledCount = 0;
  }

  return { overflowed, add };
}
