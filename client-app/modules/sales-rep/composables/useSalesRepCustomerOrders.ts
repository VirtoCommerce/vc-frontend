import { computed, ref, toValue, watch } from "vue";
import { globals } from "@/core/globals";
import { facets, useUserOrders } from "@/shared/account/composables/useUserOrders";
import { getFilterExpression, useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import type { MaybeRefOrGetter } from "vue";

// The customer's own orders: salesRepOrders narrows to the ones the rep placed themselves.
export function useSalesRepCustomerOrders(organizationId: MaybeRefOrGetter<string>) {
  const orgId = () => toValue(organizationId);

  const { customer, loading: customerLoading, notFound } = useSalesRepCustomer(orgId);
  const {
    orders,
    loading: ordersLoading,
    pages,
    page,
    keyword,
    sort,
    fetchOrders,
  } = useUserOrders({
    organizationId: orgId,
  });
  const {
    appliedFilterData,
    isFilterEmpty,
    filterChipsItems,
    resetFilters,
    removeFilterChipsItem,
    setFacetsLocalization,
  } = useUserOrdersFilter("organization");

  const failed = ref(false);

  // organizationOrders is not store-scoped.
  function buildFilter(): string {
    return [getFilterExpression(keyword.value, appliedFilterData.value), `storeid:"${globals.storeId}"`]
      .filter(Boolean)
      .join(" ");
  }

  async function read(): Promise<void> {
    try {
      await fetchOrders("organization", buildFilter());
      failed.value = false;
    } catch {
      failed.value = true;
    }

    setFacetsLocalization(facets.value);
  }

  // Filter state is shared with the buyer's own Orders list; cleared before the watcher, so it is not a change.
  resetFilters();

  // An organization the rep does not serve must never reach the query.
  const canRead = computed(() => !customerLoading.value && !notFound.value);

  watch(orgId, () => {
    page.value = 1;
  });

  watch(
    [canRead, orgId, page, keyword, sort, appliedFilterData],
    () => {
      if (canRead.value) {
        void read();
      }
    },
    { deep: true, immediate: true },
  );

  return {
    customer,
    notFound,
    orders,
    loading: computed(() => ordersLoading.value || customerLoading.value),
    failed,
    page,
    pages,
    keyword,
    sort,
    isFilterEmpty,
    filterChipsItems,
    resetFilters,
    removeFilterChipsItem,
  };
}
