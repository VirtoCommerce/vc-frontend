import { ApolloError } from "@apollo/client/core";
import cloneDeep from "lodash/cloneDeep";
import mergeWith from "lodash/mergeWith";
import noop from "lodash/noop";
import uniqueId from "lodash/uniqueId";
import { ref } from "vue";
import { AbortReason } from "@/core/api/common/enums";
import { uniqByLast } from "@/core/utilities/common";
import { DEFAULT_DEBOUNCE_IN_MS } from "@/shared/cart/constants";
import type { UniqByLastIterateeType } from "@/core/utilities/common";
import type { FetchResult } from "@apollo/client/core";
import type { MutateFunction, MutateOverrideOptions } from "@vue/apollo-composable";
import type { Ref } from "vue";

const DEFAULT_MAX_LENGTH = 10;

/**
 * @description Default merge strategy for batched mutation parameters.
 */
function DEFAULT_MERGE_STRATEGY<TVariables extends object>(a: TVariables, b: TVariables): TVariables {
  const result = cloneDeep(a);
  mergeWith(result, b, (objValue: TVariables, srcValue: TVariables) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
      return [...objValue, ...srcValue];
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
    mergeWith(result, b, (objValue: TVariables, srcValue: TVariables) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return uniqByLast([...objValue, ...srcValue], keyOrFn as UniqByLastIterateeType<TVariables>);
      }
    });
    return result;
  };
}

/**
 * @description Vue composable to batch Apollo Client mutations.
 * @param mutation - Apollo Client mutation function.
 * @param options - Options object with `debounce`, `maxLength`, and `mergeStrategy` properties.
 * @param options.debounce - Debounce time in milliseconds. Default is {@link DEFAULT_DEBOUNCE_IN_MS}.
 * @param options.maxLength - Maximum number of mutations to batch. Default is {@link DEFAULT_MAX_LENGTH}. After reaching this number, `overflowed` ref will be set to `true`.
 * @param options.mergeStrategy - Function to merge two mutation parameters objects. See {@link DEFAULT_MERGE_STRATEGY} and {@link getMergeStrategyUniqueBy}
 * @returns {object} An object with the following properties:
 *   - `id`: A unique identifier for the batcher instance.
 *   - `overflowed`: A boolean ref indicating whether the batch has exceeded the maximum length.
 *   - `add`: A function to add a new mutation to the batch.
 *   - `loading`: A boolean ref indicating whether the batch is currently being processed.
 *   - `abort`: A function to abort the current batch.
 *   - `arguments`: A ref containing the current batch arguments.
 *   - `registerOnAddHandler`: A function to register a handler that will be called when a new mutation is added to the batch.
 * @example ```ts
 * const { mutate: changeCartItemsQuantity } = useChangeCartItemsQuantity();
 * const { overflowed, add, loading } = useMutationBatcher(changeCartItemsQuantity);
 * const result = await add({ command: { cartItems: [{ productId: "1", quantity: 1}] }});
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

  const id = uniqueId();
  const overflowed = ref(false);
  const loading = ref(false);
  let abortController: AbortController | null = null;
  const batch = ref({}) as Ref<TVariables>;
  let calledCount = 0;
  let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let mutationOptions: MutateOverrideOptions<TData> | undefined;
  let onAddHandler: (id: string, args: TVariables) => void = noop;

  async function add(
    args: TVariables,
    overrideOptions?: MutateOverrideOptions<TData> | undefined,
    fireAddHandler = true,
  ): Promise<FetchResult<TData> | null> {
    loading.value = true;
    if (fireAddHandler) {
      onAddHandler(id, args);
    }
    clearPreviousDebounce();
    batch.value = merge(batch.value, args);
    mutationOptions = overrideOptions;
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
          const explicitError = AbortReason.Explicit as string;
          if (
            !(error instanceof Error && error.toString() === explicitError) &&
            !(error instanceof ApolloError && error.networkError?.toString() === explicitError)
          ) {
            loading.value = false;
            reject(error instanceof Error ? error : new Error(error as string));
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
    return await mutation(batch.value, {
      context: { fetchOptions: { signal: abortController.signal } },
      ...mutationOptions,
    });
  }

  function resetBatchState() {
    overflowed.value = false;
    abortController = null;
    batch.value = {} as TVariables;
    loading.value = false;
    calledCount = 0;
  }

  function registerOnAddHandler(handler: (id: string, args: TVariables) => void) {
    onAddHandler = onAddHandler.name === noop.name ? handler : onAddHandler;
  }

  function abort() {
    clearPreviousDebounce();
    abortController = null;
    batch.value = {} as TVariables;
    loading.value = false;
  }

  return {
    id,
    overflowed,
    add,
    loading,
    abort,
    arguments: batch,
    registerOnAddHandler,
  };
}
