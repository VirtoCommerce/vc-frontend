<template>
  <VcTabSwitch
    class="sales-rep-rule-chip"
    size="sm"
    :value="value"
    :model-value="modelValue"
    @change="$emit('change', value)"
  >
    <span class="sales-rep-rule-chip__label">{{ label }}</span>

    <span
      v-if="count !== undefined"
      :class="['sales-rep-rule-chip__count', { 'sales-rep-rule-chip__count--checked': checked }]"
    >
      {{ formatStatCount(count) }}
    </span>

    <slot name="append" />
  </VcTabSwitch>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
import { computed } from "vue";
import { formatStatCount } from "../utils";

defineEmits<{
  (event: "change", value: T): void;
}>();

// Inline, not an IProps interface: a generic component's props type is part of its exported declaration.
const props = defineProps<{
  value: T;
  // The row's selection; undefined when the row's chosen view is none of its chips.
  modelValue: T | undefined;
  label: string;
  // Rendered as a counter when present.
  count?: number;
}>();

// The tab's own rule, read here rather than off its `--checked` class: the kit's classes are not ours to select.
const checked = computed(() => props.modelValue === props.value);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-rule-chip {
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

    &--checked {
      @apply text-primary-500;
    }
  }
}
</style>
