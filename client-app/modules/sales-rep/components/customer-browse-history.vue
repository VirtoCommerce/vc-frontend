<template>
  <!-- Chrome-less panel: rendered inside the Customer activity widget's "Product views" sub-view (it
       used to be a widget of its own), so the widget box and title belong to the container. -->
  <div class="customer-browse-history">
    <div class="customer-browse-history__filter">
      <SalesRepRuleChips
        v-model="sortChip"
        :rules="sortChipRules"
        :all-label="t('sales_rep.customer_insights.recent')"
      />
    </div>

    <div class="customer-browse-history__content">
      <!-- A failure replaces stale rows — same state ladder as top-sellers.vue (VCST-5586). -->
      <VcEmptyView
        v-if="failed && !loading"
        :text="t('sales_rep.customer_insights.browse_history.load_failed')"
        variant="error"
      />

      <VcEmptyView
        v-else-if="notConfigured && !loading"
        :text="t('sales_rep.customer_insights.not_configured')"
        icon="eye"
      />

      <VcEmptyView
        v-else-if="!items.length && !loading"
        :text="t('sales_rep.customer_insights.browse_history.empty')"
        icon="eye"
      />

      <template v-else>
        <ul class="customer-browse-history__list">
          <template v-if="loading && !items.length">
            <li v-for="index in rowLimit" :key="index" class="customer-browse-history__skeleton" aria-hidden="true" />
          </template>

          <template v-else>
            <li v-for="item in items" :key="item.productId" class="customer-browse-history__row">
              <span class="customer-browse-history__thumb">
                <VcImage
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="customer-browse-history__thumb-img"
                />

                <VcIcon v-else name="cube" aria-hidden="true" />
              </span>

              <span class="customer-browse-history__text">
                <!-- GA stores the product CODE in item_id; only a row the backend resolved to a real
                     product carries a linkable id, so an unresolved row degrades to plain text. -->
                <VcLink
                  v-if="item.isResolved"
                  :to="getProductRoute(item.productId)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="customer-browse-history__name"
                >
                  {{ item.name }}
                </VcLink>

                <span v-else class="customer-browse-history__name">{{ item.name || item.sku }}</span>

                <span v-if="item.sku && item.name" class="customer-browse-history__sku">{{ item.sku }}</span>

                <span class="customer-browse-history__meta">{{ rowMeta(item) }}</span>
              </span>
            </li>
          </template>
        </ul>

        <p v-if="items.length" class="customer-browse-history__caveat">{{ caveat }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getProductRoute } from "@/core/utilities/product";
import { useBlockChrome } from "../composables/useBlockChrome";
import { useInsightsCaveat } from "../composables/useInsightsCaveat";
import { useSalesRepBrowseHistory } from "../composables/useSalesRepBrowseHistory";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { INSIGHTS_DEFAULT_ROWS, INSIGHTS_SORT_BY_COUNT, INSIGHTS_SORT_BY_DATE } from "../constants";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";
import type { SalesRepRuleType } from "../types";
import type { SalesRepBrowsedProductRowType } from "../types/insights";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t, d } = useI18n();

// The baseline chip is "Recent" — the ticket asks for recent product views; the one selectable rule
// flips to the most-viewed ranking.
const sortChip = ref<string | undefined>(undefined);
const sortChipRules = computed<SalesRepRuleType[]>(() => [
  { name: INSIGHTS_SORT_BY_COUNT, label: t("sales_rep.customer_insights.top") },
]);
const sort = computed(() => sortChip.value ?? INSIGHTS_SORT_BY_DATE);

const { from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("year");

const chrome = useBlockChrome();
const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? INSIGHTS_DEFAULT_ROWS);

const { items, notConfigured, dataAsOf, loading, error } = useSalesRepBrowseHistory({
  organizationId: () => props.organizationId,
  sort: () => sort.value,
  periodFrom,
  periodTo,
  take: () => rowLimit.value,
});

const failed = computed(() => Boolean(error.value));

function rowMeta(item: SalesRepBrowsedProductRowType): string {
  const parts = [t("sales_rep.customer_insights.browse_history.views", item.viewCount)];
  if (item.lastViewedDate) {
    parts.push(d(new Date(item.lastViewedDate), "short"));
  }
  return parts.join(" · ");
}

const caveat = useInsightsCaveat(dataAsOf);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.customer-browse-history {
  @apply flex flex-col;

  // px-6 aligns the chips with the widget header title.
  &__filter {
    @apply border-b border-neutral-200 bg-neutral-50 px-6 py-3;
  }

  &__content {
    @apply px-6 pb-4 pt-1;
  }

  &__list {
    @apply flex flex-col;
  }

  &__row {
    @apply flex items-center gap-3 border-b border-neutral-100 py-3 last:border-b-0;
  }

  &__thumb {
    --vc-icon-size: 1.25rem;

    @apply flex size-10 flex-none items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-additional-50 text-neutral-400;
  }

  &__thumb-img {
    @apply size-full object-contain;
  }

  &__text {
    @apply flex min-w-0 flex-col;
  }

  &__name {
    @apply text-sm font-medium [word-break:break-word];
  }

  &__sku {
    @apply text-xs text-neutral-500;
  }

  &__meta {
    @apply text-xs text-neutral-400;
  }

  &__skeleton {
    @apply my-3 h-12 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__caveat {
    @apply border-t border-neutral-100 pt-3 text-xs text-neutral-400;
  }
}
</style>
