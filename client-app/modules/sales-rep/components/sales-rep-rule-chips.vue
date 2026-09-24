<template>
  <div class="sales-rep-rule-chips">
    <!-- Baseline tab: active when no rule is chosen; clicking it clears the filter. Its value is a
         boolean so no non-empty rule name can collide with it (a rule named "" would still match,
         but every surface here already reads a falsy filter as the baseline).
         `Boolean(true)`, not `:value="true"`: the latter trips vue/prefer-true-attribute-shorthand,
         and the shorthand it asks for passes "" instead — same reason as variations.vue. -->
    <VcTabSwitch
      class="sales-rep-rule-chips__tab"
      size="sm"
      :value="Boolean(true)"
      :model-value="!modelValue"
      @change="modelValue = undefined"
    >
      <span class="sales-rep-rule-chips__label">{{ allLabel }}</span>

      <span v-if="allCount !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(allCount) }}</span>
    </VcTabSwitch>

    <VcTabSwitch
      v-for="rule in selectableRules"
      :key="rule.name"
      class="sales-rep-rule-chips__tab"
      size="sm"
      :value="rule.name"
      :model-value="modelValue"
      @change="modelValue = $event"
    >
      <span class="sales-rep-rule-chips__label">{{ rule.label }}</span>

      <span v-if="rule.count !== undefined" class="sales-rep-rule-chips__count">{{ formatStatCount(rule.count) }}</span>
    </VcTabSwitch>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { formatStatCount, selectableFilterRules } from "../utils";
import type { SalesRepRuleType } from "../types";

interface IProps {
  // The server-defined filter rules to offer as tabs.
  rules: SalesRepRuleType[];
  // Label for the synthetic baseline tab (the "All" / no-filter option).
  allLabel: string;
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
