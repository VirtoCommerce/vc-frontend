<template>
  <div class="activities">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcEmptyView
      v-if="customerUnavailable"
      :text="unavailableText"
      :variant="customerFailed ? 'error' : 'empty'"
      icon="outline-404"
    >
      <template #button>
        <VcButton :to="{ name: MY_CUSTOMERS_ROUTE_NAME }" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_profile.back_to_customers") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <!-- ?organizationId= narrows the feed to one customer, and the heading names them (as customer-orders does). -->
      <VcTypography class="activities__title" tag="h1">
        {{ heading }}
      </VcTypography>

      <div class="activities__results">
        <div class="activities__controls">
          <SalesRepRuleChips v-model="category" :rules="categoryRules" :all-label="allTabLabel">
            <!-- No name = the All tab, which merges tracked rows in and so carries the mark too. -->
            <template #suffix="{ tab }">
              <TrackedMetricHint v-if="!tab.name || TRACKED_ACTIVITY_CATEGORIES.has(tab.name)" />
            </template>
          </SalesRepRuleChips>

          <SalesRepRuleChips
            v-model="periodRule"
            :rules="periodRules"
            :all-label="t('sales_rep.activity.period.all_time')"
            all-last
          />
        </div>

        <!-- Top|Recent, only on the tracked categories that rank (searches, product views); Recent is the baseline. -->
        <div v-if="isRankableTab" class="activities__mode">
          <SalesRepRuleChips
            v-model="modeChip"
            :rules="modeRules"
            :all-label="t('sales_rep.customer_insights.recent')"
          />
        </div>

        <!-- The badges and the rows are separate reads, and either can come back without analytics while the other
             shows tracked figures: say so, rather than leave a "–" beside listed rows to explain itself. -->
        <p v-if="showIncompleteNotice" class="activities__notice" role="status">
          <VcIcon class="activities__notice-icon" name="circle-alert" :size="15" aria-hidden="true" />
          {{ t("sales_rep.activity.incomplete") }}
        </p>

        <!-- A failure gets its own view — it must not read as "no activity" (VCST-5586). -->
        <VcEmptyView v-if="viewFailed && !viewLoading" :text="failedText" variant="error" />

        <VcEmptyView v-else-if="viewEmpty && !viewLoading" :text="emptyText" :icon="emptyIcon" />

        <VcWidget v-else size="md">
          <template #default-container>
            <!-- Skeleton on every fetch, as VcTable's loading prop does: the GA-backed query can run for seconds. -->
            <div v-if="viewLoading" class="activities__skeletons" aria-hidden="true">
              <div v-for="index in skeletonRows" :key="index" class="activities__skeleton" />
            </div>

            <!-- Top mode: ranked counts, not events — no timestamps, one capped page, no pager. -->
            <ol v-else-if="topMode && category === 'searches'" class="activities__top-list">
              <li v-for="(item, index) in topSearchItems" :key="item.term" class="activities__top-row">
                <span class="activities__top-rank">{{ index + 1 }}</span>

                <VcLink
                  class="activities__top-link"
                  :to="searchResultsRoute(item.term)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  “{{ item.term }}”
                </VcLink>

                <span class="activities__top-count">
                  {{ t("sales_rep.customer_insights.search_history.count", item.count) }}
                </span>
              </li>
            </ol>

            <ol v-else-if="topMode" class="activities__top-list">
              <li v-for="(item, index) in topViewItems" :key="item.sku" class="activities__top-row">
                <span class="activities__top-rank">{{ index + 1 }}</span>

                <!-- Only a row resolved to a real product links; an unresolved one stays plain text. -->
                <VcLink
                  v-if="item.isResolved"
                  class="activities__top-link"
                  :to="getProductRoute(item.productId)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ item.name || item.sku }}
                </VcLink>

                <span v-else class="activities__top-name">{{ item.name || item.sku }}</span>

                <span class="activities__top-count">
                  {{ t("sales_rep.customer_insights.browse_history.views", item.viewCount) }}
                </span>
              </li>
            </ol>

            <template v-else>
              <div class="activities__list">
                <ActivityRow
                  v-for="(item, index) in items"
                  :key="index"
                  :item="item"
                  :show-organization="!organizationId"
                />
              </div>

              <VcPagination
                v-if="pages > 1"
                v-model:page="page"
                :pages="pages"
                :compact="isPhone"
                class="activities__pagination"
                @update:page="scrollToTop"
              />
            </template>
          </template>
        </VcWidget>

        <p v-if="showCaveat && !viewFailed" class="activities__caveat">
          <VcIcon name="info" :size="14" aria-hidden="true" />
          {{ t("sales_rep.activity.caveat") }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { getProductRoute } from "@/core/utilities/product";
import { BREAKPOINTS } from "@/ui-kit/constants";
import ActivityRow from "../components/activity-row.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import TrackedMetricHint from "../components/tracked-metric-hint.vue";
import { useSalesRepActivities } from "../composables/useSalesRepActivities";
import { useSalesRepBrowseHistory } from "../composables/useSalesRepBrowseHistory";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { useSalesRepSearchHistory } from "../composables/useSalesRepSearchHistory";
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_MAX_SKIP,
  ACTIVITY_PAGE_SIZE,
  CUSTOMER_PROFILE_ROUTE_NAME,
  INSIGHTS_MAX_ROWS,
  INSIGHTS_SORT_BY_COUNT,
  RANKED_ACTIVITY_CATEGORIES,
  TRACKED_ACTIVITY_CATEGORIES,
  MY_CUSTOMERS_ROUTE_NAME,
} from "../constants";
import { formatStatCount, searchResultsRoute } from "../utils";
import type { SalesRepPeriodType } from "../composables/useSalesRepPeriodFilter";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // Optional narrowing to one customer (from the customer-activity widget's "All activity" link).
  organizationId?: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// Selected category tab; undefined = the "All" baseline (no categories filter).
