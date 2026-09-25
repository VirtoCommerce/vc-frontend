<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- Below xl the page is one column, so the edit button moves to the very end instead. -->
    <LayoutSurface :scope="SCOPE" :cards="cards" :edit-button-placement="isCompact ? 'end' : 'mainColumn'" />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import LayoutSurface from "../components/layout-surface.vue";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";

const SCOPE = DASHBOARD_LAYOUT_SCOPE;

// The rail splits off at xl; below that the page is a single column and the button belongs at its end.
const isCompact = useBreakpoints(breakpointsTailwind).smaller("xl");

const { t } = useI18n();
const { cards } = useSalesRepDashboardWidgets();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-dashboard {
  @apply flex flex-col;

  gap: var(--page-stack, 1.625rem);

  &__title {
    @apply [word-break:break-word];
  }
}
</style>
