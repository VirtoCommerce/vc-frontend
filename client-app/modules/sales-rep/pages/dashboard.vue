<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- Full-width KPI row (mock until the rep dashboard stats query lands). -->
    <DashboardWidgets />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import DashboardWidgets from "../components/dashboard-widgets.vue";

const { t } = useI18n();
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-dashboard {
  &__title {
    @apply [word-break:break-word];
  }
}
</style>
