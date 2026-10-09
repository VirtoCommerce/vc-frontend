<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <LayoutSurface :scope="SCOPE" :cards="cards" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LayoutSurface from "../components/layout-surface.vue";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import { DASHBOARD_LAYOUT_SCOPE } from "../constants";

const SCOPE = DASHBOARD_LAYOUT_SCOPE;

const { t } = useI18n();
const { cards } = useSalesRepDashboardWidgets();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-dashboard {
  @apply flex flex-col gap-5;

  &__title {
    @apply [word-break:break-word];
  }
}
</style>
