<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline tab: active when no rule is chosen; clicking it clears the filter. -->
    <button
      type="button"
      :class="['sales-rep-rule-chips__tab', { 'sales-rep-rule-chips__tab--active': !modelValue }]"
      :aria-pressed="!modelValue"
      @click="modelValue = undefined"
    >
      <span class="sales-rep-rule-chips__label" :data-text="allLabel">{{ allLabel }}</span>

      <span v-if="allCount !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(allCount) }}</span>

      <TrackedMetricHint v-if="allTracked" slow />
    </button>

    <button
      v-for="rule in selectableRules"
      :key="rule.name"
      type="button"
      :class="['sales-rep-rule-chips__tab', { 'sales-rep-rule-chips__tab--active': modelValue === rule.name }]"
      :aria-pressed="modelValue === rule.name"
      @click="modelValue = rule.name"
    >
      <span class="sales-rep-rule-chips__label" :data-text="rule.label">{{ rule.label }}</span>

      <span v-if="rule.count !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(rule.count) }}</span>

      <TrackedMetricHint v-if="rule.tracked" slow />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { formatStatCount, selectableFilterRules } from "../utils";
import TrackedMetricHint from "./tracked-metric-hint.vue";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option).
  allLabel: string;
  // Item count for the baseline tab; rendered as a highlighted counter when present (like `rule.count`).
  allCount?: number;
  // Whether the baseline tab's figure comes from tracked activity (like `rule.tracked`).
  allTracked?: boolean;
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
