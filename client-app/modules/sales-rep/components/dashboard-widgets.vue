<template>
  <StatWidgets>
    <StatWidget
      v-for="card in cards"
      :key="card.key"
      :label="t(card.labelKey)"
      :value="card.value"
      :value-suffix="card.valueSuffix"
      :icon="card.icon"
      :accent="card.accent"
      :sub="card.sub"
      :delta="card.delta"
      :delta-tone="card.deltaTone"
      :delta-icon="card.deltaIcon"
      :loading="loading"
    />
  </StatWidgets>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import StatWidget from "./stat-widget.vue";
import StatWidgets from "./stat-widgets.vue";

const { t } = useI18n();

const { cards, loading } = useSalesRepDashboardWidgets();
</script>
