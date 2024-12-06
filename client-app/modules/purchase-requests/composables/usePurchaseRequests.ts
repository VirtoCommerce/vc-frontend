import { computed, ref } from "vue";
import { DEFAULT_SORT } from "@/core/constants";
import { useGetPurchaseRequestsQuery } from "@/modules/purchase-requests/api/graphql/queries/getPurchaseRequests";
import type { Sort } from "@/core/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 5;

export function usePurchaseRequests() {
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const page: Ref<number> = ref(1);
  const sort: Ref<Sort> = ref(DEFAULT_SORT);

  const { loading, result, refetch } = useGetPurchaseRequestsQuery(
    computed(() => ({
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
      sort: sort.value.toString(),
    })),
  );
  const purchaseRequests = computed(() => result.value?.purchaseRequests?.items ?? []);
  const pages = computed(() => Math.ceil((result.value?.purchaseRequests?.totalCount ?? 0) / itemsPerPage.value));

  return {
    loading,
    purchaseRequests,
    itemsPerPage,
    page,
    pages,
    sort,
    refetch,
  };
}
