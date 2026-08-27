<template>
  <VcWidget
    v-if="reviews?.length || feedbackAvailable"
    :title="$t('common.labels.feedback')"
    prepend-icon="chat"
    size="lg"
    class="product-reviews"
  >
    <template v-if="reviews?.length">
      <div class="product-reviews__head">
        <ProductRating v-if="productRating" :rating="productRating" />

        <div v-if="reviews.length" class="product-reviews__sort">
          <VcTypography tag="span" class="product-reviews__sort-label">
            {{ $t("common.labels.sort_by_date") }}
          </VcTypography>

          <span class="sr-only">
            {{ $t("common.labels.sort_by_date") }}
          </span>

          <VcSelect
            v-model="sortByDate"
            :items="sortByDateItems"
            :disabled="fetching"
            size="sm"
            text-field="label"
            value-field="id"
            @change="changeSortByDate"
          />
        </div>
      </div>

      <section class="product-reviews__list" :aria-label="$t('common.labels.product_reviews')">
        <article v-for="review in reviews" :key="review.id" class="product-reviews__item">
          <div class="product-reviews__item-head">
            <div>
              <VcTypography tag="h3" variant="base" class="product-reviews__author">
                {{ review.userName }}
              </VcTypography>

              <VcTypography tag="span" variant="base" class="product-reviews__date">
                {{ $d(review.createdDate, "short") }}
              </VcTypography>
            </div>

            <VcRating mode="full" size="xs" :value="review.rating" :with-text="false" read-only />
          </div>

          <VcTypography tag="p" class="product-reviews__text">
            {{ review.review }}
          </VcTypography>

          <div v-if="review.images?.length" class="product-reviews__photos">
            <button
              v-for="(image, index) in review.images"
              :key="image?.id ?? index"
              type="button"
              class="product-reviews__photo"
              :aria-label="
                $t('common.labels.product_review_image_of', { index: index + 1, total: review.images.length })
              "
              @click="openImagesModal(review, index)"
            >
              <VcImage
                :src="image?.url"
                :alt="$t('common.labels.product_review_image')"
                size-suffix="sm"
                lazy
                class="product-reviews__photo-img"
              />

              <span class="product-reviews__photo-overlay" aria-hidden="true">
                <VcIcon name="search" size="sm" />
              </span>
            </button>
          </div>
        </article>
      </section>

      <div class="product-reviews__footer">
        <VcButton
          v-if="isAuthenticated && feedbackAvailable && !reviewFormVisible && !reviewSubmitted"
          variant="outline"
          tabindex="0"
          class="product-reviews__leave-button"
          @click="reviewFormVisible = true"
        >
          {{ $t("common.buttons.leave_feedback") }}
        </VcButton>

        <VcPagination
          v-if="pagesCount > 1"
          v-model:page="pageNumber"
          :pages="pagesCount"
          class="product-reviews__pagination"
          @update:page="changePage"
        />
      </div>
    </template>

    <div v-if="isAuthenticated && feedbackAvailable">
      <div v-if="reviewSubmitted" class="product-reviews__thanks">
        <VcIcon name="check-circle" :size="48" class="product-reviews__thanks-icon" aria-hidden="true" />
        {{ $t("common.messages.thanks_for_feedback") }}
      </div>

      <form v-if="reviewFormVisible && !reviewSubmitted" class="product-reviews__form" @submit.prevent="submitReview">
        <div class="product-reviews__form-head">
          <VcTypography tag="h3" variant="h4" text-transform="none">
            {{ $t("common.labels.item_as_described_by_vendor") }}
          </VcTypography>

          <div>
            <VcTypography tag="span" class="product-reviews__rate-label">
              {{ $t("common.labels.rate_product") }}
              <span class="product-reviews__required">*</span>
            </VcTypography>

            <VcRating
              mode="full"
              size="xs"
              class="product-reviews__form-rating"
              :read-only="false"
              :value="newReviewRating"
              :with-text="false"
              @set-rating="setRating"
            />
          </div>
        </div>

        <VcTextarea
          v-model="newReviewContent"
          :label="$t('common.labels.comments')"
          required
          class="product-reviews__comments"
          :aria-label="$t('common.labels.comments')"
        />

        <VcTypography tag="span" class="product-reviews__note">
          <span class="product-reviews__required">*</span>
          {{ $t("common.labels.fields_required") }}
        </VcTypography>

        <VcWidget class="product-reviews__uploader">
          <VcFileUploader
            v-bind="imageOptions"
            :files="files"
            removable
            @add-files="onAddFiles"
            @remove-files="onRemoveFiles"
          />
        </VcWidget>

        <div class="product-reviews__actions">
          <VcButton
            v-if="reviews?.length"
            :disabled="fetching"
            color="neutral"
            variant="outline"
            min-width="12rem"
            tabindex="0"
            @click="reviewFormVisible = false"
          >
            {{ $t("common.buttons.cancel") }}
          </VcButton>

          <VcButton
            :disabled="!newReviewContent || newReviewRating === 0"
            :loading="fetching"
            variant="solid"
            type="submit"
            tabindex="0"
            min-width="12rem"
          >
            {{ $t("common.buttons.submit") }}
          </VcButton>
        </div>
      </form>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { onActivated, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account";
import { useFiles } from "@/shared/files";
import { useModal } from "@/shared/modal";
import { DEFAULT_REVIEW_IMAGES_SCOPE } from "../constants";
import { useCustomerReviews } from "../useCustomerReviews";
import ProductRating from "./product-rating.vue";
import ReviewImagesModal from "./review-images-modal.vue";
import type { CustomerReview, CustomerReviewImage } from "../api/graphql/types";
import type { Rating } from "@/core/api/graphql/types";

const props = defineProps<IProps>();

const ENTITY_TYPE = "Product";

const { t, d } = useI18n();
const { openModal } = useModal();
const { isAuthenticated } = useUser();
const {
  files,
  options: imageOptions,
  uploadedFiles: uploadedReviewImages,
  fetchOptions: fetchImageUploadOptions,
  addFiles,
  validateFiles,
  uploadFiles,
  removeFiles,
} = useFiles(DEFAULT_REVIEW_IMAGES_SCOPE);
const { fetching, pagesCount, pageNumber, reviews, canLeaveFeedback, createCustomerReview, fetchCustomerReviews } =
  useCustomerReviews();

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
function openImagesModal(review: CustomerReview, index: number): void {
  const images = review.images?.filter((image): image is CustomerReviewImage => !!image) ?? [];

  if (!images.length) {
    return;
  }

  openModal({
    component: ReviewImagesModal,
    props: {
      images,
      index,
      author: review.userName,
      date: d(review.createdDate, "short"),
    },
  });
}

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
    imageUrls: uploadedReviewImages.value?.map((item) => item.url),
  });

  await fetchCustomerReviews(productReviewsPayload.value);

  newReviewContent.value = "";
  newReviewRating.value = 0;
  reviewSubmitted.value = true;
}