const category = ref<string | undefined>(undefined);
const page = ref(1);

// Opens on This year, the window of the widgets that link here, so "View all" never shows less than they did.
// All time (no bounds) would read GA from 2015 to render a page; it stays one chip away.
const { period, from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("year");

// Chips speak "rule name | undefined"; undefined is the lifetime baseline.
const periodRule = computed<string | undefined>({
  get: () => (period.value === "lifetime" ? undefined : period.value),
  set: (value) => {
    period.value = (value as SalesRepPeriodType | undefined) ?? "lifetime";
  },
});

const periodRules = computed<SalesRepRuleType[]>(() => [
  { name: "month", label: t("sales_rep.activity.period.month") },
  { name: "year", label: t("sales_rep.activity.period.year") },
]);

const isRankableTab = computed(() => Boolean(category.value && RANKED_ACTIVITY_CATEGORIES.has(category.value)));

// Recent (the feed) is the baseline; the one rule flips to the ranked Top list, as in the customer panels.
const TOP_MODE_RULE = "top";
const modeChip = ref<string | undefined>(undefined);
const modeRules = computed<SalesRepRuleType[]>(() => [
  { name: TOP_MODE_RULE, label: t("sales_rep.customer_insights.top") },
]);
const topMode = computed(() => isRankableTab.value && modeChip.value === TOP_MODE_RULE);

// flush: "sync" resets the page before the variables watcher runs, so a tab/period change fires one
// request, not two.
watch(
  [category, periodRule],
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

// Switching tabs resets to Recent — a mode picked for one category must not silently carry over.
watch(category, () => {
  modeChip.value = undefined;
});

// A customer switch reuses this instance (same route, new query), so it starts over like a fresh open.
watch(
  () => props.organizationId,
  () => {
    category.value = undefined;
    modeChip.value = undefined;
    page.value = 1;
  },
  { flush: "sync" },
);

// Only the selected tab's rows: without categoryCounts the backend reads just that category, so Orders and
// Customers never wait on Google. Paused in Top mode, where the ranked list replaces it.
const { items, totalCount, loading, error, analyticsUnavailable } = useSalesRepActivities({
  organizationId: () => props.organizationId,
  categories: () => (category.value ? [category.value] : undefined),
  periodFrom,
  periodTo,
  take: ACTIVITY_PAGE_SIZE,
  skip: () => (page.value - 1) * ACTIVITY_PAGE_SIZE,
  withCategoryCounts: false,
  enabled: () => !topMode.value,
});

// The badges in their own request: counting every category is the slow half, and it does not change with the
// tab or the page. take: 0 asks for counts only.
const {
  categoryCounts,
  totalCount: countsTotal,
  loading: countsLoading,
  error: countsError,
  analyticsUnavailable: countsAnalyticsUnavailable,
} = useSalesRepActivities({
  organizationId: () => props.organizationId,
  periodFrom,
  periodTo,
  take: 0,
});

// Every badge reads the counts request, the selected tab included: one figure, one source.
const countOf = (name: string) => categoryCounts.value.find((entry) => entry.category === name)?.count ?? 0;

// The counts request carries no category filter, so its own totalCount IS the "All" figure.
const allCount = computed(() => countsTotal.value);

// keepPreviousResult keeps the badges' last figures through a refetch. A first load has none to keep, and a
// customer switch is one (the held figures are the previous customer's), so the tabs show no figures.
const countsFor = ref<string>();
watch(
  countsLoading,
  (isLoading) => {
    if (!isLoading) {
      countsFor.value = props.organizationId;
    }
  },
  { immediate: true },
);
const countsPending = computed(
  () => (countsLoading.value && !categoryCounts.value.length) || countsFor.value !== props.organizationId,
);
const countsFailed = computed(() => Boolean(countsError.value));

// A tracked tab shows "–" when analytics did not answer: a "(0)" in the tab row reads as "they searched
// nothing". Orders and Customers keep real counts; a failed counts request dashes every tab.
const UNMEASURED_BADGE = "–";
const badgeFor = (name: string) =>
  countsFailed.value || (countsAnalyticsUnavailable.value && TRACKED_ACTIVITY_CATEGORIES.has(name))
    ? UNMEASURED_BADGE
    : formatStatCount(countOf(name));

// Zero-count categories keep their tab: a rep must see that a category exists and is quiet.
const categoryRules = computed<SalesRepRuleType[]>(() =>
  ACTIVITY_CATEGORIES.map((name) => {
    const label = t(`sales_rep.activity.tabs.${name}`);
    return { name, label: countsPending.value ? label : `${label} (${badgeFor(name)})` };
  }),
);

// All adds every tab up, so a dashed tab dashes it too: QA read a partial sum beside "–" tabs as the whole.
const allBadge = computed(() =>
  countsFailed.value || countsAnalyticsUnavailable.value ? UNMEASURED_BADGE : formatStatCount(allCount.value),
);

const allTabLabel = computed(() =>
  countsPending.value ? t("sales_rep.activity.tabs.all") : `${t("sales_rep.activity.tabs.all")} (${allBadge.value})`,
);

const failed = computed(() => Boolean(error.value));

// Each Top list runs only while its tab shows it: no speculative GA reads.
const topSearchesEnabled = computed(() => topMode.value && category.value === "searches");
const topViewsEnabled = computed(() => topMode.value && category.value === "productViews");

const {
  items: topSearchItems,
  unavailable: topSearchesUnavailable,
  loading: topSearchesLoading,
  error: topSearchesError,
} = useSalesRepSearchHistory({
  organizationId: () => props.organizationId,
  sort: INSIGHTS_SORT_BY_COUNT,
  periodFrom,
  periodTo,
  take: INSIGHTS_MAX_ROWS,
  enabled: topSearchesEnabled,
});

const {
  items: topViewItems,
  unavailable: topViewsUnavailable,
  loading: topViewsLoading,
  error: topViewsError,
} = useSalesRepBrowseHistory({
  organizationId: () => props.organizationId,
  sort: INSIGHTS_SORT_BY_COUNT,
  periodFrom,
  periodTo,
  take: INSIGHTS_MAX_ROWS,
  enabled: topViewsEnabled,
});

// The state ladder speaks for whichever source the current tab+mode shows.
const onSearchesTab = computed(() => category.value === "searches");
const topRowCount = computed(() => (onSearchesTab.value ? topSearchItems.value.length : topViewItems.value.length));
const topLoading = computed(() => (onSearchesTab.value ? topSearchesLoading.value : topViewsLoading.value));
const topFailed = computed(() => Boolean(onSearchesTab.value ? topSearchesError.value : topViewsError.value));
const topUnavailable = computed(() => (onSearchesTab.value ? topSearchesUnavailable.value : topViewsUnavailable.value));

const viewLoading = computed(() => (topMode.value ? topLoading.value : loading.value));
const viewFailed = computed(() => (topMode.value ? topFailed.value : failed.value));
const viewEmpty = computed(() => (topMode.value ? topUnavailable.value || !topRowCount.value : !items.value.length));

// Only beside rows: an empty view already says why it is empty.
const figuresIncomplete = computed(
  () => countsFailed.value || countsAnalyticsUnavailable.value || analyticsUnavailable.value,
);
const showIncompleteNotice = computed(
  () => figuresIncomplete.value && !viewLoading.value && !viewFailed.value && !viewEmpty.value,
);

// Match the rows being replaced so the page height holds during a refetch; a handful on first load.
const FIRST_LOAD_SKELETON_ROWS = 5;
const skeletonRows = computed(
  () => (topMode.value ? topRowCount.value : items.value.length) || FIRST_LOAD_SKELETON_ROWS,
);

const failedText = computed(() => {
  if (!topMode.value) {
    return t("sales_rep.activity.load_failed");
  }
  return onSearchesTab.value
    ? t("sales_rep.customer_insights.search_history.load_failed")
    : t("sales_rep.customer_insights.browse_history.load_failed");
});

// The caveat concerns tracked (GA-sourced) rows, so it shows for those tabs and for the mixed "All" view.
const showCaveat = computed(() => !category.value || TRACKED_ACTIVITY_CATEGORIES.has(category.value));

// Top mode reuses the customer panels' "No tracked …" wording and their unavailable state.
const emptyText = computed(() => {
  if (topMode.value) {
    if (topUnavailable.value) {
      return t("sales_rep.customer_insights.analytics_unavailable");
    }
    return onSearchesTab.value
      ? t("sales_rep.customer_insights.search_history.empty")
      : t("sales_rep.customer_insights.browse_history.empty");
  }
  // An empty tracked tab is a quiet period or a source that never answered; only the flag tells them apart.
  if (analyticsUnavailable.value && showCaveat.value) {
    return t("sales_rep.customer_insights.analytics_unavailable");
  }
  if (category.value) {
    return t("sales_rep.activity.no_results");
  }
  return periodRule.value ? t("sales_rep.activity.empty_period") : t("sales_rep.activity.empty");
});

const emptyIcon = computed(() => {
  if (!topMode.value) {
    return "activity";
  }
  return onSearchesTab.value ? "search" : "eye";
});

// Icon-only Prev/Next on a phone: with their labels, two pages need ~350 px, wider than a 320 px screen leaves the
// card, and QA saw the page scroll sideways.
const isPhone = useBreakpoints(BREAKPOINTS).smaller("sm");

// totalCount counts rows the backend will not serve past its skip cap (see ACTIVITY_MAX_SKIP), so the
// pager stops at the deepest page that still comes back with rows.
const MAX_PAGES = Math.floor(ACTIVITY_MAX_SKIP / ACTIVITY_PAGE_SIZE) + 1;
const pages = computed(() => Math.min(Math.max(1, Math.ceil(totalCount.value / ACTIVITY_PAGE_SIZE)), MAX_PAGES));

watch(pages, (total) => {
  if (page.value > total) {
    page.value = total;
  }
});

// The scoped customer's name — resolved only when the query param narrows the feed.
const {
  customer,
  failed: customerFailed,
  notFound: customerNotFound,
} = useSalesRepCustomer(() => props.organizationId ?? "");
const customerName = computed(() => (props.organizationId ? customer.value?.organizationName : undefined));

// An id the rep cannot see would otherwise read as their own feed (fallback heading, every badge 0); only this
// query can tell. Both flags are scoped: no id, no read, and notFound answers only for the id being asked.
const customerUnavailable = computed(() => customerFailed.value || customerNotFound.value);

// The customer profile's own wording for the same two situations, reused rather than restated.
const unavailableText = computed(() =>
  customerFailed.value ? t("sales_rep.customer_profile.load_failed") : t("sales_rep.customer_profile.not_found"),
);

// The bare noun stands in until the customer's name resolves, so the heading never renders half-written.
const heading = computed(() => {
  if (!props.organizationId) {
    return t("sales_rep.activity.page.title");
  }
  return customerName.value
    ? t("sales_rep.activity.page.customer_title", { customer: customerName.value })
    : t("sales_rep.activity.page.title_fallback");
});

function scrollToTop(): void {
  window.scroll({ top: 0, behavior: "smooth" });
}

usePageHead({ title: heading });

const breadcrumbs = useBreadcrumbs(() => {
  const trail = [{ title: t("common.links.account"), route: { name: "Account" } }, { title: t("sales_rep.hub.title") }];

  // The customer segment waits for the name — a crumb with an empty title is worse than no crumb.
  if (!props.organizationId || !customerName.value) {
    return [...trail, { title: t("sales_rep.activity.breadcrumb") }];
  }

  return [
    ...trail,
    { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
    {
      title: customerName.value,
      route: { name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: props.organizationId } },
    },
    { title: t("sales_rep.activity.breadcrumb") },
  ];
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.activities {
  &__title {
    @apply [word-break:break-word];
  }

  &__results {
    @apply mt-4 flex flex-col gap-4;
  }

  &__controls {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__mode {
    @apply -mt-1 flex;
  }

  &__list,
  &__top-list {
    @apply flex flex-col divide-y divide-neutral-100 px-6 py-2;
  }

  &__top-row {
    @apply flex items-baseline gap-3 py-3;
  }

  &__top-rank {
    @apply w-5 flex-none text-right text-sm font-semibold text-neutral-400;
  }

  &__top-link {
    @apply min-w-0 text-sm font-medium text-[--link-color] [word-break:break-word] hover:underline;
  }

  &__top-name {
    @apply min-w-0 text-sm font-medium [word-break:break-word];
  }

  &__top-count {
    @apply ms-auto flex-none text-sm font-semibold text-neutral-500;
  }

  &__skeletons {
    @apply flex flex-col px-6 py-2;
  }

  &__skeleton {
    @apply my-3 h-12 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__pagination {
    @apply px-6 pb-5;
  }

  &__caveat {
    @apply flex items-center gap-1.5 text-xs text-neutral-500;
  }

  &__notice {
    @apply flex items-start gap-2 text-sm text-neutral-600;
  }

  &__notice-icon {
    @apply mt-0.5 shrink-0 text-warning;
  }
}
</style>
