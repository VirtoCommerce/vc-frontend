import { computed, ref } from "vue";
import { DEFAULT_SORT } from "@/core/constants";
import { globals } from "@/core/globals";
import { useGetReturnsQuery } from "@/modules/returns/api/graphql/queries/getReturns";
import type { Sort } from "@/core/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 10;

export function useReturns() {
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const page: Ref<number> = ref(1);
  const sort: Ref<Sort> = ref(DEFAULT_SORT);

  const { loading, result, refetch } = useGetReturnsQuery(
    computed(() => ({
      storeId: globals.storeId,
      cultureName: globals.cultureName,
      first: itemsPerPage.value,
      after: String((page.value - 1) * itemsPerPage.value),
      sort: sort.value.toString(),
    })),
  );

  const returns = computed(() => result.value?.returns?.items ?? []);
  const totalCount = computed(() => result.value?.returns?.totalCount ?? 0);
  const pages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value));

  return {
    loading,
    returns,
    totalCount,
    itemsPerPage,
    page,
    pages,
    sort,
    refetch,
  };
}
