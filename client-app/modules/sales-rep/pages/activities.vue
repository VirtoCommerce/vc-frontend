<template>
  <div class="activities">
    <VcBreadcrumbs :items="breadcrumbs" />

    <!-- Narrowed to one customer via the ?organizationId= query param (the customer widget links
         here): the heading names that customer, exactly as the customer-orders page does. -->
    <VcTypography class="activities__title" tag="h1">
      {{ heading }}
    </VcTypography>

    <div class="activities__results">
      <div class="activities__controls">
        <!-- Category tabs driven by categoryCounts; zero-count categories keep their tab. -->
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

      <!-- Top|Recent mode toggle — only for the tracked categories that rank (searches, product
           views). Baseline chip = Recent (the feed), the customer panels' idiom in reverse. -->
      <div v-if="isRankableTab" class="activities__mode">
        <SalesRepRuleChips v-model="modeChip" :rules="modeRules" :all-label="t('sales_rep.customer_insights.recent')" />
      </div>

      <!-- A failure gets its own view — it must not read as "no activity" (VCST-5586). -->
      <VcEmptyView v-if="viewFailed && !viewLoading" :text="failedText" variant="error" />

      <VcEmptyView v-else-if="viewEmpty && !viewLoading" :text="emptyText" :icon="emptyIcon" />

      <VcWidget v-else size="md">
        <template #default-container>
          <!-- Skeleton on EVERY fetch (first load, tab/period/mode switch, page turn) — the table
               widgets do the same via VcTable's loading prop, and the GA-backed query can run for
               seconds. -->
          <div v-if="viewLoading" class="activities__skeletons" aria-hidden="true">
            <div v-for="index in skeletonRows" :key="index" class="activities__skeleton" />
          </div>

          <!-- Top mode: ranked count lists from salesRepCustomerInsights. Counts, not events — so
               no timestamps, and the list is capped single-page (no pager). -->
          <ol v-else-if="topMode && category === 'searches'" class="activities__top-list">
            <li v-for="(item, index) in topSearchItems" :key="item.term" class="activities__top-row">
              <span class="activities__top-rank">{{ index + 1 }}</span>

              <!-- The catalog search results page, exactly as the feed rows link (VCST-5731). -->
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
            <li v-for="(item, index) in topViewItems" :key="item.productId" class="activities__top-row">
              <span class="activities__top-rank">{{ index + 1 }}</span>

              <!-- Only a row the backend resolved to a real product carries a linkable id; an
                   unresolved one degrades to plain text (name or code). -->
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
              class="activities__pagination"
              @update:page="scrollToTop"
            />
          </template>
        </template>
      </VcWidget>

      <!-- Honesty caveat for the GA-sourced categories (searches, product views, logins). -->
      <p v-if="showCaveat && !viewFailed" class="activities__caveat">
        <VcIcon name="info" :size="14" aria-hidden="true" />
        {{ t("sales_rep.activity.caveat") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { getProductRoute } from "@/core/utilities/product";
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

// The hub's shared period model (Lifetime / This month / This year), surfaced as chips. It opens on
// This month: with no bounds the tracked categories are read from GA4's earliest supported date (2015),
// so "All time" scans a decade to render a page. It stays one chip away.
const { period, from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("month");

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

// The categories salesRepCustomerInsights can rank by count; only their tabs get the mode toggle.
const isRankableTab = computed(() => Boolean(category.value && RANKED_ACTIVITY_CATEGORIES.has(category.value)));

// Baseline chip = Recent (today's feed); the one selectable rule flips to the ranked Top list —
// the same chip idiom the customer panels use for their Top|Recent sort.
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

// The rows of the selected tab, and nothing else: without categoryCounts selected the backend reads
// only the category being shown, so a database-backed tab (Orders, Customers) never waits on Google.
const { items, totalCount, loading, error } = useSalesRepActivities({
  organizationId: () => props.organizationId,
  categories: () => (category.value ? [category.value] : undefined),
  periodFrom,
  periodTo,
  take: ACTIVITY_PAGE_SIZE,
  skip: () => (page.value - 1) * ACTIVITY_PAGE_SIZE,
  withCategoryCounts: false,
});

// The badges, in their own request: counting every category is the slow half, and it does not change
// as the rep switches tabs or turns pages, so it runs once per customer+period and the list never
// waits for it. take: 0 asks for counts only.
const { categoryCounts, loading: countsLoading } = useSalesRepActivities({
  organizationId: () => props.organizationId,
  periodFrom,
  periodTo,
  take: 0,
});

// The selected tab's badge comes from the rows themselves (totalCount covers exactly the requested
// categories), so the badge a rep is looking at can never disagree with the list under it — the two
// requests can otherwise land either side of a backend cache boundary. The other badges are the
// counts request's job.
const countOf = (name: string) =>
  name === category.value
    ? totalCount.value
    : (categoryCounts.value.find((entry) => entry.category === name)?.count ?? 0);

// "All" sums the badges; on the All tab the rows request already counted everything it merged.
const allCount = computed(() =>
  category.value ? categoryCounts.value.reduce((sum, entry) => sum + entry.count, 0) : totalCount.value,
);

// keepPreviousResult holds the outgoing response during any refetch, so badges keep their last-known
// figures across tab/period switches and while a Top view shows (the insights ops carry no
// categoryCounts). Only the very first load has nothing to hold: the tabs stay up without figures —
// a premature "(0)" on every tab reads as a real count, then jumps.
const countsPending = computed(() => countsLoading.value && !categoryCounts.value.length);

// Fixed vocabulary + counts. Zero-count categories keep their tab by design — a rep must see that a
// category exists and is quiet, not wonder where it went.
const categoryRules = computed<SalesRepRuleType[]>(() =>
  ACTIVITY_CATEGORIES.map((name) => {
    const label = t(`sales_rep.activity.tabs.${name}`);
    return { name, label: countsPending.value ? label : `${label} (${formatStatCount(countOf(name))})` };
  }),
);

const allTabLabel = computed(() =>
  countsPending.value
    ? t("sales_rep.activity.tabs.all")
    : `${t("sales_rep.activity.tabs.all")} (${formatStatCount(allCount.value)})`,
);

const failed = computed(() => Boolean(error.value));

// Each Top list runs only while its tab shows it — the GA-backed op can take seconds, so no
// speculative fetching. organizationId passes through only in the per-customer page mode; omitted,
// the backend aggregates across every organization the rep serves.
const topSearchesEnabled = computed(() => topMode.value && category.value === "searches");
const topViewsEnabled = computed(() => topMode.value && category.value === "productViews");

const {
  items: topSearchItems,
  notConfigured: topSearchesNotConfigured,
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
  notConfigured: topViewsNotConfigured,
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
const topNotConfigured = computed(() =>
  onSearchesTab.value ? topSearchesNotConfigured.value : topViewsNotConfigured.value,
);

const viewLoading = computed(() => (topMode.value ? topLoading.value : loading.value));
const viewFailed = computed(() => (topMode.value ? topFailed.value : failed.value));
const viewEmpty = computed(() => (topMode.value ? topNotConfigured.value || !topRowCount.value : !items.value.length));

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

// A category tab narrows the wording; the tracked-period phrasing covers the period-scoped feed.
// Top mode reuses the customer panels' "No tracked …" family (and their not-configured state — a
// null insights payload also covers a rep with no assigned organizations).
const emptyText = computed(() => {
  if (topMode.value) {
    if (topNotConfigured.value) {
      return t("sales_rep.customer_insights.not_configured");
    }
    return onSearchesTab.value
      ? t("sales_rep.customer_insights.search_history.empty")
      : t("sales_rep.customer_insights.browse_history.empty");
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

const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / ACTIVITY_PAGE_SIZE)));

// Clamp back to the last valid page when the set shrinks below the current page.
watch(pages, (total) => {
  if (page.value > total) {
    page.value = total;
  }
});

// The caveat concerns tracked (GA-sourced) rows, so it shows for those tabs and for the mixed "All" view.
const showCaveat = computed(() => !category.value || TRACKED_ACTIVITY_CATEGORIES.has(category.value));

// The scoped customer's name — resolved only when the query param narrows the feed.
const { customer } = useSalesRepCustomer(() => props.organizationId ?? "");
const customerName = computed(() => (props.organizationId ? customer.value?.organizationName : undefined));

// One line, no subtitle: rep-wide names whose feed this is, the narrowed mode names the customer.
// The bare noun stands in until the name resolves, so the heading never renders half-written.
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

  // Count emphasis carries the ranking (no timestamps in count mode).
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
}
</style>
