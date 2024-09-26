import cloneDeep from "lodash/cloneDeep";
import mergeWith from "lodash/mergeWith";
import { ref } from "vue";
import { AbortReason } from "@/core/api/common/enums";
import { uniqByLast } from "@/core/utilities/common";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { UniqByLastIterateeType } from "@/core/utilities/common";
import type { FetchResult } from "@apollo/client/core";
import type { MutateFunction, MutateOverrideOptions } from "@vue/apollo-composable";

const DEFAULT_MAX_LENGTH = 10;

/**
 * @description Default merge strategy for batched mutation parameters.
 */
function DEFAULT_MERGE_STRATEGY<TVariables extends object>(a: TVariables, b: TVariables): TVariables {
  const result = cloneDeep(a);
  mergeWith(result, b, (objValue, srcValue) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return objValue.concat(srcValue);
    }
  });
  return result;
}

/**
 * @description Merge strategy to ensure unique items based on a key or function.
 */
export function getMergeStrategyUniqueBy(keyOrFn: string | ((item: unknown) => unknown)) {
  return <TVariables>(a: TVariables, b: TVariables): TVariables => {
    const result = cloneDeep(a);
    mergeWith(result, b, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return uniqByLast(objValue.concat(srcValue), keyOrFn as UniqByLastIterateeType<TVariables>);
      }
    });
    return result;
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
export function useMutationBatcher<TData, TVariables extends object>(
  mutation: MutateFunction<TData, TVariables>,
  options: {
    debounce?: number;
    maxLength?: number;
    mergeStrategy?: (a: TVariables, b: TVariables) => TVariables;
  } = {},
) {
  const {
    debounce = DEFAULT_DEBOUNCE_IN_MS,
    maxLength = DEFAULT_MAX_LENGTH,
    mergeStrategy: merge = DEFAULT_MERGE_STRATEGY,
  } = options;

  console.log(mutation.name);

  const overflowed = ref(false);
  const loading = ref(false);
  let abortController: AbortController | null = null;
  let batch: TVariables = {} as TVariables;
  let calledCount = 0;
  let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let mutationOptions: MutateOverrideOptions<TData> | undefined;

  async function add(
    args: TVariables,
    overrideOptions?: MutateOverrideOptions<TData> | undefined,
  ): Promise<FetchResult<TData> | null> {
    clearPreviousDebounce();
    batch = merge(batch, args);
    mutationOptions = overrideOptions;
    calledCount += 1;

    if (calledCount >= maxLength) {
      overflowed.value = true;
    }
    return new Promise((resolve, reject) => {
      debounceTimeoutId = setTimeout(async () => {
        try {
          loading.value = true;
          const result = await executeBatch();
          resolve(result);
          resetBatchState();
        } catch (error) {
          if (error instanceof Error && error.toString() !== (AbortReason.Explicit as string)) {
            reject(error);
          }
        }
      }, debounce);
    });
  }

  function clearPreviousDebounce() {
    abortController?.abort(AbortReason.Explicit);
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
  }

  async function executeBatch(): Promise<FetchResult<TData> | null> {
    abortController = new AbortController();
    return await mutation(batch, {
      context: { fetchOptions: { signal: abortController.signal } },
      ...mutationOptions,
    });
  }

  function resetBatchState() {
    overflowed.value = false;
    abortController = null;
    batch = {} as TVariables;
    calledCount = 0;
    loading.value = false;
  }

  return { overflowed, add, loading };
}
