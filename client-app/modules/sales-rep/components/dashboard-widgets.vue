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

const { t } = useI18n();

// MOCK — visual only (VCST-5485); real figures come from the rep dashboard stats query (future story).
const cards: StatWidgetCardType[] = [
  {
    key: "orders_on_hold",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_on_hold",
    icon: "exclamation-circle",
    accent: "warning",
    value: "2",
    sub: "$4,860.00 total",
    delta: "1 from last week",
    deltaTone: "negative",
    deltaIcon: "chevron-down",
  },
  {
    key: "active_projects",
    labelKey: "sales_rep.hub.dashboard.widgets.active_projects",
    icon: "clipboard-list",
    accent: "success",
    value: "14",
    sub: "3 shared with you",
    delta: "2 new this week",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "orders_placed_mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    icon: "duplicate",
    accent: "info",
    value: "47",
    sub: "$142,510.00",
    delta: "+18% vs last month",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "my_customers",
    labelKey: "sales_rep.hub.dashboard.widgets.my_customers",
    icon: "users",
    accent: "neutral",
    value: "68",
    sub: "12 ordered this month",
    delta: "3 new customers",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
];
</script>
