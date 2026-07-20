<template>
  <div class="sales-rep-dashboard">
    <VcTypography class="sales-rep-dashboard__title" tag="h1">
      {{ t("sales_rep.hub.dashboard.page.title") }}
    </VcTypography>

    <!-- Full-width KPI row (real data: order/cart statistics + customer counts). -->
    <DashboardWidgets />

    <!-- Cross-customer orders with filter/sort/period controls (real data: salesRepOrders). -->
    <SalesRepOrders :title="t('sales_rep.orders.title')" filterable />

    <!-- Ranked top-selling products for the rep (real data: salesRepTopSellers). -->
    <TopSellers :title="t('sales_rep.top_sellers.title')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import DashboardWidgets from "../components/dashboard-widgets.vue";
import SalesRepOrders from "../components/sales-rep-orders.vue";
import TopSellers from "../components/top-sellers.vue";

const { t } = useI18n();
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-dashboard {
  @apply flex flex-col gap-5;

  &__title {
    @apply [word-break:break-word];
  }
}
</style>
