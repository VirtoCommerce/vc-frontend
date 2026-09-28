<template>
  <!-- Opened by picking a day other than today, closed only by its ×. No badge: the mockup gives it none. -->
  <span v-if="showDay" class="sales-rep-task-scope-chips__day">
    <VcTabSwitch class="sales-rep-rule-chips__tab" size="sm" value="day" :model-value="view" @change="$emit('day')">
      <span class="sales-rep-rule-chips__label">{{ dayLabel }}</span>

      <!-- Room for the clear button laid over this end: the tab's content sits in a <button> of its own. -->
      <span class="sales-rep-task-scope-chips__clear-space" aria-hidden="true" />
    </VcTabSwitch>

    <button
      type="button"
      class="sales-rep-task-scope-chips__clear"
      :aria-label="t('sales_rep.tasks.clear_day_aria', { date: dayLabel })"
      @click="clearDay"
    >
      <VcIcon name="delete-2" size="12px" />
    </button>
  </span>

  <VcTabSwitch
    ref="todayTabRef"
    class="sales-rep-rule-chips__tab"
    size="sm"
    value="today"
    :model-value="view"
    @change="$emit('today')"
  >
    <span class="sales-rep-rule-chips__label">{{ t("sales_rep.tasks.today") }}</span>

    <span class="sales-rep-rule-chips__count">{{ formatStatCount(counts.today) }}</span>
  </VcTabSwitch>

  <VcTabSwitch class="sales-rep-rule-chips__tab" size="sm" value="all" :model-value="view" @change="$emit('all')">
    <span class="sales-rep-rule-chips__label">{{ t("sales_rep.tasks.all") }}</span>

    <span class="sales-rep-rule-chips__count">{{ formatStatCount(counts.all) }}</span>
  </VcTabSwitch>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { formatStatCount } from "../utils";
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

const todayTabRef = useTemplateRef<ComponentPublicInstance | null>("todayTabRef");

function clearDay(): void {
  (todayTabRef.value?.$el as HTMLElement | undefined)?.querySelector("button")?.focus();
  emit("clearDay");
}
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
