import type { useMutationBatcher } from "./useMutationBatcher";

type MutationBatcherType = ReturnType<typeof useMutationBatcher> & { id: string }; // Ensure `id` is part of the type
type CallbackType<T1, T2> = (params: { args: unknown; currentBatcher: T1; anotherBatcher: T2 }) => void;

export function useSyncMutationBatchers<T1 extends MutationBatcherType, T2 extends MutationBatcherType>(
  batcher1: T1,
  batcher2: T2,
  callback: CallbackType<T1, T2>,
) {
  function onAddHandler() {
    return (id: string, args: unknown) => {
      const currentBatcher = batcher1.id === id ? batcher1 : batcher2;
      const anotherBatcher = batcher1.id === id ? batcher2 : batcher1;
      callback({ args, currentBatcher, anotherBatcher });
    };
  }

  batcher1.registerOnAddHandler(onAddHandler());
  batcher2.registerOnAddHandler(onAddHandler());
}
