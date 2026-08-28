<template>
  <LayoutWidget :title="t('sales_rep.activity.customer.title')" size="md" class="customer-activity">
    <template #append>
      <VcLink :to="{ name: activitiesRouteName, query: { organizationId } }" class="customer-activity__all-link">
        {{ t("sales_rep.activity.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <template #default-container>
      <!-- One widget instead of three stacked ones: the summary plus the two insights lists live here
           as sub-views behind these chips (baseline = Summary). -->
      <div class="customer-activity__views">
        <SalesRepRuleChips
          v-model="viewChip"
          :rules="viewChipRules"
          :all-label="t('sales_rep.activity.customer.views.summary')"
        />
      </div>

      <div v-show="!viewChip" class="customer-activity__summary">
        <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.activity.customer.load_failed')" variant="error" />

        <VcEmptyView v-else-if="!summary && !loading" :text="t('sales_rep.activity.customer.empty')" icon="activity" />

        <!-- Same first-load skeleton as the insights widgets — the GA-backed query can run for seconds. -->
        <div v-else-if="loading && !summary" class="customer-activity__skeletons" aria-hidden="true">
          <div v-for="index in skeletonRows" :key="index" class="customer-activity__skeleton" />
        </div>

        <dl v-else-if="summary" class="customer-activity__list">
          <div v-if="summary.createdOn" class="customer-activity__row">
            <dt class="customer-activity__label">
              <VcIcon class="customer-activity__icon" name="calendar" :size="15" />
              {{ t("sales_rep.activity.customer.created_on") }}
            </dt>

            <dd class="customer-activity__value">{{ $d(new Date(summary.createdOn)) }}</dd>
          </div>

          <!-- Distinct not-configured state for the GA-sourced rows: absent tracking must not read as
               "this customer never logs in / searches". Created on still shows — it comes from the DB. -->
          <div v-if="!summary.isAnalyticsConfigured" class="customer-activity__note">
            <VcIcon class="customer-activity__icon" name="circle-alert" :size="15" />
            {{ t("sales_rep.activity.customer.not_configured") }}
          </div>

          <template v-else>
            <div class="customer-activity__row">
              <dt class="customer-activity__label">
                <VcIcon class="customer-activity__icon" name="log-in" :size="15" />
                {{ t("sales_rep.activity.customer.last_web_login") }}
                <TrackedMetricHint />
              </dt>

              <dd class="customer-activity__value">
                {{ summary.lastWebLogin ? $d(new Date(summary.lastWebLogin)) : "—" }}
              </dd>
            </div>

            <div class="customer-activity__row">
              <dt class="customer-activity__label">
                <VcIcon class="customer-activity__icon" name="activity" :size="15" />
                {{ t("sales_rep.activity.customer.visits") }}
                <TrackedMetricHint />
              </dt>

              <dd class="customer-activity__value">{{ formatStatCount(summary.visitsCount) }}</dd>
            </div>

            <div class="customer-activity__row">
              <dt class="customer-activity__label">
                <VcIcon class="customer-activity__icon" name="search" :size="15" />
                {{ t("sales_rep.activity.customer.last_search_term") }}
                <TrackedMetricHint />
              </dt>

              <dd class="customer-activity__value">
                <VcLink v-if="summary.lastSearchTerm" class="customer-activity__link" :to="searchRoute">
                  “{{ summary.lastSearchTerm }}”
                </VcLink>

                <template v-else>—</template>
              </dd>
            </div>

            <div class="customer-activity__row">
              <dt class="customer-activity__label">
                <VcIcon class="customer-activity__icon" name="eye" :size="15" />
                {{ t("sales_rep.activity.customer.last_viewed_product") }}
                <TrackedMetricHint />
              </dt>

              <dd class="customer-activity__value">
                <template v-if="summary.lastViewedProduct">
                  <VcLink v-if="productRoute" class="customer-activity__link" :to="productRoute" target="_blank">
                    {{ productLabel }}
                  </VcLink>

                  <template v-else>{{ productLabel }}</template>
                </template>

                <template v-else>—</template>
              </dd>
            </div>
          </template>
        </dl>
      </div>

      <!-- Mounted on first visit only, so opening the profile fires one GA-backed query, not three —
           the same "not rendered means not fetching" rule the layout system applies to hidden widgets.
           v-show after that, so returning to a visited view does not refire its query. -->
      <CustomerSearchHistory
        v-if="visitedViews.has(SEARCHES_VIEW)"
        v-show="viewChip === SEARCHES_VIEW"
        :organization-id="organizationId"
      />

      <CustomerBrowseHistory
        v-if="visitedViews.has(PRODUCT_VIEWS_VIEW)"
        v-show="viewChip === PRODUCT_VIEWS_VIEW"
        :organization-id="organizationId"
      />
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { QueryParamName } from "@/core/enums";
import { getProductRoute } from "@/core/utilities/product";
import { ROUTES } from "@/router/routes/constants";
import { useSalesRepCustomerActivitySummary } from "../composables/useSalesRepCustomerActivitySummary";
import { ACTIVITIES_ROUTE_NAME } from "../constants";
import { formatStatCount } from "../utils";
import CustomerBrowseHistory from "./customer-browse-history.vue";
import CustomerSearchHistory from "./customer-search-history.vue";
import LayoutWidget from "./layout-widget.vue";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";
import TrackedMetricHint from "./tracked-metric-hint.vue";
import type { SalesRepRuleType } from "../types";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const activitiesRouteName = ACTIVITIES_ROUTE_NAME;

const SEARCHES_VIEW = "searches";
const PRODUCT_VIEWS_VIEW = "product_views";

// undefined = the baseline Summary view, per the rule-chips convention.
const viewChip = ref<string | undefined>(undefined);
const viewChipRules = computed<SalesRepRuleType[]>(() => [
  { name: SEARCHES_VIEW, label: t("sales_rep.activity.customer.views.searches") },
  { name: PRODUCT_VIEWS_VIEW, label: t("sales_rep.activity.customer.views.product_views") },
]);

const visitedViews = reactive(new Set<string>());
watch(viewChip, (view) => {
  if (view) {
    visitedViews.add(view);
  }
});

// Lifetime figures — the Activities page is where a rep narrows the period.
const { summary, loading, error } = useSalesRepCustomerActivitySummary(() => props.organizationId);

// One skeleton bar per definition row the loaded widget renders.
const skeletonRows = 5;

const failed = computed(() => Boolean(error.value));

// The catalog search results page, exactly as the header search navigates (VCST-5731).
const searchRoute = computed(() => ({
  name: ROUTES.SEARCH.NAME,
  query: { [QueryParamName.SearchPhrase]: summary.value?.lastSearchTerm },
}));

// Link by id (the /product/{id} route always resolves); an unresolved code leaves productId empty,
// so the row stays plain text.
const productRoute = computed(() => {
  const productId = summary.value?.lastViewedProduct?.productId;
  return productId ? getProductRoute(productId) : undefined;
});

// Code + name per the design; unresolvable codes still show the code alone.
const productLabel = computed(() => {
  const product = summary.value?.lastViewedProduct;
  if (!product) {
    return "";
  }
  return product.name ? `${product.code} · ${product.name}` : product.code;
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.customer-activity {
  // px-6 aligns the chips with the widget header title, like the panels' own sort-chip rows.
  &__views {
    @apply border-b border-neutral-200 bg-neutral-50 px-6 py-3;
  }

  // Mirrors vc-widget__slot, which padded this content while it was the widget's default slot.
  &__summary {
    @apply px-[--p-x] pb-5 pt-4;
  }

  &__skeletons {
    @apply flex flex-col;
  }

  // h-6 + my-3 ≈ one loaded definition row (a py-3 text line), so the card keeps its height.
  &__skeleton {
    @apply my-3 h-6 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__row {
    @apply flex items-baseline justify-between gap-4 border-b border-neutral-100 py-3 last:border-b-0;
  }

  &__label {
    @apply flex flex-none items-center gap-2 text-sm text-neutral-500;
  }

  &__icon {
    @apply text-neutral-400;
  }

  &__value {
    @apply min-w-0 text-end text-sm font-medium text-neutral-900 [word-break:break-word];
  }

  &__link {
    @apply text-[--link-color] hover:underline;
  }

  &__note {
    @apply flex items-start gap-2 py-3 text-sm text-neutral-500;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
