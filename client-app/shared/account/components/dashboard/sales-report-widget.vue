<template>
  <LayoutWidget :title="title" size="md" class="sales-report-widget">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="sales-report-widget__all-link">
        {{ $t("shared.account.dashboard.recent_orders.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- Charts of zeros would read as a quiet period; a user who never ordered gets the way to the catalog instead. -->
    <VcEmptyView
      v-if="hasOrders === false && !failed"
      :text="$t('shared.account.dashboard.recent_orders.empty')"
      icon="outline-order"
      data-test-id="sales-report-empty-section"
    >
      <template #button>
        <VcButton v-if="continue_shopping_link" :external-link="continue_shopping_link">
          {{ $t("pages.account.orders.buttons.no_orders") }}
        </VcButton>

        <VcButton v-else to="/">
          {{ $t("pages.account.orders.buttons.no_orders") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- The KPI tiles as on the Sales Rep Hub Reporting page; the table stays behind "All orders". -->
    <ReportingPanel v-else v-model:period="period" :data="data" :loading="loading" :error="failed" :with-table="false">
      <template v-if="excludedCount" #footnote-append>
        {{ $t("shared.account.dashboard.excluded_orders", { count: formatStatCount(excludedCount) }, excludedCount) }}
      </template>
    </ReportingPanel>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { formatStatCount } from "@/shared/dashboard";
import { isReportingPeriod, REPORTING_DEFAULT_PERIOD, ReportingPanel } from "@/shared/reporting";
import { useAccountSalesReport } from "../../composables/useAccountSalesReport";
import type { ReportingPeriodType } from "@/shared/reporting";
import LayoutWidget from "@/shared/dashboard/components/layout-widget.vue";

interface IProps {
  // Inside a layout the surface passes the block's title; LayoutWidget falls back to it otherwise.
  title?: string;
}

defineProps<IProps>();

const PERIOD_STORAGE_KEY = "vc-account-sales-report-period";

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

// Per browser: the user comes back to the period they last looked at.
const storedPeriod = useLocalStorage<string>(PERIOD_STORAGE_KEY, REPORTING_DEFAULT_PERIOD);

// Guarded on read: storage can hold anything, including a period a later release dropped.
const period = computed<ReportingPeriodType>({
  get: () => (isReportingPeriod(storedPeriod.value) ? storedPeriod.value : REPORTING_DEFAULT_PERIOD),
  set: (value) => {
    storedPeriod.value = value;
  },
});

const { data, excludedCount, hasOrders, loading, failed } = useAccountSalesReport(period);
</script>

<style lang="scss">
.sales-report-widget {
  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-normal text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
