<template>
  <VcWidget :title="$t('common.labels.feedback')" prepend-icon="chat">
    <div class="mb-8 flex justify-between">
      <div v-if="rating" class="flex">
        <span class="mr-2 content-center">{{ $t("common.labels.rating") }}:</span>
        <ProductRating :rating="rating" class="font-bold" />
      </div>

      <div class="lg:flex">
        <span class="mr-2 content-center font-bold">
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

    <div v-for="review in reviews" :key="review.id" class="my-4 border-b-2">
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
    label: t("common.labels.descending"),
  },
  {
    id: "createddate:asc",
    label: t("common.labels.ascending"),
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
