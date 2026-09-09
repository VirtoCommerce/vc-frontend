<template>
  <div class="sales-rep-rule-chips">
    <!-- The baseline tab (no rule name) renders in the same loop as the rules, so it can sit at
         either end: clicking it clears the filter, and it is active while nothing is selected. -->
    <button
      v-for="tab in tabs"
      :key="tab.name ?? ''"
      type="button"
      :class="['sales-rep-rule-chips__tab', { 'sales-rep-rule-chips__tab--active': isActive(tab) }]"
      :aria-pressed="isActive(tab)"
      @click="modelValue = tab.name"
    >
      <span class="sales-rep-rule-chips__label" :data-text="tab.label">{{ tab.label }}</span>

      <span v-if="tab.count !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(tab.count) }}</span>

      <!-- Adornments belong to whoever knows what a tab means: the baseline arrives with no name. -->
      <slot name="suffix" :tab="tab" />
    </button>
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

// The baseline carries no rule name, so "nothing selected" is what makes it the active tab.
function isActive(tab: TabType): boolean {
  return tab.name ? modelValue.value === tab.name : !modelValue.value;
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-chips {
  @apply flex flex-wrap items-center gap-1;

  // The transparent border keeps every tab the same size so selecting one causes no layout shift.
  &__tab {
    // Radius follows the app-wide `--vc-radius` token so it tracks the theme's roundness setting.
    @apply inline-flex cursor-pointer items-center gap-1 rounded-[--vc-radius] border border-transparent px-3 py-1.5 text-sm font-medium text-neutral-500;

    &:hover {
      @apply text-neutral-900;
    }

    &--active {
      @apply border-neutral-200 bg-additional-50 font-semibold text-neutral-900 shadow;
    }
  }

  &__label {
    @apply inline-flex flex-col items-center;

    // Invisible ::after reserves the bold width so toggling font-weight never resizes the tab (avoids reflow).
    &::after {
      @apply invisible h-0 overflow-hidden font-semibold;

      content: attr(data-text);
    }
  }

  // Always bold + accent (the count doesn't dim with an unselected label), per the documents mock.
  &__count {
    @apply font-semibold text-primary-500;
  }
}
</style>
