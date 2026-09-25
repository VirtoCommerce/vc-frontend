<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline tab: no rule name, so it clears the filter and is active while nothing is selected.
         It renders in the SAME loop as the rules so it can sit at either end (see `allLast`).
         Its value is `Boolean(true)` so no non-empty rule name can collide with it — `:value="true"`
         trips vue/prefer-true-attribute-shorthand and the shorthand it asks for passes "" instead. -->
    <VcTabSwitch
      v-for="tab in tabs"
      :key="tab.name ?? ''"
      class="sales-rep-rule-chips__tab"
      size="sm"
      :value="tab.name ?? Boolean(true)"
      :model-value="tab.name ? modelValue : !modelValue"
      @change="modelValue = tab.name"
    >
      <span class="sales-rep-rule-chips__label">{{ tab.label }}</span>

      <span v-if="tab.count !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(tab.count) }}</span>

      <!-- Adornments belong to whoever knows what a tab means: the baseline arrives with no name. -->
      <slot name="suffix" :tab="tab" />
    </VcTabSwitch>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { formatStatCount, selectableFilterRules } from "../utils";
import type { SalesRepRuleType } from "../types";

// A rendered tab: one of the rules, or the baseline, which has no rule name.
type TabType = Omit<SalesRepRuleType, "name"> & { name?: string };

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option).
  allLabel: string;
  // Item count for the baseline tab; rendered as a highlighted counter when present (like `rule.count`).
  allCount?: number;
  // Render the baseline tab after the rules instead of before them. For vocabularies that read as a
  // progression the widest option belongs at the end ("This month, This year, All time"), while a
  // set of alternatives keeps it first ("All, Orders, Customers…").
  allLast?: boolean;
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

const tabs = computed<TabType[]>(() => {
  const baseline: TabType = {
    label: props.allLabel,
    count: props.allCount,
  };

  return props.allLast ? [...selectableRules.value, baseline] : [baseline, ...selectableRules.value];
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-chips {
  @apply flex flex-wrap items-center gap-1;

  // The component's accent-500 default drops hover text below WCAG AA in every preset (VCST-5890).
  --vc-tab-switch-hover-color: var(--color-neutral-900);

  // The tab's own styling dims an unselected LABEL but leaves its count alone, so accenting every count left
  // the selected chip with nothing to tell it apart. Only the selected one is accented; the rest go neutral,
  // which is also what the mock shows (QA A-19). This reverses the earlier reading of the documents mock —
  // that mock does accent the count, but it does so on a chip row where the same was true of all of them.
  //
  // Brand -500 on the selected chip, and it clears AA there precisely BECAUSE the split above exists:
  // QA's 4.21:1 (A-13) was brand on the #F5F5F5 page canvas, which is where the UNSELECTED counts sit —
  // and those are neutral now. A selected tab's button is `bg-additional-50`, so its count sits on white,
  // where the same step computes to ~4.6:1. Darkening it to -700 read as no accent at all.
  &__count {
    // Bold like the label beside it: the count is the number the rep scans the row for.
    @apply font-bold text-neutral-600;

    .vc-tab-switch--checked & {
      @apply text-primary-500;
    }
  }
}
</style>
