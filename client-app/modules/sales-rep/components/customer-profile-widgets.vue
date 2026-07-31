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
import { useSalesRepCustomerWidgets } from "../composables/useSalesRepCustomerWidgets";
import StatWidget from "./stat-widget.vue";
import StatWidgets from "./stat-widgets.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const { cards, loading } = useSalesRepCustomerWidgets(() => props.organizationId);
</script>
