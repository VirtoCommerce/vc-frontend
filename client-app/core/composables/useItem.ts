import { ref, readonly } from "vue";
import { useAsync } from "./useAsync";
import type { AsyncActionType } from "./useAsync";
import type { IHasLoading } from "./useLoading";
import type { Ref, DeepReadonly } from "vue";

export interface IUseItem<Item> extends IHasLoading {
  load: AsyncActionType;
  item: Readonly<Ref<DeepReadonly<Item | null>>>;
}

/**
 * Wrap single item loading
 * @param innerLoad Inner load action, usually API call
 * @example
 * export type UseProduct = UseItem<Product>;
 *
 * export function useProduct(id: MaybeRef<string>): UseProduct {
 *   const { loading, item, load } = useItem(async () => {
 *     return await getProduct(unref(id));
 *   });
 *
 *   return {
 *     loading,
 *     load,
 *     item,
 *   };
 * }
 */
export function useItem<Item>(innerLoad: AsyncActionType<void, Item | null>): IUseItem<Item> {
  const item: Ref<Item | null> = ref(null);

  const { loading, action: load } = useAsync(async () => {
    item.value = await innerLoad();
  });

  return {
    loading,
    load,
    item: readonly(item),
  };
}
