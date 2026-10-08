<template>
  <div class="sales-rep-rule-chips">
    <!-- The baseline (no rule name) renders in the same loop as the rules, so it can sit at either end. Its value is
         `Boolean(true)`: `:value="true"` trips vue/prefer-true-attribute-shorthand, whose shorthand passes "".
         A surface whose "no rule" state has more than one view (the Tasks page: Today / a day / All) draws its own
         baseline chips through #baseline, inside the row so they share its layout. -->
    <template v-for="tab in tabs" :key="tab.name ?? ''">
      <slot v-if="!tab.name" name="baseline">
        <SalesRepRuleChip
          :value="Boolean(true)"
          :model-value="!modelValue"
          :label="tab.label"
          :count="tab.count"
          @change="modelValue = undefined"
        >
          <!-- Adornments belong to whoever knows what a tab means: the baseline arrives with no name. -->
          <template #append>
            <slot name="suffix" :tab="tab" />
          </template>
        </SalesRepRuleChip>
      </slot>

      <SalesRepRuleChip
        v-else
        :value="tab.name"
        :model-value="modelValue"
        :label="tab.label"
        :count="tab.count"
        @change="modelValue = $event"
      >
        <template #append>
          <slot name="suffix" :tab="tab" />
        </template>
      </SalesRepRuleChip>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { selectableFilterRules } from "../utils";
import SalesRepRuleChip from "./sales-rep-rule-chip.vue";
import type { SalesRepRuleType } from "../types";

// A rendered tab: one of the rules, or the baseline, which has no rule name.
type TabType = Omit<SalesRepRuleType, "name"> & { name?: string };

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option). Unused when the #baseline slot is filled.
  allLabel?: string;
  // Item count for the baseline tab; rendered as a highlighted counter when present (like `rule.count`).
  allCount?: number;
  // Baseline last, for a progression ("This month, This year, All time"); a set of alternatives keeps it first.
  allLast?: boolean;
  // Whether `rules` is still being fetched — an in-flight refetch must not look like "the rule is gone".
  loading?: boolean;
}

const props = defineProps<IProps>();

// undefined = the baseline tab; single source of this convention across all rule-tab surfaces.
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

const tabs = computed<TabType[]>(() => {
  const baseline: TabType = {
    label: props.allLabel ?? "",
    count: props.allCount,
  };

  return props.allLast ? [...selectableRules.value, baseline] : [baseline, ...selectableRules.value];
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-chips {
  @apply flex flex-wrap items-center gap-1;
}
</style>
