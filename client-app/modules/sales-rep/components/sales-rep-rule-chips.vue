<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline tab: active when no rule is chosen; clicking it clears the filter. -->
    <button
      type="button"
      :class="['sales-rep-rule-chips__tab', { 'sales-rep-rule-chips__tab--active': !modelValue }]"
      :aria-pressed="!modelValue"
      :data-text="allLabel"
      @click="modelValue = undefined"
    >
      {{ allLabel }}
    </button>

    <button
      v-for="rule in selectableRules"
      :key="rule.name"
      type="button"
      :class="['sales-rep-rule-chips__tab', { 'sales-rep-rule-chips__tab--active': modelValue === rule.name }]"
      :aria-pressed="modelValue === rule.name"
      :data-text="rule.label"
      @click="modelValue = rule.name"
    >
      {{ rule.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { selectableFilterRules } from "../utils";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option).
  allLabel: string;
}

const props = defineProps<IProps>();

// Selected rule name; `undefined` is the baseline (rendered as the first tab). Single source of the
// "undefined = All, selected = active" convention so the three surfaces that show rule tabs can't drift.
const modelValue = defineModel<string | undefined>();

// A backend "All" passthrough rule (customer segments carry one) would duplicate the baseline tab — drop it.
const selectableRules = computed(() => selectableFilterRules(props.rules));
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.sales-rep-rule-chips {
  @apply flex flex-wrap items-center gap-1;

  // Segmented-tab look: only the active option is a raised white pill; the rest are plain text.
  // The transparent border keeps every tab the same size so selecting one causes no layout shift.
  &__tab {
    // Radius follows the app-wide `--vc-radius` token so it tracks the theme's roundness setting.
    @apply inline-flex cursor-pointer flex-col items-center rounded-[--vc-radius] border border-transparent px-3 py-1.5 text-sm font-medium text-neutral-500;

    // Reserve the bold (active) width on every tab so toggling font-weight never changes a tab's size —
    // otherwise activating a tab widens it and can push a neighbour onto the next row (visible reflow).
    // The measure is a zero-height, invisible copy rendered at the active weight.
    &::after {
      @apply invisible h-0 overflow-hidden font-semibold;

      content: attr(data-text);
    }

    &:hover {
      @apply text-neutral-900;
    }

    &--active {
      @apply border-neutral-200 bg-additional-50 font-semibold text-neutral-900 shadow;
    }
  }
}
</style>
