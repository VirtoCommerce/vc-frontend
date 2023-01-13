<template>
  <div class="flex items-center mx-8 justify-self-stretch">
    <h3 class="text-xl font-extrabold uppercase mr-2" v-t="'pages.vendor.main_block.title'"></h3>
    <div class="flex justify-self-end">
      <div class="flex items-center ml-8">
        <span class="mr-2 font-bold" v-t="'pages.vendor.main_block.filter_by_rating.label'" />
        <VcSelect
          :modelValue="filters?.[0].id"
          value-field="id"
          :is-disabled="loading"
          :items="searchOptions.filters"
          class="w-full lg:w-48"
          @update:modelValue="applyFilters"
        >
          <template v-slot:[slot]="{ item }" v-for="slot in ['item', 'selected']">
            {{ getFilterTranslation(item as Filter) }}
          </template>
        </VcSelect>
      </div>
      <div class="flex items-center ml-8">
        <span class="mr-2 font-bold" v-t="'pages.vendor.main_block.sort_by_date.label'" />
        <VcSelect
          :modelValue="sort.id"
          value-field="id"
          :is-disabled="loading"
          :items="searchOptions.sort"
          class="w-full lg:w-48"
          @update:modelValue="applySort"
        >
          <template v-slot:[slot]="{ item }" v-for="slot in ['item', 'selected']">
            {{ getSortTranslation(item as Sort) }}
          </template>
        </VcSelect>
      </div>
    </div>
  </div>
  <div class="flex flex-col bg-white shadow-sm md:rounded md:border m-8">
    <VcTable
      layout="table-auto"
      :loading="loading"
      :columns="columns"
      :items="customerReviews"
      :sort="sort"
      :pages="pages"
      :page="page"
      @pageChanged="changePage"
    >
      <template #header>
        <thead></thead>
      </template>
      <template #desktop-body>
        <tr v-for="customerReview in customerReviews" :key="customerReview.id" class="even:bg-gray-50">
          <td class="p-3 overflow-hidden overflow-ellipsis">
            <VcRating :rating="customerReview.rating" variant="stars" class="text-base"></VcRating>
          </td>
          <td class="p-4 overflow-hidden overflow-ellipsis">
            <div class="font-bold text-gray-700">{{ customerReview.userName }}</div>
            <div class="text-13 text-gray-400">{{ $d(customerReview.modifiedDate) }}</div>
          </td>
          <td class="p-4 overflow-hidden overflow-ellipsis">
            <div class="font-extrabold">{{ customerReview.title }}</div>
            <div class="font-medium">{{ customerReview.review }}</div>
          </td>
        </tr>
      </template>
    </VcTable>
  </div>
</template>

<script setup lang="ts">
import { Filter, nameof, RangeFilter, RangeFilterValue, SearchOptions, Sort, SortDirection } from "@/core";
import {
  CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER,
  DEFAULT_CUSTOMER_REVIEWS_SORT,
  useCustomerReviews,
} from "@/shared/vendor";
import { VcRating, VcSelect, VcTable } from "@/ui-kit/components";
import { CustomerReview } from "@/xapi";
import { computed, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";

export interface Props {
  vendorId: string;
}

const props = defineProps<Props>();
const { vendorId } = toRefs(props);

const { t } = useI18n();

const searchOptions: SearchOptions = {
  sort: [DEFAULT_CUSTOMER_REVIEWS_SORT, new Sort(nameof<CustomerReview>("modifiedDate"), SortDirection.Ascending)],
  filters: [
    CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER,
    new RangeFilter<number>(
      nameof<CustomerReview>("rating"),
      new RangeFilterValue<number>({ include: true, value: 1 }, { include: false, value: 4 })
    ),
  ],
};

const {
  loading,
  pages,
  page,
  sort,
  filters,
  items: customerReviews,
  changePage,
  applySort,
  applyFilters,
} = useCustomerReviews(ref({ entityId: vendorId, entityType: "Organization" }), searchOptions);

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
</script>
