<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline tab: active when no rule is chosen; clicking it clears the filter. Its value is a
         boolean so no non-empty rule name can collide with it (a rule named "" would still match,
         but every surface here already reads a falsy filter as the baseline).
         `Boolean(true)`, not `:value="true"`: the latter trips vue/prefer-true-attribute-shorthand,
         and the shorthand it asks for passes "" instead — same reason as variations.vue. -->
    <!-- A surface whose "no rule" state has more than one view (the Tasks page: Today / a day / All) draws its
         own baseline chips here, inside the row so they share its layout. -->
    <slot name="baseline">
      <SalesRepRuleChip
        :value="Boolean(true)"
        :model-value="!modelValue"
        :label="allLabel ?? ''"
        :count="allCount"
        @change="modelValue = undefined"
      />
    </slot>

    <SalesRepRuleChip
      v-for="rule in selectableRules"
      :key="rule.name"
      :value="rule.name"
      :model-value="modelValue"
      :label="rule.label"
      :count="rule.count"
      @change="modelValue = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { selectableFilterRules } from "../utils";
import SalesRepRuleChip from "./sales-rep-rule-chip.vue";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option). Unused when the #baseline slot is filled.
  allLabel?: string;
  // Item count for the baseline tab; rendered as a highlighted counter when present (like `rule.count`).
  allCount?: number;
  // Whether `rules` is still being fetched — an in-flight refetch must not look like "the rule is gone".
  loading?: boolean;
}

const props = defineProps<IProps>();

// undefined = baseline (first tab); single source of this convention across all rule-tab surfaces.
const modelValue = defineModel<string | undefined>();

// Data-derived vocabularies change with the scope (period, customer), so a selected rule can stop being offered — e.g.
// no order carries that status in the newly picked period. Fall back to the baseline instead of leaving a selection
// active that no tab shows (which would render an empty list with nothing looking selected).
watch(
  () => [props.loading, props.rules] as const,
  ([isLoading, rules]) => {
    if (isLoading || !modelValue.value) {
      return;
    }

    if (!rules.some((rule) => rule.name === modelValue.value)) {
      modelValue.value = undefined;
    }
  },
  { immediate: true },
);

// A backend "All" passthrough rule (customer segments carry one) would duplicate the baseline tab — drop it.
const selectableRules = computed(() => selectableFilterRules(props.rules));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-chips {
  @apply flex flex-wrap items-center gap-1;
}
</style>
