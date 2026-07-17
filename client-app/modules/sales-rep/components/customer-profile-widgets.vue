<template>
  <StatWidgets>
    <StatWidget
      v-for="card in cards"
      :key="card.key"
      :label="t(card.labelKey)"
      :value="card.value"
      :icon="card.icon"
      :accent="card.accent"
      :sub="card.sub"
      :delta="card.delta"
      :delta-tone="card.deltaTone"
      :delta-icon="card.deltaIcon"
    />
  </StatWidgets>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import StatWidget from "./stat-widget.vue";
import StatWidgets from "./stat-widgets.vue";
import type { StatWidgetCardType } from "../types/widgets";

interface IProps {
  organizationId: string;
}

// Unused until the stats query is wired (VCST-5309).
defineProps<IProps>();

const { t } = useI18n();

// MOCK — visual only (VCST-5308); real figures come from salesRepCustomerOrderStatistics in VCST-5309.
const cards: StatWidgetCardType[] = [
  {
    key: "ytd",
    labelKey: "sales_rep.customer_profile.widgets.ytd_purchases",
    icon: "chart-square-bar",
    accent: "success",
    value: "$72,165",
    sub: "vs $64,420 last year",
    delta: "12% YoY",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "open_balance",
    labelKey: "sales_rep.customer_profile.widgets.open_balance",
    icon: "credit-card",
    accent: "warning",
    value: "$1,200",
    sub: "1 invoice past due",
    delta: "Follow up needed",
    deltaTone: "negative",
    deltaIcon: "chevron-down",
  },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    accent: "secondary",
    value: "$5,551",
    sub: "across 13 orders YTD",
    delta: "Lifetime $355,613",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "orders_ytd",
    labelKey: "sales_rep.customer_profile.widgets.orders_ytd",
    icon: "lock-closed",
    accent: "primary",
    value: "13",
    sub: "last order Apr 21, 2026",
    delta: "Customer since 2014",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
];
</script>
