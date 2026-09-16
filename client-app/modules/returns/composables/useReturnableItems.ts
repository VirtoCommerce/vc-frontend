import { computed, ref, toValue, watch } from "vue";
import { useCreateReturnMutation } from "@/modules/returns/api/graphql/mutations/createReturn";
import { useGetReturnableItemsQuery } from "@/modules/returns/api/graphql/queries/getReturnableItems";
import type { CreateReturnMutation, ReturnableItemType } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

export function useReturnableItems(orderId: MaybeRefOrGetter<string>) {
  const quantities = ref<Record<string, number>>({});

  const { result, loading, refetch } = useGetReturnableItemsQuery(computed(() => ({ orderId: toValue(orderId) })));
  const { mutate: createReturnMutation, loading: creating } = useCreateReturnMutation();

  const items = computed<ReturnableItemType[]>(() => result.value?.returnableItems ?? []);
  const returnableItems = computed(() => items.value.filter((item) => item.isReturnable));

  const selectedItems = computed(() =>
    returnableItems.value
      .filter((item) => (quantities.value[item.orderLineItemId] ?? 0) > 0)
      .map((item) => ({ item, quantity: quantities.value[item.orderLineItemId] })),
  );

  const selectedQuantity = computed(() => selectedItems.value.reduce((sum, { quantity }) => sum + quantity, 0));
  const allSelected = computed(
    () => returnableItems.value.length > 0 && selectedItems.value.length === returnableItems.value.length,
  );

  function setQuantity(item: ReturnableItemType, quantity: number): void {
    const clamped = Math.min(Math.max(Math.trunc(quantity) || 0, 0), item.returnableQuantity);

    if (clamped > 0) {
      quantities.value[item.orderLineItemId] = clamped;
    } else {
      delete quantities.value[item.orderLineItemId];
    }
  }

  function toggleAll(selected: boolean): void {
    quantities.value = {};

    if (selected) {
      returnableItems.value.forEach((item) => setQuantity(item, item.returnableQuantity));
    }
  }

  watch(
    () => toValue(orderId),
    () => {
      quantities.value = {};
    },
  );

  async function createDraft(): Promise<CreateReturnMutation["createReturn"]> {
    if (selectedItems.value.length === 0) {
      return undefined;
    }

    const created = await createReturnMutation({
      command: {
        orderId: toValue(orderId),
        items: selectedItems.value.map(({ item, quantity }) => ({
          orderLineItemId: item.orderLineItemId,
          quantity,
        })),
      },
    });

    return created?.data?.createReturn;
  }

  return {
    loading,
    creating,
    items,
    returnableItems,
    quantities,
    selectedItems,
    selectedQuantity,
    allSelected,
    setQuantity,
    toggleAll,
    createDraft,
    refetch,
  };
}
