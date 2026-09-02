<template>
  <div class="sales-rep-calendar">
    <div class="sales-rep-calendar__head">
      <div class="sales-rep-calendar__heading">
        <VcTypography class="sales-rep-calendar__title" tag="h1">
          {{ t("sales_rep.tasks.title") }}
        </VcTypography>

        <p class="sales-rep-calendar__subtitle">{{ t("sales_rep.tasks.page.subtitle") }}</p>
      </div>

      <div class="sales-rep-calendar__actions">
        <VcButton color="secondary" variant="outline" prepend-icon="calendar" @click="goToToday">
          {{ t("sales_rep.tasks.today") }}
        </VcButton>

        <VcButton prepend-icon="plus" @click="openTaskModal()">
          {{ t("sales_rep.tasks.new_task") }}
        </VcButton>
      </div>
    </div>

    <SalesRepRuleAlert :filter-failed="filterRulesFailed" />

    <SalesRepRuleChips
      v-model="filter"
      :rules="tabRules"
      :all-label="t('sales_rep.tasks.page.all_tab')"
      :all-count="counts.all"
      :loading="filterRulesLoading"
    />

    <div class="sales-rep-calendar__body">
      <VcWidget size="md" class="sales-rep-calendar__day">
        <template #header-container>
          <div class="sales-rep-calendar__day-head">
            <div>
              <VcTypography tag="h2" class="sales-rep-calendar__day-title">{{ panelTitle }}</VcTypography>

              <span class="sales-rep-calendar__day-count">
                {{ t("sales_rep.tasks.day_of_total", { shown: tasks.length, total: totalCount }) }}
              </span>
            </div>

            <VcButton size="sm" color="secondary" variant="outline" prepend-icon="plus" @click="openTaskModal()">
              {{ t("sales_rep.tasks.add_task") }}
            </VcButton>
          </div>
        </template>

        <template #default-container>
          <!-- A failure replaces the rows: apollo keeps the previous ones on a failed refetch. -->
          <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.tasks.load_failed')" variant="error" />

          <!-- Never a keyword miss — this page has no search — so empty means the current scope is empty, and
               which scope that is depends on whether a status tab replaced the day. -->
          <VcEmptyView
            v-else-if="!tasks.length && !loading"
            :text="t(filter ? 'sales_rep.tasks.empty' : 'sales_rep.tasks.empty_day')"
            variant="empty"
            icon="calendar"
          />

          <SalesRepTaskList
            v-else
            :tasks="tasks"
            :loading="loading"
            :busy="saving"
            :page="page"
            :pages="pages"
            @toggle="toggleCompletion"
            @edit="openTaskModal"
            @update:page="changePage"
          />
        </template>
      </VcWidget>

      <aside class="sales-rep-calendar__aside">
        <!-- VcCalendar renders its own month/year header, so this widget adds none. -->
        <VcWidget size="md">
          <SalesRepTaskCalendar
            :model-value="selectedDay"
            :month="month"
            :day-markers="dayMarkers"
            @update:model-value="selectDay"
            @update:month="setMonth"
          />

          <ul class="sales-rep-calendar__legend">
            <li v-for="kind in TASK_MARKER_KINDS" :key="kind" class="sales-rep-calendar__legend-item">
              <span :class="`sales-rep-calendar__legend-dot sales-rep-calendar__legend-dot--${kind}`" />
              {{ t(`sales_rep.tasks.legend.${kind}`) }}
            </li>
          </ul>
        </VcWidget>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useModal } from "@/shared/modal";
import SalesRepRuleAlert from "../components/sales-rep-rule-alert.vue";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import SalesRepTaskCalendar from "../components/sales-rep-task-calendar.vue";
import SalesRepTaskList from "../components/sales-rep-task-list.vue";
import SalesRepTaskModal from "../components/sales-rep-task-modal.vue";
import { useSalesRepRules } from "../composables/useSalesRepRules";
import { useMonthAnchor, useSalesRepTaskCalendar } from "../composables/useSalesRepTaskCalendar";
import { useSalesRepTaskCounts } from "../composables/useSalesRepTaskCounts";
import { useSalesRepTaskMutations } from "../composables/useSalesRepTaskMutations";
import { useSalesRepTasks } from "../composables/useSalesRepTasks";
import { TASK_MARKER_KINDS, localDayKey, localDayKeyToDate, localDayWindow, toMonthKey } from "../tasks";
import type { SalesRepTaskType } from "../types/tasks";

const { t, d } = useI18n();
const { openModal } = useModal();

const selectedDay = ref(localDayKey(new Date()));
// Drives the dots query. The calendar owns which month is on screen and reports it back.
const { month, setMonth, goToToday: monthToday } = useMonthAnchor();

/**
 * The day and the status tab are two views of the same set, not two filters over it: a status tab spans every
 * date (overdue work is never due today, so intersecting it with a day would show nothing), and picking a date
 * goes back to that day's full list. Anding them is what made an active "Completed 3" sit over an empty list —
 * the badges count the whole set, so a tab must show the whole set too.
 */
