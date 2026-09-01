<template>
  <LayoutWidget :title="title" size="md" class="sales-rep-tasks">
    <template #append>
      <VcLink :to="{ name: CALENDAR_ROUTE_NAME }" class="sales-rep-tasks__all-link">
        {{ t("sales_rep.tasks.full_calendar") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <template #default-container>
      <div class="sales-rep-tasks__body">
        <SalesRepTaskCalendar
          v-model="selectedDay"
          :month="month"
          :day-markers="dayMarkers"
          size="sm"
          @update:month="setMonth"
        />

        <div class="sales-rep-tasks__day">
          <span class="sales-rep-tasks__day-label">{{ selectedDayLabel }}</span>

          <span class="sales-rep-tasks__day-count">{{
            t("sales_rep.tasks.day_task_count", { count: totalCount }, totalCount)
          }}</span>
        </div>

        <!-- A failure replaces the rows: apollo keeps the previous rows on a failed refetch. -->
        <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.tasks.load_failed')" variant="error" />

        <VcEmptyView v-else-if="!tasks.length && !loading" :text="t('sales_rep.tasks.empty_day')" icon="calendar" />

        <ul v-else-if="loading && !tasks.length" class="sales-rep-tasks__list" aria-hidden="true">
          <li v-for="index in rowLimit" :key="index" class="sales-rep-tasks__row">
            <div class="sales-rep-tasks__skeleton" />
          </li>
        </ul>

        <ul v-else class="sales-rep-tasks__list">
          <li
            v-for="task in tasks"
            :key="task.id"
            :class="['sales-rep-tasks__row', `sales-rep-tasks__row--${task.status}`]"
          >
            <div class="sales-rep-tasks__details">
              <span class="sales-rep-tasks__name" :title="task.name">{{ task.name }}</span>

              <span v-if="subline(task)" class="sales-rep-tasks__meta">{{ subline(task) }}</span>
            </div>

            <SalesRepTaskStatus :status="task.status" />
          </li>
        </ul>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBlockChrome } from "../composables/useBlockChrome";
import { useMonthAnchor, useSalesRepTaskCalendar } from "../composables/useSalesRepTaskCalendar";
import { useSalesRepTasks } from "../composables/useSalesRepTasks";
import { CALENDAR_ROUTE_NAME, TASKS_DEFAULT_ROWS } from "../constants";
import { localDayKey, localDayWindow } from "../tasks";
import LayoutWidget from "./layout-widget.vue";
import SalesRepTaskCalendar from "./sales-rep-task-calendar.vue";
import SalesRepTaskStatus from "./sales-rep-task-status.vue";
import type { SalesRepTaskType } from "../types/tasks";

interface IProps {
  // Omit inside a layout; LayoutWidget then falls back to the block's titleKey.
  title?: string;
}

withDefaults(defineProps<IProps>(), { title: undefined });

const { t, d } = useI18n();

// Absent when this widget renders outside a layout.
const chrome = useBlockChrome();

// The saved cap, not the draft: it is a query variable, so it applies on save.
const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? TASKS_DEFAULT_ROWS);

const selectedDay = ref(localDayKey(new Date()));
// Drives the dots query; the calendar owns which month is on screen and reports it back.
const { month, setMonth } = useMonthAnchor();

const period = computed(() => localDayWindow(selectedDay.value));

// Hidden ⇒ zero requests: the layout mounts only visible blocks.
const {
  items: tasks,
  loading,
  error,
  totalCount,
} = useSalesRepTasks({
  period,
  pageSize: () => rowLimit.value,
  sort: "due-date",
});

const { dayMarkers } = useSalesRepTaskCalendar(month);

const failed = computed(() => Boolean(error.value));

const selectedDayLabel = computed(() => d(new Date(`${selectedDay.value}T00:00:00`), "short"));

// Same reading as the Calendar page's table: the deadline when it is the useful thing, else the type.
function subline(task: SalesRepTaskType): string {
  if (!task.dueDate) {
    return task.type;
  }

  if (task.status === "overdue") {
    return t("sales_rep.tasks.due_relative.expired", { date: d(task.dueDate, "short") });
  }

  return task.status === "completed"
    ? task.type
    : t("sales_rep.tasks.due_relative.due", { date: d(task.dueDate, "short") });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-tasks {
  &__body {
    @apply flex flex-col px-6 py-2;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }

  &__day {
    @apply mt-3 flex items-baseline gap-2 border-t pt-3;
  }

  &__day-label {
    @apply text-sm font-bold;
  }

  &__day-count {
    @apply text-xs text-neutral-500;
  }

  &__list {
    @apply m-0 flex list-none flex-col divide-y divide-neutral-100 p-0;
  }

  &__row {
    @apply flex items-center gap-3 py-3;

    // Logical border so the accent flips in RTL; mirrors the table's row accents.
    border-inline-start: 3px solid transparent;
    @apply ps-2;

    &--overdue {
      border-inline-start-color: var(--color-danger-500);
    }

    &--upcoming {
      border-inline-start-color: var(--color-info-500);
    }

    &--completed {
      border-inline-start-color: var(--color-success-500);
    }
  }

  &__details {
    @apply flex min-w-0 grow flex-col;
  }

  &__name {
    @apply truncate text-sm font-bold;
  }

  &__meta {
    @apply mt-0.5 truncate text-xs text-neutral-500;
  }

  &__skeleton {
    @apply h-9 w-full animate-pulse rounded bg-neutral-100;
  }
}
</style>
