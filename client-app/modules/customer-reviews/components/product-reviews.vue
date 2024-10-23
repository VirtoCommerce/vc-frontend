<template>
  <VcWidget
    v-if="reviews?.length || feedbackAvailable"
    :title="$t('common.labels.feedback')"
    prepend-icon="chat"
    size="lg"
    class="text-sm"
  >
    <template v-if="reviews?.length">
      <div class="mb-4 lg:flex lg:justify-between">
        <div v-if="productRating" class="flex">
          <span class="mr-2 content-center">{{ $t("common.labels.rating") }}:</span>
          <ProductRating :rating="productRating" class="font-bold" />
        </div>

        <div v-if="reviews.length" class="max-lg:mt-3 lg:flex">
          <span class="mr-2 content-center font-bold max-lg:hidden">
            {{ $t("common.labels.sort_by_date") }}
          </span>

          <VcSelect
            v-model="sortByDate"
            :items="sortByDateItems"
            :disabled="fetching"
            text-field="label"
            value-field="id"
            @change="changeSortByDate"
          />
        </div>
      </div>

      <div class="divide-y rounded border">
        <div v-for="review in reviews" :key="review.id" class="space-y-2 p-4">
          <div class="flex justify-between gap-2">
            <div>
              {{ review.userName }}
              <div class="text-neutral-400">
                {{ $d(review.createdDate, "short") }}
              </div>
            </div>

            <ReviewRating :rating="review.rating" read-only />
          </div>

          <div>
            {{ review.review }}
          </div>
        </div>
      </div>

      <div class="mb-6 mt-5 justify-end text-center sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <VcButton
          v-if="isAuthenticated && feedbackAvailable && !reviewFormVisible && !reviewSubmitted"
          variant="outline"
          class="max-sm:mb-10 max-sm:w-[18.125rem] sm:order-last"
          @click="reviewFormVisible = true"
        >
          {{ $t("common.buttons.leave_feedback") }}
        </VcButton>

        <VcPagination
          v-if="pagesCount > 1"
          v-model:page="pageNumber"
          :pages="pagesCount"
          class="grow max-sm:flex max-sm:justify-center"
          @update:page="changePage"
        />
      </div>
    </template>

    <div v-if="isAuthenticated && feedbackAvailable">
      <div v-if="reviewSubmitted" class="flex items-center gap-3 text-lg font-bold">
        <VcIcon name="check-circle" :size="48" class="block text-success" />
        {{ $t("common.messages.thanks_for_feedback") }}
      </div>

      <template v-if="reviewFormVisible && !reviewSubmitted">
        <div class="flex justify-between">
          <div class="text-lg font-bold">
            {{ $t("common.labels.item_as_described_by_vendor") }}
          </div>

          <div>
            <div class="mb-2 font-bold">
              {{ $t("common.labels.rate_product") }}
              <span class="text-danger">*</span>
            </div>
            <ReviewRating :rating="newReviewRating" @set-rating="setRating" />
          </div>
        </div>

        <VcTextarea v-model="newReviewContent" :label="$t('common.labels.comments')" required class="mt-4" />

        <div class="mt-4">
          <span class="text-danger">*</span>
          {{ $t("common.labels.fields_required") }}
        </div>

        <div class="mt-4 flex flex-wrap justify-between gap-3 max-xs:justify-center">
          <VcButton
            v-if="reviews?.length"
            :disabled="fetching"
            color="neutral"
            variant="outline"
            min-width="12rem"
            @click="reviewFormVisible = false"
          >
            {{ $t("common.buttons.cancel") }}
          </VcButton>

          <VcButton
            :disabled="!newReviewContent || newReviewRating === 0"
            :loading="fetching"
            variant="solid"
            min-width="12rem"
            @click="submitReview"
          >
            {{ $t("common.buttons.submit") }}
          </VcButton>
        </div>
      </template>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account";
import { useCustomerReviews } from "../useCustomerReviews";
import ProductRating from "./product-rating.vue";
import ReviewRating from "./review-rating.vue";
import type { Rating } from "../api/graphql/types";

const props = defineProps<IProps>();

const ENTITY_TYPE = "Product";

const { t } = useI18n();
const { isAuthenticated } = useUser();

interface IProps {
  productId: string;
  productRating?: Rating;
}

const sortByDateItems = [
  {
    id: "createddate:desc",
    label: t("common.labels.date_new_to_old"),
  },
  {
    id: "createddate:asc",
    label: t("common.labels.date_old_to_new"),
  },
];

const { fetching, pagesCount, pageNumber, reviews, canLeaveFeedback, createCustomerReview, fetchCustomerReviews } =
  useCustomerReviews();

const productId = toRef(props, "productId");

const sortByDate = ref(sortByDateItems[0].id);
const reviewSubmitted = ref(false);
const newReviewRating = ref(0);
const newReviewContent = ref("");
const feedbackAvailable = ref(false);
const reviewFormVisible = ref(false);
const productReviewsPayload = ref({
  entityId: productId.value,
  entityType: ENTITY_TYPE,
  page: 1,
  sort: "createddate:desc",
});

async function changeSortByDate(value: string): Promise<void> {
  productReviewsPayload.value.page = 1;
  productReviewsPayload.value.sort = value;

  await fetchCustomerReviews(productReviewsPayload.value);
}

async function changePage(page: number): Promise<void> {
  productReviewsPayload.value.page = page;

  await fetchCustomerReviews(productReviewsPayload.value);
}

function setRating(value: number): void {
  newReviewRating.value = value;
}

async function submitReview(): Promise<void> {
  await createCustomerReview({
    entityId: productId.value,
    entityType: ENTITY_TYPE,
    review: newReviewContent.value,
    rating: newReviewRating.value,
  });

  await fetchCustomerReviews(productReviewsPayload.value);

  newReviewContent.value = "";
  newReviewRating.value = 0;
  reviewSubmitted.value = true;
}

onMounted(async () => {
  await fetchCustomerReviews(productReviewsPayload.value);

  if (isAuthenticated.value) {
    feedbackAvailable.value = await canLeaveFeedback(props.productId, ENTITY_TYPE);
    reviewFormVisible.value = !reviews.value?.length;
  }
});
</script>
