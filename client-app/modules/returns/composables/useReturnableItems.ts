import { computed, ref, toValue, watch } from "vue";
import { useCreateReturnMutation } from "@/modules/returns/api/graphql/mutations/createReturn";
import { useGetReturnableItemsQuery } from "@/modules/returns/api/graphql/queries/getReturnableItems";
import type { CreateReturnMutation, ReturnableItemType } from "@/modules/returns/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

/**
 * Drives the "select items to return" step: what the order offers, and how much of each line
 * the buyer picked. Quantities live here rather than in the page so the wizard can carry them
 * to the next step once creating a draft is wired up.
 */
export function useReturnableItems(orderId: MaybeRefOrGetter<string>) {
  /** Requested quantity per order line item id; a line missing from the map is not selected. */
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

  /**
   * Clamped to what the server says is returnable — the server re-checks on submit anyway, but
   * silently sending more than is available only loses the buyer's draft.
   */
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

  // A different order means a different set of lines; keeping the old picks would silently
  // carry quantities onto line items they do not belong to.
  watch(
    () => toValue(orderId),
    () => {
      quantities.value = {};
    },
  );

  /**
   * Turns the picked quantities into a draft return.
   *
   * Reasons are not collected here — the wizard asks for them on the next screen, and the draft
   * exists so those answers have somewhere to live.
   */
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
