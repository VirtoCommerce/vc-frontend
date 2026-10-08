<template>
  <!-- display: contents — the chips stay flex items of the rule-chips row, and the block still has a root. -->
  <div class="sales-rep-task-scope-chips">
    <!-- Opened by picking a day other than today, closed only by its ×. No badge: the mockup gives it none. -->
    <span v-if="showDay" class="sales-rep-task-scope-chips__day">
      <SalesRepRuleChip value="day" :model-value="view" :label="dayLabel" @change="$emit('day')">
        <template #append>
          <!-- Room for the clear button laid over this end: the chip's content sits in a <button> of its own. -->
          <span class="sales-rep-task-scope-chips__clear-space" aria-hidden="true" />
        </template>
      </SalesRepRuleChip>

      <button
        type="button"
        class="sales-rep-task-scope-chips__clear"
        :aria-label="t('sales_rep.tasks.clear_day_aria', { date: dayLabel })"
        @click="clearDay"
      >
        <VcIcon name="delete-2" size="12px" />
      </button>
    </span>

    <SalesRepRuleChip
      ref="todayChipRef"
      value="today"
      :model-value="view"
      :label="t('sales_rep.tasks.today')"
      :count="counts.today"
      @change="$emit('today')"
    />

    <SalesRepRuleChip
      value="all"
      :model-value="view"
      :label="t('sales_rep.tasks.all')"
      :count="counts.all"
      @change="$emit('all')"
    />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import SalesRepRuleChip from "./sales-rep-rule-chip.vue";
import type { SalesRepTaskCountsType, SalesRepTaskScopeType } from "../types/tasks";
import type { ComponentPublicInstance } from "vue";

interface IProps {
  /** The scope on screen; undefined while a status tab has taken over. */
  view?: SalesRepTaskScopeType;
  /** The day the date chip holds, as the chip names it. */
  dayLabel: string;
  /** A day other than today has been picked and its chip not closed yet. */
  showDay: boolean;
  counts: Pick<SalesRepTaskCountsType, "today" | "all">;
}

const emit = defineEmits<{
  (event: "today"): void;
  (event: "day"): void;
  (event: "all"): void;
  (event: "clearDay"): void;
}>();

defineProps<IProps>();

const { t } = useI18n();

const todayChipRef = useTemplateRef<ComponentPublicInstance | null>("todayChipRef");

function clearDay(): void {
  (todayChipRef.value?.$el as HTMLElement | undefined)?.querySelector("button")?.focus();
  emit("clearDay");
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-scope-chips {
  @apply contents;

  &__day {
    @apply relative inline-flex;
  }

  // Wide enough that the 24px clear button clears the date beside it.
  &__clear-space {
    @apply inline-block w-5;
  }

  // A sibling laid over the chip's end, not a child: it cannot nest inside the tab's own <button>.
  // 24px: the WCAG 2.5.8 minimum, as it overlaps the chip's own target.
  &__clear {
    @apply absolute inset-y-0 end-1 my-auto flex size-6 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900;
  }
}
</style>
