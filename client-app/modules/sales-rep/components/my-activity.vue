<template>
  <LayoutWidget :title="t('sales_rep.activity.my_activity.title')" size="md" class="my-activity">
    <template #append>
      <VcLink :to="{ name: ACTIVITIES_ROUTE_NAME }" class="my-activity__all-link">
        {{ t("sales_rep.activity.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <template #default-container>
      <div class="my-activity__body">
        <!-- A failure replaces the list: apollo keeps stale rows on a failed refetch (VCST-5586). -->
        <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.activity.load_failed')" variant="error" />

        <!-- A mixed feed: empty is not a quiet year when analytics did not answer — the flag says which. -->
        <VcEmptyView v-else-if="!items.length && !loading" :text="emptyText" icon="activity" />

        <!-- Same first-load skeleton as the insights widgets — the GA-backed query can run for seconds. -->
        <div v-else-if="loading && !items.length" class="my-activity__skeletons" aria-hidden="true">
          <div v-for="index in skeletonRows" :key="index" class="my-activity__skeleton" />
        </div>

        <div v-else class="my-activity__list">
          <ActivityRow v-for="(item, index) in items" :key="index" :item="item" compact show-organization />
        </div>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepActivities } from "../composables/useSalesRepActivities";
import { useSalesRepPeriodFilter } from "../composables/useSalesRepPeriodFilter";
import { ACTIVITIES_ROUTE_NAME, MY_ACTIVITY_TAKE } from "../constants";
import ActivityRow from "./activity-row.vue";
import LayoutWidget from "./layout-widget.vue";

const { t } = useI18n();

// Latest events across ALL assigned accounts, this year only (the window the Activities page opens on).
// No badges, so no counts are selected: the widget waits only for its own rows.
const { from: periodFrom, to: periodTo } = useSalesRepPeriodFilter("year");
const { items, loading, error, analyticsUnavailable } = useSalesRepActivities({
  take: MY_ACTIVITY_TAKE,
  periodFrom,
  periodTo,
  withCategoryCounts: false,
});

const emptyText = computed(() =>
  analyticsUnavailable.value
    ? t("sales_rep.customer_insights.analytics_unavailable")
    : t("sales_rep.activity.my_activity.empty"),
);

// As many skeleton rows as the widget will show, so the height holds when data arrives.
const skeletonRows = MY_ACTIVITY_TAKE;

const failed = computed(() => Boolean(error.value));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.my-activity {
  // min-height ≈ five compact rows, so the card keeps its footprint from skeleton to rows or empty.
  &__body {
    @apply min-h-60 px-6 pb-4 pt-1;
  }

  &__list {
    @apply flex flex-col divide-y divide-neutral-100;
  }

  &__skeletons {
    @apply flex flex-col;
  }

  &__skeleton {
    @apply my-3 h-12 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
