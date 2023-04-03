<template>
  <div class="mx-8 mt-2 flex justify-self-stretch max-md:flex-col md:items-center md:justify-between">
    <VcTypography tag="h2" variant="h3" weight="bold" class="max-md:mb-2">
      {{ $t("pages.vendor.main_block.title") }}
    </VcTypography>
    <div class="flex max-md:flex-col max-md:gap-y-2">
      <div class="flex items-center md:ml-8">
        <span v-t="'pages.vendor.main_block.filter_by_rating.label'" class="mr-2 font-bold max-md:w-48" />
        <VcSelect
          :model-value="filters?.[0].id"
          value-field="id"
          :is-disabled="loading || customerReviews.length === 0"
          :items="searchOptions.filters"
          class="w-full lg:w-48"
          @update:model-value="applyFilters"
        >
          <template v-for="slot in ['item', 'selected']" #[slot]="{ item }" :key="slot">
            <VcSelectItem>
              <VcSelectItemText>{{ getFilterTranslation(item as Filter) }}</VcSelectItemText>
            </VcSelectItem>
          </template>
        </VcSelect>
      </div>
      <div class="flex items-center md:ml-8">
        <span v-t="'pages.vendor.main_block.sort_by_date.label'" class="mr-2 font-bold max-md:w-48" />
        <VcSelect
          :model-value="sort.id"
          value-field="id"
          :is-disabled="loading || customerReviews.length === 0"
          :items="searchOptions.sort"
          class="w-full lg:w-48"
          @update:model-value="applySort"
        >
          <template v-for="slot in ['item', 'selected']" #[slot]="{ item }" :key="slot">
            <VcSelectItem>
              <VcSelectItemText>{{ getSortTranslation(item as Sort) }}</VcSelectItemText>
            </VcSelectItem>
          </template>
        </VcSelect>
      </div>
    </div>
  </div>
  <div class="m-8 flex flex-col bg-white shadow-sm md:rounded md:border">
    <VcTable
      layout="table-auto"
      :loading="loading"
      :columns="columns"
      :items="customerReviews"
      :sort="sort"
      :pages="pages"
      :page="page"
      hide-header
      @page-changed="changePage"
    >
      <template #mobile-skeleton>
        <div class="mb-3">
          <div class="mb-1 w-3/12">
            <div class="h-6 animate-pulse bg-gray-200"></div>
            <div class="h-6 animate-pulse bg-gray-200"></div>
          </div>
          <div class="h-6 w-3/12 animate-pulse bg-gray-200"></div>
          <div class="h-6 w-4/12 animate-pulse bg-gray-200"></div>
          <div class="h-12 w-full animate-pulse bg-gray-200"></div>
        </div>
      </template>
      <template #mobile-item="itemData">
        <div class="mb-3">
          <div class="mb-1">
            <div class="text-13 text-gray-400">{{ $d(itemData.item.modifiedDate) }}</div>
            <div class="font-bold text-gray-700">{{ itemData.item.userName }}</div>
          </div>
          <VcRating :model-value="itemData.item.rating" readonly class="mb-1"></VcRating>
          <div class="font-extrabold">{{ itemData.item.title }}</div>
          <div class="font-medium">{{ itemData.item.review }}</div>
        </div>
      </template>
      <template #desktop-skeleton>
        <tr v-for="customerReview in customerReviews" :key="customerReview.id" class="even:bg-gray-50">
          <td class="w-1/12 p-3">
            <div class="h-6 animate-pulse bg-gray-200"></div>
          </td>

          <td class="w-2/12 p-5">
            <div class="h-6 animate-pulse bg-gray-200"></div>
          </td>

          <td class="w-9/12 p-5">
            <div class="h-6 animate-pulse bg-gray-200"></div>
          </td>
        </tr>
      </template>
      <template #desktop-body>
        <tr v-for="customerReview in customerReviews" :key="customerReview.id" class="even:bg-gray-50">
          <td class="overflow-hidden text-ellipsis p-3">
            <VcRating :model-value="customerReview.rating" readonly></VcRating>
          </td>
          <td class="overflow-hidden text-ellipsis whitespace-nowrap p-4">
            <div class="font-bold text-gray-700">{{ customerReview.userName }}</div>
            <div class="text-13 text-gray-400">{{ $d(customerReview.modifiedDate) }}</div>
          </td>
          <td class="w-full overflow-hidden text-ellipsis p-4">
            <div class="font-extrabold">{{ customerReview.title }}</div>
            <div class="font-medium">{{ customerReview.review }}</div>
          </td>
        </tr>
      </template>
      <template v-for="slot in ['mobile-empty', 'desktop-empty']" #[slot] :key="slot">
        <VcEmptyView :text="$t('pages.vendor.main_block.no-feedback')" class="p-20">
          <template #icon>
            <VcImage src="/static/images/vendor/icons/no-feedback.svg"></VcImage>
          </template>
          <template #button>
            <LeaveFeedback :options="options" size="lg" class="px-5" with-icon />
          </template>
        </VcEmptyView>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { SortDirection } from "@/core/enums";
import { configInjectionKey } from "@/core/injection-keys";
import { Filter, RangeFilter, RangeFilterValue, Sort, Filters } from "@/core/types";
import { nameof } from "@/core/utilities";
import {
  CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER,
  DEFAULT_CUSTOMER_REVIEWS_SORT,
  useCustomerReviews,
} from "@/shared/vendor/composables";
import {
  VcEmptyView,
  VcImage,
  VcRating,
  VcSelect,
  VcSelectItem,
  VcSelectItemText,
  VcTable,
  VcTypography,
} from "@/ui-kit/components";
import type { ISearchOptions } from "@/core/types";
import type { ICustomerReviewOptions } from "@/shared/vendor/types";
import type { CustomerReview } from "@/xapi/types";
import { default as LeaveFeedback } from "@/shared/vendor/components/leave-feedback.vue";

interface IProps {
  options: ICustomerReviewOptions;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const config = inject(configInjectionKey, {});

const searchOptions: ISearchOptions = {
  sort: [DEFAULT_CUSTOMER_REVIEWS_SORT, new Sort(nameof<CustomerReview>("modifiedDate"), SortDirection.Ascending)],
  filters: new Filters(
    CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER,
    new RangeFilter<number>(
      nameof<CustomerReview>("rating"),
      new RangeFilterValue<number>({ include: true, value: 1 }, { include: false, value: 4 })
    )
  ),
};

const {
  loading,
  pages,
  page,
  sort,
  filters,
  items: customerReviews,
  load,
  changePage,
  applySort,
  applyFilters,
} = useCustomerReviews(props.options, searchOptions);

const columns = computed<ITableColumn[]>(() => [
  {
    id: "rating",
  },
  {
    id: "customer",
  },
  {
    id: "review",
  },
]);

function getFilterTranslation(item: Filter): string {
  const filterName = item.id === CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER.id ? "only-positive" : "only-negative";
  return t(`pages.vendor.main_block.filter_by_rating.options.${filterName}`);
}

function getSortTranslation(item: Sort): string {
  return t(`pages.vendor.main_block.sort_by_date.options.${item.id}`);
}

invoke(async () => {
  if (config.rating_enabled) {
    await load();
  }
});
</script>
