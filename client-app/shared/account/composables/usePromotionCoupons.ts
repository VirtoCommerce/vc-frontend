import { computed, ref } from "vue";
import { getPromotionCoupons } from "@/core/api/graphql";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";

export function usePromotionCoupons() {
  const page = ref(1);

  const { result, loading } = getPromotionCoupons(
    computed(() => ({
      first: DEFAULT_PAGE_SIZE,
      after: String((page.value - 1) * DEFAULT_PAGE_SIZE),
    })),
  );

  const coupons = computed(() => result.value?.promotionCoupons?.items ?? []);
  const pagesCount = computed(() => Math.ceil((result.value?.promotionCoupons?.totalCount ?? 0) / DEFAULT_PAGE_SIZE));

  return {
    loading,
    coupons,
    page,
    pagesCount,
  };
}
