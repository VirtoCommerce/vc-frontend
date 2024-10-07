import { computed, ref } from "vue";
import { useGetPurchaseRequestsQuery } from "@/core/api/graphql/purchase-request/queries/getPurchaseRequests";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 10;

export function usePurchaseRequests() {
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const page: Ref<number> = ref(1);

  const { loading, result, refetch } = useGetPurchaseRequestsQuery({
    first: itemsPerPage.value,
    after: String((page.value - 1) * itemsPerPage.value),
  });
  const purchaseRequests = computed(() => result.value?.purchaseRequests?.items ?? []);
  const pages = computed(() => Math.ceil((result.value?.purchaseRequests?.totalCount ?? 0) / itemsPerPage.value));

  return {
    loading,
    purchaseRequests,
    itemsPerPage,
    page,
    pages,
    refetch,
  };
}
