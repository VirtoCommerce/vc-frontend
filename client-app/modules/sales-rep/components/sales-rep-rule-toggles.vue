<template>
  <div class="sales-rep-rule-toggles">
    <VcCheckbox
      v-for="rule in rules"
      :key="rule.name"
      size="sm"
      :model-value="!hidden.includes(rule.name)"
      :disabled="isLastShown(rule.name)"
      @update:model-value="$emit('toggle', rule.name)"
    >
      {{ rule.label }}
    </VcCheckbox>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SalesRepRuleType } from "../types";

interface IProps {
  /** The full catalog, in the order the backend returned it — unchecking never reorders the tabs. */
  rules: SalesRepRuleType[];
  /** Rule names currently unchecked. */
  hidden: readonly string[];
}

interface IEmits {
  (event: "toggle", name: string): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const shown = computed(() => props.rules.filter((rule) => !props.hidden.includes(rule.name)));

// Disabling the last checked box is the whole enforcement of "at least one tab stays visible" — no
// guard to bypass, and the rep can see why it will not move.
function isLastShown(name: string): boolean {
  return shown.value.length === 1 && shown.value[0]?.name === name;
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-toggles {
  @apply flex flex-wrap items-center gap-x-4 gap-y-2;
}
</style>
