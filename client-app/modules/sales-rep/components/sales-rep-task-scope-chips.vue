<template>
  <!-- Only while a day other than today is picked; clearing it goes back to today. -->
  <span v-if="showDay" class="sales-rep-task-scope-chips__day">
    <VcTabSwitch class="sales-rep-rule-chips__tab" size="sm" value="day" :model-value="view" @change="$emit('day')">
      <span class="sales-rep-rule-chips__label">{{ dayLabel }}</span>

      <span class="sales-rep-rule-chips__count">{{ formatStatCount(counts.day) }}</span>

      <!-- Room for the clear button laid over this end: the tab's content sits in a <button> of its own. -->
      <span class="sales-rep-task-scope-chips__clear-space" aria-hidden="true" />
    </VcTabSwitch>

    <button
      type="button"
      class="sales-rep-task-scope-chips__clear"
      :aria-label="t('sales_rep.tasks.clear_day_aria', { date: dayLabel })"
      @click="$emit('clearDay')"
    >
      <VcIcon name="delete-2" size="xs" />
    </button>
  </span>

  <VcTabSwitch class="sales-rep-rule-chips__tab" size="sm" value="today" :model-value="view" @change="$emit('today')">
    <span class="sales-rep-rule-chips__label">{{ t("sales_rep.tasks.today") }}</span>

    <span class="sales-rep-rule-chips__count">{{ formatStatCount(counts.today) }}</span>
  </VcTabSwitch>

  <VcTabSwitch class="sales-rep-rule-chips__tab" size="sm" value="all" :model-value="view" @change="$emit('all')">
    <span class="sales-rep-rule-chips__label">{{ t("sales_rep.tasks.all") }}</span>

    <span class="sales-rep-rule-chips__count">{{ formatStatCount(counts.all) }}</span>
  </VcTabSwitch>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatStatCount } from "../utils";
import type { SalesRepTaskCountsType, SalesRepTaskScopeType } from "../types/tasks";

interface IProps {
  /** The scope on screen; undefined while a status tab has taken over. */
  view?: SalesRepTaskScopeType;
  /** The picked day, as the chip names it. */
  dayLabel: string;
  /** A day other than today is picked, so it gets a chip of its own. */
  showDay: boolean;
  counts: Pick<SalesRepTaskCountsType, "today" | "day" | "all">;
}

defineEmits<{
  (event: "today"): void;
  (event: "day"): void;
  (event: "all"): void;
  (event: "clearDay"): void;
}>();

defineProps<IProps>();

const { t } = useI18n();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-scope-chips {
  &__day {
    @apply relative inline-flex;
  }

  &__clear-space {
    @apply inline-block w-4;
  }

  // A sibling laid over the chip's end, not a child: it cannot nest inside the tab's own <button>.
  &__clear {
    @apply absolute inset-y-0 end-1 my-auto flex size-5 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900;
  }
}
</style>
