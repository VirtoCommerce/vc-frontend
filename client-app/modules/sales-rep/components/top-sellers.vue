<template>
  <LayoutWidget :title="title" size="md" class="top-sellers">
    <template #default-container>
      <div class="top-sellers__body">
        <!-- Category filter chips: top-seller filter rules = the store catalog's top-level categories. -->
        <div v-if="hasFilterOptions" class="top-sellers__filter">
          <SalesRepRuleChips
            v-model="filter"
            :rules="filterRules"
            :all-label="t('sales_rep.top_sellers.all_categories')"
          />
        </div>

        <div class="top-sellers__content">
          <!-- A failure replaces the table rather than sharing the empty view: apollo keeps the previous rows on a
               failed refetch, which would otherwise read as this category's result (VCST-5586). -->
          <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.top_sellers.load_failed')" variant="error" />

          <!-- With a category filter active, an empty result means "nothing in this category", not "no sales at all". -->
          <VcEmptyView
            v-else-if="!items.length && !loading"
            :text="filter ? t('sales_rep.top_sellers.no_results') : t('sales_rep.top_sellers.empty')"
            icon="outline-order"
          />

          <!-- Sorting maps each header to a named backend rule; both top-seller rules are one-way (highest first). -->
          <VcTable
            v-else
            :loading="loading"
            :items="items"
            :skeleton-rows="TOP_SELLERS_DEFAULT_TAKE"
            :sort="sortInfo"
            mobile-breakpoint="lg"
            @header-click="applySort"
          >
            <template #mobile-item="{ item }">
              <div class="top-sellers__mobile-item">
                <span class="top-sellers__rank">{{ item.rank }}</span>

                <VcLink
                  :to="getProductRoute(item.productId)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="top-sellers__name"
                >
                  {{ item.name }}
                </VcLink>

                <span class="top-sellers__sub">{{ item.sku }} · {{ item.units }} · {{ item.revenue }}</span>
              </div>
            </template>

            <VcTableColumn id="rank" v-slot="{ item }" :title="t('sales_rep.top_sellers.rank')" align="center">
              {{ item.rank }}
            </VcTableColumn>

            <VcTableColumn id="product" v-slot="{ item }" :title="t('sales_rep.top_sellers.product')">
              <div class="top-sellers__product">
                <span class="top-sellers__thumb">
                  <VcImage v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="top-sellers__thumb-img" />

                  <VcIcon v-else name="cube" aria-hidden="true" />
                </span>

                <span class="top-sellers__product-text">
                  <VcLink
                    :to="getProductRoute(item.productId)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="top-sellers__name"
                  >
                    {{ item.name }}
                  </VcLink>

                  <span v-if="item.sku" class="top-sellers__sub">{{ item.sku }}</span>
                </span>
              </div>
            </VcTableColumn>

            <VcTableColumn
              id="units"
              v-slot="{ item }"
              :title="t('sales_rep.top_sellers.units')"
              :sortable="isColumnSortable('units')"
              align="right"
            >
              {{ item.units }}
            </VcTableColumn>

            <VcTableColumn
              id="revenue"
              v-slot="{ item }"
              :title="t('sales_rep.top_sellers.revenue')"
              :sortable="isColumnSortable('revenue')"
              align="right"
              class="font-bold"
            >
              {{ item.revenue }}
            </VcTableColumn>
          </VcTable>
        </div>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getProductRoute } from "@/core/utilities/product";
import { useSalesRepColumnSort } from "../composables/useSalesRepColumnSort";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { useSalesRepTopSellers } from "../composables/useSalesRepTopSellers";
import { TOP_SELLERS_DEFAULT_TAKE } from "../constants";
import { selectableFilterRules } from "../utils";
import LayoutWidget from "./layout-widget.vue";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";

interface IProps {
  // Widget heading (the caller decides the wording).
  title: string;
  // Scope to one customer (profile page); omit for the cross-customer dashboard ranking.
  organizationId?: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// A salesRepTopSellerSortRules name (by-units / by-revenue); undefined → server default (by-units).
const sort = ref<string | undefined>(undefined);
// A salesRepTopSellerFilterRules name (a top-level category id); undefined → all categories.
const filter = ref<string | undefined>(undefined);

const { from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("year");

const { rules: sortRules } = useSalesRepRules("topSeller", "sort");
const { rules: filterRules } = useSalesRepRules("topSeller", "filter");

// Show the category chips only when the backend offers a real category beyond the "All" baseline.
const hasFilterOptions = computed(() => selectableFilterRules(filterRules.value).length > 0);

// Header-click sorting: each sortable column maps to its backend sort-rule name; "by-units" is the server default.
const { sortInfo, isColumnSortable, applySort } = useSalesRepColumnSort({
  sortRule: sort,
  columns: { units: "by-units", revenue: "by-revenue" },
  defaultColumn: "units",
  rules: sortRules,
});

const { items, loading, error } = useSalesRepTopSellers({
  organizationId: () => props.organizationId,
  sort: () => sort.value,
  filter: () => filter.value,
  periodFrom,
  periodTo,
});

const failed = computed(() => Boolean(error.value));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.top-sellers {
  &__body {
    @apply flex flex-col;
  }

  // px-6 aligns the tabs with the widget header title.
  &__filter {
    @apply border-b border-neutral-200 bg-neutral-50 px-6 py-3;
  }

  &__content {
    @apply px-1.5 pb-3 pt-1;
  }

  &__product {
    @apply flex items-center gap-3;
  }

  &__thumb {
    --vc-icon-size: 1.25rem;

    @apply flex size-10 flex-none items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-additional-50 text-neutral-400;
  }

  &__thumb-img {
    @apply size-full object-contain;
  }

  &__product-text {
    @apply flex min-w-0 flex-col;
  }

  &__name {
    @apply font-medium [word-break:break-word];
  }

  &__sub {
    @apply text-sm text-neutral-500;
  }

  &__rank {
    @apply font-bold;
  }

  &__mobile-item {
    @apply flex flex-col gap-1 border-b px-5 py-4;
  }
}
</style>
