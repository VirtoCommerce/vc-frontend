<template>
  <VcWidget :title="$t('common.labels.feedback')" prepend-icon="chat" size="lg" class="text-sm">
    <div class="mb-8 lg:flex lg:justify-between">
      <div v-if="rating" class="flex">
        <span class="mr-2 content-center">{{ $t("common.labels.rating") }}:</span>
        <ProductRating :rating="rating" class="font-bold" />
      </div>

      <div class="max-lg:mt-3 lg:flex">
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

    <div v-for="review in reviews" :key="review.id" class="border-1 my-4 border-b">
      <div class="my-4 flex justify-between">
        <div>
          {{ review.userName }}
          <div class="text-neutral-400">
            {{ $d(review.createdDate) }}
          </div>
        </div>

        <ReviewRating :rating="review.rating" />
      </div>

      <div class="mb-4">
        {{ review.review }}
      </div>
    </div>

    <VcPagination v-if="pagesCount > 1" v-model:page="pageNum" :pages="pagesCount" @update:page="changePage" />
  </VcWidget>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import ProductRating from "./product-rating.vue";
import ReviewRating from "./review-rating.vue";
import type { CustomerReview, Rating } from "@/core/api/graphql/types";

interface IEmits {
  (event: "changeSortByDate", value: string): void;
  (event: "changePage", value: number): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  fetching: boolean;
  page: number;
  pagesCount: number;
  rating?: Rating;
  reviews: CustomerReview[];
}

const { t } = useI18n();

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

const pageNum = toRef(props, "page");
const sortByDate = ref(sortByDateItems[0].id);

function changeSortByDate(value: string): void {
  emit("changeSortByDate", value);
}

function changePage(pageNumber: number): void {
  emit("changePage", pageNumber);
}
</script>