const filter = ref<string | undefined>(undefined);

const period = computed(() => (filter.value ? undefined : localDayWindow(selectedDay.value)));

const {
  items: tasks,
  loading,
  error,
  page,
  pages,
  totalCount,
  refetch,
} = useSalesRepTasks({
  period,
  filter,
  sort: "due-date",
});

const { counts, refetch: refetchCounts } = useSalesRepTaskCounts();
const { dayMarkers, refetch: refetchMarkers } = useSalesRepTaskCalendar(month);
const { setCompleted, loading: saving } = useSalesRepTaskMutations();

const {
  rules: filterRules,
  failed: filterRulesFailed,
  loading: filterRulesLoading,
} = useSalesRepRules("task", "filter");

const failed = computed(() => Boolean(error.value));

// Badge each server-offered tab with its own total. The counts query and the chips agree by rule name.
const tabRules = computed(() =>
  filterRules.value.map((rule) => ({
    ...rule,
    count: counts.value[rule.name as keyof typeof counts.value],
  })),
);

// "short" (Sep 1, 2026), not "long" — the long named format appends a time, and this heading names a DAY.
const selectedDayLabel = computed(() => d(localDayKeyToDate(selectedDay.value), "short"));

// Whichever view is on: the day, or the tab named by its own chip.
const panelTitle = computed(() =>
  filter.value
    ? (filterRules.value.find((rule) => rule.name === filter.value)?.label ?? filter.value)
    : selectedDayLabel.value,
);

function selectDay(day: string): void {
  selectedDay.value = day;
  filter.value = undefined;
}

function goToToday(): void {
  selectDay(localDayKey(new Date()));
  monthToday();
}

function changePage(value: number): void {
  page.value = value;
}

// Every surface reads the same records, so a write refreshes all three rather than patching the cache.
async function refreshAll(): Promise<void> {
  await Promise.all([refetch(), refetchCounts(), refetchMarkers()]);
}

async function toggleCompletion(task: SalesRepTaskType): Promise<void> {
  if (await setCompleted(task.id, task.status !== "completed")) {
    await refreshAll();
  }
}

// A save reports the day it landed on: a task moved to another date would otherwise be refetched into a view
// that no longer contains it, leaving "Task saved" over a list where it is nowhere to be seen. A delete reports
// nothing — there is no row left to go to.
async function onTaskSaved(dayKey?: string): Promise<void> {
  const rescopesList = !!dayKey && (dayKey !== selectedDay.value || filter.value !== undefined);
  const rescopesGrid = !!dayKey && toMonthKey(dayKey) !== month.value;

  if (dayKey) {
    selectDay(dayKey);
    setMonth(dayKey);
  }

  /**
   * Only the surfaces the move did NOT rescope get an explicit refetch. Apollo restarts a query whose variables
   * changed on its own, and its `restart` is deferred to `nextTick` while `refetch()` runs synchronously — so
   * refetching a rescoped query here fires a second, redundant request carrying the pre-move variables.
   * The counts carry no day or month, so they always need one.
   */
  await Promise.all([
    refetchCounts(),
    ...(rescopesList ? [] : [refetch()]),
    ...(rescopesGrid ? [] : [refetchMarkers()]),
  ]);
}

function openTaskModal(task?: SalesRepTaskType): void {
  openModal({
    component: SalesRepTaskModal,
    props: { task, defaultDay: selectedDay.value, onSaved: onTaskSaved },
  });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-calendar {
  &__head {
    @apply flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between;
  }

  &__title {
    @apply [word-break:break-word];
  }

  &__subtitle {
    @apply mt-1 text-sm text-neutral-500 [word-break:break-word];
  }

  &__actions {
    @apply flex flex-none flex-wrap gap-3;
  }

  // The month rail only splits off at xl, matching layout-surface's aside breakpoint.
  &__body {
    @apply mt-5 flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__day {
    @apply min-w-0 grow;
  }

  &__day-head {
    @apply flex items-center justify-between gap-4 px-6 py-4;
  }

  &__day-count {
    @apply mt-0.5 block text-xs text-neutral-500;
  }

  &__aside {
    @apply min-w-0 xl:w-96 xl:shrink-0;
  }

  &__legend {
    @apply m-0 mt-4 flex list-none flex-wrap gap-4 p-0 text-xs text-neutral-500;
  }

  &__legend-item {
    @apply flex items-center gap-1.5;
  }

  &__legend-dot {
    @apply size-1.5 rounded-full;

    &--upcoming {
      background-color: var(--color-info-500);
    }

    &--overdue {
      background-color: var(--color-danger-500);
    }

    // -400, matching the calendar dots: at -500 the green and the blue share a luminance and blur together.
    &--completed {
      background-color: var(--color-success-400);
    }
  }
}
</style>
