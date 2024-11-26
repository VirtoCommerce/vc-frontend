import { isDefined } from "@vueuse/core";
import { computed, readonly, ref } from "vue";
import { Logger } from "@/core/utilities";
import { getCustomerReviews } from "./api/graphql";
import { createReview } from "./api/graphql/mutations/createReview";
import { canLeaveFeedback } from "./api/graphql/queries/canLeaveFeedback";
import { PAGE_SIZE } from "./constants";
import type { CustomerReview, ReviewValidationErrorType } from "./api/graphql/types";
import type { Ref } from "vue";

export function useCustomerReviews() {
  const fetching: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(PAGE_SIZE);
  const pagesCount: Ref<number> = ref(0);
  const pageNumber: Ref<number> = ref(1);
  const reviews: Ref<CustomerReview[] | undefined> = ref();
  const errors: Ref<ReviewValidationErrorType[] | undefined> = ref();

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
      pageNumber.value = payload.page;
      pagesCount.value = Math.ceil((response?.totalCount ?? 0) / PAGE_SIZE);
    } catch (e) {
      Logger.error(`${useCustomerReviews.name}.${fetchCustomerReviews.name}`, e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  async function _canLeaveFeedback(entityId: string, entityType: string): Promise<boolean> {
    try {
      const response = await canLeaveFeedback({ entityId, entityType });
      return isDefined(response) && response;
    } catch (e) {
      Logger.error(`${useCustomerReviews.name}.${canLeaveFeedback.name}`);
      throw e;
    }
  }

  async function createCustomerReview(payload: {
    entityId: string;
    entityType: string;
    review: string;
    rating: number;
  }): Promise<void> {
    fetching.value = true;

    try {
      const result = await createReview(payload);
      errors.value = result?.validationErrors;
    } catch (e) {
      Logger.error(`${useCustomerReviews.name}.${createCustomerReview.name}`);
    } finally {
      fetching.value = false;
    }
  }

  return {
    reviews: computed(() => reviews.value),
    fetching: readonly(fetching),
    itemsPerPage: readonly(itemsPerPage),
    pagesCount: readonly(pagesCount),
    pageNumber: readonly(pageNumber),
    errors: readonly(errors),
    fetchCustomerReviews,
    canLeaveFeedback: _canLeaveFeedback,
    createCustomerReview,
  };
}
