<template>
  <div class="activities">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcTypography class="activities__title" tag="h1">
      {{ t("sales_rep.activity.page.title") }}
    </VcTypography>

    <!-- Narrowed to one customer via the ?organizationId= query param (the customer widget links here). -->
    <p v-if="organizationId && customerName" class="activities__scope">
      {{ t("sales_rep.activity.page.scoped_to", { organization: customerName }) }}
    </p>

    <div class="activities__results">
      <div class="activities__controls">
        <!-- Category tabs driven by categoryCounts; zero-count categories keep their tab. -->
        <SalesRepRuleChips v-model="category" :rules="categoryRules" :all-label="allTabLabel" />

        <SalesRepRuleChips
          v-model="periodRule"
          :rules="periodRules"
          :all-label="t('sales_rep.activity.period.all_time')"
        />
      </div>

      <!-- A failure gets its own view — it must not read as "no activity" (VCST-5586). -->
      <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.activity.load_failed')" variant="error" />

      <VcEmptyView
        v-else-if="!items.length && !loading"
        :text="category ? t('sales_rep.activity.no_results') : t('sales_rep.activity.empty')"
        icon="activity"
      />

      <VcWidget v-else size="md">
        <template #default-container>
          <div class="activities__list" :aria-busy="loading">
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
      </VcWidget>

      <!-- Honesty caveat for the GA-sourced categories (searches, product views, logins). -->
      <p v-if="showCaveat && !failed" class="activities__caveat">
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
import ActivityRow from "../components/activity-row.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import { useSalesRepActivities } from "../composables/useSalesRepActivities";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { ACTIVITY_CATEGORIES, ACTIVITY_PAGE_SIZE, GA_ACTIVITY_CATEGORIES, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import { formatStatCount } from "../utils";
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

// The hub's shared period model (Lifetime / This month / This year), surfaced as chips.
const { period, from: periodFrom, to: periodTo } = useSalesRepPeriodFilter();

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

// flush: "sync" resets the page before the variables watcher runs, so a tab/period change fires one
// request, not two.
watch(
  [category, periodRule],
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

// Counts-only run (take: 0) backs the tabs: unfiltered by category, so every tab keeps its total
// while one is selected.
const {
  categoryCounts,
  totalCount: allCount,
  loading: countsLoading,
} = useSalesRepActivities({
  organizationId: () => props.organizationId,
  periodFrom,
  periodTo,
  take: 0,
});

const countOf = (name: string) => categoryCounts.value.find((entry) => entry.category === name)?.count ?? 0;

// Fixed vocabulary + counts. Zero-count categories keep their tab by design — a rep must see that a
// category exists and is quiet, not wonder where it went.
const categoryRules = computed<SalesRepRuleType[]>(() =>
  ACTIVITY_CATEGORIES.map((name) => {
    const label = t(`sales_rep.activity.tabs.${name}`);
    return { name, label: `${label} (${formatStatCount(countOf(name))})` };
  }),
);

const allTabLabel = computed(() =>
  countsLoading.value && !allCount.value
    ? t("sales_rep.activity.tabs.all")
    : `${t("sales_rep.activity.tabs.all")} (${formatStatCount(allCount.value)})`,
);

const { items, totalCount, loading, error } = useSalesRepActivities({
  organizationId: () => props.organizationId,
  categories: () => (category.value ? [category.value] : undefined),
  periodFrom,
  periodTo,
  take: ACTIVITY_PAGE_SIZE,
  skip: () => (page.value - 1) * ACTIVITY_PAGE_SIZE,
});

const failed = computed(() => Boolean(error.value));

const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / ACTIVITY_PAGE_SIZE)));

// Clamp back to the last valid page when the set shrinks below the current page.
watch(pages, (total) => {
  if (page.value > total) {
    page.value = total;
  }
});

// The caveat concerns tracked (GA-sourced) rows, so it shows for those tabs and for the mixed "All" view.
const gaCategories = new Set<string>(GA_ACTIVITY_CATEGORIES);
const showCaveat = computed(() => !category.value || gaCategories.has(category.value));

// The scoped customer's name — resolved only when the query param narrows the feed.
const { customer } = useSalesRepCustomer(() => props.organizationId ?? "");
const customerName = computed(() => (props.organizationId ? customer.value?.organizationName : undefined));

function scrollToTop(): void {
  window.scroll({ top: 0, behavior: "smooth" });
}

usePageHead({
  title: computed(() => t("sales_rep.activity.page.title")),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  ...(props.organizationId && customerName.value
    ? [
        { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
        { title: customerName.value },
      ]
    : []),
  { title: t("sales_rep.activity.page.title") },
]);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.activities {
  &__title {
    @apply [word-break:break-word];
  }

  &__scope {
    @apply mt-1.5 text-sm text-neutral-500;
  }

  &__results {
    @apply mt-4 flex flex-col gap-4;
  }

  &__controls {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__list {
    @apply flex flex-col divide-y divide-neutral-100 px-6 py-2;
  }

  &__pagination {
    @apply px-6 pb-5;
  }

  &__caveat {
    @apply flex items-center gap-1.5 text-xs text-neutral-500;
  }
}
</style>
