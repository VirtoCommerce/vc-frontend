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
type MutationBatcherType = ReturnType<typeof useMutationBatcher>;
type CallbackType<T1 extends MutationBatcherType, T2 extends MutationBatcherType> = (params: {
  args: unknown;
  currentBatcher: T1 | T2;
  anotherBatcher: T1 | T2;
}) => void;

export function useSyncMutationBatchers<T extends MutationBatcherType>(
  batcher1: T1,
  batcher2: T2,
  callback: CallbackType<T1, T2>,
) {
  function onAddHandler(id: string, args: unknown) {
    const currentBatcher = batcher1.id === id ? batcher1 : batcher2;
    const anotherBatcher = (batcher1.id === id ? batcher2 : batcher1) as typeof currentBatcher extends T1 ? T2 : T1;
    callback({ args, currentBatcher, anotherBatcher });
  }

  batcher1.registerOnAddHandler(onAddHandler);
  batcher2.registerOnAddHandler(onAddHandler);
}
