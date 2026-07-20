<template>
  <VcWidget :title="title" size="md" class="top-sellers">
    <template #append>
      <div class="top-sellers__controls">
        <VcSelect
          v-model="period"
          :items="periodOptions"
          text-field="label"
          value-field="value"
          size="sm"
          class="top-sellers__control"
        />

        <VcSelect
          v-if="sortRules.length"
          v-model="sort"
          :items="sortRules"
          text-field="label"
          value-field="name"
          size="sm"
          :placeholder="t('sales_rep.top_sellers.sort_placeholder')"
          class="top-sellers__control"
        />
      </div>
    </template>

    <template #default-container>
      <div class="top-sellers__body">
        <!-- Category filter chips (top-seller filter rules = the store catalog's top-level categories). -->
        <SalesRepRuleChips
          v-if="filterRules.length"
          v-model="filter"
          :rules="filterRules"
          :all-label="t('sales_rep.top_sellers.all_categories')"
        />

        <VcEmptyView v-if="!items.length && !loading" :text="t('sales_rep.top_sellers.empty')" icon="outline-order" />

        <VcTable
          v-else
          :loading="loading"
          :items="items"
          :skeleton-rows="TOP_SELLERS_DEFAULT_TAKE"
          mobile-breakpoint="lg"
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

          <VcTableColumn id="units" v-slot="{ item }" :title="t('sales_rep.top_sellers.units')" align="right">
            {{ item.units }}
          </VcTableColumn>

          <VcTableColumn
            id="revenue"
            v-slot="{ item }"
            :title="t('sales_rep.top_sellers.revenue')"
            align="right"
            class="font-bold"
          >
            {{ item.revenue }}
          </VcTableColumn>
        </VcTable>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { getProductRoute } from "@/core/utilities/product";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { useSalesRepTopSellers } from "../composables/useSalesRepTopSellers";
import { TOP_SELLERS_DEFAULT_TAKE } from "../constants";
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

// Period defaults to the current year to date; the selector also offers Lifetime and This month.
const { period, options: periodOptions, from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("year");

const { rules: sortRules } = useSalesRepRules("topSeller", "sort");
const { rules: filterRules } = useSalesRepRules("topSeller", "filter");

const { items, loading } = useSalesRepTopSellers({
  organizationId: () => props.organizationId,
  sort: () => sort.value,
  filter: () => filter.value,
  periodFrom,
  periodTo,
});
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.top-sellers {
  &__body {
    @apply flex flex-col gap-3 px-1.5 pb-3 pt-4;
  }

  &__controls {
    @apply flex flex-wrap items-center gap-2;
  }

  &__control {
    @apply w-40;
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
