import { computed, readonly, ref } from "vue";
import { getCustomerReviews } from "@/core/api/graphql/common/queries/getCustomerReviews";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { Logger } from "@/core/utilities";
import type { CustomerReview } from "@/core/api/graphql/types";

export function useCustomerReviews() {
  const { isEnabled } = useModuleSettings("VirtoCommerce.CustomerReviews");

  const PAGE_SIZE = 5;

  const fetching = ref(false);
  const pagesCount = ref(0);
  const reviews = ref<CustomerReview[]>();

  async function fetchCustomerReviews(payload: {
    entityId: string;
    entityType: string;
    page: number;
    sort: string;
  }): Promise<void> {
    fetching.value = true;

    try {
      const response = await getCustomerReviews({
        ...payload,
        first: PAGE_SIZE,
        after: ((payload.page - 1) * PAGE_SIZE).toString(),
      });
      reviews.value = response?.items as CustomerReview[];
      pagesCount.value = Math.ceil((response?.totalCount ?? 0) / PAGE_SIZE);
    } catch (e) {
      Logger.error(`${useCustomerReviews.name}.${fetchCustomerReviews.name}`);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  return {
    enabled: computed(() => isEnabled("CustomerReviews.CustomerReviewsEnabled")),
    enabledForAnonymous: computed(() => isEnabled("CustomerReviews.CustomerReviewsEnabledForAnonymous")),
    onlyForPurchasedProduct: computed(() => isEnabled("CustomerReviews.CanSubmitReviewWhenHasOrder")),
    reviews: computed(() => reviews.value),
    fetching: readonly(fetching),
    pagesCount: readonly(pagesCount),
    fetchCustomerReviews,
  };
}
