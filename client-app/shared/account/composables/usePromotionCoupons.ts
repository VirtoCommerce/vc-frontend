import { computed, ref, toValue } from "vue";
import { getPromotionCoupons } from "@/core/api/graphql";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import type { GetPromotionCouponsQueryVariables } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { MaybeRefOrGetter, MaybeRef } from "vue";

export function usePromotionCoupons(
  itemsPerPage?: MaybeRefOrGetter<number>,
  variables?: Partial<GetPromotionCouponsQueryVariables>,
  queryEnabled?: MaybeRef<boolean>,
) {
  const pageSize = ref(toValue(itemsPerPage) ?? DEFAULT_PAGE_SIZE);
  const page = ref(1);
  const sort = ref<ISortInfo>(new Sort("endDate", SortDirection.Ascending));

  const { result, loading } = getPromotionCoupons(
    computed(() => ({
      first: toValue(pageSize),
      after: String((page.value - 1) * toValue(pageSize)),
      sort: sort.value.toString(),
      ...variables,
    })),
    queryEnabled,
  );

  const coupons = computed(() => result.value?.promotionCoupons?.items ?? []);
  const pagesCount = computed(() => Math.ceil((result.value?.promotionCoupons?.totalCount ?? 0) / toValue(pageSize)));

  return {
    loading,
    coupons,
    page,
    sort,
    pagesCount,
  };
}
