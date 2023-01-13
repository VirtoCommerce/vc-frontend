import { MaybeRef } from "@vueuse/core";
import { Ref, ref, readonly, DeepReadonly } from "vue";
import { Load, UseLoading, useLoading } from "./useLoading";

export interface UseItem<Item> extends UseLoading {
  item: Ref<DeepReadonly<Item | null>>;
}

export function useItem<Param, Item>(param: MaybeRef<Param>, innerLoad: Load<void, Item | null>): UseItem<Item> {
  const item: Ref<Item | null> = ref(null);

  const { loading, load } = useLoading(param, async () => {
    item.value = await innerLoad();
  });

  return {
    loading,
    load,
    item: readonly(item),
  };
}
