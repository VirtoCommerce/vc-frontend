import type { useMutationBatcher } from "./useMutationBatcher";

/**
 * @description Synchronizes two mutation batchers by calling a callback when a mutation is added to either batcher.
 * @param batcher1 - The first mutation batcher.
 * @param batcher2 - The second mutation batcher.
 * @param callback - A callback function that will be called when a mutation is added to either batcher.
 *   The callback receives an object with the following properties:
 *     - `args`: The arguments passed to the `add` method of the batcher.
 *     - `currentBatcher`: The batcher to which the mutation was added.
 *     - `anotherBatcher`: The other batcher.
 * @example ```ts
 * const selectCartBatcher = useMutationBatcher(selectCartMutation);
 * const unselectCartBatcher = useMutationBatcher(unselectCartMutation);
 *
 * useSyncMutationBatchers(
 *   selectCartBatcher,
 *   unselectCartBatcher,
 *   ({ args, currentBatcher, anotherBatcher }) => {
 *     // Logic to synchronize the batchers based on the added mutation.
 *   }
 * );
 * ```
 */
type MutationBatcherType<TData, TVariables extends object> = ReturnType<typeof useMutationBatcher<TData, TVariables>>;
type CallbackType<T1, T2, Args> = (params: { args: Args; currentBatcher: T1; anotherBatcher: T2 }) => void;

export function useSyncMutationBatchers<TData1, TVariables1 extends object, TData2, TVariables2 extends object>(
  batcher1: MutationBatcherType<TData1, TVariables1>,
  batcher2: MutationBatcherType<TData2, TVariables2>,
  callback: CallbackType<
    MutationBatcherType<TData1, TVariables1>,
    MutationBatcherType<TData2, TVariables2>,
    TVariables1 | TVariables2
  >,
) {
  function onAddHandler(id: string, args: TVariables1 | TVariables2) {
    const currentBatcher = (batcher1.id === id ? batcher1 : batcher2) as typeof batcher1 extends MutationBatcherType<
      TData1,
      TVariables1
    >
      ? MutationBatcherType<TData1, TVariables1>
      : MutationBatcherType<TData2, TVariables2>;
    const anotherBatcher = (batcher1.id === id ? batcher2 : batcher1) as typeof batcher1 extends MutationBatcherType<
      TData1,
      TVariables1
    >
      ? MutationBatcherType<TData2, TVariables2>
      : MutationBatcherType<TData1, TVariables1>;
    callback({ args, currentBatcher, anotherBatcher });
  }

  batcher1.registerOnAddHandler(onAddHandler);
  batcher2.registerOnAddHandler(onAddHandler);
}
