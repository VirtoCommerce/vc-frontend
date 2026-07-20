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
import { useSalesRepCustomerWidgets } from "../composables/useSalesRepCustomerWidgets";
import StatWidget from "./stat-widget.vue";
import StatWidgets from "./stat-widgets.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// Real figures: order + cart statistics scoped to this customer (VCST-5485).
const { cards } = useSalesRepCustomerWidgets(() => props.organizationId);
</script>
