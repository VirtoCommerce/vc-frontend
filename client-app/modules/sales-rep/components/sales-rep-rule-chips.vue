<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline chip: selected (solid) when no rule is chosen; clicking it clears the filter. -->
    <VcChip
      :variant="modelValue ? 'outline' : 'solid'"
      color="secondary"
      size="sm"
      clickable
      @click="modelValue = undefined"
    >
      {{ allLabel }}
    </VcChip>

    <VcChip
      v-for="rule in selectableRules"
      :key="rule.name"
      :variant="modelValue === rule.name ? 'solid' : 'outline'"
      color="secondary"
      size="sm"
      clickable
      @click="modelValue = rule.name"
    >
      {{ rule.label }}
    </VcChip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // The server-defined filter rules to offer as chips.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline chip (the "All" / no-filter option).
  allLabel: string;
}

const props = defineProps<IProps>();

// Selected rule name; `undefined` is the baseline (rendered as the first chip). Single source of the
// "undefined = All, selected = solid" convention so the three surfaces that show rule chips can't drift.
const modelValue = defineModel<string | undefined>();

// A backend "All" passthrough rule (customer segments carry one) would duplicate the baseline chip — drop it.
const selectableRules = computed(() => props.rules.filter((rule) => rule.name.toLowerCase() !== "all"));
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-rule-chips {
  @apply flex flex-wrap gap-2;
}
</style>
