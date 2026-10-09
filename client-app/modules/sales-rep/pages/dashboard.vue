<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <LayoutSurface :layout="layout" :cards="cards" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { LAYOUT_SCOPES, useLayout } from "@/shared/dashboard";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import LayoutSurface from "@/shared/dashboard/components/layout-surface.vue";

const { t } = useI18n();
// The page owns the layout: the surface renders it, and the statistics queries are shaped from it.
const layout = useLayout(LAYOUT_SCOPES.salesRepDashboard);
const { cards } = useSalesRepDashboardWidgets(layout);
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
