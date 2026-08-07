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
      :loading="card.loading"
      :error-text="card.failed ? t('sales_rep.hub.dashboard.stats.load_failed') : ''"
    />
  </StatWidgets>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSalesRepDashboardWidgets } from "../composables/useSalesRepDashboardWidgets";
import StatWidget from "./stat-widget.vue";
import StatWidgets from "./stat-widgets.vue";

const { t } = useI18n();

const { cards } = useSalesRepDashboardWidgets();
</script>