function onAddFiles(items: INewFile[]) {
  addFiles(items);
  validateFiles();

  void uploadFiles();
}

async function onRemoveFiles(items: FileType[]): Promise<void> {
  await removeFiles(items);
}

onActivated(async () => {
  await fetchCustomerReviews(productReviewsPayload.value);

  if (isAuthenticated.value) {
    feedbackAvailable.value = await canLeaveFeedback(props.productId, ENTITY_TYPE);
    reviewFormVisible.value = !reviews.value?.length;

    if (feedbackAvailable.value) {
      await fetchImageUploadOptions();
    }
  }
});
</script>

<style lang="scss">
.product-reviews {
  $photo: "";

  @apply text-sm;

  &__head {
    @apply mb-4;

    @media (width >= theme("screens.lg")) {
      @apply flex justify-between;
    }
  }

  &__sort {
    @media (width < theme("screens.lg")) {
      @apply mt-3;
    }

    @media (width >= theme("screens.lg")) {
      @apply flex;
    }
  }

  &__sort-label {
    @apply me-2 content-center text-sm font-bold;

    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__list {
    @apply divide-y rounded-[--vc-radius] border;
  }

  &__item {
    @apply space-y-2 p-4;
  }

  &__item-head {
    @apply flex items-start justify-between gap-2;
  }

  &__author {
    @apply text-sm;
  }

  &__date {
    @apply text-sm text-neutral-500;
  }

  &__text {
    @apply text-sm;
  }

  &__photos {
    @apply flex flex-wrap gap-2;
  }

  &__photo {
    $photo: &;

    @apply relative size-16 shrink-0 overflow-hidden rounded-[--vc-radius] border;

    @media (width >= theme("screens.lg")) {
      @apply size-18;
    }
  }

  &__photo-img {
    @apply size-full object-cover;
  }

  &__photo-overlay {
    @apply absolute inset-0 flex items-center justify-center bg-additional-950/30 text-additional-50 opacity-0 transition-opacity;

    #{$photo}:hover &,
    #{$photo}:focus-visible & {
      @apply opacity-100;
    }
  }

  &__footer {
    @apply mb-6 mt-5 justify-end text-center;

    @media (width >= theme("screens.sm")) {
      @apply flex flex-wrap items-center gap-3;
    }
  }

  &__leave-button {
    @media (width < theme("screens.sm")) {
      @apply mb-10 w-[18.125rem];
    }

    @media (width >= theme("screens.sm")) {
      @apply order-last;
    }
  }

  &__pagination {
    @apply grow;

    @media (width < theme("screens.sm")) {
      @apply flex justify-center;
    }
  }

  &__thanks {
    @apply flex items-center gap-3 text-lg font-bold;
  }

  &__thanks-icon {
    @apply block text-success;
  }

  &__form-head {
    @apply flex justify-between;
  }

  &__rate-label {
    @apply text-sm font-bold;
  }

  &__form-rating {
    @apply mt-2;
  }

  &__comments {
    @apply my-4;
  }

  &__note {
    @apply text-sm;
  }

  &__required {
    @apply text-danger;
  }

  &__uploader {
    @apply mt-4;
  }

  &__actions {
    @apply mt-4 flex flex-wrap justify-between gap-3;

    @media (width < theme("screens.xs")) {
      @apply justify-center;
    }
  }
}
</style>
